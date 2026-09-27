(()=>{'use strict';
const STORAGE='yumeBusinessMissionLabV2';
const nativeFetch=window.fetch.bind(window);
const sleep=(ms)=>new Promise(resolve=>setTimeout(resolve,ms));
const RETRYABLE=new Set([408,503,504,520]);

function markAttempt(missionId,status){
  try{
    const state=JSON.parse(localStorage.getItem(STORAGE)||'{}');
    state.transportLastAttempt={missionId,status,at:new Date().toISOString()};
    localStorage.setItem(STORAGE,JSON.stringify(state));
  }catch(_){}
}

window.fetch=async function(input,init){
  const method=String(init&&init.method||'GET').toUpperCase();
  const rawUrl=typeof input==='string'?input:(input&&input.url)||'';
  const isMissionSubmit=method==='POST'&&rawUrl.includes('/rest/v1/business_mission_briefs');
  if(!isMissionSubmit)return nativeFetch(input,init);

  let missionId='';
  try{missionId=JSON.parse(init&&init.body||'{}').mission_id||''}catch(_){}
  if(missionId)markAttempt(missionId,'sending');

  const url=new URL(rawUrl,location.href);
  url.searchParams.set('on_conflict','mission_id');
  const headers=new Headers(init&&init.headers||{});
  headers.set('Prefer','resolution=ignore-duplicates,return=minimal');
  const requestInit={...init,headers};
  let lastError=null;

  for(let attempt=1;attempt<=2;attempt++){
    try{
      const response=await nativeFetch(url.toString(),requestInit);
      if(attempt===1&&RETRYABLE.has(response.status)){
        await sleep(650);
        continue;
      }
      if(response.ok&&missionId)markAttempt(missionId,'acknowledged');
      else if(missionId)markAttempt(missionId,'http-'+response.status);
      return response;
    }catch(error){
      lastError=error;
      if(attempt===1){
        await sleep(700);
        continue;
      }
    }
  }
  if(missionId)markAttempt(missionId,'unknown');
  throw lastError||new TypeError('Mission submit network failure');
};
})();