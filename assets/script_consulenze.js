/* assets/script_consulenze.js
   ——————————————————————————————————————————————————————————————
   Frontend → Azure Proxy → GAS → Supabase
   - Consensi con versioning: privacy, termini, newsletter
   - Flussi: PRENOTA (freddo) e ACQUISTA (caldo)
   - FullCalendar con slot da endpoint Azure
   - Newsletter double opt‑in parallelo
   —————————————————————————————————————————————————————————————— */

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
   2) ENDPOINTS
   ========================= */
const ENDPOINT_CONSULENZE = "https://yume-consulenze.azurewebsites.net/api/invio-estremi"; // prenota/caldo
const ENDPOINT_SLOTS       = "https://yume-consulenze.azurewebsites.net/api/get-slots";     // GET ?mese=YYYY-MM&durata=NN
const ENDPOINT_CLIENTI     = "https://yume-clienti.azurewebsites.net/api/invio-yume";       // login/registrazione/verifica email
const ENDPOINT_NEWSLETTER  = "https://yume-sito-form.azurewebsites.net/api/invia-form";     // double opt‑in newsletter

/* =========================
   3) UI helpers (steps)
   ========================= */
function mostraStep(numero) {
  document.querySelectorAll(".step").forEach(step => step.classList.add("hidden"));
  document.getElementById("step" + numero)?.classList.remove("hidden");
}
function vaiAlStep0(){ mostraStep(0); }
function vaiAlStep1(){ mostraStep(1); }

function vaiAlStep2() {
  const categoria = document.getElementById("categoria_servizio")?.value;
  const calendario = document.getElementById("data_calendario")?.value;

  if (!categoria) return alert("Seleziona una categoria di consulenza (Tematica o Experience).");

  let tipoServizio = "";
  if (categoria === "tematica") tipoServizio = document.getElementById("tipo_servizio_tematica")?.value;
  else if (categoria === "experience") tipoServizio = document.getElementById("tipo_servizio_experience")?.value;

  if (!tipoServizio) return alert("Seleziona il tipo di consulenza.");
  if (!calendario)   return alert("Seleziona una data/ora dal calendario.");

  mostraStep(2);
  popolaCampiProfiloInStep2();
}

/* PRENOTA – riepilogo step 3 */
async function vaiAlStep3Prenota() {
  const riepilogo = document.getElementById("riepilogo");
  if (!riepilogo) return;

  const nome = document.getElementById("nome")?.value.trim();
  const cognome = document.getElementById("cognome")?.value.trim();
  const email = document.getElementById("email")?.value.trim();
  const confermaEmail = document.getElementById("confermaEmail")?.value.trim();
  const password = document.getElementById("password")?.value;
  const confermaPassword = document.getElementById("confermaPassword")?.value;
  const cf = document.getElementById("cf")?.value;
  const note = document.getElementById("note")?.value;

  // Consensi (obbligatori privacy + termini)
  const privacy = document.getElementById("privacy")?.checked === true;
  const termini = document.getElementById("termini")?.checked === true;
  if (!privacy || !termini) return alert("Devi accettare Privacy e Termini per continuare.");

  // Altre validazioni base
  if (!nome) return alert("Il campo Nome è obbligatorio.");
  if (!cognome) return alert("Il campo Cognome è obbligatorio.");
  if (!email || !confermaEmail) return alert("Entrambi i campi Email sono obbligatori.");
  if (email !== confermaEmail) return alert("Le email non coincidono.");
  if (!password || !confermaPassword) return alert("Entrambi i campi Password sono obbligatori.");
  if (password !== confermaPassword) return alert("Le password non coincidono.");

  riepilogo.innerHTML = "";
  riepilogo.innerHTML += `<li><strong>Nome:</strong> ${escapeHtml(nome)}</li>`;
  riepilogo.innerHTML += `<li><strong>Cognome:</strong> ${escapeHtml(cognome)}</li>`;
  riepilogo.innerHTML += `<li><strong>Email:</strong> ${escapeHtml(email)}</li>`;
  riepilogo.innerHTML += `<li><strong>Codice Fiscale:</strong> ${cf ? escapeHtml(cf) : `<em>non fornito</em>`}</li>`;
  if (note) riepilogo.innerHTML += `<li><strong>Note:</strong> ${escapeHtml(note)}</li>`;

  mostraStep(3);
}

/* ACQUISTA – riepilogo step 3 */
async function vaiAlStep3() {
  const tipoCliente = document.getElementById("cliente_tipo")?.value || "";
  const riepilogo = document.getElementById("riepilogo");
  if (!riepilogo) return;

  if (!tipoCliente) return alert("Seleziona una tipologia di cliente per proseguire.");

  // Consensi (obbligatori)
  const privacy = document.getElementById("privacy")?.checked === true;
  const termini = document.getElementById("termini")?.checked === true;
  if (!privacy || !termini) return alert("Devi accettare Privacy e Termini per continuare.");

  riepilogo.innerHTML = "";

  if (tipoCliente === "privato") {
    const email = document.getElementById("email")?.value.trim();
    const esiste = await verificaEmailEsistente(email);
    if (esiste) return alert("Questa email risulta già registrata. Fai login per proseguire.");

    const email2 = document.getElementById("confermaEmail")?.value.trim();
    const password = document.getElementById("password")?.value;
    const password2 = document.getElementById("confermaPassword")?.value;
    if (email !== email2) return alert("Le email non coincidono.");
    if (password !== password2) return alert("Le password non coincidono.");

    const obbl = ["nome","cognome","email","confermaEmail","password","confermaPassword",
      "cf","telefono","via","cap","citta","provincia","stato"];
    for (let id of obbl) {
      const val = document.getElementById(id)?.value.trim();
      if (!val) return alert("Compila tutti i campi obbligatori.");
    }

    // Riepilogo PRIVATO
    riepilogo.innerHTML += `<li><strong>Tipo cliente:</strong> Privato</li>`;
    riepilogo.innerHTML += `<li><strong>Nome:</strong> ${escapeHtml(document.getElementById("nome").value)}</li>`;
    riepilogo.innerHTML += `<li><strong>Cognome:</strong> ${escapeHtml(document.getElementById("cognome").value)}</li>`;
    riepilogo.innerHTML += `<li><strong>Email:</strong> ${escapeHtml(email)}</li>`;
    riepilogo.innerHTML += `<li><strong>Codice Fiscale:</strong> ${escapeHtml(document.getElementById("cf").value)}</li>`;
    riepilogo.innerHTML += `<li><strong>Telefono:</strong> ${escapeHtml(document.getElementById("telefono").value)}</li>`;
    riepilogo.innerHTML += `<li><strong>Via:</strong> ${escapeHtml(document.getElementById("via").value)}</li>`;
    riepilogo.innerHTML += `<li><strong>CAP:</strong> ${escapeHtml(document.getElementById("cap").value)}</li>`;
    riepilogo.innerHTML += `<li><strong>Città:</strong> ${escapeHtml(document.getElementById("citta").value)}</li>`;
    riepilogo.innerHTML += `<li><strong>Provincia:</strong> ${escapeHtml(document.getElementById("provincia").value)}</li>`;
    riepilogo.innerHTML += `<li><strong>Stato:</strong> ${escapeHtml(document.getElementById("stato").value)}</li>`;
    riepilogo.innerHTML += `<li><strong>Note:</strong> ${escapeHtml(document.getElementById("note").value)}</li>`;
  }
  else if (tipoCliente === "azienda") {
    const email = document.getElementById("email_azienda")?.value.trim();
    const email2 = document.getElementById("confermaEmail_azienda")?.value.trim();
    const password = document.getElementById("password_azienda")?.value;
    const password2 = document.getElementById("confermaPassword_azienda")?.value;

    if (email !== email2) return alert("Le email non coincidono.");
    if (password !== password2) return alert("Le password non coincidono.");

    const msgBox = document.getElementById("emailMatchMessageAzienda");
    const emailGiaUsata = await verificaEmailEsistente(email);
    if (emailGiaUsata) {
      if (msgBox) {
        msgBox.innerHTML = `<i class="fas fa-times-circle icon-ko"></i> Email già registrata. <a href="log-in.html">Accedi</a>`;
        msgBox.className = "email-message ko";
        document.getElementById("email_azienda").classList.add("input-ko");
      }
      alert("Email già registrata. Fai login per continuare.");
      return;
    }

    const obbl = [
      "ragione_sociale","email_azienda","confermaEmail_azienda",
      "password_azienda","confermaPassword_azienda","piva","cf_azienda",
      "pec","codice_destinatario","referente_nome","referente_cognome",
      "telefono_azienda","via_azienda","cap_azienda","citta_azienda","provincia_azienda","stato_azienda"
    ];
    for (let id of obbl) {
      const val = document.getElementById(id)?.value.trim();
      if (!val) return alert("Compila tutti i campi obbligatori.");
    }

    // Riepilogo AZIENDA
    riepilogo.innerHTML += `<li><strong>Tipo cliente:</strong> Azienda</li>`;
    riepilogo.innerHTML += `<li><strong>Ragione Sociale:</strong> ${escapeHtml(document.getElementById("ragione_sociale").value)}</li>`;
    riepilogo.innerHTML += `<li><strong>Email:</strong> ${escapeHtml(email)}</li>`;
    riepilogo.innerHTML += `<li><strong>Partita IVA:</strong> ${escapeHtml(document.getElementById("piva").value)}</li>`;
    riepilogo.innerHTML += `<li><strong>Codice Fiscale:</strong> ${escapeHtml(document.getElementById("cf_azienda").value)}</li>`;
    riepilogo.innerHTML += `<li><strong>PEC:</strong> ${escapeHtml(document.getElementById("pec").value)}</li>`;
    riepilogo.innerHTML += `<li><strong>Codice SDI:</strong> ${escapeHtml(document.getElementById("codice_destinatario").value)}</li>`;
    riepilogo.innerHTML += `<li><strong>Referente:</strong> ${escapeHtml(document.getElementById("referente_nome").value)} ${escapeHtml(document.getElementById("referente_cognome").value)}</li>`;
    riepilogo.innerHTML += `<li><strong>Telefono:</strong> ${escapeHtml(document.getElementById("telefono_azienda").value)}</li>`;
    riepilogo.innerHTML += `<li><strong>Via:</strong> ${escapeHtml(document.getElementById("via_azienda").value)}</li>`;
    riepilogo.innerHTML += `<li><strong>CAP:</strong> ${escapeHtml(document.getElementById("cap_azienda").value)}</li>`;
    riepilogo.innerHTML += `<li><strong>Città:</strong> ${escapeHtml(document.getElementById("citta_azienda").value)}</li>`;
    riepilogo.innerHTML += `<li><strong>Provincia:</strong> ${escapeHtml(document.getElementById("provincia_azienda").value)}</li>`;
    riepilogo.innerHTML += `<li><strong>Stato:</strong> ${escapeHtml(document.getElementById("stato_azienda").value)}</li>`;
    riepilogo.innerHTML += `<li><strong>Note:</strong> ${escapeHtml(document.getElementById("note_azienda").value)}</li>`;
  }

  document.querySelectorAll(".step").forEach(s => s.classList.add("hidden"));
  document.getElementById("step3")?.classList.remove("hidden");
}

/* =========================
   4) Switch UI cliente
   ========================= */
function aggiornaTipoCliente() {
  const tipo = document.getElementById("cliente_tipo")?.value || "";
  const privato = document.getElementById("sezione_privato");
  const azienda = document.getElementById("sezione_azienda");
  if (!privato || !azienda) return;
  privato.classList.add("hidden"); azienda.classList.add("hidden");
  if (tipo === "privato") privato.classList.remove("hidden");
  else if (tipo === "azienda") azienda.classList.remove("hidden");
}
function mostraCampiAzienda() {
  const tipo = document.getElementById("cliente_tipo")?.value || "";
  const box = document.getElementById("campi_azienda");
  if (box) box.classList.toggle("hidden", tipo !== "azienda");
}

/* =========================
   5) INVIO – ACQUISTA (caldo)
   ========================= */
async function inviaRichiestaConsulenza() {
  if (invioInCorso) return;
  invioInCorso = true;

  try {
    // Consensi (obbligatori)
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

    const baseConsensi = {
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

    const dati = Object.assign({
      tipo_funnel: tipoFunnel,
      cliente_tipo: tipoCliente,
      tipo_servizio,
      calendario,
      stato_pagamento: statoPagamento,
      ID_ordine: idOrdine
    }, baseConsensi);

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
      dati.città = document.getElementById("citta").value;      // id input "citta"
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
      dati.città_azienda = document.getElementById("citta_azienda").value; // id input "citta_azienda"
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

    // INVIO principale
    const response = await fetch(ENDPOINT_CONSULENZE, {
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

/* =========================
   6) INVIO – PRENOTA (freddo)
   ========================= */
async function confermaPrenotazione() {
  if (invioInCorso) return;
  invioInCorso = true;

  try {
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
        document.getElementById("tipo_servizio")?.value || "",
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

    // Newsletter: double opt‑in parallelo
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

    const response = await fetch(ENDPOINT_CONSULENZE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dati)
    });
    const result = await response.json();

    if (result.status === "ok") {
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

/* =========================
   7) Registrazione cliente (opzionale, allineata ai consensi)
   ========================= */
async function verificaERegistrazioneSeNecessario() {
  const email = document.getElementById("email")?.value?.trim();
  const nome = document.getElementById("nome")?.value?.trim();
  const cognome = document.getElementById("cognome")?.value?.trim();
  const password = document.getElementById("password")?.value?.trim();

  const newsletter = document.getElementById("newsletter")?.checked === true;
  const privacy = document.getElementById("privacy")?.checked === true;
  const termini = document.getElementById("termini")?.checked === true;

  if (!email || !nome || !cognome || !password || !privacy || !termini) {
    return; // dati/consensi non sufficienti, non bloccare il flusso
  }

  const emailEsiste = await verificaEmailEsistente(email);
  if (emailEsiste) return;

  const password_hash = await sha256(password);

  try {
    const response = await fetch(ENDPOINT_CLIENTI, {
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
        referrer: document.referrer || null,
        lang: document.documentElement.lang || "it"
      })
    });

    await response.json().catch(()=>({}));
  } catch (_) {}
}

/* wrappers */
async function eseguiRegistrazioneEInvio() {
  mostraSpinner();
  await Promise.all([verificaERegistrazioneSeNecessario(), confermaPrenotazione()]);
  nascondiSpinner();
}
async function eseguiAcquistoEInvio() {
  mostraSpinner();
  await Promise.all([verificaERegistrazioneSeNecessario(), inviaRichiestaConsulenza()]);
  nascondiSpinner();
}

/* =========================
   8) Autocomplete indirizzo (best effort)
   ========================= */
let _autocompleteTimer = null;
function avviaSuggerimentoIndirizzo(inputVal) {
  if (_autocompleteTimer) clearTimeout(_autocompleteTimer);
  _autocompleteTimer = setTimeout(()=>compilaIndirizzoConAutocomplete(inputVal), 400);
}
async function compilaIndirizzoConAutocomplete(input) {
  if (!input || input.length < 4) return;
  // Se hai un endpoint dedicato lato Azure/GAS per autocomplete, chiamalo qui.
  // Qui lasciamo no‑op per non introdurre nuove function app.
}

/* =========================
   9) FullCalendar – slot
   ========================= */
let _calendar;
let _calendarAcquisto;

function getDurataServizioSelezionato() {
  // Durate dal tuo GAS: freddo=20; altrimenti mappa
  const t1 = document.getElementById("tipo_servizio_tematica")?.value;
  const t2 = document.getElementById("tipo_servizio_experience")?.value;
  const sel = t1 || t2 || "";

  const durate = {
    "Consulenza Yume Lite": 75,
    "Consulenza Yume Smart": 195,
    "Consulenza Yume Premium": 315,
    "Consulenza Yume Experience Singolo": 195,
    "Consulenza Yume Experience Coppia": 195,
    "Consulenza Yume Experience Famiglia": 195,
    "Consulenza Yume Experience Mini Gruppo": 195,
    "Consulenza Yume Experience Yume Atelier": 20
  };
  return durate[sel] || 195;
}

async function aggiornaCalendarioConDurata() {
  const isAcquistoPage = !!document.getElementById("fullcalendarAcquisto");
  const targetDivId = isAcquistoPage ? "fullcalendarAcquisto" : "fullcalendar";

  const durata = getDurataServizioSelezionato();
  inizializzaFullCalendar(targetDivId, durata);
}

function inizializzaFullCalendar(divId, durataMinuti) {
  const el = document.getElementById(divId);
  if (!el) return;

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth()+1).padStart(2, "0");
  const meseCorrente = `${yyyy}-${mm}`;

  const cal = new FullCalendar.Calendar(el, {
    initialView: 'dayGridMonth',
    locale: 'it',
    height: 'auto',
    selectable: true,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    dateClick: async (info) => {
      await caricaEdMostraSlot(info.date, durataMinuti, el.id);
    },
    datesSet: async (arg) => {
      const y = arg.start.getFullYear();
      const m = String(arg.start.getMonth()+1).padStart(2, "0");
      await prefetchSlots(`${y}-${m}`, durataMinuti);
    }
  });

  cal.render();

  // salva riferimento
  if (divId === "fullcalendar") _calendar = cal;
  else _calendarAcquisto = cal;

  // prefetch mese corrente
  prefetchSlots(meseCorrente, durataMinuti);
}

let _slotsCache = {}; // { 'YYYY-MM': [ '2025-09-12T09:00', ... ] }

async function prefetchSlots(mese, durata) {
  try {
    const url = `${ENDPOINT_SLOTS}?mese=${encodeURIComponent(mese)}&durata=${encodeURIComponent(durata)}`;
    const r = await fetch(url);
    const data = await r.json();
    if (Array.isArray(data?.slots)) {
      _slotsCache[mese] = data.slots;
    }
  } catch (_) {}
}

async function caricaEdMostraSlot(dateObj, durataMinuti, calendarDivId) {
  const containerId = "data_calendario";
  const hidden = document.getElementById(containerId);
  if (!hidden) return;

  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth()+1).padStart(2, "0");
  const dd = String(dateObj.getDate()).padStart(2, "0");
  const key = `${yyyy}-${mm}`;

  if (!_slotsCache[key]) await prefetchSlots(key, durataMinuti);

  const slots = (_slotsCache[key] || []).filter(s => s.startsWith(`${yyyy}-${mm}-${dd}`));

  // UI semplice: prompt per lo slot
  if (!slots.length) {
    alert("Nessuno slot disponibile in questa data. Scegli un altro giorno.");
    return;
  }

  const scelta = prompt(
    `Slot disponibili per ${dd}/${mm}/${yyyy}:\n` +
    slots.map((s,i)=>`${i+1}) ${s.substring(11,16)}`).join("\n") +
    `\n\nInserisci il numero dello slot desiderato:`
  );

  const idx = Number(scelta) - 1;
  if (Number.isNaN(idx) || idx < 0 || idx >= slots.length) return;

  hidden.value = slots[idx]; // ISO string HH:mm
  alert(`Selezionato: ${slots[idx].substring(0,16).replace("T"," ")}`);
}

/* =========================
   10) Helpers login / verifica / ui
   ========================= */
async function verificaEmailEsistente(email) {
  if (!email) return false;
  try {
    const res = await fetch(ENDPOINT_CLIENTI, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipoRichiesta: "verificaEmail", email })
    });
    const data = await res.json();
    return data?.exists === true || data?.status === "exists";
  } catch {
    return false;
  }
}

async function effettuaLogin() {
  const email = document.getElementById("emailLogin")?.value.trim();
  const password = document.getElementById("passwordLogin")?.value;
  const esito = document.getElementById("esitoLogin");
  if (!email || !password) {
    esito.textContent = "Inserisci credenziali.";
    return;
  }
  try {
    const r = await fetch(ENDPOINT_CLIENTI, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipoRichiesta: "login", email, password_hash: await sha256(password) })
    });
    const data = await r.json();
    if (data?.status === "success" || data?.ok === true) {
      sessionStorage.setItem("profiloUtente", JSON.stringify(data.profilo || { email }));
      esito.textContent = "Login effettuato!";
      mostraStep(1);
    } else {
      esito.textContent = data?.message || "Credenziali non valide.";
    }
  } catch {
    esito.textContent = "Errore di rete durante il login.";
  }
}
async function effettuaLoginPrenota(){ return effettuaLogin(); }

async function inviaRecuperoPassword() {
  const email = prompt("Inserisci la tua email per il recupero password:");
  if (!email) return;
  try {
    await fetch(ENDPOINT_CLIENTI, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipoRichiesta: "recuperoPassword", email })
    });
    alert("Se l'email esiste, riceverai un messaggio con le istruzioni.");
  } catch {
    alert("Errore nell'invio della richiesta.");
  }
}

/* Auto‑fill profilo in Step 2 */
function popolaCampiProfiloInStep2() {
  const raw = sessionStorage.getItem("profiloUtente");
  if (!raw) return;
  const p = JSON.parse(raw);

  const f = (id, v) => { const el = document.getElementById(id); if (el && (el.value === "" || el.value === undefined)) el.value = v || ""; };

  // Privato
  f("nome", p.nome);
  f("cognome", p.cognome);
  f("email", p.email);
  f("confermaEmail", p.email);
  // Azienda (se presente)
  f("ragione_sociale", p.ragione_sociale);
  f("email_azienda", p.email);
  f("confermaEmail_azienda", p.email);
}

/* =========================
   11) Validazioni UI (email/password)
   ========================= */
async function checkEmailMatchAndRegistrazione() {
  const email = document.getElementById("email")?.value.trim();
  const email2 = document.getElementById("confermaEmail")?.value.trim();
  const box = document.getElementById("emailMatchMessage");
  if (!box) return;
  if (!email || !email2) { box.textContent = ""; return; }
  if (email !== email2) { box.className = "email-message ko"; box.innerHTML = `<i class="fas fa-times-circle icon-ko"></i> Le email non coincidono`; return; }
  const exists = await verificaEmailEsistente(email);
  if (exists) { box.className = "email-message ko"; box.innerHTML = `<i class="fas fa-times-circle icon-ko"></i> Email già registrata. <a href="log-in.html">Accedi</a>`; }
  else { box.className = "email-message ok"; box.innerHTML = `<i class="fas fa-check-circle icon-ok"></i> Email disponibile`; }
}
async function checkEmailMatchAzienda() {
  const email = document.getElementById("email_azienda")?.value.trim();
  const email2 = document.getElementById("confermaEmail_azienda")?.value.trim();
  const box = document.getElementById("emailMatchMessageAzienda");
  if (!box) return;
  if (!email || !email2) { box.textContent = ""; return; }
  if (email !== email2) { box.className = "email-message ko"; box.innerHTML = `<i class="fas fa-times-circle icon-ko"></i> Le email non coincidono`; return; }
  const exists = await verificaEmailEsistente(email);
  if (exists) { box.className = "email-message ko"; box.innerHTML = `<i class="fas fa-times-circle icon-ko"></i> Email già registrata. <a href="log-in.html">Accedi</a>`; }
  else { box.className = "email-message ok"; box.innerHTML = `<i class="fas fa-check-circle icon-ok"></i> Email disponibile`; }
}

function checkPasswordMatch() {
  const p1 = document.getElementById("password")?.value || "";
  const p2 = document.getElementById("confermaPassword")?.value || "";
  const box = document.getElementById("passwordMatchMessage");
  if (!box) return;
  if (!p1 || !p2) { box.textContent = ""; return; }
  if (p1 !== p2) { box.className = "password-message ko"; box.innerHTML = `<i class="fas fa-times-circle icon-ko"></i> Le password non coincidono`; }
  else { box.className = "password-message ok"; box.innerHTML = `<i class="fas fa-check-circle icon-ok"></i> Password ok`; }
}
function checkPasswordMatchAzienda() {
  const p1 = document.getElementById("password_azienda")?.value || "";
  const p2 = document.getElementById("confermaPassword_azienda")?.value || "";
  const box = document.getElementById("passwordMatchMessageAzienda");
  if (!box) return;
  if (!p1 || !p2) { box.textContent = ""; return; }
  if (p1 !== p2) { box.className = "password-message ko"; box.innerHTML = `<i class="fas fa-times-circle icon-ko"></i> Le password non coincidono`; }
  else { box.className = "password-message ok"; box.innerHTML = `<i class="fas fa-check-circle icon-ok"></i> Password ok`; }
}

/* =========================
   12) Calendar helpers (UI logica)
   ========================= */
function aggiornaTipoServizio() {
  const categoria = document.getElementById("categoria_servizio")?.value || "";
  const secT = document.getElementById("sezione_tematica");
  const secE = document.getElementById("sezione_experience");
  if (secT) secT.classList.add("hidden");
  if (secE) secE.classList.add("hidden");
  if (categoria === "tematica") secT?.classList.remove("hidden");
  if (categoria === "experience") secE?.classList.remove("hidden");
  // aggiorna calendario
  setTimeout(aggiornaCalendarioConDurata, 100);
}

/* =========================
   13) Utils vari
   ========================= */
function toggleVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.type = (input.type === "password") ? "text" : "password";
  if (btn) btn.textContent = (input.type === "password") ? "Mostra password" : "Nascondi password";
}

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

async function sha256(message) {
  const enc = new TextEncoder().encode(message);
  const hash = await crypto.subtle.digest("SHA-256", enc);
  const hex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,"0")).join("");
  return hex;
}

/* Spinner fallback se non definiti a pagina */
function mostraSpinner(){ try{ document.getElementById("spinnerInvio")?.classList.remove("hidden"); }catch{} }
function nascondiSpinner(){ try{ document.getElementById("spinnerInvio")?.classList.add("hidden"); }catch{} }

/* =========================
   14) Bootstrap su DOM ready
   ========================= */
window.addEventListener("DOMContentLoaded", () => {
  // se c'è un calendario sulla pagina, inizializzalo
  if (document.getElementById("fullcalendar")) {
    inizializzaFullCalendar("fullcalendar", getDurataServizioSelezionato() || 20);
  }
  if (document.getElementById("fullcalendarAcquisto")) {
    inizializzaFullCalendar("fullcalendarAcquisto", getDurataServizioSelezionato() || 195);
  }
});
