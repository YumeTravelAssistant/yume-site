/* ============================================================
YUME JOURNEY INTELLIGENCE ENGINE · MEGA TEST CANDIDATE
Version 0.85.0
============================================================ */
(function(global){
'use strict';
const DATA=global.YumeIntelligenceData;
const DEST=global.YumeDestinationIntelligence;
if(!DATA||!DEST) throw new Error('YUME data layers missing');

const VERSION='0.85.0';
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const round=Math.round;
const avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0;
const arr=v=>Array.isArray(v)?v:[];
const clone=o=>JSON.parse(JSON.stringify(o));
const productWeight=(p,d)=>DATA.productProfiles[p]?.[d]||1;

/* ---------- Evidence Engine ---------- */
function createAccumulator(){
 return Object.fromEntries(DATA.dimensions.map(d=>[d,{signed:0,total:0,pos:0,neg:0,evidence:[],families:new Set()}]));
}
function addEvidence(acc,d,signal,weight,source,metadata={}){
 const x=acc[d]; if(!x)return;
 signal=clamp(Number(signal),-1,1);weight=Math.max(0,Number(weight)||0);
 const mag=Math.abs(signal)*weight;
 x.signed+=signal*weight;x.total+=weight;
 if(signal>0)x.pos+=mag;if(signal<0)x.neg+=mag;
 x.families.add(String(source).split(':')[0]);x.evidence.push({source,signal,weight,metadata});
}
function finaliseDNA(acc){
 const dna={};
 for(const d of DATA.dimensions){
   const x=acc[d];
   if(!x.total){dna[d]={value:50,confidence:.05,contradiction:0,uncertainty:28,evidence:[]};continue}
   const signal=x.signed/x.total;
   const directional=x.pos+x.neg;
   const contradiction=directional?2*Math.min(x.pos,x.neg)/directional:0;
   const volume=1-Math.exp(-x.total/3.2);
   const diversity=Math.min(1,x.families.size/4);
   const confidence=clamp(.05+volume*.69+diversity*.18-contradiction*.34,.05,.98);
   dna[d]={
     value:round(clamp(50+signal*50)),
     confidence:+confidence.toFixed(3),
     contradiction:+contradiction.toFixed(3),
     uncertainty:round(clamp((1-confidence)*28+contradiction*15,2,38)),
     evidence:x.evidence
   };
 }
 return dna;
}
const norm=v=>clamp((Number(v??50)-50)/50,-1,1);
function applyBehaviour(a,b={}){
 addEvidence(a,'slow',norm(b.pace),2,'behaviour:pace');
 addEvidence(a,'adventure',-norm(b.pace)*.22,.65,'behaviour:pace');
 addEvidence(a,'discovery',norm(b.novelty),2.2,'behaviour:novelty');
 addEvidence(a,'iconic',-norm(b.novelty),1.7,'behaviour:novelty');
 addEvidence(a,'autonomy',norm(b.freedom),2.1,'behaviour:freedom');
 addEvidence(a,'comfort',norm(b.comfort),2.2,'behaviour:comfort');
 if(norm(b.comfort)>0)addEvidence(a,'design',norm(b.comfort)*.25,.7,'behaviour:comfort');
 addEvidence(a,'depth',norm(b.depth),2.2,'behaviour:depth');
 addEvidence(a,'local',norm(b.depth)*.45,1,'behaviour:depth');
 addEvidence(a,'slow',norm(b.depth)*.30,.8,'behaviour:depth');
}
function applySparks(a,sparks=[]){
 for(const id of arr(sparks)){const p=DATA.sparkProfiles[id];if(!p)continue;for(const [d,s] of Object.entries(p))addEvidence(a,d,s,1.55,'spark:'+id)}
}
function applyAllocation(a,allocation={}){
 const vals=Object.values(allocation).map(Number).filter(Number.isFinite),base=vals.length?avg(vals):20;
 for(const [id,v] of Object.entries(allocation)){
   const p=DATA.allocationProfiles[id];if(!p)continue;
   const signal=clamp((Number(v)-base)/28,-1,1);
   for(const [d,s] of Object.entries(p))addEvidence(a,d,signal*s,1.3,'allocation:'+id);
 }
}
function applyExperiences(a,experiences={}){
 for(const [id,level] of Object.entries(experiences)){
   const e=DATA.experienceProfiles[id];if(!e)continue;
   let dir=0,w=0;
   if(level==='must'){dir=1;w=3.1}else if(level==='want'||level==='curious'){dir=.48;w=1.2}else if(level==='reject'){dir=-1;w=2.8}else continue;
   for(const [d,s] of Object.entries(e.dna))addEvidence(a,d,dir*s,w,`experience:${id}:${level}`);
 }
}
function applyDuels(a,d={}){
 const add=(x,s,w,src)=>addEvidence(a,x,s,w,src);
 if(d.stay==='a'){add('heritage',.65,1.3,'duel:stay');add('slow',.55,1.3,'duel:stay');add('privacy',.35,1,'duel:stay')}
 if(d.stay==='b'){add('urban',.55,1.3,'duel:stay');add('comfort',.55,1.3,'duel:stay');add('design',.45,1.1,'duel:stay')}
 if(d.food==='a'){add('food',.75,1.4,'duel:food');add('privacy',.4,1,'duel:food')}
 if(d.food==='b'){add('food',.6,1.3,'duel:food');add('local',.85,1.5,'duel:food');add('autonomy',.55,1.2,'duel:food')}
 if(d.bases==='a'){add('depth',.95,1.6,'duel:bases');add('slow',.55,1.2,'duel:bases')}
 if(d.bases==='b'){add('discovery',.7,1.4,'duel:bases');add('depth',-.7,1.6,'duel:bases')}
 if(d.sea==='a'){add('slow',.8,1.4,'duel:sea');add('privacy',.75,1.4,'duel:sea');add('comfort',.3,.8,'duel:sea');add('sea',.65,1.2,'duel:sea')}
 if(d.sea==='b'){add('adventure',.7,1.4,'duel:sea');add('autonomy',.55,1.2,'duel:sea');add('discovery',.4,1,'duel:sea');add('sea',.55,1.0,'duel:sea')}
}
function buildTravellerDNA(input){
 const a=createAccumulator();applyBehaviour(a,input.behaviouralDNA||{});applySparks(a,input.sparks||[]);
 applyAllocation(a,input.allocation||{});applyExperiences(a,input.experiences||{});applyDuels(a,input.duels||{});
 return finaliseDNA(a);
}
function strongestSignals(dna,limit=8){
 return Object.entries(dna).map(([dimension,x])=>({
   dimension,label:DATA.dimensionMeta[dimension]?.label||dimension,value:x.value,confidence:x.confidence,
   contradiction:x.contradiction,strength:Math.abs(x.value-50)*x.confidence
 })).sort((a,b)=>b.strength-a.strength).slice(0,limit);
}
function informationQuality(input,dna){
 let score=16;
 score+=Math.min(16,arr(input.sparks).length*4);
 score+=Math.min(18,Object.values(input.experiences||{}).filter(Boolean).length*3);
 score+=Math.min(16,Object.values(input.duels||{}).filter(Boolean).length*4);
 if(input.context?.duration)score+=7;
 if(input.context?.period&&input.context.period!=='Da definire')score+=7;
 if(input.context?.budget)score+=6;
 score+=Math.min(12,arr(input.destinations).length*3);
 const contradiction=avg(Object.values(dna).map(x=>x.contradiction));
 score-=contradiction*18;
 return{score:round(clamp(score)),label:score>=78?'HIGH':score>=55?'MEDIUM':'EXPLORATORY',averageContradiction:+contradiction.toFixed(3)};
}

/* ---------- Destination Affinity ---------- */
function desiredSupport(u,p){
 if(u.value>=50){
   const desired=(u.value-50)/50;
   const support=clamp((p-25)/75*100);
   const targetFit=clamp(100-Math.abs(u.value-p)*1.0);
   return support*.62+targetFit*.38;
 }
 const avoidance=(50-u.value)/50;
 const exposureCompatibility=clamp((75-p)/75*100);
 const targetFit=clamp(100-Math.abs(u.value-p)*1.0);
 return exposureCompatibility*.70+targetFit*.30;
}
function semanticFit(travellerDNA,destination,product='honeymoon'){
 let n=0,w=0;const breakdown=[];
 for(const d of DATA.dimensions){
   const u=travellerDNA[d],distance=Math.abs(u.value-50)/50;
   if(distance<.16||u.confidence<.22)continue;
   const weight=Math.pow(distance,1.12)*u.confidence*(DATA.dimensionMeta[d]?.weight||1)*productWeight(product,d);
   const fit=desiredSupport(u,destination.dna[d]);
   n+=fit*weight;w+=weight;
   breakdown.push({dimension:d,label:DATA.dimensionMeta[d]?.label,fit:round(fit),traveller:u.value,destination:destination.dna[d],weight:+weight.toFixed(3)});
 }
 breakdown.sort((a,b)=>b.weight-a.weight);
 return{score:round(w?n/w:50),breakdown};
}
function experienceCompatibility(exp,d){
 let n=0,w=0;for(const [dim,s] of Object.entries(exp.dna)){n+=d.dna[dim]*s;w+=s}return w?n/w:50;
}
function explicitExperienceFit(input,destination){
 let n=0,w=0,penalty=0;const details=[];
 for(const [id,level] of Object.entries(input.experiences||{})){
   const exp=DATA.experienceProfiles[id];if(!exp)continue;
   const fit=experienceCompatibility(exp,destination);
   if(level==='must'){n+=fit*2.4;w+=2.4;details.push({id,level,fit:round(fit)})}
   else if(level==='want'||level==='curious'){n+=fit*.65;w+=.65;details.push({id,level,fit:round(fit)})}
   else if(level==='reject'){
     const exposure=fit;
     const p=Math.max(0,exposure-58)/42*12;
     penalty+=p;details.push({id,level,fit:round(fit),penalty:+p.toFixed(2)});
   }
 }
 return{score:w?round(clamp(n/w-penalty)):null,penalty:+penalty.toFixed(2),details};
}
function domainAnchorFit(input,d){
 const exp=input.experiences||{};let n=0,w=0;const add=(v,wt)=>{n+=clamp(v)*wt;w+=wt};
 if(exp.island==='must'||exp.sailing==='must')add(d.dna.sea*.55+d.dna.romance*.20+d.dna.slow*.15+d.dna.privacy*.10,2.6);
 if(exp.private==='must')add(d.dna.privacy*.44+d.dna.romance*.31+d.dna.comfort*.25,2.0);
 if(exp.sunset==='must')add(d.dna.romance*.48+d.dna.slow*.27+d.dna.sea*.25,1.6);
 if(exp.hike==='must'||exp.nature==='must')add(d.dna.nature*.48+d.dna.adventure*.42+d.dna.discovery*.10,2.2);
 if(exp.designhotel==='must'||exp.boutique==='must')add(d.dna.design*.52+d.dna.comfort*.27+d.dna.contemporary*.21,1.9);
 if(exp.streetfood==='must'||exp.market==='must')add(d.dna.food*.47+d.dna.local*.38+d.dna.autonomy*.15,1.9);
 if(exp.craft==='must')add(d.dna.craft*.55+d.dna.local*.27+d.dna.heritage*.18,1.8);
 if(exp.ryokan==='must')add(d.dna.slow*.31+d.dna.heritage*.31+d.dna.wellness*.20+d.dna.romance*.18,1.9);
 if(exp.spa==='must')add(d.dna.wellness*.57+d.dna.slow*.28+d.dna.comfort*.15,1.9);
 if(exp.night==='must')add(d.dna.nightlife*.60+d.dna.urban*.25+d.dna.contemporary*.15,1.8);
 if(exp.icon==='must'||exp.ceremony==='must')add(d.dna.iconic*.37+d.dna.heritage*.43+d.dna.depth*.20,1.9);
 return{score:w?round(n/w):null,weight:w};
}
function percentileCalibrate(rows,key){
 const sorted=[...rows].sort((a,b)=>a[key]-b[key]),n=sorted.length,p={};
 sorted.forEach((r,i)=>p[r.id]=n>1?i/(n-1):.5);
 return p;
}
function rankDestinations({input,travellerDNA,product='honeymoon'}){
 let rows=DATA.destinations.map(destination=>{
   const semantic=semanticFit(travellerDNA,destination,product);
   const experience=explicitExperienceFit(input,destination);
   const anchor=domainAnchorFit(input,destination);
   const knowledge=DEST.profileFor(destination.id);
   return{id:destination.id,destination,semantic,experience,anchor,knowledge};
 });
 const ps=percentileCalibrate(rows,'__none__'); // harmless placeholder
 // percentile on a composite absolute score
 for(const r of rows){
   const e=r.experience.score;
   const a=r.anchor.score;
   const weights={semantic:.58,experience:e===null?0:.24,anchor:a===null?0:.18};
   const total=weights.semantic+weights.experience+weights.anchor;
   r.absolute=(r.semantic.score*weights.semantic+(e??0)*weights.experience+(a??0)*weights.anchor)/total;
 }
 const percentile=percentileCalibrate(rows,'absolute');
 rows=rows.map(r=>{
   const relative=35+percentile[r.id]*62;
   const affinity=round(clamp(r.absolute*.72+relative*.28));
   const curation=r.knowledge?.curationConfidence??.68;
   const signalConfidence=avg(strongestSignals(travellerDNA,6).map(x=>x.confidence));
   const robustnessBase=(signalConfidence*.72+curation*.28)*100;
   const half=clamp((100-robustnessBase)*.11+3,3,12);
   return{...r,affinity,affinityAbsolute:round(r.absolute),affinityPercentile:round(percentile[r.id]*100),
     affinityRange:[round(clamp(affinity-half)),round(clamp(affinity+half))],
     robustnessBase:round(robustnessBase)};
 });
 return rows;
}

/* ---------- Feasibility ---------- */
function budgetCapacity(c={}){
 const map={'5–7k':35,'7–10k':50,'10–15k':68,'15–20k':83,'20k+':100};
 let v=c.budget?map[c.budget]??60:60;if(c.budgetMode==='hard')v-=5;if(c.budgetMode==='flexible')v+=8;if(c.flightsIncluded===false)v+=7;return clamp(v);
}
function normalizePeriod(p){
 p=String(p||'').toLowerCase();if(p.includes('marzo'))return'spring';if(p.includes('giugno'))return'summer';
 if(p.includes('settembre'))return'autumn';if(p.includes('dicembre'))return'winter';return'unknown';
}
function calculateFeasibility(d,c={}){
 const cap=budgetCapacity(c),gap=cap-d.cost,hasBudget=!!c.budget&&c.budget!=='Da capire insieme';
 let budget=72;if(hasBudget){budget=gap>=20?98:gap>=10?94:gap>=0?86:gap>=-8?74:gap>=-16?58:gap>=-25?40:24}
 const days=Number(c.duration||20),share=d.ideal/Math.max(days,1);
 const duration=share<=.12?96:share<=.18?91:share<=.24?82:share<=.30?68:share<=.38?51:34;
 let season=78,source='unknown';
 if(Number(c.month)>=1&&Number(c.month)<=12){season=DEST.profileFor(d.id)?.monthlySeasonality?.[Number(c.month)]??78;source='month'}
 else{const p=normalizePeriod(c.period);if(p!=='unknown'){season=d.season[p]??78;source=p}}
 const op=DEST.profileFor(d.id)?.operational;
 const logistics=round(clamp(100-(op?.arrivalFriction??d.friction)+d.hub*2));
 const score=round(budget*.29+duration*.16+season*.30+logistics*.25);
 return{score,budget:{score:budget,capacity:round(cap),cost:d.cost,gap:round(gap),label:!hasBudget?'UNKNOWN':gap>=10?'COMFORTABLE':gap>=-5?'BALANCED':gap>=-15?'PROTECT':'PRESSURE'},
   duration:{score:duration,days,ideal:d.ideal},season:{score:round(season),source},logistics:{score:logistics,friction:op?.arrivalFriction??d.friction,hub:d.hub}};
}
function classify(r){
 if(r.affinity>=86&&r.feasibility.score>=68&&r.robustness>=58)return r.selected?'STRUCTURAL MATCH':'NATURAL MATCH';
 if(r.affinity>=82&&r.feasibility.score<62)return'AFFINE · DA PROTEGGERE';
 if(r.affinity>=80)return'ALTA AFFINITÀ';
 if(r.affinity>=70)return'COERENTE';
 return'DA ESPLORARE';
}

/* ---------- Ranking sensitivity ---------- */
function baseRanking(input,travellerDNA,product){
 let rows=rankDestinations({input,travellerDNA,product});
 rows=rows.map(r=>{
   const feasibility=calculateFeasibility(r.destination,input.context||{});
   const selected=arr(input.destinations).some(x=>(typeof x==='string'?x:x.id)===r.id);
   const recommendation=round(r.affinity*.77+feasibility.score*.15+r.robustnessBase*.08);
   return{...r,feasibility,selected,recommendation,robustness:r.robustnessBase};
 }).sort((a,b)=>b.recommendation-a.recommendation);
 return rows;
}
function rankingSensitivity(input,product,baseline){
 const keys=['pace','novelty','freedom','comfort','depth'],variants=[];
 for(const key of keys)for(const delta of [-7,7]){
   const v=clone(input);v.behaviouralDNA=v.behaviouralDNA||{};v.behaviouralDNA[key]=clamp(Number(v.behaviouralDNA[key]??50)+delta);
   variants.push(baseRanking(v,buildTravellerDNA(v),product).slice(0,7).map(x=>x.id));
 }
 const base5=new Set(baseline.slice(0,5).map(x=>x.id));
 const j=variants.map(ids=>{const s=new Set(ids.slice(0,5));const inter=[...base5].filter(x=>s.has(x)).length;return inter/new Set([...base5,...s]).size});
 const appearances={};for(const r of baseline.slice(0,12))appearances[r.id]=0;
 for(const ids of variants)for(const id of Object.keys(appearances))if(ids.includes(id))appearances[id]++;
 return{stability:round(avg(j)*100),variants:variants.length,matchRobustness:Object.fromEntries(Object.entries(appearances).map(([id,n])=>[id,round(n/variants.length*100)]))};
}

/* ---------- Route ---------- */
function normalizeRoute(input){
 return arr(input.destinations).map(x=>{const id=typeof x==='string'?x:x.id,d=DATA.destinationById[id];if(!d)return null;
   return{...d,assignedNights:Number(typeof x==='object'?(x.nights??d.ideal):d.ideal)}}).filter(Boolean);
}
function geoDistance(a,b){
 const R=6371,p=Math.PI/180,dLat=(b.lat-a.lat)*p,dLng=(b.lng-a.lng)*p;
 const x=Math.sin(dLat/2)**2+Math.cos(a.lat*p)*Math.cos(b.lat*p)*Math.sin(dLng/2)**2;
 return 2*R*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
}
function destinationSimilarity(a,b,dna=null){
 let n=0,w=0;for(const d of DATA.dimensions){const wt=dna?Math.max(.08,Math.abs(dna[d].value-50)/50*dna[d].confidence):1;
 n+=(100-Math.abs(a.dna[d]-b.dna[d]))*wt;w+=wt}return w?n/w:50;
}
function hop(a,b){
 const km=geoDistance(a,b);let base=km>2500?90:km>1800?78:km>1200?64:km>600?47:km>300?30:km>100?17:7;
 const cross=a.country!==b.country?12:0;const score=clamp(base+cross+(a.friction+b.friction)/12-(a.hub+b.hub)*1.0);
 return{from:a.id,to:b.id,km:round(km),score:round(score),crossCountry:a.country!==b.country,type:km>1800?'long':km>600?'regional':'local'};
}
function routeHops(route){const h=[];for(let i=1;i<route.length;i++)h.push(hop(route[i-1],route[i]));return h}
function routeCoverage(route,dna){
 if(!route.length)return{score:0,dimensions:[],avoidancePenalty:0};
 let n=0,w=0,avoid=0,aw=0;const dimensions=[];
 for(const d of DATA.dimensions){
   const u=dna[d],strength=Math.abs(u.value-50)/50;if(strength<.18||u.confidence<.22)continue;
   const wt=strength*u.confidence*(DATA.dimensionMeta[d]?.weight||1);
   if(u.value>=50){
     const best=Math.max(...route.map(x=>desiredSupport(u,x.dna[d])));n+=best*wt;w+=wt;dimensions.push({dimension:d,label:DATA.dimensionMeta[d]?.label,fit:round(best),weight:+wt.toFixed(2)});
   }else{
     const worst=Math.max(...route.map(x=>x.dna[d]));avoid+=Math.max(0,worst-45)*wt;aw+=wt;
   }
 }
 const penalty=aw?clamp(avoid/aw*.35,0,20):0;return{score:round(clamp((w?n/w:70)-penalty)),dimensions:dimensions.sort((a,b)=>b.weight-a.weight),avoidancePenalty:round(penalty)};
}
function redundancy(route,dna){
 if(route.length<2)return{score:0,pairs:[]};const pairs=[];
 for(let i=0;i<route.length;i++)for(let j=i+1;j<route.length;j++)pairs.push({a:route[i].id,b:route[j].id,similarity:round(destinationSimilarity(route[i],route[j],dna))});
 const high=pairs.filter(x=>x.similarity>=76);return{score:round(avg((high.length?high:pairs).map(x=>x.similarity))),pairs:pairs.sort((a,b)=>b.similarity-a.similarity).slice(0,10)};
}
function nightFit(route){
 if(!route.length)return{score:100,underMinimum:[],underIdeal:[]};const scores=[],underMinimum=[],underIdeal=[];
 for(const d of route){const n=d.assignedNights;if(n<d.min){scores.push(25);underMinimum.push({id:d.id,name:d.name,nights:n,min:d.min})}else if(n<d.ideal){scores.push(70);underIdeal.push({id:d.id,name:d.name,nights:n,ideal:d.ideal})}else if(n<=d.ideal+2)scores.push(96);else scores.push(88)}
 return{score:round(avg(scores)),underMinimum,underIdeal};
}
function experiencePressure(input){
 const totals={reservation:0,budget:0,time:0,logistics:0};let w=0,mustCount=0;
 for(const [id,l] of Object.entries(input.experiences||{})){if(!['must','want','curious'].includes(l))continue;const e=DATA.experienceProfiles[id];if(!e)continue;
   const m=l==='must'?1:.5;if(l==='must')mustCount++;w+=m;for(const k of Object.keys(totals))totals[k]+=e.pressure[k]*m}
 if(!w)return{total:0,...totals,mustCount};
 for(const k of Object.keys(totals))totals[k]=round(totals[k]/w);
 return{...totals,total:round(avg(Object.values(totals))),mustCount};
}
function routeCost(route,input,hops){
 if(!route.length)return{score:100,index:0,capacity:round(budgetCapacity(input.context||{})),gap:0,label:'UNKNOWN'};
 const nights=Math.max(1,route.reduce((s,d)=>s+d.assignedNights,0));
 const weighted=route.reduce((s,d)=>s+d.cost*d.assignedNights,0)/nights;
 const index=clamp(weighted+avg(hops.map(x=>x.score))*.18),cap=budgetCapacity(input.context||{}),gap=cap-index;
 let score=72;if(input.context?.budget)score=gap>=15?96:gap>=5?90:gap>=-5?80:gap>=-15?62:gap>=-25?44:26;
 return{score:round(score),index:round(index),capacity:round(cap),gap:round(gap),label:!input.context?.budget?'UNKNOWN':gap>=10?'COMFORTABLE':gap>=-5?'BALANCED':gap>=-15?'PROTECT':'PRESSURE'};
}
function evaluateRoute({input,travellerDNA,ranking,overrideRoute}){
 const route=overrideRoute||normalizeRoute(input);
 if(!route.length)return{score:0,affinity:0,feasibility:0,coverage:0,coverageDetail:{score:0,dimensions:[],avoidancePenalty:0},redundancy:0,redundancyDetail:{score:0,pairs:[]},pressure:0,sequence:100,nightFit:100,budgetFit:100,budget:{score:100,index:0,capacity:round(budgetCapacity(input.context||{})),gap:0,label:'UNKNOWN'},distance:0,countryChanges:0,hops:[],experiencePressure:experiencePressure(input),underMinimum:[],underIdeal:[]};
 const map=Object.fromEntries(ranking.map(r=>[r.id,r])),hops=routeHops(route),cov=routeCoverage(route,travellerDNA),red=redundancy(route,travellerDNA),night=nightFit(route),exp=experiencePressure(input),budget=routeCost(route,input,hops);
 const affinity=round(avg(route.map(d=>map[d.id]?.affinity??50))),feasibility=round(avg(route.map(d=>map[d.id]?.feasibility.score??50)));
 const sequence=round(clamp(100-avg(hops.map(x=>x.score)))),duration=Number(input.context?.duration||20),totalNights=route.reduce((s,d)=>s+d.assignedNights,0);
 let pressure=route.length*4.4+Math.max(0,route.length-4)*6+avg(hops.map(x=>x.score))*.34+Math.max(0,totalNights-duration)*6+night.underMinimum.length*10;
 if(travellerDNA.depth.value>70)pressure+=Math.max(0,route.length-3)*3.5;if(travellerDNA.slow.value>70)pressure+=Math.max(0,route.length-3)*3;
 if(travellerDNA.autonomy.value>66)pressure+=Math.max(0,exp.reservation-52)*.13;pressure=round(clamp(pressure));
 const redPenalty=Math.max(0,red.score-82)*.28;
 const score=round(clamp(affinity*.25+feasibility*.12+cov.score*.25+sequence*.14+night.score*.09+budget.score*.07+(100-pressure)*.08-redPenalty));
 return{score,affinity,feasibility,coverage:cov.score,coverageDetail:cov,redundancy:red.score,redundancyDetail:red,pressure,sequence,nightFit:night.score,budgetFit:budget.score,budget,distance:round(hops.reduce((s,x)=>s+x.km,0)),countryChanges:hops.filter(x=>x.crossCountry).length,hops,experiencePressure:exp,underMinimum:night.underMinimum,underIdeal:night.underIdeal};
}
function marginalValue({candidate,route,input,travellerDNA,ranking}){
 const base=evaluateRoute({input,travellerDNA,ranking,overrideRoute:route});
 const after=evaluateRoute({input,travellerDNA,ranking,overrideRoute:[...route,{...candidate,assignedNights:candidate.ideal}]});
 const diversity=route.length?100-Math.max(...route.map(x=>destinationSimilarity(x,candidate,travellerDNA))):60;
 const coverageGain=after.coverage-base.coverage,routeDelta=after.score-base.score,pressureCost=Math.max(0,after.pressure-base.pressure);
 const score=round(clamp(50+coverageGain*3+routeDelta*2+diversity*.17-pressureCost*.55));
 const beforeMap=Object.fromEntries((base.coverageDetail.dimensions||[]).map(x=>[x.dimension,x.fit]));
 const newDimensions=(after.coverageDetail.dimensions||[]).map(x=>({dimension:x.dimension,label:x.label,gain:x.fit-(beforeMap[x.dimension]||0)})).filter(x=>x.gain>=5).sort((a,b)=>b.gain-a.gain).slice(0,5);
 return{score,coverageGain:round(coverageGain),routeDelta:round(routeDelta),pressureCost:round(pressureCost),diversity:round(diversity),newDimensions};
}
function analyseRemovals({input,travellerDNA,ranking}){
 const route=normalizeRoute(input);if(route.length<2)return[];const base=evaluateRoute({input,travellerDNA,ranking,overrideRoute:route});
 return route.map(d=>{const after=evaluateRoute({input,travellerDNA,ranking,overrideRoute:route.filter(x=>x.id!==d.id)});
   return{destination:d.id,name:d.name,before:base.score,after:after.score,delta:after.score-base.score,
     structurality:round(clamp((base.coverage-after.coverage)*3+(base.score-after.score)*2+15)),
     pressureDelta:after.pressure-base.pressure,coverageDelta:after.coverage-base.coverage,distanceDelta:after.distance-base.distance}
 }).sort((a,b)=>b.delta-a.delta);
}
function analyseAdditions({input,travellerDNA,ranking,limit=8}){
 const route=normalizeRoute(input),selected=new Set(route.map(x=>x.id));
 return ranking.filter(r=>!selected.has(r.id)).slice(0,35).map(r=>({destination:r.id,name:r.destination.name,affinity:r.affinity,feasibility:r.feasibility.score,marginal:marginalValue({candidate:r.destination,route,input,travellerDNA,ranking})})).sort((a,b)=>b.marginal.score-a.marginal.score).slice(0,limit);
}
function surpriseMatches({input,travellerDNA,ranking,limit=5}){
 const route=normalizeRoute(input),selected=new Set(route.map(x=>x.id));
 return ranking.filter(r=>!selected.has(r.id)).map(r=>{const marginal=marginalValue({candidate:r.destination,route,input,travellerDNA,ranking});
   return{...r,marginal,surpriseScore:round(r.affinity*.50+r.feasibility.score*.16+marginal.score*.24+r.robustness*.10)}})
   .filter(r=>r.affinity>=70&&r.marginal.score>=43).sort((a,b)=>b.surpriseScore-a.surpriseScore).slice(0,limit);
}
function assignRoles({input,travellerDNA,ranking,removals}){
 const route=normalizeRoute(input);if(!route.length)return[];const rm=Object.fromEntries(removals.map(x=>[x.destination,x])),rank=Object.fromEntries(ranking.map(x=>[x.id,x]));
 const structural=route.map(d=>({id:d.id,score:clamp((rm[d.id]?.structurality??15)*1.35+(rank[d.id]?.affinity??50)*.42+Math.min(1.3,d.assignedNights/d.ideal)*10)})).sort((a,b)=>b.score-a.score),anchor=structural[0]?.id;
 return route.map((d,i)=>{const others=route.filter(x=>x.id!==d.id),sim=others.length?avg(others.map(x=>destinationSimilarity(d,x,travellerDNA))):100;let role='SUPPORT',why='Contribuisce senza essere il principale punto strutturale.';
   if(d.id===anchor){role='ANCHOR';why='Ha il contributo strutturale più alto nella composizione attuale.'}
   else if(i===route.length-1&&((d.dna.slow>84&&d.dna.adventure<72)||(d.dna.wellness>88)||(d.dna.sea>90&&d.dna.slow>84))){role='DECOMPRESSION';why='Chiude il viaggio abbassando ritmo e pressione.'}
   else if((rank[d.id]?.affinity??0)>=78&&(d.dna.romance>92||d.dna.design>94||d.dna.adventure>94)&&sim<82){role='SIGNATURE';why='Introduce un momento ad alta identità e poco ridondante.'}
   else if(i>0&&i<route.length-1&&d.hub>=4&&routeHops([route[i-1],d,route[i+1]]).some(x=>x.score>28)){role='BRIDGE';why='Aiuta a gestire una transizione geografica.'}
   else if(sim<64){role='CONTRAST';why='Aggiunge un linguaggio diverso rispetto alle altre tappe.'}
   return{id:d.id,name:d.name,role,structuralScore:round(structural.find(x=>x.id===d.id)?.score||0),confidence:rank[d.id]?.robustness||50,why};
 });
}

/* ---------- Scenarios ---------- */
function protectTime({input,travellerDNA,ranking}){
 let route=normalizeRoute(input),base=evaluateRoute({input,travellerDNA,ranking,overrideRoute:route}),removed=[];
 while(route.length>3&&evaluateRoute({input,travellerDNA,ranking,overrideRoute:route}).pressure>42){
   const current=evaluateRoute({input,travellerDNA,ranking,overrideRoute:route});let best=null;
   for(const d of route){const cand=route.filter(x=>x.id!==d.id),r=evaluateRoute({input,travellerDNA,ranking,overrideRoute:cand}),utility=(current.pressure-r.pressure)*1.4-(current.coverage-r.coverage)*1.9-(current.affinity-r.affinity)*.65;
     if(!best||utility>best.utility)best={d,cand,r,utility}}
   if(!best||best.utility<=0)break;removed.push(best.d.id);route=best.cand;
 }
 const r=evaluateRoute({input,travellerDNA,ranking,overrideRoute:route});return{type:'protect_time',route:route.map(x=>x.id),removed,score:r.score,pressure:r.pressure,impact:{score:r.score-base.score,pressure:r.pressure-base.pressure,coverage:r.coverage-base.coverage}};
}
function protectIdentity({input,travellerDNA,ranking}){
 let route=normalizeRoute(input),base=evaluateRoute({input,travellerDNA,ranking,overrideRoute:route}),removed=[];
 while(route.length>3){const opts=route.map(d=>{const cand=route.filter(x=>x.id!==d.id),r=evaluateRoute({input,travellerDNA,ranking,overrideRoute:cand});return{d,cand,r,loss:base.coverage-r.coverage}}).sort((a,b)=>a.loss-b.loss);if(!opts[0]||opts[0].loss>3)break;removed.push(opts[0].d.id);route=opts[0].cand}
 const r=evaluateRoute({input,travellerDNA,ranking,overrideRoute:route});return{type:'protect_identity',route:route.map(x=>x.id),removed,score:r.score,coverage:r.coverage,impact:{coverage:r.coverage-base.coverage,pressure:r.pressure-base.pressure}};
}
function protectExperience({input,travellerDNA,ranking,additions,removals}){
 const route=normalizeRoute(input),best=additions[0];if(!best)return{type:'protect_experiences',action:'none',route:route.map(x=>x.id)};
 const current=evaluateRoute({input,travellerDNA,ranking,overrideRoute:route});
 if(current.pressure<55)return{type:'protect_experiences',action:'add',route:[...route.map(x=>x.id),best.destination],added:best.destination,marginal:best.marginal};
 const least=[...removals].sort((a,b)=>a.structurality-b.structurality)[0];
 return{type:'protect_experiences',action:least?'replace':'add',route:least?[...route.filter(x=>x.id!==least.destination).map(x=>x.id),best.destination]:[...route.map(x=>x.id),best.destination],removed:least?.destination||null,added:best.destination,marginal:best.marginal};
}
function protectValue(ranking){
 return{type:'protect_value',destinations:ranking.map(r=>{const op=DEST.profileFor(r.id)?.operational,burden=r.destination.cost*.68+(op?.arrivalFriction??r.destination.friction)*.32;return{id:r.id,name:r.destination.name,affinity:r.affinity,feasibility:r.feasibility.score,efficiency:round(clamp((r.affinity*.75+r.feasibility.score*.25)/Math.max(30,burden)*45))}}).sort((a,b)=>b.efficiency-a.efficiency).slice(0,6)};
}

/* ---------- Main ---------- */
function analyseJourney(input,options={}){
 const product=options.product||input.product||'honeymoon',travellerDNA=buildTravellerDNA(input),quality=informationQuality(input,travellerDNA);
 let ranking=baseRanking(input,travellerDNA,product);
 const sensitivity=rankingSensitivity(input,product,ranking);
 ranking=ranking.map(r=>{const obs=sensitivity.matchRobustness[r.id],rob=obs===undefined?r.robustness:round(r.robustness*.55+obs*.45);const next={...r,rankingRobustness:obs??null,robustness:rob};next.classification=classify(next);return next}).sort((a,b)=>b.recommendation-a.recommendation);
 const route=evaluateRoute({input,travellerDNA,ranking}),removals=analyseRemovals({input,travellerDNA,ranking}),additions=analyseAdditions({input,travellerDNA,ranking}),surprises=surpriseMatches({input,travellerDNA,ranking}),roles=assignRoles({input,travellerDNA,ranking,removals});
 const scenarios={protectTime:protectTime({input,travellerDNA,ranking}),protectIdentity:protectIdentity({input,travellerDNA,ranking}),protectExperiences:protectExperience({input,travellerDNA,ranking,additions,removals}),protectValue:protectValue(ranking)};
 const topConf=avg(strongestSignals(travellerDNA,6).map(x=>x.confidence))*100,analysisConfidence=round(clamp(quality.score*.38+topConf*.32+sensitivity.stability*.30));
 return{engineVersion:VERSION,knowledgeVersion:DEST.knowledgeVersion,product,generatedAt:new Date().toISOString(),informationQuality:quality,analysisConfidence,travellerDNA,topSignals:strongestSignals(travellerDNA,8),destinationRanking:ranking,rankingSensitivity:sensitivity,route,routeRoles:roles,surpriseMatches:surprises,counterfactuals:{removals,additions},scenarios};
}
global.YumeJourneyIntelligenceCore=Object.freeze({
 version:VERSION,analyseJourney,buildTravellerDNA,strongestSignals,informationQuality,semanticFit,explicitExperienceFit,domainAnchorFit,
 rankDestinations:baseRanking,calculateFeasibility,evaluateRoute,marginalValue,analyseRemovals,analyseAdditions,
 destinationSimilarity,geoDistance,rankingSensitivity,budgetCapacity,experiencePressure
});
})(window);
