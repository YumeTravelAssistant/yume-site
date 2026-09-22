/* ==========================================================================\n   YUME HONEYMOON · Frontend controller v1.0\n   No dependency on assets/script.js.\n   ========================================================================== */
(() => {
  'use strict';

  const FORM_ENDPOINT = 'https://yume-sito-form.azurewebsites.net/api/invia-form';
  const GDPR_ENDPOINT = 'https://yume-gdpr.azurewebsites.net/api/log-cookie';
  const GA4_ID = 'G-EPQHLVQ1RH';
  const ADS_ID = 'AW-18466507810';
  const ADS_LEAD = 'AW-18466507810/niaGCLvtroAdEKKYwuVE';
  const STORAGE_KEY = 'yumeHoneymoonMatchV1';

  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const safeJSON = (value, fallback = null) => {
    try { return JSON.parse(value); } catch { return fallback; }
  };

  const getConsent = () => safeJSON(localStorage.getItem('cookieConsent'), null);

  function emit(eventName, params = {}) {
    const payload = {
      surface: 'yume_honeymoon',
      page_path: window.location.pathname,
      ...params
    };
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...payload });
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, payload);
    }
  }

  function loadGoogleTags() {
    const consent = getConsent();
    const analyticsConsent = consent?.analytics === true;
    const marketingConsent = consent?.marketing === true;
    if (!analyticsConsent && !marketingConsent) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };

    if (!window.__yumeGoogleTagLoaded) {
      const tagId = marketingConsent ? ADS_ID : GA4_ID;
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${tagId}`;
      script.async = true;
      document.head.appendChild(script);
      window.gtag('js', new Date());
      window.__yumeGoogleTagLoaded = true;
    }

    if (analyticsConsent && !window.__yumeGA4Configured) {
      window.gtag('config', GA4_ID);
      window.__yumeGA4Configured = true;
    }
    if (marketingConsent && !window.__yumeGoogleAdsConfigured) {
      window.gtag('config', ADS_ID);
      window.__yumeGoogleAdsConfigured = true;
    }
  }

  function trackAdsLead() {
    const consent = getConsent();
    if (consent?.marketing !== true) return;
    loadGoogleTags();
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', { send_to: ADS_LEAD });
    }
  }

  async function logConsent(choice) {
    const sessionId = localStorage.getItem('sessionId') || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()));
    localStorage.setItem('sessionId', sessionId);
    try {
      await fetch(GDPR_ENDPOINT, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          sessionId,
          analytics:choice.analytics === true,
          marketing:choice.marketing === true,
          page:window.location.pathname,
          userAgent:navigator.userAgent
        })
      });
    } catch (err) {
      console.warn('YUME Honeymoon: consenso cookie non registrato lato server.', err);
    }
  }

  function setConsent(choice) {
    localStorage.setItem('cookieConsent', JSON.stringify(choice));
    qs('#yh-cookie')?.classList.remove('is-open');
    qs('#yh-cookie-prefs')?.classList.remove('is-open');
    logConsent(choice);
    loadGoogleTags();
  }

  function initCookie() {
    const box = qs('#yh-cookie');
    if (!box) return;
    const existing = getConsent();
    if (!existing) box.classList.add('is-open');
    else {
      loadGoogleTags();
      const a = qs('#yh-cookie-analytics');
      const m = qs('#yh-cookie-marketing');
      if (a) a.checked = existing.analytics === true;
      if (m) m.checked = existing.marketing === true;
    }

    qsa('[data-cookie-open]').forEach(link => link.addEventListener('click', e => {
      e.preventDefault();
      const current = getConsent() || {analytics:false,marketing:false};
      const a = qs('#yh-cookie-analytics');
      const m = qs('#yh-cookie-marketing');
      if (a) a.checked = current.analytics === true;
      if (m) m.checked = current.marketing === true;
      box.classList.add('is-open');
      qs('#yh-cookie-prefs')?.classList.add('is-open');
    }));

    qs('[data-cookie="accept"]', box)?.addEventListener('click', () => setConsent({analytics:true, marketing:true}));
    qs('[data-cookie="reject"]', box)?.addEventListener('click', () => setConsent({analytics:false, marketing:false}));
    qs('[data-cookie="prefs"]', box)?.addEventListener('click', () => qs('#yh-cookie-prefs')?.classList.toggle('is-open'));
    qs('[data-cookie="save"]', box)?.addEventListener('click', () => {
      setConsent({
        analytics:qs('#yh-cookie-analytics')?.checked === true,
        marketing:qs('#yh-cookie-marketing')?.checked === true
      });
    });
  }

  function initNav() {
    const wrap = qs('.yh-nav-wrap');
    const button = qs('.yh-menu-btn');
    const panel = qs('.yh-mobile-panel');
    if (!wrap) return;

    const onScroll = () => wrap.classList.toggle('is-scrolled', window.scrollY > 28);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});

    if (button && panel) {
      const close = () => {
        button.setAttribute('aria-expanded','false');
        panel.classList.remove('is-open');
        panel.setAttribute('aria-hidden','true');
        document.body.classList.remove('yh-menu-open');
      };
      button.addEventListener('click', () => {
        const open = button.getAttribute('aria-expanded') === 'true';
        if (open) close();
        else {
          button.setAttribute('aria-expanded','true');
          panel.classList.add('is-open');
          panel.setAttribute('aria-hidden','false');
          document.body.classList.add('yh-menu-open');
        }
      });
      qsa('a', panel).forEach(a => a.addEventListener('click', close));
      document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    }
  }

  function initReveal() {
    const items = qsa('[data-yh-reveal]');
    if (!items.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold:.12, rootMargin:'0px 0px -30px 0px'});
    items.forEach(el => observer.observe(el));
  }

  function initFaq() {
    qsa('.yh-faq-item').forEach(item => {
      const btn = qs('.yh-faq-q', item);
      if (!btn) return;
      btn.addEventListener('click', () => {
        const open = item.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
  }

  function getUTM() {
    const p = new URLSearchParams(location.search);
    return {
      utm_source:p.get('utm_source') || '',
      utm_medium:p.get('utm_medium') || '',
      utm_campaign:p.get('utm_campaign') || '',
      utm_content:p.get('utm_content') || '',
      utm_term:p.get('utm_term') || '',
      ref:p.get('ref') || ''
    };
  }

  function initAttribution() {
    const current = getUTM();
    const hasCampaign = Object.values(current).some(Boolean);
    const previous = safeJSON(sessionStorage.getItem('yumeHoneymoonAttribution'), null);
    const value = hasCampaign ? current : (previous || current);
    sessionStorage.setItem('yumeHoneymoonAttribution', JSON.stringify(value));

    qsa('[data-track]').forEach(el => {
      el.addEventListener('click', () => emit('honeymoon_cta_click', {
        cta:el.dataset.track,
        ...value
      }));
    });
  }

  const MATCH_LABELS = {
    budget:{
      smart:'Fino a 7.000 €',
      balanced:'7.000–10.000 €',
      signature:'10.000–15.000 €',
      open:'15.000 €+'
    },
    pace:{
      move:'Molto movimento',
      balance:'Equilibrio',
      slow:'Ritmo lento'
    },
    mood:{
      culture:'Cultura & città',
      nature:'Natura & avventura',
      sea:'Mare & decompressione',
      mix:'Un mix vero'
    },
    duration:{
      short:'10–13 giorni',
      medium:'14–17 giorni',
      long:'18–23 giorni',
      extended:'24+ giorni'
    },
    care:{
      guided:'Molto supporto',
      hybrid:'Supporto + libertà',
      independent:'Autonomia con regia YUME'
    }
  };

  function calculateMatch(ans) {
    let line = 'Signature';
    let destination = 'Giappone Signature';
    let why = 'Un progetto sartoriale, costruito su ritmo, esperienze e momenti di pausa.';
    let code = 'japan_signature';

    const nextScore = [
      ans.budget === 'smart' ? 2 : 0,
      ans.budget === 'balanced' ? 1 : 0,
      ans.pace === 'move' ? 2 : 0,
      ans.mood === 'nature' ? 2 : 0,
      ans.care === 'hybrid' ? 1 : 0,
      ans.care === 'independent' ? 2 : 0
    ].reduce((a,b)=>a+b,0);

    if (nextScore >= 4) {
      line = 'Honeymoon NEXT';
      destination = ans.mood === 'culture' ? 'Japan NEXT' : (ans.mood === 'sea' ? 'Thailand NEXT' : 'Asia Experience');
      code = ans.mood === 'culture' ? 'japan_next' : (ans.mood === 'sea' ? 'thailand_next' : 'asia_next');
      why = 'Più esperienze e movimento, con budget allocato dove genera davvero ricordo. Regia YUME, libertà di viverlo.';
    } else if ((ans.mood === 'sea' || ans.mood === 'mix') && ['long','extended'].includes(ans.duration) && ['signature','open'].includes(ans.budget)) {
      line = 'Signature Journeys';
      destination = 'Giappone × Polinesia';
      code = 'japan_polynesia';
      why = 'Prima intensità culturale, poi decompressione: due mondi costruiti come un unico viaggio.';
    } else if (ans.mood === 'sea' && ['balanced','signature'].includes(ans.budget)) {
      line = ans.budget === 'balanced' ? 'Honeymoon NEXT' : 'Signature Journeys';
      destination = 'Thailandia';
      code = ans.budget === 'balanced' ? 'thailand_next' : 'thailand_signature';
      why = 'Un buon equilibrio tra cultura, food, natura e mare, con grande flessibilità di budget e ritmo.';
    } else if (ans.mood === 'nature' && ans.pace !== 'slow') {
      line = 'Honeymoon NEXT';
      destination = 'Japan Wild / Asia Experience';
      code = 'japan_wild_next';
      why = 'Il viaggio come esperienza condivisa: treni, natura, piccole strutture, attività e momenti non standardizzati.';
    }

    return {line,destination,why,code};
  }

  function initMatch() {
    const root = qs('[data-honeymoon-match]');
    if (!root) return;
    const steps = qsa('.yh-match-step', root);
    const progress = qs('.yh-progress span', root);
    const result = qs('.yh-result', root);
    let index = 0;
    const answers = safeJSON(localStorage.getItem(STORAGE_KEY), {}) || {};

    function showStep(i) {
      index = Math.max(0, Math.min(i, steps.length - 1));
      steps.forEach((step, n) => step.classList.toggle('is-active', n === index));
      if (progress) progress.style.width = `${((index + 1) / steps.length) * 100}%`;
      root.scrollIntoView({behavior:'smooth', block:'center'});
    }

    qsa('.yh-option', root).forEach(option => {
      option.addEventListener('click', () => {
        const step = option.closest('.yh-match-step');
        const key = step?.dataset.key;
        const value = option.dataset.value;
        if (!key || !value) return;
        qsa('.yh-option', step).forEach(x => x.classList.remove('is-selected'));
        option.classList.add('is-selected');
        answers[key] = value;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
        const next = qs('[data-match-next]', step);
        if (next) next.disabled = false;
        emit('honeymoon_match_answer',{question:key,answer:value});
      });
    });

    qsa('[data-match-next]', root).forEach(btn => btn.addEventListener('click', () => {
      if (index < steps.length - 1) showStep(index + 1);
      else {
        const match = calculateMatch(answers);
        steps.forEach(s => s.classList.remove('is-active'));
        result?.classList.add('is-active');
        if (progress) progress.style.width = '100%';
        const line = qs('[data-result-line]', result);
        const dest = qs('[data-result-destination]', result);
        const why = qs('[data-result-why]', result);
        const budget = qs('[data-result-budget]', result);
        const pace = qs('[data-result-pace]', result);
        const duration = qs('[data-result-duration]', result);
        if (line) line.textContent = match.line;
        if (dest) dest.textContent = match.destination;
        if (why) why.textContent = match.why;
        if (budget) budget.textContent = MATCH_LABELS.budget[answers.budget] || 'Da definire';
        if (pace) pace.textContent = MATCH_LABELS.pace[answers.pace] || 'Da definire';
        if (duration) duration.textContent = MATCH_LABELS.duration[answers.duration] || 'Da definire';
        sessionStorage.setItem('yumeHoneymoonMatchResult', JSON.stringify({...match,answers}));
        emit('honeymoon_match_complete',{match_line:match.line,match_destination:match.code,budget:answers.budget || ''});
      }
    }));

    qsa('[data-match-back]', root).forEach(btn => btn.addEventListener('click', () => showStep(index - 1)));
    qs('[data-match-reset]', root)?.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY);
      Object.keys(answers).forEach(k => delete answers[k]);
      qsa('.yh-option', root).forEach(x => x.classList.remove('is-selected'));
      qsa('[data-match-next]', root).forEach(x => x.disabled = true);
      result?.classList.remove('is-active');
      showStep(0);
    });

    qs('[data-use-match]', root)?.addEventListener('click', () => {
      const form = qs('#honeymoon-form');
      if (!form) return;
      const saved = safeJSON(sessionStorage.getItem('yumeHoneymoonMatchResult'), null);
      if (saved) {
        const dest = qs('[name="destinazione"]', form);
        if (dest) dest.value = saved.destination;
        const budget = qs('[name="budget"]', form);
        if (budget) {
          const mapping = {smart:'fino-7000',balanced:'7000-10000',signature:'10000-15000',open:'15000-plus'};
          budget.value = mapping[saved.answers?.budget] || '';
        }
      }
      form.scrollIntoView({behavior:'smooth', block:'start'});
    });

    showStep(0);
  }

  function composeFormMessage(form) {
    const data = new FormData(form);
    const attr = safeJSON(sessionStorage.getItem('yumeHoneymoonAttribution'), {}) || {};
    const match = safeJSON(sessionStorage.getItem('yumeHoneymoonMatchResult'), null);
    const rows = [
      '[YUME HONEYMOON]',
      `Telefono: ${data.get('telefono') || '-'}`,
      `Data/periodo matrimonio: ${data.get('matrimonio') || '-'}`,
      `Periodo viaggio: ${data.get('partenza') || '-'}`,
      `Durata: ${data.get('durata') || '-'}`,
      `Budget coppia: ${data.get('budget') || '-'}`,
      `Linea preferita: ${data.get('linea') || '-'}`,
      `Destinazione/interesse: ${data.get('destinazione') || '-'}`,
      `Wedding Journey Page: ${data.get('wedding_page') || '-'}`,
      `Appuntamento: ${data.get('modalita') || '-'}`,
      '',
      'Messaggio:',
      data.get('messaggio') || '-',
      '',
      `Match YUME: ${match ? `${match.line} / ${match.destination}` : 'non completato'}`,
      `Sorgente: ${attr.utm_source || 'direct'} / ${attr.utm_medium || '-'}`,
      `Campagna: ${attr.utm_campaign || '-'}`,
      `Partner/ref: ${attr.ref || '-'}`
    ];
    return rows.join('\n');
  }

  function initForm() {
    const form = qs('#honeymoon-form');
    if (!form) return;
    const status = qs('#honeymoon-form-status');
    const btn = qs('button[type="submit"]', form);

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const consent = qs('#honeymoon-gdpr');
      if (!consent?.checked) {
        if (status) status.textContent = 'Per procedere è necessario accettare l’informativa privacy.';
        return;
      }
      if (form.website?.value) return;
      if (status) status.textContent = 'Invio in corso…';
      if (btn) btn.disabled = true;

      const formData = new FormData(form);
      const payload = {
        // Pipeline dedicata YUME Honeymoon: Azure proxy -> GAS -> crm.honeymoon_requests.
        tipoRichiesta:'honeymoon',
        nome:String(formData.get('nome') || '').trim(),
        email:String(formData.get('email') || '').trim(),
        viaggio:`YUME Honeymoon | ${String(formData.get('destinazione') || 'Da definire')}`,
        messaggio:composeFormMessage(form),
        website:'',
        consensoGDPR:true,
        policy_key:'privacy',
        policy_version:'v1.0-2025-08-19',
        gdpr_url:'https://yume-travel.com/privacy.html',
        referrer:document.referrer || null,
        lang:document.documentElement.lang || 'it',
        // Campi extra: il proxy può ignorarli oggi e mapparli in futuro nel CRM.
        funnel:'honeymoon',
        telefono:String(formData.get('telefono') || '').trim(),
        matrimonio:String(formData.get('matrimonio') || '').trim(),
        partenza:String(formData.get('partenza') || '').trim(),
        durata:String(formData.get('durata') || ''),
        budget:String(formData.get('budget') || ''),
        honeymoon_line:String(formData.get('linea') || ''),
        destinazione:String(formData.get('destinazione') || '').trim(),
        wedding_page:String(formData.get('wedding_page') || ''),
        modalita:String(formData.get('modalita') || ''),
        match_result:safeJSON(sessionStorage.getItem('yumeHoneymoonMatchResult'), null),
        attribution:safeJSON(sessionStorage.getItem('yumeHoneymoonAttribution'), {}) || {}
      };

      try {
        const response = await fetch(FORM_ENDPOINT, {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify(payload)
        });
        let result = null;
        let raw = '';
        try { result = await response.json(); } catch { raw = await response.text(); }
        const success = response.ok && (result ? (result.ok === true || result.status === 'success') : false);
        if (!success) throw new Error(result?.error || result?.message || raw || 'Errore di invio');

        trackAdsLead();
        emit('honeymoon_lead_submit', {
          line:payload.honeymoon_line,
          budget:payload.budget,
          destination:String(formData.get('destinazione') || ''),
          mode:payload.modalita
        });
        if (status) status.textContent = 'Richiesta inviata. Il team YUME vi ricontatterà per costruire il prossimo passo.';
        form.reset();
      } catch (err) {
        console.error('YUME Honeymoon form:', err);
        if (status) status.textContent = 'Non siamo riusciti a inviare la richiesta. Potete riprovare o contattarci direttamente su WhatsApp.';
      } finally {
        if (btn) btn.disabled = false;
      }
    });
  }

  function initPartnerContext() {
    const attr = safeJSON(sessionStorage.getItem('yumeHoneymoonAttribution'), {}) || {};
    if (!attr.ref) return;
    qsa('[data-partner-context]').forEach(el => {
      el.hidden = false;
      const name = el.querySelector('[data-partner-name]');
      if (name) name.textContent = attr.ref.replace(/[-_]/g,' ');
    });
  }

  function initQueryPrefill() {
    const form = qs('#honeymoon-form');
    if (!form) return;
    const p = new URLSearchParams(location.search);
    const focus = (p.get('focus') || '').toLowerCase();
    const line = qs('[name="linea"]', form);
    const wedding = qs('[name="wedding_page"]', form);
    if (focus === 'next' && line) line.value = 'Honeymoon NEXT';
    if ((focus === 'signature' || focus === 'premium') && line) line.value = 'Signature Journeys';
    if ((focus === 'wedding-page' || focus === 'wedding_journey') && wedding) wedding.value = 'Sì, ci interessa';
  }

  document.addEventListener('DOMContentLoaded', () => {
    initCookie();
    initNav();
    initReveal();
    initFaq();
    initAttribution();
    initMatch();
    initForm();
    initPartnerContext();
    initQueryPrefill();
    emit('honeymoon_page_view',{title:document.title});
  });
})();