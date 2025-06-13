async function generaSHA256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
async function sha256(msg) {
  const buffer = new TextEncoder().encode(msg);
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
}

let yukiWelcomeShown = false;

function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const hamburger = document.querySelector('.hamburger');

  sidebar.classList.remove('hidden'); // 👈 AGGIUNTA QUESTA
  sidebar.classList.add('active');
  hamburger.style.display = 'none';

  document.addEventListener("click", function handleClickOutside(event) {
    if (!sidebar.contains(event.target) && !hamburger.contains(event.target)) {
      sidebar.classList.remove('active');
      sidebar.classList.add('hidden'); // 👈 AGGIUNTA QUESTA
      hamburger.style.display = 'block';
      document.removeEventListener("click", handleClickOutside);
    }
  });

  const links = sidebar.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      sidebar.classList.remove('active');
      sidebar.classList.add('hidden'); // 👈 AGGIUNTA QUESTA
      hamburger.style.display = 'block';
    });
  });
}


// ✅ Attiva Select2 solo se jQuery e il plugin sono presenti
if (typeof $ !== "undefined" && typeof $.fn.select2 !== "undefined") {
  $(function () {
    $('select').select2({
      placeholder: "Seleziona un'opzione...",
      allowClear: true,
      width: '100%'
    });
  });
}

// ✅ Attiva roundSlider solo se jQuery e il plugin sono presenti
if (typeof $ !== "undefined" && typeof $.fn.roundSlider !== "undefined") {
  $(function () {
    console.log("Inizializzo i cursori circolari (roundSlider)"); // DEBUG
    inizializzaKnobQuandoVisibili();
  });
}


// 🔽 NAVBAR dinamica: hide on scroll down, show on scroll up
let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener("scroll", function () {
  const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
  if (currentScroll > lastScrollTop && currentScroll > 100) {
    navbar.classList.add("hidden");
  } else {
    navbar.classList.remove("hidden");
  }
  lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
});

// 🎬 Slide-in title when in viewport
const animatedElements = document.querySelectorAll('.slide-in, .slide-left, .slide-right, .fade-text');

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target); // ✅ osserva solo la prima volta
    }
  });
}, { threshold: 0.2 });

animatedElements.forEach(el => observer.observe(el));

// 🎥 Effetto scroll sul video background
const video = document.getElementById('missionVideo');
let ticking = false;

function updateVideoPosition() {
  const scrollPosition = window.scrollY;
  const speedFactor = 0.05; // 📐 controlla quanto si muove
  const translateY = scrollPosition * speedFactor;

  if (video) {
    video.style.transform = `translateY(${translateY}px)`;
  }
  ticking = false;
}

const heroImg = document.querySelector('.hero-banner-img');

function updateHeroPosition() {
  const scrollPosition = window.scrollY;
  const parallaxFactor = 0.15;
  const translateY = scrollPosition * parallaxFactor;

  if (heroImg) {
    heroImg.style.transform = `translateY(${translateY}px)`;
  }
  ticking = false;
}


window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      updateVideoPosition();   // già esistente
      updateHeroPosition();    // nuova funzione
    });
    ticking = true;
  }
});

// 🎯 Parti con Noi – slider frecce + puntini
let currentSlide = 0;
const slider = document.getElementById('partiSlider');
const boxes = slider?.querySelectorAll('.parti-box') || [];
const dotsContainer = document.getElementById('sliderDots');

function scrollPartiSlider(direction) {
  if (!slider || boxes.length === 0) return;

  const maxSlide = boxes.length - 1;
  currentSlide = Math.max(0, Math.min(currentSlide + direction, maxSlide));
  const boxWidth = boxes[0].offsetWidth + 30; // 30px è il gap tra box
  slider.scrollTo({
    left: currentSlide * boxWidth,
    behavior: 'smooth'
  });
  updateDots();
}

function updateDots() {
  if (!dotsContainer) return;
  dotsContainer.innerHTML = '';
  boxes.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.classList.toggle('active', i === currentSlide);
    dotsContainer.appendChild(dot);
  });
}

// Inizializza i puntini solo su tablet/slider
document.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth >= 769 && window.innerWidth <= 1399) {
    updateDots();
  }
});

function scrollBestsellerSlider(direction) {
  const container = document.getElementById('bestsellerSlider');
  if (!container) return;
  const box = container.querySelector('.bestseller-box');
  if (!box) return;

  const boxWidth = box.offsetWidth + 30; // incluso gap
  container.scrollBy({
    left: direction * boxWidth,
    behavior: 'smooth'
  });
}

function scrollToMain() {
  const mainWrapper = document.querySelector('.main-wrapper');
  if (mainWrapper) {
    mainWrapper.scrollIntoView({ behavior: 'smooth' });
  }
}

function updateSliderArrowVisibility(containerId, leftSelector, rightSelector) {
  const container = document.getElementById(containerId);
  const leftArrow = document.querySelector(leftSelector);
  const rightArrow = document.querySelector(rightSelector);

  if (!container || !leftArrow || !rightArrow) return;

  function checkVisibility() {
    if (window.innerWidth < 770 || window.innerWidth > 1399) {
      leftArrow.style.display = 'none';
      rightArrow.style.display = 'none';
      return;
    }

    const scrollLeft = container.scrollLeft;
    const maxScrollLeft = container.scrollWidth - container.clientWidth;

    leftArrow.style.display = scrollLeft > 10 ? 'block' : 'none';
    rightArrow.style.display = scrollLeft < maxScrollLeft - 10 ? 'block' : 'none';
  }

  container.addEventListener('scroll', checkVisibility);
  window.addEventListener('resize', checkVisibility);
  window.addEventListener('load', checkVisibility);
  checkVisibility();
}

const sliderIds = [
  'natura', 'spiritualita', 'shopping', 'gastronomia',
  'citylife', 'collezionismo', 'relax', 'cultura',
  'esperienze', 'avventura'
];

const filtriInput = {};

// ✅ Attiva visibilità frecce dinamiche
document.addEventListener('DOMContentLoaded', () => {
  // 1. Frecce dinamiche slider
  updateSliderArrowVisibility('partiSlider', '.parti-con-noi-section .slider-arrow.left', '.parti-con-noi-section .slider-arrow.right');
  updateSliderArrowVisibility('bestsellerSlider', '.bestseller-section .slider-arrow.left', '.bestseller-section .slider-arrow.right');
  updateSliderArrowVisibility('sartoriaSlider', '.sartoria-slider-wrapper .slider-arrow.left', '.sartoria-slider-wrapper .slider-arrow.right');

  // 2. Filtri input (slider knob)
  if (typeof sliderIds !== "undefined") {
    sliderIds.forEach(id => {
      filtriInput[id] = document.getElementById(`filtro-${id}`);
    });
  }

  // 3. Registrazione
  const formRegistrazione = document.getElementById("formRegistrazione");
  if (formRegistrazione) {
    formRegistrazione.addEventListener("submit", e => {
      e.preventDefault();
      inviaRegistrazione();
    });
  }

  // 4. Login
  const formLogin = document.getElementById("formLogin");
  if (formLogin) {
    formLogin.addEventListener("submit", e => {
      e.preventDefault();
      verificaLogin();
    });
  }

  // 5. Richiesta consulenza
  const formConsulenza = document.getElementById("formConsulenza");
  if (formConsulenza) {
    formConsulenza.addEventListener("submit", e => {
      e.preventDefault();
      inviaRichiestaConsulenza();
    });
  }

  // 5bis. Caricamento anteprima notifiche (campanella)
  caricaAnteprimaNotifiche();

  // 6. Area Clienti – caricamento profilo se presente
  if (window.location.pathname.includes("area-clienti")) {
    getProfiloCliente();     // recupera dati da Sheets via codice cliente salvato
    caricaMessaggi();        // recupera i messaggi da Sheets e li mostra
    caricaPDFCliente();      // ✅ recupera PDF personalizzati da Sheets
  }

// 7. Aggiorna profilo, se bottone esiste
const formProfilo = document.getElementById("formProfilo");
if (formProfilo) {

  // Submit del form
  formProfilo.addEventListener("submit", e => {
    e.preventDefault();
    aggiornaProfiloCliente();
  });

  // 🔓 Pulsante per abilitare la modifica dei dati anagrafici
  const btn = document.getElementById("btnModificaProfilo");
  if (btn) {
    btn.addEventListener("click", () => {
      ["nome", "cognome", "email"].forEach(id => {
        const campo = document.getElementById(id);
        if (campo) campo.readOnly = false;
      });
      btn.disabled = true; // facoltativo: disattiva il pulsante per evitare ri-click
    });
  }
}
 
  // 8. Area Operatori – carica richieste e abilita form risposta
  if (window.location.pathname.includes("area-operatori")) {
    caricaRichiesteOperatori();  // carica da richieste_consulenza

    const formRisposta = document.getElementById("formRispostaOperatore");
    if (formRisposta) {
      formRisposta.addEventListener("submit", e => {
        e.preventDefault();
        inviaRispostaOperatore();
      });
    }
  }
  // 9. Login Operatori
  const formLoginOperatore = document.getElementById("formLoginOperatore");
   if (formLoginOperatore) {
   formLoginOperatore.addEventListener("submit", e => {
     e.preventDefault();
     verificaLoginOperatore();
  });
}
   // 10. Profilo Operatore – gestione dati
if (window.location.pathname.includes("area-operatori")) {
  getProfiloOperatore(); // fetch da Sheets
  const formProfilo = document.getElementById("formProfiloOperatore");
  if (formProfilo) {
    formProfilo.addEventListener("submit", e => {
      e.preventDefault();
      aggiornaProfiloOperatore();
    });
  }
}

});

// 🎯 Slider per sezione sartoria
function scrollSartoriaSlider(direction) {
  const container = document.getElementById('sartoriaSlider');
  if (!container) return;
  const box = container.querySelector('.sartoria-box');
  if (!box) return;

  const boxWidth = box.offsetWidth + 30; // incluso il gap
  container.scrollBy({
    left: direction * boxWidth,
    behavior: 'smooth'
  });
}


// 🎛️ FILTRI PERSONALIZZATI – Algoritmo dinamico su pacchetti
const pacchettiScoring = [
  {
    id: 'hajimete',
    scores: { natura: 7, spiritualita: 8, shopping: 8, gastronomia: 7, citylife: 9, collezionismo: 6, relax: 5, cultura: 6, esperienze: 6, avventura: 5 }
  },
  {
    id: 'tetsugaku',
    scores: { natura: 8, spiritualita: 9, shopping: 2, gastronomia: 7, citylife: 3, collezionismo: 4, relax: 7, cultura: 10, esperienze: 8, avventura: 3 }
  },
  {
    id: 'shizen',
    scores: { natura: 10, spiritualita: 8, shopping: 2, gastronomia: 6, citylife: 2, collezionismo: 3, relax: 7, cultura: 8, esperienze: 7, avventura: 7 }
  },
  {
    id: 'kodai',
    scores: { natura: 8, spiritualita: 8, shopping: 6, gastronomia: 9, citylife: 6, collezionismo: 4, relax: 6, cultura: 9, esperienze: 6, avventura: 6 }
  },
  {
    id: 'kataware',
    scores: { natura: 7, spiritualita: 7, shopping: 8, gastronomia: 8, citylife: 6, collezionismo: 3, relax: 10, cultura: 7, esperienze: 9, avventura: 2 }
  },
  {
    id: 'hagane',
    scores: { natura: 7, spiritualita: 6, shopping: 7, gastronomia: 7, citylife: 9, collezionismo: 6, relax: 5, cultura: 7, esperienze: 6, avventura: 5 }
  }
];

function calcolaDifferenzaScore(pacchetto, filtriUtente) {
  let diff = 0;
  for (let key in filtriUtente) {
    diff += Math.abs(pacchetto.scores[key] - filtriUtente[key]);
  }
  return diff;
}

function inizializzaKnobQuandoVisibili() {
  const containers = document.querySelectorAll('.knob-container');

  containers.forEach(container => {
    const label = container.getAttribute('data-label');
    const id = container.getAttribute('data-id');

    // Crea un div interno dove inserire il roundSlider
    const sliderDiv = document.createElement('div');
    sliderDiv.id = id;
    container.appendChild(sliderDiv);

    // Inizializza roundSlider
    $(`#${id}`).roundSlider({
      radius: 55,
      width: 8,
      min: 1,
      max: 10,
      step: 1,
      value: 5,
      handleSize: "+12",
      circleShape: "pie",
      startAngle: 315,
      sliderType: "min-range",
      editableTooltip: false,
      tooltipFormat: function(args) {
        return label + ": " + args.value;
      },
      drag: function () {},
      change: function () {}
    });
  }); // chiusura forEach
} // chiusura funzione inizializzaKnobQuandoVisibili


function aggiornaOrdinePacchetti() {
  const preferenze = {};
  sliderIds.forEach(id => {
     preferenze[id] = $(`#filtro-${id}`).data("roundSlider")?.getValue() || 5;

  });

  const pacchettiOrdinati = [...pacchettiScoring].sort((a, b) => {
    return calcolaDifferenzaScore(a, preferenze) - calcolaDifferenzaScore(b, preferenze);
  });

  const container = document.querySelector('.pacchetti-slider-container');
  if (!container) return;

  pacchettiOrdinati.forEach(p => {
    const el = document.getElementById(p.id);
    if (el) container.appendChild(el);
  });

  // 🔧 forza reflow del layout grid
  container.style.display = 'none';
  requestAnimationFrame(() => {
    container.style.display = '';
  });

  console.log("Ordinamento pacchetti aggiornato");
}


const bottoneInvia = document.getElementById('applicaFiltri');
if (bottoneInvia) {
  bottoneInvia.addEventListener('click', () => {
    aggiornaOrdinePacchetti();
  });
}


// 🎯 Info Utili – Toggle Apri/Chiudi
document.addEventListener("DOMContentLoaded", () => {
  const boxes = document.querySelectorAll(".info-box");

  boxes.forEach((box) => {
    const toggle = box.querySelector(".info-toggle");
    const content = box.querySelector(".info-content");

    // Stato iniziale: tutto chiuso
    content.style.maxHeight = null;

    toggle.addEventListener("click", () => {
      const isOpen = box.classList.contains("aperto");

      // Chiude tutti
      document.querySelectorAll(".info-box").forEach((b) => {
        b.classList.remove("aperto");
        b.querySelector(".info-content").style.maxHeight = null;
      });

      // Apre solo se era chiuso
      if (!isOpen) {
        box.classList.add("aperto");
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  });
});


// ✳️ Clic su voce dell’indice: scrolla e apre box corrispondente
document.querySelectorAll(".indice-lista a[href^='#']").forEach(link => {
  link.addEventListener("click", function (e) {
    e.preventDefault();

    const targetId = this.getAttribute("href").substring(1);
    const targetBox = document.getElementById(targetId);

    if (!targetBox) return;

    // Scrolla dolcemente
    targetBox.scrollIntoView({ behavior: "smooth", block: "start" });

    // Chiude tutti i box
    document.querySelectorAll(".info-box").forEach((b) => {
      b.classList.remove("aperto");
      b.querySelector(".info-content").style.maxHeight = null;
    });

    // Apre il box selezionato
    const content = targetBox.querySelector(".info-content");
    targetBox.classList.add("aperto");
    content.style.maxHeight = content.scrollHeight + "px";
  });
});


async function inviaRegistrazione() {
  const nome = document.getElementById("nome").value.trim();
  const cognome = document.getElementById("cognome").value.trim();
  const email = document.getElementById("email").value.trim();
  const confermaEmail = document.getElementById("confermaEmail").value.trim();
  const password = document.getElementById("password").value.trim();
  const confermaPassword = document.getElementById("confermaPassword").value.trim();
  const newsletter = document.getElementById("newsletter").checked;
  const privacy = document.getElementById("privacy").checked;
  const termini = document.getElementById("termini").checked;
  const output = document.getElementById("esitoRegistrazione");

  output.textContent = "";

  // Validazioni
  if (email !== confermaEmail) {
    output.textContent = "  Le email non coincidono.";
    output.style.color = "red";
    return;
  }
  if (password !== confermaPassword) {
    output.textContent = "  Le password non coincidono.";
    output.style.color = "red";
    return;
  }
  if (!privacy || !termini) {
    output.textContent = "  Devi accettare privacy e termini.";
    output.style.color = "red";
    return;
  }

  // 👉 Hash della password
  const password_hash = await generaSHA256(password);

  // Invio al server
  fetch("https://yume-clienti.azurewebsites.net/api/invio-yume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tipoRichiesta: "registrazione",
      nome,
      cognome,
      email,
      password_hash,
      newsletter,
      privacy_accettata: privacy,
      termini_accettati: termini
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        output.textContent = "  Registrazione completata con successo!";
        output.style.color = "green";
        document.getElementById("formRegistrazione").reset();
      } else {
        output.textContent = "  Errore: " + (data.message || "Registrazione fallita.");
        output.style.color = "red";
      }
    })
    .catch(err => {
      console.error("Errore registrazione:", err);
      output.textContent = "  Errore di rete. Riprova.";
      output.style.color = "red";
    });
}

async function verificaLogin() {
  const identificatore = document.getElementById("emailLogin").value.trim();
  const password = document.getElementById("passwordLogin").value.trim();
  const output = document.getElementById("esitoLogin");

  output.textContent = "";

  if (!identificatore || !password) {
    output.textContent = "Inserisci email o codice cliente e password.";
    output.style.color = "red";
    return;
  }

  const password_hash = await sha256(password);

  fetch("https://yume-clienti.azurewebsites.net/api/invio-yume", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      tipoRichiesta: "login",
      identificatore,
      password_hash
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        output.textContent = "Accesso effettuato!";
        output.style.color = "green";
        localStorage.setItem("codice_cliente", data.codice_cliente);

        // ✅ AGGIUNGI QUESTA RIGA
        sessionStorage.setItem("profiloUtente", JSON.stringify(data));

        window.location.href = "area-clienti.html";
      } else {
        output.textContent = "Credenziali errate.";
        output.style.color = "red";
      }
    })
    .catch(err => {
      console.error("Errore login:", err);
      output.textContent = "Errore di rete. Riprova.";
      output.style.color = "red";
    });
}

async function inviaRecuperoPassword() {
  const email = prompt("Inserisci la tua email per ricevere una nuova password temporanea:");
  if (!email || !email.includes("@")) {
    alert("Inserisci un'email valida.");
    return;
  }

  try {
    const res = await fetch("https://yume-clienti.azurewebsites.net/api/invio-yume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipoRichiesta: "recupero_password",
        email
      })
    });

    const data = await res.json();

    if (data.status === "ok") {
      alert("✅ Ti abbiamo inviato una nuova password temporanea via email.");
    } else {
      alert("❌ Errore: " + (data.message || "Email non trovata."));
    }
  } catch (err) {
    console.error("Errore recupero password:", err);
    alert("Errore di rete. Riprova.");
  }
}


async function inviaRichiestaConsulenza() {
  const messaggio = document.getElementById("messaggio").value.trim();
  const esito = document.getElementById("esitoConsulenza");

  esito.textContent = "";

  // Recupera codice cliente da localStorage
  const codice_cliente = localStorage.getItem("codice_cliente");

  if (!codice_cliente) {
    esito.textContent = "⚠️ Sessione scaduta. Fai login di nuovo.";
    esito.style.color = "red";
    return;
  }

  if (!messaggio) {
    esito.textContent = "Inserisci un messaggio.";
    esito.style.color = "red";
    return;
  }

  try {
    const response = await fetch("https://yume-clienti.azurewebsites.net/api/invio-yume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipoRichiesta: "consulenza",
        codice_cliente,
        messaggio
      })
    });

    const result = await response.json();

    if (result.status === "ok") {
      esito.textContent = "✅ Richiesta inviata con successo!";
      esito.style.color = "green";
      document.getElementById("formConsulenza").reset();
    } else {
      esito.textContent = "❌ Errore: " + (result.message || "Impossibile inviare.");
      esito.style.color = "red";
    }
  } catch (error) {
    console.error("Errore rete:", error);
    esito.textContent = "❌ Errore di rete. Riprova.";
    esito.style.color = "red";
  }
}

async function getProfiloCliente() {
  const codice_cliente = localStorage.getItem("codice_cliente");
  if (!codice_cliente) {
    console.warn("Codice cliente non trovato nel localStorage");
    return;
  }

  try {
    const res = await fetch("https://yume-clienti.azurewebsites.net/api/invio-yume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipoRichiesta: "get",
        codice_cliente
      })
    });

    const data = await res.json();
    if (data.status === "ok" && data.profilo) {
      const profilo = data.profilo;
      sessionStorage.setItem("profiloUtente", JSON.stringify(profilo));

      for (const [chiave, valore] of Object.entries(profilo)) {
        const campo = document.getElementById(chiave);
        if (campo) {
          campo.value = valore;

          // 🔒 Blocca i campi nome, cognome ed email
          if (["nome", "cognome", "email"].includes(chiave)) {
            campo.readOnly = true;
          }
        }
      }
    } else {
      console.error("Errore nel recupero profilo:", data.message);
    }
  } catch (err) {
    console.error("Errore rete:", err);
  }
}

async function aggiornaProfiloCliente() {
  const codice_cliente = localStorage.getItem("codice_cliente");
  if (!codice_cliente) {
    alert("Sessione scaduta. Fai login di nuovo.");
    return;
  }

  const nome = document.getElementById("nome").value.trim();
  const cognome = document.getElementById("cognome").value.trim();
  const email = document.getElementById("email").value.trim();
  const passwordAttuale = document.getElementById("passwordAttuale").value.trim();
  const nuovaPassword = document.getElementById("nuovaPassword").value.trim();
  const confermaNuovaPassword = document.getElementById("confermaNuovaPassword").value.trim();

  const profilo = JSON.parse(sessionStorage.getItem("profiloUtente"));

  if (!nome || !cognome || !email) {
    alert("Compila tutti i campi del profilo.");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Inserisci un'email valida.");
    return;
  }

  // ⚠️ Conferme su cambi nome/email
  if (profilo) {
    if (nome !== profilo.nome || cognome !== profilo.cognome) {
      const confermaNome = confirm("✏️ Stai cambiando il tuo nome o cognome. Vuoi procedere?");
      if (!confermaNome) return;
    }

    if (email !== profilo.email) {
      const confermaEmail = confirm("📧 Stai cambiando l'email. Sei sicuro?");
      if (!confermaEmail) return;

      const checkEmail = await fetch("https://yume-clienti.azurewebsites.net/api/invio-yume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipoRichiesta: "verifica_email", email })
      });

      const result = await checkEmail.json();
      if (result.status === "trovata") {
        alert("⚠️ L'email è già registrata da un altro utente.");
        return;
      }
    }
  }

  const payload = {
    tipoRichiesta: "update",
    codice_cliente,
    nome,
    cognome,
    email
  };

  // 🔐 Cambio password
  if (passwordAttuale || nuovaPassword || confermaNuovaPassword) {
    if (!passwordAttuale || !nuovaPassword || !confermaNuovaPassword) {
      alert("Compila tutti i campi della sezione password.");
      return;
    }

    if (nuovaPassword !== confermaNuovaPassword) {
      alert("Le nuove password non coincidono.");
      return;
    }

    payload.password_attuale_hash = await generaSHA256(passwordAttuale);
    payload.nuova_password_hash = await generaSHA256(nuovaPassword);
  }

  try {
    const res = await fetch("https://yume-clienti.azurewebsites.net/api/invio-yume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.status === "ok") {
      alert("✅ Dati aggiornati con successo!");

      // 🔄 Ricarica dati aggiornati nel form
      await getProfiloCliente();

      // 🔒 Riblocca i campi nome, cognome, email
      ["nome", "cognome", "email"].forEach(id => {
        const campo = document.getElementById(id);
        if (campo) campo.readOnly = true;
      });

      // ♻️ Reset dei campi password
      ["passwordAttuale", "nuovaPassword", "confermaNuovaPassword"].forEach(id => {
        const campo = document.getElementById(id);
        if (campo) campo.value = "";
      });

    } else {
      alert("Errore: " + data.message);
    }

  } catch (err) {
    console.error("Errore rete:", err);
    alert("Errore di rete. Riprova.");
  }
}


function caricaMessaggi() {
  const codiceCliente = localStorage.getItem("codice_cliente");
  if (!codiceCliente) return;

  fetch("https://yume-clienti.azurewebsites.net/api/invio-yume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tipoRichiesta: "get_messaggi",
      codice_cliente: codiceCliente
    })
  })
    .then(res => res.json())
    .then(data => {
      const lista = document.getElementById("listaMessaggi");
      lista.innerHTML = "";

      if (data.status !== "ok" || !Array.isArray(data.messaggi) || data.messaggi.length === 0) {
        lista.innerHTML = "<li>Nessun messaggio trovato.</li>";
        return;
      }

      data.messaggi.forEach(m => {
        const li = document.createElement("li");
        li.className = "msg-item";

li.innerHTML = `
  <div class="msg-header">
    <strong>${m.da && m.da.toUpperCase() !== "CLIENTE" ? `👤 ${m.da}` : "🧍 Tu"}</strong>
    <small>${new Date(m.timestamp).toLocaleString()}</small>
  </div>
  <div class="msg-preview">${m.testo}</div>
  <button class="toggle-msg">Leggi tutto</button>
  <div class="reply-box hidden">
    <textarea rows="2" placeholder="Scrivi la tua risposta..."></textarea>
    <button class="send-reply">Invia</button>
  </div>
  <button class="reply-toggle">Rispondi</button>
`;

        lista.appendChild(li);
      });

      // Toggle messaggi
      lista.querySelectorAll(".toggle-msg").forEach(button => {
        button.addEventListener("click", () => {
          const li = button.closest(".msg-item");
          li.classList.toggle("expanded");
          button.textContent = li.classList.contains("expanded") ? "Chiudi" : "Leggi tutto";
        });
      });

      // Mostra il box di risposta
      lista.querySelectorAll(".reply-toggle").forEach(button => {
        button.addEventListener("click", () => {
          const box = button.previousElementSibling;
          box.classList.toggle("hidden");
        });
      });

      // Invia risposta
      lista.querySelectorAll(".send-reply").forEach(button => {
        button.addEventListener("click", () => {
          const textarea = button.previousElementSibling;
          const testo = textarea.value.trim();
          if (!testo) return;

          fetch("https://yume-clienti.azurewebsites.net/api/invio-yume", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tipoRichiesta: "risposta_cliente",
              codice_cliente: codiceCliente,
              messaggio: testo
            })
          }).then(res => res.json()).then(resp => {
            if (resp.status === "ok") {
              textarea.value = "";
              button.closest(".reply-box").classList.add("hidden");
              alert("Risposta inviata con successo.");
              caricaMessaggi();
            } else {
              alert("Errore nell'invio della risposta.");
            }
          });
        });
      });
    })
    .catch(error => {
      console.error("Errore nel caricamento messaggi:", error);
      const lista = document.getElementById("listaMessaggi");
      if (lista) lista.innerHTML = "<li>Errore nel recupero dei messaggi.</li>";
    });
}

function toggleNotifiche() {
  const box = document.getElementById("notificheContainer");
  box.classList.toggle("hidden");
}

function vaiASezioneMessaggi() {
  // Chiudi sempre il box delle notifiche
  const box = document.getElementById("notificheContainer");
  if (box) box.classList.add("hidden");

  // Poi reindirizza o scrolla
  if (window.location.pathname.includes("area-clienti.html")) {
    // Se già sulla pagina giusta, scrolla solo
    const target = document.getElementById("sezioneMessaggi");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  } else {
    // Altrimenti, vai alla sezione della pagina
    window.location.href = "area-clienti.html#sezioneMessaggi";
  }
}

function caricaAnteprimaNotifiche() {
  const profilo = sessionStorage.getItem("profiloUtente");
  if (!profilo) {
    document.getElementById("toggleNotificheBtn")?.classList.add("hidden");
    return;
  }

  const { email, codice } = JSON.parse(profilo);

  fetch("https://yume-clienti.azurewebsites.net/api/invio-yume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tipoRichiesta: "lettura_messaggi",
      codice // ✅ usa il codice cliente
    })
  })
  .then(res => res.json())
  .then(data => {
    const messaggi = (data.messaggi || []).filter(m => m.da?.toLowerCase() !== "cliente");
    const badge = document.getElementById("notifCount");
    const lista = document.getElementById("listaNotifiche");

    if (messaggi.length > 0) {
      badge.textContent = messaggi.length;
      badge.style.display = "inline-block";

      lista.innerHTML = "";
      messaggi.slice(0, 2).forEach(m => {
        const li = document.createElement("li");
        li.textContent = m.testo.length > 60 ? m.testo.slice(0, 60) + "..." : m.testo;
        lista.appendChild(li);
      });
    }
  })
  .catch(err => {
    console.warn("Errore nel caricamento notifiche:", err);
  });
}

// Chiude il pannello notifiche cliccando fuori
document.addEventListener("click", function (event) {
  const pannello = document.getElementById("notificheContainer");
  const bottone = document.getElementById("toggleNotificheBtn");

  // Se il click è fuori dal pannello e non è sulla campanella
  if (
    pannello && 
    !pannello.classList.contains("hidden") &&
    !pannello.contains(event.target) &&
    !bottone.contains(event.target)
  ) {
    pannello.classList.add("hidden");
  }
});


// 🔁 CARICA RICHIESTE CLIENTI (area operatori)
function caricaRichiesteOperatori() {
  const codiceOperatore = localStorage.getItem("codice_operatore");
  if (!codiceOperatore) return;

  fetch("https://yume-clienti.azurewebsites.net/api/invio-yume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tipoRichiesta: "listaConsulenze" })
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === "ok") {
        const lista = document.getElementById("listaRichieste");
        if (!lista) return;
        lista.innerHTML = "";

        data.consulenze.forEach(c => {
          const li = document.createElement("li");
          li.className = "msg-item";
          li.innerHTML = `
            <div class="msg-header">
              <strong>🧍 Cliente: ${c.codice_cliente}</strong>
              <small>${new Date(c.timestamp).toLocaleString()}</small>
            </div>
            <div class="msg-preview">${c.messaggio}</div>
            <button class="toggle-msg">Leggi tutto</button>
            <div class="reply-box hidden">
              <textarea rows="2" placeholder="Scrivi una risposta per il cliente..."></textarea>
              <button class="send-reply">Invia</button>
            </div>
            <button class="reply-toggle">Rispondi</button>
          `;
          lista.appendChild(li);

          // Attiva toggle per messaggio
          li.querySelector(".toggle-msg").addEventListener("click", () => {
            li.classList.toggle("expanded");
            const btn = li.querySelector(".toggle-msg");
            btn.textContent = li.classList.contains("expanded") ? "Chiudi" : "Leggi tutto";
          });

          // Toggle box risposta
          li.querySelector(".reply-toggle").addEventListener("click", () => {
            li.querySelector(".reply-box").classList.toggle("hidden");
          });

          // Invia risposta al cliente
          li.querySelector(".send-reply").addEventListener("click", () => {
            const messaggio = li.querySelector("textarea").value.trim();
            if (!messaggio) return;

            fetch("https://yume-clienti.azurewebsites.net/api/invio-yume", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                tipoRichiesta: "risposta",
                codice_cliente: c.codice_cliente,
                messaggio,
                operatore: codiceOperatore
              })
            })
              .then(res => res.json())
              .then(risposta => {
                if (risposta.status === "ok") {
                  li.querySelector("textarea").value = "";
                  alert("Risposta inviata con successo!");
                } else {
                  alert("Errore: " + risposta.message);
                }
              })
              .catch(err => {
                console.error("Errore invio risposta:", err);
                alert("Errore durante l'invio.");
              });
          });
        });
      }
    });
}


// ✉️ INVIA RISPOSTA CLIENTE
function inviaRispostaOperatore() {
  const codice = document.getElementById("codiceClienteRisposta").value.trim();
  const messaggio = document.getElementById("messaggioRisposta").value.trim();
  const operatore = localStorage.getItem("codice_operatore"); // oppure inserito manualmente

  if (!codice || !messaggio || !operatore) {
    alert("Compila tutti i campi!");
    return;
  }

  fetch("https://yume-clienti.azurewebsites.net/api/invio-yume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tipoRichiesta: "risposta",
      codice_cliente: codice,
      messaggio: messaggio,
      operatore: operatore
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === "ok") {
        alert("Risposta inviata con successo.");
        document.getElementById("messaggioRisposta").value = "";

      } else {
        alert("Errore: " + data.message);
      }
    })
    .catch(err => {
      console.error("Errore:", err);
      alert("Errore tecnico nell'invio della risposta.");
    });
}

async function verificaLoginOperatore() {
  const identificatore = document.getElementById("codiceOperatore").value.trim();
  const password = document.getElementById("passwordOperatore").value.trim();
  const output = document.getElementById("esitoLoginOperatore");
  output.textContent = "";

  if (!identificatore || !password) {
    output.textContent = "Inserisci codice operatore e password.";
    output.style.color = "red";
    return;
  }

  const password_hash = await sha256(password);

  fetch("https://yume-clienti.azurewebsites.net/api/invio-yume", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      tipoRichiesta: "login_operatore",
      identificatore,
      password_hash
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        output.textContent = "Accesso effettuato!";
        output.style.color = "green";
        localStorage.setItem("codice_operatore", data.codice_operatore);
        window.location.href = "area-operatori.html";
      } else {
        output.textContent = "Accesso negato. Verifica le credenziali.";
        output.style.color = "red";
      }
    })
    .catch(() => {
      output.textContent = "Errore di rete. Riprova.";
      output.style.color = "red";
    });
}

async function getProfiloOperatore() {
  const codice = localStorage.getItem("codice_operatore");
  const esito = document.getElementById("esitoPasswordOperatore");
  if (!codice) return;

  try {
    const res = await fetch("https://yume-clienti.azurewebsites.net/api/invio-yume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipoRichiesta: "get_operatore",
        codice_operatore: codice
      })
    });

    const result = await res.json();
    if (result.status === "ok") {
      const profilo = result.profilo;
      document.getElementById("nomeOperatore").value = profilo.nome || "";
      document.getElementById("cognomeOperatore").value = profilo.cognome || "";
      document.getElementById("emailOperatore").value = profilo.email || "";
    } else {
      esito.textContent = "Errore nel recupero del profilo.";
      esito.style.color = "red";
    }
  } catch (err) {
    console.error(err);
    esito.textContent = "Errore di connessione.";
    esito.style.color = "red";
  }
}

async function aggiornaProfiloOperatore() {
  const codice_operatore = localStorage.getItem("codice_operatore");
  const nome = document.getElementById("nome").value.trim();
  const cognome = document.getElementById("cognome").value.trim();
  const email = document.getElementById("email").value.trim();
  const password_attuale = document.getElementById("passwordAttuale").value.trim();
  const nuova_password = document.getElementById("nuovaPassword").value.trim();
  const conferma_password = document.getElementById("confermaPassword").value.trim();

  if (nuova_password && nuova_password !== conferma_password) {
    alert("Le nuove password non coincidono.");
    return;
  }

  const payload = {
    tipoRichiesta: "update_operatore",
    codice_operatore,
    nome,
    cognome,
    email
  };

  if (password_attuale || nuova_password || conferma_password) {
    if (!password_attuale || !nuova_password || !conferma_password) {
      alert("Compila tutti i campi della sezione password.");
      return;
    }

    payload.password_attuale_hash = await sha256(password_attuale);
    payload.password_hash = await sha256(nuova_password);
  }

  fetch("https://yume-clienti.azurewebsites.net/api/invio-yume", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === "ok") {
        alert("Profilo aggiornato correttamente.");
      } else {
        alert(data.message || "Errore durante l'aggiornamento.");
      }
    });
}

function caricaPDFCliente() {
  const codiceCliente = localStorage.getItem("codice_cliente");
  if (!codiceCliente) return;

  fetch("https://yume-clienti.azurewebsites.net/api/invio-yume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tipoRichiesta: "get_pdf_cliente",
      codice_cliente: codiceCliente
    })
  })
  .then(res => res.json())
  .then(data => {
    const lista = document.getElementById("listaPDF");
    if (!lista || data.status !== "ok") return;

    lista.innerHTML = data.pdf.length
      ? data.pdf.map(p => `<li><a href="${p.url}" target="_blank"><i class="fa fa-file-pdf-o"></i> ${p.nome}</a></li>`).join("")
      : "<li>Nessun documento disponibile.</li>";
  })
  .catch(() => {
    const lista = document.getElementById("listaPDF");
    if (lista) lista.innerHTML = "<li>Errore nel caricamento dei documenti.</li>";
  });
}

function toggleYukiChat() {
  const chatbox = document.getElementById("yuki-chatbox");
  const wasHidden = chatbox.classList.contains("hidden");
  chatbox.classList.toggle("hidden");

  if (wasHidden && !yukiWelcomeShown) {
    ricaricaConversazioneYuki(); // 👈 AGGIUNTA
    if (!localStorage.getItem("yukiChatHistory")) {
      appendMessage("Yuki", "Konnichiwa! Sono <strong>YUKI</strong>, la tua assistente virtuale. ✨<br>Come posso aiutarti?");
    }
    yukiWelcomeShown = true;
  }
}

// Chiude il chatbot YUKI cliccando fuori
// Chiude il chatbot YUKI cliccando fuori
document.addEventListener("click", function (event) {
  const chatbox = document.getElementById("yuki-chatbox");
  const toggleBtn = document.getElementById("yuki-chat-avatar"); // ✅ corretto

  if (
    chatbox &&
    !chatbox.classList.contains("hidden") &&
    !chatbox.contains(event.target) &&
    !event.target.closest("#yuki-chat-avatar")
  ) {
    chatbox.classList.add("hidden");
  }
});

function sendMessage() {
  const input = document.getElementById("userMessage");
  const message = input.value.trim();
  if (!message) return;

  appendMessage("Tu", message);
  input.value = "";

  fetch("https://yuki-chat.azurewebsites.net/api/invio-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domanda: message })
  })
    .then(res => res.json())
    .then(data => {
      appendMessage("Yuki", data.risposta || "Risposta non disponibile.");
    })
    .catch(err => {
      console.error("Errore chatbot:", err);
      appendMessage("Yuki", "Errore di rete. Riprova più tardi.");
    });
}

function appendMessage(sender, text) {
  const container = document.getElementById("chatbox-messages");
  const msg = document.createElement("div");
  msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
  msg.style.marginBottom = "10px";
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;

  // 🔄 Salva su localStorage
  const history = JSON.parse(localStorage.getItem("yukiChatHistory")) || [];
  history.push({ sender, text });
  localStorage.setItem("yukiChatHistory", JSON.stringify(history));
}

function ricaricaConversazioneYuki() {
  const history = JSON.parse(localStorage.getItem("yukiChatHistory")) || [];
  const container = document.getElementById("chatbox-messages");

  if (history.length === 0) return;

  history.forEach(msg => {
    const div = document.createElement("div");
    div.innerHTML = `<strong>${msg.sender}:</strong> ${msg.text}`;
    div.style.marginBottom = "10px";
    container.appendChild(div);
  });

  container.scrollTop = container.scrollHeight;
}

function toggleVisibility(id, btn) {
  const input = document.getElementById(id);
  const isHidden = input.type === "password";
  input.type = isHidden ? "text" : "password";
  btn.textContent = isHidden ? "Nascondi" : "Mostra";
}

function checkPasswordMatch() {
  const password = document.getElementById("password").value;
  const conferma = document.getElementById("confermaPassword").value;
  const msg = document.getElementById("passwordMatchMessage");

  if (!conferma) {
    msg.innerHTML = "";
    return;
  }

  if (password === conferma) {
    msg.innerHTML = `<i class="fas fa-check-circle icon-ok"></i> Le password coincidono`;
    msg.className = "password-message ok";
  } else {
    msg.innerHTML = `<i class="fas fa-times-circle icon-ko"></i> Le password non coincidono`;
    msg.className = "password-message ko";
  }
}

function checkEmailMatch() {
  const email = document.getElementById("email").value;
  const conferma = document.getElementById("confermaEmail").value;
  const msg = document.getElementById("emailMatchMessage");

  if (!conferma) {
    msg.innerHTML = "";
    return;
  }

  if (email === conferma) {
    msg.innerHTML = `<i class="fas fa-check-circle icon-ok"></i> Le email coincidono`;
    msg.className = "email-message ok";
  } else {
    msg.innerHTML = `<i class="fas fa-times-circle icon-ko"></i> Le email non coincidono`;
    msg.className = "email-message ko";
  }
}

function checkPasswordMatchAreaClienti() {
  const nuova = document.getElementById("nuovaPassword").value;
  const conferma = document.getElementById("confermaNuovaPassword").value;
  const msg = document.getElementById("passwordMatchMessageAC");

  if (!conferma) {
    msg.innerHTML = "";
    return;
  }

  if (nuova === conferma) {
    msg.innerHTML = `<i class="fas fa-check-circle icon-ok"></i> Le password coincidono`;
    msg.className = "password-message ok";
  } else {
    msg.innerHTML = `<i class="fas fa-times-circle icon-ko"></i> Le password non coincidono`;
    msg.className = "password-message ko";
  }
}

function checkPasswordMatchOperatore() {
  const nuova = document.getElementById("nuovaPasswordOperatore").value;
  const conferma = document.getElementById("confermaPasswordOperatore").value;
  const msg = document.getElementById("passwordMatchMessageOperatore");

  if (!conferma) {
    msg.innerHTML = "";
    return;
  }

  if (nuova === conferma) {
    msg.innerHTML = `<i class="fas fa-check-circle icon-ok"></i> Le password coincidono`;
    msg.className = "password-message ok";
  } else {
    msg.innerHTML = `<i class="fas fa-times-circle icon-ko"></i> Le password non coincidono`;
    msg.className = "password-message ko";
  }
}

//   Script GDPR cookie – Yume Travel Tech

function apriBannerCookie() {
  document.getElementById('cookie-banner').style.display = 'block';
}

function apriPreferenze() {
  const sessionId = localStorage.getItem('sessionId') || crypto.randomUUID();
  localStorage.setItem('sessionId', sessionId);

  fetch("https://yume-gdpr.azurewebsites.net/api/log-cookie", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tipoRichiesta: "get_cookie_consent",
      sessionId
    })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("cookie-analytics").checked = data.analytics === true;
      document.getElementById("cookie-marketing").checked = data.marketing === true;
      document.getElementById("cookie-banner").style.display = 'none';
      document.getElementById("cookie-preferenze").style.display = 'grid';
    })
    .catch(err => {
      console.warn("❌ Errore recupero preferenze:", err);
      document.getElementById("cookie-banner").style.display = 'none';
      document.getElementById("cookie-preferenze").style.display = 'grid';
    });
}

function accettaCookie() {
  const scelta = {
    analytics: true,
    marketing: true
  };
  localStorage.setItem('cookieConsent', JSON.stringify(scelta));
  document.getElementById('cookie-banner').style.display = 'none';
  caricaAnalytics();
  inviaConsensoCookie(scelta);
}

function rifiutaCookie() {
  const scelta = {
    analytics: false,
    marketing: false
  };
  localStorage.setItem('cookieConsent', JSON.stringify(scelta));
  document.getElementById('cookie-banner').style.display = 'none';
  inviaConsensoCookie(scelta);
}

function caricaAnalytics() {
  const script = document.createElement('script');
  script.src = "https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"; // <-- Sostituisci con il tuo ID GA4
  script.async = true;

  script.onload = function () {
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX'); // <-- Sostituisci anche qui
  };

  document.head.appendChild(script);
}

function inviaConsensoCookie({ analytics, marketing }) {
  const sessionId = localStorage.getItem('sessionId') || crypto.randomUUID();
  localStorage.setItem('sessionId', sessionId);

  fetch("https://yume-gdpr.azurewebsites.net/api/log-cookie", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId,
      analytics,
      marketing,
      page: window.location.pathname,
      userAgent: navigator.userAgent
    })
  }).catch((err) => console.warn("❌ Invio consenso fallito:", err));
}

window.addEventListener("DOMContentLoaded", () => {
  try {
    const scelta = JSON.parse(localStorage.getItem('cookieConsent') || 'null');
    if (scelta?.analytics === true) {
      caricaAnalytics();
    } else if (!scelta) {
      apriBannerCookie();
    }
  } catch (e) {
    apriBannerCookie();
  }

  const form = document.getElementById('cookie-preferenze-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const analytics = document.getElementById('cookie-analytics')?.checked || false;
      const marketing = document.getElementById('cookie-marketing')?.checked || false;

      const scelta = { analytics, marketing };
      localStorage.setItem('cookieConsent', JSON.stringify(scelta));
      document.getElementById('cookie-preferenze').style.display = 'none';

      if (analytics) caricaAnalytics();
      inviaConsensoCookie(scelta);
    });
  }
});

function scrollToMessaggi() {
  const sezione = document.getElementById("sezioneMessaggi");
  if (sezione) {
    sezione.scrollIntoView({ behavior: "smooth" });
    // ✅ Reset visuale dopo visualizzazione
    const badge = document.getElementById("badgeNotifiche");
    badge.textContent = "0";
    badge.style.display = "none";
  }
}

