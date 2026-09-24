(()=>{'use strict';
const SUPABASE_URL='https://hlikhyemzophandqkjdy.supabase.co';
const SUPABASE_KEY='sb_publishable_Z5S66pZ85I3WlGuJDArJhA_QuXhKP51';
const STORAGE='yumeHoneymoonJourneyLabV1';
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const labels={city:'Città',sea:'Mare',food:'Food',stay:'Luoghi speciali',far:'Altrove',slow:'Tempo lento'};
const dnaLabels={pace:'Ritmo lento',novelty:'Inaspettato',freedom:'Libertà',comfort:'Comfort'};
const allocLabels={experiences:'Esperienze',comfort:'Comfort',food:'Food',relax:'Relax',special:'Momenti speciali'};
const experienceCatalog=[
 {id:'ryokan',name:'Ryokan & onsen',copy:'Una notte in cui il luogo diventa parte del viaggio.',pressure:3,tags:['stay','slow','far']},
 {id:'omakase',name:'Omakase',copy:'Una cena affidata completamente alle mani di chi la prepara.',pressure:2,tags:['food','city']},
 {id:'island',name:'Isola e laguna',copy:'Finire il viaggio togliendo ritmo, rumore e orari.',pressure:3,tags:['sea','slow']},
 {id:'rail',name:'Treno panoramico',copy:'Lasciare che anche lo spostamento diventi racconto.',pressure:1,tags:['far','city']},
 {id:'craft',name:'Atelier locale',copy:'Entrare nel gesto, nell’artigianato e nelle storie del luogo.',pressure:1,tags:['far','city']},
 {id:'private',name:'Esperienza privata',copy:'Un momento costruito soltanto attorno a voi.',pressure:3,tags:['stay','food']},
 {id:'streetfood',name:'Street food',copy:'Assaggiare la destinazione senza trasformarla in cerimonia.',pressure:1,tags:['food','city']},
 {id:'nature',name:'Natura immersiva',copy:'Un giorno in cui la città smette completamente di esistere.',pressure:1,tags:['far','slow']},
 {id:'boutique',name:'Boutique stay',copy:'Poche camere, identità forte, comfort scelto bene.',pressure:2,tags:['stay','slow']},
 {id:'night',name:'Una notte fuori',copy:'Bar, skyline e quartieri da vivere dopo il tramonto.',pressure:1,tags:['city']},
 {id:'spa',name:'Spa & decompressione',copy:'Uno spazio progettato per non dover fare nulla.',pressure:2,tags:['slow','stay']},
 {id:'icon',name:'Un’icona fatta bene',copy:'Vedere ciò che sognavate, senza viverlo come una checklist.',pressure:2,tags:['city','far']}
];
const destinations=[
 {id:'tokyo',name:'Tokyo',x:79,y:34,region:'Giappone'},
 {id:'kyoto',name:'Kyoto',x:76,y:39,region:'Giappone'},
 {id:'kanazawa',name:'Kanazawa',x:75,y:34,region:'Giappone'},
 {id:'koyasan',name:'Kōyasan',x:76,y:43,region:'Giappone'},
 {id:'kyushu',name:'Kyushu',x:72,y:45,region:'Giappone'},
 {id:'okinawa',name:'Okinawa',x:71,y:55,region:'Giappone'},
 {id:'seoul',name:'Seoul',x:70,y:34,region:'Corea'},
 {id:'bangkok',name:'Bangkok',x:61,y:54,region:'Thailandia'},
 {id:'phuket',name:'Phuket',x:60,y:61,region:'Thailandia'},
 {id:'tahiti',name:'Tahiti',x:18,y:68,region:'Polinesia'},
 {id:'borabora',name:'Bora Bora',x:16,y:65,region:'Polinesia'}
];
const defaults={step:1,sparks:[],dna:{pace:55,novelty:58,freedom:54,comfort:60},duration:20,period:'Da definire',budget:'',allocation:{experiences:25,comfort:20,food:20,relax:20,special:15},experiences:{},destinations:[],journeyId:'',sessionToken:''};
let state=load();
function uuid(){return crypto?.randomUUID?crypto.randomUUID():'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0,v=c==='x'?r:(r&3|8);return v.toString(16)})}
function journeyId(){const d=new Date(),stamp=String(d.getFullYear()).slice(-2)+String(d.getMonth()+1).padStart(2,'0');return 'HY-'+stamp+'-'+Math.random().toString(36).slice(2,7).toUpperCase()}
if(!state.journeyId)state.journeyId=journeyId();if(!state.sessionToken)state.sessionToken=uuid();
function load(){try{return {...defaults,...JSON.parse(localStorage.getItem(STORAGE)||'{}')}}catch{return structuredClone(defaults)}}
let saveTimer;function save(){clearTimeout(saveTimer);q('[data-save-state]').textContent='Salvataggio…';saveTimer=setTimeout(()=>{try{localStorage.setItem(STORAGE,JSON.stringify(state));q('[data-save-state]').textContent='Salvato ✓'}catch{q('[data-save-state]').textContent='Bozza in memoria'}},180)}
function esc(v=''){return String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function selectedExperiences(){return Object.entries(state.experiences).filter(([,v])=>v).map(([id,level])=>({...experienceCatalog.find(x=>x.id===id),level})).filter(x=>x.name)}
function selectedDestinations(){return state.destinations.map(id=>destinations.find(d=>d.id===id)).filter(Boolean)}
function countItems(){return state.sparks.length+selectedExperiences().length+state.destinations.length}
function renderMini(){
 q('[data-drawer-count]').textContent=countItems()+' elementi';
 q('[data-drawer-route]').innerHTML=state.destinations.length?selectedDestinations().map(x=>esc(x.name)).join(' <span>→</span> '):'<span>Il Canvas si comporrà qui.</span>';
 q('[data-mini-dna]').innerHTML=Object.entries(state.dna).map(([k,v])=>'<div><span>'+dnaLabels[k]+'</span><i style="--w:'+v+'%"></i></div>').join('');
 const chips=[...state.sparks.map(x=>labels[x]),...selectedExperiences().filter(x=>x.level==='must').map(x=>x.name)];
 q('[data-drawer-chips]').innerHTML=chips.slice(0,8).map(x=>'<span>'+esc(x)+'</span>').join('');
 q('[data-drawer-note]').textContent=state.destinations.length>=5?'Avete molte basi: nel Lab la composizione sta diventando intensa.':selectedExperiences().length>=4?'La vostra idea sta diventando più precisa: ora la geografia potrà darle una forma.':'Il Canvas cresce mentre scegliete.';
}
function insight(){
 const d=state.dna;let t='Cercate un equilibrio tra scoperta e respiro.';
 if(d.pace>70)t='Il tempo lento conta davvero: meglio meno basi, vissute più a fondo.';
 else if(d.pace<30)t='Avete energia da esploratori: il viaggio può sostenere più movimento.';
 if(d.freedom>72)t+=' Volete però conservare molta libertà sul posto.';
 else if(d.freedom<30)t+=' Preferite una regia più presente e rassicurante.';
 q('[data-dna-insight]').textContent=t;
}
function renderAllocation(){
 const root=q('[data-allocation]');root.innerHTML=Object.entries(state.allocation).map(([k,v])=>'<label class="lab-alloc-row"><span>'+allocLabels[k]+'</span><input type="range" min="5" max="60" value="'+v+'" data-alloc="'+k+'"><output>'+v+'</output></label>').join('');
 qa('[data-alloc]',root).forEach(input=>input.addEventListener('input',()=>adjustAllocation(input.dataset.alloc,+input.value)));
 q('[data-total]').textContent=Object.values(state.allocation).reduce((a,b)=>a+b,0);
}
function adjustAllocation(key,newVal){
 const old=state.allocation[key],delta=newVal-old;if(!delta)return;
 const others=Object.keys(state.allocation).filter(k=>k!==key);let remaining=delta;
 if(delta>0){for(const k of others.sort((a,b)=>state.allocation[b]-state.allocation[a])){const take=Math.min(remaining,state.allocation[k]-5);state.allocation[k]-=take;remaining-=take;if(remaining<=0)break}state.allocation[key]=newVal-remaining}
 else{let give=-delta;for(const k of others){const room=60-state.allocation[k],add=Math.min(give,Math.ceil(room/(others.length)));state.allocation[k]+=add;give-=add;if(give<=0)break}state.allocation[key]=old+delta+give}
 renderAllocation();save();renderMini();
}
function renderExperiences(){
 const ranked=[...experienceCatalog].sort((a,b)=>scoreExp(b)-scoreExp(a));
 q('[data-experiences]').innerHTML=ranked.map(e=>{const level=state.experiences[e.id]||'';return '<article class="lab-exp '+(level?'is-selected ':'')+(level==='must'?'is-must':'')+'" data-exp-card="'+e.id+'"><div><small>Impegno sul progetto · '+'○'.repeat(e.pressure)+'</small><h4>'+e.name+'</h4><p>'+e.copy+'</p></div><div class="lab-exp-actions"><button type="button" data-exp="'+e.id+'" data-level="want">'+(level==='want'?'✓ Scelto':'Lo vogliamo')+'</button><button type="button" data-exp="'+e.id+'" data-level="must">'+(level==='must'?'★ Irrinunciabile':'☆ Fondamentale')+'</button></div></article>'}).join('');
 qa('[data-exp]').forEach(b=>b.addEventListener('click',()=>{const {exp,level}=b.dataset;state.experiences[exp]=state.experiences[exp]===level?'':level;save();renderExperiences();renderMini()}));
}
function scoreExp(e){return e.tags.reduce((n,t)=>n+(state.sparks.includes(t)?3:0),0)+(e.tags.includes('slow')?state.dna.pace/100:0)+(e.tags.includes('stay')?state.dna.comfort/100:0)}
function renderDestinations(){
 q('[data-destinations]').innerHTML=destinations.map(d=>'<button type="button" data-dest="'+d.id+'" class="'+(state.destinations.includes(d.id)?'is-selected':'')+'">'+(state.destinations.includes(d.id)?'✓ ':'+ ')+d.name+'</button>').join('');
 qa('[data-dest]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.dest,i=state.destinations.indexOf(id);if(i>=0)state.destinations.splice(i,1);else if(state.destinations.length<7)state.destinations.push(id);save();renderDestinations();renderMap();renderMini()}));
}
function renderMap(){
 const sel=selectedDestinations();q('[data-map-points]').innerHTML=sel.map(d=>'<span class="lab-map-point" data-label="'+esc(d.name)+'" style="left:'+d.x+'%;top:'+d.y+'%"></span>').join('');
 const svg=q('.lab-map svg'),vb=svg.viewBox.baseVal;const pts=sel.map(d=>[(d.x/100)*vb.width,(d.y/100)*vb.height]);
 q('[data-route-path]').setAttribute('d',pts.length?'M '+pts.map(p=>p.join(' ')).join(' L '):'');
 q('[data-timeline]').innerHTML=sel.map((d,i)=>'<span>'+(i+1).toString().padStart(2,'0')+' · '+esc(d.name)+'</span>').join('');
 const max=Math.max(3,Math.round(state.duration/4));q('[data-rhythm-note]').textContent=sel.length>max?'State riempiendo molto il viaggio rispetto ai '+state.duration+' giorni scelti. Il vostro Travel Designer potrebbe suggerire di togliere una base.':sel.length?'La composizione è ancora coerente con la durata immaginata.':'Scegliete i primi luoghi: la linea del viaggio apparirà sulla mappa.';
}
function summary(){
 const d=state.dna,top=Object.entries(state.allocation).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([k])=>allocLabels[k].toLowerCase());
 const rhythm=d.pace>65?'con tempo per rallentare':d.pace<35?'dinamico e pieno di movimento':'equilibrato tra scoperta e respiro';
 const freedom=d.freedom>65?'con molta libertà sul posto':'con una regia presente ma discreta';
 return 'State immaginando un viaggio '+rhythm+', '+freedom+'. Volete sentire il valore soprattutto in '+top.join(' e ')+'. '+(state.destinations.length?'La geografia che avete disegnato è un punto di partenza, non ancora un itinerario.':'La geografia può ancora restare aperta: il vostro modo di viaggiare è già molto più chiaro.');
}
function renderCanvas(){
 q('[data-journey-id]').textContent=state.journeyId;
 q('[data-canvas-route]').textContent=state.destinations.length?selectedDestinations().map(x=>x.name).join('  ·  '):'Geografia ancora aperta';
 q('[data-canvas-dna]').innerHTML='<div class="lab-canvas-bars">'+Object.entries(state.dna).map(([k,v])=>'<div class="lab-canvas-bar"><span>'+dnaLabels[k]+'</span><i style="--w:'+v+'%"></i><b>'+v+'</b></div>').join('')+'</div>';
 q('[data-canvas-value]').innerHTML='<div class="lab-canvas-bars">'+Object.entries(state.allocation).map(([k,v])=>'<div class="lab-canvas-bar"><span>'+allocLabels[k]+'</span><i style="--w:'+v+'%"></i><b>'+v+'</b></div>').join('')+'</div>';
 const must=selectedExperiences().filter(x=>x.level==='must').map(x=>x.name);q('[data-canvas-must]').textContent=(must.length?must:selectedExperiences().map(x=>x.name)).slice(0,6).join(' · ')||'Ancora da scegliere';
 q('[data-canvas-summary]').textContent=summary();
 const a=q('[data-name-a]').value.trim(),b=q('[data-name-b]').value.trim();q('[data-canvas-name]').textContent=a&&b?a+' + '+b:a||b||'Il vostro';
 const consult=q('[data-consult]');consult.href='/honeymoon/?lab='+encodeURIComponent(state.journeyId)+'#inizia';
}
function showStep(n){
 state.step=clamp(n,1,6);qa('.lab-step').forEach(x=>x.classList.toggle('is-active',+x.dataset.step===state.step));
 const titles=['La scintilla','Il vostro equilibrio','Tempo & valore','Esperienze','Geografia','Journey Canvas'];q('[data-step-title]').textContent=titles[state.step-1];q('[data-step-count]').textContent=String(state.step).padStart(2,'0')+' / 06';q('[data-progress]').style.width=(state.step/6*100)+'%';
 q('[data-back]').disabled=state.step===1;q('[data-next]').hidden=state.step===6;
 if(state.step===4)renderExperiences();if(state.step===5){renderDestinations();renderMap()}if(state.step===6)renderCanvas();save();renderMini();window.scrollTo({top:0,behavior:'smooth'});
}
function buildPayload(shared=false){
 return {journey_id:state.journeyId,source:'honeymoon_lab',schema_version:1,status:shared?'shared':'completed',locale:'it',session_token:state.sessionToken,names:{first:q('[data-name-a]')?.value.trim()||'',second:q('[data-name-b]')?.value.trim()||''},timing:{duration_days:state.duration,period:state.period},budget_band:state.budget||null,travel_dna:state.dna,value_allocation:state.allocation,sparks:state.sparks,experiences:selectedExperiences().map(({id,name,level,pressure})=>({id,name,level,pressure})),destinations:selectedDestinations().map(({id,name,region})=>({id,name,region})),summary:{text:summary()},attribution:{referrer:document.referrer||'',utm:Object.fromEntries([...new URLSearchParams(location.search)].filter(([k])=>k.startsWith('utm_')))},consent_to_contact:shared&&q('[data-consent]')?.checked===true,contact:shared?{email:q('[data-email]').value.trim(),phone:q('[data-phone]').value.trim()}: {},user_agent:navigator.userAgent.slice(0,500),page_path:location.pathname};
}
async function share(){
 const status=q('[data-share-status]');if(!q('[data-consent]').checked){status.textContent='Per condividere i contatti con YUME serve il consenso al ricontatto.';return}
 const email=q('[data-email]').value.trim(),phone=q('[data-phone]').value.trim();if(!email&&!phone){status.textContent='Inserite almeno email o telefono.';return}
 const btn=q('[data-share]');btn.disabled=true;status.textContent='Condivisione in corso…';
 try{const res=await fetch(SUPABASE_URL+'/rest/v1/honeymoon_journey_lab_canvases',{method:'POST',headers:{apikey:SUPABASE_KEY,Authorization:'Bearer '+SUPABASE_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(buildPayload(true))});if(!res.ok)throw new Error(await res.text());status.textContent='Canvas '+state.journeyId+' condiviso con YUME. Il vostro disegno è pronto per diventare un progetto.';btn.textContent='Condiviso ✓';}
 catch(e){console.error('Journey Lab share',e);status.textContent='Non siamo riusciti a condividere il Canvas. La vostra bozza locale è comunque salva.';btn.disabled=false}
}
function init(){
 q('[data-start]').addEventListener('click',()=>{q('[data-screen="intro"]').hidden=true;q('[data-screen="workspace"]').hidden=false;showStep(state.step||1)});
 q('[data-next]').addEventListener('click',()=>showStep(state.step+1));q('[data-back]').addEventListener('click',()=>showStep(state.step-1));
 qa('[data-spark]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.spark,i=state.sparks.indexOf(id);if(i>=0)state.sparks.splice(i,1);else if(state.sparks.length<3)state.sparks.push(id);qa('[data-spark]').forEach(x=>x.classList.toggle('is-selected',state.sparks.includes(x.dataset.spark)));save();renderMini()}));
 qa('[data-dna]').forEach(input=>input.addEventListener('input',()=>{state.dna[input.dataset.dna]=+input.value;q('[data-out="'+input.dataset.dna+'"]').value=input.value;insight();save();renderMini()}));
 q('[data-duration]').addEventListener('change',e=>{state.duration=+e.target.value;save()});q('[data-period]').addEventListener('change',e=>{state.period=e.target.value;save()});
 qa('[data-budget]').forEach(b=>b.addEventListener('click',()=>{state.budget=b.dataset.budget;qa('[data-budget]').forEach(x=>x.classList.toggle('is-selected',x.dataset.budget===state.budget));save()}));
 q('[data-print]').addEventListener('click',()=>{renderCanvas();window.print()});q('[data-share]').addEventListener('click',share);qa('[data-name-a],[data-name-b]').forEach(i=>i.addEventListener('input',renderCanvas));
 qa('[data-spark]').forEach(x=>x.classList.toggle('is-selected',state.sparks.includes(x.dataset.spark)));qa('[data-dna]').forEach(x=>{x.value=state.dna[x.dataset.dna];q('[data-out="'+x.dataset.dna+'"]').value=x.value});q('[data-duration]').value=String(state.duration);q('[data-period]').value=state.period;qa('[data-budget]').forEach(x=>x.classList.toggle('is-selected',x.dataset.budget===state.budget));
 renderAllocation();insight();renderMini();save();
}
document.addEventListener('DOMContentLoaded',init);
})();