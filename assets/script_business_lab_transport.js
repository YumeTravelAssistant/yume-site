(()=>{'use strict';
const nativeFetch=window.fetch.bind(window);
const sleep=(ms)=>new Promise(resolve=>setTimeout(resolve,ms));
const RETRYABLE=new Set([408,503,504,520]);

window.fetch=async function(input,init){
  const method=String(init&&init.method||'GET').toUpperCase();
  const rawUrl=typeof input==='string'?input:(input&&input.url)||'';
  const isMissionSubmit=method==='POST'&&rawUrl.includes('/rest/v1/business_mission_briefs');

  if(!isMissionSubmit)return nativeFetch(input,init);

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
      return response;
    }catch(error){
      lastError=error;
      if(attempt===1){
        await sleep(700);
        continue;
      }
    }
  }
  throw lastError||new TypeError('Mission submit network failure');
};
})();