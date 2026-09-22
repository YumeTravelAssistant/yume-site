(() => {
'use strict';

const DATA = {
  giappone:{
    theme:'japan',
    label:'Giappone',
    eyebrow:'Core expertise · Japan Signature',
    title:'Giappone. <em>Più intimo, più vostro.</em>',
    lead:'Un viaggio di nozze in Giappone non ha bisogno di essere riempito. Ha bisogno di ritmo: metropoli, silenzi, ryokan, artigianato, food e giorni lasciati respirare.',
    summary:'Esempio di progetto',
    duration:'16–18 giorni',
    rhythm:'Cultura + pausa',
    style:'Signature / NEXT',
    image:'/assets/home.jpg',
    introTitle:'Un Giappone che cambia <em>insieme a voi.</em>',
    intro:'Il modello parte dall’esperienza YUME sul Giappone e la trasforma in un viaggio di coppia: meno logica da tour, più equilibrio tra luoghi iconici, strutture che meritano tempo e momenti non programmati.',
    stops:[
      ['01','Tokyo','4 notti','Arrivo morbido, quartieri scelti per interessi reali, una cena speciale e almeno una giornata senza checklist.'],
      ['02','Fuji / Hakone','2 notti','Un cambio di ritmo: natura, onsen e una struttura dove la permanenza è parte del viaggio, non solo pernottamento.'],
      ['03','Kanazawa','2 notti','Artigianato, giardini, quartieri storici e una scala più umana prima di Kyoto.'],
      ['04','Kyoto','4 notti','Templi e Higashiyama, ma anche tè, botteghe, una sera lenta e un’esperienza privata selezionata.'],
      ['05','Osaka + Kansai','3 notti','Food, energia serale e libertà di scegliere tra Nara, Himeji, Hiroshima/Miyajima o tempo per voi.']
    ],
    values:[
      ['Ritmo','Non si rincorrono città','Ogni cambio di base deve avere un motivo. Inseriamo pause e notti speciali dove producono davvero valore.'],
      ['Momento coppia','Ryokan e onsen','Una notte tradizionale non è una voce di capitolato: è una cesura narrativa del viaggio.'],
      ['YUME factor','Profondità locale','Il Giappone è il nostro core: logistica, stagionalità, cultura, food e alternative vengono disegnate con conoscenza diretta.']
    ],
    quote:'Il ricordo non sarà quante cose avete visto. Sarà <em>come vi siete sentiti mentre le vivevate.</em>',
    momentMain:'Tokyo e Kyoto danno intensità. Fuji, ryokan e giornate libere creano spazio. Il progetto nasce proprio dall’alternanza.',
    moments:[
      ['Una sera','Nessun programma','Un quartiere, una prenotazione fatta bene e il tempo di cambiare idea.'],
      ['Una notte','La struttura conta','Ryokan, onsen o boutique stay scelto perché vale la permanenza, non per la categoria.'],
      ['Un gesto','Qualcosa fatto insieme','Kintsugi, tè, cucina, artigianato: un ricordo che non resta solo nelle foto.']
    ],
    focus:'signature'
  },
  thailandia:{
    theme:'thailand',
    label:'Thailandia',
    eyebrow:'Flexible by nature · Thailand',
    title:'Thailandia. <em>Calore, ritmo, libertà.</em>',
    lead:'Bangkok, nord e mare possono diventare tre viaggi diversi nello stesso viaggio. La chiave è non trattarli come tappe equivalenti: energia, cultura e decompressione devono arrivare nel momento giusto.',
    summary:'Esempio di progetto',
    duration:'14–17 giorni',
    rhythm:'City + north + sea',
    style:'Signature / NEXT',
    image:'/assets/honeymoon/thailand-hero.webp',
    introTitle:'Tre ritmi. <em>Una sola storia.</em>',
    intro:'La Thailandia funziona bene quando il viaggio cambia registro senza spezzarsi. Prima l’energia urbana, poi un nord più lento e culturale, infine il mare scelto in base alla stagione e al vostro modo di viverlo.',
    stops:[
      ['01','Bangkok','3 notti','Food, fiume, templi e quartieri contemporanei. Un ingresso intenso, ma senza trasformare la città in una lista.'],
      ['02','Chiang Mai / Nord','3–4 notti','Mercati, natura, cucina e un ritmo più disteso. Le esperienze vengono scelte per qualità, non per quantità.'],
      ['03','Transizione','1 notte','Una giornata-cuscinetto evita di trasformare voli interni e trasferimenti in stress da incastro.'],
      ['04','Mare','5–7 notti','Isola o costa selezionata per stagione, atmosfera e livello di movimento desiderato: resort, small stay o mix.'],
      ['05','Rientro','1 notte opzionale','Quando serve, un’ultima notte strategica rende la partenza più semplice e chiude il viaggio senza corsa.']
    ],
    values:[
      ['Flessibilità','Si adatta al budget','Si può investire di più sul mare o sulle esperienze, mantenendo semplici le notti di transito.'],
      ['Contrasto','Energia e decompressione','La parte finale funziona davvero perché arriva dopo città e cultura, non come vacanza separata.'],
      ['YUME factor','Regia invisibile','Il valore è nella sequenza: voli interni, trasferimenti, stagionalità e notti vengono progettati per togliere attrito.']
    ],
    quote:'Il lusso qui non è fare tutto. È arrivare al mare <em>quando avete davvero voglia di rallentare.</em>',
    momentMain:'Il viaggio cambia tono gradualmente: Bangkok accende, il nord riequilibra, il mare assorbe il resto.',
    moments:[
      ['Una sera','Bangkok dall’alto o dal fiume','Non un punto panoramico da spuntare, ma un primo momento che segna l’inizio.'],
      ['Una mattina','Cucina e mercato','Capire un Paese attraverso ingredienti, gesti e conversazioni.'],
      ['Ultimi giorni','Niente agenda','Il mare non ha bisogno di essere riempito per diventare memorabile.']
    ],
    focus:'signature'
  },
  'giappone-polinesia':{
    theme:'polynesia',
    label:'Giappone + Polinesia',
    eyebrow:'Hero combination · Japan × Polynesia',
    title:'Prima il mondo. <em>Poi il silenzio.</em>',
    lead:'Un viaggio circolare: ingresso dal Kansai, attraversamento del Giappone fino a Tokyo, diretto Pacifico quando l’operativo lo consente, Polinesia e rientro su Narita per una soft landing prima dell’Italia.',
    summary:'Esempio di combinazione',
    duration:'23–27 giorni',
    rhythm:'West Japan → Pacific → soft landing',
    style:'Signature Journeys',
    image:'/assets/honeymoon/polynesia-hero.webp',
    introTitle:'Due mondi che hanno senso <em>solo se dialogano.</em>',
    intro:'Non sommiamo due destinazioni. Usiamo il Giappone anche come gateway naturale del Pacifico: si entra dall’ovest, si attraversa il Paese fino a Tokyo, si apre la Polinesia e si torna ancora in Giappone prima del lungo rientro verso l’Italia.',
    stops:[
      ['01','Osaka / Kansai','2–3 notti','Ingresso dal Giappone occidentale: food, recupero dal volo e un primo impatto senza chiedervi subito una giornata piena.'],
      ['02','Kyoto','4 notti','Templi, artigianato, tè e tempo di coppia. La parte più rituale e intima del viaggio.'],
      ['03','Kanazawa / Kaga Onsen','2 notti','Una pausa materica e termale mentre il viaggio si muove naturalmente verso est.'],
      ['04','Tokyo','4 notti','Il crescendo urbano: design, food, quartieri e contemporaneo. Tokyo diventa anche la porta verso il Pacifico.'],
      ['05','Narita → Papeete','volo diretto quando operativo','Il cambio di mondo è parte del progetto. Il calendario del non-stop viene verificato sulle date reali della coppia.'],
      ['06','Tahiti + isole','7–9 notti','Una o due isole selezionate bene: permanenza, acqua, silenzio e meno decisioni.'],
      ['07','Papeete → Narita / Tokyo','1–2 notti','Rientro diretto sul Giappone quando operativo e soft landing prima del lungo volo verso l’Italia.']
    ],
    values:[
      ['Contrasto','È il vero valore','La Polinesia pesa di più emotivamente perché arriva dopo un viaggio ricco e dinamico.'],
      ['Budget','Allocazione consapevole','Non tutte le notti devono costare allo stesso modo. Investiamo dove il contesto rende l’upgrade memorabile.'],
      ['YUME factor','Un unico progetto','Tempi, stanchezza, bagagli, trasferimenti e margini vengono letti come un unico viaggio, non due pratiche separate.']
    ],
    quote:'La parte più romantica non è il bungalow. È il momento in cui vi accorgete che <em>non dovete più correre.</em>',
    momentMain:'La combinazione funziona perché la logistica diventa racconto: Kansai apre il viaggio, Tokyo apre il Pacifico e il Giappone torna alla fine come cuscinetto prima dell’Italia.',
    moments:[
      ['In Giappone','Un’esperienza privata','Una cena, un laboratorio o un ryokan che segna il viaggio prima del cambio di ritmo.'],
      ['Transizione','Una giornata vuota','Serve a cambiare fuso, paesaggio e aspettativa senza stress.'],
      ['Sulle isole','Poche decisioni','Meno spostamenti, più permanenza: il contrario della prima parte, volutamente.']
    ],
    focus:'signature'
  },
  'giappone-corea':{
    theme:'korea',
    label:'Giappone + Corea',
    eyebrow:'East Asia · Japan × Korea',
    title:'Due culture vicine. <em>Due energie diverse.</em>',
    lead:'Giappone e Corea del Sud possono creare un viaggio urbano, culturale e gastronomico molto ricco. La sfida è dare identità a entrambe senza trasformare il viaggio in una corsa tra capitali.',
    summary:'Esempio di combinazione',
    duration:'17–20 giorni',
    rhythm:'Culture + city pulse',
    style:'Signature / NEXT',
    image:'/assets/honeymoon/korea-hero.webp',
    introTitle:'Continuità geografica. <em>Contrasto culturale.</em>',
    intro:'Il progetto usa il Giappone come prima immersione e la Corea come secondo linguaggio: più dinamica, contemporanea e notturna. Tra le due lasciamo spazio per percepire il cambio, non solo per spostarsi.',
    stops:[
      ['01','Tokyo','4 notti','Contemporaneo, quartieri, food e cultura pop o design secondo i vostri interessi.'],
      ['02','Kyoto','4 notti','Una parte più lenta e rituale: templi, artigianato, tè, ryokan o boutique stay.'],
      ['03','Osaka / Kansai','2 notti','Food, sera e collegamento naturale verso la seconda parte del viaggio.'],
      ['04','Seoul','4 notti','Palazzi, design, quartieri contemporanei, mercati e nightlife: un cambio di energia evidente.'],
      ['05','Busan o Gyeongju','3 notti','Mare e città oppure patrimonio e storia, scelti in base al tipo di chiusura che volete dare al viaggio.']
    ],
    values:[
      ['Varietà','Non serve il mare per cambiare ritmo','Il contrasto nasce da linguaggi urbani, estetica, food e rituali differenti.'],
      ['Interessi','Altissima personalizzazione','Moda, skincare, design, gaming, cultura pop, cucina e storia determinano il peso delle tappe.'],
      ['YUME factor','Sequenza, non somma','Riduciamo i cambi hotel e facciamo sì che il passaggio tra Paesi sia un’evoluzione del viaggio.']
    ],
    quote:'La luna di miele può essere romantica anche senza rallentare sempre. A volte è romantico <em>scoprire insieme.</em>',
    momentMain:'Questa combinazione è ideale per coppie curiose, urbane e interessate a food, cultura contemporanea e differenze tra Paesi.',
    moments:[
      ['Tokyo','Il vostro quartiere','Una base scelta per come vivete la città, non solo per vicinanza alla stazione.'],
      ['Kyoto','Cambio di tono','Rituali, legno, silenzio e un ritmo opposto alla città precedente.'],
      ['Seoul','Nuova energia','Il viaggio riparte: design, mercati, caffè, palazzi e una scena serale diversa.']
    ],
    focus:'next'
  },
  world:{
    theme:'world',
    label:'World / altra destinazione',
    eyebrow:'Worldwide Concierge · YUME Honeymoon',
    title:'Il mondo è aperto. <em>La regia resta YUME.</em>',
    lead:'Per le coppie che non vogliono partire da un catalogo: consulenti e Travel Designer costruiscono destinazioni, combinazioni, long stopover ed esperienze intorno alla vostra richiesta.',
    summary:'Worldwide by YUME',
    duration:'Su misura',
    rhythm:'Costruito sul brief',
    style:'Concierge / Signature / NEXT',
    image:'',
    introTitle:'Non scegliamo solo una meta. <em>Costruiamo la soluzione.</em>',
    intro:'World è il livello più aperto di YUME Honeymoon: può significare una destinazione fuori dalle nostre collezioni, un viaggio multi-country, un long stopover trasformato in esperienza o una richiesta molto specifica. Il lavoro dei consulenti è ridurre la complessità e trasformarla in poche alternative sensate.',
    stops:[
      ['01','Ascolto','Brief dedicato','Periodo, giorni disponibili, budget, priorità, stile di viaggio, esperienze desiderate e vincoli reali.'],
      ['02','Scenario design','2–3 direzioni','Costruiamo poche ipotesi motivate, spiegando differenze reali di clima, logistica, ritmo e valore.'],
      ['03','Routing','Voli + stopover','Disegniamo tratte, gateway e long stopover per evitare che la logistica consumi tempo ed energia.'],
      ['04','Experience design','Su richiesta','Stay, esperienze private, food, natura, wellness e momenti speciali entrano solo quando aggiungono valore.'],
      ['05','Regia YUME','Dalla scelta al rientro','Una volta scelta la direzione, il progetto viene coordinato come un unico viaggio con assistenza e materiali dedicati.']
    ],
    values:[
      ['Worldwide','Nessun catalogo chiuso','World serve proprio quando la richiesta esce dalle combinazioni già raccontate online.'],
      ['Travel design','Complessità resa semplice','Rotte, stagioni, stopover e priorità vengono lette insieme per evitare itinerari belli sulla carta ma faticosi nella realtà.'],
      ['Human care','Consulenti al servizio della coppia','La tecnologia organizza il progetto; il confronto umano serve a capire cosa vale davvero la pena costruire.']
    ],
    quote:'Quando tutto è possibile, il vero valore è <em>sapere cosa scegliere e cosa lasciare fuori.</em>',
    momentMain:'World non promette “qualsiasi cosa a ogni costo”. Promette un lavoro di consulenza per capire quale combinazione può trasformare una richiesta complessa in un viaggio coerente.',
    moments:[
      ['Long stopover','Una sosta che diventa viaggio','Un gateway può aggiungere due o tre giorni di valore, invece di essere soltanto attesa tra due voli.'],
      ['Multi-country','Più Paesi, una sola logica','Le combinazioni vengono progettate per continuità geografica, stagionale ed emotiva, non per accumulo.'],
      ['Richieste speciali','Esperienze cercate per voi','Quando avete un desiderio preciso, il team lo valuta, ne verifica fattibilità e qualità e lo integra nel progetto quando è coerente.']
    ],
    focus:''
  }
};

const EXTRA = {
  giappone:{
    mapLead:'Da Tokyo al Kansai passando per natura e città più intime: la mappa rende visibile l’alternanza tra energia e pausa.',
    coords:[
      [35.6762,139.6503,'Tokyo'],
      [35.2324,139.1070,'Hakone / Fuji'],
      [36.5613,136.6562,'Kanazawa'],
      [35.0116,135.7681,'Kyoto'],
      [34.6937,135.5023,'Osaka']
    ],
    stopMap:[0,1,2,3,4],
    connect:true,
    maxZoom:5,
    focusZoom:7,
    gallery:[['/assets/home.jpg','City pulse'],['/assets/fuji.jpg','Natura e pausa'],['/maison/4.jpg','Dettaglio e materia'],['/assets/cultura.jpg','Rituale e cultura']],
    rhythm:['Energia','Pausa','Materia','Rituale','Food & libertà']
  },
  thailandia:{
    mapLead:'Bangkok accende, il nord riequilibra, il mare chiude: la mappa mostra le tre aree principali del modello, mentre l’ultima notte di rientro resta opzionale.',
    coords:[
      [13.7563,100.5018,'Bangkok'],
      [18.7883,98.9853,'Chiang Mai / Nord'],
      [13.6900,100.7501,'Bangkok · transizione'],
      [9.5120,100.0136,'Mare · Koh Samui (esempio)']
    ],
    stopMap:[0,1,2,3,null],
    connect:true,
    maxZoom:5,
    focusZoom:7,
    gallery:[['/assets/honeymoon/thailand-hero.webp','Koh Samui · mare e luce'],['/assets/honeymoon/thailand-island.webp','Krabi · isole e decompressione']],
    rhythm:['City pulse','Nord lento','Transizione','Mare']
  },
  'giappone-polinesia':{
    mapLead:'Entrata dal Kansai, attraversamento del Giappone fino a Tokyo, apertura del Pacifico e rientro su Narita: ogni tappa della mappa corrisponde ora al relativo passaggio del modello.',
    coords:[
      [34.6937,135.5023,'Osaka / Kansai'],
      [35.0116,135.7681,'Kyoto'],
      [36.5613,136.6562,'Kanazawa / Kaga'],
      [35.6762,139.6503,'Tokyo'],
      [-17.5516,210.4415,'Papeete · arrivo in Polinesia'],
      [-16.5004,208.2585,'Isole · Bora Bora (esempio)'],
      [35.7720,140.3929,'Narita / Tokyo · soft landing']
    ],
    stopMap:[0,1,2,3,4,5,6],
    connect:true,
    maxZoom:4,
    focusZoom:6,
    gallery:[['/kataware/kataware_desk.jpg','Giappone intimo'],['/assets/cultura.jpg','Rituale'],['/assets/honeymoon/polynesia-hero.webp','Pacific gateway'],['/assets/honeymoon/polynesia-sunset.webp','Ocean slow']],
    rhythm:['Kansai soft start','Kyoto intimo','Onsen / materia','Tokyo crescendo','Pacific gateway','Ocean slow','Soft landing'],
    logistics:'Il collegamento diretto Narita–Papeete non è quotidiano: il progetto viene costruito sulle date operative reali. Il ritorno su Tokyo evita, quando possibile, di concatenare immediatamente Polinesia e lungo rientro verso l’Italia.'
  },
  'giappone-corea':{
    mapLead:'Il Giappone costruisce profondità e rituale; Seoul e la seconda tappa coreana riaccendono energia, design e contemporaneo.',
    coords:[
      [35.6762,139.6503,'Tokyo'],
      [35.0116,135.7681,'Kyoto'],
      [34.6937,135.5023,'Osaka'],
      [37.5665,126.9780,'Seoul'],
      [35.1796,129.0756,'Busan']
    ],
    stopMap:[0,1,2,3,4],
    connect:true,
    maxZoom:5,
    focusZoom:7,
    gallery:[['/assets/home.jpg','Tokyo'],['/assets/cultura.jpg','Kyoto'],['/assets/honeymoon/korea-hero.webp','Seoul contemporanea'],['/assets/honeymoon/korea-palace.webp','Heritage coreano']],
    rhythm:['Tokyo pulse','Kyoto rituale','Kansai food','Seoul energy','Korea finale']
  },
  world:{
    mapLead:'World non rappresenta un itinerario prestabilito. La mappa mostra aree e gateway che possono entrare in un progetto worldwide, senza collegarli artificialmente in una rotta unica.',
    coords:[
      [43.8392,10.8883,'YUME · progetto'],
      [25.2048,55.2708,'Middle East · gateway'],
      [13.7563,100.5018,'Asia'],
      [-20.3484,57.5522,'Oceano Indiano'],
      [-33.9249,18.4241,'Africa australe'],
      [-17.5516,-149.5585,'Pacifico'],
      [40.7128,-74.0060,'Americhe · gateway']
    ],
    stopMap:null,
    connect:false,
    fitWorld:true,
    maxZoom:2,
    focusZoom:4,
    mapDetails:[
      ['YUME · progetto','Il punto di partenza è il brief: periodo, durata, budget, priorità e desideri.'],
      ['Middle East · gateway','Un long stopover può diventare parte del viaggio quando aggiunge valore alla rotta.'],
      ['Asia','Città, cultura, mare e combinazioni regionali possono essere costruite in funzione della stagione.'],
      ['Oceano Indiano','Resort, natura e decompressione entrano nel progetto quando sono coerenti con il ritmo complessivo.'],
      ['Africa australe','Safari, città, natura e mare possono essere combinati senza trasformare il viaggio in una corsa.'],
      ['Pacifico','Isole e destinazioni remote richiedono routing, tempi e margini progettati con attenzione.'],
      ['Americhe · gateway','Nord e Sud America possono funzionare come destinazione, combinazione o stopover di lungo raggio.']
    ],
    gallery:[],
    rhythm:['Brief','Scenari','Routing','Esperienze','Scelta','Regia YUME'],
    logistics:'World non è una destinazione singola: voli, stopover, stagionalità, trasferimenti e combinazioni vengono verificati sul progetto reale prima di proporre la soluzione finale.'
  }
};

const slug = location.pathname.replace(/\/+$/,'').split('/').pop() || 'giappone';
const data = DATA[slug] || DATA.giappone;
const extraData = EXTRA[slug] || EXTRA.giappone;
document.body.classList.add('yhd-theme-' + data.theme);

if (slug === 'world') {
  document.body.classList.add('yhd-world-page');
  const concierge = document.getElementById('yhd-world-concierge');
  if (concierge) concierge.hidden = false;
  const gallerySection = document.querySelector('.yhd-section--gallery');
  if (gallerySection) gallerySection.hidden = true;
  const modelKicker = document.querySelector('#modello .yhd-kicker');
  if (modelKicker) modelKicker.textContent = '01 · Come lavoriamo';
  const mapKicker = document.querySelector('.yhd-section--map .yhd-kicker');
  if (mapKicker) mapKicker.textContent = 'Routing worldwide';
  const mapTitle = document.querySelector('.yhd-section--map h2');
  if (mapTitle) mapTitle.innerHTML = 'Dal mondo delle possibilità a <em>una rotta sensata.</em>';
  const primary = document.getElementById('yhd-primary-cta');
  if (primary) primary.textContent = 'Raccontateci la vostra richiesta →';
  const ghost = document.querySelector('.yhd-hero__actions .yhd-btn--ghost');
  if (ghost) { ghost.href = '#yhd-world-concierge'; ghost.textContent = 'Come funziona World'; }
}

const setHTML = (name,value) => {
  const el=document.querySelector('[data-yhd="'+name+'"]');
  if(el) el.innerHTML=value || '';
};
['eyebrow','title','lead','summary','duration','rhythm','style','introTitle','intro','quote','momentMain'].forEach(k=>setHTML(k,data[k]));
setHTML('finalKicker','YUME Honeymoon · '+data.label);

const visual=document.querySelector('[data-yhd-visual]');
if(visual && data.image){
  const img=document.createElement('img');
  img.src=data.image; img.alt=''; img.loading='eager';
  visual.prepend(img);
}
const route=document.getElementById('yhd-route');
if(route) route.innerHTML=data.stops.map((s,i)=>{
  const markerIndex=Array.isArray(extraData.stopMap) ? extraData.stopMap[i] : null;
  const interactive=Number.isInteger(markerIndex);
  return `<article class="yhd-stop"${interactive?` data-map-stop="${i}" tabindex="0" role="button" aria-label="Mostra ${s[1]} sulla mappa"`:''}><div class="yhd-stop__n">${s[0]}</div><div><small>${s[2]}</small><h3>${s[1]}</h3></div><p>${s[3]}</p></article>`;
}).join('');
const mapLead=document.querySelector('[data-yhd="mapLead"]');
if(mapLead) mapLead.textContent=extraData.mapLead || '';

const gallery=document.getElementById('yhd-gallery');
if(gallery) gallery.innerHTML=(extraData.gallery||[]).map((g,i)=>`<figure class="yhd-gallery__item ${i===0?'is-wide':''}"><img src="${g[0]}" alt="${g[1]}" loading="lazy"><figcaption>${g[1]}</figcaption></figure>`).join('');

const rhythm=document.getElementById('yhd-rhythm');
if(rhythm) {
  rhythm.innerHTML='<span class="yhd-rhythm__label">Journey Rhythm</span>'+(extraData.rhythm||[]).map((r,i)=>`<span class="yhd-rhythm__step"><i style="--level:${25+((i*17)%65)}%"></i><b>${r}</b></span>`).join('');
  if(extraData.logistics) rhythm.insertAdjacentHTML('afterend',`<p class="yhd-logistics-note"><strong>Logistica YUME:</strong> ${extraData.logistics}</p>`);
}

let map=null,markers=[];
if(window.L && document.getElementById('yhd-map') && extraData.coords?.length){
  map=L.map('yhd-map',{
    scrollWheelZoom:false,
    attributionControl:true,
    zoomControl:true,
    worldCopyJump:true
  });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    maxZoom:18,
    attribution:'&copy; OpenStreetMap contributors'
  }).addTo(map);

  const markerLatLngs=[];
  const routeLatLngs=(extraData.lineCoords || extraData.coords).map(p=>[p[0],p[1]]);

  const renderMapDetail=(pointIndex,stopIndex=null)=>{
    const point=extraData.coords[pointIndex];
    const box=document.getElementById('yhd-map-detail');
    if(!box||!point) return;

    if(Number.isInteger(stopIndex) && data.stops[stopIndex]){
      const stop=data.stops[stopIndex];
      box.innerHTML=`<span>${stop[0]} · ${stop[2]}</span><strong>${point[2]}</strong><p>${stop[3]}</p>`;
      return;
    }

    const detail=extraData.mapDetails?.[pointIndex];
    if(detail){
      box.innerHTML=`<span>Worldwide routing</span><strong>${detail[0]}</strong><p>${detail[1]}</p>`;
    } else {
      box.innerHTML=`<span>Mappa del viaggio</span><strong>${point[2]}</strong><p>${extraData.mapLead || ''}</p>`;
    }
  };

  extraData.coords.forEach((p,i)=>{
    const ll=[p[0],p[1]];
    markerLatLngs.push(ll);
    const icon=L.divIcon({
      className:'yhd-map-marker',
      html:`<span>${String(i+1).padStart(2,'0')}</span>`,
      iconSize:[36,36],
      iconAnchor:[18,18]
    });
    const m=L.marker(ll,{icon}).addTo(map);
    markers.push(m);

    let mappedStop=null;
    if(Array.isArray(extraData.stopMap)){
      const found=extraData.stopMap.findIndex(x=>x===i);
      if(found>=0) mappedStop=found;
    }

    m.bindPopup('<strong>'+p[2]+'</strong>');
    m.on('click',()=>{
      renderMapDetail(i,mappedStop);
      map.panTo(m.getLatLng(),{animate:true,duration:.35});
    });
  });

  if(extraData.connect!==false && routeLatLngs.length>1){
    L.polyline(routeLatLngs,{color:'#6D2340',weight:3,opacity:.8,dashArray:'8 9'}).addTo(map);
  }

  const fitMap=(animate=false)=>{
    const mobile=window.innerWidth<=560;
    const tablet=window.innerWidth<=900;
    const padding=mobile?[22,22]:tablet?[30,30]:[42,42];

    if(extraData.fitWorld){
      map.fitWorld({padding,animate});
    } else {
      map.fitBounds(L.latLngBounds(markerLatLngs),{
        padding,
        maxZoom:extraData.maxZoom || 5,
        animate
      });
    }
  };

  fitMap(false);
  renderMapDetail(0,Array.isArray(extraData.stopMap) ? extraData.stopMap.findIndex(x=>x===0) : null);

  document.querySelectorAll('[data-map-stop]').forEach(el=>{
    const stopIndex=Number(el.dataset.mapStop);
    const markerIndex=extraData.stopMap?.[stopIndex];
    const focus=()=>{
      if(!Number.isInteger(markerIndex)||!markers[markerIndex]) return;
      const target=markers[markerIndex];
      map.flyTo(target.getLatLng(),extraData.focusZoom || 6,{duration:.7});
      renderMapDetail(markerIndex,stopIndex);
      target.openPopup();
    };
    el.addEventListener('click',focus);
    el.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' '){
        e.preventDefault();
        focus();
      }
    });
  });

  let resizeTimer;
  window.addEventListener('resize',()=>{
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(()=>{
      map.invalidateSize({pan:false});
      fitMap(false);
    },140);
  },{passive:true});
}

const values=document.getElementById('yhd-values');
if(values) values.innerHTML=data.values.map(v=>`<article class="yhd-card"><span>${v[0]}</span><h3>${v[1]}</h3><p>${v[2]}</p></article>`).join('');
const moments=document.getElementById('yhd-moment-stack');
if(moments) moments.innerHTML=data.moments.map(m=>`<article class="yhd-moment"><small>${m[0]}</small><h3>${m[1]}</h3><p>${m[2]}</p></article>`).join('');

const params=new URLSearchParams({destination:data.label});
if(data.focus) params.set('focus',data.focus);
const formUrl='/honeymoon/?'+params.toString()+'#inizia';
['yhd-nav-cta','yhd-mobile-cta','yhd-primary-cta','yhd-final-cta'].forEach(id=>{const el=document.getElementById(id);if(el)el.href=formUrl;});

document.title=data.label+' | Esempio viaggio di nozze YUME Honeymoon';
const meta=document.querySelector('meta[name="description"]');
if(meta) meta.content='Un esempio di come YUME Honeymoon può trasformare '+data.label+' in un progetto di viaggio di nozze: ritmo, tappe, momenti di coppia e Wedding Journey Page.';
const canonical=document.getElementById('yhd-canonical');
if(canonical) canonical.href='https://yume-travel.com/honeymoon/'+slug+'/';
})();