// assets/script_maison.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("maison-form");
  if (!form) return;

  const stato = document.getElementById("maison-stato");
  const ENDPOINT = "https://yume-sito-form.azurewebsites.net/api/invia-form";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // ✅ GDPR obbligatorio
    const consenso = document.getElementById("consensoGDPR");
    if (!consenso || consenso.checked !== true) {
      stato.textContent = "Devi acconsentire al trattamento dei dati personali per procedere.";
      return;
    }

    stato.textContent = "Invio in corso…";

    const dati = {
      // routing
      tipoRichiesta: "maison",

      // payload "business"
      nome: form.nome.value.trim(),
      email: form.email.value.trim(),
      viaggio: form.viaggio.value,
      messaggio: form.messaggio.value.trim(),

      // honeypot
      website: form.website ? form.website.value : "",

      // ✅ campi consenso privacy → Supabase
      consensoGDPR: true,
      policy_key: "privacy",
      policy_version: "v1.0-2025-08-19",
      gdpr_url: "https://yume-travel.com/privacy.html",

      // contesto utile (non PII sensibile)
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
        stato.textContent = "Richiesta inviata! Ti risponderemo a breve.";
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

