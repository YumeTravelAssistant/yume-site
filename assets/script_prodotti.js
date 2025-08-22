// script_prodotti.js — allineato alla meccanica di script_consulenze.js
let carrello = [];

/* === CONSENSI (versioning e URL) ==================================== */
const CONSENT_CONSTANTS = {
  privacy:    { key: "privacy",    version: "v1.0-2025-08-19", url: "https://yellow-bay-077dd2b03.6.azurestaticapps.net/privacy.html" },
  terms:      { key: "terms",      version: "v1.0-2025-08-19", url: "https://yellow-bay-077dd2b03.6.azurestaticapps.net/termini-condizioni.html" },
  newsletter: { key: "newsletter", version: "v1.0-2025-08-19", url: "https://yellow-bay-077dd2b03.6.azurestaticapps.net/privacy.html" }
};
/* ==================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const carrelloSalvato = JSON.parse(sessionStorage.getItem("carrello")) || [];
  if (carrelloSalvato.length > 0) {
    carrello = carrelloSalvato;
    aggiornaCarrelloUI();

    if (window.location.pathname.includes("acquista-prodotti")) {
      mostraCarrelloInStep1();
    }
  }
});

function toggleCarrello() {
  document.getElementById("carrelloContainer").classList.toggle("hidden");
}

document.addEventListener("click", function (event) {
  const carrelloBox = document.getElementById("carrelloContainer");
  const carrelloBtn = document.getElementById("toggleCarrelloBtn");
  if (
    carrelloBox &&
    !carrelloBox.classList.contains("hidden") &&
    !carrelloBox.contains(event.target) &&
    !carrelloBtn.contains(event.target)
  ) {
    carrelloBox.classList.add("hidden");
  }
});

function aggiornaCarrelloUI() {
  const lista = document.getElementById("listaCarrello");
  const totale = document.getElementById("carrelloTotale");
  const badge = document.getElementById("cartCount");
  if (!lista || !totale || !badge) return;

  lista.innerHTML = "";
  let somma = 0;

  carrello.forEach((prodotto, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${prodotto.nome} – <strong>€${prodotto.prezzo.toFixed(2)}</strong>
      <button onclick="rimuoviDalCarrello(${index})" style="background:none;border:none;color:#8B2C2B;cursor:pointer">🗑</button>
    `;
    lista.appendChild(li);
    somma += prodotto.prezzo;
  });

  totale.textContent = `€${somma.toFixed(2)}`;
  badge.textContent = carrello.length;
}

function aggiungiAlCarrello(nome, prezzo) {
  carrello.push({ nome, prezzo });
  aggiornaCarrelloUI();
  mostraConfermaAggiunta();
  sessionStorage.setItem("carrello", JSON.stringify(carrello));
}

function rimuoviDalCarrello(index) {
  carrello.splice(index, 1);
  aggiornaCarrelloUI();
  sessionStorage.setItem("carrello", JSON.stringify(carrello));
}

function mostraConfermaAggiunta() {
  const btn = document.getElementById("toggleCarrelloBtn");
  if (!btn) return;
  btn.classList.add("pulse");
  setTimeout(() => btn.classList.remove("pulse"), 600);
}

function vaiAllaCassa() {
  if (carrello.length === 0) {
    alert("Il carrello è vuoto.");
    return;
  }
  sessionStorage.setItem("carrello", JSON.stringify(carrello));
  window.location.href = "acquista-prodotti.html";
}

let invioInCorso = false;

function mostraStep(numero) {
  document.querySelectorAll(".step").forEach(step => step.classList.add("hidden"));
  document.getElementById("step" + numero)?.classList.remove("hidden");
}

function vaiAlStep0() { mostraStep(0); }
function vaiAlStep1() { mostraStep(1); }
function vaiAlStep2() {
  const carrello = JSON.parse(sessionStorage.getItem("carrello")) || [];
  if (carrello.length === 0) {
    alert("Il carrello è vuoto.");
    return;
  }
  mostraStep(2);
  popolaCampiProfiloInStep2();
}

async function vaiAlStep3() {
  const tipoCliente = document.getElementById("cliente_tipo")?.value || "";
  const riepilogo = document.getElementById("riepilogo");
  if (!riepilogo) return;

  if (!tipoCliente) {
    alert("Seleziona una tipologia di cliente per proseguire.");
    return;
  }

  riepilogo.innerHTML = "";

  // === PRIVATO ===
  if (tipoCliente === "privato") {
    const email = document.getElementById("email")?.value.trim();
    const email2 = document.getElementById("confermaEmail")?.value.trim();
    const password = document.getElementById("password")?.value;
    const password2 = document.getElementById("confermaPassword")?.value;

    const esiste = await verificaEmailEsistente(email);
    if (esiste) {
      alert("Questa email risulta già registrata. Accedi per proseguire.");
      return;
    }
    if (email !== email2) return alert("Le email non coincidono.");
    if (password !== password2) return alert("Le password non coincidono.");

    const campiPrivatoObbligatori = [
      "nome", "cognome", "email", "confermaEmail", "password", "confermaPassword",
      "cf", "telefono", "via", "cap", "citta", "provincia", "stato"
    ];
    for (let id of campiPrivatoObbligatori) {
      const val = document.getElementById(id)?.value?.trim();
      if (!val) return alert("Compila tutti i campi obbligatori.");
    }

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

    if (email !== email2) return alert("Le email non coincidono.");
    if (password !== password2) return alert("Le password non coincidono.");

    const esiste = await verificaEmailEsistente(email);
    if (esiste) {
      const msgBox = document.getElementById("emailMatchMessageAzienda");
      if (msgBox) {
        msgBox.innerHTML = `<i class="fas fa-times-circle icon-ko"></i> Email già registrata. <a href="log-in.html">Accedi</a>`;
        msgBox.className = "email-message ko";
        document.getElementById("email_azienda").classList.add("input-ko");
      }
      alert("Email già registrata. Fai login per continuare.");
      return;
    }

    const campiAziendaObbligatori = [
      "ragione_sociale", "email_azienda", "confermaEmail_azienda",
      "password_azienda", "confermaPassword_azienda", "piva", "cf_azienda",
      "pec", "codice_destinatario", "referente_nome", "referente_cognome",
      "telefono_azienda", "via_azienda", "cap_azienda", "citta_azienda",
      "provincia_azienda", "stato_azienda"
    ];
    for (let id of campiAziendaObbligatori) {
      const val = document.getElementById(id)?.value?.trim();
      if (!val) return alert("Compila tutti i campi obbligatori.");
    }

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

  mostraStep(3);
}

function mostraCarrelloInStep1() {
  const container = document.getElementById("carrello-prodotti");
  if (!container) return;

  container.innerHTML = "";
  if (carrello.length === 0) {
    container.innerHTML = "<p>Il carrello è vuoto.</p>";
    return;
  }

  const ul = document.createElement("ul");
  ul.classList.add("riepilogo-lista");

  let somma = 0;
  carrello.forEach(prodotto => {
    const li = document.createElement("li");
    li.textContent = `${prodotto.nome} – €${prodotto.prezzo.toFixed(2)}`;
    ul.appendChild(li);
    somma += prodotto.prezzo;
  });

  const totale = document.createElement("p");
  totale.innerHTML = `<strong>Totale: €${somma.toFixed(2)}</strong>`;
  container.appendChild(ul);
  container.appendChild(totale);
}

async function effettuaLogin() {
  const identificatore = document.getElementById("emailLogin")?.value.trim();
  const password = document.getElementById("passwordLogin")?.value.trim();
  const output = document.getElementById("esitoLogin");
  output.textContent = "";
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
      // Salvataggio profilo minimale, coerente con uso in pagina
      const cliente = {
        nome: data.nome || "",
        cognome: data.cognome || "",
        email: data.email || "",
      };
      sessionStorage.setItem("profiloUtente", JSON.stringify(cliente));

      document.getElementById("cliente_tipo").value = "privato";
      aggiornaTipoCliente();
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

function aggiornaTipoCliente() {
  const tipo = document.getElementById("cliente_tipo").value;
  const privato = document.getElementById("sezione_privato");
  const azienda = document.getElementById("sezione_azienda");
  if (!privato || !azienda) return;
  privato.classList.add("hidden");
  azienda.classList.add("hidden");
  if (tipo === "privato") privato.classList.remove("hidden");
  if (tipo === "azienda") azienda.classList.remove("hidden");
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

    ["nome","cognome","email","password","confermaEmail","confermaPassword"].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.readOnly = true; el.classList.add("readonly"); }
    });
  } else if (tipo === "azienda") {
    document.getElementById("referente_nome").value = profilo.nome || "";
    document.getElementById("referente_cognome").value = profilo.cognome || "";
    document.getElementById("email_azienda").value = profilo.email || "";
    document.getElementById("password_azienda").value = "••••••";
    document.getElementById("confermaEmail_azienda").value = profilo.email || "";
    document.getElementById("confermaPassword_azienda").value = "••••••";

    ["referente_nome","referente_cognome","email_azienda","password_azienda","confermaEmail_azienda","confermaPassword_azienda"].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.readOnly = true; el.classList.add("readonly"); }
    });
  } else {
    const campi = ["nome", "cognome", "email", "confermaEmail", "password", "confermaPassword"];
    campi.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      if (id === "password" || id === "confermaPassword") el.value = "••••••";
      else if (id === "confermaEmail") el.value = profilo.email || "";
      else el.value = profilo[id] || "";
      el.readOnly = true;
      el.classList.add("readonly");
    });
  }
}

function mostraSpinner() {
  document.getElementById("spinnerInvio")?.classList.remove("hidden");
}
function nascondiSpinner() {
  document.getElementById("spinnerInvio")?.classList.add("hidden");
}

async function sha256(str) {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/* ======================
   REGISTRAZIONE (identica)
   ====================== */
async function verificaERegistrazioneSeNecessario() {
  const email = document.getElementById("email")?.value.trim();
  const nome = document.getElementById("nome")?.value.trim();
  const cognome = document.getElementById("cognome")?.value.trim();
  const password = document.getElementById("password")?.value.trim();
  const newsletter = document.getElementById("newsletter")?.checked === true;
  const privacy = document.getElementById("privacy")?.checked === true;
  const termini = document.getElementById("termini")?.checked === true;

  if (!email || !nome || !cognome || !password || !privacy || !termini) {
    console.log("Dati/consensi non sufficienti per registrazione (non blocco).");
    return;
  }

  const emailEsiste = await verificaEmailEsistente(email);
  if (emailEsiste) {
    console.log("Email già registrata, nessuna registrazione necessaria.");
    return;
  }

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
        policy_key: CONSENT_CONSTANTS.privacy.key,
        policy_version: CONSENT_CONSTANTS.privacy.version,
        terms_key: CONSENT_CONSTANTS.terms.key,
        terms_version: CONSENT_CONSTANTS.terms.version,
        newsletter_policy_key: CONSENT_CONSTANTS.newsletter.key,
        newsletter_policy_version: CONSENT_CONSTANTS.newsletter.version,
        referrer: document.referrer || null,
        lang: document.documentElement.lang || "it"
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

/* ======================
   ACQUISTO PRODOTTI
   ====================== */
async function effettuaAcquistoProdotto() {
  if (invioInCorso) return;
  invioInCorso = true;
  mostraSpinner();

  try {
    // ✅ Prima mi assicuro della registrazione (come nelle consulenze)
    await verificaERegistrazioneSeNecessario();

    const carrello = JSON.parse(sessionStorage.getItem("carrello")) || [];
    if (!carrello.length) throw new Error("Carrello vuoto.");

    // CHANGED: invia solo i nomi (senza “(€…)”) per abilitare la mappatura dei price LIVE
    const lista_prodotti = carrello.map(p => p.nome).join(", ");
    const totale = carrello.reduce((sum, p) => sum + p.prezzo, 0);

    const tipoCliente = document.getElementById("cliente_tipo").value;

    const privacy    = document.getElementById("privacy")?.checked === true;
    const termini    = document.getElementById("termini")?.checked === true;
    const newsletter = document.getElementById("newsletter")?.checked === true;

    // ⛔️ BLOCCO OBBLIGATORIO: Privacy + Termini
    if (!privacy || !termini) {
      alert("Devi accettare l’Informativa Privacy e i Termini e Condizioni per proseguire.");
      invioInCorso = false;
      nascondiSpinner();
      return;
    }

    const dati = {
      tipoRichiesta: "ordineProdotto",
      cliente_tipo: tipoCliente,
      lista_prodotti,
      totale,

      // Metadati consensi per GAS→Supabase
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
      throw new Error(result.message || "Errore durante la creazione del checkout.");
    }

  } catch (err) {
    alert("Errore: " + err.message);
  } finally {
    invioInCorso = false;
    nascondiSpinner();
  }
}

/* ======================
   UTILITIES EMAIL
   ====================== */
async function verificaEmailEsistente(email) {
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
    return result.status === "trovata";
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

/* ======================
   WRAPPER PER IL BOTTONE
   ====================== */
async function eseguiAcquistoEInvio() {
  mostraSpinner();
  try {
    await verificaERegistrazioneSeNecessario();
    await effettuaAcquistoProdotto();
  } finally {
    nascondiSpinner();
  }
}

