<!-- script_gruppo.js – gestione viaggi di gruppo (AGGIORNATO CONSENSI) -->
let invioInCorso = false;

/* =========================
   1) COSTANTI GDPR / TERMINI
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
   2) ENDPOINTS (identici)
   ========================= */
const ENDPOINT_CLIENTI    = "https://yume-clienti.azurewebsites.net/api/invio-yume";
const ENDPOINT_CONSULENZE = "https://yume-consulenze.azurewebsites.net/api/invio-estremi"; // anche per gruppo
const ENDPOINT_NEWSLETTER = "https://yume-sito-form.azurewebsites.net/api/invia-form";     // double opt‑in

/* =========================
   UI / step (identico)
   ========================= */
function mostraStep(numero) {
  console.log("🔁 Passo attivato:", numero);
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
function vaiAlStep0(){ mostraStep(0); }
function vaiAlStep2(){ mostraStep(2); }

function toggleVisibility(idCampo, bottone) {
  const campo = document.getElementById(idCampo);
  if (!campo) return;
  const isPassword = campo.type === "password";
  campo.type = isPassword ? "text" : "password";
  bottone.textContent = isPassword ? "Nascondi password" : "Mostra password";
}

function aggiornaTipoCliente() {
  const tipo = document.getElementById("cliente_tipo")?.value;
  const privato = document.getElementById("sezione_privato");
  const azienda = document.getElementById("sezione_azienda");
  if (!privato || !azienda) return;
  privato.classList.add("hidden");
  azienda.classList.add("hidden");
  if (tipo === "privato") privato.classList.remove("hidden");
  else if (tipo === "azienda") azienda.classList.remove("hidden");
}

/* =========================
   Login / profilo (identico)
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
    const response = await fetch(ENDPOINT_CLIENTI, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identificatore, password_hash, tipoRichiesta: "login" })
    });
    const data = await response.json();

    if (data.status === "success") {
      output.textContent = "Accesso effettuato!";
      output.style.color = "green";
      const profilo = { nome: data.nome || "", cognome: data.cognome || "", email: data.email || "", codice_cliente: data.codice_cliente };
      sessionStorage.setItem("profiloUtente", JSON.stringify(profilo));
      document.getElementById("cliente_tipo").value = "privato";
      aggiornaTipoCliente();
      popolaCampiProfiloInStep2();
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

function popolaCampiProfiloInStep2() {
  const tipo = document.getElementById("cliente_tipo")?.value;
  const profilo = JSON.parse(sessionStorage.getItem("profiloUtente"));
  if (!profilo) return;

  if (tipo === "privato") {
    const campi = { nome: profilo.nome, cognome: profilo.cognome, email: profilo.email, confermaEmail: profilo.email, password: "••••••", confermaPassword: "••••••" };
    for (const [id, valore] of Object.entries(campi)) {
      const el = document.getElementById(id);
      if (el) { el.value = valore; el.readOnly = true; el.classList.add("readonly"); }
    }
  } else if (tipo === "azienda") {
    const campi = { referente_nome: profilo.nome, referente_cognome: profilo.cognome, email_azienda: profilo.email, confermaEmail_azienda: profilo.email, password_azienda: "••••••", confermaPassword_azienda: "••••••" };
    for (const [id, valore] of Object.entries(campi)) {
      const el = document.getElementById(id);
      if (el) { el.value = valore; el.readOnly = true; el.classList.add("readonly"); }
    }
  }
}

async function checkEmailMatchAndRegistrazione() {
  const email = document.getElementById("email")?.value.trim();
  const conferma = document.getElementById("confermaEmail")?.value.trim();
  const msgBox = document.getElementById("emailMatchMessage");
  if (!msgBox) return;

  if (!email || !conferma) { msgBox.innerHTML = ""; msgBox.className = "email-message"; return; }
  if (email !== conferma) {
    msgBox.innerHTML = `<i class="fas fa-times-circle icon-ko"></i> Le email non coincidono`;
    msgBox.className = "email-message ko";
    document.getElementById("email").classList.add("input-ko");
    return;
  }

  const esiste = await verificaEmailEsistente(email);
  if (esiste) {
    msgBox.innerHTML = `<i class="fas fa-times-circle icon-ko"></i> Email già registrata. <a href="log-in.html">Accedi</a>`;
    msgBox.className = "email-message ko";
    document.getElementById("email").classList.add("input-ko");
  } else {
    msgBox.innerHTML = `<i class="fas fa-check-circle icon-ok"></i> Le email coincidono e non risultano già registrate`;
    msgBox.className = "email-message ok";
    document.getElementById("email").classList.remove("input-ko");
  }
}

async function verificaEmailEsistente(email) {
  const profilo = sessionStorage.getItem("profiloUtente");
  if (profilo) {
    const dati = JSON.parse(profilo);
    if (dati.email === email) return false;
  }
  try {
    const response = await fetch(ENDPOINT_CLIENTI, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipoRichiesta: "verifica_email", email })
    });
    const result = await response.json();
    return result.status === "trovata";
  } catch (err) {
    console.error("Errore durante la verifica email:", err);
    return false;
  }
}

/* =========================
   Registrazione opzionale (stesso pattern consulenze) + consensi
   ========================= */
async function verificaERegistrazioneSeNecessario() {
  const tipoCliente = document.getElementById("cliente_tipo")?.value;
  const profilo = sessionStorage.getItem("profiloUtente");
  if (profilo) return;

  // Prendiamo consensi dalla UI gruppo (se presenti)
  const newsletter = document.getElementById("newsletter")?.checked === true;
  const privacyChecked = document.getElementById("privacy")?.checked === true;
  const terminiChecked = document.getElementById("termini")?.checked === true;

  let nome = "", cognome = "", email = "", password = "";
  if (tipoCliente === "privato") {
    nome = document.getElementById("nome")?.value.trim();
    cognome = document.getElementById("cognome")?.value.trim();
    email = document.getElementById("email")?.value.trim();
    password = document.getElementById("password")?.value;
  } else if (tipoCliente === "azienda") {
    nome = document.getElementById("referente_nome")?.value.trim();
    cognome = document.getElementById("referente_cognome")?.value.trim();
    email = document.getElementById("email_azienda")?.value.trim();
    password = document.getElementById("password_azienda")?.value;
  }
  if (!email || !nome || !cognome || !password || !privacyChecked || !terminiChecked) return;

  const emailEsiste = await verificaEmailEsistente(email);
  if (emailEsiste) return;

  const password_hash = await sha256(password);

  try {
    await fetch(ENDPOINT_CLIENTI, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipoRichiesta: "registrazione",
        nome,
        cognome,
        email,
        password_hash,
        newsletter,
        // Consensi versionati
        privacy_accettata: true,
        termini_accettati: true,
        policy_key: CONSENT_CONSTANTS.privacy.key,
        policy_version: CONSENT_CONSTANTS.privacy.version,
        terms_key: CONSENT_CONSTANTS.terms.key,
        terms_version: CONSENT_CONSTANTS.terms.version,
        referrer: document.referrer || null,
        lang: document.documentElement.lang || "it"
      })
    }).then(r=>r.json()).catch(()=>({}));
  } catch (err) {
    console.error("Errore invio registrazione:", err);
  }
}

/* =========================
   Invio gruppo (acconto) — CONSENSI + newsletter DOi
   ========================= */
async function eseguiAcquistoEInvio() {
  mostraSpinner();
  const p1 = verificaERegistrazioneSeNecessario();
  const p2 = inviaRichiestaAcconto();
  await Promise.all([p1, p2]);
  nascondiSpinner();
}

async function inviaRichiestaAcconto() {
  if (invioInCorso) return;
  invioInCorso = true;

  try {
    // Consensi obbligatori
    const privacy = document.getElementById("privacy")?.checked === true;
    const termini = document.getElementById("termini")?.checked === true;
    const newsletter = document.getElementById("newsletter")?.checked === true;
    if (!privacy || !termini) {
      alert("Devi accettare Privacy e Termini per continuare.");
      return;
    }

    const tipoCliente = document.getElementById("cliente_tipo")?.value;
    if (!tipoCliente) { alert("Seleziona una tipologia di cliente."); return; }

    const dati = {
      tipo_funnel: "gruppo",
      ID_ordine: "ORD-" + Date.now(),
      stato_pagamento: "In attesa",

      // Consensi versionati → Azure Proxy → GAS → Supabase (schema crm)
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
      const campi = ["nome","cognome","email","confermaEmail","password","confermaPassword","cf","telefono","via","numero_civico","cap","citta","provincia","stato"];
      for (const id of campi) {
        const v = document.getElementById(id)?.value?.trim();
        if (!v) { alert("Compila tutti i campi obbligatori."); return; }
      }
      const email = document.getElementById("email").value.trim();
      const confermaEmail = document.getElementById("confermaEmail").value.trim();
      const password = document.getElementById("password").value;
      const confermaPassword = document.getElementById("confermaPassword").value;
      if (email !== confermaEmail) { alert("Le email non coincidono."); return; }
      if (password !== confermaPassword) { alert("Le password non coincidono."); return; }

      Object.assign(dati, {
        cliente_tipo: "privato",
        nome: document.getElementById("nome").value,
        cognome: document.getElementById("cognome").value,
        email,
        password_hash: await sha256(password),
        CF: document.getElementById("cf").value,
        telefono: document.getElementById("telefono").value,
        via: document.getElementById("via").value,
        numero_civico: document.getElementById("numero_civico").value,
        cap: document.getElementById("cap").value,
        città: document.getElementById("citta").value,
        provincia: document.getElementById("provincia").value,
        stato: document.getElementById("stato").value,
        nome_viaggio: document.getElementById("nome_viaggio")?.value || "Kokai"
      });

      // Newsletter DOi in parallelo
      if (newsletter && email) {
        fetch(ENDPOINT_NEWSLETTER, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tipoRichiesta: "newsletter",
            email,
            website: "",
            newsletterConsent: true,
            policy_key: CONSENT_CONSTANTS.newsletter.key,
            policy_version: CONSENT_CONSTANTS.newsletter.version,
            gdpr_url: CONSENT_CONSTANTS.newsletter.url,
            referrer: document.referrer || null,
            lang: document.documentElement.lang || "it"
          })
        }).catch(()=>{});
      }

    } else if (tipoCliente === "azienda") {
      const campi = ["ragione_sociale","email_azienda","confermaEmail_azienda","password_azienda","confermaPassword_azienda","piva","cf_azienda","pec","codice_destinatario","referente_nome","referente_cognome","telefono_azienda","via_azienda","numero_civico_azienda","cap_azienda","citta_azienda","provincia_azienda","stato_azienda"];
      for (const id of campi) {
        const v = document.getElementById(id)?.value?.trim();
        if (!v) { alert("Compila tutti i campi obbligatori."); return; }
      }
      const email = document.getElementById("email_azienda").value.trim();
      const confermaEmail = document.getElementById("confermaEmail_azienda").value.trim();
      const password = document.getElementById("password_azienda").value;
      const confermaPassword = document.getElementById("confermaPassword_azienda").value;
      if (email !== confermaEmail) { alert("Le email non coincidono."); return; }
      if (password !== confermaPassword) { alert("Le password non coincidono."); return; }

      Object.assign(dati, {
        cliente_tipo: "azienda",
        ragione_sociale: document.getElementById("ragione_sociale").value,
        email,
        password_hash: await sha256(password),
        PIVA: document.getElementById("piva").value,
        CF: document.getElementById("cf_azienda").value,
        PEC: document.getElementById("pec").value,
        codice_destinatario: document.getElementById("codice_destinatario").value,
        referente_nome: document.getElementById("referente_nome").value,
        referente_cognome: document.getElementById("referente_cognome").value,
        telefono_azienda: document.getElementById("telefono_azienda").value,
        via_azienda: document.getElementById("via_azienda").value,
        numero_civico_azienda: document.getElementById("numero_civico_azienda").value,
        cap_azienda: document.getElementById("cap_azienda").value,
        città_azienda: document.getElementById("citta_azienda").value,
        provincia_azienda: document.getElementById("provincia_azienda").value,
        stato_azienda: document.getElementById("stato_azienda").value,
        nome_viaggio: document.getElementById("nome_viaggio")?.value || "Kokai"
      });

      if (newsletter && email) {
        fetch(ENDPOINT_NEWSLETTER, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tipoRichiesta: "newsletter",
            email,
            website: "",
            newsletterConsent: true,
            policy_key: CONSENT_CONSTANTS.newsletter.key,
            policy_version: CONSENT_CONSTANTS.newsletter.version,
            gdpr_url: CONSENT_CONSTANTS.newsletter.url,
            referrer: document.referrer || null,
            lang: document.documentElement.lang || "it"
          })
        }).catch(()=>{});
      }
    }

    // 🔁 invio a Azure (che aggiunge IP/UA e inoltra a GAS)
    const res = await fetch(ENDPOINT_CONSULENZE, {
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
   UI: riepilogo (identico)
   ========================= */
function mostraRiepilogoFatturazione() {
  const tipoCliente = document.getElementById("cliente_tipo")?.value;
  const riepilogo = document.getElementById("riepilogo");
  if (!riepilogo) return;
  riepilogo.innerHTML = "";

  if (tipoCliente === "privato") {
    riepilogo.innerHTML += `<li><strong>Nome:</strong> ${document.getElementById("nome").value}</li>`;
    riepilogo.innerHTML += `<li><strong>Cognome:</strong> ${document.getElementById("cognome").value}</li>`;
    riepilogo.innerHTML += `<li><strong>Email:</strong> ${document.getElementById("email").value}</li>`;
    riepilogo.innerHTML += `<li><strong>Telefono:</strong> ${document.getElementById("telefono").value}</li>`;
    riepiligo.innerHTML += `<li><strong>Indirizzo:</strong> ${document.getElementById("via").value} ${document.getElementById("numero_civico").value}, ${document.getElementById("cap").value} ${document.getElementById("citta").value} (${document.getElementById("provincia").value}), ${document.getElementById("stato").value}</li>`;
    riepilogo.innerHTML += `<li><strong>Codice Fiscale:</strong> ${document.getElementById("cf").value}</li>`;
  } else if (tipoCliente === "azienda") {
    riepilogo.innerHTML += `<li><strong>Ragione Sociale:</strong> ${document.getElementById("ragione_sociale").value}</li>`;
    riepilogo.innerHTML += `<li><strong>Email:</strong> ${document.getElementById("email_azienda").value}</li>`;
    riepilogo.innerHTML += `<li><strong>Telefono:</strong> ${document.getElementById("telefono_azienda").value}</li>`;
    riepilogo.innerHTML += `<li><strong>Referente:</strong> ${document.getElementById("referente_nome").value} ${document.getElementById("referente_cognome").value}</li>`;
    riepilogo.innerHTML += `<li><strong>Indirizzo:</strong> ${document.getElementById("via_azienda").value} ${document.getElementById("numero_civico_azienda").value}, ${document.getElementById("cap_azienda").value} ${document.getElementById("citta_azienda").value} (${document.getElementById("provincia_azienda").value}), ${document.getElementById("stato_azienda").value}</li>`;
    riepilogo.innerHTML += `<li><strong>Partita IVA:</strong> ${document.getElementById("piva").value}</li>`;
    riepilogo.innerHTML += `<li><strong>Codice Fiscale:</strong> ${document.getElementById("cf_azienda").value}</li>`;
    riepilogo.innerHTML += `<li><strong>PEC:</strong> ${document.getElementById("pec").value}</li>`;
    riepilogo.innerHTML += `<li><strong>Codice SDI:</strong> ${document.getElementById("codice_destinatario").value}</li>`;
  }
  document.getElementById("riepilogo-box")?.classList.remove("hidden");
}

function mostraRiepilogoEFase2() {
  mostraRiepilogoFatturazione();
  document.getElementById("step2-pulsanti-iniziali")?.classList.add("hidden");
  document.getElementById("step2-conferma-pagamento")?.classList.remove("hidden");
}

/* =========================
   Utils (identico)
   ========================= */
async function sha256(str) {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
function mostraSpinner(){ const s=document.getElementById("spinner"); if (s) s.style.display="block"; }
function nascondiSpinner(){ const s=document.getElementById("spinner"); if (s) s.style.display="none"; }

