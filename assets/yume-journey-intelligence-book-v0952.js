/* YUME Journey Intelligence Book · v0.95.2
   Full intelligence PDF/print renderer for the isolated Honeymoon Lab preview.
   Uses only values emitted by YumeHoneymoonIntelligence / Journey Intelligence. */
(function(global){
'use strict';

const VERSION='0.95.2';
const DATA=global.YumeIntelligenceData;
const DEBUG=()=>global.YumeJourneyLabDebug;
const DIMENSION_GROUPS=[
  {key:'atmosphere',label:'ATMOSFERA'},
  {key:'culture',label:'CULTURA'},
  {key:'experience',label:'ESPERIENZE'},
  {key:'journey',label:'MODO DI VIAGGIARE'},
  {key:'relationship',label:'RELAZIONE CON IL VIAGGIO'}
];
const DECLARED_DNA=[
  ['pace','Ritmo'],
  ['novelty','Scoperta'],
  ['freedom','Libertà'],
  ['comfort','Comfort'],
  ['depth','Profondità']
];
const ALLOCATION_LABELS={
  experiences:'Esperienze',
  comfort:'Comfort',
  food:'Food',
  relax:'Tempo lento',
  special:'Momenti speciali'
};
const ROLE_LABELS={
  ANCHOR:'ANCHOR',
  SUPPORT:'SUPPORT',
  CONTRAST:'CONTRAST',
  BRIDGE:'BRIDGE',
  SIGNATURE:'SIGNATURE',
  DECOMPRESSION:'DECOMPRESSION'
};

const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,Number(v)||0));
const pct=v=>Math.round(clamp(v));
const signed=v=>{const n=Math.round(Number(v)||0);return(n>0?'+':'')+n};
const routeName=id=>DATA&&DATA.destinationById&&DATA.destinationById[id]?DATA.destinationById[id].name:id;
const routeNames=ids=>(ids||[]).map(routeName);
const confidenceLabel=c=>c>=.78?'Segnale forte':c>=.55?'Segnale consistente':'Da esplorare';
const humanStatus=s=>({
  READY:'READY',
  REVIEW_REQUIRED:'REVIEW REQUIRED',
  HUMAN_REQUIRED:'HUMAN REQUIRED',
  BLOCKED:'BLOCKED'
}[s]||s||'—');

function metric(label,value,note){
  return '<div class="metric"><small>'+esc(label)+'</small><strong>'+esc(value)+'</strong>'+(note?'<span>'+esc(note)+'</span>':'')+'</div>';
}
function bar(label,value,right,cls){
  const v=pct(value);
  return '<div class="dna-row '+(cls||'')+'"><div class="dna-row-head"><span>'+esc(label)+'</span><b>'+v+'</b></div><i><b style="width:'+v+'%"></b></i>'+(right?'<small>'+esc(right)+'</small>':'')+'</div>';
}
function chips(values,empty){
  const a=(values||[]).filter(Boolean);
  return '<div class="chips">'+(a.length?a.map(x=>'<span>'+esc(x)+'</span>').join(''):'<span>'+esc(empty||'Da definire')+'</span>')+'</div>';
}
function sectionTitle(index,ey,title,copy){
  return '<div class="section-head"><div class="ey">'+esc(index)+' · '+esc(ey)+'</div><h2>'+esc(title)+'</h2>'+(copy?'<p>'+esc(copy)+'</p>':'')+'</div>';
}
function getEngine(){
  const d=DEBUG();
  if(!d)return null;
  let e=d.getEngine&&d.getEngine();
  if(!e&&d.analyse)e=d.analyse();
  return e||null;
}
function getState(){
  const d=DEBUG();
  return d&&d.getState?d.getState():null;
}
function selectedDestinations(state){
  return (state.destinations||[]).map(id=>DATA&&DATA.destinationById?DATA.destinationById[id]:null).filter(Boolean);
}
function experienceLists(state){
  const profiles=DATA&&DATA.experienceProfiles?DATA.experienceProfiles:{};
  const out={must:[],want:[],reject:[]};
  Object.entries(state.experiences||{}).forEach(([id,level])=>{
    const label=profiles[id]&&profiles[id].label?profiles[id].label:id;
    if(level==='must')out.must.push(label);
    else if(level==='reject')out.reject.push(label);
    else if(level==='want'||level==='curious')out.want.push(label);
  });
  return out;
}
function routeSketchSvg(sel,roles){
  if(!sel.length)return '<p class="muted">Geografia ancora aperta.</p>';
  const w=700,h=245,padX=52,centerY=116;
  const roleMap=Object.fromEntries((roles||[]).map(r=>[r.id,r.role]));
  if(sel.length===1){
    const d=sel[0];
    return '<div class="sketch-note">Schema narrativo · non in scala</div><svg viewBox="0 0 '+w+' '+h+'" role="img"><circle cx="'+(w/2)+'" cy="'+centerY+'" r="14" fill="none" stroke="#b8894d" stroke-width="2"/><circle cx="'+(w/2)+'" cy="'+centerY+'" r="8" fill="#b8894d"/><text class="node-label" x="'+(w/2)+'" y="'+(centerY-24)+'" text-anchor="middle">'+esc(d.name)+'</text><text class="node-index" x="'+(w/2)+'" y="'+(centerY+3)+'" text-anchor="middle">01</text></svg>';
  }
  const step=(w-padX*2)/(sel.length-1);
  const offsets=[-24,18,-15,23,-11,17,-22,20];
  const pts=sel.map((d,i)=>({x:padX+i*step,y:centerY+offsets[i%offsets.length],name:d.name,id:d.id,role:roleMap[d.id]||'SUPPORT',i,labelBelow:i%2===1}));
  const lines=[];
  for(let i=1;i<pts.length;i++){
    const a=pts[i-1],b=pts[i],mx=(a.x+b.x)/2,my=(a.y+b.y)/2,ang=Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;
    lines.push('<line x1="'+a.x+'" y1="'+a.y+'" x2="'+b.x+'" y2="'+b.y+'" stroke="#2b0d16" stroke-width="2.3" stroke-linecap="round"/><g transform="translate('+mx+' '+my+') rotate('+ang+')"><path d="M -8 -5 L 0 0 L -8 5" fill="none" stroke="#b8894d" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></g>');
  }
  const nodes=pts.map((p,i)=>{
    const edge=i===0||i===pts.length-1,signature=p.role==='SIGNATURE'||p.role==='DECOMPRESSION';
    const ring=i===0?'<circle cx="'+p.x+'" cy="'+p.y+'" r="14" fill="none" stroke="#b8894d" stroke-width="2"/>':signature?'<circle cx="'+p.x+'" cy="'+p.y+'" r="12" fill="none" stroke="#b8894d" stroke-width="1.5" opacity=".7"/>':'';
    const labelY=p.labelBelow?p.y+28:p.y-22,labelX=p.labelBelow?p.x-4:p.x,anchor=p.labelBelow?'start':'middle';
    return ring+'<circle cx="'+p.x+'" cy="'+p.y+'" r="'+(edge?8:7)+'" fill="'+(edge?'#b8894d':'#2b0d16')+'"/><text class="node-label" x="'+labelX+'" y="'+labelY+'" text-anchor="'+anchor+'">'+esc(p.name)+'</text><text class="node-index" x="'+p.x+'" y="'+(p.y+3)+'" text-anchor="middle">'+String(i+1).padStart(2,'0')+'</text>';
  }).join('');
  return '<div class="sketch-note">Schema narrativo · non in scala</div><svg viewBox="0 0 '+w+' '+h+'" role="img">'+lines.join('')+nodes+'</svg><div class="sketch-legend"><span><i class="start"></i>Ingresso</span><span><i></i>Tappa</span><span><i class="accent"></i>Signature / decompression</span><span>Le frecce indicano la sequenza</span></div>';
}
function renderDeclared(state){
  const left=DECLARED_DNA.map(([k,l])=>bar(l,state.dna&&state.dna[k]!=null?state.dna[k]:50,'INPUT DICHIARATO')).join('');
  const right=Object.entries(state.allocation||{}).map(([k,v])=>bar(ALLOCATION_LABELS[k]||k,v,'ALLOCAZIONE')).join('');
  return '<div class="two-col"><div><h3>Come avete risposto</h3>'+left+'</div><div><h3>Dove volete sentire il valore</h3>'+right+'</div></div>';
}
function renderTravellerDNA(a){
  if(!a)return '<p class="muted">Intelligence non disponibile.</p>';
  const meta=DATA.dimensionMeta||{};
  return DIMENSION_GROUPS.map(g=>{
    const dims=DATA.dimensions.filter(d=>meta[d]&&meta[d].group===g.key);
    return '<div class="dna-group"><h3>'+esc(g.label)+'</h3>'+dims.map(d=>{
      const x=a.travellerDNA[d]||{value:50,confidence:.05,contradiction:0};
      const conf=Math.round((x.confidence||0)*100),contr=Math.round((x.contradiction||0)*100);
      const note='Confidence '+conf+'%'+(contr>=20?' · tensione '+contr+'%':'');
      return bar(meta[d].label||d,x.value,note,contr>=30?'tension':'');
    }).join('')+'</div>';
  }).join('');
}
function signalCards(a){
  return (a.topSignals||[]).slice(0,8).map(x=>{
    const c=Math.round((x.confidence||0)*100),contr=Math.round((x.contradiction||0)*100);
    return '<article class="signal-card"><small>'+esc(confidenceLabel(x.confidence||0))+'</small><h3>'+esc(x.label)+'</h3><div class="big-number">'+pct(x.value)+'</div><p>Confidence '+c+'%'+(contr? ' · Contraddizione '+contr+'%':'')+'</p></article>';
  }).join('');
}
function matchDrivers(r){
  const list=(r&&r.semantic&&r.semantic.breakdown?r.semantic.breakdown:[]).slice(0,4);
  return list.length?list.map(x=>'<li><b>'+esc(x.label||x.dimension)+'</b><span>fit '+pct(x.fit)+' · voi '+pct(x.traveller)+' · luogo '+pct(x.destination)+'</span></li>').join(''):'<li><span>Driver non disponibili.</span></li>';
}
function matchCards(a){
  if(!a)return '';
  return (a.destinationRanking||[]).slice(0,6).map((r,i)=>{
    const range=r.affinityRange||[r.affinity,r.affinity];
    return '<article class="match-card"><div class="rank">'+String(i+1).padStart(2,'0')+'</div><div><small>'+esc(r.classification||'MATCH')+'</small><h3>'+esc(r.destination.name)+'</h3><div class="scoreline"><b>Affinity '+pct(r.affinity)+'</b><span>range '+pct(range[0])+'–'+pct(range[1])+'</span></div><div class="mini-metrics"><span>Feasibility <b>'+pct(r.feasibility&&r.feasibility.score)+'</b></span><span>Robustness <b>'+pct(r.robustness)+'</b></span><span>Season <b>'+pct(r.feasibility&&r.feasibility.season&&r.feasibility.season.score)+'</b></span></div><ul class="driver-list">'+matchDrivers(r)+'</ul></div></article>';
  }).join('');
}
function surpriseCards(a){
  const items=(a&&a.surpriseMatches||[]).slice(0,3);
  if(!items.length)return '<p class="muted">Nessun Surprise Match supera oggi le soglie minime di affinità e valore marginale.</p>';
  return items.map((r,i)=>{
    const dims=(r.marginal&&r.marginal.newDimensions||[]).slice(0,4).map(x=>x.label+' +'+Math.round(x.gain));
    return '<article class="'+(i===0?'surprise hero-surprise':'surprise')+'"><small>'+(i===0?'SURPRISE MATCH PRINCIPALE':'SURPRISE MATCH')+'</small><h3>'+esc(r.destination.name)+'</h3><p class="surprise-copy">'+(i===0?esc(r.destination.name)+' non era nella vostra lista. Ma il vostro DNA la vede.':'Compatibilità emersa fuori dalla rotta attuale.')+'</p><div class="mini-metrics"><span>Affinity <b>'+pct(r.affinity)+'</b></span><span>Marginal Value <b>'+pct(r.marginal&&r.marginal.score)+'</b></span><span>Robustness <b>'+pct(r.robustness)+'</b></span><span>Feasibility <b>'+pct(r.feasibility&&r.feasibility.score)+'</b></span></div>'+chips(dims,'Nessuna nuova dimensione dominante')+'</article>';
  }).join('');
}
function destinationDNACard(d,a,state){
  const r=(a.destinationRanking||[]).find(x=>x.id===d.id);
  const role=(a.routeRoles||[]).find(x=>x.id===d.id);
  const meta=DATA.dimensionMeta||{};
  const signature=Object.entries(d.dna||{}).map(([key,value])=>({key,value,label:meta[key]?meta[key].label:key})).sort((x,y)=>y.value-x.value).slice(0,5);
  const alignment=(r&&r.semantic&&r.semantic.breakdown?r.semantic.breakdown:[]).slice(0,3);
  const nights=state.nights&&state.nights[d.id]!=null?state.nights[d.id]:d.ideal;
  return '<article class="dest-dna"><header><div><small>'+esc(role&&role.role||'SUPPORT')+' · '+esc(d.region||d.country)+'</small><h3>'+esc(d.name)+'</h3></div><div class="affinity">'+(r?pct(r.affinity):'—')+'<small>AFFINITY</small></div></header><div class="mini-metrics"><span>'+nights+' notti</span><span>Feasibility <b>'+(r?pct(r.feasibility&&r.feasibility.score):'—')+'</b></span><span>Robustness <b>'+(r?pct(r.robustness):'—')+'</b></span></div><h4>Destination DNA · firma del luogo</h4><div class="signature-bars">'+signature.map(x=>bar(x.label,x.value,'LUOGO')).join('')+'</div><h4>Perché incontra il vostro DNA</h4><ul class="driver-list">'+(alignment.length?alignment.map(x=>'<li><b>'+esc(x.label||x.dimension)+'</b><span>fit '+pct(x.fit)+' · voi '+pct(x.traveller)+' · luogo '+pct(x.destination)+'</span></li>').join(''):'<li><span>Segnale non abbastanza forte per una spiegazione specifica.</span></li>')+'</ul>'+(role?'<p class="role-why"><b>'+esc(role.role)+':</b> '+esc(role.why)+'</p>':'')+'</article>';
}
function routeMetrics(a){
  const r=a.route||{};
  return [
    metric('COHERENCE',pct(r.score),'/100'),
    metric('PRESSURE',pct(r.pressure),'/100 · più basso = più respiro'),
    metric('COVERAGE',pct(r.coverage),'/100'),
    metric('REDUNDANCY',pct(r.redundancy),'/100'),
    metric('SEQUENCE',pct(r.sequence),'/100'),
    metric('NIGHT FIT',pct(r.nightFit),'/100'),
    metric('BUDGET FIT',pct(r.budgetFit),'/100'),
    metric('DISTANZA',Number(r.distance||0).toLocaleString('it-IT')+' km','stima geometrica')
  ].join('');
}
function optimiserBlock(a){
  const o=a.routeOptimisation||{},original=o.original||[],recommended=o.recommended||[];
  const same=original.length===recommended.length&&original.every((x,i)=>x===recommended[i]);
  const title=same?'Ordine attuale confermato':'Sequenza alternativa individuata';
  return '<div class="optimizer"><small>ROUTE OPTIMISER · CONFIDENCE '+pct(o.confidence)+'</small><h3>'+esc(title)+'</h3><div class="route-string">'+esc(routeNames(original).join(' → '))+'</div>'+(same?'':'<div class="route-arrow">↓</div><div class="route-string recommended">'+esc(routeNames(recommended).join(' → '))+'</div>')+'<p>Δ friction '+signed(o.frictionDelta)+' · Δ distanza '+signed(o.distanceDelta)+' km</p></div>';
}
function nightBlock(a){
  const n=a.nightAllocation;
  if(!n)return '';
  return '<div class="night-box"><small>NIGHT ALLOCATION</small><h3>'+(n.feasible?'Distribuzione consigliata':'Distribuzione sotto vincolo')+'</h3><div class="night-grid">'+(n.allocations||[]).map(x=>'<span><b>'+esc(x.name)+'</b>'+x.nights+' notti <small>min '+x.minimum+' · ideal '+x.ideal+'</small></span>').join('')+'</div>'+(n.shortfall?'<p class="warning">Shortfall: '+n.shortfall+' notte/i rispetto ai minimi.</p>':'')+'</div>';
}
function roleCards(a){
  return (a.routeRoles||[]).map(r=>'<article class="role-card"><small>'+esc(ROLE_LABELS[r.role]||r.role)+'</small><h3>'+esc(r.name)+'</h3><p>'+esc(r.why)+'</p><div class="mini-metrics"><span>Structural <b>'+pct(r.structuralScore)+'</b></span><span>Confidence <b>'+pct(r.confidence)+'</b></span></div></article>').join('');
}
function removalRows(a){
  const items=a.counterfactuals&&a.counterfactuals.removals||[];
  return items.map(x=>'<tr><td><b>'+esc(x.name)+'</b></td><td>'+pct(x.structurality)+'</td><td>'+signed(x.delta)+'</td><td>'+signed(x.coverageDelta)+'</td><td>'+signed(x.pressureDelta)+'</td><td>'+signed(x.distanceDelta)+' km</td></tr>').join('');
}
function additionCards(a){
  const items=a.counterfactuals&&a.counterfactuals.additions||[];
  return items.slice(0,6).map(x=>{
    const dims=(x.marginal&&x.marginal.newDimensions||[]).slice(0,3).map(d=>d.label+' +'+Math.round(d.gain));
    return '<article class="addition"><small>CANDIDATE ADDITION</small><h3>'+esc(x.name)+'</h3><div class="mini-metrics"><span>Affinity <b>'+pct(x.affinity)+'</b></span><span>Feasibility <b>'+pct(x.feasibility)+'</b></span><span>Marginal <b>'+pct(x.marginal&&x.marginal.score)+'</b></span></div><p>Coverage '+signed(x.marginal&&x.marginal.coverageGain)+' · Route '+signed(x.marginal&&x.marginal.routeDelta)+' · Pressure +'+pct(x.marginal&&x.marginal.pressureCost)+'</p>'+chips(dims,'Nessuna nuova dimensione forte')+'</article>';
  }).join('');
}
function scenarioCards(a){
  const s=a.scenarios||{},cards=[];
  if(s.protectTime)cards.push({ey:'PROTECT TIME',title:'Proteggere il tempo',body:'Rotta: '+routeNames(s.protectTime.route).join(' → '),foot:'Removed: '+(routeNames(s.protectTime.removed).join(', ')||'nessuno')+' · Pressure '+pct(s.protectTime.pressure)+' · Δ '+signed(s.protectTime.impact&&s.protectTime.impact.pressure)});
  if(s.protectIdentity)cards.push({ey:'PROTECT IDENTITY',title:'Proteggere il DNA',body:'Rotta: '+routeNames(s.protectIdentity.route).join(' → '),foot:'Removed: '+(routeNames(s.protectIdentity.removed).join(', ')||'nessuno')+' · Coverage '+pct(s.protectIdentity.coverage)});
  if(s.protectExperiences)cards.push({ey:'PROTECT EXPERIENCE',title:'Proteggere le esperienze',body:'Azione: '+esc(s.protectExperiences.action||'none')+' · Rotta: '+routeNames(s.protectExperiences.route).join(' → '),foot:'Added: '+(routeName(s.protectExperiences.added)||'—')+' · Removed: '+(routeName(s.protectExperiences.removed)||'—')});
  if(s.protectValue)cards.push({ey:'PROTECT VALUE',title:'Proteggere il valore',body:'Destinazioni con migliore relazione relativa tra affinità, fattibilità e burden operativo.',foot:(s.protectValue.destinations||[]).slice(0,6).map(x=>x.name+' '+x.efficiency).join(' · ')});
  return cards.map(c=>'<article class="scenario"><small>'+c.ey+'</small><h3>'+c.title+'</h3><p>'+c.body+'</p><footer>'+c.foot+'</footer></article>').join('');
}
function constraintBlock(a){
  const c=a.constraints||{},all=[...(c.hard||[]).map(x=>({kind:'HARD',...x})),...(c.soft||[]).map(x=>({kind:'SOFT',...x})),...(c.info||[]).map(x=>({kind:'INFO',...x}))];
  if(!all.length)return '<p class="muted">Nessun vincolo esplicito rilevato dal motore.</p>';
  return '<div class="constraint-list">'+all.map(x=>'<article class="'+x.kind.toLowerCase()+'"><small>'+x.kind+'</small><p>'+esc(x.message||x.id)+'</p></article>').join('')+'</div>';
}
function firstReadCards(engine){
  const rules=engine&&engine.narrative&&engine.narrative.firstRead||[];
  if(!rules.length)return '<p class="muted">Nessuna regola esperta attivata.</p>';
  return rules.slice(0,8).map(r=>'<article class="read-card"><small>'+esc(r.category||'YUME RULE')+'</small><h3>'+esc(r.title||r.id)+'</h3><p>'+esc(r.copy||'')+'</p>'+(r.action?'<footer>'+esc(r.action)+'</footer>':'')+'</article>').join('');
}
function questions(engine){
  const q=engine&&engine.narrative&&engine.narrative.questions||[];
  return q.length?'<ol class="questions">'+q.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol>':'<p class="muted">Nessuna domanda prioritaria emersa.</p>';
}
function routeSummary(state,a,sel){
  const roleMap=Object.fromEntries((a.routeRoles||[]).map(r=>[r.id,r]));
  return sel.map((d,i)=>{
    const rr=roleMap[d.id],nights=state.nights&&state.nights[d.id]!=null?state.nights[d.id]:d.ideal;
    return '<article><em>'+String(i+1).padStart(2,'0')+'</em><div><small>'+esc(rr&&rr.role||'SUPPORT')+'</small><b>'+esc(d.name)+'</b><small>'+esc(d.region||d.country)+' · '+nights+' notti</small><p>'+esc((d.keywords||[]).slice(0,5).join(' · '))+'</p></div></article>';
  }).join('');
}
function buildHtml(state,engine){
  const a=engine&&engine.analysis?engine.analysis:null,n=engine&&engine.narrative?engine.narrative:null;
  const sel=selectedDestinations(state),xp=experienceLists(state);
  const persona=n&&n.persona?n.persona:{title:'Journey Concept',summary:'Il vostro concept è pronto per una lettura YUME.'};
  const status=a?humanStatus(a.decisionStatus):'LEGACY ONLY';
  const info=a&&a.informationQuality?a.informationQuality:{score:0,label:'—'};
  const stability=a&&a.rankingSensitivity?a.rankingSensitivity.stability:0;
  const destChunks=[];for(let i=0;i<sel.length;i+=4)destChunks.push(sel.slice(i,i+4));
  const destPages=destChunks.map((chunk,i)=>'<section class="page"><div class="page-inner">'+sectionTitle('07'+(destChunks.length>1?'.'+(i+1):''),'DESTINATION DNA · ROTTA','Ogni tappa ha un DNA. E un ruolo.','Non basta che un luogo sia bello: deve coprire qualcosa che per voi conta e giustificare il proprio posto nella composizione.')+'<div class="destination-grid">'+chunk.map(d=>destinationDNACard(d,a,state)).join('')+'</div></div></section>').join('');
  const css=[
    '*{box-sizing:border-box}',
    'html{-webkit-print-color-adjust:exact;print-color-adjust:exact}',
    'body{margin:0;background:#f5efe5;color:#2b0d16;font-family:Arial,Helvetica,sans-serif}',
    'main{max-width:1040px;margin:0 auto;padding:24px}',
    '.page{background:#fff;border:1px solid #e2d8cd;border-radius:22px;margin:20px 0;overflow:hidden}',
    '.page-inner{padding:34px}',
    '.cover{min-height:720px;display:grid;grid-template-columns:1.15fr .85fr;gap:36px;align-items:center}',
    '.ey{font-size:10px;letter-spacing:.2em;color:#9a7440;font-weight:700}',
    'h1,h2,h3{font-family:Georgia,"Times New Roman",serif;font-weight:500}',
    'h1{font-size:56px;line-height:1.02;margin:14px 0 18px}',
    'h2{font-size:34px;line-height:1.08;margin:8px 0 12px}',
    'h3{font-size:19px;margin:6px 0}',
    'h4{font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:#9a7440;margin:16px 0 7px}',
    'p{line-height:1.55}',
    '.muted,.section-head p{color:#746a6e}',
    '.section-head{margin-bottom:22px}.section-head p{max-width:780px;margin:0}',
    '.orb{aspect-ratio:1;border:1px solid #d8cec4;border-radius:50%;display:grid;place-items:center;text-align:center;padding:28px}',
    '.orb b{font:32px Georgia,serif}.orb .score{font:56px Georgia,serif;color:#b8894d;display:block}',
    '.pills,.chips{display:flex;flex-wrap:wrap;gap:6px}.pills span,.chips span{border:1px solid #ddd1c6;border-radius:999px;padding:7px 10px;font-size:9px}',
    '.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:18px 0}',
    '.metric{border:1px solid #e9e0d7;border-radius:14px;padding:12px;background:#fbf8f3}.metric small,.metric span{display:block;color:#85797d;font-size:8px;letter-spacing:.08em}.metric strong{display:block;font:24px Georgia,serif;margin:5px 0;color:#2b0d16}',
    '.two-col{display:grid;grid-template-columns:1fr 1fr;gap:24px}.two-col h3{margin-top:0}',
    '.dna-row{margin:8px 0}.dna-row-head{display:flex;justify-content:space-between;gap:8px;font-size:10px}.dna-row>i{display:block;height:4px;background:#eee8e1;border-radius:9px;overflow:hidden;margin:4px 0}.dna-row>i>b{display:block;height:100%;background:#2b0d16}.dna-row small{display:block;color:#8a7f82;font-size:8px}.dna-row.tension>i>b{background:#9a7440}',
    '.dna-groups{display:grid;grid-template-columns:1fr 1fr;gap:14px}.dna-group{border:1px solid #eee6de;border-radius:15px;padding:13px}.dna-group h3{font:700 9px Arial,sans-serif;letter-spacing:.14em;color:#9a7440;margin:0 0 8px}',
    '.signal-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}.signal-card{padding:13px;border:1px solid #e8dfd6;border-radius:15px;background:#fbf8f3}.signal-card small{color:#9a7440;font-size:8px;letter-spacing:.08em}.signal-card h3{font-size:17px}.signal-card .big-number{font:32px Georgia,serif}.signal-card p{font-size:9px;color:#786d71;margin:3px 0}',
    '.route-sketch svg{width:100%;height:auto;display:block;overflow:visible}.node-label{font:11px Arial,sans-serif;fill:#746a6e}.node-index{font:700 7px Arial,sans-serif;fill:#fff}.sketch-note{margin-bottom:3px;color:#9a7440;font-size:9px;letter-spacing:.1em;text-transform:uppercase}.sketch-legend{display:flex;gap:12px;flex-wrap:wrap;font-size:8px;color:#7a7074}.sketch-legend span{display:flex;align-items:center;gap:5px}.sketch-legend i{width:9px;height:9px;border-radius:50%;background:#2b0d16;display:inline-block}.sketch-legend i.start{background:#b8894d;box-shadow:0 0 0 2px #fff,0 0 0 3px #b8894d}.sketch-legend i.accent{background:#fff;border:2px solid #b8894d}',
    '.route-list{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:14px}.route-list article{display:flex;gap:12px;padding:11px;border:1px solid #eee;border-radius:13px}.route-list em{font:19px Georgia,serif;color:#b8894d}.route-list small,.route-list p{display:block;color:#746a6e;font-size:9px;margin:3px 0}.route-list b{display:block;font:16px Georgia,serif}',
    '.experience-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.experience-box{border:1px solid #e9e0d7;border-radius:14px;padding:14px}.experience-box h3{font-size:16px}.experience-box.must{background:#faf4ea}.experience-box.reject{background:#fafafa;color:#746a6e}',
    '.match-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.match-card{display:grid;grid-template-columns:36px 1fr;gap:10px;border:1px solid #e7ddd4;border-radius:16px;padding:14px}.match-card .rank{font:22px Georgia,serif;color:#b8894d}.match-card small,.dest-dna small,.surprise small,.scenario small,.role-card small,.addition small,.read-card small{font-size:8px;letter-spacing:.1em;color:#9a7440}.scoreline{display:flex;justify-content:space-between;gap:8px;align-items:center}.scoreline b{font:18px Georgia,serif}.scoreline span{font-size:8px;color:#7a7074}',
    '.mini-metrics{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}.mini-metrics span{font-size:8px;border:1px solid #e2d8cf;border-radius:999px;padding:5px 7px}.mini-metrics b{font-size:9px}',
    '.driver-list{list-style:none;padding:0;margin:8px 0}.driver-list li{display:flex;justify-content:space-between;gap:10px;border-top:1px solid #f0eae4;padding:5px 0;font-size:8px}.driver-list li span{color:#7d7376;text-align:right}',
    '.surprise-grid{display:grid;grid-template-columns:1.15fr .85fr .85fr;gap:10px}.surprise{border:1px solid #dbcdbf;border-radius:17px;padding:16px}.hero-surprise{background:#2b0d16;color:#fff;border-color:#2b0d16}.hero-surprise small{color:#d8ae70}.hero-surprise .mini-metrics span,.hero-surprise .chips span{border-color:rgba(255,255,255,.25)}.surprise-copy{font:20px Georgia,serif}',
    '.destination-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.dest-dna{border:1px solid #e4dbd2;border-radius:17px;padding:14px;break-inside:avoid}.dest-dna header{display:flex;justify-content:space-between;gap:10px}.dest-dna .affinity{font:32px Georgia,serif;color:#b8894d;text-align:right}.dest-dna .affinity small{display:block}.signature-bars .dna-row{margin:5px 0}.role-why{font-size:9px;color:#746a6e;border-top:1px solid #eee5dc;padding-top:7px}',
    '.optimizer,.night-box{border:1px solid #dfd3c7;border-radius:16px;padding:15px;margin:12px 0;background:#fbf8f3}.optimizer small,.night-box small{font-size:8px;letter-spacing:.11em;color:#9a7440}.route-string{font:16px Georgia,serif;line-height:1.45}.route-arrow{text-align:center;color:#b8894d;font-size:20px}.route-string.recommended{color:#9a7440}.optimizer p{font-size:9px;color:#766b70}.night-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.night-grid span{font-size:9px;border:1px solid #e4dbd2;border-radius:10px;padding:8px}.night-grid b,.night-grid small{display:block}.warning{color:#8f4e3e}',
    '.role-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.role-card{border:1px solid #e7ded5;border-radius:14px;padding:12px}.role-card p{font-size:9px;color:#746a6e}',
    'table{width:100%;border-collapse:collapse;font-size:9px}th{text-align:left;color:#9a7440;letter-spacing:.08em;font-size:8px;padding:8px;border-bottom:1px solid #d9cec4}td{padding:8px;border-bottom:1px solid #eee7df}',
    '.addition-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:16px}.addition{border:1px solid #e6ddd4;border-radius:14px;padding:12px}.addition p{font-size:8px;color:#766c70}',
    '.scenario-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.scenario{border:1px solid #e3d8ce;border-radius:16px;padding:15px}.scenario p{font-size:10px;color:#5e5358}.scenario footer{font-size:8px;color:#8b7d81;border-top:1px solid #eee5dd;padding-top:8px}',
    '.constraint-list{display:grid;grid-template-columns:1fr 1fr;gap:7px}.constraint-list article{border-radius:12px;padding:10px;border:1px solid #e8dfd6}.constraint-list small{font-size:8px;letter-spacing:.12em}.constraint-list p{font-size:9px;margin:4px 0}.constraint-list .hard{border-color:#b66b58}.constraint-list .soft{border-color:#c6a16d}.constraint-list .info{border-color:#d9d2cb}',
    '.read-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.read-card{border:1px solid #e6ddd4;border-radius:14px;padding:13px}.read-card p{font-size:9px;color:#6f6468}.read-card footer{font-size:8px;color:#9a7440}',
    '.questions{padding-left:20px}.questions li{margin:10px 0;line-height:1.45}',
    '.technical{font-size:8px;color:#877d80;border-top:1px solid #e8e0d8;padding-top:10px;margin-top:18px}',
    '.actions{position:sticky;bottom:10px;display:flex;justify-content:center;gap:8px;z-index:10}.actions button{padding:13px 18px;border-radius:10px;border:0;background:#2b0d16;color:#fff;font-weight:bold}.actions .alt{background:#fff;color:#2b0d16;border:1px solid #d8cec4}',
    '@media(max-width:720px){main{padding:10px}.cover,.two-col,.dna-groups,.match-grid,.destination-grid,.scenario-grid{grid-template-columns:1fr}.metrics,.signal-grid{grid-template-columns:1fr 1fr}.surprise-grid,.role-grid,.addition-grid,.night-grid{grid-template-columns:1fr}.route-list{grid-template-columns:1fr}h1{font-size:42px}.page-inner{padding:22px}}',
    '@media print{@page{size:A4 portrait;margin:10mm}body{background:#fff}main{max-width:none;padding:0}.page{border:0;border-radius:0;margin:0;break-after:page;page-break-after:always;overflow:visible}.page:last-of-type{break-after:auto;page-break-after:auto}.page-inner{padding:0}.cover{min-height:255mm}.actions{display:none}.dest-dna,.match-card,.scenario,.role-card,.read-card,.addition{break-inside:avoid;page-break-inside:avoid}}'
  ].join('');
  const inputExperienceBoxes=[
    '<div class="experience-box must"><small>DA PROTEGGERE</small><h3>MUST</h3>'+chips(xp.must,'Nessun MUST')+'</div>',
    '<div class="experience-box"><small>DA ESPLORARE</small><h3>WANT / CURIOUS</h3>'+chips(xp.want,'Nessuna esperienza intermedia')+'</div>',
    '<div class="experience-box reject"><small>NON FA PER VOI</small><h3>REJECT</h3>'+chips(xp.reject,'Nessun rifiuto esplicito')+'</div>'
  ].join('');
  const coverMetrics=a?[
    metric('CONFIDENCE',pct(a.analysisConfidence),'/100'),
    metric('INFORMATION QUALITY',pct(info.score),info.label),
    metric('RANKING STABILITY',pct(stability),'/100'),
    metric('DECISION',status,'')
  ].join(''):'';
  return '<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(state.journeyId||'YUME')+' · Journey Intelligence Book</title><style>'+css+'</style></head><body><main>'+
    '<section class="page"><div class="page-inner cover"><div><div class="ey">YUME HONEYMOON · JOURNEY INTELLIGENCE BOOK</div><h1>Il viaggio che avete iniziato a costruire. Ora letto dal cervello YUME.</h1><h3>'+esc(persona.title)+'</h3><p class="muted">'+esc(persona.summary)+'</p><div class="pills"><span>'+esc(state.duration)+' giorni</span><span>'+esc(state.period||'Periodo da definire')+'</span><span>Budget '+esc(state.budget||'da definire')+'</span><span>'+esc(status)+'</span></div><div class="metrics">'+coverMetrics+'</div></div><div class="orb"><div><div class="ey">JOURNEY ID</div><b>'+esc(state.journeyId||'—')+'</b>'+(a?'<span class="score">'+pct(a.route&&a.route.score)+'</span><p>Journey Coherence<br>Engine '+esc(a.engineVersion)+'</p>':'<p>Intelligence non disponibile</p>')+'</div></div></div></section>'+
    '<section class="page"><div class="page-inner">'+sectionTitle('01','LA VOSTRA GEOGRAFIA','Non una lista. Una sequenza da rendere possibile.','La mappa qui è narrativa: il Route Intelligence valuta separatamente distanza, attrito, sequenza e pressione.')+'<div class="route-sketch">'+routeSketchSvg(sel,a&&a.routeRoles)+'</div><div class="route-list">'+routeSummary(state,a||{routeRoles:[]},sel)+'</div>'+(a?optimiserBlock(a):'')+'</div></section>'+
    '<section class="page"><div class="page-inner">'+sectionTitle('02','INPUT DICHIARATO','Quello che avete detto. Non ancora quello che il motore ha inferito.','I cinque cursori e l’allocazione sono solo una parte dell’evidenza. Sparks, esperienze, duelli e geografia vengono combinati nel Traveller DNA 20D.')+renderDeclared(state)+'<div class="experience-grid" style="margin-top:18px">'+inputExperienceBoxes+'</div></div></section>'+
    '<section class="page"><div class="page-inner">'+sectionTitle('03','YOUR JOURNEY DNA','20 dimensioni. Una lettura probabilistica, non un quiz.','Ogni dimensione integra valore, confidence, contraddizione e più famiglie di evidenza. Un valore alto non è “migliore”: indica ciò che pesa di più nel vostro concept.')+(a?'<div class="metrics">'+metric('ANALYSIS CONFIDENCE',pct(a.analysisConfidence),'/100')+metric('QUALITY',pct(info.score),info.label)+metric('STABILITY',pct(stability),'/100')+metric('DNA DIMENSIONS',DATA.dimensions.length,'shared ontology')+'</div><div class="dna-groups">'+renderTravellerDNA(a)+'</div>':'<p class="muted">Intelligence non disponibile.</p>')+'</div></section>'+
    '<section class="page"><div class="page-inner">'+sectionTitle('04','EVIDENCE LAYER','I segnali che stanno davvero guidando il sistema.','Qui si vede quali tratti hanno forza e certezza sufficienti per influenzare il ranking e la composizione.')+'<div class="signal-grid">'+(a?signalCards(a):'')+'</div><div style="margin-top:18px"><h3>YUME First Read</h3><div class="read-grid">'+firstReadCards(engine)+'</div></div></div></section>'+
    '<section class="page"><div class="page-inner">'+sectionTitle('05','DESTINATION INTELLIGENCE','Affinity non significa automaticamente “da inserire”.','Il motore separa somiglianza identitaria, fattibilità e robustezza del segnale. La gerarchia serve ad aprire e restringere ipotesi, non a sostituire il Travel Designer.')+'<div class="match-grid">'+(a?matchCards(a):'')+'</div></div></section>'+
    '<section class="page"><div class="page-inner">'+sectionTitle('06','SURPRISE MATCH','Non era nella vostra lista. Ma il vostro DNA la vede.','Un Surprise Match deve avere affinità sufficiente e soprattutto aggiungere valore marginale alla rotta, non soltanto essere compatibile in astratto.')+'<div class="surprise-grid">'+(a?surpriseCards(a):'')+'</div></div></section>'+
    destPages+
    '<section class="page"><div class="page-inner">'+sectionTitle('08','ROUTE INTELLIGENCE','Quanto funziona la composizione, non soltanto le singole tappe.','Il motore legge coverage, ridondanza, pressione, sequenza, notti, budget relativo e attrito geografico.')+(a?'<div class="metrics">'+routeMetrics(a)+'</div>'+optimiserBlock(a)+nightBlock(a)+'<h3>Ruoli della rotta</h3><div class="role-grid">'+roleCards(a)+'</div>':'')+'</div></section>'+
    '<section class="page"><div class="page-inner">'+sectionTitle('09','COUNTERFACTUAL ENGINE','Cosa cambia se una tappa esce. Cosa aggiunge davvero una nuova destinazione.','Il valore di una tappa è marginale e strutturale: non coincide con il suo punteggio standalone.')+(a?'<h3>Se togliessimo una tappa</h3><table><thead><tr><th>Tappa</th><th>Structural</th><th>Δ score</th><th>Δ coverage</th><th>Δ pressure</th><th>Δ distanza</th></tr></thead><tbody>'+removalRows(a)+'</tbody></table><h3 style="margin-top:18px">Se aggiungessimo una destinazione</h3><div class="addition-grid">'+additionCards(a)+'</div>':'')+'</div></section>'+
    '<section class="page"><div class="page-inner">'+sectionTitle('10','SCENARIO ENGINE','La stessa coppia può avere più viaggi coerenti.','Gli scenari non sono un migliore/peggiore: isolano cosa succede quando si decide di proteggere tempo, identità, esperienze o valore.')+'<div class="scenario-grid">'+(a?scenarioCards(a):'')+'</div></div></section>'+
    '<section class="page"><div class="page-inner">'+sectionTitle('11','GUARDRAIL · YUME FIRST READ','Dove il motore si ferma e passa la parola al Travel Designer.','Confidence e vincoli determinano quanto un output può essere esposto come forte, esplorativo o da revisionare.')+(a?'<div class="metrics">'+metric('DECISION STATUS',status,'')+metric('CONFIDENCE',pct(a.analysisConfidence),'/100')+metric('QUALITY',pct(info.score),info.label)+metric('KNOWLEDGE',esc(a.knowledgeVersion||'—'),'version')+'</div><h3>Vincoli rilevati</h3>'+constraintBlock(a)+'<h3 style="margin-top:20px">Regole esperte attivate</h3><div class="read-grid">'+firstReadCards(engine)+'</div><h3 style="margin-top:20px">Le domande che restano aperte</h3>'+questions(engine)+'<div class="technical">Engine '+esc(a.engineVersion)+' · Knowledge '+esc(a.knowledgeVersion)+' · Ranking stability '+pct(stability)+' · Generated '+esc(a.generatedAt||'')+'. Indici interni YUME: non sono prezzi, probabilità scientifiche o garanzie operative.</div>':'')+'</div></section>'+
    '<section class="page"><div class="page-inner">'+sectionTitle('12','IL PASSAGGIO SUCCESSIVO','Dal cervellone alla regia umana.','Questo Journey Intelligence Book non è un preventivo automatico e non è un itinerario definitivo. È il brief strutturato che permette al Travel Designer YUME di validare stagionalità, collegamenti, disponibilità, strutture e costi reali senza ripartire da zero.')+'<div class="two-col"><div><h3>Da proteggere</h3>'+chips(xp.must,'Da definire')+'</div><div><h3>Da evitare</h3>'+chips(xp.reject,'Nessun rifiuto esplicito')+'</div></div><h3 style="margin-top:24px">Prima domanda al Travel Designer</h3>'+questions(engine)+'</div></section>'+
    '<div class="actions"><button onclick="window.print()">Salva / stampa PDF</button><button class="alt" onclick="window.close()">Continua nel Lab</button></div>'+
    '</main></body></html>';
}
function open(){
  const state=getState();
  if(!state)return;
  const engine=getEngine();
  const w=window.open('','_blank');
  if(!w)return;
  w.document.open();
  w.document.write(buildHtml(state,engine));
  w.document.close();
}
function install(){
  const button=document.querySelector('[data-print]');
  if(button){
    button.onclick=function(){
      const d=DEBUG();
      if(d&&d.analyse)d.analyse();
      open();
    };
    button.dataset.intelligenceBook='0952';
  }
}
global.YumeJourneyIntelligenceBook=Object.freeze({version:VERSION,buildHtml,open,install});
document.addEventListener('DOMContentLoaded',install);
})(window);
