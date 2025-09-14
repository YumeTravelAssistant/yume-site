// assets/script_invito.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("invito-form");
  if (!form) return;

  const stato = document.getElementById("stato-invito");
  const okBox = document.getElementById("ok");
  const errBox = document.getElementById("err");
  const ENDPOINT = "https://yume-sito-form.azurewebsites.net/api/invia-form";

  // ====== PRECOMPILA da localStorage (se presente)
  try {
    const saved = JSON.parse(localStorage.getItem("yume_invito") || "null");
    if (saved) {
      if (form.nome) form.nome.value = saved.nome || "";
      if (form.cognome) form.cognome.value = saved.cognome || "";
      if (form.telefono) form.telefono.value = saved.telefono || "";
      if (form.persone) form.persone.value = saved.persone || "";
      if (form.note) form.note.value = saved.note || "";
    }
  } catch(_) {}

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    stato.textContent = ""; okBox.style.display="none"; errBox.style.display="none";

    // privacy obbligatoria
    const cbox = document.getElementById("consensoGDPR_invito");
    if (!cbox || cbox.checked !== true) {
      stato.textContent = "Per confermare devi accettare l'informativa privacy.";
      return;
    }

    // validazione
    const nome = (form.nome?.value || "").trim();
    const cognome = (form.cognome?.value || "").trim();
    const persone = (form.persone?.value || "").trim();
    if (!nome || !cognome || !persone) {
      stato.textContent = "Compila tutti i campi obbligatori (*).";
      return;
    }

    // honeypot
    const website = (form.website?.value || "").trim();
    if (website) { stato.textContent = "Errore di validazione."; return; }

    const payload = {
      tipoRichiesta: "invito",
      nome,
      cognome,
      telefono: (form.telefono?.value || "").trim(),
      persone,
      note: (form.note?.value || "").trim(),
      consensoGDPR: true,
      policy_key: "privacy_evento",
      policy_version: "v1.0-2025-09-14",
      gdpr_url: "https://yume-travel.com/privacy.html",
      source: "opening-party-2025",
      ts_client: new Date().toISOString(),
      referrer: document.referrer || null,
      lang: document.documentElement.lang || "it",
      website
    };

    // ====== SALVA ANCHE IN LOCALE (per precompilazione / PDF)
    try { localStorage.setItem("yume_invito", JSON.stringify(payload)); } catch(_) {}

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    stato.textContent = "Invio in corso…";

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify(payload)
      });
      let data, raw;
      try { data = await res.json(); } catch { raw = await res.text(); }
      const success = data ? (data.ok === true || data.status === "success") : false;

      if (res.ok && success) {
        okBox.style.display = "block";
        stato.textContent = "Grazie! Ti abbiamo registrato.";

        // ====== GENERA PDF riepilogo (client-side)
        try {
          await generaPDFInvito({
            nome, cognome,
            telefono: payload.telefono,
            persone,
            note: payload.note
          });
        } catch (e) {
          console.warn("PDF non generato:", e);
        }

        // ====== Aggiungi al calendario (ICS universale)
        try {
          scaricaICS(); // Apple/Android/Outlook
        } catch(e) {
          console.warn("ICS non generato:", e);
        }

        form.reset();
      } else {
        const msg = (data && (data.error || data.message)) || raw || "Si è verificato un errore. Riprova.";
        errBox.style.display = "block";
        stato.textContent = msg;
      }
    } catch (err) {
      console.error("Errore rete:", err);
      errBox.style.display = "block";
      stato.textContent = "Errore di rete. Riprova più tardi.";
    } finally {
      btn.disabled = false;
    }
  });
});

// ====== Generatore PDF stile Yume con emoji + link Maps
async function generaPDFInvito(dati) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  const W = doc.internal.pageSize.getWidth();
  const margin = 56;
  let y = margin;

  // Titolo oro
  doc.setFont('helvetica','bold');
  doc.setFontSize(22);
  doc.setTextColor(201,168,106); // oro
  doc.text("YUME TRAVEL TECH — OPENING PARTY", W/2, y, {align:"center"});
  y += 28;

  // Sottotitolo rosso
  doc.setFontSize(14);
  doc.setTextColor(139,44,43); // rosso
  doc.text("Invito ufficiale per un ospite speciale", W/2, y, {align:"center"});
  y += 28;

  // Riga separatrice oro
  doc.setDrawColor(201,168,106); doc.setLineWidth(1);
  doc.line(margin, y, W - margin, y);
  y += 24;

  // Info evento con emoji
  doc.setFont('helvetica','bold'); doc.setTextColor(139,44,43);
  doc.text("📍 Luogo:", margin, y);
  doc.setFont('helvetica','normal'); doc.setTextColor(0,0,0);
  doc.text("Parco E. Berlinguer – Via Antonio Gramsci 1330/B, Larciano (PT)", margin+80, y);
  y += 20;

  doc.setFont('helvetica','bold'); doc.setTextColor(139,44,43);
  doc.text("📅 Giorno:", margin, y);
  doc.setFont('helvetica','normal'); doc.setTextColor(0,0,0);
  doc.text("Sabato 11 Ottobre 2025", margin+80, y);
  y += 20;

  doc.setFont('helvetica','bold'); doc.setTextColor(139,44,43);
  doc.text("🕢 Orario:", margin, y);
  doc.setFont('helvetica','normal'); doc.setTextColor(0,0,0);
  doc.text("dalle 19:30", margin+80, y);
  y += 30;

  // Link a Google Maps nel PDF
  doc.setFont('helvetica','bold'); doc.setTextColor(139,44,43);
  doc.text("📍 Mappa:", margin, y);
  doc.setFont('helvetica','underline'); doc.setTextColor(0,0,255);
  doc.textWithLink("Apri in Google Maps", margin+80, y, {
    url: "https://maps.google.com/?q=Parco+E.+Berlinguer+Via+Antonio+Gramsci+1330/B+Larciano"
  });
  doc.setFont('helvetica','normal'); doc.setTextColor(0,0,0);
  y += 30;

  // Box riepilogo RSVP
  doc.setDrawColor(201,168,106); doc.setLineWidth(1);
  const boxH = 130;
  doc.rect(margin, y, W - 2*margin, boxH);

  doc.setFont('helvetica','bold'); doc.setTextColor(139,44,43);
  doc.text("RIEPILOGO RSVP", margin + 12, y + 22);

  doc.setFont('helvetica','normal'); doc.setTextColor(0,0,0);
  doc.text(`Nome: ${dati.nome || ''}`,       margin + 12, y + 48);
  doc.text(`Cognome: ${dati.cognome || ''}`, margin + 260, y + 48);
  doc.text(`Persone: ${dati.persone || ''}`, margin + 12, y + 72);
  doc.text(`Telefono: ${dati.telefono || '-'}`, margin + 260, y + 72);

  // Note lunghe spezzate
  const note = `Note: ${dati.note || '-'}`;
  const wrap = doc.splitTextToSize(note, W - (margin + 24));
  doc.text(wrap, margin + 12, y + 96);

  // Footer
  y += boxH + 36;
  doc.setTextColor(139,44,43);
  doc.setFont('helvetica','bold'); doc.setFontSize(13);
  doc.text("Ti aspettiamo con gioia — Team Yume 🌸", W/2, y, {align:'center'});

  const filename = `Invito_Yume_${(dati.cognome||'ospite')}_${(dati.nome||'')}.pdf`.replace(/\s+/g,'_');
  doc.save(filename);
}

// ====== ICS universale (Apple / Android / Outlook)
function scaricaICS() {
  // NB: orari in UTC (Z). 19:30 Europe/Rome ≈ 17:30Z (considera l’ora legale)
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Yume//RSVP//IT',
    'BEGIN:VEVENT',
    'UID:' + Date.now() + '@yume-travel.com',
    'DTSTAMP:20250914T120000Z',
    'DTSTART:20251011T173000Z', // start 19:30 IT
    'DTEND:20251011T203000Z',   // end 22:30 IT (esempio 3h)
    'SUMMARY:Yume Travel Tech — Opening Party',
    'LOCATION:Parco E. Berlinguer – Via Antonio Gramsci 1330/B, Larciano (PT)',
    'DESCRIPTION:Presentazione ufficiale, cibo, musica e divertimento.',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Yume_OpeningParty.ics';
  a.click();
  URL.revokeObjectURL(url);
}

