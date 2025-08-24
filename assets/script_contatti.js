// assets/script_contatti.js

// --- CONTATTI ---
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contatti-form");
  if (!form) return;

  const stato = document.getElementById("stato-form");
  const ENDPOINT = "https://yume-sito-form.azurewebsites.net/api/invia-form";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // ✅ GDPR obbligatorio (checkbox in index.html)
    const cbox = document.getElementById("consensoGDPR_contatti");
    if (!cbox || cbox.checked !== true) {
      stato.textContent = "Devi acconsentire al trattamento dei dati personali per procedere.";
      return;
    }

    stato.textContent = "Invio in corso…";

    const interessi = Array.from(
      form.querySelectorAll('input[name="interessi"]:checked')
    ).map(i => i.value);

    const dati = {
      // routing
      tipoRichiesta: "contatti",

      // payload business
      nome: form.nome.value.trim(),
      email: form.email.value.trim(),
      interessi,
      messaggio: (form.messaggio?.value || form.msg?.value || "").trim(),

      // honeypot
      website: form.website ? form.website.value : "",

      // ✅ campi consenso privacy → Supabase
      consensoGDPR: true,
      policy_key: "privacy",
      policy_version: "v1.0-2025-08-19",
      gdpr_url: "https://yume-travel.com/privacy.html",

      // contesto utile
      referrer: document.referrer || null,
      lang: document.documentElement.lang || "it"
      // ip + userAgent li aggiunge il proxy Azure
    };

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dati)
      });

      let data, raw;
      try { data = await response.json(); } catch { raw = await response.text(); }

      const success = data ? (data.ok === true || data.status === "success") : false;

      if (response.ok && success) {
        stato.textContent = "Richiesta inviata con successo!";
        form.reset();
      } else {
        const msg = (data && (data.error || data.message)) || raw || "Si è verificato un errore. Riprova.";
        stato.textContent = msg;
      }
    } catch (err) {
      console.error("Errore rete:", err);
      stato.textContent = "Errore di rete. Riprova più tardi.";
    } finally {
      btn.disabled = false;
    }
  });
});

// --- NEWSLETTER ---
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("newsletter-form");
  if (!form) return;

  const stato = document.getElementById("newsletter-stato");
  const ENDPOINT = "https://yume-sito-form.azurewebsites.net/api/invia-form";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // ✅ consenso newsletter separato (checkbox in index.html)
    const cbox = document.getElementById("consensoGDPR_newsletter");
    if (!cbox || cbox.checked !== true) {
      stato.textContent = "Per iscriverti devi acconsentire a ricevere la newsletter.";
      return;
    }

    stato.textContent = "Iscrizione in corso…";

    const dati = {
      // routing
      tipoRichiesta: "newsletter",

      // payload business
      email: (form.email?.value || document.getElementById("newsletter-email")?.value || "").trim(),

      // honeypot
      website: form.website ? form.website.value : "",

      // ✅ campi consenso newsletter → Supabase
      newsletterConsent: true,
      policy_key: "newsletter",
      policy_version: "v1.0-2025-08-19",
      gdpr_url: "https://yellow-bay-077dd2b03.6.azurestaticapps.net/privacy.html",

      // contesto utile
      referrer: document.referrer || null,
      lang: document.documentElement.lang || "it"
      // ip + userAgent li aggiunge il proxy Azure
    };

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dati)
      });

      let data, raw;
      try { data = await response.json(); } catch { raw = await response.text(); }

      const success = data ? (data.ok === true || data.status === "success") : false;

      if (response.ok && success) {
        stato.textContent = "Iscrizione completata!";
        form.reset();
      } else {
        const msg = (data && (data.error || data.message)) || raw || "Si è verificato un errore. Riprova.";
        stato.textContent = msg;
      }
    } catch (err) {
      console.error("Errore rete:", err);
      stato.textContent = "Errore di rete. Riprova più tardi.";
    } finally {
      btn.disabled = false;
    }
  });
});

