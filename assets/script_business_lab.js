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
   active&&active.scrollIntoView({block:'start',behavior:options.smooth===false?'auto':'smooth'});
  }else if(options.scroll!=='none'){
   window.scrollTo({top:preserveY,behavior:'auto'});
  }
 });
}
function resetMission(){
 if(!confirm('Vuoi iniziare una nuova missione? La bozza attuale verrà sostituita su questo dispositivo.'))return;
 state=createState();
 navDepth=0;
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
 try{const res=await fetch(SUPABASE_URL+'/rest/v1/business_mission_briefs',{method:'POST',headers:{apikey:SUPABASE_KEY,Authorization:'Bearer '+SUPABASE_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(payload(true))});if(!res.ok){const detail=await res.text();console.error('Mission Lab submit failed',res.status,detail);throw new Error('HTTP '+res.status)}status.textContent='Mission Concept '+state.missionId+' condiviso con YUME.';status.className='yb-status is-ok';btn.textContent='Condiviso ✓';save()}catch(e){console.error(e);status.textContent='Invio non riuscito'+(e&&e.message?' ('+e.message+')':'')+'. La bozza resta salvata su questo dispositivo.';status.className='yb-status is-error';btn.disabled=false}
}
function openMissionBook(){
 const w=window.open('','_blank');if(!w)return;
 const activities=state.activities.map(x=>'<li>'+esc(x)+'</li>').join('')||'<li>Da definire</li>',dest=state.destinations.map(x=>'<span>'+esc(x)+'</span>').join('')||'<span>Japan first</span>';
 w.document.write('<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+state.missionId+' · YUME Mission Book</title><style>body{margin:0;background:#f5f2eb;color:#111923;font-family:Arial,sans-serif}main{max-width:1000px;margin:auto;padding:35px}.hero{padding:70px 0;border-bottom:1px solid #d9d2c6}.ey{font-size:10px;letter-spacing:.18em;color:#9a7540}.hero h1{font:58px Georgia,serif;margin:14px 0}.id{display:inline-block;padding:10px 14px;background:#111923;color:#fff;border-radius:9px}.sheet{background:#fff;border:1px solid #ded8cf;border-radius:22px;padding:28px;margin:22px 0}.sheet h2{font:34px Georgia,serif}.grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}.tags{display:flex;flex-wrap:wrap;gap:7px}.tags span{padding:8px 10px;border:1px solid #ddd;border-radius:999px;font-size:11px}.muted{color:#65707a;line-height:1.7}.actions{position:sticky;bottom:10px;text-align:center}.actions button{padding:13px 18px;border:0;border-radius:10px;background:#111923;color:#fff;font-weight:bold}@media(max-width:680px){main{padding:18px}.hero h1{font-size:42px}.grid{grid-template-columns:1fr}}@media print{.actions{display:none}body{background:#fff}@page{margin:12mm}}</style></head><body><main><section class="hero"><div class="ey">YUME WORKS · MISSION BOOK</div><h1>'+esc(summary())+'</h1><div class="id">'+state.missionId+'</div><p class="muted">'+esc(state.outcome||'Outcome da definire')+'</p></section><section class="sheet grid"><div><div class="ey">SETTORE</div><h2>'+esc(state.sector||'Da definire')+'</h2></div><div><div class="ey">DELEGAZIONE</div><h2>'+esc([state.people?state.people+' pax':'',state.seniority].filter(Boolean).join(' · ')||'Da definire')+'</h2></div></section><section class="sheet"><div class="ey">GEOGRAFIA</div><h2>Japan Core / Asia Extension</h2><div class="tags">'+dest+'</div></section><section class="sheet"><div class="ey">MISSION MODULES</div><h2>Cosa deve succedere sul campo</h2><ul>'+activities+'</ul></section><section class="sheet grid"><div><div class="ey">TIMING</div><p class="muted">'+esc([state.period,state.duration].filter(Boolean).join(' · ')||'Da definire')+'</p></div><div><div class="ey">BUDGET</div><p class="muted">'+esc(state.budget||'Da definire')+'</p></div></section><section class="sheet"><div class="ey">REALITY CHECK</div><h2>Da brief a fattibilità.</h2><p class="muted">'+esc(state.constraints||'Nessun vincolo aggiuntivo indicato.')+'</p><p class="muted">Questo Mission Book non costituisce conferma di accesso, disponibilità o preventivo. YUME qualifica interlocutori, agenda, logistica e costi prima della proposta.</p></section><div class="actions"><button onclick="window.print()">Salva / stampa PDF</button></div></main></body></html>');w.document.close();
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

 q('[data-next]').onclick=()=>{if(validateStep(state.step))showStep(state.step+1,{history:'push',scroll:'preserve'})};
 q('[data-back]').onclick=()=>{
  if(state.step<=1)return;
  if(navDepth>0)history.back();
  else showStep(state.step-1,{history:'replace',scroll:'preserve'});
 };
 qa('[data-act]').forEach(b=>b.onclick=()=>showStep(actStart(+b.dataset.act),{history:'push',scroll:'step'}));
 qa('[data-step-jump]').forEach(b=>b.onclick=()=>showStep(+b.dataset.stepJump,{history:'push',scroll:'step'}));
 q('[data-restart]')&&(q('[data-restart]').onclick=resetMission);
 q('[data-share]').onclick=share;
 q('[data-print]').onclick=openMissionBook;

 window.addEventListener('popstate',e=>{
  const n=e.state&&Number(e.state.ybLabStep);
  navDepth=e.state&&Number.isFinite(Number(e.state.ybLabDepth))?Number(e.state.ybLabDepth):0;
  if(n>=1&&n<=8)showStep(n,{history:'none',scroll:'preserve'});
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