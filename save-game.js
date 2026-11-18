import {MISSIONS,MAIN_IDS} from './mission-catalog.js?v=04.53';
import {AIRPORTS} from './airports.js?v=04.53';
import {FLEET} from './fleet.js?v=04.53';
export const SAVE_KEY='superfly-career-v3',BACKUP_KEY=SAVE_KEY+'-backup',MAX_SAVE_BYTES=1024*1024;
const fail=()=>{throw new Error('Save inválido ou incompatível. O progresso atual foi mantido.');};
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const number=(v,min=-1e7,max=1e7)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)fail();return v;};
const bool=v=>{if(typeof v!=='boolean')fail();return v;};
const date=v=>{if(typeof v!=='string'||!Number.isFinite(Date.parse(v)))fail();return new Date(v).toISOString();};
const strings=v=>{if(!Array.isArray(v)||v.length>100||v.some(x=>typeof x!=='string'))fail();return [...new Set(v)];};
function checkpoint(c){
 if(c==null)return null;if(!object(c))fail();const out={};
 for(const key of ['x','y','z','vx','vy','vz','heading','pitch','bank'])out[key]=number(c[key]);
 for(const key of ['throttle','gearExtension','gearTarget'])out[key]=number(c[key],0,1);
 out.trim=number(c.trim??0,-1,1);out.flaps=number(c.flaps,0,2);if(!Number.isInteger(out.flaps))fail();
 for(const key of ['ground','airborne','isolated','gearFault'])out[key]=bool(c[key]);
 for(const key of ['hookTarget','hookExtension'])out[key]=number(c[key]??0,0,1);
 out.time=number(c.time,0,1e9);
 if(!Array.isArray(c.engineHealth)||c.engineHealth.length!==2)fail();out.engineHealth=c.engineHealth.map(v=>number(v,0,1));
 if(c.special!=null){const s=c.special;if(!object(s))fail();out.special={time:number(s.time,0,1e9),phase:number(s.phase,0,20),hold:number(s.hold,0,1e9),done:bool(s.done),triggered:bool(s.triggered),freeUntil:s.freeUntil==null?null:number(s.freeUntil,0,1e9)};if(!Number.isInteger(out.special.phase))fail();}
 else{if(c.specialTime!==undefined)out.specialTime=number(c.specialTime,0,1e9);if(c.specialPhase!==undefined)out.specialPhase=number(c.specialPhase,0,20);}
 return out;
}
export function validateProgress(p){
 if(!object(p)||p.version!==3||p.mapVersion!==2)fail();
 const completed=strings(p.completed);if(completed.some(id=>!MISSIONS.some(m=>m.id===id)))fail();
 const next=MAIN_IDS.findIndex(id=>!completed.includes(id));
 const unlocked=strings(p.unlocked).filter(id=>FLEET.some(c=>c.id===id));if(!unlocked.includes('cessna'))unlocked.unshift('cessna');
 if(!Array.isArray(p.ratings)||p.ratings.length>100)fail();const ratings=[];
 for(const r of p.ratings){if(r==null)continue;if(!object(r))fail();const index=MISSIONS.findIndex(m=>m.id===r.mission);if(index<0||!['OURO','BOM POUSO','CONCLUÍDA'].includes(r.grade))fail();ratings[index]={mission:r.mission,sink:number(r.sink),alignment:number(r.alignment),grade:r.grade};}
 const out={version:3,mapVersion:2,next:next<0?MAIN_IDS.length:next,completed,unlocked,ratings,started:bool(p.started),last:null,resume:null};
 if(p.savedAt!=null)out.savedAt=date(p.savedAt);
 if(p.last!=null){if(!object(p.last)||!AIRPORTS.some(a=>a.id===p.last.airport))fail();out.last={airport:p.last.airport};for(const k of ['x','z','heading'])out.last[k]=number(p.last[k]);}
 if(p.resume!=null){if(!object(p.resume)||p.resume.id!==MAIN_IDS[out.next])fail();out.resume={id:p.resume.id,checkpoint:checkpoint(p.resume.checkpoint)};if(out.resume.id==='school'&&(out.resume.checkpoint?.special?.phase??0)>4)fail();}
 return out;
}
export function exportSave(progress){return JSON.stringify({game:'SUPERFLY',formatVersion:1,exportedAt:new Date().toISOString(),progress:validateProgress(progress)},null,2);}
export function parseSave(text){
 if(typeof text!=='string'||text.length>MAX_SAVE_BYTES)fail();let file;try{file=JSON.parse(text);}catch{fail();}
 if(!object(file)||file.game!=='SUPERFLY'||file.formatVersion!==1)throw new Error('Este arquivo não é um save compatível do Superfly. O progresso atual foi mantido.');
 return {progress:validateProgress(file.progress),exportedAt:date(file.exportedAt)};
}
export function loadBackup(career){const raw=career.storage?.getItem(BACKUP_KEY);if(!raw)return null;return {progress:validateProgress(JSON.parse(raw)),exportedAt:null};}
export function importProgress(career,progress){
 const next=validateProgress(progress),previous=JSON.stringify(career.progress);
 if(!career.storage?.setItem)throw new Error('O navegador não permite salvar. Libere o armazenamento antes de carregar.');
 try{career.storage.setItem(BACKUP_KEY,previous);career.storage.setItem(SAVE_KEY,JSON.stringify(next));}
 catch{throw new Error('Não foi possível gravar o save. O progresso atual foi mantido. Baixe seu save e libere espaço no navegador.');}
 career.progress=next;career.checkpoint=null;career.active=false;career.sync();return next;
}
export function describeSave(progress){const next=MISSIONS.find(m=>m.id===MAIN_IDS[progress.next]);return {mission:next?.name||'Campanha concluída',completed:progress.completed.length,checkpoint:!!progress.resume?.checkpoint,date:progress.savedAt?new Date(progress.savedAt).toLocaleString('pt-BR'):'Save anterior · data não registrada'};}
