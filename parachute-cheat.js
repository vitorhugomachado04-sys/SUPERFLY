import {topCamera} from './top-camera.js?v=04.53';
import * as T from './three.js';
import {terrain} from './geography.js?v=04.53';
export const supportsParachute=config=>config.parachutists??(config.id==='skycourier'||!!config.helicopter);
export class CheatWord{
 constructor(word='parachute'){this.word=word;this.reset();}
 reset(){this.buffer='';this.last=0;}
 feed(e,enabled,now){
  if(!enabled||e.ctrlKey||e.metaKey||e.altKey||e.target?.isContentEditable||['INPUT','SELECT','TEXTAREA'].includes(e.target?.tagName)){this.reset();return false;}
  if(now-this.last>3000)this.buffer='';
  const key=e.key?.toLowerCase();if(e.repeat)return !!this.buffer&&key?.length===1;
  if(key?.length!==1)return false;
  const candidate=this.buffer+key;
  if(this.word.startsWith(candidate)){this.buffer=candidate;this.last=now;if(candidate===this.word){this.reset();this.onComplete?.();}return true;}
  this.buffer=key===this.word[0]?key:'';this.last=now;return key===this.word[0];
 }
}
export class ParachuteCheat{
 constructor(scene){this.group=new T.Group();this.group.name='cargo-skydivers';scene.add(this.group);this.drops=[];this.cooldown=0;this.focus=null;}
 reset(){for(const p of this.drops){this.group.remove(p.g);const geos=new Set(),mats=new Set();p.g.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.material)mats.add(o.material);});geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());}this.drops=[];this.cooldown=0;this.focus=null;this.surface=null;}
 jump(f,options={}){
  if(!(options.enabled??supportsParachute(f.config))||f.ground||f.crashed||f.y-terrain(f.x,f.z)<(options.minAltitude??65))return false;
  if(this.focus||this.cooldown>0||this.drops.length>=6)return false;
  this.cooldown=4;
  const g=new T.Group(),body=new T.Group(),canopy=new T.Group();g.add(body,canopy);const mats=new Map();
  const add=(geo,color,x,y,z,parent=body)=>{if(!mats.has(color))mats.set(color,new T.MeshStandardMaterial({color,roughness:.7,side:T.DoubleSide}));const m=new T.Mesh(geo,mats.get(color));m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;};
  const box=(x,y,z,w,h,d,color,parent=body)=>add(new T.BoxGeometry(w,h,d),color,x,y,z,parent);
  box(0,0,0,.65,1,.4,'#7664aa');add(new T.SphereGeometry(.28,12,8),'#eee1bc',0,.78,0);box(0,.8,-.23,.4,.16,.09,'#344c61');box(0,.1,.27,.5,.65,.2,'#e2b66d');
  const limbs=[];for(const side of [-1,1]){const arm=box(side*.58,.25,0,.65,.22,.23,'#7664aa');arm.rotation.z=side*.45;const leg=box(side*.26,-.8,0,.23,.85,.26,'#3b4d65');leg.rotation.z=side*.22;box(side*.35,-1.22,-.1,.26,.2,.45,'#243a49');limbs.push(arm,leg);}
  for(let i=0;i<8;i++){const m=add(new T.SphereGeometry(4.4,6,10,i*Math.PI/4,Math.PI/4,0,Math.PI/2),i%2?'#eae3b7':'#8975bd',0,4.5,0,canopy);m.scale.y=.55;}
  for(let i=0;i<8;i++){const a=i*Math.PI/4,geo=new T.BufferGeometry().setFromPoints([new T.Vector3(Math.sin(a)*4.3,4.5,Math.cos(a)*4.3),new T.Vector3(Math.sin(a)*.4,.4,Math.cos(a)*.25)]);const line=new T.Line(geo,new T.LineBasicMaterial({color:'#e4e2d0'}));canopy.add(line);}
  canopy.visible=false;g.rotation.y=-f.heading;g.position.set(f.x+Math.cos(f.heading)*3,f.y-.7,f.z+Math.sin(f.heading)*3+2);this.group.add(g);
  const p={g,body,canopy,limbs,age:0,landTime:0,landed:false,vx:f.vx+Math.cos(f.heading)*4,vz:f.vz+Math.sin(f.heading)*4,vy:f.vy-2,heading:f.heading};this.drops.push(p);this.focus=p;p.cameraMode=0;p.mission=!!options.mission;return true;
 }
 open(){const p=this.focus;if(!p||p.landed||p.opened)return false;p.opened=true;p.canopy.visible=true;p.canopy.scale.setScalar(.08);return true;}
 release(){const p=this.focus;if(p&&!p.landed)p.autonomous=true;this.focus=null;}
 aircraftInput(f,u){if(!this.focus)return u;if(f.config.helicopter)return {pitch:0,roll:0,yaw:0,power:Math.max(-1,Math.min(1,(.5-f.throttle)*5-f.vy*.025)),brake:false};return {pitch:Math.max(-.5,Math.min(.5,(.07-f.pitch)*2-f.pr)),roll:Math.max(-1,Math.min(1,-f.bank*2-f.rr*.5)),yaw:0,power:f.speed<f.config.approachSpeed*1.35&&f.throttle<.8?.5:0,brake:false};}
 update(dt,input={}){
  if(dt<=0)return;
  let remaining=Math.min(dt,.2);while(remaining>1e-8){const step=Math.min(1/120,remaining);this.step(step,input);remaining-=step;}
  const expired=this.drops.filter(p=>p!==this.focus&&(p.age>300||p.landTime>8));
  for(const p of expired){this.group.remove(p.g);const geos=new Set(),mats=new Set();p.g.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.material)mats.add(o.material);});geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());}this.drops=this.drops.filter(p=>!expired.includes(p));
 }
 step(dt,input){this.cooldown=Math.max(0,this.cooldown-dt);
  for(const p of this.drops){p.age+=dt;if(p.snowJump)continue;if(p.landed){p.landTime+=dt;if(p.support){p.g.position.x+=(p.support.vx||0)*dt;p.g.position.z+=(p.support.vz||0)*dt;}p.canopy.scale.y=Math.max(.03,1-p.landTime*.7);continue;}
   const floor=terrain(p.g.position.x,p.g.position.z),controlled=p===this.focus;
   if(!controlled&&!p.opened&&(p.age>2.6||p.g.position.y-floor<45)){p.opened=true;p.canopy.scale.setScalar(.08);}
   const open=!!p.opened,roll=controlled?(input.roll||0):0,pitch=controlled?(input.pitch||0):0;
   p.canopy.visible=open;
   if(open){p.canopy.scale.setScalar(Math.min(1,p.canopy.scale.x+dt*1.8));p.vy+=(-4.2+pitch*.7-p.vy)*(1-Math.exp(-dt*3));}
   else p.vy=Math.max(-48,p.vy-9.81*dt);
   if(controlled){p.heading+=((input.yaw||0)*1.2+(p.mission&&open?roll*.85:0))*dt;p.heading=Math.atan2(Math.sin(p.heading),Math.cos(p.heading));p.g.rotation.y=-p.heading;}
   const speed=open?10:16,forward=p.mission&&open?(input.brake?1.5:(p.canopyCruise??8)-pitch*5):-pitch*speed,side=p.mission&&open?0:roll*speed,response=open?1.6:.75;
   const tx=Math.sin(p.heading)*forward+Math.cos(p.heading)*side,tz=-Math.cos(p.heading)*forward+Math.sin(p.heading)*side;
   p.vx+=(tx-p.vx)*(1-Math.exp(-dt*response));p.vz+=(tz-p.vz)*(1-Math.exp(-dt*response));
   p.body.rotation.x+=((open?pitch*.15:-Math.PI/2+pitch*.2)-p.body.rotation.x)*(1-Math.exp(-dt*5));p.body.rotation.z+=(roll*-.3-p.body.rotation.z)*(1-Math.exp(-dt*5));p.canopy.rotation.z=-roll*.1;p.limbs.forEach((m,i)=>m.rotation.x=Math.sin(p.age*5+i)*.15);
   p.g.position.x+=p.vx*dt;p.g.position.z+=p.vz*dt;p.g.position.y+=p.vy*dt;
   const support=this.surface?.(p.g.position.x,p.g.position.z),ground=support?.height??terrain(p.g.position.x,p.g.position.z);
   if(p.g.position.y<=ground+1.4){p.g.position.y=ground+1.4;p.landed=true;p.hardLanding=p.vy<-9;p.water=support?.water??ground<0;p.support=support;p.landingVelocity={x:p.vx,z:p.vz};p.vx=p.vy=p.vz=0;if(p.hardLanding)p.body.rotation.x=-Math.PI/2;}
  }
 }

 camera(camera){const p=this.focus;if(!p)return false;if(p.cameraMode===1){topCamera(camera,p.g.position,55);return true;}camera.up.set(0,1,0);const distance=p.opened?23:17;camera.position.set(p.g.position.x-Math.sin(p.heading)*distance,p.g.position.y+(p.opened?9:6),p.g.position.z+Math.cos(p.heading)*distance);camera.lookAt(p.g.position.x,p.g.position.y+(p.opened?2:0),p.g.position.z);return true;}
}
