
(function () {
  "use strict";

  const WHATSAPP_NUMBER = "393703081341";

  function getStoredFirstName() {
    try {
      const sessionProfile = JSON.parse(sessionStorage.getItem("profiloUtente") || "null");
      const localProfile = JSON.parse(localStorage.getItem("profiloUtente") || "null");
      const profile = sessionProfile?.profilo || sessionProfile || localProfile?.profilo || localProfile;
      return String(profile?.nome || profile?.Nome || "").trim();
    } catch {
      return "";
    }
  }

  function defaultWhatsAppMessage() {
    const firstName = getStoredFirstName();
    const introduction = firstName ? `Ciao Yume, sono ${firstName}.` : "Ciao Yume!";
    return `${introduction}\nSto leggendo il vostro Journal e vorrei chiedervi un chiarimento sul Giappone o sui vostri viaggi.`;
  }

  function openWhatsApp(phone, text) {
    const encoded = encodeURIComponent(text);
    const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (mobile) {
      window.location.href = `whatsapp://send?phone=${phone}&text=${encoded}`;
      window.setTimeout(() => {
        window.open(`https://wa.me/${phone}?text=${encoded}`, "_blank", "noopener");
      }, 800);
      return;
    }

    window.open(`https://wa.me/${phone}?text=${encoded}`, "_blank", "noopener");
  }

  function initialiseWhatsApp() {
    const avatar = document.getElementById("wa-chat-avatar");
    const overlay = document.getElementById("waMiniChat");
    const box = document.getElementById("wa-chatbox");
    const closeButton = box?.querySelector(".wa-close");
    const sendButton = document.getElementById("waSendBtn");
    const message = document.getElementById("waMessage");
    const includeLink = document.getElementById("waIncludeLink");

    if (!avatar || !overlay || !box || !sendButton || !message) return;

    function setOpen(open) {
      overlay.classList.toggle("hidden", !open);
      overlay.setAttribute("aria-hidden", open ? "false" : "true");
      if (open) {
        if (!message.value.trim()) message.value = defaultWhatsAppMessage();
        window.setTimeout(() => message.focus(), 40);
      }
    }

    function toggle() {
      setOpen(overlay.classList.contains("hidden"));
    }

    function send() {
      let payload = message.value.trim() || defaultWhatsAppMessage();
      if (includeLink?.checked) payload += `\n\nLink: ${window.location.href}`;
      openWhatsApp(WHATSAPP_NUMBER, payload);
      setOpen(false);
    }

    avatar.addEventListener("click", toggle);
    avatar.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggle();
      }
    });
    closeButton?.addEventListener("click", () => setOpen(false));
    sendButton.addEventListener("click", send);
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) setOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !overlay.classList.contains("hidden")) setOpen(false);
    });
  }

  function initialisePersonalArea() {
    let loggedIn = false;
    try {
      loggedIn = Boolean(JSON.parse(sessionStorage.getItem("profiloUtente") || "null"));
    } catch {
      loggedIn = false;
    }

    document.querySelectorAll("[data-personal-area-link]").forEach((link) => {
      link.setAttribute("href", loggedIn ? "/area-clienti.html" : "/log-in.html");
    });

    if (!loggedIn) {
      document.getElementById("toggleNotificheBtn")?.classList.add("hidden");
    }
  }

  function initialiseYukiKeyboard() {
    const avatar = document.getElementById("yuki-chat-avatar");
    const input = document.getElementById("userMessage");

    avatar?.addEventListener("keydown", (event) => {
      if ((event.key === "Enter" || event.key === " ") && typeof window.toggleYukiChat === "function") {
        event.preventDefault();
        window.toggleYukiChat();
      }
    });

    input?.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey && typeof window.sendMessage === "function") {
        event.preventDefault();
        window.sendMessage();
      }
    });
  }

  function fixCheckoutRoute() {
    window.vaiAllaCassa = function () {
      const cart = JSON.parse(sessionStorage.getItem("carrello") || "[]");
      if (!Array.isArray(cart) || cart.length === 0) {
        window.alert("Il carrello è vuoto.");
        return;
      }
      window.location.href = "/acquista-prodotti.html";
    };
  }

  document.addEventListener("DOMContentLoaded", () => {
    initialiseWhatsApp();
    initialisePersonalArea();
    initialiseYukiKeyboard();
    fixCheckoutRoute();
  });
})();
