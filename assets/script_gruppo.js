// script_gruppo.js — gestione viaggi di gruppo (allineato a script_consulenze.js)

let invioInCorso = false;

/* =========================
   CONSENSI (versioning e URL)
   ========================= */
const CONSENT_CONSTANTS = {
  privacy: {
    key: "privacy",
    version: "v1.0-2025-08-19",
    url: "https://yellow-bay-077dd2b03.6.azurestaticapps.net/privacy.html",
  },
  terms: {
    key: "terms",
    version: "v1.0-2025-08-19",
    url: "https://yellow-bay-077dd2b03.6.azurestaticapps.net/termini-condizioni.html",
  },
  newsletter: {
    key: "newsletter",
    version: "v1.0-2025-08-19",
    url: "https://yellow-bay-077dd2b03.6.azurestaticapps.net/privacy.html",
  },
};

/* =========================
   NAVIGAZIONE STEP / UI
   ========================= */
function mostraStep(numero) {
  document.querySelectorAll(".step").forEach(step => {
    step.classList.add("hidden");
    step.classList.remove("active");
  });
  const attuale = document.getElementById("step" + numero);
  if (attuale) {
    attuale.classList.remove("hidden");
    attuale.classList.add("active");
  }
}
function vaiAlStep0() { mostraStep(0); }
function vaiAlStep2() { mostraStep(2); }

function toggleVisibility(idCampo, bottone) {
  const campo = document.getElementById(idCampo);
  if (!campo) return;
  const isPassword = campo.type === "password";
  campo.type = isPassword ? "text" : "password";
  if (bottone) bottone.textContent = isPassword ? "Nascondi password" : "Mostra password";
}

function aggiornaTipoCliente() {
  const tipo = document.getElementById("cliente_tipo")?.value;
  const privato = document.getElementById("sezione_privato");
  const azienda = document.getElementById("sezione_azienda");
  if (!privato || !azienda) return;
  privato.classList.add("hidden");
  azienda.classList.add("hidden");
  if (tipo === "privato")  privato.classList.remove("hidden");
  if (tipo === "azienda")  azienda.classList.remove("hidden");
}

/* =========================
   LOGIN (come consulenze)
   ========================= */
async function effettuaLogin() {
  const identificatore = document.getElementById("emailLogin")?.value.trim();
  const password = document.getElementById("passwordLogin")?.value.trim();
  const output = document.getElementById("esitoLogin");
  output.textContent = "";
  output.style.color = "";

  if (!identificatore || !password) {
    output.textContent = "Inserisci email o codice cliente e password.";
    output.style.color = "red";
    return;
  }

  try {
    const password_hash = await sha256(password);
    const response = await fetch("https://yume-clienti.azurewebsites.net/api/invio-yume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identificatore, password_hash, tipoRichiesta: "login" })
    });
    const data = await response.json();

    if (data.status === "success") {
      output.textContent = "Accesso effettuato!";
      output.style.color = "green";

      // Salva profilo minimo
      sessionStorage.setItem("profiloUtente", JSON.stringify({
        codice_cliente: data.codice_cliente,
        nome: data.nome || "",
        cognome: data.cognome || "",
        email: data.email || ""
      }));

      // Default: privato
      document.getElementById("cliente_tipo").value = "privato";
      aggiornaTipoCliente();
      popolaCampiProfiloInStep2();

      // Vai allo step successivo
      mostraStep(2);
    } else {
      output.textContent = data.message || "Credenziali errate.";
      output.style.color = "red";
    }
  } catch (err) {
    output.textContent = "Errore: " + (err.message || err);
    output.style.color = "red";
  }
}

/* =========================
   PREFILL/LOCK dei campi
   ========================= */
function popolaCampiProfiloInStep2() {
  const tipo = document.getElementById("cliente_tipo")?.value;
  const profilo = JSON.parse(sessionStorage.getItem("profiloUtente"));
  if (!profilo) return;

  if (tipo === "privato") {
    const campi = {
      nome: profilo.nome || "",
      cognome: profilo.cognome || "",
      email: profilo.email || "",
      confermaEmail: profilo.email || "",
      password: "••••••",
      confermaPassword: "••••••"
    };
    for (const [id, valore] of Object.entries(campi)) {
      const el = document.getElementById(id);
      if (el) { el.value = valore; el.readOnly = true; el.classList.add("readonly"); }
    }
  } else if (tipo === "azienda") {
    const campi = {
      referente_nome: profilo.nome || "",
      referente_cognome: profilo.cognome || "",
      email_azienda: profilo.email || "",
      confermaEmail_azienda: profilo.email || "",
      password_azienda: "••••••",
      confermaPassword_azienda: "••••••"
    };
    for (const [id, valore] of Object.entries(campi)) {
      const el = document.getElementById(id);
      if (el) { el.value = valore; el.readOnly = true; el.classList.add("readonly"); }
    }
  }
}

/* =========================
   VALIDAZIONI EMAIL (UI)
   ========================= */
async function checkEmailMatchAndRegistrazione() {
  const email = document.getElementById("email")?.value.trim();
  const conferma = document.getElementById("confermaEmail")?.value.trim();
  const msgBox = document.getElementById("emailMatchMessage");
  if (!msgBox) return;

  if (!email || !conferma) {
    msgBox.innerHTML = "";
    msgBox.className = "email-message";
    return;
  }

  if (email !== conferma) {
    msgBox.innerHTML = `<i class="fas fa-times-circle icon-ko"></i> Le email non coincidono`;
    msgBox.className = "email-message ko";
    document.getElementById("email")?.classList.add("input-ko");
    return;
  }

  const esiste = await verificaEmailEsistente(email);
  if (esiste) {
    msgBox.innerHTML = `<i class="fas fa-times-circle icon-ko"></i> Email già registrata. <a href="log-in.html">Accedi</a>`;
    msgBox.className = "email-message ko";
    document.getElementById("email")?.classList.add("input-ko");
  } else {
    msgBox.innerHTML = `<i class="fas fa-check-circle icon-ok"></i> Le email coincidono e non risultano già registrate`;
    msgBox.className = "email-message ok";
    document.getElementById("email")?.classList.remove("input-ko");
  }
}

/* =========================
   UTILITIES EMAIL / HASH
   ========================= */
async function verificaEmailEsistente(email) {
  // Se già loggato con la stessa email, non è da bloccare
  const profilo = sessionStorage.getItem("profiloUtente");
  if (profilo) {
    const dati = JSON.parse(profilo);
    if (dati.email === email) return false;
  }
  try {
    const res = await fetch("https://yume-clienti.azurewebsites.net/api/invio-yume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipoRichiesta: "verifica_email", email })
    });
    const out = await res.json();
    return out.status === "trovata"; // true se già esiste
  } catch (err) {
    console.error("Errore durante la verifica email:", err);
    return false;
  }
}

async function sha256(str) {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/* =========================
   REGISTRAZIONE AUTOMATICA (come consulenze)
   - Non blocca il flusso: tenta la registrazione SOLO se ho tutti i dati + consensi.
   ========================= */
async function verificaERegistrazioneSeNecessario() {
  // Leggo sempre dai campi "privato" (stessa meccanica usata nelle altre pagine)
  const email = document.getElementById("email")?.value.trim();
  const nome = document.getElementById("nome")?.value.trim();
  const cognome = document.getElementById("cognome")?.value.trim();
  const password = document.getElementById("password")?.value?.trim();
  const newsletter = document.getElementById("newsletter")?.checked === true;
  const privacy = document.getElementById("privacy")?.checked === true;
  const termini = document.getElementById("termini")?.checked === true;

  // Se manca qualcosa o non ha dato i consensi → non provo a registrare (non blocco)
  if (!email || !nome || !cognome || !password || !privacy || !termini) return;

  // Se esiste già, non registro
  const emailEsiste = await verificaEmailEsistente(email);
  if (emailEsiste) return;

  const password_hash = await sha256(password);

  try {
    const response = await fetch("https://yume-clienti.azurewebsites.net/api/invio-yume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipoRichiesta: "registrazione",
        nome,
        cognome,
        email,
        password_hash,
        newsletter,
        privacy_accettata: true,
        termini_accettati: true,
        // Metadati consensi (utile lato GAS → Supabase)
        policy_key: CONSENT_CONSTANTS.privacy.key,
        policy_version: CONSENT_CONSTANTS.privacy.version,
        terms_key: CONSENT_CONSTANTS.terms.key,
        terms_version: CONSENT_CONSTANTS.terms.version,
        newsletter_policy_key: CONSENT_CONSTANTS.newsletter.key,
        newsletter_policy_version: CONSENT_CONSTANTS.newsletter.version,
        referrer: document.referrer || null,
        lang: document.documentElement.lang || "it",
      })
    });
    const result = await response.json();
    if (result?.status !== "success") {
      console.warn("Registrazione non confermata dal server:", result);
    }
  } catch (err) {
    console.error("Errore invio registrazione:", err);
  }
}

/* =========================
   INVIO / PAGAMENTO ACCONTO
   ========================= */
async function inviaRichiestaAcconto() {
  if (invioInCorso) return;
  invioInCorso = true;

  try {
    const tipoCliente = document.getElementById("cliente_tipo")?.value;
    if (!tipoCliente) {
      alert("Seleziona una tipologia di cliente.");
      return;
    }

    // Consensi (OBBLIGATORI per procedere)
    const privacy    = document.getElementById("privacy")?.checked === true;
    const termini    = document.getElementById("termini")?.checked === true;
    const newsletter = document.getElementById("newsletter")?.checked === true;

    if (!privacy || !termini) {
      alert("Devi accettare l’Informativa Privacy e i Termini e Condizioni per proseguire.");
      return;
    }

    // Base payload (come consulenze, ma con funnel 'gruppo')
    const dati = {
      tipo_funnel: "gruppo",
      ID_ordine: "ORD-" + Date.now(),
      stato_pagamento: "In attesa",

      // Metadati consensi → GAS → Supabase
      consensoGDPR: true,
      policy_key: CONSENT_CONSTANTS.privacy.key,
      policy_version: CONSENT_CONSTANTS.privacy.version,
      gdpr_url: CONSENT_CONSTANTS.privacy.url,

      terminiAccettati: true,
      terms_key: CONSENT_CONSTANTS.terms.key,
      terms_version: CONSENT_CONSTANTS.terms.version,
      terms_url: CONSENT_CONSTANTS.terms.url,

      newsletterConsent: !!newsletter,
      newsletter_policy_key: CONSENT_CONSTANTS.newsletter.key,
      newsletter_policy_version: CONSENT_CONSTANTS.newsletter.version,
      newsletter_url: CONSENT_CONSTANTS.newsletter.url,

      referrer: document.referrer || null,
      lang: document.documentElement.lang || "it"
    };

    if (tipoCliente === "privato") {
      // Campi obbligatori
      const campi = [
        "nome","cognome","email","confermaEmail","password","confermaPassword",
        "cf","telefono","via","numero_civico","cap","citta","provincia","stato"
      ];
      for (const id of campi) {
        const v = document.getElementById(id)?.value?.trim();
        if (!v) { alert("Compila tutti i campi obbligatori."); return; }
      }

      const email = document.getElementById("email").value.trim();
      const confermaEmail = document.getElementById("confermaEmail").value.trim();
      const password = document.getElementById("password").value;
      const confermaPassword = document.getElementById("confermaPassword").value;

      // Verifica email duplicata
      const esiste = await verificaEmailEsistente(email);
      if (esiste) { alert("Questa email risulta già registrata. Accedi per proseguire."); return; }

      if (email !== confermaEmail)   { alert("Le email non coincidono."); return; }
      if (password !== confermaPassword) { alert("Le password non coincidono."); return; }

      dati.cliente_tipo = "privato";
      dati.nome = document.getElementById("nome").value;
      dati.cognome = document.getElementById("cognome").value;
      dati.email = email;
      dati.password_hash = await sha256(password);
      dati.CF = document.getElementById("cf").value;
      dati.telefono = document.getElementById("telefono").value;
      dati.via = document.getElementById("via").value;
      dati.numero_civico = document.getElementById("numero_civico").value;
      dati.cap = document.getElementById("cap").value;
      dati.città = document.getElementById("citta").value;
      dati.provincia = document.getElementById("provincia").value;
      dati.stato = document.getElementById("stato").value;
      dati.note = document.getElementById("note")?.value || "";
    } else if (tipoCliente === "azienda") {
      const campi = [
        "ragione_sociale","email_azienda","confermaEmail_azienda","password_azienda","confermaPassword_azienda",
        "piva","cf_azienda","pec","codice_destinatario","referente_nome","referente_cognome",
        "telefono_azienda","via_azienda","numero_civico_azienda","cap_azienda","citta_azienda","provincia_azienda","stato_azienda"
      ];
      for (const id of campi) {
        const v = document.getElementById(id)?.value?.trim();
        if (!v) { alert("Compila tutti i campi obbligatori."); return; }
      }

      const emailA = document.getElementById("email_azienda").value.trim();
      const confermaEmailA = document.getElementById("confermaEmail_azienda").value.trim();
      const pwA = document.getElementById("password_azienda").value;
      const pw2A = document.getElementById("confermaPassword_azienda").value;

      // Verifica email duplicata
      const esisteA = await verificaEmailEsistente(emailA);
      if (esisteA) { alert("Email già registrata. Fai login per continuare."); return; }

      if (emailA !== confermaEmailA) { alert("Le email non coincidono."); return; }
      if (pwA !== pw2A)              { alert("Le password non coincidono."); return; }

      dati.cliente_tipo = "azienda";
      dati.ragione_sociale = document.getElementById("ragione_sociale").value;
      dati.email = emailA;
      dati.password_hash = await sha256(pwA);
      dati.PIVA = document.getElementById("piva").value;
      dati.CF = document.getElementById("cf_azienda").value;
      dati.PEC = document.getElementById("pec").value;
      dati.codice_destinatario = document.getElementById("codice_destinatario").value;
      dati.referente_nome = document.getElementById("referente_nome").value;
      dati.referente_cognome = document.getElementById("referente_cognome").value;
      dati.telefono_azienda = document.getElementById("telefono_azienda").value;
      dati.via_azienda = document.getElementById("via_azienda").value;
      dati.numero_civico_azienda = document.getElementById("numero_civico_azienda").value;
      dati.cap_azienda = document.getElementById("cap_azienda").value;
      dati.città_azienda = document.getElementById("citta_azienda").value;
      dati.provincia_azienda = document.getElementById("provincia_azienda").value;
      dati.stato_azienda = document.getElementById("stato_azienda").value;
      dati.note_azienda = document.getElementById("note_azienda")?.value || "";
    }

    // Invio a GAS (stesso endpoint usato nelle consulenze/prodotti)
    const res = await fetch("https://yume-consulenze.azurewebsites.net/api/invio-estremi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dati)
    });
    const json = await res.json();

    if (json.status === "ok" && json.checkout_url) {
      window.location.href = json.checkout_url;
    } else {
      throw new Error(json.message || "Errore durante la generazione del pagamento.");
    }
  } catch (err) {
    alert("❌ Errore: " + err.message);
  } finally {
    invioInCorso = false;
  }
}

/* =========================
   WRAPPER (stessa meccanica: registrazione + invio)
   ========================= */
async function eseguiAcquistoEInvio() {
  mostraSpinner();
  try {
    // In parallelo, come in script_consulenze.js
    await Promise.all([
      verificaERegistrazioneSeNecessario(),
      inviaRichiestaAcconto()
    ]);
  } finally {
    nascondiSpinner();
  }
}

/* =========================
   SPINNER
   ========================= */
function mostraSpinner() {
  document.getElementById("spinnerInvio")?.classList.remove("hidden");
}
function nascondiSpinner() {
  document.getElementById("spinnerInvio")?.classList.add("hidden");
}

