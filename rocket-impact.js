import * as T from './three.js';
import {cloudTexture} from './clouds.js?v=04.55';
const clamp=v=>Math.max(0,Math.min(1,v));
export class RocketImpact{
 constructor(scene){
  this.root=new T.Group();scene.add(this.root);this.texture=cloudTexture(41,96);
  this.particles=[];this.parts=[];
  for(let i=0;i<120;i++){
   const sprite=new T.Sprite(new T.SpriteMaterial({map:this.texture,transparent:true,depthWrite:false,blending:i<40?T.AdditiveBlending:T.NormalBlending}));
   this.root.add(sprite);this.particles.push({sprite});
  }
  const metal=new T.MeshStandardMaterial({color:'#85939c',metalness:.65,roughness:.48,side:T.DoubleSide});
  const panel=new T.CylinderGeometry(4,4,7,8,1,true,0,Math.PI*.55),fin=new T.BoxGeometry(4,.3,9),nose=new T.ConeGeometry(3,12,12,1,true);
  for(let i=0;i<40;i++){const mesh=new T.Mesh(i===0?nose:i%6===0?fin:panel,metal);this.root.add(mesh);this.parts.push({mesh});}
  this.ring=new T.Mesh(new T.RingGeometry(.87,1,96),new T.MeshBasicMaterial({color:'#ffd5a1',transparent:true,depthWrite:false,side:T.DoubleSide,opacity:0}));this.ring.rotation.x=-Math.PI/2;this.root.add(this.ring);
  this.light=new T.PointLight('#ffb75d',0,500,1.5);this.root.add(this.light);this.reset();
 }
 reset(){this.active=false;this.time=0;this.root.visible=false;}
 trigger(f,camera){
  this.active=true;this.root.visible=true;this.time=0;this.water=f.distance>48;
  this.center=new T.Vector3(f.x,this.water?-2.5:8.3,f.z);this.root.position.copy(this.center);
  this.cameraOffset=camera.position.clone().sub(this.center);if(this.cameraOffset.length()<200)this.cameraOffset.set(130,100,190);
  let seed=37;const rand=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
  for(let i=0;i<this.particles.length;i++){
   const p=this.particles[i],a=rand()*Math.PI*2,r=rand()*14;
   p.fire=i<40&&!this.water;p.spray=this.water&&i<80;
   p.delay=i<22?0:rand()*(p.fire?2.4:2);p.life=p.fire?1.1+rand()*1.1:3+rand()*3;
   p.origin=new T.Vector3(Math.sin(a)*r,rand()*25,Math.cos(a)*r);
   const speed=p.spray?25+rand()*45:p.fire?8+rand()*22:5+rand()*16;
   p.velocity=new T.Vector3(Math.sin(a)*speed,p.spray?40+rand()*65:p.fire?20+rand()*30:28+rand()*28,Math.cos(a)*speed);
   p.size=p.spray?7+rand()*9:p.fire?20+rand()*22:23+rand()*30;
   p.sprite.material.blending=p.fire?T.AdditiveBlending:T.NormalBlending;p.sprite.visible=false;
  }
  for(let i=0;i<this.parts.length;i++){
   const p=this.parts[i],a=rand()*Math.PI*2,speed=18+rand()*46;
   p.origin=new T.Vector3(Math.sin(a)*4,5+(i%7)*7,Math.cos(a)*4);
   p.velocity=new T.Vector3(Math.sin(a)*speed,20+rand()*65,Math.cos(a)*speed);
   p.spin=new T.Vector3(rand()*4-2,rand()*4-2,rand()*4-2);p.mesh.visible=true;
  }
  this.ring.material.color.set(this.water?'#d9f4f6':'#ffc58e');this.update(0,camera);
 }
 update(dt,camera){
  if(!this.active)return;this.time+=dt;const t=this.time;
  for(const p of this.parts){
   p.mesh.position.copy(p.origin).addScaledVector(p.velocity,t);p.mesh.position.y-=9*t*t;
   p.mesh.rotation.set(p.spin.x*t,p.spin.y*t,p.spin.z*t);
   if(!this.water)p.mesh.position.y=Math.max(1,p.mesh.position.y);
   p.mesh.visible=p.mesh.position.y>-12;
  }
  for(const p of this.particles){
   const age=t-p.delay,k=age/p.life;p.sprite.visible=age>=0&&k<1;if(!p.sprite.visible)continue;
   p.sprite.position.copy(p.origin).addScaledVector(p.velocity,age*(p.spray?1:.6));
   if(p.spray)p.sprite.position.y-=18*age*age;
   p.sprite.visible=p.sprite.position.y>-3;
   p.sprite.scale.setScalar(p.size*(.45+Math.max(0,k)*(p.fire?2.5:2.8)));
   p.sprite.material.opacity=clamp(age*10)*clamp((1-k)*(p.fire?1.7:.85));
   if(p.fire)p.sprite.material.color.setHSL(.14-.12*clamp(k),1,.75-.42*clamp(k));
   else p.sprite.material.color.set(this.water?'#dbf0f3':'#3b4149');
  }
  this.ring.position.y=.4;this.ring.scale.setScalar(12+t*105);this.ring.material.opacity=Math.max(0,1-t/1.4)*.5;
  this.light.position.set(0,20,0);this.light.intensity=this.water?0:Math.exp(-t*1.2)*2400;
  const pull=1+Math.min(t,5)*.07;camera.position.copy(this.center).addScaledVector(this.cameraOffset,pull);
  camera.position.y=Math.max(camera.position.y,this.center.y+60);
  camera.lookAt(this.center.x,this.center.y+25+Math.min(t,4)*9,this.center.z);
 }
}
