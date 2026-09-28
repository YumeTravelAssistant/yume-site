(()=>{'use strict';

const STORAGE='yumeMissionControlPreviewV1';
const INTERNAL_AUTH_URL='https://hlikhyemzophandqkjdy.supabase.co';
const INTERNAL_AUTH_KEY='sb_publishable_Z5S66pZ85I3WlGuJDArJhA_QuXhKP51';
const INTERNAL_TOKEN_KEY='ymcInternalAccessToken';
const INTERNAL_ALLOWED_ROLES=new Set(['staff','admin']);
const CORPORATE_TOKEN_KEY='ymcCorporateAccessToken';
const PARTNER_STAGES=['Mapping','Contacted','Qualification','Pilot','Approved','Preferred'];

const YMC_UPLOAD_HARD_LIMIT_BYTES=400*1024;
const YMC_UPLOAD_TARGET_BYTES=380*1024;
const YMC_UPLOAD_MAX_INPUT_BYTES=30*1024*1024;
const YMC_PDFJS_MODULE='https://cdn.jsdelivr.net/npm/pdfjs-dist@5.6.205/legacy/build/pdf.mjs';
const YMC_PDFJS_WORKER='https://cdn.jsdelivr.net/npm/pdfjs-dist@5.6.205/legacy/build/pdf.worker.min.mjs';
const YMC_PDFLIB_MODULE='https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/+esm';
const YMC_PDF_PROFILES=[
  {scale:1.25,quality:.62,grayscale:false},{scale:1.05,quality:.52,grayscale:false},
  {scale:.90,quality:.44,grayscale:false},{scale:.78,quality:.36,grayscale:true},
  {scale:.66,quality:.29,grayscale:true},{scale:.55,quality:.23,grayscale:true},
  {scale:.45,quality:.18,grayscale:true},{scale:.36,quality:.13,grayscale:true},
  {scale:.29,quality:.10,grayscale:true}
];
const YMC_IMAGE_PROFILES=[
  {maxLongSide:1900,quality:.72,grayscale:false},{maxLongSide:1650,quality:.60,grayscale:false},
  {maxLongSide:1400,quality:.50,grayscale:false},{maxLongSide:1200,quality:.42,grayscale:true},
  {maxLongSide:1000,quality:.34,grayscale:true},{maxLongSide:850,quality:.28,grayscale:true},
  {maxLongSide:700,quality:.22,grayscale:true},{maxLongSide:560,quality:.17,grayscale:true}
];

function formatDocumentBytes(bytes){
  const n=Number(bytes)||0;if(n<=0)return '0 KB';
  return n<1024*1024?Math.round(n/1024)+' KB':(n/1024/1024).toFixed(2)+' MB';
}
function safeUploadBaseName(name){
  return (String(name||'documento').replace(/\.(pdf|jpe?g|png)$/i,'')||'documento').trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\w\-]+/g,'-')
    .replace(/-+/g,'-').replace(/^-|-$/g,'').toLowerCase()||'documento';
}
function uploadFormat(file){
  const mime=String(file.type||'').toLowerCase(),name=String(file.name||'').toLowerCase();
  if(mime==='application/pdf'||name.endsWith('.pdf'))return 'pdf';
  if(mime==='image/jpeg'||name.endsWith('.jpg')||name.endsWith('.jpeg'))return 'jpeg';
  if(mime==='image/png'||name.endsWith('.png'))return 'png';
  return null;
}
function canvasJpeg(canvas,quality){
  return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Impossibile generare il JPEG compresso.')),'image/jpeg',quality));
}
function grayscaleCanvas(ctx,w,h){
  const img=ctx.getImageData(0,0,w,h),px=img.data;
  for(let i=0;i<px.length;i+=4){const g=Math.round(px[i]*.299+px[i+1]*.587+px[i+2]*.114);px[i]=g;px[i+1]=g;px[i+2]=g}
  ctx.putImageData(img,0,0);
}
async function loadUploadImage(file){
  const url=URL.createObjectURL(file),img=new Image();img.decoding='async';img.src=url;
  try{if(typeof img.decode==='function')await img.decode();else await new Promise((res,rej)=>{img.onload=res;img.onerror=()=>rej(new Error('Il browser non riesce a leggere l’immagine.'))});return{img,cleanup:()=>URL.revokeObjectURL(url)}}catch(e){URL.revokeObjectURL(url);throw e}
}
async function compressMissionImage(file){
  const {img,cleanup}=await loadUploadImage(file);
  try{
    const sw=img.naturalWidth||img.width,sh=img.naturalHeight||img.height;if(!sw||!sh)throw new Error('Immagine senza dimensioni valide.');
    let smallest=null;
    for(const p of YMC_IMAGE_PROFILES){
      const scale=Math.min(1,p.maxLongSide/Math.max(sw,sh)),w=Math.max(1,Math.round(sw*scale)),h=Math.max(1,Math.round(sh*scale));
      const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw new Error('Canvas non disponibile.');
      ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(img,0,0,w,h);if(p.grayscale)grayscaleCanvas(ctx,w,h);
      const blob=await canvasJpeg(canvas,p.quality);if(!smallest||blob.size<smallest.size)smallest=blob;canvas.width=1;canvas.height=1;if(blob.size<=YMC_UPLOAD_TARGET_BYTES)return blob;
    }
    if(smallest&&smallest.size<=YMC_UPLOAD_HARD_LIMIT_BYTES)return smallest;
    throw new Error('Non è stato possibile portare l’immagine sotto 400 KB.');
  }finally{cleanup()}
}
async function compressMissionPdf(file){
  const pdfjs=await import(YMC_PDFJS_MODULE);pdfjs.GlobalWorkerOptions.workerSrc=YMC_PDFJS_WORKER;
  const source=await pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;
  try{
    if(source.numPages<1)throw new Error('Il PDF non contiene pagine.');
    const {PDFDocument}=await import(YMC_PDFLIB_MODULE);let smallest=null;
    for(const p of YMC_PDF_PROFILES){
      const out=await PDFDocument.create();
      for(let n=1;n<=source.numPages;n++){
        const page=await source.getPage(n),base=page.getViewport({scale:1}),view=page.getViewport({scale:p.scale});
        const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(view.width));canvas.height=Math.max(1,Math.round(view.height));
        const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw new Error('Canvas PDF non disponibile.');
        ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);await page.render({canvasContext:ctx,viewport:view}).promise;if(p.grayscale)grayscaleCanvas(ctx,canvas.width,canvas.height);
        const jpg=await canvasJpeg(canvas,p.quality),embedded=await out.embedJpg(await jpg.arrayBuffer()),op=out.addPage([base.width,base.height]);
        op.drawImage(embedded,{x:0,y:0,width:base.width,height:base.height});page.cleanup();canvas.width=1;canvas.height=1;
      }
      const bytes=await out.save({useObjectStreams:true}),blob=new Blob([bytes],{type:'application/pdf'});if(!smallest||blob.size<smallest.size)smallest=blob;if(blob.size<=YMC_UPLOAD_TARGET_BYTES)return blob;
    }
    if(smallest&&smallest.size<=YMC_UPLOAD_HARD_LIMIT_BYTES)return smallest;
    throw new Error('Non è stato possibile portare il PDF sotto 400 KB senza degradarlo eccessivamente.');
  }finally{await source.destroy()}
}
async function prepareMissionDocument(file){
  const format=uploadFormat(file);if(!format)throw new Error('Formato non supportato. Usa PDF, JPG, JPEG o PNG.');
  if(file.size<=0)throw new Error('Il file selezionato è vuoto.');
  if(file.size>YMC_UPLOAD_MAX_INPUT_BYTES)throw new Error('Il file originale supera 30 MB e non può essere elaborato.');
  const base=safeUploadBaseName(file.name);
  if(file.size<=YMC_UPLOAD_HARD_LIMIT_BYTES){
    const ext=format==='pdf'?'.pdf':format==='png'?'.png':'.jpg',mime=format==='pdf'?'application/pdf':format==='png'?'image/png':'image/jpeg';
    return{blob:file,fileName:base+ext,mimeType:mime,originalSizeBytes:file.size,storedSizeBytes:file.size,wasCompressed:false,notes:'[ORIGINAL_UNDER_400KB] '+file.name+' · '+file.size+' bytes'};
  }
  if(format==='pdf'){
    const blob=await compressMissionPdf(file);return{blob,fileName:base+'-compresso.pdf',mimeType:'application/pdf',originalSizeBytes:file.size,storedSizeBytes:blob.size,wasCompressed:true,notes:'[AUTO_COMPRESSED_PDF] '+file.name+' · '+file.size+' → '+blob.size+' bytes'};
  }
  const blob=await compressMissionImage(file);return{blob,fileName:base+'-compresso.jpg',mimeType:'image/jpeg',originalSizeBytes:file.size,storedSizeBytes:blob.size,wasCompressed:true,notes:'[AUTO_COMPRESSED_IMAGE] '+file.name+' · '+file.size+' → '+blob.size+' bytes'};
}
async function ymcDocumentUpload(partnerId,prepared){
  const form=new FormData();form.set('action','upload');form.set('partner_id',partnerId);
  form.set('file',new File([prepared.blob],prepared.fileName,{type:prepared.mimeType}));
  form.set('original_size_bytes',String(prepared.originalSizeBytes));form.set('was_compressed',String(prepared.wasCompressed));form.set('compression_note',prepared.notes);
  const res=await fetch(INTERNAL_AUTH_URL+'/functions/v1/ymc-partner-documents',{method:'POST',headers:{apikey:INTERNAL_AUTH_KEY,Authorization:'Bearer '+internalToken()},body:form});
  const data=await res.json().catch(()=>({}));if(!res.ok||!data?.ok)throw new Error(data?.error||('Upload non riuscito ('+res.status+').'));return data;
}
async function ymcDocumentAction(documentId,action){
  return ymcFetch('/functions/v1/ymc-partner-documents',{method:'POST',token:internalToken(),body:{action,document_id:documentId}});
}
async function openPartnerDocument(documentId,download=false){
  const popup=download?null:window.open('about:blank','_blank');
  if(popup){try{popup.opener=null;popup.document.title='Apertura documento…'}catch(_){}}
  try{
    const data=await ymcDocumentAction(documentId,download?'download':'open');if(!data?.url)throw new Error('URL documento non disponibile.');
    if(download){const a=document.createElement('a');a.href=data.url;a.rel='noopener';a.download=data.file_name||'documento';document.body.appendChild(a);a.click();a.remove();return}
    if(popup&&!popup.closed){popup.location.replace(data.url);return}
    window.location.assign(data.url);
  }catch(ex){if(popup&&!popup.closed)popup.close();throw ex}
}


async function ymcFetch(path,{method='GET',body=null,token=null,prefer=null}={}){
  const headers={'apikey':INTERNAL_AUTH_KEY,'Accept':'application/json'};
  if(token)headers.Authorization='Bearer '+token;
  if(body!==null)headers['Content-Type']='application/json';
  if(prefer)headers.Prefer=prefer;
  const res=await fetch(INTERNAL_AUTH_URL+path,{method,headers,body:body===null?undefined:JSON.stringify(body)});
  const text=await res.text();
  let data=null;
  try{data=text?JSON.parse(text):null}catch(_){data=text}
  if(!res.ok){
    const message=(data&&typeof data==='object'&&(data.message||data.error_description||data.error))||('HTTP '+res.status);
    throw new Error(String(message));
  }
  return data;
}
function internalToken(){return sessionStorage.getItem(INTERNAL_TOKEN_KEY)||''}
function corporateToken(){return sessionStorage.getItem(CORPORATE_TOKEN_KEY)||''}
function networkData(){return state.livePartners?.length?state.livePartners:DATA.network}
function clientOrg(){return state.clientOrganization||DATA.organization}
function activeMission(){return (state.clientMissions||[]).find(m=>m.id===state.activeMissionId)||(state.clientMissions||[])[0]||null}
function requestTypeLabel(type){
  const map={new_mission:'New Mission',itinerary:'Itinerary / Business Travel',partner_search:'Partner Search',introduction:'Business Introduction',business_meeting:'Business Meeting',interpreter:'Interpreter',market_research:'Market Research',factory_visit:'Factory Visit',fair_support:'Fair Support',recruiting_partner:'Recruiting / HR Partner',travel_change:'Travel Change',document_visa:'Documents / Visa',other:'Other'};
  return map[type]||type||'Request';
}
function requestStatusLabel(status){
  const map={submitted:'Submitted',reviewing:'Reviewing',need_info:'Need info',in_progress:'In progress',delivered:'Delivered',closed:'Closed',rejected:'Rejected'};
  return map[status]||status;
}
async function loadRequestMessages(requestId,token){
  if(!requestId||!token)return [];
  try{
    const rows=await ymcFetch('/rest/v1/ymc_request_messages?select=id,request_id,organization_id,sender_side,body,created_at&request_id=eq.'+encodeURIComponent(requestId)+'&order=created_at.asc',{token});
    state.requestMessages[requestId]=Array.isArray(rows)?rows:[];
    save();return state.requestMessages[requestId];
  }catch(ex){console.error('Request messages load failed',ex);return []}
}
async function loadCorporateLiveData(){
  const token=corporateToken(),org=clientOrg();
  if(!token||!org?.id)return false;
  try{
    const orgId=encodeURIComponent(org.id);
    const [missions,requests]=await Promise.all([
      ymcFetch('/rest/v1/ymc_missions?select=id,organization_id,mission_code,title,mission_type,sector,objective,desired_outcome,direction,target_markets,target_cities,date_start,date_end,date_flexibility,budget_band,participants_count,status,created_at,updated_at&organization_id=eq.'+orgId+'&order=created_at.desc',{token}),
      ymcFetch('/rest/v1/ymc_client_requests?select=id,organization_id,mission_id,request_type,service_scope,subject,description,sector,target_markets,target_profile,priority,status,created_at,updated_at&organization_id=eq.'+orgId+'&order=created_at.desc',{token})
    ]);
    state.clientMissions=Array.isArray(missions)?missions:[];
    state.clientRequests=Array.isArray(requests)?requests:[];
    if(state.activeMissionId&&!state.clientMissions.some(m=>m.id===state.activeMissionId))state.activeMissionId=null;
    if(!state.activeMissionId&&state.clientMissions.length)state.activeMissionId=state.clientMissions[0].id;
    save();return true;
  }catch(ex){console.error('Corporate live load failed',ex);return false}
}
function mapPartnerRow(r){
  return {id:r.id,externalKey:r.external_key||'',name:r.name,kind:r.kind||'',geo:r.geo||'',stage:r.stage||'Mapping',tier:r.tier||'',cap:r.capabilities||[],owner:r.owner||'',next:r.next_action||'',note:r.note||''};
}
async function loadInternalLiveData(){
  const token=internalToken();if(!token)return false;
  try{
    const [requests,partners,clientRequests,missions]=await Promise.all([
      ymcFetch('/rest/v1/ymc_access_requests?select=id,request_type,status,company_name,vat,rea,hq,website,sector,contact_name,contact_role,contact_email,contact_phone,use_case,submitted_at,reviewed_at,review_notes,demo_access_code&order=submitted_at.desc',{token}),
      ymcFetch('/rest/v1/ymc_partners?select=id,external_key,name,kind,geo,stage,tier,capabilities,owner,next_action,note,active,updated_at&active=eq.true&order=name.asc',{token}),
      ymcFetch('/rest/v1/ymc_client_requests?select=id,organization_id,mission_id,request_type,service_scope,subject,description,sector,target_markets,target_profile,priority,status,created_at,updated_at,ymc_organizations(legal_name)&order=created_at.desc',{token}),
      ymcFetch('/rest/v1/ymc_missions?select=id,organization_id,mission_code,title,mission_type,sector,objective,desired_outcome,target_markets,status,created_at,ymc_organizations(legal_name)&order=created_at.desc',{token})
    ]);
    state.liveAccessRequests=Array.isArray(requests)?requests:[];
    state.livePartners=Array.isArray(partners)?partners.map(mapPartnerRow):[];
    state.internalClientRequests=Array.isArray(clientRequests)?clientRequests:[];
    state.internalMissions=Array.isArray(missions)?missions:[];
    state.liveLoaded=true;save();return true;
  }catch(ex){console.error('Mission Control live load failed',ex);state.liveLoaded=false;return false}
}
function mapPartnerDocument(x){
  return {id:x.id,fileName:x.file_name,mimeType:x.mime_type||'',size:Number(x.file_size)||0,originalSize:Number(x.original_size_bytes)||Number(x.file_size)||0,wasCompressed:!!x.was_compressed,compressionNote:x.compression_note||'',status:x.status,createdAt:x.created_at};
}
async function loadPartnerDocuments(id){
  const token=internalToken();if(!token||!id)return false;
  try{
    const q=encodeURIComponent(id);
    const docs=await ymcFetch('/rest/v1/ymc_partner_documents?select=id,file_name,mime_type,file_size,original_size_bytes,was_compressed,compression_note,status,created_at&partner_id=eq.'+q+'&status=eq.uploaded&order=created_at.desc',{token});
    state.partnerDocs[id]=(Array.isArray(docs)?docs:[]).map(mapPartnerDocument);
    save();
    return true;
  }catch(ex){
    console.error('Partner document load failed',ex);
    return false;
  }
}
async function loadPartnerWorkspaceData(id){
  const token=internalToken();if(!token||!id)return;
  const q=encodeURIComponent(id);
  const results=await Promise.allSettled([
    ymcFetch('/rest/v1/ymc_partner_contacts?select=id,name,role,email,phone,created_at&partner_id=eq.'+q+'&order=created_at.asc',{token}),
    ymcFetch('/rest/v1/ymc_partner_tickets?select=id,title,owner,status,priority,due_date,created_at&partner_id=eq.'+q+'&order=created_at.desc',{token}),
    ymcFetch('/rest/v1/ymc_partner_requests?select=id,request_type,subject,status,owner,created_at&partner_id=eq.'+q+'&order=created_at.desc',{token}),
    ymcFetch('/rest/v1/ymc_partner_events?select=id,event_type,title,detail,created_at&partner_id=eq.'+q+'&order=created_at.asc',{token})
  ]);
  const [contacts,tickets,requests,events]=results;
  if(contacts.status==='fulfilled')state.partnerContacts[id]=(contacts.value||[]).map(x=>({name:x.name,role:x.role||'',email:x.email||'',phone:x.phone||''}));
  else console.error('Partner contacts load failed',contacts.reason);
  if(tickets.status==='fulfilled')state.partnerTickets[id]=(tickets.value||[]).map(x=>({id:x.id,title:x.title,owner:x.owner||'',status:x.status,priority:x.priority,due:x.due_date||'—'}));
  else console.error('Partner tickets load failed',tickets.reason);
  if(requests.status==='fulfilled')state.partnerRequests[id]=(requests.value||[]).map(x=>({id:x.id,type:x.request_type,subject:x.subject,status:x.status,owner:x.owner||''}));
  else console.error('Partner requests load failed',requests.reason);
  if(events.status==='fulfilled')state.partnerTimeline[id]=(events.value||[]).map(x=>({date:new Date(x.created_at).toLocaleDateString('it-IT'),title:x.title,detail:x.detail||'',type:x.event_type}));
  else console.error('Partner events load failed',events.reason);
  await loadPartnerDocuments(id);
  save();
}

const DATA={
  organization:{name:'Aurea Italia S.r.l.',short:'Aurea Italia',industry:'Wine & Spirits',member:'Alessandro Rinaldi',role:'Corporate Admin'},
  mission:{
    id:'YM-DEMO-27W01',name:'Japan Market Entry · Wine & Spirits',phase:'Architecture',period:'12–18 April 2027',
    purpose:'Sourcing & partners',outcome:'Qualificare controparti distributive e costruire una shortlist prioritaria per il follow-up commerciale.',
    sector:'Wine & Spirits',budget:'€18.500',participants:4,seniority:'Founder / proprietà',
    route:['Tokyo','Nagoya / Chūbu','Osaka / Kansai'],
    modules:['Business roadshow','Buyer meetings','Retail intelligence','Tasting B2B'],
    health:{Brief:100,Agenda:64,Travel:42,Documents:78,Budget:55},
    nextMilestone:'Partner shortlist · 20 ottobre',
    owner:'Gaia · YUME Works'
  },
  decisions:[
    {id:'d1',title:'Confermare Osaka / Kansai',status:'required',due:'16 ottobre',impact:'+1 notte · + trasferimento',recommendation:'Includere Kansai solo se vengono qualificati almeno due interlocutori rilevanti.',detail:'La tappa aggiunge valore se sostiene davvero l’outcome distributivo. Altrimenti aumenta complessità, costi e trasferimenti senza aumentare la qualità della missione.'},
    {id:'d2',title:'Interpretariato per buyer meetings',status:'open',due:'22 ottobre',impact:'Stima €780',recommendation:'Prevedere interprete business per i meeting prioritari.',detail:'La presenza linguistica va calibrata sui meeting: non tutti richiedono interpretariato dedicato. La priorità è proteggere le conversazioni ad alto valore.'},
    {id:'d3',title:'Tasting professionale Tokyo',status:'approved',due:'10 ottobre',impact:'Approvato',recommendation:'Confermato come modulo centrale.',detail:'Il tasting entra nella mission architecture come momento B2B, non come esperienza leisure.'}
  ],
  agenda:[
    {day:'Mon 12',time:'15:30',title:'Arrival & mission briefing',place:'Tokyo · Marunouchi',status:'confirmed',owner:'YUME',type:'Mission'},
    {day:'Tue 13',time:'09:30',title:'Retail intelligence walk',place:'Tokyo · Ginza / Nihombashi',status:'confirmed',owner:'YUME',type:'Intelligence'},
    {day:'Tue 13',time:'14:30',title:'Buyer meeting · slot A',place:'Tokyo',status:'pending',owner:'YUME Network',type:'Meeting'},
    {day:'Wed 14',time:'10:00',title:'Importer / distributor meeting',place:'Tokyo',status:'pending',owner:'YUME Network',type:'Meeting'},
    {day:'Thu 15',time:'11:00',title:'Chūbu ecosystem module',place:'Nagoya',status:'design',owner:'YUME',type:'Architecture'},
    {day:'Fri 16',time:'10:30',title:'Kansai business roadshow',place:'Osaka',status:'decision',owner:'Client + YUME',type:'Decision'}
  ],
  participants:[
    {name:'Alessandro Rinaldi',role:'Founder',travel:'Ready',documents:'Ready',dietary:'—'},
    {name:'Giulia Ferri',role:'Commercial Director',travel:'Ready',documents:'Passport check',dietary:'Vegetarian'},
    {name:'Marco Lodi',role:'Export Manager',travel:'Pending',documents:'Ready',dietary:'—'},
    {name:'Elena Serra',role:'Brand Director',travel:'Ready',documents:'Ready',dietary:'Lactose free'}
  ],
  travel:[
    {type:'Flight',title:'Milan → Tokyo',detail:'Intercontinental · option not yet issued',status:'option'},
    {type:'Hotel',title:'Tokyo · 3 nights',detail:'Business district · breakfast · meeting-friendly',status:'shortlist'},
    {type:'Rail',title:'Tokyo → Nagoya → Osaka',detail:'Shinkansen architecture · luggage strategy',status:'design'},
    {type:'Transfer',title:'Arrival + business transfers',detail:'Private where mission timing requires it',status:'design'},
    {type:'Hotel',title:'Osaka · 2 nights',detail:'Depends on Kansai decision',status:'blocked'}
  ],
  documents:[
    {id:'doc1',type:'PDF',title:'Executive Mission Book',version:'v1',visibility:'Client + YUME',status:'Current'},
    {id:'doc2',type:'DOC',title:'Company Profile · EN',version:'Draft',visibility:'Client + selected partners',status:'Review'},
    {id:'doc3',type:'PDF',title:'Mission Proposal',version:'Pending',visibility:'Client + YUME',status:'Not issued'},
    {id:'doc4',type:'XLS',title:'Participant Matrix',version:'v2',visibility:'YUME operations',status:'Internal'},
    {id:'doc5',type:'PDF',title:'Meeting Brief Template',version:'v1',visibility:'Client + YUME',status:'Current'},
    {id:'doc6',type:'NDA',title:'NDA Template',version:'Template',visibility:'By project',status:'Ready'}
  ],
  financials:{
    value:18500,paid:6500,next:6000,nextDate:'15 January 2027',
    rows:[{label:'Mission design & project management',value:4800},{label:'Travel & hospitality envelope',value:8700},{label:'Interpretation / local services reserve',value:2400},{label:'Approved contingencies',value:2600}]
  },
  followups:[
    {company:'Partner candidate A',status:'Priority',next:'Send technical deck',owner:'Client',due:'+2 days'},
    {company:'Partner candidate B',status:'Warm',next:'YUME to coordinate second call',owner:'YUME',due:'+7 days'},
    {company:'Retail contact C',status:'Observe',next:'No action before mission',owner:'—',due:'—'}
  ],
  visiblePartners:[
    {role:'Local operations partner',geo:'Japan',status:'To be selected',note:'Ground execution, transfers, local support.'},
    {role:'Business interpreter',geo:'Tokyo / Kansai',status:'Qualification',note:'Language support for selected priority meetings.'},
    {role:'Market specialist',geo:'Japan',status:'Optional module',note:'Activated only if the business case requires specialist research.'}
  ],
  network:[
    {id:'p1',name:'ICCJ · Camera di Commercio Italiana in Giappone',kind:'Institutional node',geo:'Japan',stage:'Da contattare',tier:'Target',cap:['Networking','Business ecosystem','Events'],owner:'Alessio',next:'Preparare introduction & collaboration framing',note:'Target di relazione istituzionale. Nessuna partnership implicata.'},
    {id:'p2',name:'JNTO / JATA mapping',kind:'Travel trade ecosystem',geo:'Japan',stage:'Da contattare',tier:'Target',cap:['Destination trade','Tourism network','DMC discovery'],owner:'Gaia',next:'Aprire il contatto trade e mappare DMC locali',note:'Canale potenziale per ampliare la conoscenza del network travel locale.'},
    {id:'p3',name:'Japan DMC · Candidate A',kind:'DMC',geo:'Tokyo / Nationwide',stage:'Da contattare',tier:'Candidate',cap:['Ground handling','Corporate groups','Transport','Guides'],owner:'Operations',next:'Richiedere capability deck e condizioni commerciali',note:'Nome oscurato in preview. Nessun rapporto attivo ancora registrato.'},
    {id:'p4',name:'Japan DMC · Candidate B',kind:'DMC',geo:'Kansai / Nationwide',stage:'Da contattare',tier:'Candidate',cap:['MICE','Business travel','Venues','Transfers'],owner:'Operations',next:'Organizzare primo contatto',note:'Seconda opzione per evitare single-source dependency.'},
    {id:'p5',name:'JETRO / EU-Japan ecosystem',kind:'Business support mapping',geo:'Japan / EU',stage:'Da contattare',tier:'External ecosystem',cap:['Market entry resources','Business matching','Research'],owner:'Business Design',next:'Mappare strumenti pubblici e opportunità non-overlap',note:'Risorsa/ecosistema esterno; non presentato come partner YUME.'},
    {id:'p6',name:'Technical interpreter pool',kind:'Specialist network',geo:'Japan',stage:'Da contattare',tier:'Candidate pool',cap:['Automotive','Manufacturing','Business'],owner:'Operations',next:'Costruire prima shortlist qualificata',note:'Network da approfondire seguendo la domanda reale.'}
  ],
  coverage:[
    {label:'Institutional · Japan',value:55,state:'Developing'},
    {label:'DMC · Japan',value:46,state:'Developing'},
    {label:'Business interpreters',value:38,state:'Early'},
    {label:'Food & Wine',value:32,state:'Early'},
    {label:'Automotive / Manufacturing',value:18,state:'Not developed'},
    {label:'Tech / AI / Research',value:22,state:'Early'},
    {label:'Korea',value:10,state:'Exploration'},
    {label:'Singapore / APAC',value:8,state:'Exploration'}
  ],
  partnerPipeline:[
    {stage:'Da contattare',count:6,detail:'Target identificati · nessun contatto registrato'},
    {stage:'Primo contatto',count:0,detail:'Introduzione o primo scambio avvenuto'},
    {stage:'In valutazione',count:0,detail:'Capability, referenti e condizioni in verifica'},
    {stage:'Trattativa',count:0,detail:'Termini, SLA o accordo in discussione'},
    {stage:'Pilot',count:0,detail:'Validazione su progetto reale'},
    {stage:'Accordo attivo',count:0,detail:'Rapporto formalizzato e utilizzabile'}
  ],
  roadmap:[
    {period:'TTG 2026',title:'Demo-ready operating story',items:['Controlled access workflow','Mission Control UX','YUME Network view','Japan Core + Asia Extension']},
    {period:'POST-TTG',title:'Production foundation',items:['Supabase Auth + MFA','Organization / Membership','Private document storage','Audit & permission model']},
    {period:'PILOT',title:'Real corporate missions',items:['1–3 projects','Partner qualification pilots','Measure real usage','Refine document pack']},
    {period:'BIT',title:'Enterprise-ready layer',items:['Network intelligence','Partner scoring','Client account history','SSO / WorkOS readiness if required']}
  ],
  asia:[
    {name:'South Korea',hub:'Seoul',role:'Tech · consumer · beauty',state:'Exploration',note:'Estensione solo quando completa il business case giapponese o crea confronto utile.'},
    {name:'Singapore',hub:'APAC',role:'Regional HQ · digital gateway',state:'Exploration',note:'Hub regionale per headquarters, servizi, fintech e innovation.'},
    {name:'Hong Kong',hub:'Greater China',role:'Trade · finance · distribution',state:'Exploration',note:'Nodo commerciale da usare con logica selettiva e progetto-specifica.'},
    {name:'Taiwan',hub:'Taipei',role:'Electronics · supply chain',state:'Exploration',note:'Rilevante per elettronica, semiconduttori e filiere tecnologiche.'}
  ],
  onboardingReview:[
    {company:'Nuova Impresa Demo S.r.l.',vat:'IT01122334455',admin:'Laura Bianchi',docs:'3/3',status:'Ready for review',risk:'Standard'},
    {company:'Demo Industrial S.p.A.',vat:'IT09876543210',admin:'Marta Conti',docs:'2/3',status:'Missing delegation',risk:'Standard'}
  ]
};

const CLIENT_NAV=[
  ['overview','◎','Overview'],['company','⌂','Company'],['mission','◇','Mission'],['agenda','◫','Agenda'],['decisions','✓','Decisions'],
  ['participants','○','People'],['travel','↗','Travel'],['documents','▤','Documents'],['financials','€','Financials'],['followup','↺','Follow-up']
];
const PLATFORM_CLIENT_NAV=[
  ['overview','◎','Home'],
  ['mission','◇','Missions'],
  ['requests','↗','Requests'],
  ['networkClient','⌁','Network'],
  ['company','⌂','Company']
];
const INTERNAL_NAV=[
  ['network','◎','Network'],['clientDesk','↗','Client Desk'],['onboarding','⌂','Onboarding'],['partners','◇','Partners'],['coverage','◫','Coverage'],['pipeline','↗','Pipeline'],['roadmap','↺','Roadmap'],['access','⌁','Access architecture']
];

let state=loadState();
if(state.role==='internal'&&!sessionStorage.getItem(INTERNAL_TOKEN_KEY))state=baseState();
let toastTimer=null;

function loadState(){
  const base=baseState();
  try{
    const raw=localStorage.getItem(STORAGE);
    if(raw){
      const s=JSON.parse(raw);
      return {...base,...s,
        decisionStatus:{...base.decisionStatus,...(s.decisionStatus||{})},
        partnerStatuses:{...base.partnerStatuses,...(s.partnerStatuses||{})},
        partnerContacts:{...base.partnerContacts,...(s.partnerContacts||{})},
        partnerTickets:{...base.partnerTickets,...(s.partnerTickets||{})},
        partnerRequests:{...base.partnerRequests,...(s.partnerRequests||{})},
        partnerTimeline:{...base.partnerTimeline,...(s.partnerTimeline||{})},
        partnerDocs:{...base.partnerDocs,...(s.partnerDocs||{})}
      };
    }
  }catch(_){}
  return base;
}
function baseState(){
  const partnerStatuses=Object.fromEntries(DATA.network.map(p=>[p.id,p.stage||'Mapping']));
  const partnerTickets=Object.fromEntries(DATA.network.map(p=>[p.id,[]]));
  const partnerTimeline=Object.fromEntries(DATA.network.map(p=>[p.id,[{date:'Oggi',title:'Record locale',detail:'Fallback locale finché il backend non risponde.',type:'System'}]]));
  return{
    session:false,onboarding:false,onboardingType:'demo',onboardingStep:1,onboardingSubmitted:false,
    onboardingResult:null,onboardingForm:{company:'',vat:'',rea:'',hq:'',website:'',sector:'',contact_name:'',contact_role:'',contact_email:'',contact_phone:'',use_case:''},
    role:'client',section:'overview',activePartnerId:null,decisionStatus:{d1:'required',d2:'open',d3:'approved'},
    sidebar:false,drawer:false,uploadedDocs:{},partnerStatuses,partnerContacts:{},partnerTickets,
    partnerRequests:{},partnerTimeline,partnerDocs:{},liveAccessRequests:[],livePartners:[],liveLoaded:false,
    internalClientRequests:[],internalMissions:[],
    clientMode:'demo',clientOrganization:null,clientMissions:[],clientRequests:[],requestMessages:{},
    activeMissionId:null,activeClientRequestId:null,activeInternalRequestId:null,quickRequestType:null
  };
}
function save(){
  try{
    const persisted={...state,partnerDocs:{}};
    localStorage.setItem(STORAGE,JSON.stringify(persisted));
  }catch(_){}
}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function money(v){return new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(v)}
function el(sel,root=document){return root.querySelector(sel)}
function els(sel,root=document){return [...root.querySelectorAll(sel)]}
function statusLabel(status){
  const map={confirmed:['Confirmed','green'],pending:['Awaiting confirmation','amber'],design:['In design',''],decision:['Decision required','red'],option:['Option','amber'],shortlist:['Shortlist',''],blocked:['Blocked by decision','red'],required:['Decision required','red'],open:['Open','amber'],approved:['Approved','green']};
  return map[status]||[status,''];
}
function chip(status){
  const [label,tone]=statusLabel(status);
  return '<span class="ymc-chip '+(tone?'is-'+tone:'')+'"><i></i>'+esc(label)+'</span>';
}
function pageHead(kicker,title,copy,actions=''){
  return '<header class="ymc-page-head"><div><span class="ymc-section-label">'+esc(kicker)+'</span><h1>'+title+'</h1><p>'+copy+'</p></div><div class="ymc-page-head-actions">'+actions+'</div></header>';
}
function setRole(role){
  if(role==='internal'&&!sessionStorage.getItem(INTERNAL_TOKEN_KEY))return openInternalLogin();
  state.role=role==='internal'?'internal':'client';
  state.section=state.role==='client'?'overview':'network';
  state.sidebar=false;closeDrawer();save();render();
}
function setSection(section){
  if(section!=='partnerWorkspace')state.activePartnerId=null;
  state.section=section;state.sidebar=false;save();render();requestAnimationFrame(()=>el('#ymc-main')?.focus({preventScroll:true}));
}
function partnerStatus(id){
  const p=networkData().find(x=>x.id===id);
  return p?.stage||state.partnerStatuses?.[id]||'Mapping';
}
async function openPartnerWorkspace(id){
  state.activePartnerId=id;state.section='partnerWorkspace';state.sidebar=false;closeDrawer();save();render();
  await loadPartnerWorkspaceData(id);
  render();requestAnimationFrame(()=>el('#ymc-main')?.focus({preventScroll:true}));
}
function addPartnerTimeline(id,title,detail,type='Team'){
  state.partnerTimeline=state.partnerTimeline||{};
  state.partnerTimeline[id]=[...(state.partnerTimeline[id]||[]),{date:new Date().toLocaleDateString('it-IT'),title,detail,type}];
}
async function updatePartnerStatus(id,status){
  const token=internalToken();
  if(token){
    try{
      await ymcFetch('/rest/v1/rpc/ymc_update_partner_stage',{method:'POST',token,body:{p_partner_id:id,p_stage:status}});
      const p=state.livePartners.find(x=>x.id===id);if(p)p.stage=status;
      addPartnerTimeline(id,'Stato rapporto aggiornato',status,'Status');
      await loadPartnerWorkspaceData(id);save();render();toast('Stato partner salvato: '+status);return;
    }catch(ex){toast('Errore salvataggio stato: '+ex.message);return}
  }
  state.partnerStatuses[id]=status;addPartnerTimeline(id,'Stato rapporto aggiornato',status,'Status');save();render();
}
function toast(msg){
  const t=el('[data-ymc-toast]');if(!t)return;
  t.textContent=msg;t.classList.add('is-visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('is-visible'),2600);
}
function updateDecision(id,status){
  state.decisionStatus[id]=status;save();render();toast(status==='approved'?'Decisione registrata nella preview.':'Stato aggiornato nella preview.');
}
function openDrawer(type,id){
  state.drawer={type,id};
  const drawer=el('[data-ymc-drawer]'),back=el('[data-ymc-drawer-backdrop]'),content=el('[data-ymc-drawer-content]');
  content.innerHTML=drawerContent(type,id);drawer.classList.add('is-open');drawer.setAttribute('aria-hidden','false');back.classList.add('is-open');bindDynamic();
}
function closeDrawer(){
  state.drawer=false;el('[data-ymc-drawer]')?.classList.remove('is-open');el('[data-ymc-drawer]')?.setAttribute('aria-hidden','true');el('[data-ymc-drawer-backdrop]')?.classList.remove('is-open');
}
function drawerContent(type,id){
  if(type==='decision'){
    const d=DATA.decisions.find(x=>x.id===id);if(!d)return'';
    return '<span class="ymc-section-label">DECISION DETAIL</span><h2 class="ymc-drawer-title">'+esc(d.title)+'</h2><p class="ymc-drawer-copy">'+esc(d.detail)+'</p>'+
      '<div class="ymc-drawer-section"><h4>YUME recommendation</h4><p class="ymc-drawer-copy">'+esc(d.recommendation)+'</p></div>'+
      '<div class="ymc-drawer-section"><dl><div><dt>Due</dt><dd>'+esc(d.due)+'</dd></div><div><dt>Impact</dt><dd>'+esc(d.impact)+'</dd></div><div><dt>Status</dt><dd>'+esc(state.decisionStatus[d.id]||d.status)+'</dd></div></dl></div>';
  }
  if(type==='partner'){
    const p=networkData().find(x=>x.id===id);if(!p)return'';
    return '<span class="ymc-section-label">PARTNER REGISTRY · QUICK VIEW</span><h2 class="ymc-drawer-title">'+esc(p.name)+'</h2><p class="ymc-drawer-copy">'+esc(p.note)+'</p>'+
      '<div class="ymc-drawer-section"><dl><div><dt>Type</dt><dd>'+esc(p.kind)+'</dd></div><div><dt>Geography</dt><dd>'+esc(p.geo)+'</dd></div><div><dt>Stato</dt><dd>'+esc(partnerStatus(p.id))+'</dd></div><div><dt>Tier</dt><dd>'+esc(p.tier)+'</dd></div><div><dt>YUME owner</dt><dd>'+esc(p.owner)+'</dd></div></dl></div>'+
      '<div class="ymc-drawer-section"><h4>Capabilities</h4><div class="ymc-partner-capabilities">'+p.cap.map(x=>'<span>'+esc(x)+'</span>').join('')+'</div></div>'+
      '<div class="ymc-drawer-section"><h4>Next action</h4><p class="ymc-drawer-copy">'+esc(p.next)+'</p></div>'+
      '<div class="ymc-drawer-section"><button type="button" class="ymc-btn ymc-btn--dark" data-ymc-open-partner="'+p.id+'">Apri Partner Workspace →</button></div>';
  }
  if(type==='agenda'){
    const a=DATA.agenda[Number(id)];if(!a)return'';
    return '<span class="ymc-section-label">AGENDA ITEM</span><h2 class="ymc-drawer-title">'+esc(a.title)+'</h2><p class="ymc-drawer-copy">'+esc(a.place)+' · '+esc(a.day)+' · '+esc(a.time)+'</p>'+
      '<div class="ymc-drawer-section"><dl><div><dt>Owner</dt><dd>'+esc(a.owner)+'</dd></div><div><dt>Type</dt><dd>'+esc(a.type)+'</dd></div><div><dt>Status</dt><dd>'+esc(statusLabel(a.status)[0])+'</dd></div></dl></div>'+
      '<div class="ymc-drawer-section"><h4>Why it exists</h4><p class="ymc-drawer-copy">Ogni attività deve essere collegata all’outcome della missione e avere owner, stato e follow-up. Questo dettaglio è il punto di partenza per la scheda operativa reale.</p></div>';
  }
  return'';
}
function renderNav(){
  const clientNav=state.clientMode==='platform'?PLATFORM_CLIENT_NAV:CLIENT_NAV;
  const nav=state.role==='client'?clientNav:INTERNAL_NAV;
  const n=el('[data-ymc-nav]');
  n.innerHTML=nav.map(([id,icon,label])=>'<button type="button" data-ymc-section="'+id+'" class="'+(state.section===id?'is-active':'')+'"><span>'+icon+'</span>'+esc(label)+'</button>').join('');
  const mobile=el('[data-ymc-mobile-nav]');
  const picks=state.role==='client'
    ?(state.clientMode==='platform'?[clientNav[0],clientNav[1],clientNav[2],clientNav[3]]:[CLIENT_NAV[0],CLIENT_NAV[3],CLIENT_NAV[4],CLIENT_NAV[7]])
    :[INTERNAL_NAV[0],INTERNAL_NAV[1],INTERNAL_NAV[2],INTERNAL_NAV[3]];
  mobile.innerHTML=picks.map(([id,icon,label])=>'<button type="button" data-ymc-section="'+id+'" class="'+(state.section===id?'is-active':'')+'"><span>'+icon+'</span>'+esc(label)+'</button>').join('')+
    '<button type="button" data-ymc-open-menu><span>•••</span>More</button>';
}
function renderTopbar(){
  const missionId=el('[data-ymc-mission-id]'),projectName=el('[data-ymc-project-name]'),projectMenu=el('[data-ymc-project-menu]'),sync=el('[data-ymc-sync]');
  if(state.role==='client'&&state.clientMode==='platform'){
    const m=activeMission();
    if(missionId)missionId.textContent=m?.mission_code||'NO ACTIVE MISSION';
    if(projectName)projectName.textContent=m?.title||'Create or request a mission';
    if(sync)sync.innerHTML='<i></i> Live data';
    if(projectMenu)projectMenu.innerHTML=(state.clientMissions||[]).length
      ?state.clientMissions.map(x=>'<button type="button" data-ymc-select-mission="'+x.id+'" class="'+(m?.id===x.id?'is-active':'')+'"><span>'+esc(x.mission_code)+'</span><b>'+esc(x.title)+'</b><small>'+esc(x.status)+'</small></button>').join('')
      :'<button type="button" data-ymc-section="mission"><span>NO MISSION</span><b>Start a business mission</b><small>Submit a new project to YUME</small></button>';
    return;
  }
  if(state.role==='internal'){
    if(missionId)missionId.textContent='YUME INTERNAL';
    if(projectName)projectName.textContent=state.section==='clientDesk'?'Client Desk':'Network & Operations';
    if(sync)sync.innerHTML='<i></i> Live data';
    if(projectMenu)projectMenu.innerHTML='<button type="button" data-ymc-section="clientDesk"><span>OPERATIONS</span><b>Client Desk</b><small>Mission & service requests</small></button><button type="button" data-ymc-section="network"><span>NETWORK</span><b>Partner Registry</b><small>Internal intelligence</small></button>';
    return;
  }
  if(missionId)missionId.textContent=DATA.mission.id;
  if(projectName)projectName.textContent=DATA.mission.name;
  if(sync)sync.innerHTML='<i></i> Demo data';
}
function renderRole(){
  const org=clientOrg();
  el('[data-ymc-avatar]').textContent=state.role==='client'?String(org.short||org.name||'CO').slice(0,2).toUpperCase():'YU';
  el('[data-ymc-profile-name]').textContent=state.role==='client'?(org.short||org.name||'Corporate'):'YUME Works Team';
  el('[data-ymc-profile-role]').textContent=state.role==='client'?(state.clientMode==='platform'?'Corporate Admin · Platform':'Corporate Admin · Demo'):'Internal Operations · Live';
}
function render(){
  el('[data-ymc-gate]').hidden=state.session||state.onboarding;
  el('[data-ymc-onboarding]').hidden=!state.onboarding;
  el('[data-ymc-app]').hidden=!state.session;
  const sidebarOpen=!!state.session&&!!state.sidebar;
  el('[data-ymc-sidebar]')?.classList.toggle('is-open',sidebarOpen);
  el('[data-ymc-sidebar-backdrop]')?.classList.toggle('is-open',sidebarOpen);
  document.body.classList.toggle('ymc-nav-open',sidebarOpen);
  if(state.onboarding){renderOnboarding();return;}
  if(!state.session)return;
  renderNav();renderRole();renderTopbar();
  const content=el('[data-ymc-content]');
  content.innerHTML=state.role==='client'?renderClient(state.section):renderInternal(state.section);
  bindDynamic();
}
function renderClient(section){
  if(state.clientMode==='platform')return renderPlatformClient(section);
  const map={overview:clientOverview,company:clientCompany,mission:clientMission,agenda:clientAgenda,decisions:clientDecisions,participants:clientParticipants,travel:clientTravel,documents:clientDocuments,financials:clientFinancials,followup:clientFollowup};
  return (map[section]||clientOverview)();
}
function renderPlatformClient(section){
  const org=clientOrg();
  if(section==='overview'){
    return pageHead('CORPORATE PLATFORM · LIVE','Benvenuti in <em>'+esc(org.name||'Mission Control')+'.</em>','Organization e Membership sono reali. I moduli missione restano vuoti finché YUME non assegna un progetto operativo.')+
      '<section class="ymc-grid ymc-grid--4"><article class="ymc-card ymc-stat"><span>ORGANIZATION</span><strong>Active</strong><small>'+esc(org.name||'—')+'</small></article><article class="ymc-card ymc-stat"><span>MEMBERSHIP</span><strong>Corporate Admin</strong><small>Supabase Auth nominativo</small></article><article class="ymc-card ymc-stat"><span>MISSIONS</span><strong>0</strong><small>Nessuna missione assegnata</small></article><article class="ymc-card ymc-stat"><span>DATA MODE</span><strong>LIVE</strong><small>Nessun dato Demo mischiato</small></article></section>'+
      '<section class="ymc-card ymc-card--brass" style="margin-top:12px"><span class="ymc-section-label">NEXT STEP</span><h2>Workspace pronto.</h2><p>YUME può ora collegare una missione reale a questa Organization. Fino a quel momento agenda, travel, documenti, decisioni, partecipanti e financials restano intenzionalmente vuoti.</p></section>';
  }
  if(section==='company'){
    return pageHead('COMPANY','Organization <em>verified.</em>','Profilo corporate legato alla Membership attiva.')+
      '<section class="ymc-card"><span class="ymc-section-label">LEGAL ORGANIZATION</span><h2>'+esc(org.name||'—')+'</h2><p>Corporate Admin: '+esc(org.member||'—')+'</p><div class="ymc-route"><span>Organization</span><i>→</i><span>Membership</span><i>→</i><span>Mission</span></div></section>';
  }
  const labels={mission:'Mission',agenda:'Agenda',decisions:'Decisions',participants:'Participants',travel:'Travel',documents:'Documents',financials:'Financials',followup:'Follow-up'};
  const label=labels[section]||'Workspace';
  return pageHead(label.toUpperCase(),label+' <em>workspace.</em>','Modulo disponibile per la Organization, ma senza dati fittizi.')+
    '<section class="ymc-card"><span class="ymc-section-label">EMPTY STATE · LIVE PLATFORM</span><h2>Nessun dato ancora assegnato.</h2><p>Questo spazio verrà popolato esclusivamente con record reali collegati alla vostra Organization. La Demo resta separata.</p></section>';
}
function clientOverview(){
  const next=DATA.decisions.find(d=>(state.decisionStatus[d.id]||d.status)==='required')||DATA.decisions[0];
  const health=Object.entries(DATA.mission.health).map(([k,v])=>'<div class="ymc-health-row"><span>'+esc(k)+'</span><i><b style="width:'+v+'%"></b></i><strong>'+v+'%</strong></div>').join('');
  return pageHead('MISSION CONTROL · CLIENT','Buongiorno, <em>'+esc(clientOrg().member.split(' ')[0])+'.</em>','Qui vedete cosa sta muovendo la missione, cosa richiede una decisione e cosa YUME sta qualificando.', '<button class="ymc-btn" data-ymc-drawer-open="decision:'+next.id+'">Next decision</button><button class="ymc-btn ymc-btn--dark" data-ymc-section="mission">Open mission</button>')+
    '<section class="ymc-grid ymc-grid--4">'+
      '<div class="ymc-card ymc-stat"><span>PHASE</span><strong>'+esc(DATA.mission.phase)+'</strong><small>Mission architecture in costruzione</small></div>'+
      '<div class="ymc-card ymc-stat"><span>NEXT MILESTONE</span><strong>20 Oct</strong><small>'+esc(DATA.mission.nextMilestone)+'</small></div>'+
      '<div class="ymc-card ymc-stat"><span>DECISIONS</span><strong>'+DATA.decisions.filter(d=>(state.decisionStatus[d.id]||d.status)!=='approved').length+'</strong><small>aperte / richieste</small></div>'+
      '<div class="ymc-card ymc-stat"><span>PROJECT OWNER</span><strong>YUME</strong><small>'+esc(DATA.mission.owner)+'</small></div>'+
    '</section>'+
    '<section class="ymc-grid ymc-grid--main" style="margin-top:12px">'+
      '<article class="ymc-card ymc-card--dark ymc-next-decision"><span class="ymc-section-label">NEXT DECISION</span><h2>'+esc(next.title)+'</h2><p>'+esc(next.recommendation)+'</p><div class="ymc-decision-meta"><span>Due · '+esc(next.due)+'</span><span>'+esc(next.impact)+'</span></div><div class="ymc-decision-actions"><button class="ymc-btn ymc-btn--accent" data-ymc-decision="'+next.id+':approved">Approva</button><button class="ymc-btn" data-ymc-drawer-open="decision:'+next.id+'">Apri dettaglio</button></div></article>'+
      '<article class="ymc-card"><div class="ymc-card-head"><div><span>MISSION HEALTH</span><h2>Readiness</h2></div><button data-ymc-section="mission">View mission →</button></div><div class="ymc-health">'+health+'</div></article>'+
    '</section>'+
    '<section class="ymc-grid ymc-grid--2" style="margin-top:12px">'+
      '<article class="ymc-card"><div class="ymc-card-head"><div><span>NEXT 72 HOURS</span><h2>Agenda pulse</h2></div><button data-ymc-section="agenda">Full agenda →</button></div>'+agendaTimeline(DATA.agenda.slice(0,4))+'</article>'+
      '<article class="ymc-card"><div class="ymc-card-head"><div><span>VISIBLE NETWORK</span><h2>Project partners</h2></div><button data-ymc-section="mission">Why these →</button></div><div class="ymc-list">'+DATA.visiblePartners.map(p=>'<div class="ymc-list-row"><div><b>'+esc(p.role)+'</b><small>'+esc(p.geo)+' · '+esc(p.note)+'</small></div><span class="ymc-chip">'+esc(p.status)+'</span></div>').join('')+'</div></article>'+
    '</section>';
}
function clientCompany(){
  return pageHead('COMPANY ACCESS','Verified organization. <em>Controlled membership.</em>','Mission Control non nasce da una registrazione libera: l’Organization viene creata e abilitata da YUME dopo la verifica del set documentale e del referente.')+
    '<section class="ymc-grid ymc-grid--3">'+
      '<article class="ymc-card ymc-stat"><span>ORGANIZATION</span><strong>Verified</strong><small>'+esc(clientOrg().name)+'</small></article>'+
      '<article class="ymc-card ymc-stat"><span>ACCESS MODEL</span><strong>Invite-only</strong><small>YUME-issued membership</small></article>'+
      '<article class="ymc-card ymc-stat"><span>ADMIN</span><strong>1 active</strong><small>'+esc(clientOrg().member)+'</small></article>'+
    '</section>'+
    '<section class="ymc-grid ymc-grid--2" style="margin-top:12px">'+
      '<article class="ymc-card"><div class="ymc-card-head"><div><span>VERIFICATION RECORD</span><h2>Organization profile</h2></div>'+chip('approved')+'</div><div class="ymc-list">'+
        '<div class="ymc-list-row"><div><b>Ragione sociale</b><small>'+esc(clientOrg().name)+'</small></div><span>Verified</span></div>'+
        '<div class="ymc-list-row"><div><b>VAT / company identity</b><small>Demo data · production: verified source</small></div><span>Verified</span></div>'+
        '<div class="ymc-list-row"><div><b>Company administrator</b><small>'+esc(clientOrg().member)+' · '+esc(clientOrg().role)+'</small></div><span>Active</span></div>'+
        '<div class="ymc-list-row"><div><b>Verification review</b><small>Production: expiry / refresh policy configurable</small></div><span>Annual</span></div>'+
      '</div></article>'+
      '<article class="ymc-card ymc-card--dark"><span class="ymc-section-label">SECURITY PRINCIPLE</span><h2>Access follows the company, not the browser.</h2><p>In produzione il token di onboarding serve solo ad attivare l’identità verificata. L’accesso ordinario passa poi da Supabase Auth / MFA e da Organization Membership, con permessi RLS legati alla missione.</p><div class="ymc-decision-meta"><span>No public signup</span><span>MFA staff</span><span>Audit log</span><span>RLS</span></div></article>'+
    '</section>'+
    '<section class="ymc-card" style="margin-top:12px"><div class="ymc-card-head"><div><span>DOCUMENT POLICY</span><h2>Upload temporaneo. Conservazione controllata.</h2></div></div><p>Visura camerale e documenti di identificazione non devono vivere nel frontend o nel localStorage. La produzione dovrà usare signed upload URL, storage privato, retention policy, access log e cancellazione/aggiornamento secondo la policy YUME validata legalmente.</p></section>';
}

function clientMission(){
  return pageHead('MISSION · '+DATA.mission.id,'Why this mission <em>exists.</em>','Il progetto non parte dall’itinerario: parte dal purpose e dal risultato che deve rientrare in azienda.','<button class="ymc-btn">Mission Book</button><button class="ymc-btn ymc-btn--dark" data-ymc-section="decisions">Open decisions</button>')+
    '<section class="ymc-mission-frame"><div><span>PURPOSE</span><strong>'+esc(DATA.mission.purpose)+'</strong><p>'+esc(DATA.mission.sector)+'</p></div><div><span>ON THE GROUND</span><strong>'+esc(DATA.mission.modules.slice(0,2).join(' + '))+'</strong><p>'+DATA.mission.modules.length+' moduli selezionati</p></div><div><span>RETURN</span><strong>'+esc(DATA.mission.outcome)+'</strong><p>Il criterio di successo deve restare leggibile dopo il rientro.</p></div></section>'+
    '<section class="ymc-grid ymc-grid--2" style="margin-top:12px"><article class="ymc-card"><div class="ymc-card-head"><div><span>GEOGRAPHY</span><h2>Sequence</h2></div></div><div class="ymc-route">'+DATA.mission.route.map((x,i)=>'<span>'+esc(x)+'</span>'+(i<DATA.mission.route.length-1?'<i>→</i>':'')).join('')+'</div><p>Sequenza concettuale. Ogni tappa deve giustificarsi rispetto all’outcome, ai partner qualificati e ai buffer logistici.</p></article><article class="ymc-card"><div class="ymc-card-head"><div><span>MISSION MODULES</span><h2>On the ground</h2></div></div><div class="ymc-decision-meta">'+DATA.mission.modules.map(x=>'<span>'+esc(x)+'</span>').join('')+'</div><p>Il modulo entra nell’agenda solo dopo qualification: accesso, timing, interlocutore, costo e owner.</p></article></section>'+
    '<section class="ymc-card ymc-card--dark ymc-asia-layer" style="margin-top:12px"><div class="ymc-card-head"><div><span>JAPAN CORE · ASIA EXTENSION</span><h2>Asia entra solo se migliora il business case.</h2></div><span class="ymc-chip">Japan Core active</span></div><p>La missione demo resta centrata sul Giappone. Gli hub asiatici sono un layer opzionale da valutare per settore, outcome e continuità regionale, non una collezione di tappe.</p><div class="ymc-asia-grid">'+DATA.asia.map(a=>'<article><span>'+esc(a.name)+'</span><b>'+esc(a.hub)+'</b><small>'+esc(a.role)+'</small><p>'+esc(a.note)+'</p></article>').join('')+'</div></section>'+'<section class="ymc-card" style="margin-top:12px"><div class="ymc-card-head"><div><span>CONTROL LAYER</span><h2>What YUME is orchestrating</h2></div></div><div class="ymc-grid ymc-grid--4"><div class="ymc-stat"><span>BUSINESS</span><strong>Agenda</strong><small>meetings · intelligence · modules</small></div><div class="ymc-stat"><span>TRAVEL</span><strong>Execution</strong><small>flight · hotel · rail · transfer</small></div><div class="ymc-stat"><span>PEOPLE</span><strong>4 pax</strong><small>readiness · roles · needs</small></div><div class="ymc-stat"><span>CONTINUITY</span><strong>Follow-up</strong><small>owner · next action · relation</small></div></div></section>';
}
function agendaTimeline(items){
  return '<div class="ymc-timeline">'+items.map((a,i)=>'<button type="button" class="ymc-timeline-item" data-ymc-drawer-open="agenda:'+DATA.agenda.indexOf(a)+'" style="border:0;background:transparent;text-align:left;width:100%"><span class="ymc-timeline-time">'+esc(a.day)+'<br>'+esc(a.time)+'</span><i class="ymc-timeline-dot is-'+(a.status==='confirmed'?'confirmed':a.status==='pending'?'pending':'')+'"></i><span class="ymc-timeline-body"><b>'+esc(a.title)+'</b><small>'+esc(a.place)+' · '+esc(a.owner)+'</small></span></button>').join('')+'</div>';
}
function clientAgenda(){
  return pageHead('AGENDA','From slots to <em>mission activity.</em>','Ogni appuntamento deve avere uno scopo, uno stato, un owner e un seguito.','<button class="ymc-btn ymc-btn--dark" data-ymc-section="decisions">Open decisions</button>')+
    '<article class="ymc-card"><div class="ymc-card-head"><div><span>MISSION WEEK</span><h2>12–18 April 2027</h2></div><span class="ymc-chip is-amber"><i></i>64% designed</span></div>'+agendaTimeline(DATA.agenda)+'</article>';
}
function clientDecisions(){
  return pageHead('DECISIONS','Nothing important should live only in <em>WhatsApp.</em>','Le decisioni di progetto rimangono leggibili: raccomandazione YUME, impatto, owner, data e stato.')+
    '<section class="ymc-grid ymc-grid--2">'+DATA.decisions.map(d=>{const status=state.decisionStatus[d.id]||d.status;return '<article class="ymc-approval"><div class="ymc-approval-head"><div><span class="ymc-section-label">DUE · '+esc(d.due)+'</span><h3>'+esc(d.title)+'</h3></div>'+chip(status)+'</div><p>'+esc(d.recommendation)+'</p><div class="ymc-decision-meta"><span>'+esc(d.impact)+'</span></div><div class="ymc-approval-actions">'+(status!=='approved'?'<button class="is-primary" data-ymc-decision="'+d.id+':approved">Approva</button><button data-ymc-decision="'+d.id+':discussion">Discutiamone</button>':'<button disabled>Decisione registrata</button>')+'<button data-ymc-drawer-open="decision:'+d.id+'">Dettaglio</button></div></article>'}).join('')+'</section>';
}
function clientParticipants(){
  return pageHead('PARTICIPANTS','People are part of the <em>architecture.</em>','Ruolo aziendale, readiness e bisogni operativi devono stare nello stesso progetto del viaggio.')+
    '<div class="ymc-table-wrap"><table class="ymc-table"><thead><tr><th>Participant</th><th>Role</th><th>Travel</th><th>Documents</th><th>Needs</th></tr></thead><tbody>'+DATA.participants.map(p=>'<tr><td><b>'+esc(p.name)+'</b></td><td>'+esc(p.role)+'</td><td>'+esc(p.travel)+'</td><td>'+esc(p.documents)+'</td><td>'+esc(p.dietary)+'</td></tr>').join('')+'</tbody></table></div>'+
    '<section class="ymc-card" style="margin-top:12px"><span class="ymc-section-label">PERMISSION PRINCIPLE</span><h2>Il corporate admin vede il team. Il traveler vede ciò che gli serve.</h2><p>Dati personali e documentali non vengono resi visibili a tutti per comodità. La futura implementazione usa Organization Membership + Project Permissions + RLS.</p></section>';
}
function clientTravel(){
  return pageHead('TRAVEL','Execution without turning this into a <em>booking engine.</em>','Il cliente vede lo stato operativo del viaggio; YUME mantiene controllo su opzioni, fornitori, timing e conferme.')+
    '<section class="ymc-grid ymc-grid--2">'+DATA.travel.map(t=>'<article class="ymc-card"><div class="ymc-card-head"><div><span>'+esc(t.type)+'</span><h2>'+esc(t.title)+'</h2></div>'+chip(t.status)+'</div><p>'+esc(t.detail)+'</p><button class="ymc-btn ymc-btn--ghost" disabled>Details after qualification</button></article>').join('')+'</section>';
}
function clientDocuments(){
  return pageHead('DOCUMENTS','One project. <em>One document layer.</em>','Versione, owner e visibilità diventano parte del documento, non una convenzione informale.')+
    '<section class="ymc-doc-grid">'+DATA.documents.filter(d=>d.visibility!=='YUME operations').map(d=>'<article class="ymc-doc"><span class="ymc-doc-icon">'+esc(d.type)+'</span><b>'+esc(d.title)+'</b><small>'+esc(d.version)+' · '+esc(d.visibility)+'</small><div class="ymc-doc-actions"><span>'+esc(d.status)+'</span><button data-ymc-toast="Preview: documento non collegato">Open →</button></div></article>').join('')+'</section>';
}
function clientFinancials(){
  return pageHead('FINANCIALS','Client-visible. <em>Not supplier costing.</em>','Il cliente vede valore progetto, pagamenti e extra autorizzati. Net rate, markup, commissioni e supplier terms restano interni.')+
    '<section class="ymc-money-hero"><div class="ymc-money-total"><span>PROJECT VALUE</span><strong>'+money(DATA.financials.value)+'</strong><p>Paid '+money(DATA.financials.paid)+' · Next payment '+money(DATA.financials.next)+' on '+esc(DATA.financials.nextDate)+'</p></div><div class="ymc-money-breakdown">'+DATA.financials.rows.map(r=>'<div class="ymc-money-row"><span>'+esc(r.label)+'</span><b>'+money(r.value)+'</b></div>').join('')+'</div></section>'+
    '<section class="ymc-card" style="margin-top:12px"><span class="ymc-section-label">VISIBILITY BOUNDARY</span><h2>Corporate transparency without exposing internal economics.</h2><p>La futura permission layer separa importi client-visible da costi fornitore, commissioni, overcommission, markup e note finance interne.</p></section>';
}
function clientFollowup(){
  return pageHead('FOLLOW-UP','The trip ends. <em>The mission should not.</em>','Relazioni, owner e next action restano collegate alla missione per costruire continuità nel tempo.')+
    '<section class="ymc-followup-grid">'+DATA.followups.map(f=>'<article class="ymc-followup-card"><span>'+esc(f.status.toUpperCase())+'</span><h3>'+esc(f.company)+'</h3><p>'+esc(f.next)+'</p><footer>Owner · '+esc(f.owner)+' · Due '+esc(f.due)+'</footer></article>').join('')+'</section>'+
    '<section class="ymc-card ymc-card--brass" style="margin-top:12px"><span class="ymc-section-label">ACCOUNT MEMORY</span><h2>Il vantaggio cresce missione dopo missione.</h2><p>Quando la stessa azienda torna in Giappone o Asia, YUME non riparte da zero: storico delle missioni, contatti, decisioni, documenti e follow-up diventano memoria aziendale condivisa.</p></section>';
}
function renderInternal(section){
  const map={network:internalNetwork,onboarding:internalOnboarding,partners:internalPartners,partnerWorkspace:internalPartnerWorkspace,coverage:internalCoverage,pipeline:internalPipeline,roadmap:internalRoadmap,access:internalAccess};
  return (map[section]||internalNetwork)();
}
function internalNetwork(){
  const net=networkData(),qual=net.filter(p=>['Qualification','Pilot','Approved','Preferred'].includes(partnerStatus(p.id))).length;
  return pageHead('YUME INTERNAL · NETWORK','Build the network <em>with demand.</em>','Dati reali dal Partner Registry YUME: ogni passaggio è persistente e tracciabile.','<button class="ymc-btn" data-ymc-section="coverage">Coverage</button><button class="ymc-btn ymc-btn--dark" data-ymc-section="partners">Partner registry</button>')+
    '<section class="ymc-network-hero"><article class="ymc-network-map"><div class="ymc-network-map-inner"><span class="ymc-section-label">JAPAN CORE · ASIA EXTENSION</span><h2>Network maturity is a project asset.</h2><p>Mapping, qualification, pilot e preferred status sono ora stati reali del database, non una preview locale.</p><div class="ymc-network-nodes"><span class="is-strong">Institutional</span><span>DMC</span><span>Travel trade</span><span>Interpreters</span><span>Market entry</span><span>Sector specialists</span></div></div></article><article class="ymc-card"><div class="ymc-card-head"><div><span>NETWORK COVERAGE</span><h2>Current maturity</h2></div><button data-ymc-section="coverage">Details →</button></div><div class="ymc-coverage">'+DATA.coverage.slice(0,6).map(c=>coverageRow(c)).join('')+'</div></article></section>'+
    '<section class="ymc-grid ymc-grid--3" style="margin-top:12px"><article class="ymc-card ymc-stat"><span>MAPPED NODES</span><strong>'+net.length+'</strong><small>record reali nel registry</small></article><article class="ymc-card ymc-stat"><span>QUALIFICATION+</span><strong>'+qual+'</strong><small>qualification / pilot / approved / preferred</small></article><article class="ymc-card ymc-stat"><span>DATA MODE</span><strong>'+(state.liveLoaded?'LIVE':'FALLBACK')+'</strong><small>Supabase CRM beta</small></article></section>'+
    '<section class="ymc-card" style="margin-top:12px"><div class="ymc-card-head"><div><span>NEXT RELATIONSHIP MOVES</span><h2>Work in progress</h2></div></div><div class="ymc-list">'+net.slice(0,6).map(p=>'<div class="ymc-list-row"><div><b>'+esc(p.name)+'</b><small>'+esc(partnerStatus(p.id))+' · Next: '+esc(p.next)+'</small></div><button data-ymc-open-partner="'+p.id+'">Open →</button></div>').join('')+'</div></section>';
}
function coverageRow(c){return '<div class="ymc-coverage-row"><div class="ymc-coverage-top"><b>'+esc(c.label)+'</b><span>'+esc(c.state)+' · '+c.value+'%</span></div><div class="ymc-coverage-bar"><i style="width:'+c.value+'%"></i></div></div>'}
function internalOnboarding(){
  const rows=state.liveAccessRequests||[];
  const pending=rows.filter(r=>['submitted','under_review'].includes(r.status)).length;
  const platforms=rows.filter(r=>r.request_type==='platform').length;
  const demos=rows.filter(r=>r.request_type==='demo').length;
  const statusText=s=>({submitted:'Submitted',under_review:'Under review',demo_approved:'Demo approved',platform_approved:'Platform approved',rejected:'Rejected',invited:'Invited',active:'Active'}[s]||s);
  const actions=r=>{
    if(['submitted','under_review'].includes(r.status)){
      const approveLabel=r.request_type==='platform'?'Approva + invita':'Approva + invia codice';
      return '<div class="ymc-inline-actions"><button class="ymc-btn ymc-btn--dark" data-ymc-review-request="'+r.id+':approve">'+approveLabel+'</button><button class="ymc-btn" data-ymc-review-request="'+r.id+':reject">Rifiuta</button></div>';
    }
    if(r.request_type==='platform'&&r.status==='platform_approved')return '<button class="ymc-btn ymc-btn--dark" data-ymc-invite-request="'+r.id+'">Invia codice →</button>';
    if(r.request_type==='platform'&&r.status==='invited')return '<button class="ymc-btn" data-ymc-invite-request="'+r.id+'">Rigenera codice →</button>';
    if(r.request_type==='demo'&&r.status==='demo_approved')return '<code class="ymc-live-code">'+esc(r.demo_access_code||'Codice non disponibile')+'</code>';
    return '<span class="ymc-chip">'+esc(statusText(r.status))+'</span>';
  };
  return pageHead('COMPANY ONBOARDING','Request first. <em>Activate deliberately.</em>','Demo e Piattaforma seguono due livelli diversi: la Demo resta leggera; la Piattaforma crea Organization + Membership e poi un invito nominativo.','<button class="ymc-btn" data-ymc-refresh-live>↻ Refresh</button>')+
    '<section class="ymc-grid ymc-grid--3"><article class="ymc-card ymc-stat"><span>READY FOR REVIEW</span><strong>'+pending+'</strong><small>richieste da lavorare</small></article><article class="ymc-card ymc-stat"><span>DEMO REQUESTS</span><strong>'+demos+'</strong><small>accesso dimostrativo controllato</small></article><article class="ymc-card ymc-stat"><span>PLATFORM APPLICATIONS</span><strong>'+platforms+'</strong><small>Organization + Membership</small></article></section>'+
    '<section class="ymc-card" style="margin-top:12px"><div class="ymc-card-head"><div><span>VERIFICATION QUEUE · LIVE</span><h2>Organizations waiting for YUME</h2></div></div><div class="ymc-table-wrap"><table class="ymc-table"><thead><tr><th>Type</th><th>Company</th><th>VAT</th><th>Referente</th><th>Submitted</th><th>Status</th><th>Action</th></tr></thead><tbody>'+(rows.length?rows.map(r=>'<tr><td><b>'+esc(r.request_type==='platform'?'PLATFORM':'DEMO')+'</b></td><td><b>'+esc(r.company_name)+'</b><small>'+esc(r.sector||r.website||'')+'</small></td><td>'+esc(r.vat||'—')+'</td><td>'+esc(r.contact_name)+'<small>'+esc(r.contact_email)+'</small></td><td>'+esc(new Date(r.submitted_at).toLocaleString('it-IT'))+'</td><td>'+esc(statusText(r.status))+'</td><td>'+actions(r)+'</td></tr>').join(''):'<tr><td colspan="7">Nessuna richiesta registrata.</td></tr>')+'</tbody></table></div></section>'+
    '<section class="ymc-grid ymc-grid--2" style="margin-top:12px"><article class="ymc-card"><span class="ymc-section-label">DEMO</span><h2>Soft qualification.</h2><p>Niente account Auth e niente documenti societari. YUME approva la richiesta e genera un codice Demo associato all’email aziendale.</p><div class="ymc-route"><span>Request</span><i>→</i><span>Review</span><i>→</i><span>Demo code</span><i>→</i><span>Preview</span></div></article><article class="ymc-card ymc-card--brass"><span class="ymc-section-label">PLATFORM</span><h2>Verified corporate access.</h2><p>La review crea Organization e Membership. Solo dopo YUME invia un invito Supabase al Corporate Admin; il login è nominativo e revocabile.</p><div class="ymc-route"><span>Application</span><i>→</i><span>Approval</span><i>→</i><span>Organization</span><i>→</i><span>Invite</span><i>→</i><span>Access</span></div></article></section>';
}


function internalPartnerWorkspace(){
  const net=networkData(),p=net.find(x=>x.id===state.activePartnerId)||net[0];
  if(!p)return pageHead('PARTNER WORKSPACE','No partner selected.','','<button class="ymc-btn" data-ymc-section="partners">← Registry</button>');
  const statuses=PARTNER_STAGES,contacts=state.partnerContacts[p.id]||[],tickets=state.partnerTickets[p.id]||[],requests=state.partnerRequests[p.id]||[],timeline=state.partnerTimeline[p.id]||[],docs=state.partnerDocs[p.id]||[];
  return pageHead('PARTNER WORKSPACE · LIVE','Gestire la relazione.<br><em>Non solo archiviarla.</em>','Stato, referenti, ticket, richieste e cronologia vengono salvati nel database YUME.','<button class="ymc-btn" data-ymc-section="partners">← Partner Registry</button>')+
    '<section class="ymc-partner-workspace-hero"><div><span class="ymc-section-label">'+esc(p.kind)+' · '+esc(p.geo)+'</span><h2>'+esc(p.name)+'</h2><p>'+esc(p.note)+'</p><div class="ymc-partner-capabilities">'+(p.cap||[]).map(x=>'<span>'+esc(x)+'</span>').join('')+'</div></div><div class="ymc-partner-status-panel"><label><span>STATO RAPPORTO</span><select data-ymc-partner-status="'+p.id+'">'+statuses.map(s=>'<option value="'+s+'" '+(partnerStatus(p.id)===s?'selected':'')+'>'+s+'</option>').join('')+'</select></label><div><span>OWNER</span><b>'+esc(p.owner||'—')+'</b></div><div><span>NEXT ACTION</span><b>'+esc(p.next||'—')+'</b></div></div></section>'+
    '<section class="ymc-card ymc-partner-pipeline"><div class="ymc-card-head"><div><span>RELATIONSHIP PIPELINE</span><h2>Mapping → Preferred.</h2></div><span class="ymc-chip">'+esc(partnerStatus(p.id))+'</span></div><div class="ymc-partner-stage-rail">'+statuses.map((s,i)=>{const current=statuses.indexOf(partnerStatus(p.id));return '<div class="'+(i<current?'is-complete':i===current?'is-current':'')+'"><i>'+(i<current?'✓':i+1)+'</i><b>'+s+'</b><small>'+(i<current?'Completato':i===current?'Stato attuale':'Successivo')+'</small></div>'}).join('')+'</div></section>'+
    '<section class="ymc-grid ymc-grid--2" style="margin-top:12px"><article class="ymc-card"><div class="ymc-card-head"><div><span>REFERENTI</span><h2>Persone della relazione</h2></div></div><div class="ymc-contact-cards">'+(contacts.length?contacts.map(x=>'<article><b>'+esc(x.name)+'</b><span>'+esc(x.role)+'</span><small>'+esc(x.email||'')+(x.phone?' · '+esc(x.phone):'')+'</small></article>').join(''):'<p>Nessun referente registrato.</p>')+'</div><form class="ymc-mini-form" data-ymc-contact-form="'+p.id+'"><input name="name" placeholder="Nome e cognome" required><input name="role" placeholder="Ruolo / reparto"><input name="email" type="email" placeholder="Email"><input name="phone" placeholder="Telefono"><button class="ymc-btn ymc-btn--dark" type="submit">+ Referente</button></form></article>'+
    '<article class="ymc-card"><div class="ymc-card-head"><div><span>TICKET INTERNI</span><h2>Rapporto & attività</h2></div></div><div class="ymc-ticket-list">'+(tickets.length?tickets.map(t=>'<div><span class="ymc-chip">'+esc(t.status)+'</span><b>'+esc(t.title)+'</b><small>'+esc(t.owner)+' · '+esc(t.priority)+' · '+esc(t.due)+'</small></div>').join(''):'<p>Nessun ticket.</p>')+'</div><form class="ymc-mini-form" data-ymc-ticket-form="'+p.id+'"><input name="title" placeholder="Nuovo ticket / attività" required><select name="owner"><option>Alessio</option><option>Gaia</option><option>Romina</option><option>Operations</option></select><select name="priority"><option value="Medium">Media</option><option value="High">Alta</option><option value="Low">Bassa</option><option value="Critical">Critica</option></select><input name="due" type="date"><button class="ymc-btn ymc-btn--dark" type="submit">+ Ticket</button></form></article></section>'+
    '<section class="ymc-grid ymc-grid--2" style="margin-top:12px"><article class="ymc-card"><div class="ymc-card-head"><div><span>RICHIESTE AL PARTNER</span><h2>Quotazioni, disponibilità, accordi</h2></div></div><div class="ymc-request-list">'+(requests.length?requests.map(r=>'<div><span>'+esc(r.type)+'</span><b>'+esc(r.subject)+'</b><small>'+esc(r.status)+' · '+esc(r.owner)+'</small></div>').join(''):'<p>Nessuna richiesta aperta.</p>')+'</div><form class="ymc-mini-form" data-ymc-request-form="'+p.id+'"><select name="type"><option>Quotazione</option><option>Disponibilità</option><option>Condizioni commerciali</option><option>Meeting</option><option>Documentazione</option></select><input name="subject" placeholder="Oggetto richiesta" required><select name="owner"><option>Operations</option><option>Alessio</option><option>Gaia</option><option>Romina</option></select><button class="ymc-btn ymc-btn--dark" type="submit">+ Richiesta</button></form></article>'+
    '<article class="ymc-card"><div class="ymc-card-head"><div><span>DOCUMENTI & ACCORDI</span><h2>Dossier relazione · Storage privato</h2></div><label class="ymc-upload-btn">Carica PDF / immagine<input type="file" data-ymc-partner-upload="'+p.id+'" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"></label></div><div class="ymc-doc-grid">'+(docs.length?docs.map(d=>'<article class="ymc-doc ymc-doc--live"><span class="ymc-doc-icon">'+(d.mimeType==='application/pdf'?'PDF':'IMG')+'</span><b>'+esc(d.fileName)+'</b><small>'+formatDocumentBytes(d.size)+(d.wasCompressed?' · compresso da '+formatDocumentBytes(d.originalSize):' · originale')+'</small><div class="ymc-doc-actions"><button type="button" data-ymc-doc-open="'+d.id+'">Apri</button><button type="button" data-ymc-doc-download="'+d.id+'">Scarica</button><button type="button" class="is-danger" data-ymc-doc-delete="'+d.id+'">Elimina</button></div></article>').join(''):'<p>Nessun documento registrato.</p>')+'</div><p class="ymc-doc-policy">PDF, JPG e PNG. Input massimo 30 MB; compressione automatica con target 380 KB e hard limit 400 KB. I file restano nel bucket privato YUME e vengono aperti tramite link temporanei di 10 minuti.</p></article></section>'+
    '<section class="ymc-card ymc-partner-timeline-card" style="margin-top:12px"><div class="ymc-card-head"><div><span>TIMELINE</span><h2>Storia completa del rapporto</h2></div></div><div class="ymc-partner-timeline">'+(timeline.length?timeline.slice().reverse().map(t=>'<div><span>'+esc(t.date)+'</span><i></i><section><b>'+esc(t.title)+'</b><small>'+esc(t.type)+'</small><p>'+esc(t.detail)+'</p></section></div>').join(''):'<p>Nessun evento registrato.</p>')+'</div></section>';
}


function internalPartners(){
  const net=networkData();
  return pageHead('PARTNER REGISTRY · LIVE','One master. <em>Different channels.</em>','Registry persistente per target, partner e specialisti.','<button class="ymc-btn" data-ymc-refresh-live>↻ Refresh</button>')+
    '<section class="ymc-card" style="margin-bottom:12px"><div class="ymc-card-head"><div><span>NEW PARTNER</span><h2>Aggiungi un nodo al registry</h2></div></div><form class="ymc-mini-form ymc-mini-form--wide" data-ymc-new-partner-form><input name="name" placeholder="Nome partner / target" required><input name="kind" placeholder="Tipo (DMC, istituzione...)"><input name="geo" placeholder="Geografia"><input name="tier" placeholder="Tier"><input name="owner" placeholder="Owner YUME"><input name="next_action" placeholder="Next action"><input name="capabilities" placeholder="Capabilities separate da virgola"><input name="note" placeholder="Nota"><button class="ymc-btn ymc-btn--dark" type="submit">+ Crea partner</button></form></section>'+
    '<section class="ymc-grid ymc-grid--2">'+net.map(p=>'<article class="ymc-partner-card"><div class="ymc-partner-head"><div><span class="ymc-section-label">'+esc(p.kind)+'</span><strong>'+esc(p.name)+'</strong></div><span class="ymc-chip">'+esc(partnerStatus(p.id))+'</span></div><div class="ymc-partner-meta"><span>'+esc(p.geo)+'</span><span>'+esc(p.tier)+'</span><span>Owner · '+esc(p.owner)+'</span></div><p>'+esc(p.note)+'</p><div class="ymc-partner-actions"><small>Next · '+esc(p.next)+'</small><div><button data-ymc-drawer-open="partner:'+p.id+'">Quick view</button><button data-ymc-open-partner="'+p.id+'">Workspace →</button></div></div></article>').join('')+'</section>';
}

function internalCoverage(){
  return pageHead('COVERAGE','See where the network is <em>weak.</em>','Meglio una mappa onesta della maturità che una lista lunga di contatti non qualificati.')+
    '<section class="ymc-grid ymc-grid--2"><article class="ymc-card"><div class="ymc-card-head"><div><span>JAPAN CORE</span><h2>Coverage matrix</h2></div></div><div class="ymc-coverage">'+DATA.coverage.map(c=>coverageRow(c)).join('')+'</div></article><article class="ymc-card ymc-card--brass"><span class="ymc-section-label">NETWORK PRINCIPLE</span><h2>Demand creates depth.</h2><p>Arriva una missione Wine? Rafforziamo buyer, importatori, tasting e interpreti. Arriva Automotive? Rafforziamo Chūbu, supply chain e interpretariato tecnico. Il network cresce con il lavoro reale.</p><div class="ymc-decision-meta"><span>Candidate</span><span>Qualified</span><span>Pilot</span><span>Approved</span><span>Preferred</span></div></article></section>';
}
function internalPipeline(){
  const net=networkData(),stages=PARTNER_STAGES;
  const counts=Object.fromEntries(stages.map(s=>[s,net.filter(p=>partnerStatus(p.id)===s).length]));
  const detail=['Target mappato','Contatto effettuato','Fit e capacità in verifica','Prova sul campo','Partner approvato','Partner preferenziale'];
  return pageHead('PIPELINE','Relationship stages, <em>not logo collection.</em>','Pipeline persistente allineata a un lifecycle partner enterprise.')+
    '<section class="ymc-card ymc-network-pipeline"><div class="ymc-card-head"><div><span>NETWORK PIPELINE · LIVE</span><h2>Mapping → Preferred.</h2></div><span class="ymc-chip">Internal only</span></div><div class="ymc-network-stage-rail">'+stages.map((s,i)=>'<div><i>'+String(i+1).padStart(2,'0')+'</i><b>'+s+'</b><strong>'+counts[s]+'</strong><small>'+detail[i]+'</small></div>').join('')+'</div></section>'+
    '<section class="ymc-card" style="margin-top:12px"><div class="ymc-card-head"><div><span>RELATIONSHIPS</span><h2>Monitoraggio operativo</h2></div></div><div class="ymc-table-wrap"><table class="ymc-table"><thead><tr><th>Partner / target</th><th>Tipo</th><th>Stato</th><th>Owner</th><th>Next action</th><th></th></tr></thead><tbody>'+net.map(p=>'<tr><td><b>'+esc(p.name)+'</b><small>'+esc(p.geo)+'</small></td><td>'+esc(p.kind)+'</td><td>'+esc(partnerStatus(p.id))+'</td><td>'+esc(p.owner)+'</td><td>'+esc(p.next)+'</td><td><button class="ymc-btn" data-ymc-open-partner="'+p.id+'">Apri →</button></td></tr>').join('')+'</tbody></table></div></section>';
}

function internalRoadmap(){
  return pageHead('ROADMAP','Launch the system while the <em>network grows.</em>','La piattaforma può partire prima della rete completa: il Partner Registry rende visibile cosa manca e cosa va rafforzato.')+
    '<section class="ymc-roadmap">'+DATA.roadmap.map(r=>'<article><span>'+esc(r.period)+'</span><h3>'+esc(r.title)+'</h3><ul>'+r.items.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></article>').join('')+'</section>'+
    '<section class="ymc-card" style="margin-top:12px"><span class="ymc-section-label">DO NOT BUILD YET</span><h2>Partner portal, booking engine, expense management.</h2><p>La preview mantiene intenzionalmente fuori ciò che oggi aumenterebbe complessità senza validare il core: self-booking, note spese, chat completa, partner login, marketplace e app nativa.</p></section>';
}
function internalAccess(){
  return pageHead('ACCESS ARCHITECTURE','Authentication is infrastructure. <em>Not a custom feature.</em>','YUME Internal usa già Supabase Auth nella preview protetta. Il passo production è aggiungere ruolo staff verificato, MFA obbligatoria, Organization Membership e RLS sui dati reali.')+
    '<section class="ymc-auth-architecture"><article class="ymc-auth-card is-recommended"><span>PHASE 1 · RECOMMENDED</span><h3>Supabase Auth</h3><p>Coerente con stack attuale e RLS.</p><ul><li>Staff: password + MFA</li><li>Client: magic link / OTP</li><li>Organization membership</li><li>JWT + RLS per missione</li></ul></article><article class="ymc-auth-card"><span>ENTERPRISE TRIGGER</span><h3>WorkOS</h3><p>Quando un cliente chiede SAML/OIDC/SCIM.</p><ul><li>Enterprise SSO</li><li>Directory sync</li><li>Organization policies</li><li>Upgrade senza riscrivere domain model</li></ul></article><article class="ymc-auth-card"><span>NOT FIRST CHOICE</span><h3>Clerk / Auth0</h3><p>Validi, ma aggiungono un identity stack che oggi non serve.</p><ul><li>Ottima developer UX</li><li>Enterprise features</li><li>Più dipendenza esterna</li><li>Valutabili se cambiano i requisiti</li></ul></article></section>'+
    '<section class="ymc-card" style="margin-top:12px"><div class="ymc-card-head"><div><span>DOMAIN MODEL</span><h2>Do not couple business data to one auth vendor.</h2></div></div><div class="ymc-route"><span>Organization</span><i>→</i><span>Membership</span><i>→</i><span>Mission</span><i>→</i><span>Permission</span><i>→</i><span>Audit log</span></div><p>Le entità business devono usare ID interni YUME. L’identity provider si collega tramite identity_provider + identity_subject, così Supabase oggi e WorkOS domani non richiedono una riscrittura del progetto.</p></section>';
}
function openOnboarding(type='demo'){
  state.session=false;state.onboarding=true;state.onboardingType=type==='platform'?'platform':'demo';
  state.onboardingStep=1;state.onboardingSubmitted=false;state.onboardingResult=null;
  state.onboardingForm={company:'',vat:'',rea:'',hq:'',website:'',sector:'',contact_name:'',contact_role:'',contact_email:'',contact_phone:'',use_case:''};
  save();render();
}
function closeOnboarding(){state.onboarding=false;state.onboardingSubmitted=false;save();render()}
function onboardingMaxSteps(){return state.onboardingType==='platform'?4:3}
function onboardingProgress(){
  const labels=state.onboardingType==='platform'?['Azienda','Amministratore','Accesso','Review']:['Azienda','Referente','Review'];
  return labels.map((label,i)=>'<div class="'+(state.onboardingStep===i+1?'is-active':state.onboardingStep>i+1?'is-complete':'')+'"><span>'+(i+1)+'</span><b>'+label+'</b></div>').join('');
}
function onboardValue(key){return esc(state.onboardingForm?.[key]||'')}
function collectOnboardingFields(){
  els('[data-ymc-onboard-field]').forEach(input=>{state.onboardingForm[input.dataset.ymcOnboardField]=input.value.trim()});
  save();
}
function renderOnboarding(){
  const progress=el('[data-ymc-onboarding-progress]'),content=el('[data-ymc-onboarding-content]');
  if(!progress||!content)return;
  progress.innerHTML=onboardingProgress();
  const back=el('[data-ymc-onboarding-back]'),next=el('[data-ymc-onboarding-next]');
  const platform=state.onboardingType==='platform',max=onboardingMaxSteps();
  if(state.onboardingSubmitted){
    const title=platform?'Application inviata. Nessun accesso automatico.':'Richiesta Demo inviata.';
    const copy=platform?'YUME verificherà azienda e referente. Solo dopo l’approvazione creeremo Organization + Membership e invieremo un invito nominativo Supabase.':'YUME valuterà la richiesta. Se approvata, riceverai un codice Demo personale da usare con la tua email aziendale.';
    content.innerHTML='<div class="ymc-onboarding-complete"><span class="ymc-section-label">'+(platform?'PLATFORM APPLICATION':'DEMO REQUEST')+' · RECEIVED</span><i>✓</i><h1>'+title+'</h1><p>'+copy+'</p><div class="ymc-onboarding-statusline"><span class="is-done">Richiesta ricevuta</span><span class="is-current">Review YUME</span><span>'+(platform?'Invite nominativo':'Codice Demo')+'</span><span>Accesso</span></div><button class="ymc-btn ymc-btn--dark" type="button" data-ymc-close-onboarding>Chiudi</button></div>';
    back.hidden=true;next.hidden=true;els('[data-ymc-close-onboarding]').forEach(b=>b.onclick=closeOnboarding);return;
  }
  back.hidden=state.onboardingStep===1;next.hidden=false;
  next.textContent=state.onboardingStep===max?'Invia a YUME →':'Continua →';

  if(state.onboardingStep===1){
    content.innerHTML='<span class="ymc-section-label">STEP 01 · '+(platform?'PLATFORM APPLICATION':'DEMO REQUEST')+'</span><h1>'+(platform?'Identifichiamo l’Organization.':'Partiamo dall’azienda, senza burocrazia inutile.')+'</h1><p class="ymc-onboarding-lead">'+(platform?'Questa richiesta può portare a un account reale Mission Control, ma solo dopo approvazione YUME.':'La Demo serve a valutare il fit: nessun documento societario viene richiesto in questa fase.')+'</p><div class="ymc-form-grid"><label><span>Ragione sociale *</span><input required value="'+onboardValue('company')+'" data-ymc-onboard-field="company"></label><label><span>Partita IVA / VAT</span><input value="'+onboardValue('vat')+'" data-ymc-onboard-field="vat"></label><label><span>REA / Registro imprese</span><input value="'+onboardValue('rea')+'" data-ymc-onboard-field="rea"></label><label><span>Sede</span><input value="'+onboardValue('hq')+'" data-ymc-onboard-field="hq"></label><label><span>Settore</span><input value="'+onboardValue('sector')+'" data-ymc-onboard-field="sector"></label><label><span>Sito aziendale</span><input value="'+onboardValue('website')+'" data-ymc-onboard-field="website" placeholder="https://"></label></div>';
  }else if(state.onboardingStep===2){
    content.innerHTML='<span class="ymc-section-label">STEP 02 · '+(platform?'CORPORATE ADMIN':'DEMO CONTACT')+'</span><h1>'+(platform?'Chi amministrerà l’account?':'Chi testerà Mission Control?')+'</h1><p class="ymc-onboarding-lead">'+(platform?'Il referente sarà il primo Organization Admin se la richiesta viene approvata.':'Il codice Demo approvato sarà associato a questa email.')+'</p><div class="ymc-form-grid"><label><span>Nome e cognome *</span><input required value="'+onboardValue('contact_name')+'" data-ymc-onboard-field="contact_name"></label><label><span>Ruolo aziendale</span><input value="'+onboardValue('contact_role')+'" data-ymc-onboard-field="contact_role"></label><label><span>Email aziendale *</span><input type="email" required value="'+onboardValue('contact_email')+'" data-ymc-onboard-field="contact_email"></label><label><span>Telefono</span><input value="'+onboardValue('contact_phone')+'" data-ymc-onboard-field="contact_phone"></label></div>';
  }else if(platform&&state.onboardingStep===3){
    content.innerHTML='<span class="ymc-section-label">STEP 03 · ACCESS SCOPE</span><h1>Cosa deve governare Mission Control?</h1><p class="ymc-onboarding-lead">Descrivi il caso d’uso: missioni, partner, procurement, meeting, documenti, decisioni o follow-up.</p><label class="ymc-field"><span>Obiettivo / use case</span><textarea rows="7" data-ymc-onboard-field="use_case" placeholder="Es. missioni commerciali in Giappone, scouting partner, agenda B2B...">'+onboardValue('use_case')+'</textarea></label><div class="ymc-form-note"><b>Access principle</b><span>L’account reale viene emesso soltanto dopo review YUME. Nessun self-signup e nessun accesso automatico ai dati di altre Organization.</span></div>';
  }else{
    const f=state.onboardingForm||{};
    content.innerHTML='<span class="ymc-section-label">FINAL REVIEW · '+(platform?'PLATFORM':'DEMO')+'</span><h1>Invia la richiesta a YUME.</h1><div class="ymc-review-grid"><article><span>ORGANIZATION</span><b>'+esc(f.company||'—')+'</b><small>'+esc(f.vat||'VAT non indicata')+'</small></article><article><span>REFERENTE</span><b>'+esc(f.contact_name||'—')+'</b><small>'+esc(f.contact_email||'—')+'</small></article><article><span>TIPO ACCESSO</span><b>'+(platform?'Piattaforma completa':'Demo controllata')+'</b><small>'+(platform?'Organization + Membership dopo approvazione':'Codice Demo dopo approvazione')+'</small></article><article><span>STATO INIZIALE</span><b>Submitted</b><small>Review manuale YUME</small></article></div><label class="ymc-review-check"><input type="checkbox" data-ymc-privacy-confirm><span>Confermo di poter inviare questi dati aziendali a YUME per la gestione della richiesta.</span></label>'+(platform?'<label class="ymc-review-check"><input type="checkbox" data-ymc-terms-confirm><span>Comprendo che l’invio non crea un account: l’accesso nasce solo dopo approvazione e invito nominativo.</span></label>':'')+'<p class="ymc-access-error" data-ymc-onboarding-error hidden></p>';
  }
}
async function submitAccessRequest(){
  const f=state.onboardingForm||{},platform=state.onboardingType==='platform';
  const payload={
    request_type:platform?'platform':'demo',
    company_name:f.company,vat:f.vat||null,rea:f.rea||null,hq:f.hq||null,website:f.website||null,sector:f.sector||null,
    contact_name:f.contact_name,contact_role:f.contact_role||null,contact_email:String(f.contact_email||'').toLowerCase(),
    contact_phone:f.contact_phone||null,use_case:f.use_case||null,requested_modules:[],
    privacy_accepted:true,terms_accepted:platform
  };
  const data=await ymcFetch('/functions/v1/ymc-submit-access-request',{method:'POST',body:payload});
  state.onboardingSubmitted=true;
  state.onboardingResult={type:payload.request_type,status:'submitted',requestId:data?.request?.id||null,notificationStatus:data?.notification_status||null};
  save();renderOnboarding();
}
async function onboardingNext(){
  collectOnboardingFields();
  const f=state.onboardingForm||{},platform=state.onboardingType==='platform',max=onboardingMaxSteps();
  const err=(message)=>{const c=el('[data-ymc-onboarding-content]');const p=document.createElement('p');p.className='ymc-access-error';p.textContent=message||'Completa i campi richiesti.';c.appendChild(p)};
  if(state.onboardingStep===1&&!f.company){err('Inserisci la ragione sociale.');return}
  if(state.onboardingStep===2&&(!f.contact_name||!String(f.contact_email||'').includes('@'))){err('Inserisci nome e una email aziendale valida.');return}
  if(state.onboardingStep===max){
    const privacy=el('[data-ymc-privacy-confirm]'),terms=el('[data-ymc-terms-confirm]'),msg=el('[data-ymc-onboarding-error]');
    if(!privacy?.checked||(platform&&!terms?.checked)){if(msg){msg.hidden=false;msg.textContent='Conferma le condizioni richieste prima dell’invio.'}return}
    const btn=el('[data-ymc-onboarding-next]');if(btn)btn.disabled=true;
    try{await submitAccessRequest()}catch(ex){if(msg){msg.hidden=false;msg.textContent='Invio non riuscito: '+ex.message}if(btn)btn.disabled=false}
    return;
  }
  state.onboardingStep=Math.min(max,state.onboardingStep+1);save();renderOnboarding();
}
function onboardingBack(){collectOnboardingFields();state.onboardingStep=Math.max(1,state.onboardingStep-1);save();renderOnboarding()}

function bindDynamic(){
  els('[data-ymc-section]').forEach(b=>b.onclick=()=>setSection(b.dataset.ymcSection));
  els('[data-ymc-decision]').forEach(b=>b.onclick=()=>{const [id,status]=b.dataset.ymcDecision.split(':');updateDecision(id,status)});
  els('[data-ymc-drawer-open]').forEach(b=>b.onclick=()=>{const [type,id]=b.dataset.ymcDrawerOpen.split(':');openDrawer(type,id)});
  els('[data-ymc-open-partner]').forEach(b=>b.onclick=()=>openPartnerWorkspace(b.dataset.ymcOpenPartner));
  els('[data-ymc-partner-status]').forEach(s=>s.onchange=()=>updatePartnerStatus(s.dataset.ymcPartnerStatus,s.value));
  els('[data-ymc-refresh-live]').forEach(b=>b.onclick=async()=>{b.disabled=true;await loadInternalLiveData();render();toast('Dati aggiornati da Supabase.');});

  els('[data-ymc-review-request]').forEach(b=>b.onclick=async()=>{
    const [id,decision]=b.dataset.ymcReviewRequest.split(':');
    b.disabled=true;
    try{
      const result=await ymcFetch('/functions/v1/ymc-review-access-request',{method:'POST',token:internalToken(),body:{request_id:id,decision,notes:null}});
      await loadInternalLiveData();
      render();
      if(decision==='reject'){
        toast('Richiesta rifiutata.');
      }else if(result?.status==='invited'){
        toast('Richiesta approvata e invito Corporate inviato.');
      }else if(result?.status==='platform_approved'&&result?.invite_status==='failed'){
        toast('Approvata, ma invito non inviato: '+(result?.invite_error||'configura SMTP e usa Riprova invito.'));
      }else if(result?.status==='demo_approved'&&result?.email_status==='sent'){
        toast('Demo approvata e codice inviato via email.');
      }else if(result?.status==='demo_approved'){
        toast('Demo approvata. Email non inviata: provider email da configurare.');
      }else{
        toast('Richiesta approvata.');
      }
    }catch(ex){
      b.disabled=false;
      toast('Review non riuscita: '+ex.message);
    }
  });
  els('[data-ymc-invite-request]').forEach(b=>b.onclick=async()=>{
    const id=b.dataset.ymcInviteRequest;b.disabled=true;
    try{
      await ymcFetch('/functions/v1/ymc-invite-corporate-admin',{method:'POST',token:internalToken(),body:{request_id:id}});
      await loadInternalLiveData();render();toast('Invito Corporate inviato.');
    }catch(ex){b.disabled=false;toast('Invito non riuscito: '+ex.message)}
  });

  const newPartner=el('[data-ymc-new-partner-form]');
  if(newPartner)newPartner.onsubmit=async e=>{
    e.preventDefault();const fd=new FormData(newPartner),name=String(fd.get('name')||'').trim();if(!name)return;
    const body={name,kind:String(fd.get('kind')||'').trim()||null,geo:String(fd.get('geo')||'').trim()||null,stage:'Mapping',tier:String(fd.get('tier')||'').trim()||null,owner:String(fd.get('owner')||'').trim()||null,next_action:String(fd.get('next_action')||'').trim()||null,note:String(fd.get('note')||'').trim()||null,capabilities:String(fd.get('capabilities')||'').split(',').map(x=>x.trim()).filter(Boolean)};
    try{await ymcFetch('/rest/v1/ymc_partners',{method:'POST',token:internalToken(),body,prefer:'return=minimal'});await loadInternalLiveData();render();toast('Partner creato nel registry.')}catch(ex){toast('Creazione partner non riuscita: '+ex.message)}
  };

  els('[data-ymc-contact-form]').forEach(form=>form.onsubmit=async e=>{
    e.preventDefault();const id=form.dataset.ymcContactForm,fd=new FormData(form),name=String(fd.get('name')||'').trim();if(!name)return;
    try{
      await ymcFetch('/rest/v1/ymc_partner_contacts',{method:'POST',token:internalToken(),body:{partner_id:id,name,role:String(fd.get('role')||'').trim()||null,email:String(fd.get('email')||'').trim()||null,phone:String(fd.get('phone')||'').trim()||null},prefer:'return=minimal'});
      await ymcFetch('/rest/v1/ymc_partner_events',{method:'POST',token:internalToken(),body:{partner_id:id,event_type:'Contact',title:'Nuovo referente registrato',detail:name+' · '+String(fd.get('role')||'')},prefer:'return=minimal'});
      await loadPartnerWorkspaceData(id);render();toast('Referente salvato.');
    }catch(ex){toast('Referente non salvato: '+ex.message)}
  });
  els('[data-ymc-ticket-form]').forEach(form=>form.onsubmit=async e=>{
    e.preventDefault();const id=form.dataset.ymcTicketForm,fd=new FormData(form),title=String(fd.get('title')||'').trim();if(!title)return;
    try{
      await ymcFetch('/rest/v1/ymc_partner_tickets',{method:'POST',token:internalToken(),body:{partner_id:id,title,owner:String(fd.get('owner')||'YUME'),status:'Open',priority:String(fd.get('priority')||'Medium'),due_date:String(fd.get('due')||'')||null},prefer:'return=minimal'});
      await ymcFetch('/rest/v1/ymc_partner_events',{method:'POST',token:internalToken(),body:{partner_id:id,event_type:'Ticket',title:'Ticket interno creato',detail:title},prefer:'return=minimal'});
      await loadPartnerWorkspaceData(id);render();toast('Ticket salvato.');
    }catch(ex){toast('Ticket non salvato: '+ex.message)}
  });
  els('[data-ymc-request-form]').forEach(form=>form.onsubmit=async e=>{
    e.preventDefault();const id=form.dataset.ymcRequestForm,fd=new FormData(form),subject=String(fd.get('subject')||'').trim();if(!subject)return;
    try{
      await ymcFetch('/rest/v1/ymc_partner_requests',{method:'POST',token:internalToken(),body:{partner_id:id,request_type:String(fd.get('type')||'Request'),subject,status:'Draft',owner:String(fd.get('owner')||'Operations')},prefer:'return=minimal'});
      await ymcFetch('/rest/v1/ymc_partner_events',{method:'POST',token:internalToken(),body:{partner_id:id,event_type:'Request',title:'Richiesta partner creata',detail:String(fd.get('type')||'Request')+' · '+subject},prefer:'return=minimal'});
      await loadPartnerWorkspaceData(id);render();toast('Richiesta salvata.');
    }catch(ex){toast('Richiesta non salvata: '+ex.message)}
  });
  els('[data-ymc-partner-upload]').forEach(input=>input.onchange=async()=>{
    const file=input.files&&input.files[0];if(!file)return;const id=input.dataset.ymcPartnerUpload;input.disabled=true;
    try{
      toast(file.size>YMC_UPLOAD_HARD_LIMIT_BYTES?'Compressione automatica in corso…':'Preparazione documento…');
      const prepared=await prepareMissionDocument(file);
      await ymcDocumentUpload(id,prepared);
      await loadPartnerWorkspaceData(id);render();toast(prepared.wasCompressed?'Documento compresso e caricato: '+formatDocumentBytes(prepared.storedSizeBytes):'Documento caricato: '+formatDocumentBytes(prepared.storedSizeBytes));
    }catch(ex){input.disabled=false;input.value='';toast('Upload non riuscito: '+ex.message)}
  });
  els('[data-ymc-doc-open]').forEach(b=>b.onclick=async()=>{try{await openPartnerDocument(b.dataset.ymcDocOpen,false)}catch(ex){toast('Apertura non riuscita: '+ex.message)}});
  els('[data-ymc-doc-download]').forEach(b=>b.onclick=async()=>{try{await openPartnerDocument(b.dataset.ymcDocDownload,true)}catch(ex){toast('Download non riuscito: '+ex.message)}});
  els('[data-ymc-doc-delete]').forEach(b=>b.onclick=async()=>{
    const docId=b.dataset.ymcDocDelete,partnerId=state.activePartnerId;
    if(!window.confirm('Eliminare definitivamente questo documento dal dossier partner?'))return;
    b.disabled=true;
    try{
      const result=await ymcDocumentAction(docId,'delete');
      if(partnerId){
        state.partnerDocs[partnerId]=(state.partnerDocs[partnerId]||[]).filter(d=>d.id!==docId);
        save();
        render();
        const refreshed=await loadPartnerDocuments(partnerId);
        if(refreshed)render();
      }
      toast(result?.already_absent?'Documento già eliminato: elenco riallineato.':'Documento eliminato da Storage e database.');
    }catch(ex){
      b.disabled=false;
      toast('Eliminazione non riuscita: '+ex.message);
    }
  });
  els('[data-ymc-toast]').forEach(b=>b.onclick=()=>toast(b.dataset.ymcToast));
  els('[data-ymc-open-menu]').forEach(b=>b.onclick=()=>toggleMenu(true));
}

async function enter(role){
  if(role!=='client')return openInternalLogin();
  const email=el('[data-ymc-demo-email]')?.value.trim().toLowerCase()||'';
  const code=el('[data-ymc-demo-token]')?.value.trim().toUpperCase()||'';
  const err=el('[data-ymc-access-error]');
  if(!email.includes('@')||!code){if(err){err.hidden=false;err.textContent='Inserisci email aziendale e codice Demo approvato.'}return}
  try{
    const data=await ymcFetch('/functions/v1/ymc-demo-access',{method:'POST',body:{email,code}});
    if(!data?.ok)throw new Error(data?.error||'Demo non autorizzata');
    if(err)err.hidden=true;
    state.onboarding=false;state.session=true;state.role='client';state.clientMode='demo';state.section='overview';
    state.clientOrganization={name:data.company_name,short:data.company_name,member:data.contact_name||email,role:'Corporate Demo'};save();render();
  }catch(ex){if(err){err.hidden=false;err.textContent=ex.message}}
}

function showCorporateMode(mode='login'){
  const activationMode=mode==='activation';
  const login=el('[data-ymc-corporate-login-form]'),activation=el('[data-ymc-corporate-activation-form]');
  if(login)login.hidden=activationMode;
  if(activation)activation.hidden=!activationMode;
  const loginErr=el('[data-ymc-corporate-login-error]'),activationErr=el('[data-ymc-corporate-activation-error]');
  if(loginErr)loginErr.hidden=true;if(activationErr)activationErr.hidden=true;
  requestAnimationFrame(()=>(
    activationMode?el('[data-ymc-corporate-activation-email]'):el('[data-ymc-corporate-email]')
  )?.focus());
}
function openCorporateLogin(mode='login'){
  const m=el('[data-ymc-corporate-login]');
  const queryActivation=new URLSearchParams(location.search).get('activate')==='corporate';
  showCorporateMode(mode==='activation'||queryActivation?'activation':'login');
  if(m)m.hidden=false;
}
function closeCorporateLogin(){
  const m=el('[data-ymc-corporate-login]');if(m)m.hidden=true;
  const e=el('[data-ymc-corporate-login-error]');if(e)e.hidden=true;
  const a=el('[data-ymc-corporate-activation-error]');if(a)a.hidden=true;
}
async function activateCorporateToken(token,{firstActivation=false}={}){
  const activation=await ymcFetch('/functions/v1/ymc-activate-membership',{method:'POST',token,body:{first_activation:firstActivation}});
  if(!activation?.ok||!activation.organization)throw new Error(activation?.error||'Membership YUME non valida');
  const user=await ymcFetch('/auth/v1/user',{token});
  sessionStorage.setItem(CORPORATE_TOKEN_KEY,token);
  state.session=true;state.onboarding=false;state.role='client';state.clientMode='platform';state.section='overview';
  state.clientOrganization={id:activation.organization.id,name:activation.organization.legal_name,short:activation.organization.legal_name,member:user?.user_metadata?.full_name||user?.email||'Corporate Admin',role:'Corporate Admin'};
  await loadCorporateLiveData();
  save();closeCorporateLogin();render();return true;
}
async function corporateSignIn(e){
  e.preventDefault();const email=el('[data-ymc-corporate-email]')?.value.trim().toLowerCase()||'',password=el('[data-ymc-corporate-password]')?.value||'',err=el('[data-ymc-corporate-login-error]'),btn=e.currentTarget.querySelector('button[type="submit"]');
  if(!email.includes('@')||!password){err.hidden=false;err.textContent='Inserisci email e password.';return}
  btn.disabled=true;err.hidden=true;
  try{
    const data=await ymcFetch('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password}});
    if(!data?.access_token)throw new Error('Credenziali Corporate non valide.');
    await activateCorporateToken(data.access_token);
  }catch(ex){err.hidden=false;err.textContent=ex.message}finally{btn.disabled=false}
}
async function corporateActivate(e){
  e.preventDefault();
  const email=el('[data-ymc-corporate-activation-email]')?.value.trim().toLowerCase()||'';
  const tempCode=(el('[data-ymc-corporate-temp-code]')?.value||'').trim().toUpperCase().replace(/\s+/g,'');
  const pwd=el('[data-ymc-corporate-new-password]')?.value||'';
  const confirm=el('[data-ymc-corporate-confirm-password]')?.value||'';
  const err=el('[data-ymc-corporate-activation-error]'),btn=e.currentTarget.querySelector('button[type="submit"]');
  if(!email.includes('@')){err.hidden=false;err.textContent='Inserisci l’email aziendale approvata da YUME.';return}
  if(!/^[A-HJ-NP-Z2-9]{10}$/.test(tempCode)){err.hidden=false;err.textContent='Inserisci il codice provvisorio di 10 caratteri ricevuto via email.';return}
  if(pwd.length<10){err.hidden=false;err.textContent='Usa una password di almeno 10 caratteri.';return}
  if(pwd!==confirm){err.hidden=false;err.textContent='Le password non coincidono.';return}
  btn.disabled=true;err.hidden=true;
  try{
    const session=await ymcFetch('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password:tempCode}});
    if(!session?.access_token)throw new Error('Codice provvisorio non valido. Se YUME ha rigenerato il codice, usa l’ultimo ricevuto.');
    await ymcFetch('/auth/v1/user',{method:'PUT',token:session.access_token,body:{password:pwd}});
    await activateCorporateToken(session.access_token,{firstActivation:true});
    history.replaceState(null,'',location.pathname);
  }catch(ex){err.hidden=false;err.textContent=String(ex.message||ex)}
  finally{btn.disabled=false}
}
function detectCorporateInvite(){
  if(new URLSearchParams(location.search).get('activate')!=='corporate')return false;
  openCorporateLogin('activation');
  return true;
}
async function validateCorporateSession(){
  const token=corporateToken();if(!token)return false;
  try{await activateCorporateToken(token);return true}catch(_){return false}
}

function openInternalLogin(){
  const m=el('[data-ymc-internal-login]');
  const email=el('[data-ymc-internal-email]');
  if(email)email.removeAttribute('readonly');
  if(m){m.hidden=false;requestAnimationFrame(()=>email?.focus())}
}
function closeInternalLogin(){const m=el('[data-ymc-internal-login]');if(m)m.hidden=true;const e=el('[data-ymc-internal-login-error]');if(e)e.hidden=true;const p=el('[data-ymc-internal-password]');if(p)p.value=''}
async function getAuthorizedInternalProfile(token,userId){
  if(!token||!userId)return null;
  const url=INTERNAL_AUTH_URL+'/rest/v1/profiles?select=role,active&user_id=eq.'+encodeURIComponent(userId)+'&limit=1';
  const res=await fetch(url,{headers:{'apikey':INTERNAL_AUTH_KEY,'Authorization':'Bearer '+token,'Accept':'application/json'}});
  if(!res.ok)return null;
  const rows=await res.json().catch(()=>([]));
  const profile=Array.isArray(rows)?rows[0]:null;
  const role=String(profile?.role||'').toLowerCase();
  if(!profile||profile.active!==true||!INTERNAL_ALLOWED_ROLES.has(role))return null;
  return {role,active:true};
}
async function internalSignIn(e){
  e.preventDefault();
  const email=el('[data-ymc-internal-email]')?.value.trim().toLowerCase()||'';
  const password=el('[data-ymc-internal-password]')?.value||'';
  const err=el('[data-ymc-internal-login-error]'),submit=e.currentTarget.querySelector('button[type="submit"]');
  if(!email||!email.includes('@')){err.hidden=false;err.textContent='Inserisci una email staff valida.';return}
  if(!password){err.hidden=false;err.textContent='Inserisci la password staff.';return}
  submit.disabled=true;err.hidden=true;
  try{
    const res=await fetch(INTERNAL_AUTH_URL+'/auth/v1/token?grant_type=password',{method:'POST',headers:{'apikey':INTERNAL_AUTH_KEY,'Content-Type':'application/json'},body:JSON.stringify({email,password})});
    const data=await res.json().catch(()=>({}));
    if(!res.ok||!data.access_token||!data.user?.id)throw new Error(data.error_description||data.msg||'Credenziali non valide.');
    const profile=await getAuthorizedInternalProfile(data.access_token,data.user.id);
    if(!profile)throw new Error('Account autenticato ma non autorizzato per YUME Internal.');
    sessionStorage.setItem(INTERNAL_TOKEN_KEY,data.access_token);
    closeInternalLogin();state.onboarding=false;state.session=true;state.role='internal';state.section='network';await loadInternalLiveData();save();render();toast('YUME Internal autenticato.');
  }catch(ex){err.hidden=false;err.textContent=String(ex.message||ex)}
  finally{submit.disabled=false}
}
async function validateInternalSession(){
  const token=sessionStorage.getItem(INTERNAL_TOKEN_KEY);
  if(!token)return false;
  try{
    const res=await fetch(INTERNAL_AUTH_URL+'/auth/v1/user',{
      headers:{'apikey':INTERNAL_AUTH_KEY,'Authorization':'Bearer '+token}
    });
    if(!res.ok)return false;
    const user=await res.json().catch(()=>({}));
    if(!user?.id)return false;
    return !!(await getAuthorizedInternalProfile(token,user.id));
  }catch(_){return false}
}
async function bootstrap(){
  initStatic();
  if(detectCorporateInvite()){render();return}
  if(state.session&&state.role==='internal'){
    const valid=await validateInternalSession();
    if(!valid){sessionStorage.removeItem(INTERNAL_TOKEN_KEY);state=baseState();save()}
    else{
      await loadInternalLiveData();
      if(state.section==='partnerWorkspace'&&state.activePartnerId)await loadPartnerWorkspaceData(state.activePartnerId);
    }
  }else if(state.session&&state.role==='client'&&state.clientMode==='platform'){
    const valid=await validateCorporateSession();
    if(!valid){sessionStorage.removeItem(CORPORATE_TOKEN_KEY);state=baseState();save()}
    else await loadCorporateLiveData();
  }
  render();
}
function logout(){
  sessionStorage.removeItem(INTERNAL_TOKEN_KEY);sessionStorage.removeItem(CORPORATE_TOKEN_KEY);sessionStorage.removeItem('ymcPendingInviteToken');
  state={...baseState()};save();render();
}
function resetPreview(){
  try{localStorage.removeItem(STORAGE)}catch(_){}
  sessionStorage.removeItem(INTERNAL_TOKEN_KEY);sessionStorage.removeItem(CORPORATE_TOKEN_KEY);sessionStorage.removeItem('ymcPendingInviteToken');
  state=baseState();save();render();
}
function toggleMenu(open){state.sidebar=typeof open==='boolean'?open:!state.sidebar;const sidebarOpen=!!state.session&&!!state.sidebar;el('[data-ymc-sidebar]')?.classList.toggle('is-open',sidebarOpen);el('[data-ymc-sidebar-backdrop]')?.classList.toggle('is-open',sidebarOpen);document.body.classList.toggle('ymc-nav-open',sidebarOpen)}
function initStatic(){
  els('[data-ymc-enter]').forEach(b=>b.onclick=()=>enter(b.dataset.ymcEnter));
  els('[data-ymc-open-corporate-login]').forEach(b=>b.onclick=()=>openCorporateLogin('login'));
  els('[data-ymc-close-corporate-login]').forEach(b=>b.onclick=closeCorporateLogin);
  els('[data-ymc-show-corporate-activation]').forEach(b=>b.onclick=()=>showCorporateMode('activation'));
  els('[data-ymc-show-corporate-login]').forEach(b=>b.onclick=()=>showCorporateMode('login'));
  el('[data-ymc-corporate-login-form]').onsubmit=corporateSignIn;
  el('[data-ymc-corporate-activation-form]').onsubmit=corporateActivate;
  els('[data-ymc-toggle-corporate-password]').forEach(b=>b.onclick=()=>{const input=el('[data-ymc-corporate-password]');if(!input)return;const show=input.type==='password';input.type=show?'text':'password';b.textContent=show?'Nascondi':'Mostra'});
  els('[data-ymc-toggle-corporate-new-password]').forEach(b=>b.onclick=()=>{const input=el('[data-ymc-corporate-new-password]');if(!input)return;const show=input.type==='password';input.type=show?'text':'password';b.textContent=show?'Nascondi':'Mostra'});
  els('[data-ymc-open-internal-login]').forEach(b=>b.onclick=openInternalLogin);
  els('[data-ymc-close-internal-login]').forEach(b=>b.onclick=closeInternalLogin);
  els('[data-ymc-toggle-password]').forEach(b=>b.onclick=()=>{
    const input=el('[data-ymc-internal-password]');
    if(!input)return;
    const show=input.type==='password';
    input.type=show?'text':'password';
    b.textContent=show?'Nascondi':'Mostra';
    b.setAttribute('aria-pressed',String(show));
    b.setAttribute('aria-label',show?'Nascondi password':'Mostra password');
  });
  el('[data-ymc-internal-login-form]').onsubmit=internalSignIn;
  els('[data-ymc-open-onboarding]').forEach(b=>b.onclick=()=>openOnboarding(b.dataset.ymcOpenOnboarding||'demo'));
  els('[data-ymc-close-onboarding]').forEach(b=>b.onclick=closeOnboarding);
  el('[data-ymc-onboarding-next]').onclick=onboardingNext;
  el('[data-ymc-onboarding-back]').onclick=onboardingBack;
  els('[data-ymc-open-menu]').forEach(b=>b.onclick=()=>toggleMenu(true));
  el('[data-ymc-close-menu]').onclick=()=>toggleMenu(false);
  el('[data-ymc-sidebar-backdrop]').onclick=()=>toggleMenu(false);
  el('[data-ymc-close-drawer]').onclick=closeDrawer;
  el('[data-ymc-drawer-backdrop]').onclick=closeDrawer;
  el('[data-ymc-project-switch]').onclick=()=>{const m=el('[data-ymc-project-menu]');m.hidden=!m.hidden;el('[data-ymc-project-switch]').setAttribute('aria-expanded',String(!m.hidden))};
  el('[data-ymc-profile]').onclick=()=>{const m=el('[data-ymc-profile-menu]');m.hidden=!m.hidden};
  el('[data-ymc-logout]').onclick=logout;
  el('[data-ymc-reset]').onclick=resetPreview;
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeCorporateLogin();closeInternalLogin();closeDrawer();toggleMenu(false);el('[data-ymc-project-menu]').hidden=true;el('[data-ymc-profile-menu]').hidden=true}});
  document.addEventListener('click',e=>{
    if(!e.target.closest('[data-ymc-project-switch]')&&!e.target.closest('[data-ymc-project-menu]'))el('[data-ymc-project-menu]').hidden=true;
    if(!e.target.closest('[data-ymc-profile]')&&!e.target.closest('[data-ymc-profile-menu]'))el('[data-ymc-profile-menu]').hidden=true;
  });
}
document.addEventListener('DOMContentLoaded',bootstrap);
})();