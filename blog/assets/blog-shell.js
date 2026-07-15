(function () {
  "use strict";
  const sidebar = document.getElementById("sidebar");
  const hamburger = document.querySelector(".hamburger");

  window.toggleSidebar = function () {
    if (!sidebar || !hamburger) return;
    sidebar.classList.remove("hidden");
    requestAnimationFrame(() => sidebar.classList.add("active"));
    hamburger.style.visibility = "hidden";
  };

  document.addEventListener("click", (event) => {
    if (!sidebar || !hamburger || !sidebar.classList.contains("active")) return;
    if (sidebar.contains(event.target) || hamburger.contains(event.target)) return;
    sidebar.classList.remove("active");
    window.setTimeout(() => sidebar.classList.add("hidden"), 320);
    hamburger.style.visibility = "visible";
  });
})();
