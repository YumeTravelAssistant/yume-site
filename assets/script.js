function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const hamburger = document.querySelector('.hamburger');

  sidebar.classList.add('active');
  hamburger.style.display = 'none';

  document.addEventListener("click", function handleClickOutside(event) {
    if (!sidebar.contains(event.target) && !hamburger.contains(event.target)) {
      sidebar.classList.remove('active');
      hamburger.style.display = 'block';
      document.removeEventListener("click", handleClickOutside);
    }
  });

  const links = sidebar.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      sidebar.classList.remove('active');
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

