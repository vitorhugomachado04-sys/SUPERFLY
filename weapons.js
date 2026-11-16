import * as T from './three.js';
import {cloudTexture} from './clouds.js?v=04.27';
import {terrain} from './geography.js?v=04.27';
export const armedAircraft=c=>c.id==='fighter'||c.id==='naval';
function obstacleHit(a,b,o){
 let enter=0,exit=1;for(const [axis,min,max] of [['x',o.x-o.w/2,o.x+o.w/2],['y',-Infinity,o.top],['z',o.z-o.d/2,o.z+o.d/2]]){const d=b[axis]-a[axis];if(Math.abs(d)<1e-8){if(a[axis]<min||a[axis]>max)return null;}else{const t1=(min-a[axis])/d,t2=(max-a[axis])/d;enter=Math.max(enter,Math.min(t1,t2));exit=Math.min(exit,Math.max(t1,t2));if(enter>exit)return null;}}return a.clone().lerp(b,enter);
}
export class FighterWeapons{
 constructor(scene,sound){this.sound=sound;this.texture=cloudTexture(57,64);this.group=new T.Group();scene.add(this.group);this.geo=new T.SphereGeometry(1,8,6);this.tracerGeo=new T.BoxGeometry(.12,.12,4);this.missileGeo=new T.CylinderGeometry(.18,.3,3.4,8);this.fire=new T.MeshBasicMaterial({color:'#ffb64c'});this.tracer=new T.MeshBasicMaterial({color:'#fff2a5'});this.steel=new T.MeshStandardMaterial({color:'#d9dddf',metalness:.4,roughness:.4});this.reset();}
 reset(){for(const p of this.particles||[])p.m.material.dispose();this.group.clear();this.projectiles=[];this.particles=[];this.gunCD=0;this.missileCD=0;this.side=1;}
 particle(pos,velocity,size,life,color){if(this.particles.length>=350)return;const m=new T.Sprite(new T.SpriteMaterial({map:this.texture,color,transparent:true,depthWrite:false,rotation:Math.random()*Math.PI*2,blending:color.startsWith('#ff')?T.AdditiveBlending:T.NormalBlending}));m.position.copy(pos);m.scale.setScalar(size);this.group.add(m);this.particles.push({m,v:velocity,size,life,age:0});}
 fireWeapon(f,missile){
  if(!armedAircraft(f.config)||f.crashed)return false;
  if((missile?this.missileCD:this.gunCD)>0)return false;
  if(missile)this.missileCD=1.2;else this.gunCD=.085;
  const q=new T.Quaternion().setFromEuler(new T.Euler(f.pitch,-f.heading,-f.bank,'YXZ')),dir=new T.Vector3(0,0,-1).applyQuaternion(q);
  const m=new T.Group(),body=new T.Mesh(missile?this.missileGeo:this.tracerGeo,missile?this.steel:this.tracer);
  if(missile){body.rotation.x=Math.PI/2;const flame=new T.Mesh(this.geo,this.fire);flame.position.z=2.1;flame.scale.set(.35,.35,1.4);m.add(flame);for(const angle of [0,Math.PI/2]){const fin=new T.Mesh(this.tracerGeo,this.steel);fin.scale.set(10,1,.25);fin.rotation.z=angle;fin.position.z=1;m.add(fin);}}
  m.add(body);m.quaternion.copy(q);this.side*=-1;
  m.position.set(this.side*(missile?3:.65),missile?-.6:0,-f.config.length*.58).applyQuaternion(q).add(new T.Vector3(f.x,f.y,f.z));
  this.group.add(m);this.projectiles.push({m,v:dir.multiplyScalar(missile?220:700).add(new T.Vector3(f.vx,f.vy,f.vz)),age:0,missile,trail:0});
  if(!missile)this.particle(m.position,new T.Vector3(),.55,.07,'#fff5b0');this.sound?.weapon?.(missile);return true;
 }
 explode(pos,missile,water){
  const count=missile?35:5;
  for(let i=0;i<count;i++){const v=new T.Vector3(Math.random()-.5,Math.random()*.9,Math.random()-.5).multiplyScalar(missile?22:7);this.particle(pos,v,missile?2.5:.45,missile?1.1:.35,water?'#d6edf1':i%2?'#ff6e25':'#ffd36e');}
  if(missile){for(let i=0;i<18;i++)this.particle(pos,new T.Vector3((Math.random()-.5)*7,5+Math.random()*8,(Math.random()-.5)*7),3,4,water?'#c4dce3':'#4d5157');this.sound?.impact?.(water);}
 }
 update(dt,f,input={},obstacles=[]){
  if(dt<=0)return;let remaining=Math.min(dt,.2);
  while(remaining>1e-8){const step=Math.min(remaining,1/120);this.step(step,f,input,obstacles);remaining-=step;}
 }
 step(dt,f,input,obstacles){
  this.gunCD=Math.max(0,this.gunCD-dt);this.missileCD=Math.max(0,this.missileCD-dt);
  if(input.gun)this.fireWeapon(f,false);if(input.missile)this.fireWeapon(f,true);
  for(const p of this.projectiles){p.age+=dt;const before=p.m.position.clone();p.m.position.addScaledVector(p.v,dt);p.trail+=dt;
   if(p.missile&&p.trail>.045){p.trail=0;this.particle(p.m.position,new T.Vector3(0,1,0),2,1.5,'#c1c4c5');}
   // Sweep in short segments so fast tracers cannot skip terrain or narrow buildings.
   const nearby=obstacles.filter(o=>Math.abs(p.m.position.x-o.x)<o.w/2+12&&Math.abs(p.m.position.z-o.z)<o.d/2+12);
   const distance=before.distanceTo(p.m.position),steps=Math.max(1,Math.ceil(distance/2));let hit=null,water=false;
   for(let i=1;i<=steps;i++){const point=before.clone().lerp(p.m.position,i/steps),height=terrain(point.x,point.z);if(point.y<=Math.max(0,height)){hit=point;water=height<0;break;}}
   if(!hit)for(const o of nearby){const contact=obstacleHit(before,p.m.position,o);if(contact){hit=contact;break;}}
   if(hit||p.age>(p.missile?7:2)){if(hit||p.missile)this.explode(hit||p.m.position,p.missile,water);p.dead=true;this.group.remove(p.m);}
  }
  this.projectiles=this.projectiles.filter(p=>!p.dead);
  for(const p of this.particles){p.age+=dt;p.m.position.addScaledVector(p.v,dt);p.m.scale.setScalar(p.size*(1+p.age*.8));p.m.material.opacity=Math.max(0,1-p.age/p.life);if(p.age>=p.life){this.group.remove(p.m);p.m.material.dispose();}}
  this.particles=this.particles.filter(p=>p.age<p.life);
 }
}
