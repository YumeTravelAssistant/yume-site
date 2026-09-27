(()=>{'use strict';
const qs=(s,r=document)=>r.querySelector(s),qsa=(s,r=document)=>[...r.querySelectorAll(s)];
const ACTIVITIES=[
['market','Scouting distributori','Individuazione e pre-qualifica di distributori, importatori e agenti per l’ingresso in Giappone.','Italia → Giappone'],
['market','Buyer meeting su agenda','Agenda commerciale con buyer coerenti per categoria, fascia prezzo e canale.','Italia → Giappone'],
['market','Ricerca importatore','Mappatura di importatori autorizzati e verifica preliminare della compatibilità commerciale.','Italia → Giappone'],
['market','Retail market tour','Visite a department store, specialty retail e concept store per leggere il mercato reale.','Italia → Giappone'],
['market','Benchmark competitor','Analisi sul campo di competitor, pricing, packaging, canali e posizionamento.','Italia ↔ Asia'],
['market','Route-to-market workshop','Sessione operativa per scegliere ingresso diretto, distributore, marketplace, retail o partnership.','Italia → Giappone'],
['market','Pricing & value proposition','Test della proposta di valore e della fascia prezzo rispetto al mercato target.','Italia → Asia'],
['market','Partner due diligence','Raccolta strutturata di informazioni operative e commerciali su controparti potenziali.','Italia ↔ Asia'],
['fair','Delegazione fiera','Missione costruita intorno a una fiera con trasferimenti, agenda e supporto locale.','Italia ↔ Asia'],
['fair','Supporto espositore','Logistica persone, agenda, interpretariato e attività complementari per aziende espositrici.','Italia ↔ Asia'],
['fair','Pre-fair meeting week','Settimana di incontri prima della fiera per arrivare all’evento con relazioni già attive.','Italia → Asia'],
['fair','Post-fair follow-up','Giornate dedicate a visite, approfondimenti e follow-up con lead incontrati in fiera.','Italia → Asia'],
['fair','Showroom temporaneo','Presentazioni prodotto private o semi-private presso location selezionate.','Italia ↔ Asia'],
['fair','B2B tasting','Sessioni professionali per food & beverage con buyer, importatori, ristorazione e hospitality.','Italia ↔ Asia'],
['fair','Private launch','Evento di lancio per prodotto, capsule o collaborazione Italia–Asia.','Italia ↔ Asia'],
['fair','Business roadshow','Missione multi-città per incontrare ecosistemi diversi in una stessa trasferta.','Italia ↔ Asia'],
['industry','Factory visit','Visite industriali costruite intorno a processi, tecnologie e obiettivi di apprendimento.','Italia ↔ Giappone'],
['industry','Lean / TPS learning','Percorsi su lean management, qualità e organizzazione dei processi.','Italia → Giappone'],
['industry','Robotics & automation','Missioni su robotica, automazione, smart factory e integrazione industriale.','Italia ↔ Asia'],
['industry','Automotive & mobility','Visite e incontri su componentistica, mobilità, produzione e nuove tecnologie.','Italia ↔ Asia'],
['industry','Semiconductor scouting','Agenda su semiconduttori, elettronica, supply chain e applicazioni industriali.','Italia ↔ Asia'],
['industry','Advanced materials','Ricerca e visite su materiali innovativi, chimica applicata e processi avanzati.','Italia ↔ Asia'],
['industry','Quality systems immersion','Percorsi per management e operations su qualità e miglioramento continuo.','Italia → Giappone'],
['industry','Supplier audit mission','Supporto logistico e organizzativo per visite a fornitori e siti produttivi.','Italia ↔ Asia'],
['industry','R&D scouting','Ricerca di centri, imprese e cluster per sviluppo prodotto e innovazione.','Italia ↔ Asia'],
['consumer','Food export mission','Missioni per produttori alimentari: canali, importatori, retail, ristorazione e trend locali.','Italia → Asia'],
['consumer','Wine & beverage business','Incontri professionali, distributori, hospitality e tasting dedicati.','Italia → Asia'],
['consumer','Hospitality benchmarking','Hotel, ristorazione, service design e customer experience da osservare e confrontare.','Italia ↔ Asia'],
['consumer','Luxury & fashion retail','Analisi e appuntamenti nel mondo moda, lusso, department store e specialty retail.','Italia ↔ Asia'],
['consumer','Textile sourcing','Ricerca di partner, tessuti, lavorazioni, produttori e collaborazioni di filiera.','Italia ↔ Asia'],
['consumer','Furniture & design','Missioni per arredo, contract, interior, materiali e partnership di design.','Italia ↔ Asia'],
['consumer','Beauty & cosmetics','Market tour e incontri per cosmetica, beauty tech, distribuzione e retail specializzato.','Italia ↔ Asia'],
['consumer','Craft collaboration','Progetti tra artigiani, brand e territori per capsule, residenze creative e co-design.','Italia ↔ Asia'],
['learning','Executive immersion','Viaggio di management con visite, incontri e debrief quotidiani su un tema strategico.','Italia ↔ Asia'],
['learning','Innovation tour','Percorso multi-settore per osservare tecnologie, servizi, retail e modelli organizzativi.','Italia ↔ Asia'],
['learning','Leadership offsite','Offsite aziendale con contenuto, cultura, lavoro interno e logistica di alto livello.','Italia ↔ Asia'],
['learning','Team incentive','Incentive aziendale con contenuto locale autentico e organizzazione end-to-end.','Italia ↔ Asia'],
['learning','Customer experience safari','Osservazione strutturata di hospitality, mobilità, retail e servizi.','Italia → Asia'],
['institution','University-company delegation','Agenda tra università, imprese, laboratori e centri di ricerca.','Italia ↔ Asia'],
['institution','Institutional business mission','Supporto a delegazioni di associazioni, territori, cluster e organismi economici.','Italia ↔ Asia'],
['institution','Startup ecosystem tour','Incontri con incubatori, corporate innovation, venture capital e startup.','Italia ↔ Asia'],
['institution','Open innovation scouting','Ricerca di startup e partner tecnologici intorno a challenge aziendali definite.','Italia ↔ Asia'],
['inbound','Tuscany industrial districts','Incoming per imprese asiatiche nei distretti toscani: manifattura, moda, meccanica, artigianato.','Asia → Italia'],
['inbound','Italian sourcing mission','Ricerca fornitori italiani e visite produttive per buyer e aziende asiatiche.','Asia → Italia'],
['inbound','Food & wine sourcing Italy','Agenda tra produttori, consorzi, distribuzione e territori per buyer asiatici.','Asia → Italia'],
['inbound','Fashion & design sourcing Italy','Visite a showroom, produttori, brand, distretti e fornitori per il mercato asiatico.','Asia → Italia'],
['inbound','MICE & incentive Italy','Programmi corporate in Italia per imprese asiatiche con logistica, contenuti e hospitality.','Asia → Italia'],
['inbound','Media & creator business mission','Missioni professionali per media, creator, brand e produzioni tra Italia e Asia.','Asia → Italia']
];
window.YUME_BUSINESS_ACTIVITIES=ACTIVITIES;
const labels={market:'Market entry',fair:'Fiere & commerciale',industry:'Industria & tecnologia',consumer:'Food · Fashion · Design',learning:'Learning & Incentive',institution:'Istituzioni · Ricerca · Startup',inbound:'Asia → Italy'};

function initMissionLabReliability(){
 const path=location.pathname.replace(/\/$/,'');
 if(path!=='/business/lab')return;

 const STORAGE='yumeBusinessMissionLabV2';
 const TRANSPORT='yumeBusinessMissionLabTransportV8';
 const MIGRATION='yumeBusinessMissionLabV8Migrated';
 const nativeFetch=window.fetch.bind(window);
 const sleep=(ms)=>new Promise(resolve=>setTimeout(resolve,ms));
 const retryable=new Set([408,503,504,520]);

 const newMissionId=()=>{
  const d=new Date();
  const yy=String(d.getFullYear()).slice(-2);
  const mm=String(d.getMonth()+1).padStart(2,'0');
  const rand=Math.random().toString(36).slice(2,7).toUpperCase();
  return 'YM-'+yy+mm+'-'+rand;
 };

 const readJson=(key)=>{try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return{}}};
 const writeJson=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}};
 const mark=(missionId,status)=>writeJson(TRANSPORT,{missionId,status,at:new Date().toISOString()});

 try{
  const draft=readJson(STORAGE);
  const transport=readJson(TRANSPORT);
  const firstV8=localStorage.getItem(MIGRATION)!=='1';
  const submittedInDraft=draft.submittedMissionId&&draft.submittedMissionId===draft.missionId;
  const acknowledgedByTransport=transport.missionId&&transport.missionId===draft.missionId&&['acknowledged','acknowledged-after-conflict'].includes(transport.status);

  if(draft.missionId&&(firstV8||submittedInDraft||acknowledgedByTransport)){
   draft.missionId=newMissionId();
   draft.step=1;
   delete draft.submittedAt;
   delete draft.submittedMissionId;
   writeJson(STORAGE,draft);
   localStorage.removeItem(TRANSPORT);
  }
  localStorage.setItem(MIGRATION,'1');
 }catch(e){console.warn('Mission Lab v8 lifecycle migration skipped',e)}

 window.fetch=async function(input,init){
  const method=String(init&&init.method||'GET').toUpperCase();
  const rawUrl=typeof input==='string'?input:(input&&input.url)||'';
  const isMissionSubmit=method==='POST'&&rawUrl.includes('/rest/v1/business_mission_briefs');
  if(!isMissionSubmit)return nativeFetch(input,init);

  let missionId='';
  try{missionId=JSON.parse(init&&init.body||'{}').mission_id||''}catch{}
  if(missionId)mark(missionId,'sending');

  const requestInit={...init};
  let lastError=null;

  for(let attempt=1;attempt<=2;attempt++){
   try{
    const response=await nativeFetch(rawUrl,requestInit);

    if(response.status===409&&attempt===2){
     if(missionId)mark(missionId,'acknowledged-after-conflict');
     return typeof Response!=='undefined'
      ? new Response(null,{status:204,statusText:'Already received'})
      : {ok:true,status:204,text:async()=>''};
    }

    if(attempt===1&&retryable.has(response.status)){
     await sleep(650);
     continue;
    }

    if(missionId)mark(missionId,response.ok?'acknowledged':'http-'+response.status);
    return response;
   }catch(error){
    lastError=error;
    if(attempt===1){
     await sleep(700);
     continue;
    }
   }
  }

  if(missionId)mark(missionId,'unknown');
  throw lastError||new TypeError('Mission submit network failure');
 };
}
initMissionLabReliability();
function initNav(){
 const wrap=qs('.yb-nav-wrap'),button=qs('.yb-menu-btn'),panel=qs('.yb-mobile-panel');
 if(wrap){const onScroll=()=>wrap.classList.toggle('is-scrolled',scrollY>28);onScroll();addEventListener('scroll',onScroll,{passive:true})}
 if(button&&panel){
  const close=()=>{button.setAttribute('aria-expanded','false');panel.classList.remove('is-open');panel.setAttribute('aria-hidden','true');document.body.classList.remove('yb-menu-open')};
  button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')==='true';if(open)close();else{button.setAttribute('aria-expanded','true');panel.classList.add('is-open');panel.setAttribute('aria-hidden','false');document.body.classList.add('yb-menu-open')}});
  qsa('a',panel).forEach(a=>a.addEventListener('click',close));document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
 }
}
function initReveal(){
 const items=qsa('[data-yb-reveal]');if(!items.length)return;
 if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver'in window)){items.forEach(x=>x.classList.add('is-visible'));return}
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -30px'});
 items.forEach(x=>io.observe(x));
}
function card(a){
 const href='/business/lab?activity='+encodeURIComponent(a[1]);
 return '<article class="yb-offer yb-click-card" role="link" tabindex="0" data-cat="'+a[0]+'" data-card-href="'+href+'"><small>'+labels[a[0]]+'</small><h3>'+a[1]+'</h3><p>'+a[2]+'</p><footer><span>'+a[3]+'</span><span>Brief ↗</span></footer></article>';
}
function renderActivities(){const box=qs('[data-business-activities]');if(box)box.innerHTML=ACTIVITIES.map(card).join('');const c=qs('[data-activity-count]');if(c)c.textContent=ACTIVITIES.length+' attività'}
function initFilters(){qsa('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{qsa('[data-filter]').forEach(x=>x.classList.remove('is-active'));btn.classList.add('is-active');const f=btn.dataset.filter;qsa('.yb-offer').forEach(c=>c.hidden=f!=='all'&&c.dataset.cat!==f)}))}
function initClickCards(){qsa('[data-card-href]').forEach(card=>{const href=card.dataset.cardHref;if(!href)return;const go=()=>location.href=href;card.addEventListener('click',e=>{if(e.target.closest('a,button,input,select,textarea'))return;go()});card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}})})}
function preserveAttribution(){const p=new URLSearchParams(location.search),keys=['utm_source','utm_medium','utm_campaign','utm_content','utm_term','ref'];const cur={};keys.forEach(k=>{if(p.get(k))cur[k]=p.get(k)});try{if(Object.keys(cur).length)sessionStorage.setItem('yumeBusinessAttribution',JSON.stringify(cur))}catch(_){}} 
document.addEventListener('DOMContentLoaded',()=>{initNav();initReveal();renderActivities();initFilters();initClickCards();preserveAttribution()});
})();