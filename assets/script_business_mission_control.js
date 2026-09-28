(()=>{'use strict';

const STORAGE='yumeMissionControlPreviewV1';

const DATA={
  organization:{name:'Aurea Italia S.r.l.',short:'Aurea Italia',industry:'Wine & Spirits',member:'Alessandro Rinaldi',role:'Corporate Admin'},
  mission:{
    id:'YM-DEMO-27W01',name:'Japan Market Entry · Wine & Spirits',phase:'Architecture',period:'12–18 April 2027',
    purpose:'Sourcing & partners',outcome:'Qualificare controparti distributive e costruire una shortlist prioritaria per il follow-up commerciale.',
    sector:'Wine & Spirits',budget:'€18.500',participants:4,seniority:'Founder / proprietà',
    route:['Tokyo','Nagoya / Chūbu','Osaka / Kansai'],
    modules:['Business roadshow','Buyer meetings','Retail intelligence','Tasting B2B'],
    health:{Brief:100,Agenda:64,Travel:42,Documents:78,Budget:55},
    nextMilestone:'Partner shortlist · 20 ottobre',
    owner:'Gaia · YUME Works'
  },
  decisions:[
    {id:'d1',title:'Confermare Osaka / Kansai',status:'required',due:'16 ottobre',impact:'+1 notte · + trasferimento',recommendation:'Includere Kansai solo se vengono qualificati almeno due interlocutori rilevanti.',detail:'La tappa aggiunge valore se sostiene davvero l’outcome distributivo. Altrimenti aumenta complessità, costi e trasferimenti senza aumentare la qualità della missione.'},
    {id:'d2',title:'Interpretariato per buyer meetings',status:'open',due:'22 ottobre',impact:'Stima €780',recommendation:'Prevedere interprete business per i meeting prioritari.',detail:'La presenza linguistica va calibrata sui meeting: non tutti richiedono interpretariato dedicato. La priorità è proteggere le conversazioni ad alto valore.'},
    {id:'d3',title:'Tasting professionale Tokyo',status:'approved',due:'10 ottobre',impact:'Approvato',recommendation:'Confermato come modulo centrale.',detail:'Il tasting entra nella mission architecture come momento B2B, non come esperienza leisure.'}
  ],
  agenda:[
    {day:'Mon 12',time:'15:30',title:'Arrival & mission briefing',place:'Tokyo · Marunouchi',status:'confirmed',owner:'YUME',type:'Mission'},
    {day:'Tue 13',time:'09:30',title:'Retail intelligence walk',place:'Tokyo · Ginza / Nihombashi',status:'confirmed',owner:'YUME',type:'Intelligence'},
    {day:'Tue 13',time:'14:30',title:'Buyer meeting · slot A',place:'Tokyo',status:'pending',owner:'YUME Network',type:'Meeting'},
    {day:'Wed 14',time:'10:00',title:'Importer / distributor meeting',place:'Tokyo',status:'pending',owner:'YUME Network',type:'Meeting'},
    {day:'Thu 15',time:'11:00',title:'Chūbu ecosystem module',place:'Nagoya',status:'design',owner:'YUME',type:'Architecture'},
    {day:'Fri 16',time:'10:30',title:'Kansai business roadshow',place:'Osaka',status:'decision',owner:'Client + YUME',type:'Decision'}
  ],
  participants:[
    {name:'Alessandro Rinaldi',role:'Founder',travel:'Ready',documents:'Ready',dietary:'—'},
    {name:'Giulia Ferri',role:'Commercial Director',travel:'Ready',documents:'Passport check',dietary:'Vegetarian'},
    {name:'Marco Lodi',role:'Export Manager',travel:'Pending',documents:'Ready',dietary:'—'},
    {name:'Elena Serra',role:'Brand Director',travel:'Ready',documents:'Ready',dietary:'Lactose free'}
  ],
  travel:[
    {type:'Flight',title:'Milan → Tokyo',detail:'Intercontinental · option not yet issued',status:'option'},
    {type:'Hotel',title:'Tokyo · 3 nights',detail:'Business district · breakfast · meeting-friendly',status:'shortlist'},
    {type:'Rail',title:'Tokyo → Nagoya → Osaka',detail:'Shinkansen architecture · luggage strategy',status:'design'},
    {type:'Transfer',title:'Arrival + business transfers',detail:'Private where mission timing requires it',status:'design'},
    {type:'Hotel',title:'Osaka · 2 nights',detail:'Depends on Kansai decision',status:'blocked'}
  ],
  documents:[
    {id:'doc1',type:'PDF',title:'Executive Mission Book',version:'v1',visibility:'Client + YUME',status:'Current'},
    {id:'doc2',type:'DOC',title:'Company Profile · EN',version:'Draft',visibility:'Client + selected partners',status:'Review'},
    {id:'doc3',type:'PDF',title:'Mission Proposal',version:'Pending',visibility:'Client + YUME',status:'Not issued'},
    {id:'doc4',type:'XLS',title:'Participant Matrix',version:'v2',visibility:'YUME operations',status:'Internal'},
    {id:'doc5',type:'PDF',title:'Meeting Brief Template',version:'v1',visibility:'Client + YUME',status:'Current'},
    {id:'doc6',type:'NDA',title:'NDA Template',version:'Template',visibility:'By project',status:'Ready'}
  ],
  financials:{
    value:18500,paid:6500,next:6000,nextDate:'15 January 2027',
    rows:[{label:'Mission design & project management',value:4800},{label:'Travel & hospitality envelope',value:8700},{label:'Interpretation / local services reserve',value:2400},{label:'Approved contingencies',value:2600}]
  },
  followups:[
    {company:'Partner candidate A',status:'Priority',next:'Send technical deck',owner:'Client',due:'+2 days'},
    {company:'Partner candidate B',status:'Warm',next:'YUME to coordinate second call',owner:'YUME',due:'+7 days'},
    {company:'Retail contact C',status:'Observe',next:'No action before mission',owner:'—',due:'—'}
  ],
  visiblePartners:[
    {role:'Local operations partner',geo:'Japan',status:'To be selected',note:'Ground execution, transfers, local support.'},
    {role:'Business interpreter',geo:'Tokyo / Kansai',status:'Qualification',note:'Language support for selected priority meetings.'},
    {role:'Market specialist',geo:'Japan',status:'Optional module',note:'Activated only if the business case requires specialist research.'}
  ],
  network:[
    {id:'p1',name:'ICCJ · Camera di Commercio Italiana in Giappone',kind:'Institutional node',geo:'Japan',stage:'Target relationship',tier:'Mapping',cap:['Networking','Business ecosystem','Events'],owner:'Alessio',next:'Prepare introduction & collaboration framing',note:'Target di relazione istituzionale. Nessuna partnership implicata.'},
    {id:'p2',name:'JNTO / JATA mapping',kind:'Travel trade ecosystem',geo:'Japan',stage:'Mapping',tier:'Exploration',cap:['Destination trade','Tourism network','DMC discovery'],owner:'Gaia',next:'Use trade relationship to identify local operators',note:'Canale potenziale per ampliare la conoscenza del network travel locale.'},
    {id:'p3',name:'Japan DMC · Candidate A',kind:'DMC',geo:'Tokyo / Nationwide',stage:'Qualification',tier:'Candidate',cap:['Ground handling','Corporate groups','Transport','Guides'],owner:'Operations',next:'Request corporate capability deck + commercial terms',note:'Nome oscurato in preview. Processo previsto: candidate → pilot → approved.'},
    {id:'p4',name:'Japan DMC · Candidate B',kind:'DMC',geo:'Kansai / Nationwide',stage:'Discovery',tier:'Candidate',cap:['MICE','Business travel','Venues','Transfers'],owner:'Operations',next:'Initial call',note:'Seconda opzione per evitare single-source dependency.'},
    {id:'p5',name:'JETRO / EU-Japan ecosystem',kind:'Business support mapping',geo:'Japan / EU',stage:'Mapping',tier:'External ecosystem',cap:['Market entry resources','Business matching','Research'],owner:'Business Design',next:'Map public tools & non-overlap opportunities',note:'Risorsa/ecosistema esterno; non presentato come partner YUME.'},
    {id:'p6',name:'Technical interpreter pool',kind:'Specialist network',geo:'Japan',stage:'Build on demand',tier:'Early',cap:['Automotive','Manufacturing','Business'],owner:'Operations',next:'Create first qualified shortlist',note:'Network da approfondire seguendo la domanda reale.'}
  ],
  coverage:[
    {label:'Institutional · Japan',value:55,state:'Developing'},
    {label:'DMC · Japan',value:46,state:'Developing'},
    {label:'Business interpreters',value:38,state:'Early'},
    {label:'Food & Wine',value:32,state:'Early'},
    {label:'Automotive / Manufacturing',value:18,state:'Not developed'},
    {label:'Tech / AI / Research',value:22,state:'Early'},
    {label:'Korea',value:10,state:'Exploration'},
    {label:'Singapore / APAC',value:8,state:'Exploration'}
  ],
  partnerPipeline:[
    {stage:'Mapping',count:12,detail:'Organizations / providers identified'},
    {stage:'Contacted',count:5,detail:'Initial outreach or introduction'},
    {stage:'Qualification',count:3,detail:'Capability / commercial check'},
    {stage:'Pilot',count:1,detail:'To be validated on a real mission'},
    {stage:'Approved',count:0,detail:'No partner promoted before pilot'},
    {stage:'Preferred',count:0,detail:'Performance-based future tier'}
  ],
  roadmap:[
    {period:'TTG 2026',title:'Demo-ready operating story',items:['Controlled access workflow','Mission Control UX','YUME Network view','Japan Core + Asia Extension']},
    {period:'POST-TTG',title:'Production foundation',items:['Supabase Auth + MFA','Organization / Membership','Private document storage','Audit & permission model']},
    {period:'PILOT',title:'Real corporate missions',items:['1–3 projects','Partner qualification pilots','Measure real usage','Refine document pack']},
    {period:'BIT',title:'Enterprise-ready layer',items:['Network intelligence','Partner scoring','Client account history','SSO / WorkOS readiness if required']}
  ],
  asia:[
    {name:'South Korea',hub:'Seoul',role:'Tech · consumer · beauty',state:'Exploration',note:'Estensione solo quando completa il business case giapponese o crea confronto utile.'},
    {name:'Singapore',hub:'APAC',role:'Regional HQ · digital gateway',state:'Exploration',note:'Hub regionale per headquarters, servizi, fintech e innovation.'},
    {name:'Hong Kong',hub:'Greater China',role:'Trade · finance · distribution',state:'Exploration',note:'Nodo commerciale da usare con logica selettiva e progetto-specifica.'},
    {name:'Taiwan',hub:'Taipei',role:'Electronics · supply chain',state:'Exploration',note:'Rilevante per elettronica, semiconduttori e filiere tecnologiche.'}
  ],
  onboardingReview:[
    {company:'Nuova Impresa Demo S.r.l.',vat:'IT01122334455',admin:'Laura Bianchi',docs:'3/3',status:'Ready for review',risk:'Standard'},
    {company:'Demo Industrial S.p.A.',vat:'IT09876543210',admin:'Marta Conti',docs:'2/3',status:'Missing delegation',risk:'Standard'}
  ]
};

const CLIENT_NAV=[
  ['overview','◎','Overview'],['company','⌂','Company'],['mission','◇','Mission'],['agenda','◫','Agenda'],['decisions','✓','Decisions'],
  ['participants','○','People'],['travel','↗','Travel'],['documents','▤','Documents'],['financials','€','Financials'],['followup','↺','Follow-up']
];
const INTERNAL_NAV=[
  ['network','◎','Network'],['onboarding','⌂','Onboarding'],['partners','◇','Partners'],['coverage','◫','Coverage'],['pipeline','↗','Pipeline'],['roadmap','↺','Roadmap'],['access','⌁','Access architecture']
];

let state=loadState();
let toastTimer=null;

function loadState(){
  try{
    const raw=localStorage.getItem(STORAGE);
    if(raw){const s=JSON.parse(raw);return {...baseState(),...s,decisionStatus:{...baseState().decisionStatus,...(s.decisionStatus||{})}}}
  }catch(_){}
  return baseState();
}
function baseState(){return{session:false,onboarding:false,onboardingStep:1,onboardingSubmitted:false,onboardingApproved:false,role:'client',section:'overview',decisionStatus:{d1:'required',d2:'open',d3:'approved'},sidebar:false,drawer:false,uploadedDocs:{}}}
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(state))}catch(_){}}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function money(v){return new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(v)}
function el(sel,root=document){return root.querySelector(sel)}
function els(sel,root=document){return [...root.querySelectorAll(sel)]}
function statusLabel(status){
  const map={confirmed:['Confirmed','green'],pending:['Awaiting confirmation','amber'],design:['In design',''],decision:['Decision required','red'],option:['Option','amber'],shortlist:['Shortlist',''],blocked:['Blocked by decision','red'],required:['Decision required','red'],open:['Open','amber'],approved:['Approved','green']};
  return map[status]||[status,''];
}
function chip(status){
  const [label,tone]=statusLabel(status);
  return '<span class="ymc-chip '+(tone?'is-'+tone:'')+'"><i></i>'+esc(label)+'</span>';
}
function pageHead(kicker,title,copy,actions=''){
  return '<header class="ymc-page-head"><div><span class="ymc-section-label">'+esc(kicker)+'</span><h1>'+title+'</h1><p>'+copy+'</p></div><div class="ymc-page-head-actions">'+actions+'</div></header>';
}
function setRole(role){
  state.role=role==='internal'?'internal':'client';
  state.section=state.role==='client'?'overview':'network';
  state.sidebar=false;
  closeDrawer();
  save();render();
}
function setSection(section){
  state.section=section;state.sidebar=false;save();render();requestAnimationFrame(()=>el('#ymc-main')?.focus({preventScroll:true}));
}
function toast(msg){
  const t=el('[data-ymc-toast]');if(!t)return;
  t.textContent=msg;t.classList.add('is-visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('is-visible'),2600);
}
function updateDecision(id,status){
  state.decisionStatus[id]=status;save();render();toast(status==='approved'?'Decisione registrata nella preview.':'Stato aggiornato nella preview.');
}
function openDrawer(type,id){
  state.drawer={type,id};
  const drawer=el('[data-ymc-drawer]'),back=el('[data-ymc-drawer-backdrop]'),content=el('[data-ymc-drawer-content]');
  content.innerHTML=drawerContent(type,id);drawer.classList.add('is-open');drawer.setAttribute('aria-hidden','false');back.classList.add('is-open');
}
function closeDrawer(){
  state.drawer=false;el('[data-ymc-drawer]')?.classList.remove('is-open');el('[data-ymc-drawer]')?.setAttribute('aria-hidden','true');el('[data-ymc-drawer-backdrop]')?.classList.remove('is-open');
}
function drawerContent(type,id){
  if(type==='decision'){
    const d=DATA.decisions.find(x=>x.id===id);if(!d)return'';
    return '<span class="ymc-section-label">DECISION DETAIL</span><h2 class="ymc-drawer-title">'+esc(d.title)+'</h2><p class="ymc-drawer-copy">'+esc(d.detail)+'</p>'+
      '<div class="ymc-drawer-section"><h4>YUME recommendation</h4><p class="ymc-drawer-copy">'+esc(d.recommendation)+'</p></div>'+
      '<div class="ymc-drawer-section"><dl><div><dt>Due</dt><dd>'+esc(d.due)+'</dd></div><div><dt>Impact</dt><dd>'+esc(d.impact)+'</dd></div><div><dt>Status</dt><dd>'+esc(state.decisionStatus[d.id]||d.status)+'</dd></div></dl></div>';
  }
  if(type==='partner'){
    const p=DATA.network.find(x=>x.id===id);if(!p)return'';
    return '<span class="ymc-section-label">PARTNER REGISTRY · INTERNAL</span><h2 class="ymc-drawer-title">'+esc(p.name)+'</h2><p class="ymc-drawer-copy">'+esc(p.note)+'</p>'+
      '<div class="ymc-drawer-section"><dl><div><dt>Type</dt><dd>'+esc(p.kind)+'</dd></div><div><dt>Geography</dt><dd>'+esc(p.geo)+'</dd></div><div><dt>Stage</dt><dd>'+esc(p.stage)+'</dd></div><div><dt>Tier</dt><dd>'+esc(p.tier)+'</dd></div><div><dt>YUME owner</dt><dd>'+esc(p.owner)+'</dd></div></dl></div>'+
      '<div class="ymc-drawer-section"><h4>Capabilities</h4><div class="ymc-decision-meta">'+p.cap.map(x=>'<span>'+esc(x)+'</span>').join('')+'</div></div>'+
      '<div class="ymc-drawer-section"><h4>Next action</h4><p class="ymc-drawer-copy">'+esc(p.next)+'</p></div>';
  }
  if(type==='agenda'){
    const a=DATA.agenda[Number(id)];if(!a)return'';
    return '<span class="ymc-section-label">AGENDA ITEM</span><h2 class="ymc-drawer-title">'+esc(a.title)+'</h2><p class="ymc-drawer-copy">'+esc(a.place)+' · '+esc(a.day)+' · '+esc(a.time)+'</p>'+
      '<div class="ymc-drawer-section"><dl><div><dt>Owner</dt><dd>'+esc(a.owner)+'</dd></div><div><dt>Type</dt><dd>'+esc(a.type)+'</dd></div><div><dt>Status</dt><dd>'+esc(statusLabel(a.status)[0])+'</dd></div></dl></div>'+
      '<div class="ymc-drawer-section"><h4>Why it exists</h4><p class="ymc-drawer-copy">Ogni attività deve essere collegata all’outcome della missione e avere owner, stato e follow-up. Questo dettaglio è il punto di partenza per la scheda operativa reale.</p></div>';
  }
  return'';
}
function renderNav(){
  const nav=state.role==='client'?CLIENT_NAV:INTERNAL_NAV;
  const n=el('[data-ymc-nav]');
  n.innerHTML=nav.map(([id,icon,label])=>'<button type="button" data-ymc-section="'+id+'" class="'+(state.section===id?'is-active':'')+'"><span>'+icon+'</span>'+esc(label)+'</button>').join('');
  const mobile=el('[data-ymc-mobile-nav]');
  const picks=state.role==='client'?[CLIENT_NAV[0],CLIENT_NAV[3],CLIENT_NAV[4],CLIENT_NAV[7]]:[INTERNAL_NAV[0],INTERNAL_NAV[1],INTERNAL_NAV[2],INTERNAL_NAV[4]];
  mobile.innerHTML=picks.map(([id,icon,label])=>'<button type="button" data-ymc-section="'+id+'" class="'+(state.section===id?'is-active':'')+'"><span>'+icon+'</span>'+esc(label)+'</button>').join('')+
    '<button type="button" data-ymc-open-menu><span>•••</span>More</button>';
}
function renderRole(){
  els('[data-ymc-role]').forEach(b=>b.classList.toggle('is-active',b.dataset.ymcRole===state.role));
  el('[data-ymc-avatar]').textContent=state.role==='client'?'AR':'YU';
  el('[data-ymc-profile-name]').textContent=state.role==='client'?DATA.organization.short:'YUME Works Team';
  el('[data-ymc-profile-role]').textContent=state.role==='client'?'Corporate Admin · Demo':'Internal Operations · Demo';
}
function render(){
  el('[data-ymc-gate]').hidden=state.session||state.onboarding;
  el('[data-ymc-onboarding]').hidden=!state.onboarding;
  el('[data-ymc-app]').hidden=!state.session;
  if(state.onboarding){renderOnboarding();return;}
  if(!state.session)return;
  renderNav();renderRole();
  const content=el('[data-ymc-content]');
  content.innerHTML=state.role==='client'?renderClient(state.section):renderInternal(state.section);
  bindDynamic();
  el('[data-ymc-sidebar]').classList.toggle('is-open',!!state.sidebar);
}
function renderClient(section){
  const map={overview:clientOverview,company:clientCompany,mission:clientMission,agenda:clientAgenda,decisions:clientDecisions,participants:clientParticipants,travel:clientTravel,documents:clientDocuments,financials:clientFinancials,followup:clientFollowup};
  return (map[section]||clientOverview)();
}
function clientOverview(){
  const next=DATA.decisions.find(d=>(state.decisionStatus[d.id]||d.status)==='required')||DATA.decisions[0];
  const health=Object.entries(DATA.mission.health).map(([k,v])=>'<div class="ymc-health-row"><span>'+esc(k)+'</span><i><b style="width:'+v+'%"></b></i><strong>'+v+'%</strong></div>').join('');
  return pageHead('MISSION CONTROL · CLIENT','Buongiorno, <em>'+esc(DATA.organization.member.split(' ')[0])+'.</em>','Qui vedete cosa sta muovendo la missione, cosa richiede una decisione e cosa YUME sta qualificando.', '<button class="ymc-btn" data-ymc-drawer-open="decision:'+next.id+'">Next decision</button><button class="ymc-btn ymc-btn--dark" data-ymc-section="mission">Open mission</button>')+
    '<section class="ymc-grid ymc-grid--4">'+
      '<div class="ymc-card ymc-stat"><span>PHASE</span><strong>'+esc(DATA.mission.phase)+'</strong><small>Mission architecture in costruzione</small></div>'+
      '<div class="ymc-card ymc-stat"><span>NEXT MILESTONE</span><strong>20 Oct</strong><small>'+esc(DATA.mission.nextMilestone)+'</small></div>'+
      '<div class="ymc-card ymc-stat"><span>DECISIONS</span><strong>'+DATA.decisions.filter(d=>(state.decisionStatus[d.id]||d.status)!=='approved').length+'</strong><small>aperte / richieste</small></div>'+
      '<div class="ymc-card ymc-stat"><span>PROJECT OWNER</span><strong>YUME</strong><small>'+esc(DATA.mission.owner)+'</small></div>'+
    '</section>'+
    '<section class="ymc-grid ymc-grid--main" style="margin-top:12px">'+
      '<article class="ymc-card ymc-card--dark ymc-next-decision"><span class="ymc-section-label">NEXT DECISION</span><h2>'+esc(next.title)+'</h2><p>'+esc(next.recommendation)+'</p><div class="ymc-decision-meta"><span>Due · '+esc(next.due)+'</span><span>'+esc(next.impact)+'</span></div><div class="ymc-decision-actions"><button class="ymc-btn ymc-btn--accent" data-ymc-decision="'+next.id+':approved">Approva</button><button class="ymc-btn" data-ymc-drawer-open="decision:'+next.id+'">Apri dettaglio</button></div></article>'+
      '<article class="ymc-card"><div class="ymc-card-head"><div><span>MISSION HEALTH</span><h2>Readiness</h2></div><button data-ymc-section="mission">View mission →</button></div><div class="ymc-health">'+health+'</div></article>'+
    '</section>'+
    '<section class="ymc-grid ymc-grid--2" style="margin-top:12px">'+
      '<article class="ymc-card"><div class="ymc-card-head"><div><span>NEXT 72 HOURS</span><h2>Agenda pulse</h2></div><button data-ymc-section="agenda">Full agenda →</button></div>'+agendaTimeline(DATA.agenda.slice(0,4))+'</article>'+
      '<article class="ymc-card"><div class="ymc-card-head"><div><span>VISIBLE NETWORK</span><h2>Project partners</h2></div><button data-ymc-section="mission">Why these →</button></div><div class="ymc-list">'+DATA.visiblePartners.map(p=>'<div class="ymc-list-row"><div><b>'+esc(p.role)+'</b><small>'+esc(p.geo)+' · '+esc(p.note)+'</small></div><span class="ymc-chip">'+esc(p.status)+'</span></div>').join('')+'</div></article>'+
    '</section>';
}
function clientCompany(){
  return pageHead('COMPANY ACCESS','Verified organization. <em>Controlled membership.</em>','Mission Control non nasce da una registrazione libera: l’Organization viene creata e abilitata da YUME dopo la verifica del set documentale e del referente.')+
    '<section class="ymc-grid ymc-grid--3">'+
      '<article class="ymc-card ymc-stat"><span>ORGANIZATION</span><strong>Verified</strong><small>'+esc(DATA.organization.name)+'</small></article>'+
      '<article class="ymc-card ymc-stat"><span>ACCESS MODEL</span><strong>Invite-only</strong><small>YUME-issued membership</small></article>'+
      '<article class="ymc-card ymc-stat"><span>ADMIN</span><strong>1 active</strong><small>'+esc(DATA.organization.member)+'</small></article>'+
    '</section>'+
    '<section class="ymc-grid ymc-grid--2" style="margin-top:12px">'+
      '<article class="ymc-card"><div class="ymc-card-head"><div><span>VERIFICATION RECORD</span><h2>Organization profile</h2></div>'+chip('approved')+'</div><div class="ymc-list">'+
        '<div class="ymc-list-row"><div><b>Ragione sociale</b><small>'+esc(DATA.organization.name)+'</small></div><span>Verified</span></div>'+
        '<div class="ymc-list-row"><div><b>VAT / company identity</b><small>Demo data · production: verified source</small></div><span>Verified</span></div>'+
        '<div class="ymc-list-row"><div><b>Company administrator</b><small>'+esc(DATA.organization.member)+' · '+esc(DATA.organization.role)+'</small></div><span>Active</span></div>'+
        '<div class="ymc-list-row"><div><b>Verification review</b><small>Production: expiry / refresh policy configurable</small></div><span>Annual</span></div>'+
      '</div></article>'+
      '<article class="ymc-card ymc-card--dark"><span class="ymc-section-label">SECURITY PRINCIPLE</span><h2>Access follows the company, not the browser.</h2><p>In produzione il token di onboarding serve solo ad attivare l’identità verificata. L’accesso ordinario passa poi da Supabase Auth / MFA e da Organization Membership, con permessi RLS legati alla missione.</p><div class="ymc-decision-meta"><span>No public signup</span><span>MFA staff</span><span>Audit log</span><span>RLS</span></div></article>'+
    '</section>'+
    '<section class="ymc-card" style="margin-top:12px"><div class="ymc-card-head"><div><span>DOCUMENT POLICY</span><h2>Upload temporaneo. Conservazione controllata.</h2></div></div><p>Visura camerale e documenti di identificazione non devono vivere nel frontend o nel localStorage. La produzione dovrà usare signed upload URL, storage privato, retention policy, access log e cancellazione/aggiornamento secondo la policy YUME validata legalmente.</p></section>';
}

function clientMission(){
  return pageHead('MISSION · '+DATA.mission.id,'Why this mission <em>exists.</em>','Il progetto non parte dall’itinerario: parte dal purpose e dal risultato che deve rientrare in azienda.','<button class="ymc-btn">Mission Book</button><button class="ymc-btn ymc-btn--dark" data-ymc-section="decisions">Open decisions</button>')+
    '<section class="ymc-mission-frame"><div><span>PURPOSE</span><strong>'+esc(DATA.mission.purpose)+'</strong><p>'+esc(DATA.mission.sector)+'</p></div><div><span>ON THE GROUND</span><strong>'+esc(DATA.mission.modules.slice(0,2).join(' + '))+'</strong><p>'+DATA.mission.modules.length+' moduli selezionati</p></div><div><span>RETURN</span><strong>'+esc(DATA.mission.outcome)+'</strong><p>Il criterio di successo deve restare leggibile dopo il rientro.</p></div></section>'+
    '<section class="ymc-grid ymc-grid--2" style="margin-top:12px"><article class="ymc-card"><div class="ymc-card-head"><div><span>GEOGRAPHY</span><h2>Sequence</h2></div></div><div class="ymc-route">'+DATA.mission.route.map((x,i)=>'<span>'+esc(x)+'</span>'+(i<DATA.mission.route.length-1?'<i>→</i>':'')).join('')+'</div><p>Sequenza concettuale. Ogni tappa deve giustificarsi rispetto all’outcome, ai partner qualificati e ai buffer logistici.</p></article><article class="ymc-card"><div class="ymc-card-head"><div><span>MISSION MODULES</span><h2>On the ground</h2></div></div><div class="ymc-decision-meta">'+DATA.mission.modules.map(x=>'<span>'+esc(x)+'</span>').join('')+'</div><p>Il modulo entra nell’agenda solo dopo qualification: accesso, timing, interlocutore, costo e owner.</p></article></section>'+
    '<section class="ymc-card ymc-card--dark ymc-asia-layer" style="margin-top:12px"><div class="ymc-card-head"><div><span>JAPAN CORE · ASIA EXTENSION</span><h2>Asia entra solo se migliora il business case.</h2></div><span class="ymc-chip">Japan Core active</span></div><p>La missione demo resta centrata sul Giappone. Gli hub asiatici sono un layer opzionale da valutare per settore, outcome e continuità regionale, non una collezione di tappe.</p><div class="ymc-asia-grid">'+DATA.asia.map(a=>'<article><span>'+esc(a.name)+'</span><b>'+esc(a.hub)+'</b><small>'+esc(a.role)+'</small><p>'+esc(a.note)+'</p></article>').join('')+'</div></section>'+'<section class="ymc-card" style="margin-top:12px"><div class="ymc-card-head"><div><span>CONTROL LAYER</span><h2>What YUME is orchestrating</h2></div></div><div class="ymc-grid ymc-grid--4"><div class="ymc-stat"><span>BUSINESS</span><strong>Agenda</strong><small>meetings · intelligence · modules</small></div><div class="ymc-stat"><span>TRAVEL</span><strong>Execution</strong><small>flight · hotel · rail · transfer</small></div><div class="ymc-stat"><span>PEOPLE</span><strong>4 pax</strong><small>readiness · roles · needs</small></div><div class="ymc-stat"><span>CONTINUITY</span><strong>Follow-up</strong><small>owner · next action · relation</small></div></div></section>';
}
function agendaTimeline(items){
  return '<div class="ymc-timeline">'+items.map((a,i)=>'<button type="button" class="ymc-timeline-item" data-ymc-drawer-open="agenda:'+DATA.agenda.indexOf(a)+'" style="border:0;background:transparent;text-align:left;width:100%"><span class="ymc-timeline-time">'+esc(a.day)+'<br>'+esc(a.time)+'</span><i class="ymc-timeline-dot is-'+(a.status==='confirmed'?'confirmed':a.status==='pending'?'pending':'')+'"></i><span class="ymc-timeline-body"><b>'+esc(a.title)+'</b><small>'+esc(a.place)+' · '+esc(a.owner)+'</small></span></button>').join('')+'</div>';
}
function clientAgenda(){
  return pageHead('AGENDA','From slots to <em>mission activity.</em>','Ogni appuntamento deve avere uno scopo, uno stato, un owner e un seguito.','<button class="ymc-btn ymc-btn--dark" data-ymc-section="decisions">Open decisions</button>')+
    '<article class="ymc-card"><div class="ymc-card-head"><div><span>MISSION WEEK</span><h2>12–18 April 2027</h2></div><span class="ymc-chip is-amber"><i></i>64% designed</span></div>'+agendaTimeline(DATA.agenda)+'</article>';
}
function clientDecisions(){
  return pageHead('DECISIONS','Nothing important should live only in <em>WhatsApp.</em>','Le decisioni di progetto rimangono leggibili: raccomandazione YUME, impatto, owner, data e stato.')+
    '<section class="ymc-grid ymc-grid--2">'+DATA.decisions.map(d=>{const status=state.decisionStatus[d.id]||d.status;return '<article class="ymc-approval"><div class="ymc-approval-head"><div><span class="ymc-section-label">DUE · '+esc(d.due)+'</span><h3>'+esc(d.title)+'</h3></div>'+chip(status)+'</div><p>'+esc(d.recommendation)+'</p><div class="ymc-decision-meta"><span>'+esc(d.impact)+'</span></div><div class="ymc-approval-actions">'+(status!=='approved'?'<button class="is-primary" data-ymc-decision="'+d.id+':approved">Approva</button><button data-ymc-decision="'+d.id+':discussion">Discutiamone</button>':'<button disabled>Decisione registrata</button>')+'<button data-ymc-drawer-open="decision:'+d.id+'">Dettaglio</button></div></article>'}).join('')+'</section>';
}
function clientParticipants(){
  return pageHead('PARTICIPANTS','People are part of the <em>architecture.</em>','Ruolo aziendale, readiness e bisogni operativi devono stare nello stesso progetto del viaggio.')+
    '<div class="ymc-table-wrap"><table class="ymc-table"><thead><tr><th>Participant</th><th>Role</th><th>Travel</th><th>Documents</th><th>Needs</th></tr></thead><tbody>'+DATA.participants.map(p=>'<tr><td><b>'+esc(p.name)+'</b></td><td>'+esc(p.role)+'</td><td>'+esc(p.travel)+'</td><td>'+esc(p.documents)+'</td><td>'+esc(p.dietary)+'</td></tr>').join('')+'</tbody></table></div>'+
    '<section class="ymc-card" style="margin-top:12px"><span class="ymc-section-label">PERMISSION PRINCIPLE</span><h2>Il corporate admin vede il team. Il traveler vede ciò che gli serve.</h2><p>Dati personali e documentali non vengono resi visibili a tutti per comodità. La futura implementazione usa Organization Membership + Project Permissions + RLS.</p></section>';
}
function clientTravel(){
  return pageHead('TRAVEL','Execution without turning this into a <em>booking engine.</em>','Il cliente vede lo stato operativo del viaggio; YUME mantiene controllo su opzioni, fornitori, timing e conferme.')+
    '<section class="ymc-grid ymc-grid--2">'+DATA.travel.map(t=>'<article class="ymc-card"><div class="ymc-card-head"><div><span>'+esc(t.type)+'</span><h2>'+esc(t.title)+'</h2></div>'+chip(t.status)+'</div><p>'+esc(t.detail)+'</p><button class="ymc-btn ymc-btn--ghost" disabled>Details after qualification</button></article>').join('')+'</section>';
}
function clientDocuments(){
  return pageHead('DOCUMENTS','One project. <em>One document layer.</em>','Versione, owner e visibilità diventano parte del documento, non una convenzione informale.')+
    '<section class="ymc-doc-grid">'+DATA.documents.filter(d=>d.visibility!=='YUME operations').map(d=>'<article class="ymc-doc"><span class="ymc-doc-icon">'+esc(d.type)+'</span><b>'+esc(d.title)+'</b><small>'+esc(d.version)+' · '+esc(d.visibility)+'</small><div class="ymc-doc-actions"><span>'+esc(d.status)+'</span><button data-ymc-toast="Preview: documento non collegato">Open →</button></div></article>').join('')+'</section>';
}
function clientFinancials(){
  return pageHead('FINANCIALS','Client-visible. <em>Not supplier costing.</em>','Il cliente vede valore progetto, pagamenti e extra autorizzati. Net rate, markup, commissioni e supplier terms restano interni.')+
    '<section class="ymc-money-hero"><div class="ymc-money-total"><span>PROJECT VALUE</span><strong>'+money(DATA.financials.value)+'</strong><p>Paid '+money(DATA.financials.paid)+' · Next payment '+money(DATA.financials.next)+' on '+esc(DATA.financials.nextDate)+'</p></div><div class="ymc-money-breakdown">'+DATA.financials.rows.map(r=>'<div class="ymc-money-row"><span>'+esc(r.label)+'</span><b>'+money(r.value)+'</b></div>').join('')+'</div></section>'+
    '<section class="ymc-card" style="margin-top:12px"><span class="ymc-section-label">VISIBILITY BOUNDARY</span><h2>Corporate transparency without exposing internal economics.</h2><p>La futura permission layer separa importi client-visible da costi fornitore, commissioni, overcommission, markup e note finance interne.</p></section>';
}
function clientFollowup(){
  return pageHead('FOLLOW-UP','The trip ends. <em>The mission should not.</em>','Relazioni, owner e next action restano collegate alla missione per costruire continuità nel tempo.')+
    '<section class="ymc-followup-grid">'+DATA.followups.map(f=>'<article class="ymc-followup-card"><span>'+esc(f.status.toUpperCase())+'</span><h3>'+esc(f.company)+'</h3><p>'+esc(f.next)+'</p><footer>Owner · '+esc(f.owner)+' · Due '+esc(f.due)+'</footer></article>').join('')+'</section>'+
    '<section class="ymc-card ymc-card--brass" style="margin-top:12px"><span class="ymc-section-label">ACCOUNT MEMORY</span><h2>Il vantaggio cresce missione dopo missione.</h2><p>Quando la stessa azienda torna in Giappone o Asia, YUME non riparte da zero: storico delle missioni, contatti, decisioni, documenti e follow-up diventano memoria aziendale condivisa.</p></section>';
}
function renderInternal(section){
  const map={network:internalNetwork,onboarding:internalOnboarding,partners:internalPartners,coverage:internalCoverage,pipeline:internalPipeline,roadmap:internalRoadmap,access:internalAccess};
  return (map[section]||internalNetwork)();
}
function internalNetwork(){
  return pageHead('YUME INTERNAL · NETWORK','Build the network <em>with demand.</em>','La rete non deve essere completa prima del lancio. Deve diventare progressivamente più forte, verificabile e tracciabile.','<button class="ymc-btn" data-ymc-section="coverage">Coverage</button><button class="ymc-btn ymc-btn--dark" data-ymc-section="partners">Partner registry</button>')+
    '<section class="ymc-network-hero"><article class="ymc-network-map"><div class="ymc-network-map-inner"><span class="ymc-section-label">JAPAN CORE · ASIA EXTENSION</span><h2>Network maturity is a project asset.</h2><p>Camera di Commercio e relazioni istituzionali possono essere il primo nodo; DMC e travel trade rafforzano execution; specialisti verticali crescono con le missioni reali.</p><div class="ymc-network-nodes"><span class="is-strong">ICCJ target</span><span>JNTO / JATA mapping</span><span>Japan DMCs</span><span>Interpreters</span><span>JETRO / EU-Japan resources</span><span>Sector specialists</span></div></div></article><article class="ymc-card"><div class="ymc-card-head"><div><span>NETWORK COVERAGE</span><h2>Current maturity</h2></div><button data-ymc-section="coverage">Details →</button></div><div class="ymc-coverage">'+DATA.coverage.slice(0,6).map(c=>coverageRow(c)).join('')+'</div></article></section>'+
    '<section class="ymc-grid ymc-grid--3" style="margin-top:12px">'+
      '<article class="ymc-card ymc-stat"><span>MAPPED NODES</span><strong>12</strong><small>demo pipeline · not active partners</small></article>'+
      '<article class="ymc-card ymc-stat"><span>IN QUALIFICATION</span><strong>3</strong><small>DMC / institutional / specialist</small></article>'+
      '<article class="ymc-card ymc-stat"><span>PRINCIPLE</span><strong>Demand-led</strong><small>network depth follows real missions</small></article>'+
    '</section>'+
    '<section class="ymc-card" style="margin-top:12px"><div class="ymc-card-head"><div><span>NEXT RELATIONSHIP MOVES</span><h2>Work in progress</h2></div></div><div class="ymc-list">'+DATA.network.slice(0,4).map(p=>'<div class="ymc-list-row"><div><b>'+esc(p.name)+'</b><small>'+esc(p.stage)+' · Next: '+esc(p.next)+'</small></div><button data-ymc-drawer-open="partner:'+p.id+'">Open →</button></div>').join('')+'</div></section>';
}
function coverageRow(c){return '<div class="ymc-coverage-row"><div class="ymc-coverage-top"><b>'+esc(c.label)+'</b><span>'+esc(c.state)+' · '+c.value+'%</span></div><div class="ymc-coverage-bar"><i style="width:'+c.value+'%"></i></div></div>'}
function internalOnboarding(){
  const reviewStatus=state.onboardingApproved?'Approved · invite ready':state.onboardingSubmitted?'Submitted · review':'Ready for review';
  return pageHead('COMPANY ONBOARDING','Verify first. <em>Activate second.</em>','Nessuna registrazione pubblica: YUME controlla Organization, documenti, referente e livello di accesso prima dell’emissione dell’invito.','<button class="ymc-btn" data-ymc-toast="Preview: nuovo link onboarding non viene inviato">+ Generate onboarding link</button>')+
    '<section class="ymc-grid ymc-grid--3">'+
      '<article class="ymc-card ymc-stat"><span>ACCESS MODEL</span><strong>Invite-only</strong><small>No self-registration</small></article>'+
      '<article class="ymc-card ymc-stat"><span>READY FOR REVIEW</span><strong>'+(state.onboardingApproved?'0':'1')+'</strong><small>'+esc(reviewStatus)+'</small></article>'+
      '<article class="ymc-card ymc-stat"><span>SECURITY</span><strong>Private upload</strong><small>signed URL · expiry · audit</small></article>'+
    '</section>'+
    '<section class="ymc-card" style="margin-top:12px"><div class="ymc-card-head"><div><span>VERIFICATION QUEUE</span><h2>Organizations waiting for YUME</h2></div></div><div class="ymc-table-wrap"><table class="ymc-table"><thead><tr><th>Company</th><th>VAT</th><th>Admin</th><th>Docs</th><th>Status</th><th>Action</th></tr></thead><tbody>'+DATA.onboardingReview.map((r,i)=>'<tr><td><b>'+esc(r.company)+'</b></td><td>'+esc(r.vat)+'</td><td>'+esc(r.admin)+'</td><td>'+esc(r.docs)+'</td><td>'+(i===0?esc(reviewStatus):esc(r.status))+'</td><td><button class="ymc-btn '+(i===0&&!state.onboardingApproved?'ymc-btn--dark':'')+'" '+(i===0&&!state.onboardingApproved?'data-ymc-onboarding-approve':'disabled')+'>'+(i===0?(state.onboardingApproved?'Invite ready':'Review & approve'):'Waiting docs')+'</button></td></tr>').join('')+'</tbody></table></div>'+(state.onboardingApproved?'<div class="ymc-access-issued"><span>ONE-TIME INVITE · DEMO</span><b>YUME-ORG-DEMO-7H2K</b><small>In produzione: link firmato e a scadenza, non token persistente.</small></div>':'')+'</section>'+
    '<section class="ymc-grid ymc-grid--2" style="margin-top:12px"><article class="ymc-card"><span class="ymc-section-label">REQUIRED SET · PREVIEW</span><h2>Configurable company pack</h2><div class="ymc-list"><div class="ymc-list-row"><div><b>Visura camerale</b><small>Recente secondo policy YUME da validare legalmente</small></div><span>Core</span></div><div class="ymc-list-row"><div><b>Identità del legale rappresentante</b><small>O altro meccanismo equivalente di verifica</small></div><span>Core</span></div><div class="ymc-list-row"><div><b>Delega / autorizzazione</b><small>Se il referente amministratore non coincide con il rappresentante</small></div><span>Conditional</span></div><div class="ymc-list-row"><div><b>Privacy / terms</b><small>Consensi e ruoli di trattamento da definire per il servizio reale</small></div><span>Core</span></div></div></article><article class="ymc-card ymc-card--brass"><span class="ymc-section-label">TOKEN LIFECYCLE</span><h2>Upload link ≠ login credential.</h2><p>Il link documentale è temporaneo e monouso. Dopo la verifica YUME crea Organization + Membership e invia l’accesso. Il token di onboarding non deve diventare una password permanente.</p><div class="ymc-route"><span>Invite</span><i>→</i><span>Upload</span><i>→</i><span>Review</span><i>→</i><span>Organization</span><i>→</i><span>Access</span></div></article></section>';
}

function internalPartners(){
  return pageHead('PARTNER REGISTRY','One master. <em>Different channels.</em>','Selection e Works possono condividere lo stesso partner master senza condividere visibilità, regole commerciali o cliente.','<button class="ymc-btn" data-ymc-toast="Preview: creazione partner non attiva">+ New partner</button>')+
    '<section class="ymc-grid ymc-grid--2">'+DATA.network.map(p=>'<article class="ymc-partner-card"><div class="ymc-partner-head"><div><span class="ymc-section-label">'+esc(p.kind)+'</span><strong>'+esc(p.name)+'</strong></div><span class="ymc-chip">'+esc(p.tier)+'</span></div><div class="ymc-partner-meta"><span>'+esc(p.geo)+'</span><span>'+esc(p.stage)+'</span><span>Owner · '+esc(p.owner)+'</span></div><p>'+esc(p.note)+'</p><div class="ymc-partner-actions"><small>Next · '+esc(p.next)+'</small><button data-ymc-drawer-open="partner:'+p.id+'">Open record →</button></div></article>').join('')+'</section>'+
    '<section class="ymc-card ymc-card--dark" style="margin-top:12px"><span class="ymc-section-label">SECRET BOUNDARY</span><h2>Credentials do not belong in normal database fields.</h2><p>Partner username / agency code possono stare nel registry. Password, API secret e credenziali sensibili devono vivere in un secret manager dedicato, referenziato dal CRM ma non esposto nel record partner.</p></section>';
}
function internalCoverage(){
  return pageHead('COVERAGE','See where the network is <em>weak.</em>','Meglio una mappa onesta della maturità che una lista lunga di contatti non qualificati.')+
    '<section class="ymc-grid ymc-grid--2"><article class="ymc-card"><div class="ymc-card-head"><div><span>JAPAN CORE</span><h2>Coverage matrix</h2></div></div><div class="ymc-coverage">'+DATA.coverage.map(c=>coverageRow(c)).join('')+'</div></article><article class="ymc-card ymc-card--brass"><span class="ymc-section-label">NETWORK PRINCIPLE</span><h2>Demand creates depth.</h2><p>Arriva una missione Wine? Rafforziamo buyer, importatori, tasting e interpreti. Arriva Automotive? Rafforziamo Chūbu, supply chain e interpretariato tecnico. Il network cresce con il lavoro reale.</p><div class="ymc-decision-meta"><span>Candidate</span><span>Qualified</span><span>Pilot</span><span>Approved</span><span>Preferred</span></div></article></section>';
}
function internalPipeline(){
  return pageHead('PIPELINE','Relationship stages, <em>not logo collection.</em>','Ogni nodo della rete ha uno stato e una next action. Nessuno diventa “partner” solo perché è stato trovato online.')+
    '<section class="ymc-grid ymc-grid--3">'+DATA.partnerPipeline.map(p=>'<article class="ymc-card ymc-stat"><span>'+esc(p.stage)+'</span><strong>'+p.count+'</strong><small>'+esc(p.detail)+'</small></article>').join('')+'</section>'+
    '<section class="ymc-card" style="margin-top:12px"><div class="ymc-card-head"><div><span>QUALIFICATION LOGIC</span><h2>Candidate → Pilot → Approved.</h2></div></div><div class="ymc-mission-frame"><div><span>CANDIDATE</span><strong>Capability</strong><p>Coverage, corporate fit, language, response time, commercial terms.</p></div><div><span>PILOT</span><strong>Real mission</strong><p>La qualità viene verificata sul lavoro, non soltanto in call commerciali.</p></div><div><span>APPROVED</span><strong>Performance</strong><p>Solo dopo il pilot entrano scoring, preferred status e recurring assignment.</p></div></div></section>';
}
function internalRoadmap(){
  return pageHead('ROADMAP','Launch the system while the <em>network grows.</em>','La piattaforma può partire prima della rete completa: il Partner Registry rende visibile cosa manca e cosa va rafforzato.')+
    '<section class="ymc-roadmap">'+DATA.roadmap.map(r=>'<article><span>'+esc(r.period)+'</span><h3>'+esc(r.title)+'</h3><ul>'+r.items.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></article>').join('')+'</section>'+
    '<section class="ymc-card" style="margin-top:12px"><span class="ymc-section-label">DO NOT BUILD YET</span><h2>Partner portal, booking engine, expense management.</h2><p>La preview mantiene intenzionalmente fuori ciò che oggi aumenterebbe complessità senza validare il core: self-booking, note spese, chat completa, partner login, marketplace e app nativa.</p></section>';
}
function internalAccess(){
  return pageHead('ACCESS ARCHITECTURE','Authentication is infrastructure. <em>Not a custom feature.</em>','La preview non autentica davvero nessuno. La produzione dovrebbe usare identity provider esterno, Organization Membership, MFA e RLS.')+
    '<section class="ymc-auth-architecture"><article class="ymc-auth-card is-recommended"><span>PHASE 1 · RECOMMENDED</span><h3>Supabase Auth</h3><p>Coerente con stack attuale e RLS.</p><ul><li>Staff: password + MFA</li><li>Client: magic link / OTP</li><li>Organization membership</li><li>JWT + RLS per missione</li></ul></article><article class="ymc-auth-card"><span>ENTERPRISE TRIGGER</span><h3>WorkOS</h3><p>Quando un cliente chiede SAML/OIDC/SCIM.</p><ul><li>Enterprise SSO</li><li>Directory sync</li><li>Organization policies</li><li>Upgrade senza riscrivere domain model</li></ul></article><article class="ymc-auth-card"><span>NOT FIRST CHOICE</span><h3>Clerk / Auth0</h3><p>Validi, ma aggiungono un identity stack che oggi non serve.</p><ul><li>Ottima developer UX</li><li>Enterprise features</li><li>Più dipendenza esterna</li><li>Valutabili se cambiano i requisiti</li></ul></article></section>'+
    '<section class="ymc-card" style="margin-top:12px"><div class="ymc-card-head"><div><span>DOMAIN MODEL</span><h2>Do not couple business data to one auth vendor.</h2></div></div><div class="ymc-route"><span>Organization</span><i>→</i><span>Membership</span><i>→</i><span>Mission</span><i>→</i><span>Permission</span><i>→</i><span>Audit log</span></div><p>Le entità business devono usare ID interni YUME. L’identity provider si collega tramite identity_provider + identity_subject, così Supabase oggi e WorkOS domani non richiedono una riscrittura del progetto.</p></section>';
}
function openOnboarding(){
  state.session=false;state.onboarding=true;state.onboardingStep=1;state.onboardingSubmitted=false;state.uploadedDocs={};save();render();
}
function closeOnboarding(){
  state.onboarding=false;state.onboardingSubmitted=false;save();render();
}
function onboardingProgress(){
  const labels=['Azienda','Documenti','Amministratore','Review'];
  return labels.map((label,i)=>'<div class="'+(state.onboardingStep===i+1?'is-active':state.onboardingStep>i+1?'is-complete':'')+'"><span>'+(i+1)+'</span><b>'+label+'</b></div>').join('');
}
function renderOnboarding(){
  const progress=el('[data-ymc-onboarding-progress]'),content=el('[data-ymc-onboarding-content]');
  if(!progress||!content)return;
  progress.innerHTML=onboardingProgress();
  const back=el('[data-ymc-onboarding-back]'),next=el('[data-ymc-onboarding-next]');
  if(state.onboardingSubmitted){
    content.innerHTML='<div class="ymc-onboarding-complete"><span class="ymc-section-label">SUBMITTED TO YUME · DEMO</span><i>✓</i><h1>La richiesta non crea ancora un account.</h1><p>YUME verifica Organization, set documentale e referente. Solo dopo l’approvazione viene creata la Membership e viene inviato l’accesso. In produzione questa fase genererà audit log, scadenza del link e notifica allo staff.</p><div class="ymc-onboarding-statusline"><span class="is-done">Link ricevuto</span><span class="is-done">Documenti inviati</span><span class="is-current">Verifica YUME</span><span>Accesso</span></div><button class="ymc-btn ymc-btn--dark" type="button" data-ymc-close-onboarding>Chiudi preview onboarding</button></div>';
    back.hidden=true;next.hidden=true;
    els('[data-ymc-close-onboarding]').forEach(b=>b.onclick=closeOnboarding);
    return;
  }
  back.hidden=state.onboardingStep===1;next.hidden=false;
  next.textContent=state.onboardingStep===4?'Invia alla verifica YUME →':'Continua →';
  if(state.onboardingStep===1){
    content.innerHTML='<span class="ymc-section-label">STEP 01 · ORGANIZATION</span><h1>Identificare l’azienda, non creare un semplice utente.</h1><p class="ymc-onboarding-lead">Il referente riceve un link nominativo YUME. La produzione dovrà collegare la richiesta a una Organization verificata.</p><div class="ymc-form-grid"><label><span>Ragione sociale</span><input value="Nuova Impresa Demo S.r.l." data-ymc-onboard-field="company"></label><label><span>Partita IVA / VAT</span><input value="IT01122334455" data-ymc-onboard-field="vat"></label><label><span>REA / Registro imprese</span><input value="MI-1234567" data-ymc-onboard-field="rea"></label><label><span>Sede legale</span><input value="Milano, Italia" data-ymc-onboard-field="hq"></label><label class="is-wide"><span>Sito aziendale</span><input value="https://azienda.example" data-ymc-onboard-field="website"></label></div><div class="ymc-form-note"><b>Production rule</b><span>I dati dichiarati vengono confrontati con documentazione/verifiche definite da YUME. Nessun account viene creato in automatico.</span></div>';
  }else if(state.onboardingStep===2){
    const docs=state.uploadedDocs||{};
    content.innerHTML='<span class="ymc-section-label">STEP 02 · DOCUMENT SET</span><h1>Upload temporaneo. Nessun documento nel frontend.</h1><p class="ymc-onboarding-lead">Nella preview i file non vengono trasmessi: salviamo solo il nome nel browser. In produzione useremo storage privato e signed upload URL.</p><div class="ymc-upload-list">'+
      uploadRow('visura','Visura camerale','Core',docs.visura)+
      uploadRow('identity','Identità legale rappresentante','Core',docs.identity)+
      uploadRow('delegation','Delega / autorizzazione','Se richiesta',docs.delegation)+
    '</div><div class="ymc-form-note"><b>Nota legale</b><span>Il set documentale definitivo, le basi giuridiche, retention e modalità di verifica devono essere validati prima del go-live. Questa preview mostra solo il workflow.</span></div>';
  }else if(state.onboardingStep===3){
    content.innerHTML='<span class="ymc-section-label">STEP 03 · CORPORATE ADMIN</span><h1>Chi può amministrare la missione?</h1><p class="ymc-onboarding-lead">Il primo utente non si registra da solo: viene nominato dall’azienda e abilitato da YUME come Organization Admin.</p><div class="ymc-form-grid"><label><span>Nome e cognome</span><input value="Laura Bianchi"></label><label><span>Ruolo aziendale</span><input value="Amministratrice"></label><label><span>Email aziendale</span><input type="email" value="admin@nuovaimpresa.it"></label><label><span>Dominio aziendale</span><input value="nuovaimpresa.it"></label></div><div class="ymc-form-note"><b>Security</b><span>Produzione: email verificata, MFA per ruoli sensibili, audit log e possibilità di revoca immediata della Membership.</span></div>';
  }else{
    const docs=state.uploadedDocs||{};
    content.innerHTML='<span class="ymc-section-label">STEP 04 · REVIEW</span><h1>YUME decide quando l’Organization è pronta.</h1><p class="ymc-onboarding-lead">Inviare il set documentale non equivale a ricevere credenziali. La review interna precede Organization + Membership + accesso.</p><div class="ymc-review-grid"><article><span>ORGANIZATION</span><b>Nuova Impresa Demo S.r.l.</b><small>VAT · IT01122334455</small></article><article><span>DOCUMENTS</span><b>'+((docs.visura?1:0)+(docs.identity?1:0)+(docs.delegation?1:0))+'/3 demo</b><small>Visura + identity richiesti nella preview</small></article><article><span>ADMIN</span><b>Laura Bianchi</b><small>admin@nuovaimpresa.it</small></article><article><span>ACCESS</span><b>Pending YUME</b><small>No account yet</small></article></div><label class="ymc-review-check"><input type="checkbox" data-ymc-onboarding-confirm><span>Confermo di aver compreso che questa è una simulazione UX e che i documenti non vengono trasmessi.</span></label><p class="ymc-access-error" data-ymc-onboarding-error hidden></p>';
  }
  bindOnboardingDynamic();
}
function uploadRow(key,title,requirement,current){
  return '<div class="ymc-upload-row '+(current?'is-ready':'')+'"><div><span>'+esc(requirement)+'</span><b>'+esc(title)+'</b><small>'+(current?esc(current):'Nessun file selezionato')+'</small></div><div><label class="ymc-upload-btn">Scegli file<input type="file" data-ymc-upload="'+key+'" accept=".pdf,.p7m,.jpg,.jpeg,.png"></label><button type="button" data-ymc-demo-doc="'+key+'">Usa demo</button></div></div>';
}
function bindOnboardingDynamic(){
  els('[data-ymc-upload]').forEach(input=>input.onchange=()=>{
    const file=input.files&&input.files[0];if(!file)return;
    state.uploadedDocs[input.dataset.ymcUpload]=file.name;save();renderOnboarding();
  });
  els('[data-ymc-demo-doc]').forEach(btn=>btn.onclick=()=>{
    const names={visura:'visura_demo.pdf',identity:'documento_identita_demo.pdf',delegation:'delega_demo.pdf'};
    state.uploadedDocs[btn.dataset.ymcDemoDoc]=names[btn.dataset.ymcDemoDoc];save();renderOnboarding();
  });
}
function onboardingNext(){
  if(state.onboardingStep===2&&(!state.uploadedDocs.visura||!state.uploadedDocs.identity)){
    const content=el('[data-ymc-onboarding-content]');
    const note=document.createElement('p');note.className='ymc-access-error';note.textContent='Per la preview servono almeno Visura camerale e documento del legale rappresentante.';content.appendChild(note);return;
  }
  if(state.onboardingStep===4){
    const check=el('[data-ymc-onboarding-confirm]'),err=el('[data-ymc-onboarding-error]');
    if(!check||!check.checked){if(err){err.hidden=false;err.textContent='Conferma la natura dimostrativa del flusso prima di inviare.'}return;}
    state.onboardingSubmitted=true;save();renderOnboarding();return;
  }
  state.onboardingStep=Math.min(4,state.onboardingStep+1);save();renderOnboarding();
}
function onboardingBack(){
  state.onboardingStep=Math.max(1,state.onboardingStep-1);save();renderOnboarding();
}

function bindDynamic(){
  els('[data-ymc-section]').forEach(b=>b.onclick=()=>setSection(b.dataset.ymcSection));
  els('[data-ymc-decision]').forEach(b=>b.onclick=()=>{const [id,status]=b.dataset.ymcDecision.split(':');updateDecision(id,status)});
  els('[data-ymc-drawer-open]').forEach(b=>b.onclick=()=>{const [type,id]=b.dataset.ymcDrawerOpen.split(':');openDrawer(type,id)});
  els('[data-ymc-toast]').forEach(b=>b.onclick=()=>toast(b.dataset.ymcToast));
  els('[data-ymc-onboarding-approve]').forEach(b=>b.onclick=()=>{state.onboardingApproved=true;save();render();toast('Organization approvata nella preview: invito nominativo pronto.');});
  els('[data-ymc-open-menu]').forEach(b=>b.onclick=()=>toggleMenu(true));
}
function enter(role){
  if(role==='client'){
    const email=el('[data-ymc-demo-email]')?.value.trim()||'';
    const token=el('[data-ymc-demo-token]')?.value.trim()||'';
    const err=el('[data-ymc-access-error]');
    if(!email.includes('@')||token!=='YUME-DEMO-2701'){
      if(err){err.hidden=false;err.textContent='Accesso demo non valido. Usa email aziendale + token YUME-DEMO-2701.'}
      return;
    }
    if(err)err.hidden=true;
  }
  state.onboarding=false;state.session=true;state.role=role;state.section=role==='client'?'overview':'network';save();render();
}
function logout(){state={...baseState()};save();render()}
function resetPreview(){try{localStorage.removeItem(STORAGE)}catch(_){}state={...baseState(),session:true,role:'client',section:'overview'};save();render();toast('Preview ripristinata.')}
function toggleMenu(open){state.sidebar=typeof open==='boolean'?open:!state.sidebar;el('[data-ymc-sidebar]')?.classList.toggle('is-open',state.sidebar)}
function initStatic(){
  els('[data-ymc-enter]').forEach(b=>b.onclick=()=>enter(b.dataset.ymcEnter));
  els('[data-ymc-open-onboarding]').forEach(b=>b.onclick=openOnboarding);
  els('[data-ymc-close-onboarding]').forEach(b=>b.onclick=closeOnboarding);
  el('[data-ymc-onboarding-next]').onclick=onboardingNext;
  el('[data-ymc-onboarding-back]').onclick=onboardingBack;
  els('[data-ymc-role]').forEach(b=>b.onclick=()=>setRole(b.dataset.ymcRole));
  els('[data-ymc-open-menu]').forEach(b=>b.onclick=()=>toggleMenu(true));
  el('[data-ymc-close-menu]').onclick=()=>toggleMenu(false);
  el('[data-ymc-close-drawer]').onclick=closeDrawer;
  el('[data-ymc-drawer-backdrop]').onclick=closeDrawer;
  el('[data-ymc-project-switch]').onclick=()=>{const m=el('[data-ymc-project-menu]');m.hidden=!m.hidden;el('[data-ymc-project-switch]').setAttribute('aria-expanded',String(!m.hidden))};
  el('[data-ymc-profile]').onclick=()=>{const m=el('[data-ymc-profile-menu]');m.hidden=!m.hidden};
  el('[data-ymc-logout]').onclick=logout;
  el('[data-ymc-reset]').onclick=resetPreview;
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeDrawer();toggleMenu(false);el('[data-ymc-project-menu]').hidden=true;el('[data-ymc-profile-menu]').hidden=true}});
  document.addEventListener('click',e=>{
    if(!e.target.closest('[data-ymc-project-switch]')&&!e.target.closest('[data-ymc-project-menu]'))el('[data-ymc-project-menu]').hidden=true;
    if(!e.target.closest('[data-ymc-profile]')&&!e.target.closest('[data-ymc-profile-menu]'))el('[data-ymc-profile-menu]').hidden=true;
  });
}
document.addEventListener('DOMContentLoaded',()=>{initStatic();render()});
})();