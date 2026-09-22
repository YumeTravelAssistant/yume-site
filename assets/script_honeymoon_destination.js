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
    lead:'Il contrasto è il progetto: Giappone per intensità, cultura e scoperta; Polinesia per togliere progressivamente rumore, orari e decisioni.',
    summary:'Esempio di combinazione',
    duration:'20–24 giorni',
    rhythm:'Explore → slow',
    style:'Signature Journeys',
    introTitle:'Due mondi che hanno senso <em>solo se dialogano.</em>',
    intro:'Non sommiamo due destinazioni. Costruiamo una curva: il Giappone cresce per intensità e contenuto; la parte oceanica riduce progressivamente il ritmo. Il passaggio tra le due è progettato come parte del viaggio.',
    stops:[
      ['01','Tokyo','4 notti','Quartieri, food e contemporaneo: ingresso pieno di energia, con una giornata volutamente aperta.'],
      ['02','Kyoto','4 notti','Templi, artigianato, tè e una notte speciale. Qui il viaggio diventa più intimo.'],
      ['03','Giappone finale','2–3 notti','Una base scelta in funzione del volo e del vostro interesse: Osaka, ryokan, natura o una tappa lenta.'],
      ['04','Tahiti / transizione','1 notte','Il cambio di continente viene assorbito senza chiedervi subito di fare qualcosa.'],
      ['05','Isole','7–9 notti','Una o due isole, non una collezione. Mare, acqua, silenzio e strutture scelte in base a ciò che volete vivere.']
    ],
    values:[
      ['Contrasto','È il vero valore','La Polinesia pesa di più emotivamente perché arriva dopo un viaggio ricco e dinamico.'],
      ['Budget','Allocazione consapevole','Non tutte le notti devono costare allo stesso modo. Investiamo dove il contesto rende l’upgrade memorabile.'],
      ['YUME factor','Un unico progetto','Tempi, stanchezza, bagagli, trasferimenti e margini vengono letti come un unico viaggio, non due pratiche separate.']
    ],
    quote:'La parte più romantica non è il bungalow. È il momento in cui vi accorgete che <em>non dovete più correre.</em>',
    momentMain:'La combinazione funziona quando il Giappone non viene compresso e la Polinesia non viene trasformata in una seconda checklist.',
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
    eyebrow:'Honeymoon Atelier · Your World',
    title:'Prima di scegliere dove, <em>scegliamo cosa deve lasciarvi.</em>',
    lead:'World non è un catalogo infinito. È il contrario: partiamo da stagione, durata, desideri e budget, poi restringiamo il mondo fino a trovare una geografia che abbia senso per voi.',
    summary:'Metodo aperto',
    duration:'Da definire insieme',
    rhythm:'Su brief',
    style:'Atelier / Signature / NEXT',
    image:'/assets/deco_2.jpg',
    introTitle:'Il mondo è grande. <em>Il brief deve essere preciso.</em>',
    intro:'Quando la destinazione non è ancora chiara, non serve proporne venti. Serve capire quale contrasto cercate, quanta energia volete spendere, che rapporto avete con mare, natura, città e comfort.',
    stops:[
      ['01','Brief','30–45 min','Periodo, giorni disponibili, budget, esperienze irrinunciabili e ciò che volete evitare.'],
      ['02','Direzioni','2–3 ipotesi','Non preventivi generici: tre logiche di viaggio diverse, con pro e contro reali.'],
      ['03','Scelta','1 geografia','La destinazione emerge dopo il confronto tra desiderio, stagione, logistica e sostenibilità economica.'],
      ['04','Design','Itinerario','Basi, ritmo, trasporti, strutture ed esperienze vengono costruiti come un unico sistema.'],
      ['05','Wedding Journey','Pagina di coppia','Quando desiderata, la progettazione diventa anche racconto: itinerario, lista viaggio e partecipazione degli invitati.']
    ],
    values:[
      ['Metodo','Prima il perché','La domanda non è dove va di moda andare, ma quale esperienza volete ricordare insieme.'],
      ['Scelta','Riduciamo il rumore','Poche opzioni ben motivate valgono più di un catalogo di destinazioni.'],
      ['YUME factor','Atelier','Il viaggio viene trattato come progetto: briefing, comparazione, design e assistenza restano leggibili in ogni fase.']
    ],
    quote:'Non sapere ancora la destinazione non è un problema. È spesso il momento migliore per <em>progettare davvero.</em>',
    momentMain:'World serve proprio quando avete immagini, desideri o contrasti in testa ma non una destinazione definitiva.',
    moments:[
      ['Domanda 1','Che cosa deve cambiare?','Volete riposare, scoprire, muovervi, mangiare, stare nella natura o sentirvi lontanissimi?'],
      ['Domanda 2','Quanto volete decidere?','Alcune coppie amano una regia forte, altre preferiscono libertà con una struttura di sicurezza.'],
      ['Domanda 3','Dove investire?','Il budget viene allocato sui momenti che per voi hanno valore, non distribuito uniformemente.']
    ],
    focus:''
  }
};

const slug = location.pathname.replace(/\/+$/,'').split('/').pop() || 'giappone';
const data = DATA[slug] || DATA.giappone;
document.body.classList.add('yhd-theme-' + data.theme);

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
if(route) route.innerHTML=data.stops.map(s=>`<article class="yhd-stop"><div class="yhd-stop__n">${s[0]}</div><div><small>${s[2]}</small><h3>${s[1]}</h3></div><p>${s[3]}</p></article>`).join('');
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