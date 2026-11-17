import * as T from './three.js';
import {terrain,onRunway} from './physics.js?v=04.43';

export class LandingSmoke {
 constructor(scene){
  const size=32,data=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const r=Math.hypot((x+.5-size/2)/(size/2),(y+.5-size/2)/(size/2)),i=(y*size+x)*4;
   data[i]=data[i+1]=data[i+2]=230;data[i+3]=Math.round(Math.max(0,1-r*r)**2*210);
  }
  this.texture=new T.DataTexture(data,size,size);this.texture.needsUpdate=true;
  this.texture.magFilter=T.LinearFilter;this.texture.minFilter=T.LinearFilter;
  this.particles=Array.from({length:224},()=>{
   const sprite=new T.Sprite(new T.SpriteMaterial({map:this.texture,transparent:true,depthWrite:false,opacity:0,color:'#e3dfd5'}));
   sprite.visible=false;scene.add(sprite);return {sprite,age:0,life:0,vx:0,vz:0};
  });this.reset();
 }
 reset(){this.lastTouch=null;this.lastBurst=-Infinity;this.rolling=false;this.cursor=0;this.particles.forEach(p=>{p.life=0;p.sprite.visible=false;});}
 contact(f){
  const newTouch=f.touch!==this.lastTouch;this.lastTouch=f.touch;
  if(newTouch&&f.touch?.runway&&!f.crashed&&f.airborne){this.rolling=true;this.lastBurst=-Infinity;}
  if(f.crashed||!f.touch||!onRunway(f.x,f.z)||f.speed*1.94384<=40){this.rolling=false;return;}
  if(!this.rolling||!f.ground||f.time-this.lastBurst<.08)return;
  const burst=this.lastBurst===-Infinity;this.lastBurst=f.time;
  this.emit(f,burst?10:3);
 }
 emit(f,count){
  const rx=Math.cos(f.heading),rz=Math.sin(f.heading),fx=Math.sin(f.heading),fz=-Math.cos(f.heading);
  const strength=Math.min(1,.35+f.touch.sink*.12+f.speed*.008);
  for(const side of [-1,1])for(let i=0;i<count;i++){
   const p=this.particles[this.cursor++%this.particles.length];p.age=0;p.life=2.2+i*.06;p.strength=strength;
   const x=f.x+side*rx*(f.config?.wheelTrack||1.1)-fx*(f.config?.wheelZ||.3),z=f.z+side*rz*(f.config?.wheelTrack||1.1)-fz*(f.config?.wheelZ||.3);
   p.sprite.position.set(x,terrain(x,z)+.25,z);p.sprite.scale.setScalar(.7+i*.09);
   p.base=.7+i*.09;p.vx=-fx*(.4+i*.12)+side*rx*.35;p.vz=-fz*(.4+i*.12)+side*rz*.35;
   p.sprite.material.opacity=strength*.8;p.sprite.visible=true;
  }
 }
 update(dt){for(const p of this.particles){if(!p.sprite.visible)continue;p.age+=dt;
  if(p.age>=p.life){p.sprite.visible=false;continue;}
  p.sprite.position.x+=p.vx*dt;p.sprite.position.z+=p.vz*dt;p.sprite.position.y+=dt*.7;
  p.sprite.scale.setScalar(p.base+p.age*2.2);p.sprite.material.opacity=p.strength*.8*(1-p.age/p.life)**2;
 }}
}
