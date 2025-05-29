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

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    } else {
      entry.target.classList.remove('visible');
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

// ✅ Attiva visibilità frecce dinamiche
document.addEventListener('DOMContentLoaded', () => {
  updateSliderArrowVisibility('partiSlider', '.parti-con-noi-section .slider-arrow.left', '.parti-con-noi-section .slider-arrow.right');
  updateSliderArrowVisibility('bestsellerSlider', '.bestseller-section .slider-arrow.left', '.bestseller-section .slider-arrow.right');
});

