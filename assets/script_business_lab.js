(()=>{'use strict';
const SUPABASE_URL='https://eniewpjsahqzrsxldymh.supabase.co';
const SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuaWV3cGpzYWhxenJzeGxkeW1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NDQ2NTAsImV4cCI6MjA3MTEyMDY1MH0.Yrrl6z4KM1wbEbHbA_Xigs7DurVXWpMM8-3ENNl-7ww';
const STORAGE='yumeBusinessMissionLabV2';
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const uuid=()=>crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2)+Date.now();
const missionId=()=>{const d=new Date(),yy=String(d.getFullYear()).slice(-2),mm=String(d.getMonth()+1).padStart(2,'0'),r=Math.random().toString(36).slice(2,7).toUpperCase();return 'YM-'+yy+mm+'-'+r};
const objectiveLabels={market_access:'Market access',intelligence:'Ecosystem intelligence',sourcing:'Sourcing & partners',innovation:'Innovation & R&D',fair:'Fair / professional event',people:'Leadership / incentive'};
const createState=()=>({missionId:missionId(),sessionToken:uuid(),step:1,objective:'',outcome:'',sector:'',size:'',geo:'japan',destinations:[],activities:[],people:null,seniority:'',period:'',duration:'',support:{agenda:80,logistics:75,language:50,onsite:60,followup:65},budget:'',constraints:'',company:'',name:'',email:'',phone:'',consent:false});
const defaultState=createState();
let state=load();
let navDepth=0;
function load(){try{const x=JSON.parse(localStorage.getItem(STORAGE)||'null');return x?{...defaultState,...x,support:{...defaultState.support,...(x.support||{})}}:{...defaultState}}catch{return{...defaultState}}}
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(state))}catch{}}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function currentAct(step){return step<=2?1:step<=5?2:step<=7?3:4}
function actStart(a){return a===1?1:a===2?3:a===3?6:8}
function readiness(){let n=10;if(state.objective)n+=15;if(state.outcome)n+=15;if(state.sector)n+=10;if(state.geo)n+=10;if(state.destinations.length)n+=10;if(state.activities.length)n+=10;if(state.people||state.seniority)n+=5;if(state.period||state.duration)n+=5;if(state.budget)n+=5;if(state.constraints)n+=5;return Math.min(100,n)}
function summary(){
 const bits=[];
 if(state.objective)bits.push(objectiveLabels[state.objective]||state.objective);
 if(state.sector)bits.push(state.sector);
 if(state.geo==='japan')bits.push('Japan Core');
 if(state.geo==='japan_asia')bits.push('Japan + Asia Extension');
 if(state.geo==='asia')bits.push('Asia Focus');
 if(state.geo==='inbound')bits.push('Asia → Italy');
 return bits.join(' · ')||'Missione da definire';
}
function supportServices(){return Object.entries(state.support).filter(([,v])=>Number(v)>=65).map(([k,v])=>({key:k,value:v}))}
function renderCanvas(){
 q('[data-mission-id]').textContent='Mission ID · '+state.missionId;
 q('[data-canvas-id]').textContent=state.missionId;
 q('[data-canvas-title]').textContent=summary();
 q('[data-canvas-core]').textContent=state.geo==='japan'?'Japan':state.geo==='japan_asia'?'Japan + Asia':state.geo==='asia'?'Asia':'Italy';
 q('[data-canvas-readiness]').textContent=readiness()+'%';
 q('[data-canvas-outcome]').textContent=state.outcome||'Da definire';
 q('[data-canvas-sector]').textContent=state.sector||'Da definire';
 q('[data-canvas-delegation]').textContent=[state.people?state.people+' pax':'',state.seniority,state.period,state.duration].filter(Boolean).join(' · ')||'Da definire';
 q('[data-canvas-budget]').textContent=state.budget||'Da definire';
 const d=q('[data-canvas-destinations]');d.innerHTML=(state.destinations.length?state.destinations:['Japan first']).map(x=>'<span>'+esc(x)+'</span>').join('');
 const a=q('[data-canvas-activities]');a.innerHTML=(state.activities.length?state.activities:['Da comporre']).slice(0,7).map(x=>'<span>'+esc(x)+'</span>').join('');
 q('[data-final-title]')&&(q('[data-final-title]').textContent=summary());
 if(q('[data-final-summary]'))q('[data-final-summary]').textContent=(state.outcome?state.outcome+' ':'')+(state.destinations.length?'Geografia: '+state.destinations.join(' → ')+'. ':'')+(state.activities.length?'Moduli prioritari: '+state.activities.slice(0,5).join(', ')+'.':'');
}
function announceStepError(message,focusTarget){
 const step=q('.yb-lab-step.is-active');
 if(!step)return;
 let box=q('.yb-step-error',step);
 if(!box){
  box=document.createElement('div');
  box.className='yb-step-error';
  box.setAttribute('role','alert');
  const intro=q('p',step);
  (intro||step.firstElementChild)?.insertAdjacentElement('afterend',box);
 }
 box.textContent=message||'';
 box.hidden=!message;
 if(message&&focusTarget&&typeof focusTarget.focus==='function')focusTarget.focus({preventScroll:true});
}
function clearStepError(){
 const step=q('.yb-lab-step.is-active');
 const box=step&&q('.yb-step-error',step);
 if(box){box.textContent='';box.hidden=true}
 qa('.is-invalid',step||document).forEach(x=>x.classList.remove('is-invalid'));
}
function validateStep(step){
 clearStepError();
 if(step===1&&!state.objective){
  const target=q('[data-objective]');
  qa('[data-objective]').forEach(x=>x.classList.add('is-invalid'));
  announceStepError('Scegli l’obiettivo principale della missione.',target);
  return false;
 }
 if(step===2){
  if(!state.outcome.trim()){
   const target=q('[data-outcome]');target.classList.add('is-invalid');
   announceStepError('Descrivi il risultato che vuoi ottenere al ritorno.',target);
   return false;
  }
  if(!state.sector){
   const target=q('[data-sector]');target.classList.add('is-invalid');
   announceStepError('Seleziona il settore dell’azienda o del progetto.',target);
   return false;
  }
 }
 if(step===4&&!state.activities.length){
  const target=q('[data-activity]');
  announceStepError('Seleziona almeno un’attività da includere nella missione.',target);
  return false;
 }
 if(step===5){
  if(!state.people||state.people<1){
   const target=q('[data-people]');target.classList.add('is-invalid');
   announceStepError('Indica il numero previsto di partecipanti.',target);
   return false;
  }
  if(!state.seniority){
   const target=q('[data-seniority]');target.classList.add('is-invalid');
   announceStepError('Indica la seniority prevalente della delegazione.',target);
   return false;
  }
 }
 if(step===7&&!state.budget){
  const target=q('[data-budget]');
  announceStepError('Scegli un range di budget, oppure “Da definire”.',target);
  return false;
 }
 return true;
}
function centerHorizontalControl(container,active){
 if(!container||!active||container.scrollWidth<=container.clientWidth)return;
 const left=Math.max(0,active.offsetLeft-(container.clientWidth-active.clientWidth)/2);
 container.scrollTo({left,behavior:'smooth'});
}
function updateStepNavigation(){
 let activeStepButton=null;
 qa('[data-step-jump]').forEach(b=>{
  const n=+b.dataset.stepJump;
  const active=n===state.step;
  b.classList.toggle('is-active',active);
  b.classList.toggle('is-complete',n<state.step);
  b.setAttribute('aria-current',active?'step':'false');
  if(active)activeStepButton=b;
 });
 const rail=q('.yb-step-rail');
 centerHorizontalControl(rail,activeStepButton);
 const activeAct=q('[data-act].is-active');
 centerHorizontalControl(activeAct&&activeAct.parentElement,activeAct);
}
function showStep(n,options={}){
 const target=Math.max(1,Math.min(8,n));
 const preserveY=window.scrollY;
 state.step=target;
 qa('.yb-lab-step').forEach(x=>x.classList.toggle('is-active',+x.dataset.step===state.step));
 const act=currentAct(state.step),inside=act===1?state.step:act===2?state.step-2:act===3?state.step-5:1,total=act===1?2:act===2?3:act===3?2:1;
 q('[data-step-count]').textContent='Banco '+act+' · '+inside+'/'+total;
 q('[data-progress]').style.width=(state.step/8*100)+'%';
 qa('[data-act]').forEach(b=>b.classList.toggle('is-active',+b.dataset.act===act));
 q('[data-back]').disabled=state.step===1;
 q('[data-next]').hidden=state.step===8;
 updateStepNavigation();
 clearStepError();
 save();
 renderCanvas();

 if(options.history==='push'){
  navDepth+=1;
  history.pushState({ybLabStep:state.step,ybLabDepth:navDepth},'',location.href);
 }else if(options.history==='replace'){
  history.replaceState({ybLabStep:state.step,ybLabDepth:navDepth},'',location.href);
 }

 requestAnimationFrame(()=>{
  if(options.scroll==='step'){
   const active=q('.yb-lab-step.is-active');
   const nav=q('.yb-nav-wrap');
   const mobile=window.matchMedia&&window.matchMedia('(max-width:820px)').matches;
   const target=mobile?(q('.yb-step-rail')||active):active;
   if(target){
    const offset=(nav?nav.getBoundingClientRect().height:76)+10;
    const top=Math.max(0,target.getBoundingClientRect().top+window.scrollY-offset);
    window.scrollTo({top,behavior:options.smooth===false?'auto':'smooth'});
   }
  }else if(options.scroll!=='none'){
   window.scrollTo({top:preserveY,behavior:'auto'});
  }
 });
}
function resetMission(){
 if(!confirm('Vuoi iniziare una nuova missione? La bozza attuale verrà sostituita su questo dispositivo.'))return;
 state=createState();
 navDepth=0;
 try{localStorage.removeItem('yumeBusinessMissionLabTransportV8')}catch{}
 save();
 hydrate();
 renderActivities();
 showStep(1,{history:'replace',scroll:'step'});
}
function hydrate(){
 qa('[data-objective]').forEach(b=>b.classList.toggle('is-selected',b.dataset.objective===state.objective));
 qa('[data-geo]').forEach(b=>b.classList.toggle('is-selected',b.dataset.geo===state.geo));
 qa('[data-budget]').forEach(b=>b.classList.toggle('is-selected',b.dataset.budget===state.budget));
 qa('[data-destination]').forEach(b=>b.classList.toggle('is-selected',state.destinations.includes(b.dataset.destination)));
 q('[data-outcome]').value=state.outcome;q('[data-sector]').value=state.sector;q('[data-size]').value=state.size;
 q('[data-people]').value=state.people??'';q('[data-seniority]').value=state.seniority;q('[data-period]').value=state.period;q('[data-duration]').value=state.duration;q('[data-constraints]').value=state.constraints;
 q('[data-company]').value=state.company||'';q('[data-name]').value=state.name||'';q('[data-email]').value=state.email||'';q('[data-phone]').value=state.phone||'';q('[data-consent]').checked=Boolean(state.consent);
 Object.entries(state.support).forEach(([k,v])=>{const i=q('[data-support="'+k+'"]'),o=q('[data-support-value="'+k+'"]');if(i)i.value=v;if(o)o.textContent=v});
}
function renderActivities(){
 const root=q('[data-activity-chips]'),all=window.YUME_BUSINESS_ACTIVITIES||[];
 const preferred=[];
 const seen=new Set();
 const param=new URLSearchParams(location.search).get('activity');
 if(param){preferred.push(param);seen.add(param)}
 all.forEach(a=>{if(!seen.has(a[1])&&preferred.length<24){preferred.push(a[1]);seen.add(a[1])}});
 root.innerHTML=preferred.map(name=>'<button type="button" class="yb-chip'+(state.activities.includes(name)?' is-selected':'')+'" data-activity="'+esc(name)+'">'+esc(name)+'</button>').join('');
 qa('[data-activity]',root).forEach(b=>b.onclick=()=>{const v=b.dataset.activity,i=state.activities.indexOf(v);if(i>=0)state.activities.splice(i,1);else if(state.activities.length<8)state.activities.push(v);b.classList.toggle('is-selected',state.activities.includes(v));if(state.activities.length)clearStepError();save();renderCanvas()});
}
function attribution(){const p=new URLSearchParams(location.search),utm={};['utm_source','utm_medium','utm_campaign','utm_content','utm_term','ref'].forEach(k=>{if(p.get(k))utm[k]=p.get(k)});try{return{...JSON.parse(sessionStorage.getItem('yumeBusinessAttribution')||'{}'),...utm,referrer:document.referrer||null}}catch{return{...utm,referrer:document.referrer||null}}}
function payload(shared=true){return{
 mission_id:state.missionId,source:'business_mission_lab_v2',schema_version:2,status:'submitted',locale:'it',
 direction:state.geo==='inbound'?'asia_to_italy':state.geo==='asia'?'italy_to_asia':state.geo==='japan_asia'?'bilateral':'italy_to_japan',
 company:{name:state.company,size:state.size||null},
 contact:{name:state.name,email:state.email||null,phone:state.phone||null},
 objective:objectiveLabels[state.objective]||state.objective||null,desired_outcome:state.outcome||null,sector:state.sector||null,company_size:state.size||null,
 delegation:{participants:state.people||null,seniority:state.seniority||null},
 timing:{period:state.period||null,duration:state.duration||null},
 budget_band:state.budget||null,selected_activities:state.activities,destinations:state.destinations,
 services:supportServices(),constraints:{notes:state.constraints||null,support:state.support,geo_mode:state.geo},
 notes:null,attribution:attribution(),consent_to_contact:shared===true,page_path:location.pathname,user_agent:navigator.userAgent
}}
function firstIncompleteStep(){
 if(!state.objective)return 1;
 if(!state.outcome.trim()||!state.sector)return 2;
 if(!state.activities.length)return 4;
 if(!state.people||state.people<1||!state.seniority)return 5;
 if(!state.budget)return 7;
 return 0;
}
async function share(){
 const status=q('[data-share-status]');state.company=q('[data-company]').value.trim();state.name=q('[data-name]').value.trim();state.email=q('[data-email]').value.trim();state.phone=q('[data-phone]').value.trim();state.consent=q('[data-consent]').checked;save();
 const missing=firstIncompleteStep();
 if(missing){
  status.textContent='Completa prima i passaggi obbligatori del Mission Brief.';
  status.className='yb-status is-error';
  showStep(missing,{history:'push',scroll:'step'});
  validateStep(missing);
  return;
 }
 if(!state.company||!state.name){status.textContent='Inserisci azienda e referente.';status.className='yb-status is-error';return}
 if(!state.email&&!state.phone){status.textContent='Inserisci almeno email o telefono.';status.className='yb-status is-error';return}
 if(state.email&&(!state.email.includes('@')||!state.email.includes('.'))){status.textContent='Inserisci un indirizzo email valido.';status.className='yb-status is-error';return}
 if(state.phone&&state.phone.replace(/[^0-9]/g,'').length<6){status.textContent='Inserisci un numero di telefono valido.';status.className='yb-status is-error';return}
 if(!q('[data-consent]').checked){status.textContent='Serve il consenso al ricontatto per condividere il Mission Concept.';status.className='yb-status is-error';return}
 const btn=q('[data-share]');btn.disabled=true;status.textContent='Condivisione in corso…';status.className='yb-status';
 try{const res=await fetch(SUPABASE_URL+'/rest/v1/business_mission_briefs',{method:'POST',headers:{apikey:SUPABASE_KEY,Authorization:'Bearer '+SUPABASE_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(payload(true))});if(!res.ok){const detail=await res.text();console.error('Mission Lab submit failed',res.status,detail);throw new Error('HTTP '+res.status)}state.submittedMissionId=state.missionId;state.submittedAt=new Date().toISOString();save();status.textContent='Mission Concept '+state.missionId+' condiviso con YUME.';status.className='yb-status is-ok';btn.textContent='Condiviso ✓'}catch(e){console.error(e);status.textContent='Invio non riuscito'+(e&&e.message?' ('+e.message+')':'')+'. La bozza resta salvata su questo dispositivo.';status.className='yb-status is-error';btn.disabled=false}
}
function openMissionBook(){
 const w=window.open('','_blank');if(!w)return;

 const objective=objectiveLabels[state.objective]||state.objective||'Obiettivo da definire';
 const geoLabel=state.geo==='japan'?'Japan Core':state.geo==='japan_asia'?'Japan Core + Asia Extension':state.geo==='asia'?'Asia Focus':'Asia → Italy';
 const delegation=[state.people?state.people+' pax':'',state.seniority].filter(Boolean).join(' · ')||'Da definire';
 const timing=[state.period,state.duration].filter(Boolean).join(' · ')||'Da definire';
 const briefReadiness=readiness();
 const generatedAt=new Intl.DateTimeFormat('it-IT',{day:'2-digit',month:'long',year:'numeric'}).format(new Date());
 const route=state.destinations.length?state.destinations:['Geografia da definire'];
 const modules=state.activities.length?state.activities:['Moduli da definire'];
 const supportLabels={agenda:'Agenda business',logistics:'Logistica & transfer',language:'Interpretariato',onsite:'On-ground presence',followup:'Follow-up'};
 const supportEntries=Object.entries(state.support||{}).map(([key,value])=>({key,label:supportLabels[key]||key,value:Number(value)||0}));
 const highSupport=supportEntries.filter(x=>x.value>=65).map(x=>x.label);
 const destinationMeta={
  'Tokyo':{role:'MARKET · HQ · INNOVATION',note:'Mercato, headquarters, retail intelligence, startup, fiere, università e istituzioni.'},
  'Nagoya / Chūbu':{role:'MANUFACTURING · MOBILITY',note:'Automotive, machinery, supplier networks, qualità e industrial learning.'},
  'Osaka / Kansai':{role:'TRADE · FOOD · LIFE SCIENCE',note:'Commerciale, food, healthcare, consumer e accesso al Kansai industriale.'},
  'Regional Japan':{role:'CLUSTER · DISTRICTS',note:'Distretti produttivi, specializzazioni regionali, territori e filiere da qualificare.'},
  'Seoul':{role:'TECH · CONSUMER · BEAUTY',note:'Digital, electronics, beauty, mobility e trend consumer come estensione asiatica.'},
  'Singapore':{role:'APAC HQ · DIGITAL GATEWAY',note:'Regional management, servizi, fintech, digital economy e innovation.'},
  'Hong Kong':{role:'TRADE · FINANCE',note:'Trade, finance, distribution e connessioni regionali da valutare sul business case.'},
  'Taiwan':{role:'ELECTRONICS · SUPPLY CHAIN',note:'Elettronica, semiconduttori e supply chain da qualificare in funzione del progetto.'},
  'Italy':{role:'INCOMING · SOURCING',note:'Distretti, produttori, design, food e filiere italiane per delegazioni asiatiche.'}
 };
 const routeCards=route.map((name,i)=>{
  const meta=destinationMeta[name]||{role:(i===0?'INGRESSO':i===route.length-1?'CHIUSURA':'SEQUENZA'),note:'Ecosistema da collegare all’outcome della missione.'};
  return '<article class="route-card"><em>'+String(i+1).padStart(2,'0')+'</em><div><small>'+esc(meta.role)+'</small><b>'+esc(name)+'</b><p>'+esc(meta.note)+'</p></div></article>';
 }).join('');
 const moduleCards=modules.map((name,i)=>'<article class="module-card"><small>MODULO '+String(i+1).padStart(2,'0')+'</small><b>'+esc(name)+'</b><p>Da qualificare per fattibilità, interlocutori, timing e livello di supporto richiesto.</p></article>').join('');
 const supportBars=supportEntries.map(x=>'<div class="bar"><span>'+esc(x.label)+'</span><i><b style="width:'+Math.max(0,Math.min(100,x.value))+'%"></b></i><strong>'+x.value+'</strong></div>').join('');
 const routeSketch=(()=>{
  const names=route.slice(0,6);
  const w=760,h=170,pad=64;
  if(!names.length)return '';
  const step=names.length===1?0:(w-pad*2)/(names.length-1);
  const pts=names.map((name,i)=>({name,x:names.length===1?w/2:pad+step*i,y:i%2===0?82:108}));
  const lines=pts.slice(1).map((p,i)=>'<line x1="'+pts[i].x+'" y1="'+pts[i].y+'" x2="'+p.x+'" y2="'+p.y+'" stroke="#B79A62" stroke-width="2" stroke-dasharray="5 5"/><path d="M '+(p.x-9)+' '+(p.y-5)+' L '+p.x+' '+p.y+' L '+(p.x-9)+' '+(p.y+5)+'" fill="none" stroke="#B79A62" stroke-width="2"/>').join('');
  const nodes=pts.map((p,i)=>'<circle cx="'+p.x+'" cy="'+p.y+'" r="'+(i===0||i===pts.length-1?11:8)+'" fill="'+(i===0||i===pts.length-1?'#A9232F':'#111923')+'"/><text class="route-node-index" x="'+p.x+'" y="'+(p.y+3)+'" text-anchor="middle">'+String(i+1).padStart(2,'0')+'</text><text class="route-node-label" x="'+p.x+'" y="'+(p.y-22)+'" text-anchor="middle">'+esc(p.name)+'</text>').join('');
  return '<div class="sketch-note">Schema di missione · sequenza concettuale, non itinerario operativo</div><svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="Sequenza geografica della missione">'+lines+nodes+'</svg>';
 })();

 const missionReading=(state.outcome
  ? 'La missione nasce per '+objective.toLowerCase()+' nel settore '+(state.sector||'da definire')+'. Il risultato atteso dichiarato è: “'+state.outcome+'”.'
  : 'La missione è impostata su '+objective.toLowerCase()+' nel settore '+(state.sector||'da definire')+'. L’outcome operativo deve ancora essere completato.');
 const architectureReading='La geografia selezionata è '+geoLabel+'. '+(route.length>1?'La sequenza include '+route.join(' → ')+'.':'La geografia è ancora concentrata su un solo ecosistema.')+' I moduli prioritari sono '+modules.join(', ')+'.';
 const supportReading=highSupport.length
  ? 'La regia YUME richiesta è più intensa su: '+highSupport.join(', ')+'.'
  : 'Il livello di regia YUME è ancora da calibrare sui singoli servizi.';
 const nextChecks=[
  'Verifica di accesso, disponibilità e reale pertinenza degli interlocutori / siti da coinvolgere.',
  'Validazione della sequenza geografica, dei tempi di trasferimento e dei buffer operativi.',
  'Allineamento tra moduli richiesti, livello di regia YUME e budget indicativo.',
  'Definizione degli output di ciascun incontro o visita e dei materiali preparatori.',
  'Costruzione del follow-up: owner, next action e continuità delle relazioni dopo il rientro.'
 ];
 const supportAverage=Math.round(supportEntries.reduce((sum,x)=>sum+x.value,0)/Math.max(1,supportEntries.length));
 const intelligence=[
  {
   label:'GEOGRAPHIC LOAD',
   title:route.length>=4?'Missione multi-ecosistema':route.length>=2?'Sequenza concentrata':'Focus geografico',
   copy:route.length>=4?'La geografia è ampia: prima della proposta va verificato se ogni tappa produce abbastanza valore da giustificare trasferimenti e buffer.':route.length>=2?'La missione ha una sequenza leggibile. Il passaggio successivo è attribuire un ruolo preciso a ogni ecosistema.':'La concentrazione geografica favorisce profondità; il valore dipenderà dalla qualità degli interlocutori e dei moduli.'
  },
  {
   label:'MISSION DENSITY',
   title:modules.length>=5?'Architettura ad alta densità':modules.length>=3?'Architettura articolata':'Architettura essenziale',
   copy:modules.length>=5?'Molti moduli richiedono priorità chiare per evitare un’agenda piena ma poco produttiva.':modules.length>=3?'I moduli selezionati possono convivere, ma vanno ordinati per outcome primario e secondario.':'Pochi moduli consentono un progetto focalizzato e più semplice da qualificare.'
  },
  {
   label:'YUME CONTROL',
   title:supportAverage>=70?'Regia YUME alta':supportAverage>=45?'Regia YUME bilanciata':'Regia YUME leggera',
   copy:supportAverage>=70?'Il brief richiede una presenza forte di YUME su agenda, logistica e continuità operativa.':supportAverage>=45?'Il livello di presidio è intermedio: alcune componenti possono essere autonome, altre richiedono coordinamento.':'La missione può lasciare maggiore autonomia alla delegazione, concentrando YUME sui passaggi critici.'
  }
 ];

 w.document.write('<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+state.missionId+' · YUME Executive Mission Book</title><style>'+
 '*{box-sizing:border-box}html{-webkit-print-color-adjust:exact;print-color-adjust:exact}body{margin:0;background:#ECE8DF;color:#111923;font-family:Arial,sans-serif}main{max-width:1080px;margin:auto;padding:34px}.ey{font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:#987444;font-weight:700}.muted{color:#66717C;line-height:1.68}.hero{min-height:560px;display:grid;grid-template-columns:1.12fr .88fr;gap:42px;align-items:center;padding:60px 0 48px;border-bottom:1px solid #D8D1C5}.brand{display:flex;align-items:center;gap:12px;margin-bottom:48px}.brand img{width:54px;height:54px;border-radius:50%;object-fit:cover;border:1px solid #D8D1C5}.brand strong{display:block;font-size:15px;letter-spacing:.15em}.brand span{display:block;margin-top:5px;font-size:8px;letter-spacing:.17em;color:#987444}.hero h1{font:500 64px/0.96 Georgia,serif;letter-spacing:-.035em;margin:12px 0 22px;max-width:720px}.hero-copy{max-width:680px;font-size:17px;line-height:1.65;color:#56616C}.pills,.tags{display:flex;gap:7px;flex-wrap:wrap}.pills{margin-top:24px}.pills span,.tags span{border:1px solid #D6CEC2;border-radius:999px;padding:8px 10px;font-size:10px;background:rgba(255,255,255,.45)}.mission-orb{aspect-ratio:1;border:1px solid #CFBE9D;border-radius:50%;display:grid;place-items:center;text-align:center;background:radial-gradient(circle at 50% 40%,#FFFDF7,#F1EADF 70%)}.mission-orb b{display:block;font:500 34px/1.05 Georgia,serif}.mission-orb strong{display:block;margin-top:8px;font-size:52px;line-height:1;color:#A9232F}.mission-orb p{font-size:11px;color:#6F7478;line-height:1.55}.sheet{background:#FFFDF9;border:1px solid #DED7CB;border-radius:24px;padding:30px;margin:24px 0;box-shadow:0 8px 28px rgba(17,25,35,.035)}.sheet h2{font:500 35px/1.05 Georgia,serif;margin:8px 0 20px;letter-spacing:-.02em}.sheet h3{font:500 23px/1.1 Georgia,serif;margin:7px 0 12px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:22px}.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.snapshot>div{padding:18px;border-radius:16px;background:#F5F2EC;border:1px solid #E7E0D5}.snapshot small{display:block;font-size:8px;letter-spacing:.13em;color:#8C744E;text-transform:uppercase}.snapshot b{display:block;margin-top:8px;font-size:16px;line-height:1.35}.decision-frame{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.decision-frame>div{min-height:175px;padding:19px;border-radius:17px;background:#111923;color:#fff}.decision-frame small{font-size:8px;letter-spacing:.14em;color:#D7BD8C}.decision-frame b{display:block;margin:25px 0 8px;font:500 23px/1.08 Georgia,serif}.decision-frame p{margin:0;color:rgba(255,255,255,.63);font-size:11px;line-height:1.55}.route-sketch{margin:6px 0 18px}.route-sketch svg{width:100%;height:auto;display:block}.route-node-label{font:10px Arial,sans-serif;fill:#65707A}.route-node-index{font:700 7px Arial,sans-serif;fill:#fff}.sketch-note{font-size:8px;letter-spacing:.12em;color:#987444;text-transform:uppercase}.route-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.route-card{display:flex;gap:12px;padding:15px;border:1px solid #E4DED4;border-radius:15px;background:#fff}.route-card em{font:500 20px Georgia,serif;color:#B79A62}.route-card small,.route-card p{display:block;margin:3px 0;color:#76808A;font-size:9px;line-height:1.45}.route-card b{display:block;font-size:14px}.module-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.module-card{padding:17px;border-radius:16px;background:#F4F1EA;border:1px solid #E4DED4}.module-card small{font-size:8px;letter-spacing:.12em;color:#A9232F}.module-card b{display:block;margin-top:9px;font:500 19px/1.08 Georgia,serif}.module-card p{margin:8px 0 0;color:#6A747C;font-size:10px;line-height:1.55}.bar{display:grid;grid-template-columns:130px 1fr 28px;gap:9px;align-items:center;font-size:10px;margin:13px 0}.bar i{height:5px;border-radius:999px;background:#E7E1D7;overflow:hidden}.bar i b{display:block;height:100%;background:linear-gradient(90deg,#A9232F,#B79A62)}.bar strong{text-align:right}.checklist{margin:0;padding-left:20px}.checklist li{margin:11px 0;color:#5F6870;line-height:1.55}.riskbox{padding:18px;border-radius:16px;background:#F6F1E6;border-left:3px solid #B79A62}.riskbox strong{display:block;margin-bottom:7px}.footer-note{margin-top:14px;padding-top:15px;border-top:1px solid #E4DDD1;color:#7C8186;font-size:9px;line-height:1.55}.actions{position:sticky;bottom:10px;z-index:10;display:flex;justify-content:center;gap:8px}.actions button{padding:13px 18px;border-radius:11px;border:0;background:#111923;color:#fff;font-weight:bold}.actions .alt{background:#fff;color:#111923;border:1px solid #D8D1C5}@media(max-width:720px){main{padding:16px}.hero{grid-template-columns:1fr;min-height:auto;padding:36px 0}.brand{margin-bottom:28px}.hero h1{font-size:44px}.mission-orb{max-width:280px}.grid,.grid-3,.decision-frame,.route-grid,.module-grid{grid-template-columns:1fr}.sheet{padding:20px}.actions{flex-wrap:wrap}.bar{grid-template-columns:105px 1fr 24px}}@media print{body{background:#fff}.actions{display:none}.hero{min-height:88vh;page-break-after:always}.sheet{break-inside:avoid;box-shadow:none}.route-card,.module-card,.snapshot>div,.decision-frame>div{break-inside:avoid}@page{size:A4;margin:11mm}}'+
 '</style></head><body><main>'+
 '<section class="hero"><div><div class="brand"><img src="/assets/logo-yume.jpg" alt=""><div><strong>YUME</strong><span>WORKS · JAPAN / ASIA</span></div></div><div class="ey">EXECUTIVE MISSION BOOK · '+esc(generatedAt)+(state.company?' · PREPARED FOR '+esc(state.company.toUpperCase()):'')+'</div><h1>'+esc(objective)+'<br><em style="font-style:italic;color:#987444">'+esc(state.sector||'Business mission')+'</em></h1><p class="hero-copy">'+esc(state.outcome||'Outcome ancora da definire: il Mission Book raccoglie la struttura del progetto prima della qualificazione YUME.')+'</p><div class="pills"><span>'+esc(geoLabel)+'</span><span>'+esc(timing)+'</span><span>'+esc(state.budget||'Budget da definire')+'</span><span>'+esc(delegation)+'</span></div></div><div class="mission-orb"><div><div class="ey">MISSION ID</div><b>'+esc(state.missionId)+'</b><strong>'+briefReadiness+'%</strong><p>completezza del brief<br>'+route.length+' ecosistemi · '+modules.length+' moduli</p></div></div></section>'+
 '<section class="sheet"><div class="ey">01 · EXECUTIVE SNAPSHOT</div><h2>La missione in una pagina.</h2><div class="grid-3 snapshot"><div><small>OBIETTIVO</small><b>'+esc(objective)+'</b></div><div><small>SETTORE</small><b>'+esc(state.sector||'Da definire')+'</b></div><div><small>DELEGAZIONE</small><b>'+esc(delegation)+'</b></div><div><small>GEOGRAFIA</small><b>'+esc(geoLabel)+'</b></div><div><small>TIMING</small><b>'+esc(timing)+'</b></div><div><small>BUDGET</small><b>'+esc(state.budget||'Da definire')+'</b></div></div></section>'+
 '<section class="sheet"><div class="ey">02 · DECISION FRAME</div><h2>Perché partire, cosa deve succedere, cosa deve tornare.</h2><div class="decision-frame"><div><small>PURPOSE</small><b>'+esc(objective)+'</b><p>'+esc(state.sector||'Settore da definire')+'</p></div><div><small>ON THE GROUND</small><b>'+esc(modules.slice(0,2).join(' + '))+'</b><p>'+(modules.length>2?'+'+(modules.length-2)+' moduli complementari':'Architettura concentrata sui moduli selezionati')+'</p></div><div><small>RETURN</small><b>'+esc(state.outcome||'Outcome da definire')+'</b><p>Il criterio di successo deve restare leggibile anche dopo il rientro.</p></div></div></section>'+
 '<section class="sheet grid"><div><div class="ey">03 · YUME READING</div><h2>'+esc(summary())+'</h2><p class="muted">'+esc(missionReading)+'</p></div><div><div class="ey">MISSION ARCHITECTURE</div><h2>'+esc(geoLabel)+'</h2><p class="muted">'+esc(architectureReading)+'</p><p class="muted">'+esc(supportReading)+'</p></div></section>'+
 '<section class="sheet"><div class="ey">04 · GEOGRAPHY & SEQUENCE</div><h2>Non una lista di città. Una sequenza da rendere utile.</h2><div class="route-sketch">'+routeSketch+'</div><div class="route-grid">'+routeCards+'</div><div class="footer-note">La sequenza qui rappresentata è concettuale. Ordine, date, accessi, distanze, trasporti e fattibilità vengono verificati durante la qualificazione del progetto.</div></section>'+
 '<section class="sheet"><div class="ey">05 · MISSION MODULES</div><h2>Cosa deve succedere sul campo.</h2><div class="module-grid">'+moduleCards+'</div></section>'+
 '<section class="sheet grid"><div><div class="ey">06 · YUME ORCHESTRATION PROFILE</div><h2>Dove serve più regia.</h2>'+supportBars+'</div><div><div class="ey">07 · REALITY CHECK</div><h2>Vincoli e assunzioni.</h2><div class="riskbox"><strong>Vincoli dichiarati</strong><span class="muted">'+esc(state.constraints||'Nessun vincolo aggiuntivo indicato.')+'</span></div><p class="muted">Budget, agenda, interpreti, accessi, disponibilità e livelli di servizio devono ancora essere verificati sul progetto reale.</p></div></section>'+
 '<section class="sheet"><div class="ey">08 · MISSION INTELLIGENCE</div><h2>Tre letture da proteggere prima della proposta.</h2><div class="decision-frame">'+intelligence.map(x=>'<div><small>'+esc(x.label)+'</small><b>'+esc(x.title)+'</b><p>'+esc(x.copy)+'</p></div>').join('')+'</div></section>'+
 '<section class="sheet"><div class="ey">09 · YUME QUALIFICATION LAYER</div><h2>Dal Mission Concept alla missione eseguibile.</h2><ul class="checklist">'+nextChecks.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></section>'+
 '<section class="sheet"><div class="ey">10 · NEXT STEP</div><h2>Dal brief alla regia.</h2><p class="muted">Questo Mission Book non è un preventivo automatico e non conferma accessi, disponibilità, incontri o servizi. È il documento di lavoro che evita di ripartire da zero: YUME può usarlo per qualificare interlocutori, geografia, agenda, logistica, supporto linguistico, hospitality e costi reali mantenendo leggibile l’outcome che il progetto deve produrre.</p><div class="footer-note">YUME Works · Japan Core / Asia Extension · Yume Travel Tech S.r.l. · '+esc(state.missionId)+'</div></section>'+
 '<div class="actions"><button onclick="window.print()">Salva / stampa PDF</button><button class="alt" onclick="window.close()">Continua nel Lab</button></div>'+
 '</main></body></html>');
 w.document.close();
}
function bind(){
 qa('[data-objective]').forEach(b=>b.onclick=()=>{state.objective=b.dataset.objective;qa('[data-objective]').forEach(x=>{x.classList.toggle('is-selected',x===b);x.classList.remove('is-invalid')});clearStepError();save();renderCanvas()});
 qa('[data-geo]').forEach(b=>b.onclick=()=>{state.geo=b.dataset.geo;qa('[data-geo]').forEach(x=>x.classList.toggle('is-selected',x===b));save();renderCanvas()});
 qa('[data-budget]').forEach(b=>b.onclick=()=>{state.budget=b.dataset.budget;qa('[data-budget]').forEach(x=>x.classList.toggle('is-selected',x===b));clearStepError();save();renderCanvas()});
 qa('[data-destination]').forEach(b=>b.onclick=()=>{const v=b.dataset.destination,i=state.destinations.indexOf(v);if(i>=0)state.destinations.splice(i,1);else if(state.destinations.length<6)state.destinations.push(v);b.classList.toggle('is-selected',state.destinations.includes(v));save();renderCanvas()});
 q('[data-outcome]').oninput=e=>{state.outcome=e.target.value;e.target.classList.remove('is-invalid');clearStepError();save();renderCanvas()};
 q('[data-sector]').onchange=e=>{state.sector=e.target.value;e.target.classList.remove('is-invalid');clearStepError();save();renderCanvas()};
 q('[data-size]').onchange=e=>{state.size=e.target.value;save()};
 q('[data-people]').oninput=e=>{state.people=e.target.value?Number(e.target.value):null;e.target.classList.remove('is-invalid');clearStepError();save();renderCanvas()};
 q('[data-seniority]').onchange=e=>{state.seniority=e.target.value;e.target.classList.remove('is-invalid');clearStepError();save();renderCanvas()};
 q('[data-period]').oninput=e=>{state.period=e.target.value;save();renderCanvas()};
 q('[data-duration]').onchange=e=>{state.duration=e.target.value;save();renderCanvas()};
 qa('[data-support]').forEach(i=>i.oninput=()=>{state.support[i.dataset.support]=Number(i.value);q('[data-support-value="'+i.dataset.support+'"]').textContent=i.value;save();renderCanvas()});
 q('[data-constraints]').oninput=e=>{state.constraints=e.target.value;save()};
 q('[data-company]').oninput=e=>{state.company=e.target.value;save()};
 q('[data-name]').oninput=e=>{state.name=e.target.value;save()};
 q('[data-email]').oninput=e=>{state.email=e.target.value;save()};
 q('[data-phone]').oninput=e=>{state.phone=e.target.value;save()};
 q('[data-consent]').onchange=e=>{state.consent=e.target.checked;save()};

 q('[data-next]').onclick=()=>{if(validateStep(state.step))showStep(state.step+1,{history:'push',scroll:'step'})};
 q('[data-back]').onclick=()=>{
  if(state.step<=1)return;
  if(navDepth>0)history.back();
  else showStep(state.step-1,{history:'replace',scroll:'step'});
 };
 qa('[data-act]').forEach(b=>b.onclick=()=>showStep(actStart(+b.dataset.act),{history:'push',scroll:'step'}));
 qa('[data-step-jump]').forEach(b=>b.onclick=()=>showStep(+b.dataset.stepJump,{history:'push',scroll:'step'}));
 q('[data-restart]')&&(q('[data-restart]').onclick=resetMission);
 const summaryBtn=q('[data-summary-toggle]');
 const summary=q('.yb-lab-canvas');
 if(summaryBtn&&summary){
  summaryBtn.onclick=()=>{
   const open=summary.classList.toggle('is-mobile-open');
   summaryBtn.setAttribute('aria-expanded',open?'true':'false');
   summaryBtn.textContent=open?'Chiudi riepilogo':'Riepilogo';
  };
 }
 q('[data-share]').onclick=share;
 q('[data-print]').onclick=openMissionBook;

 window.addEventListener('popstate',e=>{
  const n=e.state&&Number(e.state.ybLabStep);
  navDepth=e.state&&Number.isFinite(Number(e.state.ybLabDepth))?Number(e.state.ybLabDepth):0;
  if(n>=1&&n<=8)showStep(n,{history:'none',scroll:'step'});
 });
}
function init(){
 renderActivities();
 hydrate();
 bind();
 navDepth=history.state&&Number.isFinite(Number(history.state.ybLabDepth))?Number(history.state.ybLabDepth):0;
 const initial=(history.state&&Number(history.state.ybLabStep))||state.step||1;
 showStep(initial,{history:'replace',scroll:'none'});
 const pre=new URLSearchParams(location.search).get('activity');
 if(pre&&!state.activities.includes(pre)){state.activities.push(pre);renderActivities();save();renderCanvas()}
}
document.addEventListener('DOMContentLoaded',init);
})();