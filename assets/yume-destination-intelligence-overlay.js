/* YUME Destination Intelligence Overlay · 0.85.0 */
(function(global){
'use strict';
const DATA=global.YumeIntelligenceData;
if(!DATA) throw new Error('YumeIntelligenceData missing');
const VERSION='0.85.0';
const KNOWLEDGE_VERSION='github-audit-2026-09-27';

const KNOWLEDGE_REFS={
 tokyo:['tokyoKnowledgeSeed.ts'],nikko:['tokyoSurroundingsKnowledgeSeed.ts'],kamakura:['tokyoSurroundingsKnowledgeSeed.ts'],
 hakone:['tokyoSurroundingsKnowledgeSeed.ts'],kawaguchiko:['tokyoSurroundingsKnowledgeSeed.ts'],
 kanazawa:['hokurikuAlpsKnowledgeSeed.ts'],takayama:['hokurikuAlpsKnowledgeSeed.ts'],shirakawa:['hokurikuAlpsKnowledgeSeed.ts'],
 kyoto:['kyotoKnowledgeSeed.ts'],nara:['ujiNaraKiiKnowledgeSeed.ts'],koyasan:['ujiNaraKiiKnowledgeSeed.ts'],
 osaka:['osakaKnowledgeSeed.ts'],naoshima:['shikokuKnowledgeSeed.ts'],himeji:['hyogoKnowledgeSeed.ts'],
 okayama:['shikokuKnowledgeSeed.ts'],hiroshima:['hiroshimaKnowledgeSeed.ts'],miyajima:['hiroshimaKnowledgeSeed.ts'],
 fukuoka:['fukuokaKnowledgeSeed.ts'],okinawa:['okinawaKnowledgeSeed.ts'],ishigaki:['okinawaKnowledgeSeed.ts'],
 sapporo:['hokkaidoTohokuKnowledgeSeed.ts']
};
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const round=Math.round;
const mix=(a,b,t)=>a*(1-t)+b*t;
function monthlySeasonality(d){
 const s=d.season;
 return {1:round(s.winter),2:round(mix(s.winter,s.spring,.25)),3:round(s.spring),4:round(s.spring),
 5:round(mix(s.spring,s.summer,.25)),6:round(s.summer),7:round(s.summer),8:round(s.summer),
 9:round(mix(s.summer,s.autumn,.65)),10:round(s.autumn),11:round(s.autumn),12:round(mix(s.autumn,s.winter,.75))};
}
function curationConfidence(d){
 if(KNOWLEDGE_REFS[d.id]) return .84;
 if(d.region==='Giappone') return .76;
 return .70;
}
function operational(d){
 const remote=(d.roles||[]).includes('remote');
 const sea=(d.roles||[]).some(x=>['sea','finale','decompression'].includes(x));
 return {
   relativeCostIndex:d.cost,
   baseFriction:d.friction,
   arrivalFriction:round(clamp(d.friction+(remote?10:0)+(sea&&d.hub<=3?4:0)-d.hub*1.8)),
   hubStrength:d.hub,
   minimumNights:d.min,
   idealNights:d.ideal,
   remote,sea
 };
}
const profiles=Object.fromEntries(DATA.destinations.map(d=>[d.id,{
 id:d.id,dnaVersion:'destination-dna-0.85',
 scoreSemantics:'relative_to_yume_destination_universe',
 curationStatus:'expert_editorial_first_calibration',
 curationConfidence:curationConfidence(d),
 knowledgeCoverage:KNOWLEDGE_REFS[d.id]?'connected':'not_connected',
 knowledgeRefs:KNOWLEDGE_REFS[d.id]||[],
 monthlySeasonality:monthlySeasonality(d),
 operational:operational(d)
}]));
global.YumeDestinationIntelligence=Object.freeze({
 version:VERSION,knowledgeVersion:KNOWLEDGE_VERSION,profiles,
 profileFor:id=>profiles[id]||null,knowledgeRefs:KNOWLEDGE_REFS
});
})(window);
