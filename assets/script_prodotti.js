let carrello = [];

function toggleCarrello() {
  document.getElementById("carrelloContainer").classList.toggle("hidden");
}

function aggiornaCarrelloUI() {
  const lista = document.getElementById("listaCarrello");
  const totale = document.getElementById("carrelloTotale");
  const badge = document.getElementById("cartCount");

  lista.innerHTML = "";
  let somma = 0;

  carrello.forEach((prodotto, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${prodotto.nome} – <strong>€${prodotto.prezzo.toFixed(2)}</strong>
      <button onclick="rimuoviDalCarrello(${index})" style="background:none;border:none;color:#8B2C2B;cursor:pointer;">×</button>
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
  sessionStorage.setItem("carrello", JSON.stringify(carrello)); // 🔁 salva
}

function rimuoviDalCarrello(index) {
  carrello.splice(index, 1);
  aggiornaCarrelloUI();
  sessionStorage.setItem("carrello", JSON.stringify(carrello)); // 🔁 aggiorna
}

function mostraConfermaAggiunta() {
  const btn = document.getElementById("toggleCarrelloBtn");
  btn.classList.add("pulse");
  setTimeout(() => btn.classList.remove("pulse"), 600);
}

function vaiAllaCassa() {
  if (carrello.length === 0) {
    alert("Il carrello è vuoto.");
    return;
  }

  sessionStorage.setItem("carrello", JSON.stringify(carrello)); // ✅ uniformato
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
function vaiAlStep3() {
  const tipoCliente = document.getElementById("cliente_tipo")?.value || "";
  if (!tipoCliente) return alert("Seleziona una tipologia di cliente.");

  const riepilogo = document.getElementById("riepilogo");
  if (!riepilogo) return;
  riepilogo.innerHTML = "";

  // Mostra prodotti nel riepilogo
  const carrello = JSON.parse(sessionStorage.getItem("carrello")) || [];
  carrello.forEach(p => {
    riepilogo.innerHTML += `<li><strong>Prodotto:</strong> ${p.nome} - €${p.prezzo.toFixed(2)}</li>`;
  });

  // Sezione cliente
  if (tipoCliente === "privato") {
    riepilogo.innerHTML += `<li><strong>Nome:</strong> ${document.getElementById("nome").value}</li>`;
    riepilogo.innerHTML += `<li><strong>Email:</strong> ${document.getElementById("email").value}</li>`;
  } else if (tipoCliente === "azienda") {
    riepilogo.innerHTML += `<li><strong>Ragione Sociale:</strong> ${document.getElementById("ragione_sociale").value}</li>`;
    riepilogo.innerHTML += `<li><strong>Email:</strong> ${document.getElementById("email_azienda").value}</li>`;
  }
  mostraStep(3);
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
      sessionStorage.setItem("profiloUtente", JSON.stringify(data));
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
    document.getElementById("confermaEmail").value = profilo.email || "";
    document.getElementById("nome").readOnly = true;
    document.getElementById("cognome").readOnly = true;
    document.getElementById("email").readOnly = true;
    document.getElementById("confermaEmail").readOnly = true;
  } else if (tipo === "azienda") {
    document.getElementById("referente_nome").value = profilo.nome || "";
    document.getElementById("referente_cognome").value = profilo.cognome || "";
    document.getElementById("email_azienda").value = profilo.email || "";
    document.getElementById("confermaEmail_azienda").value = profilo.email || "";
    document.getElementById("referente_nome").readOnly = true;
    document.getElementById("referente_cognome").readOnly = true;
    document.getElementById("email_azienda").readOnly = true;
    document.getElementById("confermaEmail_azienda").readOnly = true;
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

async function effettuaAcquistoProdotto() {
  if (invioInCorso) return;
  invioInCorso = true;
  mostraSpinner();

  try {
    const carrello = JSON.parse(sessionStorage.getItem("carrello")) || [];
    if (!carrello.length) throw new Error("Carrello vuoto.");

    const lista_prodotti = carrello.map(p => `${p.nome} (€${p.prezzo})`).join(", ");
    const totale = carrello.reduce((sum, p) => sum + p.prezzo, 0);

    const tipoCliente = document.getElementById("cliente_tipo").value;
    const dati = {
      tipoRichiesta: "ordineProdotto",
      cliente_tipo: tipoCliente,
      lista_prodotti
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

