(()=>{'use strict';
const SUPABASE_URL='https://eniewpjsahqzrsxldymh.supabase.co';
const SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXJhYmFzZSIsInJlZiI6ImVuaWV3cGpzYWhxenJzeGxkeW1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NDQ2NTAsImV4cCI6MjA3MTEyMDY1MH0.Yrrl6z4KM1wbEbHbA_Xigs7DurVXWpMM8-3ENNl-7ww';
const form=document.getElementById('businessMissionForm');
if(!form)return;
const statusEl=document.getElementById('businessFormStatus');
const choices=document.getElementById('activityChoices');
const activityList=(window.YUME_BUSINESS_ACTIVITIES||[]);
const featured=['Scouting distributori','Buyer meeting su agenda','Delegazione fiera','Factory visit','Lean / TPS learning','Robotics & automation','Food export mission','Luxury & fashion retail','Furniture & design','Executive immersion','Startup ecosystem tour','Italian sourcing mission'];
choices.innerHTML=featured.map(name=>'<label class="yb-check"><input type="checkbox" name="activity" value="'+name.replace(/"/g,'&quot;')+'"><span>'+name+'</span></label>').join('');
const params=new URLSearchParams(location.search);
const pre=params.get('activity');
if(pre){
  let match=[...choices.querySelectorAll('input')].find(x=>x.value===pre);
  if(!match){
    const label=document.createElement('label');label.className='yb-check';
    label.innerHTML='<input type="checkbox" name="activity" value="'+pre.replace(/"/g,'&quot;')+'" checked><span>'+pre+'</span>';
    choices.prepend(label);
  } else match.checked=true;
}
function missionId(){
  const d=new Date();
  const yy=String(d.getFullYear()).slice(-2),mm=String(d.getMonth()+1).padStart(2,'0');
  const rand=Math.random().toString(36).slice(2,7).toUpperCase();
  return 'YM-'+yy+mm+'-'+rand;
}
function utm(){
  const p=new URLSearchParams(location.search),keys=['utm_source','utm_medium','utm_campaign','utm_content','utm_term','ref'];
  return keys.reduce((o,k)=>(p.get(k)&&(o[k]=p.get(k)),o),{referrer:document.referrer||null});
}
function selected(){return [...form.querySelectorAll('input[name="activity"]:checked')].map(x=>x.value)}
function setStatus(msg,type=''){statusEl.textContent=msg;statusEl.className='yb-status'+(type?' is-'+type:'')}
form.addEventListener('submit',async e=>{
  e.preventDefault(); setStatus('');
  if(!form.reportValidity()) return;
  const fd=new FormData(form);
  if(!fd.get('email')&&!fd.get('phone')){setStatus('Inserisci almeno email o telefono.','error');return;}
  const id=missionId();
  const payload={
    mission_id:id,source:'business_mission_lab_v1',schema_version:1,status:'submitted',locale:'it',
    direction:fd.get('direction'),
    company:{name:fd.get('company'),website:fd.get('website')||null,size:fd.get('size')||null},
    contact:{name:fd.get('name'),role:fd.get('role')||null,email:fd.get('email')||null,phone:fd.get('phone')||null},
    objective:fd.get('objective'),desired_outcome:fd.get('outcome'),sector:fd.get('sector'),company_size:fd.get('size')||null,
    delegation:{participants:fd.get('people')?Number(fd.get('people')):null},
    timing:{period:fd.get('period')||null},
    budget_band:fd.get('budget')||null,
    selected_activities:selected(),
    destinations:(fd.get('places')||'').split(',').map(s=>s.trim()).filter(Boolean),
    services:[],
    constraints:{notes:fd.get('constraints')||null},
    notes:null,attribution:utm(),consent_to_contact:true,page_path:location.pathname,user_agent:navigator.userAgent
  };
  const btn=form.querySelector('button[type="submit"]');btn.disabled=true;setStatus('Invio del Mission Brief…');
  try{
    const res=await fetch(SUPABASE_URL+'/rest/v1/business_mission_briefs',{
      method:'POST',
      headers:{apikey:SUPABASE_KEY,Authorization:'Bearer '+SUPABASE_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},
      body:JSON.stringify(payload)
    });
    if(!res.ok)throw new Error('HTTP '+res.status);
    form.reset();setStatus('Mission Brief '+id+' ricevuto. Il team YUME potrà qualificarlo nel CRM.','ok');
    try{sessionStorage.setItem('yumeBusinessLastMissionId',id)}catch(_){}
  }catch(err){console.error(err);setStatus('Invio non riuscito. Riprova oppure contatta YUME.','error')}
  finally{btn.disabled=false}
});
})();