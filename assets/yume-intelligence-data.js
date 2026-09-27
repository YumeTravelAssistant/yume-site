/* ============================================================
YUME JOURNEY INTELLIGENCE
DATA & KNOWLEDGE LAYER
Version: 0.60.0
============================================================ */
(function(global){
'use strict';

const VERSION='0.60.0';

const DIMENSIONS=[
  'urban','nature','sea','slow','heritage','contemporary','craft','food','nightlife','wellness',
  'adventure','design','iconic','discovery','comfort','autonomy','depth','privacy','romance','local'
];

const DIMENSION_META={
  urban:{label:'Energia urbana',group:'atmosphere',weight:1},
  nature:{label:'Natura',group:'atmosphere',weight:1},
  sea:{label:'Mare',group:'atmosphere',weight:1},
  slow:{label:'Tempo lento',group:'atmosphere',weight:1},
  heritage:{label:'Patrimonio',group:'culture',weight:.95},
  contemporary:{label:'Contemporaneo',group:'culture',weight:.9},
  craft:{label:'Artigianato',group:'culture',weight:.9},
  food:{label:'Food',group:'experience',weight:1.1},
  nightlife:{label:'Vita serale',group:'experience',weight:.8},
  wellness:{label:'Wellness',group:'experience',weight:.8},
  adventure:{label:'Avventura',group:'experience',weight:.8},
  design:{label:'Design',group:'experience',weight:.9},
  iconic:{label:'Iconico',group:'journey',weight:.9},
  discovery:{label:'Scoperta',group:'journey',weight:1},
  comfort:{label:'Comfort',group:'journey',weight:1},
  autonomy:{label:'Autonomia',group:'journey',weight:.95},
  depth:{label:'Profondità',group:'journey',weight:1},
  privacy:{label:'Privacy',group:'relationship',weight:.9},
  romance:{label:'Romance',group:'relationship',weight:1},
  local:{label:'Immersione locale',group:'relationship',weight:1}
};

const PRODUCT_PROFILES={
  honeymoon:{romance:1.22,privacy:1.12,design:1.08,slow:1.06,food:1.04},
  classic:{heritage:1.12,local:1.12,depth:1.08,comfort:1.04,autonomy:1.04},
  next:{discovery:1.18,autonomy:1.14,urban:1.07,nightlife:1.08,local:1.12},
  b2b:{}
};

const SPARK_PROFILES={
  city:{urban:1,contemporary:.55,nightlife:.25,autonomy:.25},
  sea:{sea:1,slow:.45,romance:.35,nature:.2},
  food:{food:1,local:.45},
  stay:{comfort:.7,design:.55,privacy:.4,romance:.3},
  far:{discovery:.9,adventure:.4,local:.35},
  slow:{slow:1,depth:.55,wellness:.25}
};

const ALLOCATION_PROFILES={
  experiences:{discovery:.55,local:.45,adventure:.2},
  comfort:{comfort:1,design:.3},
  food:{food:1},
  relax:{slow:.8,wellness:.6,privacy:.2},
  special:{romance:.75,privacy:.55,design:.25}
};

const EXPERIENCE_PROFILES={
  ryokan:{label:'Ryokan & onsen',dna:{slow:.8,heritage:.8,comfort:.55,romance:.8,privacy:.6,local:.5},pressure:{reservation:65,budget:58,time:45,logistics:35}},
  omakase:{label:'Omakase',dna:{food:1,privacy:.55,depth:.4,local:.5,romance:.35},pressure:{reservation:88,budget:62,time:25,logistics:12}},
  island:{label:'Isola & laguna',dna:{sea:1,slow:.8,nature:.65,romance:.65,privacy:.5},pressure:{reservation:45,budget:62,time:75,logistics:72}},
  rail:{label:'Treno panoramico',dna:{discovery:.55,slow:.4,romance:.25,design:.2},pressure:{reservation:40,budget:25,time:40,logistics:28}},
  craft:{label:'Atelier locale',dna:{craft:1,local:.85,heritage:.65,depth:.55},pressure:{reservation:42,budget:28,time:32,logistics:22}},
  private:{label:'Esperienza privata',dna:{privacy:1,romance:.7,comfort:.4},pressure:{reservation:78,budget:82,time:38,logistics:35}},
  streetfood:{label:'Food senza cerimonia',dna:{food:.9,local:1,autonomy:.65,urban:.4},pressure:{reservation:4,budget:8,time:12,logistics:8}},
  nature:{label:'Natura immersiva',dna:{nature:1,slow:.45,adventure:.45},pressure:{reservation:15,budget:20,time:58,logistics:42}},
  boutique:{label:'Boutique stay',dna:{design:1,comfort:.75,privacy:.5,romance:.35},pressure:{reservation:62,budget:60,time:10,logistics:12}},
  night:{label:'Una notte fuori',dna:{nightlife:1,urban:.8,contemporary:.6},pressure:{reservation:12,budget:25,time:30,logistics:12}},
  spa:{label:'Spa & decompressione',dna:{wellness:1,slow:.8,comfort:.5},pressure:{reservation:55,budget:55,time:42,logistics:12}},
  icon:{label:'Un’icona fatta bene',dna:{iconic:1,heritage:.45},pressure:{reservation:28,budget:15,time:38,logistics:20}},
  ceremony:{label:'Rituale privato',dna:{heritage:.9,craft:.55,local:.8,romance:.55},pressure:{reservation:72,budget:48,time:45,logistics:30}},
  photo:{label:'Photo story',dna:{romance:.75,design:.35,iconic:.4},pressure:{reservation:68,budget:50,time:40,logistics:28}},
  sailing:{label:'Laguna in privato',dna:{sea:.9,privacy:.75,romance:.8,adventure:.35},pressure:{reservation:72,budget:78,time:68,logistics:55}},
  hike:{label:'Trekking memorabile',dna:{nature:.95,adventure:1,discovery:.55},pressure:{reservation:12,budget:16,time:72,logistics:50}},
  designhotel:{label:'Hotel manifesto',dna:{design:1,comfort:.7,contemporary:.55},pressure:{reservation:70,budget:78,time:8,logistics:8}},
  market:{label:'Mercato con un local',dna:{food:.7,local:1,autonomy:.55},pressure:{reservation:6,budget:8,time:22,logistics:8}},
  sunset:{label:'Un tramonto solo vostro',dna:{romance:1,slow:.75,sea:.3,privacy:.35},pressure:{reservation:8,budget:10,time:18,logistics:15}},
  chef:{label:'Tavolo dello chef',dna:{food:1,privacy:.65,romance:.5,comfort:.4},pressure:{reservation:90,budget:78,time:35,logistics:20}}
};

function V(...values){return Object.fromEntries(DIMENSIONS.map((d,i)=>[d,values[i]??50]));}
function D(id,name,country,region,lat,lng,min,ideal,hub,cost,friction,season,dna,keywords=[],roles=[]){
  return {id,name,country,region,lat,lng,min,ideal,hub,cost,friction,
    season:{spring:season[0],summer:season[1],autumn:season[2],winter:season[3]},
    dna,keywords,roles};
}

const DESTINATIONS=[
D('tokyo','Tokyo','JP','Giappone',35.6762,139.6503,4,5,5,67,18,[94,58,94,76],V(100,20,10,25,72,100,63,98,95,52,26,98,96,90,95,97,92,45,70,90),['metropoli','food','design','quartieri','nightlife','architettura','anime','shopping'],['anchor','arrival','urban-core']),
D('nikko','Nikkō','JP','Giappone',36.7199,139.6982,1,2,2,49,38,[96,72,98,82],V(18,96,5,82,98,28,68,58,18,55,48,52,94,77,72,60,87,76,84,79),['santuari','foreste','montagna','heritage','spiritualità'],['contrast','heritage','nature']),
D('kamakura','Kamakura','JP','Giappone',35.3192,139.5467,1,1,2,54,26,[95,70,96,82],V(43,70,72,78,94,45,58,66,35,40,42,59,91,75,76,83,78,63,81,83),['templi','daibutsu','costa','heritage','passeggio'],['day-trip','heritage','coastal']),
D('hakone','Hakone','JP','Giappone',35.2324,139.1069,1,2,3,72,34,[94,76,96,88],V(22,92,35,94,66,35,61,72,18,98,44,81,86,72,95,68,85,93,96,66),['ryokan','onsen','fuji','wellness','romance'],['decompression','signature-stay','contrast']),
D('kawaguchiko','Kawaguchiko · Fuji','JP','Giappone',35.5171,138.7518,1,2,2,61,40,[95,73,97,84],V(16,98,42,92,52,24,40,58,12,65,60,58,100,74,78,63,78,86,94,59),['fuji','lago','paesaggio','natura','fotografia'],['icon','nature','signature']),
D('kanazawa','Kanazawa','JP','Giappone',36.5613,136.6562,2,2,3,58,28,[94,70,98,78],V(44,48,18,76,92,63,98,90,31,38,22,81,68,88,76,82,91,69,81,94),['artigianato','giardini','food','quartieri','gold leaf','geisha'],['depth','craft','surprise']),
D('takayama','Takayama','JP','Giappone',36.1461,137.2522,2,2,2,52,42,[88,72,96,70],V(25,85,8,84,95,31,93,82,19,55,48,62,78,91,68,73,94,72,83,96),['alpi','artigianato','sake','mercato','storico'],['depth','local','heritage']),
D('shirakawa','Shirakawa-gō','JP','Giappone',36.2571,136.9067,1,1,1,55,63,[85,66,95,65],V(8,95,5,87,100,16,89,50,5,24,53,46,93,90,51,42,72,67,79,88),['gassho','villaggio','montagna','unesco'],['icon','heritage','remote']),
D('kyoto','Kyoto','JP','Giappone',35.0116,135.7681,3,4,5,69,20,[100,60,100,77],V(62,42,4,67,100,61,96,95,46,51,25,88,100,83,90,86,100,73,93,97),['templi','rituali','artigianato','kaiseki','quartieri','zen'],['anchor','heritage-core','depth']),
D('nara','Nara','JP','Giappone',34.6851,135.8048,1,1,2,48,25,[99,58,100,78],V(30,82,4,82,100,29,68,61,16,35,34,52,96,72,72,83,84,64,81,90),['templi','parco','giappone antico','todai-ji'],['day-trip','heritage']),
D('osaka','Osaka','JP','Giappone',34.6937,135.5023,2,3,5,54,14,[94,53,94,76],V(96,18,18,31,61,93,49,100,98,45,23,78,91,87,91,98,79,39,64,96),['street food','nightlife','energia','kansai','izakaya'],['urban-core','food','hub']),
D('koyasan','Kōyasan','JP','Giappone',34.2147,135.5841,1,1,1,57,58,[92,72,98,88],V(5,98,2,100,100,8,62,54,3,50,35,43,94,87,52,38,82,94,94,91),['buddhismo','shukubo','silenzio','montagna'],['signature','spiritual','decompression']),
D('naoshima','Naoshima','JP','Giappone',34.4598,133.9957,1,2,2,70,48,[95,74,95,78],V(14,70,88,89,46,99,67,58,12,38,41,100,87,96,74,58,84,90,95,71),['arte','architettura','setouchi','isola','design'],['design','surprise','signature']),
D('himeji','Himeji','JP','Giappone',34.8151,134.6853,1,1,2,46,18,[100,54,100,76],V(45,30,5,58,100,38,58,69,30,31,21,55,100,61,76,91,64,48,66,71),['castello','heritage','iconico'],['icon','day-trip']),
D('okayama','Okayama','JP','Giappone',34.6551,133.9195,1,1,3,46,17,[96,58,98,78],V(50,48,8,72,82,52,69,73,35,32,20,64,83,76,80,91,78,55,73,82),['korakuen','giardino','setouchi','hub'],['bridge','garden']),
D('hiroshima','Hiroshima','JP','Giappone',34.3853,132.4553,2,2,4,50,18,[95,56,97,75],V(72,35,18,55,97,61,46,88,49,33,24,59,99,78,84,93,88,51,68,91),['memoria','okonomiyaki','storia','pace'],['heritage','anchor-secondary']),
D('miyajima','Miyajima','JP','Giappone',34.2797,132.3198,1,1,2,69,34,[95,68,98,83],V(8,79,93,95,100,19,63,67,10,55,37,59,100,81,79,55,75,93,100,79),['itsukushima','torii','isola','ryokan','tramonto'],['signature','romance','decompression']),
D('fukuoka','Fukuoka','JP','Giappone',33.5904,130.4017,2,3,5,53,12,[93,54,93,76],V(78,35,53,51,58,82,49,98,79,41,27,69,43,91,86,94,75,48,59,96),['yatai','food','kyushu','local','hub'],['food','bridge','surprise']),
D('nagasaki','Nagasaki','JP','Giappone',32.7503,129.8779,2,2,3,52,31,[94,48,94,75],V(56,54,73,66,96,54,55,85,43,33,30,61,88,92,77,82,89,59,79,93),['baia','storia internazionale','food','porto'],['heritage','discovery']),
D('beppu','Beppu','JP','Giappone',33.2846,131.4912,1,2,3,55,30,[90,61,92,84],V(32,76,42,96,51,35,43,67,21,100,30,54,66,76,80,77,73,82,88,71),['onsen','termale','wellness','slow'],['decompression','wellness']),
D('yakushima','Yakushima','JP','Giappone',30.3587,130.5281,3,4,1,64,72,[83,55,89,73],V(4,100,81,94,58,7,26,49,2,35,100,28,87,100,45,28,95,90,92,84),['foresta','trekking','isola','remote','avventura'],['adventure','remote','signature']),
D('okinawa','Okinawa','JP','Giappone',26.2124,127.6809,4,5,4,62,38,[85,52,78,72],V(42,79,100,93,66,55,58,81,41,73,72,63,74,88,83,82,83,82,91,87),['mare','ryukyu','isola','beach','slow'],['sea','decompression','finale']),
D('ishigaki','Ishigaki · Yaeyama','JP','Giappone',24.3448,124.1572,4,5,3,68,56,[82,48,76,70],V(18,94,100,96,51,26,49,72,18,52,89,47,72,98,73,60,88,90,96,84),['barriera','mare','isole','natura','yaeyama'],['sea','remote','finale']),
D('sapporo','Sapporo','JP','Giappone',43.0618,141.3545,3,4,5,56,28,[78,100,93,100],V(82,72,20,53,58,79,42,96,78,56,64,68,63,89,88,93,79,46,63,91),['hokkaido','food','neve','birra','natura'],['anchor-secondary','food','seasonal']),
D('seoul','Seoul','KR','Corea',37.5665,126.978,3,4,5,61,22,[97,54,98,80],V(98,42,8,22,79,100,57,96,98,72,31,97,79,92,92,94,88,43,68,88),['design','food','nightlife','palazzi','contemporary'],['anchor','urban-core','contrast']),
D('busan','Busan','KR','Corea',35.1796,129.0756,2,3,4,53,20,[95,62,96,83],V(76,62,96,63,64,79,42,94,80,56,55,74,67,90,84,91,78,58,78,93),['costa','mercati','food','mare'],['coastal','food','decompression']),
D('gyeongju','Gyeongju','KR','Corea',35.8562,129.2247,1,2,2,46,34,[98,61,98,78],V(18,77,14,87,100,26,69,66,16,35,31,53,97,76,72,73,88,69,85,91),['silla','patrimonio','tumuli','heritage'],['heritage','depth']),
D('jeju','Jeju','KR','Corea',33.4996,126.5312,3,4,4,58,35,[88,58,92,73],V(22,96,95,89,44,43,41,83,22,62,88,57,72,91,80,78,84,85,93,83),['vulcano','mare','natura','isola'],['nature','sea','decompression']),
D('bangkok','Bangkok','TH','Thailandia',13.7563,100.5018,3,4,5,49,22,[73,48,83,95],V(100,24,14,17,93,91,67,100,96,67,38,84,98,93,88,89,86,38,65,98),['street food','templi','nightlife','metropoli'],['anchor','urban-core','food']),
D('ayutthaya','Ayutthaya','TH','Thailandia',14.3532,100.5689,1,1,2,36,24,[79,43,88,94],V(19,53,6,73,100,23,48,67,8,22,40,46,100,77,63,68,66,56,73,86),['rovine','templi','heritage'],['day-trip','heritage']),
D('chiangmai','Chiang Mai','TH','Thailandia',18.7883,98.9853,3,4,4,42,20,[83,45,91,98],V(52,78,4,79,92,58,100,92,51,82,60,79,79,96,82,88,95,75,91,100),['artigianato','food','montagna','wellness','local'],['depth','craft','surprise']),
D('chiangrai','Chiang Rai','TH','Thailandia',19.9105,99.8406,2,2,3,39,32,[80,42,89,98],V(24,82,4,84,91,56,78,71,25,57,61,77,90,98,75,77,84,72,88,92),['templi contemporanei','nord','natura'],['discovery','contrast']),
D('khaosok','Khao Sok','TH','Thailandia',8.9148,98.5306,2,2,1,46,63,[52,37,56,88],V(3,100,72,100,20,8,18,48,2,41,98,30,76,100,55,30,76,91,90,79),['giungla','lago','floating stay','natura'],['adventure','remote','signature']),
D('phuket','Phuket','TH','Thailandia',7.8804,98.3923,4,5,5,53,18,[66,40,74,92],V(66,67,100,77,44,72,41,82,81,88,72,79,83,74,93,84,67,80,89,76),['mare','resort','nightlife','wellness'],['sea','hub','finale']),
D('krabi','Krabi','TH','Thailandia',8.0863,98.9063,4,5,4,49,28,[71,36,77,94],V(33,91,100,84,33,42,26,76,38,64,92,66,88,87,84,76,77,86,95,82),['falesie','isole','andamane','natura'],['sea','adventure','finale']),
D('kohsamui','Koh Samui','TH','Thailandia',9.512,100.0136,4,5,4,58,24,[76,88,78,95],V(38,70,100,91,40,51,32,79,49,92,70,77,80,79,94,76,72,92,98,77),['resort','spiaggia','wellness','romance'],['sea','decompression','finale']),
D('tahiti','Tahiti','PF','Polinesia',-17.6509,-149.426,2,2,5,83,35,[72,92,78,54],V(42,87,100,72,64,48,68,72,31,61,72,69,78,93,83,70,77,79,90,88),['gateway','cultura polinesiana','mare'],['bridge','gateway']),
D('moorea','Moorea','PF','Polinesia',-17.5388,-149.8295,4,5,4,87,38,[74,96,82,58],V(7,100,100,96,42,19,45,65,11,72,88,67,84,96,89,63,86,96,100,82),['laguna','natura','romance','slow'],['sea','signature','decompression']),
D('borabora','Bora Bora','PF','Polinesia',-16.5004,-151.7415,5,6,4,97,46,[68,95,79,52],V(3,94,100,100,34,30,21,51,9,92,58,79,93,62,96,36,70,100,100,37),['laguna','overwater','privacy','romance','luxury'],['signature','decompression','finale']),
D('tahaa','Taha’a','PF','Polinesia',-16.6194,-151.4937,3,4,2,84,55,[73,97,82,56],V(4,96,100,100,48,16,64,72,7,58,66,58,67,98,78,48,87,98,99,91),['vaniglia','motu','privacy','local'],['surprise','decompression','local']),
D('rangiroa','Rangiroa','PF','Polinesia',-14.9543,-147.65,4,5,3,82,62,[69,94,80,55],V(2,98,100,94,26,10,22,62,4,35,100,37,72,100,67,44,80,96,94,74),['atollo','diving','laguna','remote'],['adventure','sea','remote']),
D('fakarava','Fakarava','PF','Polinesia',-16.0542,-145.6569,4,5,2,78,70,[70,95,82,54],V(1,100,100,97,31,9,27,56,2,28,100,33,68,100,59,37,85,98,96,80),['biosfera','diving','remote','natura'],['adventure','remote','sea']),
D('tikehau','Tikehau','PF','Polinesia',-15.0037,-148.238,4,5,2,80,66,[71,97,83,55],V(1,98,100,100,29,8,21,58,3,47,82,42,64,98,70,39,79,100,99,73),['atollo','sabbia rosa','silenzio','privacy'],['decompression','privacy','remote']),
D('maldives','Maldive · Atolli','MV','Oceano Indiano',3.2028,73.2207,5,7,5,94,44,[80,60,70,98],V(2,88,100,100,18,44,12,72,17,100,76,91,82,62,99,34,63,100,100,27),['resort island','privacy','wellness','overwater','mare'],['signature','decompression','finale']),
D('mauritius','Mauritius','MU','Oceano Indiano',-20.3484,57.5522,5,7,5,68,25,[78,92,88,72],V(38,92,100,86,66,62,58,88,52,82,80,74,70,89,92,84,89,83,92,93),['mare','natura','food','road trip'],['sea','balanced-finale','exploration']),
D('reunion','Réunion','RE','Oceano Indiano',-21.1151,55.5364,5,7,4,63,42,[78,90,86,71],V(34,100,86,78,64,56,52,79,39,45,100,62,72,100,80,77,92,72,83,88),['vulcani','trekking','natura','road trip'],['adventure','nature']),
D('seychelles','Seychelles','SC','Oceano Indiano',-4.6796,55.492,5,7,5,88,40,[88,79,91,76],V(8,100,100,96,28,37,29,68,14,78,82,72,92,83,94,69,80,98,100,67),['granito','spiagge','island hopping','romance'],['sea','signature','finale']),
D('singapore','Singapore','SG','Sud-est asiatico',1.3521,103.8198,2,3,5,71,9,[83,68,85,89],V(100,28,26,20,59,100,56,97,91,80,21,100,89,76,99,99,67,56,74,78),['architettura','food','hub','design','urban'],['bridge','hub','urban-core']),
D('hanoi','Hanoi','VN','Vietnam',21.0278,105.8342,3,4,5,38,18,[94,54,98,85],V(89,31,9,39,94,69,72,100,76,34,32,63,87,98,74,88,95,42,66,100),['old quarter','food','locale','cultura'],['anchor','food','local']),
D('halong','Ha Long Bay','VN','Vietnam',20.9101,107.1839,1,2,2,58,38,[83,51,90,80],V(4,100,92,91,37,20,26,63,6,49,67,58,100,76,82,39,65,90,97,54),['baia','crociera','paesaggio'],['signature','nature']),
D('hoian','Hội An','VN','Vietnam',15.8801,108.338,3,4,3,43,22,[97,80,58,84],V(40,62,59,91,97,58,100,96,42,67,38,84,94,97,83,90,100,82,98,100),['lanterne','sartoria','food','artigianato','romance'],['depth','romance','craft']),
D('hochiminh','Ho Chi Minh City','VN','Vietnam',10.8231,106.6297,3,4,5,41,20,[75,51,87,94],V(98,18,17,18,69,93,47,99,97,45,26,75,69,97,81,91,84,34,57,99),['metropoli','food','nightlife','locale'],['urban-core','food']),
D('ubud','Ubud · Bali','ID','Indonesia',-8.5069,115.2625,4,5,4,51,28,[70,100,95,52],V(24,96,12,98,83,54,96,84,29,100,57,91,72,95,91,78,100,92,99,96),['risaie','wellness','craft','slow','cultura'],['depth','wellness','decompression']),
D('uluwatu','Uluwatu · Bali','ID','Indonesia',-8.8291,115.0849,4,5,4,66,30,[72,100,96,55],V(27,79,100,97,52,59,49,79,46,91,66,90,84,82,95,71,83,97,100,72),['scogliere','sunset','beach stay','romance'],['sea','romance','finale']),
D('komodo','Komodo','ID','Indonesia',-8.55,119.48,3,4,3,62,58,[67,100,96,61],V(2,100,100,82,22,8,18,57,3,26,100,37,92,100,63,30,76,91,95,71),['navigazione','fauna','isole','avventura'],['adventure','signature','remote'])
];

const DESTINATION_BY_ID=Object.fromEntries(DESTINATIONS.map(d=>[d.id,d]));

global.YumeIntelligenceData=Object.freeze({
  version:VERSION,
  dimensions:DIMENSIONS,
  dimensionMeta:DIMENSION_META,
  productProfiles:PRODUCT_PROFILES,
  sparkProfiles:SPARK_PROFILES,
  allocationProfiles:ALLOCATION_PROFILES,
  experienceProfiles:EXPERIENCE_PROFILES,
  destinations:DESTINATIONS,
  destinationById:DESTINATION_BY_ID
});
})(window);
