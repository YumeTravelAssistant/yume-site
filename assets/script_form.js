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
    "Kawaguchiko", "Hakone", "Nikko", "Miyajima", "Takayama",
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

function aggiornaCitta(pacchetto, durata) {
  const selectCitta = document.getElementById("citta");
  const msgMax = document.getElementById("maxCittaMsg");
  const msgErrore = document.getElementById("erroreCitta");
  const opzioni = cittaPerPacchetto[pacchetto] || [];

  // Pulisce il campo e lo riempie
  selectCitta.innerHTML = "";
  opzioni.forEach(citta => {
    const option = document.createElement("option");
    option.value = citta;
    option.textContent = citta;
    selectCitta.appendChild(option);
  });

  // Disattiva il campo se non è stata selezionata la durata
  selectCitta.disabled = !durata;

  // Reset messaggi
  msgErrore.textContent = "";
  msgMax.textContent = "";

  // Se durata non ancora disponibile (es. data non selezionata), esce
  if (!durata) return;

  // Calcolo massimo città selezionabili
  if (durata <= 8) maxCitta = 3;
  else if (durata <= 10) maxCitta = 4;
  else if (durata <= 15) maxCitta = 6;
  else maxCitta = 8;

  msgMax.textContent = `Puoi selezionare fino a ${maxCitta} città.`;

  // Gestore selezione città
  const nuovoSelectCitta = selectCitta.cloneNode(true);
  selectCitta.parentNode.replaceChild(nuovoSelectCitta, selectCitta);

  // Aggiungi il listener solo al nuovo elemento pulito
  nuovoSelectCitta.addEventListener("change", function () {
    const selezionate = Array.from(this.selectedOptions);
    if (selezionate.length > maxCitta) {
      selezionate[selezionate.length - 1].selected = false;
      msgErrore.textContent = `Attenzione: massimo ${maxCitta} città selezionabili.`;
    } else {
      msgErrore.textContent = "";
    }

    Array.from(this.options).forEach(opt => {
      opt.disabled = !opt.selected && selezionate.length >= maxCitta;
    });
  });
const counterCitta = document.getElementById("counterCitta");

nuovoSelectCitta.addEventListener("change", function () {
  const selezionate = Array.from(this.selectedOptions);

  // aggiorna il counter live
  counterCitta.textContent = `${selezionate.length} città selezionate su massimo ${maxCitta}`;

  if (selezionate.length > maxCitta) {
    selezionate[selezionate.length - 1].selected = false;
    msgErrore.textContent = `Attenzione: massimo ${maxCitta} città selezionabili.`;
  } else {
    msgErrore.textContent = "";
  }

  Array.from(this.options).forEach(opt => {
    opt.disabled = !opt.selected && selezionate.length >= maxCitta;
  });
});


}

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

document.getElementById('formPacchetto').addEventListener('submit', function (e) {
  e.preventDefault(); // blocca invio classico
  const feedback = document.getElementById('formFeedback');

  // 🔍 simulazione: se tutti i controlli sono rispettati, mostra successo
  if (validaForm()) {
    feedback.textContent = "Richiesta inviata con successo!";
    feedback.className = "form-feedback-msg success";
  } else {
    feedback.textContent = "Errore: verifica i campi obbligatori.";
    feedback.className = "form-feedback-msg error";
  }

  setTimeout(() => {
    feedback.className = "form-feedback-msg"; // reset dopo 5s
    feedback.textContent = "";
  }, 5000);
});

// Funzione placeholder da completare
function validaForm() {
  // qui puoi inserire controlli JS aggiuntivi se vuoi
  return true;
}

document.getElementById("formPacchetto").addEventListener("submit", function (e) {
  e.preventDefault();

  const form = new FormData(this);

  const riepilogo = `
    <h3>Conferma dati inseriti</h3>
    <ul>
      <li><strong>Nome:</strong> ${form.get("nome")}</li>
      <li><strong>Cognome:</strong> ${form.get("cognome")}</li>
      <li><strong>Email:</strong> ${form.get("email")}</li>
      <li><strong>Pacchetto:</strong> ${form.get("pacchetto")}</li>
      <li><strong>Data Partenza:</strong> ${form.get("dataPartenza")}</li>
      <li><strong>Data Ritorno:</strong> ${form.get("dataRitorno")}</li>
      <li><strong>Tipologia Gruppo:</strong> ${form.get("tipologiaGruppo")}</li>
      <li><strong>Dettagli Gruppo:</strong> ${form.get("dettagliGruppo") || "Nessuno"}</li>
      <li><strong>Partecipanti:</strong> ${form.get("partecipanti")}</li>
      <li><strong>Adulti:</strong> ${form.get("adulti")}</li>
      <li><strong>Bambini:</strong> ${form.get("bambini")}</li>
      <li><strong>Fascia Prezzo:</strong> ${form.get("fasciaPrezzo")}</li>
      <li><strong>Trasporto:</strong> ${form.get("trasporto")}</li>
      <li><strong>Connettività:</strong> ${form.get("connettivita")}</li>
      <li><strong>Città:</strong> ${(form.getAll("citta[]") || []).join(", ")}</li>
      <li><strong>Camere:</strong> ${[...document.querySelectorAll('.camera-box')].map(box => {
        const tipo = box.querySelector(".tipo-camera")?.value || "";
        const ospiti = box.querySelector(".ospiti-camera")?.value || "";
        return `${tipo} x ${ospiti}`;
      }).join(" / ")}</li>
      <li><strong>Richieste Aggiuntive:</strong> ${form.get("richieste") || "Nessuna"}</li>
    </ul>
    <p>Vuoi confermare e inviare la richiesta?</p>
  `;

  const modal = document.createElement("div");
  modal.classList.add("riepilogo-modal");
  modal.innerHTML = `
    <div class="riepilogo-modal">
      <div class="riepilogo-content">
        ${riepilogo}
        <div class="riepilogo-buttons">
          <button id="confermaInvio" class="modern-btn conferma-btn">Conferma</button>
          <button id="annullaInvio" class="modern-btn annulla-btn">Annulla</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById("confermaInvio").addEventListener("click", () => {
    document.body.removeChild(modal);

    const dati = {
      nome: form.get("nome"),
      cognome: form.get("cognome"),
      email: form.get("email"),
      pacchetto: form.get("pacchetto"),
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
     camere: [...document.querySelectorAll('.camera-box')].map(box => {
       const tipo = box.querySelector(".tipo-camera")?.selectedOptions[0]?.text || "";
       const ospiti = box.querySelector(".ospiti-camera")?.value || "";
       return `${tipo} x ${ospiti}`;
     }),

      richieste: form.get("richieste")
    };

    fetch("https://yume-sito-form.azurewebsites.net/api/invia-form", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dati)
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === "success") {
          alert("Richiesta inviata con successo!");
          document.getElementById("formPacchetto").reset();
          document.getElementById("counterCitta").textContent = "";
          document.getElementById("maxCittaMsg").textContent = "";
          document.getElementById("erroreCitta").textContent = "";
        } else {
          alert("Si è verificato un errore. Riprova.");
        }
      })
      .catch(error => {
        console.error("Errore:", error);
        alert("Errore di rete. Riprova più tardi.");
      });
  });

  document.getElementById("annullaInvio").addEventListener("click", () => {
    document.body.removeChild(modal);
  });
});

function validaForm() {
  const nome = document.getElementById("nome").value.trim();
  const cognome = document.getElementById("cognome").value.trim();
  const email = document.getElementById("email").value.trim();
  const confermaEmail = document.getElementById("confermaEmail").value.trim();
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

  const errorePartecipanti = document.getElementById("errorePartecipanti");
  const erroreCitta = document.getElementById("erroreCitta");
  errorePartecipanti.textContent = "";
  erroreCitta.textContent = "";

  // Controllo campi obbligatori
  if (!nome || !cognome || !email || !confermaEmail) {
    alert("Inserisci nome, cognome ed email.");
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

  return true;
}

