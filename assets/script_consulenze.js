let invioInCorso = false;

/* =========================
   CONSENSI / VERSIONING
   (aggiunta: gestione privacy, termini e newsletter)
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

const ENDPOINT_NEWSLETTER  = "https://yume-sito-form.azurewebsites.net/api/invia-form"; // double opt-in

function mostraStep(numero) {
  document.querySelectorAll(".step").forEach(step => {
    step.classList.add("hidden");
  });
  document.getElementById("step" + numero)?.classList.remove("hidden");
}

function vaiAlStep0() {
 mostraStep(0);
}

function vaiAlStep1() {
  mostraStep(1);
}

function vaiAlStep2() {
  const categoria = document.getElementById("categoria_servizio")?.value;
  const calendario = document.getElementById("data_calendario")?.value;

  if (!categoria) {
    alert("Seleziona una categoria di consulenza (Tematica o Atelier).");
    return;
  }

  let tipoServizio = "";
  if (categoria === "tematica") {
    tipoServizio = document.getElementById("tipo_servizio_tematica")?.value;
  } else if (categoria === "experience") {
    tipoServizio = document.getElementById("tipo_servizio_experience")?.value;
  }

  if (!tipoServizio) {
    alert("Seleziona il tipo specifico di consulenza desiderato.");
    return;
  }

  if (!calendario) {
    alert("Seleziona una data nel calendario.");
    return;
  }

  // Se tutto è valido, passa allo step 2
  mostraStep(2);

  // Qui chiami popola i campi con i dati salvati
  popolaCampiProfiloInStep2();
}

async function vaiAlStep3Prenota() {
  const riepilogo = document.getElementById("riepilogo");
  if (!riepilogo) return;

  const nome = document.getElementById("nome")?.value.trim();
  const cognome = document.getElementById("cognome")?.value.trim();
  const email = document.getElementById("email")?.value.trim();
  const esiste = await verificaEmailEsistente(email);
  if (esiste) {
    alert("Questa email risulta già registrata. Fai login per proseguire.");
    return;
  }

  const confermaEmail = document.getElementById("confermaEmail")?.value.trim();
  const password = document.getElementById("password")?.value;
  const confermaPassword = document.getElementById("confermaPassword")?.value;
  const cf = document.getElementById("cf")?.value;
  const note = document.getElementById("note")?.value;

  // ✅ Consensi obbligatori (privacy + termini)
  const privacy = document.getElementById("privacy")?.checked === true;
  const termini = document.getElementById("termini")?.checked === true;
  if (!privacy || !termini) return alert("Devi accettare Privacy e Termini per continuare.");

  // Validazioni obbligatorie
  if (!nome) return alert("Il campo Nome è obbligatorio.");
  if (!cognome) return alert("Il campo Cognome è obbligatorio.");
  if (!email || !confermaEmail) return alert("Entrambi i campi Email sono obbligatori.");
  if (email !== confermaEmail) return alert("Le email non coincidono.");
  if (!password || !confermaPassword) return alert("Entrambi i campi Password sono obbligatori.");
  if (password !== confermaPassword) return alert("Le password non coincidono.");

  // Riepilogo
  riepilogo.innerHTML = "";
  riepilogo.innerHTML += `<li><strong>Nome:</strong> ${nome}</li>`;
  riepilogo.innerHTML += `<li><strong>Cognome:</strong> ${cognome}</li>`;
  riepilogo.innerHTML += `<li><strong>Email:</strong> ${email}</li>`;
  if (cf) {
    riepilogo.innerHTML += `<li><strong>Codice Fiscale:</strong> ${cf}</li>`;
  } else {
    riepilogo.innerHTML += `<li><strong>Codice Fiscale:</strong> <em>non fornito</em> <span title="Se in futuro deciderai di acquistare una consulenza, il CF velocizzerà la procedura di fatturazione.">ℹ️</span></li>`;
  }
  if (note) riepilogo.innerHTML += `<li><strong>Note:</strong> ${note}</li>`;

  // Passaggio allo step 3
  document.querySelectorAll(".step").forEach(s => s.classList.add("hidden"));
  document.getElementById("step3")?.classList.remove("hidden");
}

async function vaiAlStep3() {
  const tipoCliente = document.getElementById("cliente_tipo")?.value || "";
  const riepilogo = document.getElementById("riepilogo");
  if (!riepilogo) return;

  // Verifica selezione cliente
  if (!tipoCliente) {
    alert("Seleziona una tipologia di cliente per proseguire.");
    return;
  }

  // ✅ Consensi obbligatori (privacy + termini)
  const privacy = document.getElementById("privacy")?.checked === true;
  const termini = document.getElementById("termini")?.checked === true;
  if (!privacy || !termini) return alert("Devi accettare Privacy e Termini per continuare.");

  riepilogo.innerHTML = "";

  // === PRIVATO ===
  if (tipoCliente === "privato") {
    const email = document.getElementById("email")?.value.trim();
    const esiste = await verificaEmailEsistente(email);
    if (esiste) {
     alert("Questa email risulta già registrata. Fai login per proseguire.");
     return;
   }

    const email2 = document.getElementById("confermaEmail")?.value.trim();
    const password = document.getElementById("password")?.value;
    const password2 = document.getElementById("confermaPassword")?.value;

    if (email !== email2) {
      alert("Le email non coincidono.");
      return;
    }

    if (password !== password2) {
      alert("Le password non coincidono.");
      return;
    }

    const campiPrivatoObbligatori = [
      "nome", "cognome", "email", "confermaEmail", "password", "confermaPassword",
      "cf", "telefono", "via", "cap", "citta", "provincia", "stato"
    ];

    for (let id of campiPrivatoObbligatori) {
      const val = document.getElementById(id)?.value.trim();
      if (!val) {
        alert("Compila tutti i campi obbligatori.");
        return;
      }
    }

    // Riepilogo PRIVATO
    riepilogo.innerHTML += `<li><strong>Tipo cliente:</strong> Privato</li>`;
    riepilogo.innerHTML += `<li><strong>Nome:</strong> ${document.getElementById("nome").value}</li>`;
    riepilogo.innerHTML += `<li><strong>Cognome:</strong> ${document.getElementById("cognome").value}</li>`;
    riepilogo.innerHTML += `<li><strong>Email:</strong> ${email}</li>`;
    riepilogo.innerHTML += `<li><strong>Codice Fiscale:</strong> ${document.getElementById("cf").value}</li>`;
    riepilogo.innerHTML += `<li><strong>Telefono:</strong> ${document.getElementById("telefono").value}</li>`;
    riepilogo.innerHTML += `<li><strong>Via:</strong> ${document.getElementById("via").value}</li>`;
    riepilogo.innerHTML += `<li><strong>CAP:</strong> ${document.getElementById("cap").value}</li>`;
    riepilogo.innerHTML += `<li><strong>Città:</strong> ${document.getElementById("citta").value}</li>`;
    riepilogo.innerHTML += `<li><strong>Provincia:</strong> ${document.getElementById("provincia").value}</li>`;
    riepilogo.innerHTML += `<li><strong>Stato:</strong> ${document.getElementById("stato").value}</li>`;
    riepilogo.innerHTML += `<li><strong>Note:</strong> ${document.getElementById("note").value}</li>`;
  }

  // === AZIENDA ===
  else if (tipoCliente === "azienda") {
    const email = document.getElementById("email_azienda")?.value.trim();
    const email2 = document.getElementById("confermaEmail_azienda")?.value.trim();
    const password = document.getElementById("password_azienda")?.value;
    const password2 = document.getElementById("confermaPassword_azienda")?.value;

    if (email !== email2) {
      alert("Le email non coincidono.");
      return;
    }

    if (password !== password2) {
      alert("Le password non coincidono.");
      return;
    }

      // ✅ Verifica email già registrata
const msgBox = document.getElementById("emailMatchMessageAzienda");
if (!msgBox) return;

const emailGiaUsata = await verificaEmailEsistente(email);
if (emailGiaUsata) {
  msgBox.innerHTML = `<i class="fas fa-times-circle icon-ko"></i> Email già registrata. <a href="log-in.html">Accedi</a>`;
  msgBox.className = "email-message ko";
  document.getElementById("email_azienda").classList.add("input-ko");
  alert("Email già registrata. Fai login per continuare.");
  return;
}

    const campiAziendaObbligatori = [
      "ragione_sociale", "email_azienda", "confermaEmail_azienda",
      "password_azienda", "confermaPassword_azienda", "piva", "cf_azienda",
      "pec", "codice_destinatario", "referente_nome", "referente_cognome",
      "telefono_azienda", "via_azienda", "cap_azienda", "citta_azienda", "provincia_azienda", "stato_azienda"
    ];

    for (let id of campiAziendaObbligatori) {
      const val = document.getElementById(id)?.value.trim();
      if (!val) {
        alert("Compila tutti i campi obbligatori.");
        return;
      }
    }

    // Riepilogo AZIENDA
    riepilogo.innerHTML += `<li><strong>Tipo cliente:</strong> Azienda</li>`;
    riepilogo.innerHTML += `<li><strong>Ragione Sociale:</strong> ${document.getElementById("ragione_sociale").value}</li>`;
    riepilogo.innerHTML += `<li><strong>Email:</strong> ${email}</li>`;
    riepilogo.innerHTML += `<li><strong>Partita IVA:</strong> ${document.getElementById("piva").value}</li>`;
    riepilogo.innerHTML += `<li><strong>Codice Fiscale:</strong> ${document.getElementById("cf_azienda").value}</li>`;
    riepilogo.innerHTML += `<li><strong>PEC:</strong> ${document.getElementById("pec").value}</li>`;
    riepilogo.innerHTML += `<li><strong>Codice SDI:</strong> ${document.getElementById("codice_destinatario").value}</li>`;
    riepilogo.innerHTML += `<li><strong>Referente:</strong> ${document.getElementById("referente_nome").value} ${document.getElementById("referente_cognome").value}</li>`;
    riepilogo.innerHTML += `<li><strong>Telefono:</strong> ${document.getElementById("telefono_azienda").value}</li>`;
    riepilogo.innerHTML += `<li><strong>Via:</strong> ${document.getElementById("via_azienda").value}</li>`;
    riepilogo.innerHTML += `<li><strong>CAP:</strong> ${document.getElementById("cap_azienda").value}</li>`;
    riepilogo.innerHTML += `<li><strong>Città:</strong> ${document.getElementById("citta_azienda").value}</li>`;
    riepilogo.innerHTML += `<li><strong>Provincia:</strong> ${document.getElementById("provincia_azienda").value}</li>`;
    riepilogo.innerHTML += `<li><strong>Stato:</strong> ${document.getElementById("stato_azienda").value}</li>`;
    riepilogo.innerHTML += `<li><strong>Note:</strong> ${document.getElementById("note_azienda").value}</li>`;
  }

  // Mostra step 3
  document.querySelectorAll(".step").forEach(s => s.classList.add("hidden"));
  document.getElementById("step3")?.classList.remove("hidden");
}


function aggiornaTipoCliente() {
  const tipo = document.getElementById("cliente_tipo").value;
  const privato = document.getElementById("sezione_privato");
  const azienda = document.getElementById("sezione_azienda");

  if (!privato || !azienda) return;

  privato.classList.add("hidden");
  azienda.classList.add("hidden");

  if (tipo === "privato") {
    privato.classList.remove("hidden");
  } else if (tipo === "azienda") {
    azienda.classList.remove("hidden");
  }
}


function mostraCampiAzienda() {
  const tipo = document.getElementById("cliente_tipo").value;
  document.getElementById("campi_azienda").classList.toggle("hidden", tipo !== "azienda");
}

async function inviaRichiestaConsulenza() {
  if (invioInCorso) return;
  invioInCorso = true;

  try {
    // ✅ Consensi obbligatori (privacy + termini)
    const privacy = document.getElementById("privacy")?.checked === true;
    const termini = document.getElementById("termini")?.checked === true;
    const newsletter = document.getElementById("newsletter")?.checked === true;
    if (!privacy || !termini) throw new Error("Devi accettare Privacy e Termini per continuare.");

    const tipoFunnel = "caldo";
    const tipoCliente = document.getElementById("cliente_tipo").value;
    const categoriaServizio = document.getElementById("categoria_servizio").value;
    const calendario = document.getElementById("data_calendario").value;
    const idOrdine = "ORD-" + Date.now();
    const statoPagamento = "In attesa";

    let tipo_servizio = "";
    if (categoriaServizio === "tematica") {
      tipo_servizio = document.getElementById("tipo_servizio_tematica").value;
    } else {
      tipo_servizio = document.getElementById("tipo_servizio_experience").value;
    }

    const dati = {
      // ——— dati originali ———
      tipo_funnel: tipoFunnel,
      cliente_tipo: tipoCliente,
      tipo_servizio,
      calendario,
      stato_pagamento: statoPagamento,
      ID_ordine: idOrdine,
      // ——— consensi aggiunti ———
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
      dati.nome = document.getElementById("nome").value;
      dati.cognome = document.getElementById("cognome").value;
      dati.email = document.getElementById("email").value;
      dati.password_hash = await sha256(document.getElementById("password").value);
      dati.CF = document.getElementById("cf").value;
      dati.telefono = document.getElementById("telefono").value;
      dati.via = document.getElementById("via").value;
      dati.numero_civico = document.getElementById("numero_civico").value;
      dati.cap = document.getElementById("cap").value;
      dati.città = document.getElementById("citta").value;
      dati.provincia = document.getElementById("provincia").value;
      dati.stato = document.getElementById("stato").value;
      dati.note = document.getElementById("note").value;
    } else if (tipoCliente === "azienda") {
      dati.ragione_sociale = document.getElementById("ragione_sociale").value;
      dati.email = document.getElementById("email_azienda").value;
      dati.password_hash = await sha256(document.getElementById("password_azienda").value);
      dati.PIVA = document.getElementById("piva").value;
      dati.CF = document.getElementById("cf_azienda").value;
      dati.referente_nome = document.getElementById("referente_nome").value;
      dati.referente_cognome = document.getElementById("referente_cognome").value;
      dati.telefono_azienda = document.getElementById("telefono_azienda").value;
      dati.via_azienda = document.getElementById("via_azienda").value;
      dati.numero_civico_azienda = document.getElementById("numero_civico_azienda").value;
      dati.cap_azienda = document.getElementById("cap_azienda").value;
      dati.città_azienda = document.getElementById("citta_azienda").value;
      dati.provincia_azienda = document.getElementById("provincia_azienda").value;
      dati.stato_azienda = document.getElementById("stato_azienda").value;
      dati.PEC = document.getElementById("pec").value;
      dati.codice_destinatario = document.getElementById("codice_destinatario").value;
      dati.note_azienda = document.getElementById("note_azienda").value;
    }

    // 🔔 Newsletter double opt‑in parallelo (solo se spuntata)
    if (newsletter && dati.email) {
      fetch(ENDPOINT_NEWSLETTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoRichiesta: "newsletter",
          email: dati.email,
          website: "",
          newsletterConsent: true,
          policy_key: CONSENT_CONSTANTS.newsletter.key,
          policy_version: CONSENT_CONSTANTS.newsletter.version,
          gdpr_url: CONSENT_CONSTANTS.newsletter.url,
          referrer: document.referrer || null,
          lang: document.documentElement.lang || "it"
        })
      }).catch(() => {});
    }

    const response = await fetch("https://yume-consulenze.azurewebsites.net/api/invio-estremi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dati)
    });

    const result = await response.json();

    if (result.status === "ok" && result.checkout_url) {
      window.location.href = result.checkout_url;
    } else {
      throw new Error(result.message || "Impossibile avviare il pagamento.");
    }

  } catch (err) {
    alert("Errore durante l'invio: " + err.message);
  } finally {
    invioInCorso = false;
  }
}


function aggiornaTipoServizio() {
  const categoria = document.getElementById("categoria_servizio")?.value;
  const sezioneTematica = document.getElementById("sezione_tematica");
  const sezioneExperience = document.getElementById("sezione_experience");

  if (!categoria || !sezioneTematica || !sezioneExperience) return;

  sezioneTematica.classList.add("hidden");
  sezioneExperience.classList.add("hidden");

  if (categoria === "tematica") {
    sezioneTematica.classList.remove("hidden");
  } else if (categoria === "experience") {
    sezioneExperience.classList.remove("hidden");
  }
}

async function checkEmailMatchAzienda() {
  const email = document.getElementById("email_azienda")?.value || "";
  const conferma = document.getElementById("confermaEmail_azienda")?.value || "";
  const msg = document.getElementById("emailMatchMessageAzienda");

  if (!msg) return;
  if (!conferma) {
    msg.innerHTML = "";
    msg.className = "email-message";
    return;
  }

  if (email !== conferma) {
    msg.innerHTML = `<i class="fas fa-times-circle icon-ko"></i> Le email non coincidono`;
    msg.className = "email-message ko";
    document.getElementById("email_azienda").classList.add("input-ko");
    return;
  }

  // ✅ Se coincidono, controlla se già registrata
  const esiste = await verificaEmailEsistente(email);
  if (esiste) {
    msg.innerHTML = `<i class="fas fa-times-circle icon-ko"></i> Email già registrata. <a href="log-in.html">Accedi</a>`;
    msg.className = "email-message ko";
    document.getElementById("email_azienda").classList.add("input-ko");
  } else {
    msg.innerHTML = `<i class="fas fa-check-circle icon-ok"></i> Le email coincidono e non risultano già registrate`;
    msg.className = "email-message ok";
    document.getElementById("email_azienda").classList.remove("input-ko");
  }
}

function checkPasswordMatchAzienda() {
  const pw = document.getElementById("password_azienda")?.value || "";
  const conferma = document.getElementById("confermaPassword_azienda")?.value || "";
  const msg = document.getElementById("passwordMatchMessageAzienda");

  if (!msg) return;
  if (!conferma) return msg.innerHTML = "";

  if (pw === conferma) {
    msg.innerHTML = `<i class="fas fa-check-circle icon-ok"></i> Le password coincidono`;
    msg.className = "password-message ok";
  } else {
    msg.innerHTML = `<i class="fas fa-times-circle icon-ko"></i> Le password non coincidono`;
    msg.className = "password-message ko";
  }
}

async function sha256(str) {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function confermaPrenotazione() {
  if (invioInCorso) return;
  invioInCorso = true;

  try {
    // ✅ Consensi obbligatori (privacy + termini)
    const privacy = document.getElementById("privacy")?.checked === true;
    const termini = document.getElementById("termini")?.checked === true;
    const newsletter = document.getElementById("newsletter")?.checked === true;
    if (!privacy || !termini) throw new Error("Devi accettare Privacy e Termini per continuare.");

    const email = document.getElementById("email").value;

    const dati = {
      tipo_funnel: "freddo",
      data: new Date().toISOString(),
      nome: document.getElementById("nome").value,
      cognome: document.getElementById("cognome").value,
      email: email,
      password_hash: await sha256(document.getElementById("password").value),
      CF: document.getElementById("cf").value,
      tipo_servizio:
        document.getElementById("tipo_servizio_tematica")?.value ||
        document.getElementById("tipo_servizio_experience")?.value ||
        document.getElementById("tipo_servizio")?.value ||
        "",
      calendario: document.getElementById("data_calendario").value,
      note: document.getElementById("note")?.value || "",

      // ——— CONSENSI INCLUSI ———
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

    // 🔔 Newsletter double opt‑in parallelo
    if (newsletter && email) {
      fetch(ENDPOINT_NEWSLETTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoRichiesta: "newsletter",
          email: email,
          website: "",
          newsletterConsent: true,
          policy_key: CONSENT_CONSTANTS.newsletter.key,
          policy_version: CONSENT_CONSTANTS.newsletter.version,
          gdpr_url: CONSENT_CONSTANTS.newsletter.url,
          referrer: document.referrer || null,
          lang: document.documentElement.lang || "it"
        })
      }).catch(() => {});
    }

    const response = await fetch("https://yume-consulenze.azurewebsites.net/api/invio-estremi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dati)
    });

    const result = await response.json();

    if (result.status === "ok") {
      // ✅ Redirect alla pagina di conferma
      window.location.href = "successo-prenotazione.html";
    } else {
      throw new Error(result.message || "Errore nella registrazione.");
    }

  } catch (err) {
    alert("❌ Errore: " + err.message);
  } finally {
    invioInCorso = false;
  }
}

async function verificaEmailEsistente(email) {
  // ✅ Se il cliente è loggato, salta la verifica
  const profilo = sessionStorage.getItem("profiloUtente");
  if (profilo) {
    const dati = JSON.parse(profilo);
    if (dati.email === email) return false;
  }

  try {
    const response = await fetch("https://yume-clienti.azurewebsites.net/api/invio-yume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipoRichiesta: "verifica_email", // (coerente con backend originale)
        email
      })
    });

    const result = await response.json();
    return result.status === "trovata"; // true se già esiste
  } catch (err) {
    console.error("Errore durante la verifica email:", err);
    return false;
  }
}

async function checkEmailRegistrata() {
  const email = document.getElementById("email")?.value.trim();
  const msgBox = document.getElementById("emailMatchMessage");

  if (!email || !msgBox) return;

  const esiste = await verificaEmailEsistente(email);

  if (esiste) {
    msgBox.innerHTML = `<i class="fas fa-times-circle icon-ko"></i> Email già registrata. <a href="log-in.html">Accedi</a> per proseguire.`;
    msgBox.className = "email-message ko";
    document.getElementById("email").classList.add("input-ko");
  } else {
    msgBox.innerHTML = `<i class="fas fa-check-circle icon-ok"></i> Email valida`;
    msgBox.className = "email-message ok";
    document.getElementById("email").classList.remove("input-ko");
  }
}

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
      body: JSON.stringify({
        identificatore,
        password_hash,
        tipoRichiesta: "login"
      })
    });

    const data = await response.json();

    if (data.status === "success") {
      output.textContent = "Accesso effettuato!";
      output.style.color = "green";

      // Prendi i dati direttamente da data (non da data.profilo)
      const cliente = {
        nome: data.nome || "",
        cognome: data.cognome || "",
        email: data.email || ""
      };

      // Salva profilo in sessionStorage       
  sessionStorage.setItem("profiloUtente", JSON.stringify({
    status: "success",
    codice_cliente: data.codice_cliente,
    nome: cliente.nome,
    cognome: cliente.cognome,
    email: cliente.email
  }));

      // Imposta tipo cliente a "privato" di default (modifica se serve)
      document.getElementById("cliente_tipo").value = "privato";
      aggiornaTipoCliente();

      // Popola e blocca i campi
      ["nome", "cognome", "email", "confermaEmail", "password", "confermaPassword"].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          if (id === "password" || id === "confermaPassword") {
            el.value = "********";
          } else {
            el.value = cliente[id] || "";
          }
          el.setAttribute("readonly", "true");
          el.classList.add("readonly");
        }
      });

      // Mostra step 1 (scelta consulenza)
      mostraStep(1);

    } else {
      output.textContent = data.message || "Credenziali errate.";
      output.style.color = "red";
    }

  } catch (err) {
    output.textContent = "Errore: " + (err.message || err);
    output.style.color = "red";
  }
}

async function effettuaLoginPrenota() {
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
      body: JSON.stringify({
        identificatore,
        password_hash,
        tipoRichiesta: "login"
      })
    });

    const data = await response.json();

    if (data.status === "success") {
      output.textContent = "Accesso effettuato!";
      output.style.color = "green";

const cliente = {
  nome: data.nome || "",
  cognome: data.cognome || "",
  email: data.email || ""
};

      // Salva profilo in sessionStorage
 sessionStorage.setItem("profiloUtente", JSON.stringify({
  status: "success",
  codice_cliente: data.codice_cliente,
  nome: cliente.nome || "",
  cognome: cliente.cognome || "",
  email: cliente.email || ""
}));

      // Popola i campi specifici di prenota-consulenza
      ["nome", "cognome", "email"].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          const key = id.replace("_prenota", "");
          el.value = cliente[key] || "";
          el.setAttribute("readonly", "true");
          el.classList.add("readonly");
        }
      });

      // Passa allo step 1 (scegli consulenza o successivo step che hai)
      mostraStep(1);

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
    document.getElementById("nome").value = profilo.nome || "";
    document.getElementById("cognome").value = profilo.cognome || "";
    document.getElementById("email").value = profilo.email || "";
    document.getElementById("password").value = "••••••";
    document.getElementById("confermaEmail").value = profilo.email || "";
    document.getElementById("confermaPassword").value = "••••••";

    // Blocca i campi modificabili
    document.getElementById("nome").readOnly = true;
    document.getElementById("cognome").readOnly = true;
    document.getElementById("email").readOnly = true;
    document.getElementById("password").readOnly = true;
    document.getElementById("confermaEmail").readOnly = true;
    document.getElementById("confermaPassword").readOnly = true;
  } else if (tipo === "azienda") {
    document.getElementById("referente_nome").value = profilo.nome || "";
    document.getElementById("referente_cognome").value = profilo.cognome || "";
    document.getElementById("email_azienda").value = profilo.email || "";
    document.getElementById("password_azienda").value = "••••••";
    document.getElementById("confermaEmail_azienda").value = profilo.email || "";
    document.getElementById("confermaPassword_azienda").value = "••••••";

    // Blocca i campi modificabili
    document.getElementById("referente_nome").readOnly = true;
    document.getElementById("referente_cognome").readOnly = true;
    document.getElementById("email_azienda").readOnly = true;
    document.getElementById("password_azienda").readOnly = true;
    document.getElementById("confermaEmail_azienda").readOnly = true;
    document.getElementById("confermaPassword_azienda").readOnly = true;

  } else {
    // Caso default (nessun tipo o tipo non riconosciuto)
    const campi = ["nome", "cognome", "email", "confermaEmail", "password", "confermaPassword"];
    campi.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;

      if (id === "password" || id === "confermaPassword") {
        el.value = "••••••";
      } else if (id === "confermaEmail") {
        el.value = profilo.email || "";
      } else {
        el.value = profilo[id] || "";
      }

      el.readOnly = true;
      el.classList.add("readonly");
    });
  }
}

async function verificaERegistrazioneSeNecessario() {
  const email = document.getElementById("email")?.value.trim();
  const nome = document.getElementById("nome")?.value.trim();
  const cognome = document.getElementById("cognome")?.value.trim();
  const password = document.getElementById("password")?.value.trim();
  const newsletter = document.getElementById("newsletter")?.checked;
  const privacy = document.getElementById("privacy")?.checked;
  const termini = document.getElementById("termini")?.checked;

  if (!email || !nome || !cognome || !password || !privacy || !termini) {
    console.log("Dati insufficienti per registrazione.");
    return;
  }

  const emailEsiste = await verificaEmailEsistente(email);
  if (emailEsiste) {
    console.log("Email già registrata, nessuna registrazione necessaria.");
    return;
  }

  const password_hash = await sha256(password);

  // Invia registrazione al CRM (con consensi/versioni)
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
        newsletter: !!newsletter,
        privacy_accettata: true,
        termini_accettati: true,
        policy_key: CONSENT_CONSTANTS.privacy.key,
        policy_version: CONSENT_CONSTANTS.privacy.version,
        terms_key: CONSENT_CONSTANTS.terms.key,
        terms_version: CONSENT_CONSTANTS.terms.version,
        referrer: document.referrer || null,
        lang: document.documentElement.lang || "it"
      })
    });

    const result = await response.json();
    if (result.status === "success") {
      console.log("Registrazione cliente completata.");
    } else {
      console.warn("Errore registrazione:", result.message);
    }
  } catch (err) {
    console.error("Errore invio registrazione:", err);
  }
}

async function eseguiRegistrazioneEInvio() {
  mostraSpinner();

  const promessaRegistrazione = verificaERegistrazioneSeNecessario();
  const promessaPrenotazione = confermaPrenotazione();

  // Aspetta entrambe in parallelo (non sequenziale)
  await Promise.all([promessaRegistrazione, promessaPrenotazione]);

  nascondiSpinner();
}

async function eseguiAcquistoEInvio() {
  mostraSpinner();

  const promessaRegistrazione = verificaERegistrazioneSeNecessario();
  const promessaInvio = inviaRichiestaConsulenza();

  await Promise.all([promessaRegistrazione, promessaInvio]);

  nascondiSpinner();
}

async function compilaIndirizzoConAutocomplete(input) {
  if (!input || input.length < 4) return;

  try {
    const res = await fetch("https://yume-consulenze.azurewebsites.net/api/invio-estremi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipoRichiesta: "autocomplete_indirizzo",
        input
      })
    });

    const { status, indirizzo } = await res.json();
    if (status !== "ok") return;

    document.getElementById("via").value = indirizzo.via || "";
    document.getElementById("numero_civico").value = indirizzo.numero || "";
    document.getElementById("cap").value = indirizzo.cap || "";
    document.getElementById("citta").value = indirizzo.citta || "";
    document.getElementById("provincia").value = indirizzo.provincia || "";
    document.getElementById("stato").value = indirizzo.stato || "";

  } catch (err) {
    console.error("Errore autocomplete:", err);
  }
}

let timeoutAutocomplete;
function avviaSuggerimentoIndirizzo(valore) {
  clearTimeout(timeoutAutocomplete);
  timeoutAutocomplete = setTimeout(() => {
    compilaIndirizzoConAutocomplete(valore);
  }, 700); // debounce automatico dopo 700ms
}

/* =========================
   CALENDARIO ORIGINALE (immutato)
   ========================= */
const endpointAzure = "https://yume-consulenze.azurewebsites.net/api/get-slots";
let calendar;
let eventoSelezionato = null;
let calendarioAcquisti;

function getDurataSlot() {
  const url = window.location.pathname;
  if (url.includes("prenota-consulenza.html")) return 20;

  const sezioneTematicaVisibile = !document.getElementById("sezione_tematica")?.classList.contains("hidden");
  const sezioneExperienceVisibile = !document.getElementById("sezione_experience")?.classList.contains("hidden");

  let tipoSelezionato = "";

  if (sezioneTematicaVisibile) {
    tipoSelezionato = document.getElementById("tipo_servizio_tematica")?.value?.trim();
  } else if (sezioneExperienceVisibile) {
    tipoSelezionato = document.getElementById("tipo_servizio_experience")?.value?.trim();
  }

  const mappaDurate = {
    "Consulenza Yume Lite": 75,
    "Consulenza Yume Smart": 195,
    "Consulenza Yume Premium": 315,
    "Consulenza Yume Experience Singolo": 195,
    "Consulenza Yume Experience Coppia": 195,
    "Consulenza Yume Experience Famiglia": 195,
    "Consulenza Yume Experience Mini Gruppo": 195,
    "Consulenza Yume Experience Yume Atelier": 30,
  };

  const durata = mappaDurate[tipoSelezionato] || 75;
  console.log("🧠 Durata slot attuale:", durata, "minuti");
  return durata;
}

function formatSlotDuration(durata) {
  const ore = Math.floor(durata / 60).toString().padStart(2, "0");
  const minuti = (durata % 60).toString().padStart(2, "0");
  return `${ore}:${minuti}:00";
}

function aggiornaCalendarioConDurata() {
  const durata = getDurataSlot();
  const durataFormatted = formatSlotDuration(durata);
  console.log("🔁 SlotDuration aggiornata dinamicamente:", durataFormatted);

  if (calendarioAcquisti) {
    calendarioAcquisti.setOption("slotDuration", durataFormatted);
    calendarioAcquisti.getEvents().forEach(e => e.remove());
    calendarioAcquisti.refetchEvents();
  }
}

function inizializzaCalendario(cal, tipoFunnel) {
  const campoData = document.getElementById("data_calendario");
  const durata = getDurataSlot();
  const isAcquisto = tipoFunnel === "caldo";

  cal = new FullCalendar.Calendar(cal, {
    initialView: "dayGridMonth",
    height: 500,
    locale: "it",
    firstDay: 1,
    selectable: true,
    expandRows: true,
    allDaySlot: false,
    slotMinTime: "09:00:00",
    slotMaxTime: "20:00:00",
    slotDuration: formatSlotDuration(durata),
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridDay"
    },
    views: {
      timeGridDay: {
        type: "timeGrid",
        duration: { days: 1 },
        buttonText: "Giorno"
      }
    },
    dateClick(info) {
      cal.changeView("timeGridDay", info.dateStr);
      setTimeout(() => cal.refetchEvents(), 100);
    },

eventClick(info) {
  if (!info.event.extendedProps.clickableSlot) return;

  const start = info.event.start;
  const end = info.event.end;
  const startISO = start.toISOString();

  // ✅ Se clicchi sullo stesso slot già selezionato → deseleziona
  if (eventoSelezionato && eventoSelezionato.start.toISOString() === startISO) {
    eventoSelezionato.remove();
    eventoSelezionato = null;
    campoData.value = "";
    console.log("🗑️ Slot deselezionato:", startISO);
    return;
  }

  // 🔁 Altrimenti seleziona il nuovo
  eventoSelezionato?.remove();

  eventoSelezionato = cal.addEvent({
    title: `${start.toTimeString().slice(0, 5)} – selezionato`,
    start,
    end,
    display: "block",
    classNames: ["yume-scelta"],
    editable: false,
    extendedProps: { clickableSlot: true }
  });

  const localISO = new Date(start.getTime() - start.getTimezoneOffset() * 60000)
    .toISOString().slice(0, 16);

  campoData.value = localISO;
  console.log("✅ Slot selezionato:", localISO);
},

eventSources: [{
  events: async (fetchInfo, successCallback, failureCallback) => {
    try {
      const eventi = [];
      const vista = cal.view?.type || "dayGridMonth";
      const durata = getDurataSlot();
      const da = fetchInfo.start.toISOString().slice(0, 10);
      const fino = fetchInfo.end.toISOString().slice(0, 10);
      const url = `${endpointAzure}?da=${da}&fino=${fino}&durata=${durata}&tipoFunnel=${tipoFunnel}`;

      const res = await fetch(url);
      const tuttiGliSlot = await res.json();

      for (const [giorno, slotDisponibili] of Object.entries(tuttiGliSlot)) {
        const oggi = new Date();
        oggi.setHours(0, 0, 0, 0);

       const giornoCorrente = new Date(giorno);
       if (giornoCorrente <= oggi) continue; // ⛔️ Salta oggi e giorni precedenti

        if (vista === "dayGridMonth") {
          eventi.push({
            title: `${slotDisponibili.length} slot disponibili`,
            start: giorno,
            allDay: true,
            display: "block",
            classNames: ["yume-slot-count"],
            extendedProps: { dayHasSlot: slotDisponibili.length > 0 }
          });
        }

        if (vista === "timeGridDay") {
          const start = new Date(`${giorno}T09:00:00`);
          const end = new Date(`${giorno}T20:00:00`);
          for (
            let slot = new Date(start);
            slot.getTime() + durata * 60000 <= end.getTime();
            slot = new Date(slot.getTime() + durata * 60000)
          ) {
            const ora = slot.toTimeString().slice(0, 5);
            const endSlot = new Date(slot.getTime() + durata * 60000);
            const disponibile = slotDisponibili.includes(ora);

            eventi.push({
              title: disponibile ? ora : "Occupato",
              start: slot.toISOString(),
              end: endSlot.toISOString(),
              display: "block",
              classNames: [disponibile ? (isAcquisto ? "acquisto-slot" : "libero-slot") : "inverse-slot"],
              extendedProps: { clickableSlot: disponibile }
            });
          }
        }
      }

      successCallback(eventi);
    } catch (err) {
      console.error("Errore calendario:", err);
      failureCallback(err);
    }
  }
}]

  });

  cal.on("datesSet", () => cal.refetchEvents());
  cal.render();
  return cal;
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("📄 Pagina caricata:", window.location.pathname);

  const campoData = document.getElementById("data_calendario");
  const elPrenota = document.getElementById("fullcalendar");
  const elAcquisto = document.getElementById("fullcalendarAcquisto");

  if (elPrenota && campoData) {
    calendar = inizializzaCalendario(elPrenota, "freddo");
  }

  if (elAcquisto && campoData) {
    calendarioAcquisti = inizializzaCalendario(elAcquisto, "caldo");

    document.getElementById("tipo_servizio_experience")?.addEventListener("change", aggiornaCalendarioConDurata);
    document.getElementById("tipo_servizio_tematica")?.addEventListener("change", aggiornaCalendarioConDurata);
  }
});
