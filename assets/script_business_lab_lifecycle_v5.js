(()=>{'use strict';
const STORAGE='yumeBusinessMissionLabV2';
const MIGRATION='yumeBusinessMissionLabV5Migrated';
function newMissionId(){
  const d=new Date();
  const yy=String(d.getFullYear()).slice(-2);
  const mm=String(d.getMonth()+1).padStart(2,'0');
  const rand=Math.random().toString(36).slice(2,7).toUpperCase();
  return 'YM-'+yy+mm+'-'+rand;
}
try{
  const raw=localStorage.getItem(STORAGE);
  if(!raw)return;
  const state=JSON.parse(raw);
  const attempt=state&&state.transportLastAttempt;
  const needsMigration=localStorage.getItem(MIGRATION)!=='1';
  const reusedAttempt=attempt&&attempt.missionId&&attempt.missionId===state.missionId&&['acknowledged','unknown','sending'].includes(attempt.status);
  if(needsMigration||reusedAttempt){
    state.missionId=newMissionId();
    delete state.submittedAt;
    delete state.submittedMissionId;
    delete state.transportLastAttempt;
    localStorage.setItem(STORAGE,JSON.stringify(state));
    localStorage.setItem(MIGRATION,'1');
  }
}catch(e){console.warn('Mission Lab lifecycle migration skipped',e)}
})();