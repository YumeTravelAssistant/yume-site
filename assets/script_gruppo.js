// script_gruppo.js – gestione viaggi di gruppo

// script_gruppo.js – gestione viaggi di gruppo

let invioInCorso = false;

function mostraStep(numero) {
  document.querySelectorAll(".step").forEach(step => {
    step.classList.add("hidden");
  });
  document.getElementById("step" + numero)?.classList.remove("hidden");
}

function vaiAlStep0() { mostraStep(0); }
function vaiAlStep2() { mostraStep(2); popolaCampiProfiloInStep2(); }

function aggiornaTipoCliente() {
  const tipo = document.getElementById("cliente_tipo").value;
  const privato = document.getElementById("sezione_privato");
  const azienda = document.getElementById("sezione_azienda");
  if (!privato || !azienda) return;
  privato.classList.add("hidden");
  azienda.classList.add("hidden");
  if (tipo === "privato") privato.classList.remove("hidden");
  else if (tipo === "azienda") azienda.classList.remove("hidden");
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
      body: JSON.stringify({ identificatore, password_hash, tipoRichiesta: "login" })
    });

    const data = await response.json();

    if (data.status === "success") {
      sessionStorage.setItem("profiloUtente", JSON.stringify({
        status: "success",
        codice_cliente: data.codice_cliente,
        nome: data.nome,
        cognome: data.cognome,
        email: data.email
      }));
      document.getElementById("cliente_tipo").value = "privato";
      aggiornaTipoCliente();
      vaiAlStep2();
    } else {
      output.textContent = data.message || "Credenziali errate.";
      output.style.color = "red";
    }
  } catch (err) {
    output.textContent = "Errore: " + (err.message || err);
    output.style.color = "red";
  }
}

async function eseguiAcquistoEInvio() {
  mostraSpinner();
  const promessaRegistrazione = verificaERegistrazioneSeNecessario();
  const promessaInvio = inviaRichiestaViaggioGruppo();
  await Promise.all([promessaRegistrazione, promessaInvio]);
  nascondiSpinner();
}

async function inviaRichiestaViaggioGruppo() {
  if (invioInCorso) return;
  invioInCorso = true;

  try {
    const tipoCliente = document.getElementById("cliente_tipo").value;
    const idOrdine = "GRP-" + Date.now();
    const dati = {
      tipo_funnel: "gruppo",
      cliente_tipo: tipoCliente,
      stato_pagamento: "In attesa",
      ID_ordine: idOrdine,
      tipo_servizio: "Viaggio di Gruppo",
      nome_viaggio: "Kokai"
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
      throw new Error(result.message || "Errore nel pagamento.");
    }
  } catch (err) {
    alert("Errore durante l'invio: " + err.message);
  } finally {
    invioInCorso = false;
  }
}

async function verificaERegistrazioneSeNecessario() {
  const profilo = sessionStorage.getItem("profiloUtente");
  if (profilo) return; // Skip se già loggato
  const email = document.getElementById("email")?.value?.trim();
  const nome = document.getElementById("nome")?.value?.trim();
  const cognome = document.getElementById("cognome")?.value?.trim();
  const password = document.getElementById("password")?.value?.trim();
  const privacy = document.getElementById("privacy")?.checked;
  const termini = document.getElementById("termini")?.checked;

  if (!email || !nome || !cognome || !password || !privacy || !termini) return;

  const emailEsiste = await verificaEmailEsistente(email);
  if (emailEsiste) return;

  const password_hash = await sha256(password);
  await fetch("https://yume-clienti.azurewebsites.net/api/invio-yume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tipoRichiesta: "registrazione",
      nome, cognome, email,
      password_hash,
      privacy_accettata: privacy,
      termini_accettati: termini
    })
  });
}

async function verificaEmailEsistente(email) {
  try {
    const response = await fetch("https://yume-clienti.azurewebsites.net/api/invio-yume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipoRichiesta: "verifica_email", email })
    });
    const result = await response.json();
    return result.status === "trovata";
  } catch (err) {
    console.error("Errore verifica email:", err);
    return false;
  }
}

async function sha256(str) {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function mostraSpinner() {
  document.getElementById("spinnerInvio")?.classList.remove("hidden");
}
function nascondiSpinner() {
  document.getElementById("spinnerInvio")?.classList.add("hidden");
}

