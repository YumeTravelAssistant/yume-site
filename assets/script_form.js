// === Consenso privacy: identifica la versione del testo che mostri nel link ===
const POLICY_PRIVACY_KEY = 'privacy';
const POLICY_PRIVACY_VERSION = 'v1.0-2025-08-19'; // <-- aggiorna quando cambi l'informativa
const POLICY_PRIVACY_URL = 'https://yume-travel.com/privacy.html';

document.addEventListener('DOMContentLoaded', () => {
  const ver = document.getElementById('privacyVer');
  if (ver) ver.textContent = POLICY_PRIVACY_VERSION;
  const link = document.getElementById('privacyLink');
  if (link && typeof POLICY_PRIVACY_URL === 'string' && POLICY_PRIVACY_URL) {
    link.href = POLICY_PRIVACY_URL;
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const selectPacchetto = document.getElementById("pacchetto");
  if (!selectPacchetto) return;

  const params = new URLSearchParams(window.location.search);
  const richiesto = (params.get("pacchetto") || "").trim().toLowerCase();
  if (!richiesto) return;

  const option = Array.from(selectPacchetto.options).find(opt => opt.value === richiesto);
  if (!option) return;

  selectPacchetto.value = richiesto;
  selectPacchetto.dispatchEvent(new Event("change", { bubbles: true }));
});

const cittaPerPacchetto = {
  hajimete: [
    "Tokyo", "Kyoto", "Osaka", "Hakone", "Nara",
    "Kawaguchiko", "Nikko", "Hiroshima", "Yokohama", "Kamakura"
  ],

  tetsugaku: [
    "Kyoto", "Nara", "Kanazawa", "Kurashiki", "Okayama",
    "Koyasan", "Uji", "Tokyo", "Hakone", "Kamakura"
  ],

  shizen: [
    "Tokyo", "Kawaguchiko", "Hakone", "Nikko", "Miyajima", "Takayama",
    "Kanazawa", "Shirakawa-go", "Okayama", "Kiso-dani", "Gifu"
  ],

  kodai: [
    "Kyoto", "Nara", "Osaka", "Okayama", "Himeji",
    "Kobe", "Kurashiki", "Uji", "Hiroshima", "Tottori"
  ],

  kataware: [
    "Tokyo", "Kyoto", "Kanazawa", "Hakone", "Nikko",
    "Osaka", "Kawaguchiko", "Kamakura", "Enoshima", "Nagano"
  ],

  hagane: [
    "Tokyo", "Kawaguchiko", "Yokohama", "Hakone", "Chichibu",
    "Odawara", "Enoshima", "Kamakura", "Atami", "Nikko"
  ]
};

let maxCitta = 0;

// ============== Choices.js (multi-select senza Ctrl/Cmd) ==============
let choicesCittaInstance = null;

function creaChoicesCitta(selectEl, max) {
  if (!window.Choices) return null;

  // distrugge eventuale istanza precedente
  if (choicesCittaInstance) {
    try { choicesCittaInstance.destroy(); } catch (e) {}
    choicesCittaInstance = null;
  }

  choicesCittaInstance = new Choices(selectEl, {
    removeItemButton: true,
    searchEnabled: true,
    placeholder: true,
    placeholderValue: 'Seleziona città…',
    noResultsText: 'Nessun risultato',
    noChoicesText: 'Nessuna opzione disponibile',
    itemSelectText: '',
    shouldSort: false,
    maxItemCount: max // 🔒 limite selezioni
  });

  return choicesCittaInstance;
}

function popolaChoicesCitta(lista) {
  if (!choicesCittaInstance) return;
  const choices = (lista || []).map(c => ({ value: c, label: c, selected: false, disabled: false }));
  choicesCittaInstance.clearChoices();
  choicesCittaInstance.setChoices(choices, 'value', 'label', true);
}

// ===================== AGGIORNA CITTÀ (DINAMICO) =====================
function aggiornaCitta(pacchetto, durata) {
  let selectCitta = document.getElementById("citta");
  const msgMax = document.getElementById("maxCittaMsg");
  const msgErrore = document.getElementById("erroreCitta");
  const counter = document.getElementById("counterCitta");
  const opzioni = cittaPerPacchetto[pacchetto] || [];

  // reset messaggi
  msgErrore.textContent = "";
  msgMax.textContent = "";
  counter.textContent = "";

  // distrugge Choices se esiste (per evitare doppie istanze)
  if (choicesCittaInstance) {
    try { choicesCittaInstance.destroy(); } catch (e) {}
    choicesCittaInstance = null;
  }

  // rimuove eventuali listener clonando il select
  const nuovoSelect = selectCitta.cloneNode(true);
  selectCitta.parentNode.replaceChild(nuovoSelect, selectCitta);
  selectCitta = nuovoSelect;

  // se non ho ancora la durata → disabilito e svuoto
  if (!durata) {
    selectCitta.disabled = true;

    if (window.Choices) {
      // nessuna UI avanzata finché non c'è la durata
      selectCitta.innerHTML = "";
    } else {
      selectCitta.innerHTML = "";
    }
    return;
  }

  // Calcolo massimo città selezionabili
  if (durata <= 8) maxCitta = 3;
  else if (durata <= 10) maxCitta = 4;
  else if (durata <= 15) maxCitta = 6;
  else maxCitta = 8;

  msgMax.textContent = `Puoi selezionare fino a ${maxCitta} città.`;
  selectCitta.disabled = false;

  // ---- Se Choices.js è disponibile: UI moderna a tag (no Ctrl/Cmd) ----
  if (window.Choices) {
    // popolo il select con le opzioni base (serve per avere value/label corretti)
    selectCitta.innerHTML = "";
    opzioni.forEach(citta => {
      const option = document.createElement("option");
      option.value = citta;
      option.textContent = citta;
      selectCitta.appendChild(option);
    });

    creaChoicesCitta(selectCitta, maxCitta);
    popolaChoicesCitta(opzioni);

    // Counter live
    const updateCounter = () => {
      const values = choicesCittaInstance ? (choicesCittaInstance.getValue(true) || []) : [];
      counter.textContent = `${values.length} città selezionate su massimo ${maxCitta}`;
    };
    selectCitta.addEventListener('addItem', updateCounter);
    selectCitta.addEventListener('removeItem', updateCounter);
    updateCounter();

    // Nessun errore necessario: il limite è enforced da maxItemCount
    msgErrore.textContent = "";

    return;
  }

  // ---- Fallback nativo (senza Choices) ----
  selectCitta.innerHTML = "";
  opzioni.forEach(citta => {
    const option = document.createElement("option");
    option.value = citta;
    option.textContent = citta;
    selectCitta.appendChild(option);
  });

  // Enforce limite + counter
  selectCitta.onchange = function () {
    const selezionate = Array.from(this.selectedOptions);
    counter.textContent = `${selezionate.length} città selezionate su massimo ${maxCitta}`;

    if (selezionate.length > maxCitta) {
      selezionate[selezionate.length - 1].selected = false;
      msgErrore.textContent = `Attenzione: massimo ${maxCitta} città selezionabili.`;
    } else {
      msgErrore.textContent = "";
    }
    Array.from(this.options).forEach(opt => {
      opt.disabled = !opt.selected && selezionate.length >= maxCitta;
    });
  };
  counter.textContent = `0 città selezionate su massimo ${maxCitta}`;
}

// =================== LISTENER PACCHETTO / DATE ===================
document.getElementById('pacchetto').addEventListener('change', function () {
  const selected = this.options[this.selectedIndex];
  const min = parseInt(selected.dataset.min);
  const max = parseInt(selected.dataset.max);
  const pacchetto = this.value;

  const partenza = document.getElementById('dataPartenza');
  const ritorno = document.getElementById('dataRitorno');

  // Imposta data minima partenza (oggi)
  partenza.min = new Date().toISOString().split("T")[0];
  ritorno.value = "";
  document.getElementById('maxCittaMsg').textContent = "";
  document.getElementById('counterCitta').textContent = "";
  document.getElementById('erroreCitta').textContent = "";

  // Aggiorna listener sulla data di partenza
  partenza.addEventListener("change", function () {
    if (!partenza.value || isNaN(min) || isNaN(max)) return;

    const partenzaDate = new Date(partenza.value);
    const minRitorno = new Date(partenzaDate);
    minRitorno.setDate(minRitorno.getDate() + min);

    const maxRitorno = new Date(partenzaDate);
    maxRitorno.setDate(maxRitorno.getDate() + max);

    const ritornoInput = document.getElementById("dataRitorno");

    ritornoInput.min = minRitorno.toISOString().split("T")[0];
    ritornoInput.max = maxRitorno.toISOString().split("T")[0];
    ritornoInput.value = ritornoInput.min; // default visivo

    const durata = min; // iniziale = minima
    aggiornaCitta(pacchetto, durata);
  });

  // Reset e aggiorna città senza giorni ancora noti
  aggiornaCitta(pacchetto, null);
});

document.getElementById('dataRitorno').addEventListener('change', function () {
  const pacchetto = document.getElementById('pacchetto').value;
  const partenza = new Date(document.getElementById('dataPartenza').value);
  const ritorno = new Date(this.value);
  const diff = Math.ceil((ritorno - partenza) / (1000 * 60 * 60 * 24));
  aggiornaCitta(pacchetto, diff);
});

// =================== CONTROLLI PARTECIPANTI ===================
document.getElementById('formPacchetto').addEventListener('input', function () {
  const partecipanti = parseInt(document.getElementById('partecipanti').value) || 0;
  const adulti = parseInt(document.getElementById('adulti').value) || 0;
  const bambini = parseInt(document.getElementById('bambini').value) || 0;
  const errore = document.getElementById('errorePartecipanti');

  if (partecipanti > 0 && (adulti + bambini !== partecipanti)) {
    errore.textContent = `Il totale di adulti e bambini deve essere ${partecipanti}.`;
  } else {
    errore.textContent = '';
  }
});

let cameraCounter = 0;

const cameraContainer = document.getElementById("camereContainer");
const btnAggiungiCamera = document.getElementById("aggiungiCamera");
const erroreCamere = document.getElementById("erroreCamere");

btnAggiungiCamera.addEventListener("click", function () {
  cameraCounter++;

  const div = document.createElement("div");
  div.classList.add("camera-box");
  div.innerHTML = `
    <label>Camera ${cameraCounter}:</label>
    <select class="tipologiaCamera tipo-camera" name="camere[]" required>
      <option value="Singola">Singola</option>
      <option value="Doppia">Doppia</option>
      <option value="Tripla">Tripla</option>
      <option value="Quadrupla">Quadrupla</option>
    </select>
    <input type="number" class="ospiti-camera" min="1" max="4" value="1" required style="width: 60px; margin-left: 10px;" title="Numero di ospiti per questa camera">
    <button type="button" class="rimuoviCamera">Rimuovi</button>
  `;

  cameraContainer.appendChild(div);

  const select = div.querySelector(".tipologiaCamera");
  const input = div.querySelector(".ospiti-camera");

  // 🔁 Funzione che imposta automaticamente valore e massimo
  function aggiornaOspitiDaTipologia() {
    const tipo = select.value;
    const capienza = tipo === "Singola" ? 1 : tipo === "Doppia" ? 2 : tipo === "Tripla" ? 3 : 4;
    input.max = capienza;
    input.value = capienza;
  }

  // Inizializza e imposta listener
  aggiornaOspitiDaTipologia();
  select.addEventListener("change", () => {
    aggiornaOspitiDaTipologia();
    aggiornaErroreCamere();
  });

  input.addEventListener("input", aggiornaErroreCamere);

  aggiornaErroreCamere();
});

// Gestione rimozione camera
cameraContainer.addEventListener("click", function (e) {
  if (e.target.classList.contains("rimuoviCamera")) {
    e.target.parentElement.remove();
    cameraCounter--;
    aggiornaErroreCamere();
  }
});

function aggiornaErroreCamere() {
  const partecipanti = parseInt(document.getElementById("partecipanti").value) || 0;
  const camere = document.querySelectorAll(".camera-box");
  let totaleOspiti = 0;

  camere.forEach(box => {
    const ospiti = parseInt(box.querySelector(".ospiti-camera")?.value || "0");
    totaleOspiti += ospiti;
  });

  if (totaleOspiti < partecipanti) {
    erroreCamere.textContent = `Hai assegnato solo ${totaleOspiti} posti letto su ${partecipanti} partecipanti.`;
  } else {
    erroreCamere.textContent = "";
  }
}

function aggiornaControlloAutomaticoCamere() {
  const selects = document.querySelectorAll(".tipologiaCamera");
  selects.forEach(sel => {
    sel.addEventListener("change", aggiornaErroreCamere);
  });
}

document.getElementById("partecipanti").addEventListener("input", aggiornaErroreCamere);

// =================== SUBMIT (riepilogo + invio a backend) ===================
let invioPacchettoInCorso = false;

function escapeHtmlPacchetti(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[ch]));
}

function setPacchettoLoading(active, text = "Invio in corso…") {
  const submitBtn = document.getElementById("inviaPacchettoBtn");
  const loading = document.getElementById("formLoading");
  const loadingText = document.getElementById("formLoadingText");

  if (submitBtn) {
    submitBtn.disabled = active;
    submitBtn.setAttribute("aria-busy", active ? "true" : "false");
    submitBtn.textContent = active ? "Invio in corso…" : "Invia richiesta";
  }
  if (loading) {
    loading.classList.toggle("is-active", active);
    loading.setAttribute("aria-hidden", active ? "false" : "true");
  }
  if (loadingText) loadingText.textContent = text;
}

document.getElementById("formPacchetto").addEventListener("submit", function (e) {
  e.preventDefault();

  if (invioPacchettoInCorso) return;
  if (document.querySelector("[data-yume-pacchetto-riepilogo]")) return;
  if (!validaForm()) return;

  const form = new FormData(this);
  const camereRiepilogo = [...document.querySelectorAll(".camera-box")].map(box => {
    const tipo = box.querySelector(".tipo-camera")?.value || "";
    const ospiti = box.querySelector(".ospiti-camera")?.value || "";
    return `${tipo} x ${ospiti}`;
  }).join(" / ");

  const riepilogo = `
    <h3>Conferma dati inseriti</h3>
    <ul>
      <li><strong>Nome:</strong> ${escapeHtmlPacchetti(form.get("nome"))}</li>
      <li><strong>Cognome:</strong> ${escapeHtmlPacchetti(form.get("cognome"))}</li>
      <li><strong>Email:</strong> ${escapeHtmlPacchetti(form.get("email"))}</li>
      <li><strong>Telefono:</strong> ${escapeHtmlPacchetti(form.get("telefono"))}</li>
      <li><strong>Pacchetto:</strong> ${escapeHtmlPacchetti(form.get("pacchetto"))}</li>
      <li><strong>Flessibilità date:</strong> ${escapeHtmlPacchetti(form.get("flessibilitaDate") || "Da definire")}</li>
      <li><strong>Data partenza:</strong> ${escapeHtmlPacchetti(form.get("dataPartenza"))}</li>
      <li><strong>Data ritorno:</strong> ${escapeHtmlPacchetti(form.get("dataRitorno"))}</li>
      <li><strong>Tipologia gruppo:</strong> ${escapeHtmlPacchetti(form.get("tipologiaGruppo"))}</li>
      <li><strong>Dettagli gruppo:</strong> ${escapeHtmlPacchetti(form.get("dettagliGruppo") || "Nessuno")}</li>
      <li><strong>Partecipanti:</strong> ${escapeHtmlPacchetti(form.get("partecipanti"))}</li>
      <li><strong>Adulti:</strong> ${escapeHtmlPacchetti(form.get("adulti"))}</li>
      <li><strong>Bambini:</strong> ${escapeHtmlPacchetti(form.get("bambini"))}</li>
      <li><strong>Fascia prezzo:</strong> ${escapeHtmlPacchetti(form.get("fasciaPrezzo"))}</li>
      <li><strong>Trasporto:</strong> ${escapeHtmlPacchetti(form.get("trasporto"))}</li>
      <li><strong>Connettività:</strong> ${escapeHtmlPacchetti(form.get("connettivita"))}</li>
      <li><strong>Città:</strong> ${escapeHtmlPacchetti((form.getAll("citta[]") || []).join(", "))}</li>
      <li><strong>Camere:</strong> ${escapeHtmlPacchetti(camereRiepilogo || "Da definire")}</li>
      <li><strong>Richieste aggiuntive:</strong> ${escapeHtmlPacchetti(form.get("richieste") || "Nessuna")}</li>
    </ul>
    <p>Vuoi confermare e inviare la richiesta?</p>
  `;

  const modal = document.createElement("div");
  modal.classList.add("riepilogo-modal");
  modal.dataset.yumePacchettoRiepilogo = "1";
  modal.innerHTML = `
    <div class="riepilogo-modal">
      <div class="riepilogo-content">
        ${riepilogo}
        <div class="riepilogo-buttons">
          <button type="button" id="confermaInvio" class="modern-btn conferma-btn">Conferma</button>
          <button type="button" id="annullaInvio" class="modern-btn annulla-btn">Annulla</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById("confermaInvio").addEventListener("click", () => {
    if (invioPacchettoInCorso) return;

    invioPacchettoInCorso = true;
    const confermaBtn = document.getElementById("confermaInvio");
    const annullaBtn = document.getElementById("annullaInvio");
    if (confermaBtn) {
      confermaBtn.disabled = true;
      confermaBtn.setAttribute("aria-busy", "true");
      confermaBtn.textContent = "Invio…";
    }
    if (annullaBtn) annullaBtn.disabled = true;

    setPacchettoLoading(true);
    modal.remove();

    const dati = {
      // --- dati form ---
      tipoRichiesta: "preventivo",
      nome: form.get("nome"),
      cognome: form.get("cognome"),
      email: form.get("email"),
      telefono: form.get("telefono"),
      pacchetto: form.get("pacchetto"),
      flessibilitaDate: form.get("flessibilitaDate") || "",
      dataPartenza: form.get("dataPartenza"),
      dataRitorno: form.get("dataRitorno"),
      tipologiaGruppo: form.get("tipologiaGruppo"),
      dettagliGruppo: form.get("dettagliGruppo"),
      partecipanti: form.get("partecipanti"),
      adulti: form.get("adulti"),
      bambini: form.get("bambini"),
      fasciaPrezzo: form.get("fasciaPrezzo"),
      trasporto: form.get("trasporto"),
      connettivita: form.get("connettivita"),
      citta: form.getAll("citta[]"),
      camere: [...document.querySelectorAll(".camera-box")].map(box => {
        const tipo = box.querySelector(".tipo-camera")?.selectedOptions[0]?.text || "";
        const ospiti = box.querySelector(".ospiti-camera")?.value || "";
        return `${tipo} x ${ospiti}`;
      }),
      richieste: form.get("richieste"),

      // --- CONSENSO PRIVACY (campi unificati per GDPR) ---
      privacy: document.getElementById("consensoGDPR")?.checked === true,
      policy_key: POLICY_PRIVACY_KEY,
      policy_version: POLICY_PRIVACY_VERSION,

      // --- metadati utili (prova del consenso) ---
      userAgent: navigator.userAgent || null,
      lang: navigator.language || "it",
      referrer: document.referrer || null
    };

    fetch("https://yume-sito-form.azurewebsites.net/api/invia-form", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dati)
    })
      .then(async response => {
        let data = {};
        try { data = await response.json(); } catch {}
        if (!response.ok) throw new Error(data?.message || "Errore HTTP " + response.status);
        return data;
      })
      .then(data => {
        if (data.status !== "success" && data.ok !== true) {
          throw new Error(data.message || "Il server non ha confermato l'invio.");
        }

        if (typeof tracciaConversioneLeadGoogleAds === "function") {
          tracciaConversioneLeadGoogleAds();
        }

        const feedback = document.getElementById("formFeedback");
        if (feedback) {
          feedback.textContent = "Richiesta inviata con successo!";
          feedback.className = "form-feedback-msg success";
        }

        document.getElementById("formPacchetto").reset();
        document.getElementById("counterCitta").textContent = "";
        document.getElementById("maxCittaMsg").textContent = "";
        document.getElementById("erroreCitta").textContent = "";

        if (choicesCittaInstance) {
          try { choicesCittaInstance.removeActiveItems(); } catch {}
        }

        alert("Richiesta inviata con successo!");
      })
      .catch(error => {
        console.error("Errore invio pacchetto:", error);
        const feedback = document.getElementById("formFeedback");
        if (feedback) {
          feedback.textContent = "Invio non completato. Controlla la connessione e riprova.";
          feedback.className = "form-feedback-msg error";
        }
        alert("Invio non completato. Riprova: non verrà effettuato un secondo invio automatico.");
      })
      .finally(() => {
        invioPacchettoInCorso = false;
        setPacchettoLoading(false);
      });
  });

  document.getElementById("annullaInvio").addEventListener("click", () => {
    if (!invioPacchettoInCorso) modal.remove();
  });
});

function validaForm() {
  const nome = document.getElementById("nome").value.trim();
  const cognome = document.getElementById("cognome").value.trim();
  const email = document.getElementById("email").value.trim();
  const confermaEmail = document.getElementById("confermaEmail").value.trim();
  const telefono = document.getElementById("telefono")?.value.trim() || "";
  const pacchetto = document.getElementById("pacchetto").value;
  const partecipanti = parseInt(document.getElementById("partecipanti").value);
  const adulti = parseInt(document.getElementById("adulti").value);
  const bambini = parseInt(document.getElementById("bambini").value);
  const dataPartenza = document.getElementById("dataPartenza").value;
  const dataRitorno = document.getElementById("dataRitorno").value;
  const tipologiaGruppo = document.getElementById("tipologiaGruppo").value;
  const fasciaPrezzo = document.getElementById("fasciaPrezzo").value;
  const trasporto = document.getElementById("trasporto").value;
  const connettivita = document.getElementById("connettivita").value;
  const citta = document.getElementById("citta").selectedOptions;
  const consensoGDPR = document.getElementById("consensoGDPR");

  const errorePartecipanti = document.getElementById("errorePartecipanti");
  const erroreCitta = document.getElementById("erroreCitta");
  errorePartecipanti.textContent = "";
  erroreCitta.textContent = "";

  // Controllo campi obbligatori
  if (!nome || !cognome || !email || !confermaEmail || !telefono) {
    alert("Inserisci nome, cognome, email e numero di telefono.");
    return false;
  }

  if (!/^[0-9+()\\s-]{6,25}$/.test(telefono)) {
    alert("Inserisci un numero di telefono valido.");
    return false;
  }

  if (email !== confermaEmail) {
    alert("Le email non coincidono.");
    return false;
  }

  if (!pacchetto) {
    alert("Seleziona un pacchetto.");
    return false;
  }

  if (!dataPartenza || !dataRitorno) {
    alert("Seleziona date di partenza e ritorno.");
    return false;
  }

  // ✅ Verifica che la durata sia nei limiti del pacchetto
  const pacchettoSelezionato = document.querySelector('#pacchetto option:checked');
  const minNotti = parseInt(pacchettoSelezionato.dataset.min);
  const maxNotti = parseInt(pacchettoSelezionato.dataset.max);

  const startDate = new Date(dataPartenza);
  const endDate = new Date(dataRitorno);
  const diffTime = endDate - startDate;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  if (isNaN(diffDays) || diffDays < minNotti || diffDays > maxNotti) {
    alert(`La durata del viaggio deve essere tra ${minNotti} e ${maxNotti} notti per il pacchetto selezionato.`);
    return false;
  }

  if (!tipologiaGruppo || !fasciaPrezzo || !trasporto || !connettivita) {
    alert("Compila tutte le selezioni obbligatorie.");
    return false;
  }

  if (isNaN(partecipanti) || partecipanti <= 0) {
    alert("Devi indicare almeno 1 partecipante.");
    return false;
  }

  if (isNaN(adulti) || isNaN(bambini)) {
    alert("Devi indicare numero adulti e bambini.");
    return false;
  }

  if ((adulti + bambini) !== partecipanti) {
    errorePartecipanti.textContent = `Il totale adulti + bambini deve essere ${partecipanti}.`;
    return false;
  }

  if (!citta || citta.length === 0) {
    erroreCitta.textContent = "Devi selezionare almeno una città.";
    return false;
  }

  if (!consensoGDPR.checked) {
    alert("Devi acconsentire al trattamento dei dati personali per procedere.");
    return false;
  }

  return true;
}


