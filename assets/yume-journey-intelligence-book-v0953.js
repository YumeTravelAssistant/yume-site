/* YUME Journey Intelligence Book · v0.95.2
   Full intelligence PDF/print renderer for the isolated Honeymoon Lab preview.
   Uses only values emitted by YumeHoneymoonIntelligence / Journey Intelligence. */
(function(global){
'use strict';

const VERSION='0.95.3';
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
  ANCHOR:'TAPPA PORTANTE',
  SUPPORT:'TAPPA DI SUPPORTO',
  CONTRAST:'CONTRASTO',
  BRIDGE:'PASSAGGIO',
  SIGNATURE:'MOMENTO FIRMA',
  DECOMPRESSION:'RESPIRO'
};

const CLIENT_DIM_LABELS={
 urban:'Energia urbana',nature:'Natura',sea:'Mare',slow:'Tempo lento',
 heritage:'Patrimonio e storia',contemporary:'Contemporaneo',craft:'Artigianato',
 food:'Gastronomia',nightlife:'Vita serale',wellness:'Benessere',adventure:'Avventura',design:'Design',
 iconic:'Grandi icone',discovery:'Scoperta',comfort:'Comfort',autonomy:'Autonomia',depth:'Profondità',
 privacy:'Privacy',romance:'Dimensione romantica',local:'Immersione locale'
};
const clientDimLabel=d=>CLIENT_DIM_LABELS[d]||(DATA.dimensionMeta&&DATA.dimensionMeta[d]&&DATA.dimensionMeta[d].label)||d;
const KEYWORD_LABELS={food:'gastronomia',nightlife:'vita serale',slow:'tempo lento',beach:'spiagge','gold leaf':'foglia d’oro',heritage:'patrimonio',nature:'natura',urban:'città',craft:'artigianato'};
const keywordLabel=k=>KEYWORD_LABELS[String(k).toLowerCase()]||k;
const matchLabel=c=>({
 'STRUCTURAL MATCH':'Molto coerente con il viaggio',
 'NATURAL MATCH':'Affinità naturale',
 'AFFINE · DA PROTEGGERE':'Affine, ma da proteggere',
 'ALTA AFFINITÀ':'Affinità alta',
 'COERENTE':'Coerente',
 'DA ESPLORARE':'Da esplorare'
}[c]||'Da esplorare');
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,Number(v)||0));
const pct=v=>Math.round(clamp(v));
const signed=v=>{const n=Math.round(Number(v)||0);return(n>0?'+':'')+n};
const routeName=id=>DATA&&DATA.destinationById&&DATA.destinationById[id]?DATA.destinationById[id].name:id;
const routeNames=ids=>(ids||[]).map(routeName);
const confidenceLabel=c=>c>=.78?'Segnale forte':c>=.55?'Segnale consistente':'Da esplorare';
const humanStatus=s=>({
  READY:'Concept molto leggibile',
  REVIEW_REQUIRED:'Da rifinire insieme',
  HUMAN_REQUIRED:'Da leggere insieme',
  BLOCKED:'Manca un passaggio'
}[s]||s||'Da leggere insieme');

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
function geographicScope(state){
  const countries=[...new Set(selectedDestinations(state).map(d=>d.country).filter(Boolean))];
  if(countries.length)return countries;
  const region=String(state.region||'').toLowerCase();
  if(region.includes('giapp'))return['JP'];
  if(region.includes('corea'))return['KR'];
  if(region.includes('thailand'))return['TH'];
  if(region.includes('polines'))return['PF'];
  return[];
}
function inScopeDestination(d,state){
  if(!d)return false;
  const scope=geographicScope(state);
  return !scope.length||scope.includes(d.country);
}
function scopedRanking(a,state){
  return (a&&a.destinationRanking||[]).filter(r=>inScopeDestination(r.destination,state));
}
function scopedSurprises(a,state){
  return (a&&a.surpriseMatches||[]).filter(r=>inScopeDestination(r.destination,state));
}
function scopedAdditions(a,state){
  return (a&&a.counterfactuals&&a.counterfactuals.additions||[]).filter(x=>inScopeDestination(DATA.destinationById[x.destination],state));
}
function scopedProtectValue(a,state){
  const items=a&&a.scenarios&&a.scenarios.protectValue&&a.scenarios.protectValue.destinations||[];
  return items.filter(x=>inScopeDestination(DATA.destinationById[x.id],state));
}
function strongestReadableTraits(a){
  if(!a||!a.travellerDNA)return[];
  const meta=DATA.dimensionMeta||{};
  return Object.entries(a.travellerDNA)
    .map(([key,x])=>({key,label:clientDimLabel(key),value:Number(x.value||50),confidence:Number(x.confidence||0),strength:Math.abs(Number(x.value||50)-50)*Number(x.confidence||0)}))
    .filter(x=>x.value>=58&&x.confidence>=.42)
    .sort((x,y)=>y.strength-x.strength)
    .slice(0,4);
}
function editorialVerdict(a,state){
  if(!a)return{title:'Un viaggio da leggere insieme',text:'Le vostre scelte hanno già una direzione. Il prossimo passo è trasformarle in ritmo, luoghi e priorità reali.',protect:'Il desiderio che vi ha portati fin qui.',watch:'Ci sono ancora alcuni punti da mettere a fuoco.'};
  const traits=strongestReadableTraits(a);
  const keys=traits.map(x=>x.key);
  const labels=traits.map(x=>x.label.toLowerCase());
  const readable=labels.length>=2?labels.slice(0,3).join(', ').replace(/, ([^,]*)$/, ' e $1'):'il modo in cui volete vivere il viaggio';
  const r=a.route||{};
  const conf=Number(a.analysisConfidence||0);
  let title='Una base che vi assomiglia';
  if(conf<72) title='La direzione c’è. Va ancora resa più vostra.';
  else if(keys.includes('food')&&keys.includes('nature')&&keys.includes('craft')) title='Un viaggio fatto di sapori, natura e dettagli';
  else if(keys.includes('food')&&keys.includes('local')) title='Un viaggio da vivere anche a tavola';
  else if(keys.includes('nature')&&keys.includes('adventure')) title='Un viaggio che ha bisogno di spazio e movimento';
  else if(keys.includes('urban')&&(keys.includes('nightlife')||keys.includes('discovery'))) title='Un viaggio acceso, libero e contemporaneo';
  else if(keys.includes('sea')&&keys.includes('slow')) title='Un viaggio che alterna scoperta e respiro';
  else if((keys.includes('craft')||keys.includes('heritage'))&&keys.includes('depth')) title='Un viaggio fatto di cultura, gesti e profondità';
  else if(keys.includes('design')&&(keys.includes('privacy')||keys.includes('comfort'))) title='Un viaggio curato, senza bisogno di ostentare';
  else if(keys.includes('slow')&&keys.includes('depth')) title='Meno tappe. Più tempo dentro i luoghi';
  else if(keys.includes('iconic')) title='Un primo Giappone completo, ma non standard';

  let routeText='La composizione è credibile. Il lavoro più importante non è aggiungere tappe, ma dare a ciascuna un motivo preciso per esserci.';
  if(Number(r.pressure)>=55){
    routeText='La traccia che avete costruito è ricca, ma oggi chiede più energia di quella che serve. Prima di aggiungere altro, alleggerirei e proteggerei meglio il tempo nei luoghi che contano davvero.';
  }else if(Number(r.coverage)<70){
    routeText='La rotta funziona, ma non copre ancora bene tutto ciò che emerge dalle vostre scelte. Cercherei un’aggiunta mirata o una sostituzione, non una tappa in più “per completezza”.';
  }else if(Number(r.redundancy)>=90){
    routeText='La base è buona, ma alcune tappe stanno raccontando parti simili del viaggio. Non le toglierei automaticamente: prima darei a ciascuna una funzione più netta, così il viaggio acquista contrasto.';
  }else if(Number(r.score)>=80&&Number(r.pressure)<=35){
    routeText='La composizione è già molto solida e non sembra chiedere correzioni drastiche. Lavorerei soprattutto su ritmo, quartieri, esperienze e qualità delle soste.';
  }else if(Number(r.pressure)<=35){
    routeText='La composizione respira bene: c’è spazio per vivere i luoghi senza trasformare il viaggio in una sequenza di partenze e check-in.';
  }

  const traitText=traits.length?'Le vostre scelte raccontano soprattutto '+readable+'. ':'Le vostre risposte non chiedono un viaggio costruito intorno a un solo tema. ';
  let protect='Proteggerei ciò che ricorre con più coerenza nelle vostre scelte, prima ancora dei singoli luoghi.';
  const top=traits[0]&&traits[0].key;
  if(top==='food')protect='La gastronomia non è un extra: può diventare uno dei fili con cui scegliere quartieri, orari, mercati e momenti speciali.';
  else if(top==='nature')protect='La natura ha un peso vero: non la ridurrei a una sola escursione, ma le darei spazio dentro il ritmo del viaggio.';
  else if(top==='slow'||top==='depth')protect='Il tempo nei luoghi conta quanto i luoghi stessi: eviterei di sacrificare profondità soltanto per aumentare il numero delle tappe.';
  else if(top==='urban')protect='L’energia urbana è parte del vostro modo di viaggiare: sceglierei città e quartieri con caratteri diversi, non una semplice successione di grandi centri.';
  else if(top==='local'||top==='craft')protect='L’incontro con il territorio deve essere concreto: quartieri, botteghe, mercati e persone valgono più di una lista di attrazioni.';
  else if(top==='adventure'||top==='discovery')protect='La scoperta deve restare autentica: lascerei margine per luoghi meno ovvi, ma solo quando aggiungono davvero qualcosa alla rotta.';
  else if(top==='sea')protect='Il mare deve cambiare il ritmo del viaggio, non essere soltanto una parentesi finale: gli darei tempo vero e una funzione precisa.';
  const scope=geographicScope(state);
  const watch=scope.length===1?'Qualunque alternativa resta dentro lo stesso Paese della rotta scelta.':'Qualunque alternativa resta dentro i Paesi già presenti nel vostro concept.';
  return{title,text:traitText+routeText,protect,watch};
}
function clarityLabel(a){
  const c=Number(a&&a.analysisConfidence||0);
  return c>=78?'Lettura molto chiara':c>=62?'Lettura abbastanza chiara':'Da approfondire insieme';
}
function profileTitle(a){
  const t=strongestReadableTraits(a).map(x=>x.key);
  if(t.includes('food')&&t.includes('nature')&&t.includes('craft'))return'Sapori, natura e dettagli da ricordare';
  if(t.includes('food')&&t.includes('local'))return'Il gusto come modo di entrare nei luoghi';
  if(t.includes('nature')&&t.includes('adventure'))return'Natura, scoperta e libertà di movimento';
  if(t.includes('slow')&&t.includes('depth'))return'Meno tappe. Più tempo dentro i luoghi';
  if(t.includes('urban')&&t.includes('discovery'))return'Città da vivere, non soltanto da vedere';
  if(t.includes('craft')||t.includes('heritage'))return'Un viaggio fatto di cultura, gesti e dettagli';
  if(t.includes('sea')&&t.includes('slow'))return'Un viaggio che alterna scoperta e respiro';
  return'Un viaggio da costruire intorno al vostro modo di stare insieme';
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
  return '<div class="sketch-note">Schema narrativo · non in scala</div><svg viewBox="0 0 '+w+' '+h+'" role="img">'+lines.join('')+nodes+'</svg><div class="sketch-legend"><span><i class="start"></i>Ingresso</span><span><i></i>Tappa</span><span><i class="accent"></i>Tappa firma / respiro</span><span>Le frecce indicano la sequenza</span></div>';
}
function renderDeclared(state){
  const left=DECLARED_DNA.map(([k,l])=>bar(l,state.dna&&state.dna[k]!=null?state.dna[k]:50,'INPUT DICHIARATO')).join('');
  const right=Object.entries(state.allocation||{}).map(([k,v])=>bar(ALLOCATION_LABELS[k]||k,v,'ALLOCAZIONE')).join('');
  return '<div class="two-col"><div><h3>Come avete risposto</h3>'+left+'</div><div><h3>Dove volete sentire il valore</h3>'+right+'</div></div>';
}
function renderTravellerDNA(a){
  if(!a)return '<p class="muted">La lettura non è ancora disponibile.</p>';
  const meta=DATA.dimensionMeta||{};
  return DIMENSION_GROUPS.map(g=>{
    const dims=DATA.dimensions.filter(d=>meta[d]&&meta[d].group===g.key);
    return '<div class="dna-group"><h3>'+esc(g.label)+'</h3>'+dims.map(d=>{
      const x=a.travellerDNA[d]||{value:50,confidence:.05,contradiction:0};
      const contr=Math.round((x.contradiction||0)*100);
      const note=confidenceLabel(x.confidence||0)+(contr>=30?' · da chiarire':'');
      return bar(clientDimLabel(d),x.value,note,contr>=30?'tension':'');
    }).join('')+'</div>';
  }).join('');
}
function signalCards(a){
  return (a.topSignals||[]).slice(0,8).map(x=>{
    const contr=Math.round((x.contradiction||0)*100);
    return '<article class="signal-card"><small>'+esc(confidenceLabel(x.confidence||0))+'</small><h3>'+esc(clientDimLabel(x.dimension))+'</h3><div class="big-number">'+pct(x.value)+'</div><p>'+(contr>=30?'Qui le vostre risposte raccontano due esigenze diverse.':'Questo tratto ricorre con una buona coerenza nelle vostre scelte.')+'</p></article>';
  }).join('');
}
function matchDrivers(r){
  const list=(r&&r.semantic&&r.semantic.breakdown?r.semantic.breakdown:[]).slice(0,4);
  return list.length?list.map(x=>'<li><b>'+esc(clientDimLabel(x.dimension))+'</b><span>incontro '+pct(x.fit)+' · voi '+pct(x.traveller)+' · luogo '+pct(x.destination)+'</span></li>').join(''):'<li><span>Driver non disponibili.</span></li>';
}
function matchCards(a,state){
  if(!a)return '';
  const rows=scopedRanking(a,state).slice(0,6),selected=new Set(state.destinations||[]);
  if(!rows.length)return '<p class="muted">Nessuna proposta aggiuntiva è abbastanza solida dentro il perimetro geografico scelto.</p>';
  return rows.map((r,i)=>{
    const drivers=(r&&r.semantic&&r.semantic.breakdown?r.semantic.breakdown:[]).slice(0,3);
    const why=drivers.length
      ? drivers.map(x=>clientDimLabel(x.dimension).toLowerCase()).join(', ').replace(/, ([^,]*)$/, ' e $1')
      : 'il vostro modo di viaggiare';
    const season=r.feasibility&&r.feasibility.season&&r.feasibility.season.score;
    const place=selected.has(r.id)?' · già nella vostra rotta':'';
    return '<article class="match-card"><div class="rank">'+String(i+1).padStart(2,'0')+'</div><div><small>'+esc(matchLabel(r.classification))+esc(place)+'</small><h3>'+esc(r.destination.name)+'</h3><p class="human-copy">Ci torna soprattutto per '+esc(why)+'.</p><div class="scoreline"><b>Affinità '+pct(r.affinity)+'</b></div><div class="mini-metrics"><span>Fattibilità <b>'+pct(r.feasibility&&r.feasibility.score)+'</b></span>'+(Number.isFinite(Number(season))?'<span>Periodo <b>'+pct(season)+'</b></span>':'')+'</div></div></article>';
  }).join('');
}
function surpriseCards(a,state){
  const items=scopedSurprises(a,state).slice(0,3);
  if(!items.length)return '<div class="soft-note"><h3>Nessuna deviazione necessaria</h3><p>Le alternative emerse non aggiungono abbastanza valore da giustificare un cambio di direzione. Per ora lavorerei meglio sui luoghi già scelti.</p></div>';
  return items.map((r,i)=>{
    const dims=(r.marginal&&r.marginal.newDimensions||[]).slice(0,4).map(x=>x.label);
    return '<article class="'+(i===0?'surprise hero-surprise':'surprise')+'"><small>'+(i===0?'UNA POSSIBILITÀ DA TENERE D’OCCHIO':'ALTRA IPOTESI COERENTE')+'</small><h3>'+esc(r.destination.name)+'</h3><p class="surprise-copy">'+(i===0?'Non era tra le vostre prime scelte, ma introduce qualcosa che oggi manca alla rotta.':'Resta coerente con il vostro stile, senza uscire dal perimetro geografico scelto.')+'</p><div class="mini-metrics"><span>Affinità <b>'+pct(r.affinity)+'</b></span><span>Valore aggiunto <b>'+pct(r.marginal&&r.marginal.score)+'</b></span><span>Solidità <b>'+pct(r.robustness)+'</b></span></div>'+chips(dims,'Nessuna nuova dimensione dominante')+'</article>';
  }).join('');
}
function destinationDNACard(d,a,state){
  a=a||{};
  const r=(a.destinationRanking||[]).find(x=>x.id===d.id);
  const role=(a.routeRoles||[]).find(x=>x.id===d.id);
  const meta=DATA.dimensionMeta||{};
  const signature=Object.entries(d.dna||{}).map(([key,value])=>({key,value,label:clientDimLabel(key)})).sort((x,y)=>y.value-x.value).slice(0,5);
  const alignment=(r&&r.semantic&&r.semantic.breakdown?r.semantic.breakdown:[]).slice(0,3);
  const nights=state.nights&&state.nights[d.id]!=null?state.nights[d.id]:d.ideal;
  return '<article class="dest-dna"><header><div><small>'+esc(ROLE_LABELS[role&&role.role]||'TAPPA DI SUPPORTO')+' · '+esc(d.region||d.country)+'</small><h3>'+esc(d.name)+'</h3></div><div class="affinity">'+(r?pct(r.affinity):'—')+'<small>AFFINITÀ</small></div></header><div class="mini-metrics"><span>'+nights+' notti</span><span>Fattibilità <b>'+(r?pct(r.feasibility&&r.feasibility.score):'—')+'</b></span></div><h4>Destination DNA · il carattere del luogo</h4><div class="signature-bars">'+signature.map(x=>bar(x.label,x.value,'LUOGO')).join('')+'</div><h4>Perché può funzionare per voi</h4><ul class="driver-list">'+(alignment.length?alignment.map(x=>'<li><b>'+esc(clientDimLabel(x.dimension))+'</b><span>incontro '+pct(x.fit)+' · voi '+pct(x.traveller)+' · luogo '+pct(x.destination)+'</span></li>').join(''):'<li><span>Segnale non abbastanza forte per una spiegazione specifica.</span></li>')+'</ul>'+(role?'<p class="role-why">'+esc(role.why)+'</p>':'')+'</article>';
}
function routeMetrics(a){
  const r=a.route||{};
  return [
    metric('COERENZA',pct(r.score),'/100'),
    metric('RITMO',100-pct(r.pressure),'/100 · più alto = più respiro'),
    metric('COPERTURA DEI DESIDERI',pct(r.coverage),'/100'),
    metric('SOVRAPPOSIZIONE',pct(r.redundancy),'/100'),
    metric('ORDINE DELLE TAPPE',pct(r.sequence),'/100'),
    metric('EQUILIBRIO NOTTI',pct(r.nightFit),'/100'),
    metric('TENUTA BUDGET',pct(r.budgetFit),'/100'),
    metric('DISTANZA',Number(r.distance||0).toLocaleString('it-IT')+' km','stima geometrica')
  ].join('');
}
function optimiserBlock(a){
  const o=a.routeOptimisation||{},original=o.original||[],recommended=o.recommended||[];
  const same=original.length===recommended.length&&original.every((x,i)=>x===recommended[i]);
  if(same)return '<div class="optimizer"><small>SEQUENZA DEL VIAGGIO</small><h3>Terrei questo ordine.</h3><div class="route-string">'+esc(routeNames(original).join(' → '))+'</div><p>Non emerge un vantaggio reale nel cambiare la successione delle tappe.</p></div>';
  return '<div class="optimizer"><small>SEQUENZA DEL VIAGGIO</small><h3>Proverei un ordine diverso.</h3><div class="route-string">'+esc(routeNames(original).join(' → '))+'</div><div class="route-arrow">↓</div><div class="route-string recommended">'+esc(routeNames(recommended).join(' → '))+'</div><p>Questa sequenza riduce l’attrito geografico della composizione. Va poi verificata sugli orari reali.</p></div>';
}
function nightBlock(a){
  const n=a.nightAllocation;
  if(!n)return '';
  return '<div class="night-box"><small>RITMO DELLE NOTTI</small><h3>'+(n.feasible?'Distribuzione consigliata':'Distribuzione sotto vincolo')+'</h3><div class="night-grid">'+(n.allocations||[]).map(x=>'<span><b>'+esc(x.name)+'</b>'+x.nights+' notti <small>min '+x.minimum+' · ideale '+x.ideal+'</small></span>').join('')+'</div>'+(n.shortfall?'<p class="warning">Mancano '+n.shortfall+' notte/i per rispettare i tempi minimi che abbiamo assegnato alle tappe.</p>':'')+'</div>';
}
function roleCards(a){
  return (a.routeRoles||[]).map(r=>'<article class="role-card"><small>'+esc(ROLE_LABELS[r.role]||r.role)+'</small><h3>'+esc(r.name)+'</h3><p>'+esc(r.why)+'</p><div class="mini-metrics"><span>Peso nella rotta <b>'+pct(r.structuralScore)+'</b></span><span>Solidità <b>'+pct(r.confidence)+'</b></span></div></article>').join('');
}
function removalRows(a){
  const items=a.counterfactuals&&a.counterfactuals.removals||[];
  return items.map(x=>'<tr><td><b>'+esc(x.name)+'</b></td><td>'+pct(x.structurality)+'</td><td>'+signed(x.delta)+'</td><td>'+signed(x.coverageDelta)+'</td><td>'+signed(x.pressureDelta)+'</td><td>'+signed(x.distanceDelta)+' km</td></tr>').join('');
}
function additionCards(a,state){
  const items=scopedAdditions(a,state).slice(0,6);
  if(!items.length)return '<p class="muted">Non vediamo, al momento, una tappa aggiuntiva che migliori davvero la composizione senza appesantirla.</p>';
  return items.map(x=>{
    const dims=(x.marginal&&x.marginal.newDimensions||[]).slice(0,3).map(d=>d.label);
    const pressure=pct(x.marginal&&x.marginal.pressureCost);
    const judgement=pressure>=30?'Interessante, ma costosa in termini di ritmo.':pressure>=20?'Può avere senso solo se sostituisce, non se si somma.':'Può essere esplorata senza snaturare troppo il viaggio.';
    return '<article class="addition"><small>SE VOLESSIMO CAMBIARE QUALCOSA</small><h3>'+esc(x.name)+'</h3><p>'+esc(judgement)+'</p><div class="mini-metrics"><span>Affinità <b>'+pct(x.affinity)+'</b></span><span>Fattibilità <b>'+pct(x.feasibility)+'</b></span><span>Valore aggiunto <b>'+pct(x.marginal&&x.marginal.score)+'</b></span></div>'+chips(dims,'Nessun tratto nuovo dominante')+'</article>';
  }).join('');
}
function scenarioCards(a,state){
  const sc=a&&a.scenarios||{},cards=[];
  if(sc.protectTime)cards.push({ey:'SE VOLESSIMO PIÙ RESPIRO',title:'Proteggere il tempo',body:'Alleggerendo la rotta, la priorità sarebbe restare più a lungo nei luoghi che tengono meglio insieme il vostro viaggio.',foot:'Ipotesi: '+routeNames(sc.protectTime.route).join(' → ')});
  if(sc.protectIdentity)cards.push({ey:'SE VOLESSIMO ESSERE PIÙ FEDELI A VOI',title:'Proteggere il carattere del viaggio',body:'Questa lettura privilegia le tappe che coprono meglio i tratti più forti del vostro Travel DNA.',foot:'Ipotesi: '+routeNames(sc.protectIdentity.route).join(' → ')});
  if(sc.protectExperiences){
    const added=sc.protectExperiences.added;
    if(!added||inScopeDestination(DATA.destinationById[added],state)){
      cards.push({ey:'SE VOLESSIMO PROTEGGERE LE ESPERIENZE',title:'Dare priorità ai momenti irrinunciabili',body:sc.protectExperiences.action==='review'?'Prima di aggiungere un altro luogo, riorganizzerei la rotta attuale intorno ai vostri must.':'L’idea è costruire la geografia intorno alle esperienze che avete indicato come davvero importanti.',foot:'Ipotesi: '+routeNames(sc.protectExperiences.route||[]).join(' → ')});
    }
  }
  const value=scopedProtectValue(a,state);
  if(value.length)cards.push({ey:'SE VOLESSIMO PROTEGGERE IL VALORE',title:'Spendere meglio, non semplicemente meno',body:'Qui guardiamo ai luoghi che tengono insieme affinità, fattibilità e semplicità operativa.',foot:value.slice(0,6).map(x=>x.name).join(' · ')});
  return cards.map(c=>'<article class="scenario"><small>'+c.ey+'</small><h3>'+c.title+'</h3><p>'+c.body+'</p><footer>'+c.foot+'</footer></article>').join('');
}
function constraintBlock(a){
  const c=a.constraints||{},all=[...(c.hard||[]).map(x=>({kind:'hard',label:'DA RISOLVERE',...x})),...(c.soft||[]).map(x=>({kind:'soft',label:'DA VALUTARE',...x})),...(c.info||[]).map(x=>({kind:'info',label:'NOTA',...x}))];
  if(!all.length)return '<p class="muted">Non emergono ostacoli particolari in questa prima lettura.</p>';
  return '<div class="constraint-list">'+all.map(x=>'<article class="'+x.kind+'"><small>'+x.label+'</small><p>'+esc(x.message||x.id)+'</p></article>').join('')+'</div>';
}
function firstReadCards(engine){
  const rules=engine&&engine.narrative&&engine.narrative.firstRead||[];
  if(!rules.length)return '<p class="muted">Le vostre scelte sono abbastanza coerenti da non richiedere particolari avvertenze.</p>';
  const label={confidence:'DA CHIARIRE',protect:'DA PROTEGGERE',tension:'DA BILANCIARE',route:'SULLA ROTTA',budget:'SUL BUDGET',season:'SUL PERIODO'};
  const rewrite=r=>{
    if(r.id==='high_contradiction')return{title:'Due desideri stanno tirando in direzioni diverse.',copy:'Non è un problema: significa che il viaggio dovrà trovare un equilibrio invece di scegliere automaticamente un solo lato.',action:'Capire insieme quale desiderio deve prevalere quando i due entrano in conflitto.'};
    if(r.id==='food_structural')return{title:'La gastronomia fa parte del viaggio, non degli extra.',copy:'È abbastanza importante da influenzare quartieri, orari, mercati, prenotazioni e alcuni dei momenti più memorabili.',action:'Usarla come criterio di progetto, non come riempitivo.'};
    if(r.id==='too_many_musts')return{title:'Ci sono molte cose a cui non volete rinunciare.',copy:'Quando gli irrinunciabili diventano tanti, il rischio è comprimere il viaggio per farli entrare tutti.',action:'Dare una priorità vera agli irrinunciabili.'};
    if(r.id==='route_redundancy')return{title:'Alcune tappe potrebbero raccontare cose simili.',copy:'Prima di eliminarle, darei a ciascuna un ruolo più preciso: una città può restare se cambia davvero ritmo, atmosfera o tipo di esperienza.',action:'Verificare cosa rende unica ogni tappa.'};
    if(r.id==='wellness_rejected')return{title:'Il bisogno di respiro non significa per forza spa.',copy:'Si può rallentare con quartieri, natura, tempo libero, mare o una struttura giusta senza trasformare il relax in un trattamento.',action:'Separare il bisogno di tempo lento dal benessere “da spa”.'};
    if(r.id==='stable_ranking')return{title:'I luoghi che emergono con più forza restano abbastanza stabili.',copy:'Anche cambiando leggermente alcune risposte, il nucleo delle destinazioni più coerenti non cambia molto.',action:'Possiamo usarle come base affidabile della conversazione.'};
    return{title:r.title||r.id,copy:String(r.copy||'').replace(/confidence/gi,'chiarezza').replace(/must/gi,'irrinunciabile'),action:String(r.action||'').replace(/match/gi,'proposta').replace(/must/gi,'irrinunciabili')};
  };
  return rules.slice(0,6).map(r=>{const h=rewrite(r);return '<article class="read-card"><small>'+esc(label[r.category]||'PRIMA LETTURA')+'</small><h3>'+esc(h.title)+'</h3><p>'+esc(h.copy)+'</p>'+(h.action?'<footer>'+esc(h.action)+'</footer>':'')+'</article>'}).join('');
}
function questions(engine){
  const q=engine&&engine.narrative&&engine.narrative.questions||[];
  return q.length?'<ol class="questions">'+q.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol>':'<p class="muted">Nessuna domanda prioritaria emersa.</p>';
}
function routeSummary(state,a,sel){
  const roleMap=Object.fromEntries((a.routeRoles||[]).map(r=>[r.id,r]));
  return sel.map((d,i)=>{
    const rr=roleMap[d.id],nights=state.nights&&state.nights[d.id]!=null?state.nights[d.id]:d.ideal;
    return '<article><em>'+String(i+1).padStart(2,'0')+'</em><div><small>'+esc(ROLE_LABELS[rr&&rr.role]||'TAPPA DI SUPPORTO')+'</small><b>'+esc(d.name)+'</b><small>'+esc(d.region||d.country)+' · '+nights+' notti</small><p>'+esc((d.keywords||[]).slice(0,5).map(keywordLabel).join(' · '))+'</p></div></article>';
  }).join('');
}
function buildHtml(state,engine){
  const a=engine&&engine.analysis?engine.analysis:null,n=engine&&engine.narrative?engine.narrative:null;
  const sel=selectedDestinations(state),xp=experienceLists(state);
  const status=a?humanStatus(a.decisionStatus):'Da leggere insieme';
  const info=a&&a.informationQuality?a.informationQuality:{score:0,label:'—'};
  const stability=a&&a.rankingSensitivity?a.rankingSensitivity.stability:0;
  const verdict=editorialVerdict(a,state);
  const profile=profileTitle(a);
  const scopeLabel=[...new Set(sel.map(d=>d.region||d.country).filter(Boolean))].join(' · ')||'Perimetro da definire';
  const destChunks=[];for(let i=0;i<sel.length;i+=4)destChunks.push(sel.slice(i,i+4));
  const destPages=destChunks.map((chunk,i)=>'<section class="page"><div class="page-inner">'+sectionTitle('07'+(destChunks.length>1?'.'+(i+1):''),'DESTINATION DNA · LE VOSTRE TAPPE','Il carattere dei luoghi che avete scelto.','Ogni tappa ha un’identità propria. Qui guardiamo cosa porta al viaggio e perché vale la pena darle spazio.')+'<div class="destination-grid">'+chunk.map(d=>destinationDNACard(d,a,state)).join('')+'</div></div></section>').join('');
  const css=[
    '*{box-sizing:border-box}',
    'html{-webkit-print-color-adjust:exact;print-color-adjust:exact}',
    'body{margin:0;background:#f5efe5;color:#2b0d16;font-family:Arial,Helvetica,sans-serif}',
    'main{max-width:1040px;margin:0 auto;padding:24px}',
    '.page{background:#fff;border:1px solid #e5dcd3;border-radius:22px;margin:20px 0;overflow:hidden}',
    '.page-inner{padding:38px}',
    '.cover{min-height:720px;display:grid;grid-template-columns:1.2fr .8fr;gap:44px;align-items:center}',
    '.ey{font-size:10px;letter-spacing:.2em;color:#9a7440;font-weight:700}',
    'h1,h2,h3{font-family:Georgia,"Times New Roman",serif;font-weight:500}',
    'h1{font-size:56px;line-height:1.02;margin:14px 0 18px}',
    'h2{font-size:34px;line-height:1.08;margin:8px 0 12px}',
    'h3{font-size:19px;margin:7px 0}',
    'h4{font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:#9a7440;margin:16px 0 7px}',
    'p{line-height:1.62}',
    '.muted,.section-head p{color:#746a6e}',
    '.section-head{margin-bottom:24px}.section-head p{max-width:790px;margin:0}',
    '.orb{aspect-ratio:1;border:1px solid #d8cec4;border-radius:50%;display:grid;place-items:center;text-align:center;padding:28px}',
    '.orb b{font:26px Georgia,serif}.orb .score{font:58px Georgia,serif;color:#b8894d;display:block;margin:8px 0}.orb p{font-size:10px;color:#746a6e}',
    '.pills,.chips{display:flex;flex-wrap:wrap;gap:6px}.pills span,.chips span{border:1px solid #ddd1c6;border-radius:999px;padding:7px 10px;font-size:9px}',
    '.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:18px 0}',
    '.metric{border-top:1px solid #e2d8cf;padding:11px 2px}.metric small,.metric span{display:block;color:#85797d;font-size:8px;letter-spacing:.08em}.metric strong{display:block;font:23px Georgia,serif;margin:5px 0;color:#2b0d16}',
    '.verdict{margin:20px 0;padding:20px 22px;border-left:3px solid #b8894d;background:#fbf7f0;border-radius:0 14px 14px 0}.verdict h3{font-size:25px;margin-top:0}.verdict p{margin:7px 0;color:#5f5559}.verdict strong{color:#2b0d16}',
    '.soft-note{padding:18px 20px;background:#fbf8f3;border-radius:15px;border:1px solid #e7ddd3}.soft-note h3{margin-top:0}.soft-note p{color:#6d6266;margin-bottom:0}',
    '.human-copy{font-size:10px;color:#6a6064;margin:6px 0 10px}',
    '.two-col{display:grid;grid-template-columns:1fr 1fr;gap:26px}.two-col h3{margin-top:0}',
    '.dna-row{margin:8px 0}.dna-row-head{display:flex;justify-content:space-between;gap:8px;font-size:10px}.dna-row>i{display:block;height:4px;background:#eee8e1;border-radius:9px;overflow:hidden;margin:4px 0}.dna-row>i>b{display:block;height:100%;background:#2b0d16}.dna-row small{display:block;color:#8a7f82;font-size:8px}.dna-row.tension>i>b{background:#9a7440}',
    '.dna-groups{display:grid;grid-template-columns:1fr 1fr;gap:14px}.dna-group{border-top:1px solid #e4dbd2;padding:13px 0}.dna-group h3{font:700 9px Arial,sans-serif;letter-spacing:.14em;color:#9a7440;margin:0 0 8px}',
    '.signal-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}.signal-card{padding:13px;border:1px solid #e8dfd6;border-radius:15px;background:#fbf8f3}.signal-card small{color:#9a7440;font-size:8px;letter-spacing:.08em}.signal-card h3{font-size:17px}.signal-card .big-number{font:32px Georgia,serif}.signal-card p{font-size:9px;color:#786d71;margin:3px 0}',
    '.route-sketch svg{width:100%;height:auto;display:block;overflow:visible}.node-label{font:11px Arial,sans-serif;fill:#746a6e}.node-index{font:700 7px Arial,sans-serif;fill:#fff}.sketch-note{margin-bottom:3px;color:#9a7440;font-size:9px;letter-spacing:.1em;text-transform:uppercase}.sketch-legend{display:flex;gap:12px;flex-wrap:wrap;font-size:8px;color:#7a7074}.sketch-legend span{display:flex;align-items:center;gap:5px}.sketch-legend i{width:9px;height:9px;border-radius:50%;background:#2b0d16;display:inline-block}.sketch-legend i.start{background:#b8894d;box-shadow:0 0 0 2px #fff,0 0 0 3px #b8894d}.sketch-legend i.accent{background:#fff;border:2px solid #b8894d}',
    '.route-list{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:14px}.route-list article{display:flex;gap:12px;padding:11px;border-top:1px solid #eee}.route-list em{font:19px Georgia,serif;color:#b8894d}.route-list small,.route-list p{display:block;color:#746a6e;font-size:9px;margin:3px 0}.route-list b{display:block;font:16px Georgia,serif}',
    '.experience-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.experience-box{border:1px solid #e9e0d7;border-radius:14px;padding:14px}.experience-box h3{font-size:16px}.experience-box.must{background:#faf4ea}.experience-box.reject{background:#fafafa;color:#746a6e}',
    '.match-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.match-card{display:grid;grid-template-columns:36px 1fr;gap:10px;border-top:1px solid #ded3c9;padding:14px 0}.match-card .rank{font:22px Georgia,serif;color:#b8894d}.match-card small,.dest-dna small,.surprise small,.scenario small,.role-card small,.addition small,.read-card small{font-size:8px;letter-spacing:.1em;color:#9a7440}.scoreline{display:flex;justify-content:space-between;gap:8px;align-items:center}.scoreline b{font:18px Georgia,serif}.scoreline span{font-size:8px;color:#7a7074}',
    '.mini-metrics{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}.mini-metrics span{font-size:8px;border:1px solid #e2d8cf;border-radius:999px;padding:5px 7px}.mini-metrics b{font-size:9px}',
    '.driver-list{list-style:none;padding:0;margin:8px 0}.driver-list li{display:flex;justify-content:space-between;gap:10px;border-top:1px solid #f0eae4;padding:5px 0;font-size:8px}.driver-list li span{color:#7d7376;text-align:right}',
    '.surprise-grid{display:grid;grid-template-columns:1.15fr .85fr .85fr;gap:10px}.surprise{border:1px solid #dbcdbf;border-radius:17px;padding:16px}.hero-surprise{background:#2b0d16;color:#fff;border-color:#2b0d16}.hero-surprise small{color:#d8ae70}.hero-surprise .mini-metrics span,.hero-surprise .chips span{border-color:rgba(255,255,255,.25)}.surprise-copy{font:20px Georgia,serif}',
    '.destination-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.dest-dna{border-top:1px solid #dfd5cb;padding:14px 0;break-inside:avoid}.dest-dna header{display:flex;justify-content:space-between;gap:10px}.dest-dna .affinity{font:32px Georgia,serif;color:#b8894d;text-align:right}.dest-dna .affinity small{display:block}.signature-bars .dna-row{margin:5px 0}.role-why{font-size:9px;color:#746a6e;border-top:1px solid #eee5dc;padding-top:7px}',
    '.optimizer,.night-box{border:1px solid #dfd3c7;border-radius:16px;padding:15px;margin:12px 0;background:#fbf8f3}.optimizer small,.night-box small{font-size:8px;letter-spacing:.11em;color:#9a7440}.route-string{font:16px Georgia,serif;line-height:1.45}.route-arrow{text-align:center;color:#b8894d;font-size:20px}.route-string.recommended{color:#9a7440}.optimizer p{font-size:9px;color:#766b70}.night-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.night-grid span{font-size:9px;border:1px solid #e4dbd2;border-radius:10px;padding:8px}.night-grid b,.night-grid small{display:block}.warning{color:#8f4e3e}',
    '.role-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.role-card{border-top:1px solid #e7ded5;padding:12px 0}.role-card p{font-size:9px;color:#746a6e}',
    'table{width:100%;border-collapse:collapse;font-size:9px}th{text-align:left;color:#9a7440;letter-spacing:.08em;font-size:8px;padding:8px;border-bottom:1px solid #d9cec4}td{padding:8px;border-bottom:1px solid #eee7df}',
    '.addition-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:16px}.addition{border:1px solid #e6ddd4;border-radius:14px;padding:12px}.addition p{font-size:9px;color:#766c70}',
    '.scenario-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.scenario{border:1px solid #e3d8ce;border-radius:16px;padding:15px}.scenario p{font-size:10px;color:#5e5358}.scenario footer{font-size:8px;color:#8b7d81;border-top:1px solid #eee5dd;padding-top:8px}',
    '.constraint-list{display:grid;grid-template-columns:1fr 1fr;gap:7px}.constraint-list article{border-radius:12px;padding:10px;border:1px solid #e8dfd6}.constraint-list small{font-size:8px;letter-spacing:.12em}.constraint-list p{font-size:9px;margin:4px 0}.constraint-list .hard{border-color:#b66b58}.constraint-list .soft{border-color:#c6a16d}.constraint-list .info{border-color:#d9d2cb}',
    '.read-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.read-card{border-top:1px solid #e6ddd4;padding:13px 0}.read-card p{font-size:9px;color:#6f6468}.read-card footer{font-size:8px;color:#9a7440}',
    '.questions{padding-left:20px}.questions li{margin:10px 0;line-height:1.5}',
    '.technical{font-size:8px;color:#877d80;border-top:1px solid #e8e0d8;padding-top:10px;margin-top:18px}',
    '.actions{position:sticky;bottom:10px;display:flex;justify-content:center;gap:8px;z-index:10}.actions button{padding:13px 18px;border-radius:10px;border:0;background:#2b0d16;color:#fff;font-weight:bold}.actions .alt{background:#fff;color:#2b0d16;border:1px solid #d8cec4}',
    '@media(max-width:720px){main{padding:10px}.cover,.two-col,.dna-groups,.match-grid,.destination-grid,.scenario-grid{grid-template-columns:1fr}.metrics,.signal-grid{grid-template-columns:1fr 1fr}.surprise-grid,.role-grid,.addition-grid,.night-grid{grid-template-columns:1fr}.route-list{grid-template-columns:1fr}h1{font-size:42px}.page-inner{padding:22px}}',
    '@media print{@page{size:A4 portrait;margin:10mm}body{background:#fff}main{max-width:none;padding:0}.page{border:0;border-radius:0;margin:0;break-after:page;page-break-after:always;overflow:visible}.page:last-of-type{break-after:auto;page-break-after:auto}.page-inner{padding:0}.cover{min-height:255mm}.actions{display:none}.dest-dna,.match-card,.scenario,.role-card,.read-card,.addition{break-inside:avoid;page-break-inside:avoid}}'
  ].join('');
  const inputExperienceBoxes=[
    '<div class="experience-box must"><small>DA PROTEGGERE</small><h3>Irrinunciabili</h3>'+chips(xp.must,'Nessun punto davvero irrinunciabile')+'</div>',
    '<div class="experience-box"><small>DA CAPIRE MEGLIO</small><h3>Ci incuriosisce</h3>'+chips(xp.want,'Nessuna esperienza intermedia')+'</div>',
    '<div class="experience-box reject"><small>NON FA PER VOI</small><h3>Possiamo lasciarlo fuori</h3>'+chips(xp.reject,'Nessun rifiuto esplicito')+'</div>'
  ].join('');
  const coverMetrics=a?[
    metric('CHIAREZZA DELLE PREFERENZE',pct(a.analysisConfidence),'/100'),
    metric('QUALITÀ DELLE RISPOSTE',pct(info.score),'/100'),
    metric('STABILITÀ DELLA LETTURA',pct(stability),'/100'),
    metric('STATO DEL CONCEPT',status,'')
  ].join(''):'';
  const verdictHtml='<div class="verdict"><div class="ey">VERDETTO YUME</div><h3>'+esc(verdict.title)+'</h3><p>'+esc(verdict.text)+'</p><p><strong>Cosa proteggerei:</strong> '+esc(verdict.protect)+'</p></div>';
  return '<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(state.journeyId||'YUME')+' · YUME Journey Book</title><style>'+css+'</style></head><body><main>'+
    '<section class="page"><div class="page-inner cover"><div><div class="ey">YUME HONEYMOON · JOURNEY BOOK</div><h1>Il vostro viaggio comincia a prendere forma.</h1><h3>'+esc(profile)+'</h3><p class="muted">'+esc(verdict.text)+'</p><div class="pills"><span>'+esc(state.duration)+' giorni</span><span>'+esc(state.period||'Periodo da definire')+'</span><span>'+esc(scopeLabel)+'</span><span>Budget '+esc(state.budget||'da definire')+'</span></div><div class="metrics">'+coverMetrics+'</div></div><div class="orb"><div><div class="ey">IL VOSTRO JOURNEY</div><b>'+esc(state.journeyId||'—')+'</b>'+(a?'<span class="score">'+pct(a.route&&a.route.score)+'</span><p>Coerenza della composizione<br>'+esc(clarityLabel(a))+'</p>':'<p>Prima lettura in costruzione</p>')+'</div></div></div></section>'+
    '<section class="page"><div class="page-inner">'+sectionTitle('01','LA VOSTRA GEOGRAFIA','Non una lista. Una sequenza da far funzionare.','Avete scelto questi luoghi; ora conta capire se insieme hanno il ritmo giusto e se ciascuno porta qualcosa di diverso al viaggio.')+'<div class="route-sketch">'+routeSketchSvg(sel,a&&a.routeRoles)+'</div><div class="route-list">'+routeSummary(state,a||{routeRoles:[]},sel)+'</div>'+(a?optimiserBlock(a):'')+'</div></section>'+
    '<section class="page"><div class="page-inner">'+sectionTitle('02','QUELLO CHE CI AVETE RACCONTATO','Desideri, priorità e cose che non volete sacrificare.','Le vostre risposte non sono un test da superare: ci servono per capire quale viaggio vale la pena costruire per voi.')+renderDeclared(state)+'<div class="experience-grid" style="margin-top:18px">'+inputExperienceBoxes+'</div></div></section>'+
    '<section class="page"><div class="page-inner">'+sectionTitle('03','TRAVEL DNA','Il vostro modo di viaggiare, oltre le singole risposte.','Le venti dimensioni mettono insieme ritmo, interessi, libertà, comfort e modo di entrare nei luoghi. Non sono voti: servono a capire cosa deve esserci davvero nel vostro viaggio.')+(a?'<div class="metrics">'+metric('LETTURA',clarityLabel(a),'')+metric('QUALITÀ RISPOSTE',pct(info.score),'/100')+metric('STABILITÀ',pct(stability),'/100')+metric('DIMENSIONI',DATA.dimensions.length,'Travel DNA')+'</div><div class="dna-groups">'+renderTravellerDNA(a)+'</div>':'<p class="muted">La lettura non è ancora disponibile.</p>')+'</div></section>'+
    '<section class="page"><div class="page-inner">'+sectionTitle('04','LA NOSTRA PRIMA LETTURA','Quello che emerge quando mettiamo insieme tutte le vostre scelte.','Qui non aggiungiamo desideri nuovi: cerchiamo i fili che tornano più spesso e le tensioni che vale la pena chiarire prima di progettare.')+verdictHtml+'<div class="signal-grid">'+(a?signalCards(a):'')+'</div><div style="margin-top:20px"><h3>Cosa terrei d’occhio</h3><div class="read-grid">'+firstReadCards(engine)+'</div></div></div></section>'+
    '<section class="page"><div class="page-inner">'+sectionTitle('05','I LUOGHI CHE VI ASSOMIGLIANO','Restando dentro il viaggio che avete scelto.','Le proposte qui sotto rimangono nel vostro perimetro geografico. Non sono una classifica: sono luoghi che meritano attenzione perché incontrano più parti del vostro Travel DNA.')+'<div class="match-grid">'+(a?matchCards(a,state):'')+'</div></div></section>'+
    '<section class="page"><div class="page-inner">'+sectionTitle('06','UNA POSSIBILITÀ INASPETTATA','Solo se aggiunge qualcosa che oggi manca.','Una nuova destinazione ha senso soltanto quando completa il viaggio senza snaturarlo e senza portarvi fuori dal perimetro scelto.')+'<div class="surprise-grid">'+(a?surpriseCards(a,state):'')+'</div></div></section>'+
    destPages+
    '<section class="page"><div class="page-inner">'+sectionTitle('08','COME RESPIRA IL VIAGGIO','La rotta regge? Dove stringe? Dove c’è spazio?','Qui leggiamo la composizione nel suo insieme: tempo, sovrapposizioni, ordine delle tappe, notti e sostenibilità rispetto al budget dichiarato.')+(a?'<div class="metrics">'+routeMetrics(a)+'</div>'+optimiserBlock(a)+nightBlock(a)+'<h3>Il ruolo delle tappe</h3><div class="role-grid">'+roleCards(a)+'</div>':'')+'</div></section>'+
    '<section class="page"><div class="page-inner">'+sectionTitle('09','SE CAMBIASSIMO QUALCOSA?','Togliere prima di aggiungere.','Prima di proporre una nuova tappa, guardiamo cosa succede se ne alleggeriamo una. È il modo più utile per capire quali luoghi sono davvero strutturali e quali possono essere ripensati.')+(a?'<h3>Se togliessimo una tappa</h3><table><thead><tr><th>Tappa</th><th>Peso</th><th>Δ viaggio</th><th>Δ desideri</th><th>Δ respiro</th><th>Δ distanza</th></tr></thead><tbody>'+removalRows(a)+'</tbody></table><h3 style="margin-top:18px">Se volessimo introdurre qualcosa di diverso</h3><div class="addition-grid">'+additionCards(a,state)+'</div>':'')+'</div></section>'+
    '<section class="page"><div class="page-inner">'+sectionTitle('10','QUATTRO MODI DI PROTEGGERE CIÒ CHE CONTA','La stessa coppia può avere più di un viaggio coerente.','Queste non sono quattro risposte giuste o sbagliate. Sono modi diversi di scegliere cosa non sacrificare quando tempo, budget e desideri iniziano a competere.')+'<div class="scenario-grid">'+(a?scenarioCards(a,state):'')+'</div></div></section>'+
    '<section class="page"><div class="page-inner">'+sectionTitle('11','IL VERDETTO YUME',verdict.title,'Questa è la parte in cui trasformiamo i numeri in una prima posizione progettuale: cosa terrei, cosa rivedrei e cosa chiederei prima di andare avanti.')+verdictHtml+(a?'<h3>Punti da verificare</h3>'+constraintBlock(a):'')+'<h3 style="margin-top:22px">Le domande che porterei alla prossima conversazione</h3>'+questions(engine)+'<div class="technical">I punteggi presenti nel documento sono indici interni YUME: aiutano a confrontare coerenza e alternative, ma non sono prezzi, probabilità scientifiche o garanzie operative.</div></div></section>'+
    '<section class="page"><div class="page-inner">'+sectionTitle('12','DA QUI ENTRA IL TRAVEL DESIGNER','Non ripartiamo da zero. Partiamo da voi.','Il Journey Book non è un itinerario definitivo e non deve esserlo. È il punto da cui il Travel Designer può validare stagionalità, collegamenti, disponibilità, strutture e costi reali mantenendo intatto ciò che avete già raccontato di voi.')+'<div class="two-col"><div><h3>Quello che proteggerei</h3>'+chips(xp.must,'Da definire insieme')+'</div><div><h3>Quello che possiamo lasciare fuori</h3>'+chips(xp.reject,'Nessun rifiuto esplicito')+'</div></div><h3 style="margin-top:24px">Da dove inizierei</h3><p>'+esc(verdict.protect)+'</p><h3 style="margin-top:20px">La prima domanda</h3>'+questions(engine)+'</div></section>'+
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
    button.dataset.intelligenceBook='0953';
  }
}
global.YumeJourneyIntelligenceBook=Object.freeze({version:VERSION,buildHtml,open,install});
document.addEventListener('DOMContentLoaded',install);
})(window);
