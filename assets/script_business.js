(()=>{'use strict';
const A=[
['market','Scouting distributori','Individuazione e pre-qualifica di distributori, importatori e agenti per l’ingresso in Giappone.','Italia → Giappone'],
['market','Buyer meeting su agenda','Agenda commerciale con buyer coerenti per categoria, fascia prezzo e canale.','Italia → Giappone'],
['market','Ricerca importatore','Mappatura di importatori autorizzati e verifica preliminare della compatibilità commerciale.','Italia → Giappone'],
['market','Retail market tour','Visite guidate a department store, specialty retail e concept store per leggere il mercato reale.','Italia → Giappone'],
['market','Benchmark competitor','Analisi sul campo di competitor, pricing, packaging, canali e posizionamento.','Italia ↔ Giappone'],
['market','Route-to-market workshop','Sessione operativa per definire ingresso diretto, distributore, marketplace, retail o partnership.','Italia → Giappone'],
['market','Pricing & value proposition','Test della proposta di valore e della fascia prezzo rispetto al contesto giapponese.','Italia → Giappone'],
['market','Partner due diligence','Raccolta strutturata di informazioni operative e commerciali su controparti potenziali.','Italia ↔ Giappone'],
['fair','Delegazione fiera','Missione costruita intorno a una fiera con trasferimenti, agenda e supporto locale.','Italia ↔ Giappone'],
['fair','Supporto espositore','Logistica persone, agenda, interpretariato e attività complementari per aziende espositrici.','Italia ↔ Giappone'],
['fair','Pre-fair meeting week','Settimana di incontri prima della fiera per arrivare all’evento con relazioni già attive.','Italia → Giappone'],
['fair','Post-fair follow-up','Giornate dedicate a visite, approfondimenti e follow-up con lead incontrati in fiera.','Italia → Giappone'],
['fair','Showroom temporaneo','Organizzazione di presentazioni prodotto private o semi-private presso location selezionate.','Italia ↔ Giappone'],
['fair','B2B tasting','Sessioni professionali per food & beverage con buyer, importatori, ristorazione e hospitality.','Italia ↔ Giappone'],
['fair','Private launch','Evento di lancio per un prodotto, una capsule o una collaborazione Italia–Giappone.','Italia ↔ Giappone'],
['fair','Business roadshow','Missione multi-città per incontrare ecosistemi diversi tra Tokyo, Osaka, Nagoya e altri poli.','Italia ↔ Giappone'],
['industry','Factory visit','Visite industriali costruite intorno a processi, tecnologie e obiettivi di apprendimento.','Italia ↔ Giappone'],
['industry','Lean / TPS learning','Percorsi di osservazione e confronto su lean management, qualità e organizzazione dei processi.','Italia → Giappone'],
['industry','Robotics & automation','Missioni per aziende interessate a robotica, automazione, smart factory e integrazione industriale.','Italia ↔ Giappone'],
['industry','Automotive & mobility','Visite e incontri su componentistica, mobilità, produzione, qualità e nuove tecnologie.','Italia ↔ Giappone'],
['industry','Semiconductor scouting','Agenda su semiconduttori, elettronica, supply chain, packaging e applicazioni industriali.','Italia ↔ Giappone'],
['industry','Advanced materials','Ricerca e visite su materiali innovativi, chimica applicata, compositi e processi avanzati.','Italia ↔ Giappone'],
['industry','Quality systems immersion','Percorsi per management e operations su qualità, standardizzazione e miglioramento continuo.','Italia → Giappone'],
['industry','Supplier audit mission','Supporto logistico e organizzativo per visite a fornitori e siti produttivi.','Italia ↔ Giappone'],
['industry','R&D scouting','Ricerca di centri, imprese e cluster da incontrare per sviluppo prodotto e innovazione.','Italia ↔ Giappone'],
['consumer','Food export mission','Missioni per produttori alimentari: canali, importatori, retail, ristorazione e trend locali.','Italia → Giappone'],
['consumer','Wine & beverage business','Incontri professionali, distributori, hospitality e format di degustazione dedicati.','Italia → Giappone'],
['consumer','Hospitality benchmarking','Hotel, ristorazione, service design e customer experience da osservare e confrontare.','Italia ↔ Giappone'],
['consumer','Luxury & fashion retail','Analisi sul campo e appuntamenti nel mondo moda, lusso, department store e specialty retail.','Italia ↔ Giappone'],
['consumer','Textile sourcing','Ricerca di partner, tessuti, lavorazioni, produttori e collaborazioni di filiera.','Italia ↔ Giappone'],
['consumer','Furniture & design','Missioni per arredo, contract, interior, materiali, showroom e partnership di design.','Italia ↔ Giappone'],
['consumer','Beauty & cosmetics','Market tour e incontri per cosmetica, beauty tech, distribuzione e retail specializzato.','Italia ↔ Giappone'],
['consumer','Craft collaboration','Progetti tra artigiani, brand e territori per capsule, residenze creative e co-design.','Italia ↔ Giappone'],
['learning','Executive immersion','Viaggio di management con visite, incontri e debrief quotidiani su un tema strategico.','Italia ↔ Giappone'],
['learning','Innovation tour','Percorso multi-settore per osservare tecnologie, servizi, retail e modelli organizzativi.','Italia ↔ Giappone'],
['learning','Leadership offsite','Offsite aziendale con contenuto, cultura, lavoro interno e logistica di alto livello.','Italia ↔ Giappone'],
['learning','Team incentive','Incentive aziendale con contenuto locale autentico e organizzazione end-to-end.','Italia ↔ Giappone'],
['learning','Customer experience safari','Osservazione strutturata di hospitality, mobilità, retail e servizi per team CX/marketing.','Italia → Giappone'],
['institution','University-company delegation','Agenda tra università, imprese, laboratori e centri di ricerca.','Italia ↔ Giappone'],
['institution','Institutional business mission','Supporto operativo a delegazioni di associazioni, territori, cluster e organismi economici.','Italia ↔ Giappone'],
['institution','Startup ecosystem tour','Incontri con incubatori, corporate innovation, venture capital e startup.','Italia ↔ Giappone'],
['institution','Open innovation scouting','Ricerca di startup e partner tecnologici intorno a challenge aziendali definite.','Italia ↔ Giappone'],
['inbound','Tuscany industrial districts','Incoming per imprese giapponesi nei distretti toscani: manifattura, moda, meccanica, artigianato.','Giappone → Italia'],
['inbound','Italian sourcing mission','Ricerca fornitori italiani e visite produttive per buyer e aziende giapponesi.','Giappone → Italia'],
['inbound','Food & wine sourcing Italy','Agenda tra produttori, consorzi, distribuzione e territori per buyer giapponesi.','Giappone → Italia'],
['inbound','Fashion & design sourcing Italy','Visite a showroom, produttori, brand, distretti e fornitori per il mercato giapponese.','Giappone → Italia'],
['inbound','MICE & incentive Italy','Programmi corporate in Italia per imprese giapponesi con logistica, contenuti e hospitality.','Giappone → Italia'],
['inbound','Media & creator business mission','Missioni professionali per media, creator, brand e produzioni tra Italia e Giappone.','Giappone → Italia']
];
const labels={market:'Market entry',fair:'Fiere & commerciale',industry:'Industria & tecnologia',consumer:'Food · Fashion · Design',learning:'Learning & Incentive',institution:'Istituzioni · Ricerca · Startup',inbound:'Japan → Italy'};
window.YUME_BUSINESS_ACTIVITIES=A;
function card(a){return '<article class="yb-offer" data-cat="'+a[0]+'"><small>'+labels[a[0]]+'</small><h3>'+a[1]+'</h3><p>'+a[2]+'</p><footer><span>'+a[3]+'</span><a href="/business/lab/?activity='+encodeURIComponent(a[1])+'">Brief →</a></footer></article>'}
function render(){const box=document.querySelector('[data-business-activities]');if(box)box.innerHTML=A.map(card).join('');const count=document.querySelector('[data-activity-count]');if(count)count.textContent=A.length+' attività';}
function filters(){document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(x=>x.classList.remove('is-active'));btn.classList.add('is-active');const f=btn.dataset.filter;document.querySelectorAll('.yb-offer').forEach(c=>c.hidden=f!=='all'&&c.dataset.cat!==f)}))}
document.addEventListener('DOMContentLoaded',()=>{render();filters();});
})();