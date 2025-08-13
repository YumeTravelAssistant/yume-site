// assets/script_contatti.js

// --- CONTATTI (già esistente) ---
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contatti-form");
  if (!form) return;

  const stato = document.getElementById("stato-form");
  const ENDPOINT = "https://yume-sito-form.azurewebsites.net/api/invia-form";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    stato.textContent = "Invio in corso…";

    const interessi = Array.from(
      form.querySelectorAll('input[name="interessi"]:checked')
    ).map(i => i.value);

    const dati = {
      tipoRichiesta: "contatti",
      nome: form.nome.value.trim(),
      email: form.email.value.trim(),
      interessi,
      messaggio: form.messaggio.value.trim(),
      website: form.website ? form.website.value : "" // honeypot
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

// --- NEWSLETTER (nuovo) ---
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("newsletter-form");
  if (!form) return;

  const stato = document.getElementById("newsletter-stato");
  const ENDPOINT = "https://yume-sito-form.azurewebsites.net/api/invia-form";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    stato.textContent = "Iscrizione in corso…";

    const dati = {
      tipoRichiesta: "newsletter",
      email: form.email.value.trim(),
      website: form.website ? form.website.value : "" // honeypot
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
        stato.textContent = "Iscrizione completata! Controlla la tua email (se prevista).";
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

