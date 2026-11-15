import {airportById,airportAt,arrivalSpawn} from './airports.js?v=04.3';
import {MISSIONS,MAIN_IDS,CATALOG} from './mission-catalog.js?v=04.3';
export {MISSIONS,MAIN_IDS,CATALOG};
const KEY='superfly-career-v3',LEGACY='superfly-career-v2';
const oldIds=['school','winds','fog','heli','birds','gear','storm','peaks','aurora','desert','jump','base','intercept','carrier'];
const fresh=()=>({version:3,next:0,unlocked:['cessna'],ratings:[],completed:[],last:null,started:false,mapVersion:2,resume:null});
export class Career{
 constructor(storage=globalThis.localStorage){this.storage=storage;this.progress=fresh();try{const p=JSON.parse(storage?.getItem(KEY)||'null');if(p?.version===3&&Array.isArray(p.completed)){this.progress={...fresh(),...p};}else{const old=JSON.parse(storage?.getItem(LEGACY)||'null');if(old){this.progress.started=!!old.started||old.next>0;for(let i=0;i<oldIds.length;i++)if(old.ratings?.[i]||i<old.next){const id=oldIds[i],index=MISSIONS.findIndex(m=>m.id===id);if(index>=0){this.progress.completed.push(id);if(old.ratings?.[i])this.progress.ratings[index]=old.ratings[i];}}this.progress.unlocked=old.unlocked||['cessna'];}}}catch{}this.sync();this.active=false;}
 sync(){const next=MAIN_IDS.findIndex(id=>!this.progress.completed.includes(id));this.progress.next=next<0?MAIN_IDS.length:next;if(!this.progress.last&&this.progress.next>0){const previous=MISSIONS[this.progress.next-1],a=airportById(previous.to);this.progress.last={airport:a.id,x:a.x,z:a.z,heading:a.heading};}}
 get hasStarted(){return this.progress.started||this.progress.completed.length>0;}
 get nextMission(){return MISSIONS[this.progress.next]&&this.progress.next<MAIN_IDS.length?MISSIONS[this.progress.next]:null;}
 available(m){return m.dependencies.every(id=>this.progress.completed.includes(id));}
 extrasAt(airport){return MISSIONS.filter(m=>m.kind==='extra'&&m.from===airport&&this.available(m));}
 newCareer(){if(this.hasStarted)try{this.storage?.setItem(KEY+'-backup',JSON.stringify(this.progress));}catch{}this.progress=fresh();this.checkpoint=null;this.save();}
 begin(index=this.progress.next){this.index=Math.min(index,MISSIONS.length-1);this.mission=MISSIONS[this.index];if(!this.mission||!this.available(this.mission))throw Error('Missão bloqueada');this.progress.started=true;this.replay=this.progress.completed.includes(this.mission.id);this.sideTrip=this.mission.kind==='extra'||this.replay;this.active=true;this.state='preparation';this.time=0;this.hold=0;this.specialDone=!this.mission.special;this.gate=0;this.events=new Set();this.checkpoint=null;
 if(!this.sideTrip)this.progress.resume={id:this.mission.id,checkpoint:null};this.save();return this.mission;}
 save(){try{this.storage?.setItem(KEY,JSON.stringify(this.progress));return true;}catch{return false;}}
 setCheckpoint(f){this.checkpoint={x:f.x,y:f.y,z:f.z,vx:f.vx,vy:f.vy,vz:f.vz,heading:f.heading,pitch:f.pitch,bank:f.bank,throttle:f.throttle,trim:f.trim||0,flaps:f.flaps,gearExtension:f.gearExtension,gearTarget:f.gearTarget,ground:f.ground,airborne:f.airborne,engineHealth:[...f.engineHealth],isolated:f.isolated,gearFault:f.gearFault,hookTarget:f.hookTarget,hookExtension:f.hookExtension,time:f.time};}
 persistCheckpoint(special){if(this.sideTrip||!this.checkpoint)return;this.progress.resume={id:this.mission.id,checkpoint:{...this.checkpoint,special: special?{time:special.time,phase:special.phase,done:special.done,triggered:special.triggered,hold:special.hold}:null}};this.save();}
 update(dt,f,specialDone){if(!this.active||this.state==='complete')return false;this.time+=dt;this.specialDone=specialDone??this.specialDone;const a=airportById(this.mission.to),d=Math.hypot(f.x-a.x,f.z-a.z);this.state=!f.airborne?'takeoff':!this.specialDone?'special':d<1500?'approach':'enroute';
 const condition=this.mission.completion;const valid=f.airborne&&f.ground&&!f.crashed&&f.touch?.airport===a.id&&airportAt(f.x,f.z)?.id===a.id&&Math.hypot(f.vx,f.vz)<condition.maxGroundSpeed&&(!condition.requiresSpecial||this.specialDone)&&(!condition.requiresCable||f.arrest?.stopped);
 this.hold=valid?this.hold+dt:0;if(this.hold<condition.holdSeconds)return false;this.state='complete';
 const rating={mission:this.mission.id,sink:f.touch.sink,alignment:f.touch.align,grade:f.touch.sink<1.5&&f.touch.align<.15?'OURO':f.touch.sink<3?'BOM POUSO':'CONCLUÍDA'},old=this.progress.ratings[this.index],rank=r=>r.grade==='OURO'?3:r.grade==='BOM POUSO'?2:1;
 if(!old||rank(rating)>rank(old)||(rank(rating)===rank(old)&&rating.sink<old.sink))this.progress.ratings[this.index]=rating;
 if(!this.progress.completed.includes(this.mission.id))this.progress.completed.push(this.mission.id);
 if(!this.sideTrip){this.progress.last=arrivalSpawn(a,f.config,f.touch.heading??f.heading);this.progress.resume=null;}this.sync();
 for(const m of MISSIONS.filter(m=>this.available(m)))if(!this.progress.unlocked.includes(m.aircraft))this.progress.unlocked.push(m.aircraft);this.saved=this.save();return true;
 }
}
