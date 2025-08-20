// script_gruppo.js – gestione viaggi di gruppo (pari a script_gruppo (1) + registrazione nuova)

let invioInCorso = false;

/* =========================
   STEP / UI identici
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
   LOGIN (come originale)
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

      // Salva profilo
      const profilo = {
        nome: data.nome || "",
        cognome: data.cognome || "",
        email: data.email || "",
        codice_cliente: data.codice_cliente
      };
      sessionStorage.setItem("profiloUtente", JSON.stringify(profilo));

      // Default: privato
      document.getElementById("cliente_tipo").value = "privato";
      aggiornaTipoCliente();
      popolaCampiProfiloInStep2();

      // Passa a step 2
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
      nome: profilo.nome,
      cognome: profilo.cognome,
      email: profilo.email,
      confermaEmail: profilo.email,
      password: "••••••",
      confermaPassword: "••••••"
    };

    for (const [id, valore] of Object.entries(campi)) {
      const el = document.getElementById(id);
      if (el) {
        el.value = valore;
        el.readOnly = true;
        el.classList.add("readonly");
      }
    }
  } else if (tipo === "azienda") {
    const campi = {
      referente_nome: profilo.nome,
      referente_cognome: profilo.cognome,
      email_azienda: profilo.email,
      confermaEmail_azienda: profilo.email,
      password_azienda: "••••••",
      confermaPassword_azienda: "••••••"
    };

    for (const [id, valore] of Object.entries(campi)) {
      const el = document.getElementById(id);
      if (el) {
        el.value = valore;
        el.readOnly = true;
        el.classList.add("readonly");
      }
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
    const response = await fetch("https://yume-clienti.azurewebsites.net/api/invio-yume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipoRichiesta: "verifica_email", email })
    });

    const result = await response.json();
    return result.status === "trovata"; // true se già esiste
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
   REGISTRAZIONE (solo se nuovo)
   ========================= */
async function verificaERegistrazioneSeNecessario() {
  // Leggo i campi "privato" (come nelle altre pagine)
  const email = document.getElementById("email")?.value.trim();
  const nome = document.getElementById("nome")?.value.trim();
  const cognome = document.getElementById("cognome")?.value.trim();
  const password = document.getElementById("password")?.value?.trim();
  const newsletter = document.getElementById("newsletter")?.checked === true;
  const privacy = document.getElementById("privacy")?.checked === true;
  const termini = document.getElementById("termini")?.checked === true;

  // Se dati o consensi mancanti → non registro (non blocco il flusso qui)
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
        termini_accettati: true
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
   (identico + blocco Privacy/Termini)
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

    // Consensi OBBLIGATORI
    const privacy    = document.getElementById("privacy")?.checked === true;
    const termini    = document.getElementById("termini")?.checked === true;
    const newsletter = document.getElementById("newsletter")?.checked === true;

    if (!privacy || !termini) {
      alert("Devi accettare l’Informativa Privacy e i Termini e Condizioni per proseguire.");
      return;
    }

    const dati = {
      tipo_funnel: "gruppo",
      ID_ordine: "ORD-" + Date.now(),
      stato_pagamento: "In attesa",
      newsletterConsent: !!newsletter
    };

    if (tipoCliente === "privato") {
      const campi = [
        "nome", "cognome", "email", "confermaEmail", "password", "confermaPassword",
        "cf", "telefono", "via", "numero_civico", "cap", "citta", "provincia", "stato"
      ];
      for (const id of campi) {
        const val = document.getElementById(id)?.value?.trim();
        if (!val) { alert("Compila tutti i campi obbligatori."); return; }
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

    // Invio (stesso endpoint)
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
   WRAPPER come originale:
   registra (se serve) + invia
   ========================= */
async function eseguiAcquistoEInvio() {
  mostraSpinner();
  const promessaRegistrazione = verificaERegistrazioneSeNecessario();
  const promessaInvio = inviaRichiestaAcconto();
  await Promise.all([promessaRegistrazione, promessaInvio]);
  nascondiSpinner();
}

/* =========================
   SPINNER (id = "spinner" come originale)
   ========================= */
function mostraSpinner() {
  const spinner = document.getElementById("spinner");
  if (spinner) spinner.style.display = "block";
}
function nascondiSpinner() {
  const spinner = document.getElementById("spinner");
  if (spinner) spinner.style.display = "none";
}

/* =========================
   RIEPILOGO (identico all’originale)
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
    riepilogo.innerHTML += `<li><strong>Indirizzo:</strong> ${document.getElementById("via").value} ${document.getElementById("numero_civico").value}, ${document.getElementById("cap").value} ${document.getElementById("citta").value} (${document.getElementById("provincia").value}), ${document.getElementById("stato").value}</li>`;
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

  const box = document.getElementById("riepilogo-box");
  if (box) box.classList.remove("hidden");
}

function mostraRiepilogoEFase2() {
  mostraRiepilogoFatturazione();

  // Nascondi pulsanti iniziali
  document.getElementById("step2-pulsanti-iniziali")?.classList.add("hidden");

  // Mostra conferma e pagamento
  document.getElementById("step2-conferma-pagamento")?.classList.remove("hidden");
}

function checkPasswordMatchAzienda() {
  const pw = document.getElementById("password_azienda")?.value || "";
  const conferma = document.getElementById("confermaPassword_azienda")?.value || "";
  const msg = document.getElementById("passwordMatchMessageAzienda");
  if (!msg) return;
  if (!conferma) { msg.innerHTML = ""; return; }
  if (pw === conferma) {
    msg.innerHTML = `<i class="fas fa-check-circle icon-ok"></i> Le password coincidono`;
    msg.className = "password-message ok";
  } else {
    msg.innerHTML = `<i class="fas fa-times-circle icon-ko"></i> Le password non coincidono`;
    msg.className = "password-message ko";
  }
}

