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
  updateSliderArrowVisibility('partiSlider', '.parti-con-noi-section .slider-arrow.left', '.parti-con-noi-section .slider-arrow.right');
  updateSliderArrowVisibility('bestsellerSlider', '.bestseller-section .slider-arrow.left', '.bestseller-section .slider-arrow.right');
  updateSliderArrowVisibility('sartoriaSlider', '.sartoria-slider-wrapper .slider-arrow.left', '.sartoria-slider-wrapper .slider-arrow.right');


document.addEventListener('DOMContentLoaded', () => {
  sliderIds.forEach(id => {
    filtriInput[id] = document.getElementById(`filtro-${id}`);
  });
});

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
    scores: { natura: 6, spiritualita: 4, shopping: 6, gastronomia: 5, citylife: 7, collezionismo: 5, relax: 5, cultura: 6, esperienze: 6, avventura: 5 }
  },
  {
    id: 'tetsugaku',
    scores: { natura: 5, spiritualita: 9, shopping: 2, gastronomia: 6, citylife: 3, collezionismo: 4, relax: 7, cultura: 10, esperienze: 8, avventura: 3 }
  },
  {
    id: 'shizen',
    scores: { natura: 10, spiritualita: 6, shopping: 2, gastronomia: 4, citylife: 2, collezionismo: 3, relax: 8, cultura: 7, esperienze: 6, avventura: 6 }
  },
  {
    id: 'kodai',
    scores: { natura: 5, spiritualita: 8, shopping: 3, gastronomia: 8, citylife: 5, collezionismo: 4, relax: 6, cultura: 9, esperienze: 6, avventura: 4 }
  },
  {
    id: 'kataware',
    scores: { natura: 7, spiritualita: 7, shopping: 2, gastronomia: 7, citylife: 3, collezionismo: 3, relax: 10, cultura: 7, esperienze: 9, avventura: 2 }
  },
  {
    id: 'hagane',
    scores: { natura: 6, spiritualita: 6, shopping: 7, gastronomia: 7, citylife: 9, collezionismo: 6, relax: 5, cultura: 7, esperienze: 6, avventura: 5 }
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

