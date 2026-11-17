import * as T from './three.js';
import {cloudTexture} from './clouds.js?v=04.45';
export function aerobaticAircraft(){
 const g=new T.Group(),purple=new T.MeshStandardMaterial({color:'#813ee0',roughness:.35}),white=new T.MeshStandardMaterial({color:'#fff3de'}),dark=new T.MeshStandardMaterial({color:'#243144'});
 const add=(geo,mat,x,y,z,parent=g)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m;};
 const box=(x,y,z,w,h,d,mat,parent=g)=>add(new T.BoxGeometry(w,h,d),mat,x,y,z,parent);
 const body=add(new T.CylinderGeometry(.14,.57,5.5,14),purple,0,.15,.15);body.rotation.x=Math.PI/2;
 const nose=add(new T.SphereGeometry(.58,16,12),white,0,.15,-2.15);nose.scale.set(1,.8,1.3);
 const canopy=add(new T.SphereGeometry(1,20,12),new T.MeshStandardMaterial({color:'#7ec4d5',transparent:true,opacity:.73,metalness:.35,roughness:.1}),0,.6,-.55);canopy.scale.set(.46,.58,1.05);
 box(0,.05,-.25,7.8,.14,1.35,white);box(0,.36,2.45,3.1,.11,.8,white);const fin=box(0,1,2.42,.12,1.4,.85,purple);fin.rotation.x=-.2;
 for(const side of [-1,1]){box(side*3.1,.055,-.25,1.1,.16,1.38,purple);box(side*2.1,.14,-.25,.3,.015,1.3,purple);const strut=box(side*.65,-.42,-.8,.12,.95,.14,purple);strut.rotation.z=side*.6;const wheel=add(new T.CylinderGeometry(.25,.25,.18,12),dark,side*.95,-.95,-.8);wheel.rotation.z=Math.PI/2;const fairing=add(new T.SphereGeometry(1,12,8),purple,side*.95,-.82,-.8);fairing.scale.set(.2,.22,.47);}
 const tailwheel=add(new T.CylinderGeometry(.13,.13,.12,10),dark,0,-1.07,2.3);tailwheel.rotation.z=Math.PI/2;box(0,-.5,2.3,.08,.95,.08,dark);
 const prop=new T.Group();prop.position.set(0,.15,-2.95);g.add(prop);for(let i=0;i<3;i++){const blade=box(0,.55,0,.14,1.2,.06,dark);g.remove(blade);const pivot=new T.Group();pivot.rotation.z=i*Math.PI*2/3;pivot.add(blade);prop.add(pivot);}
 const spinner=add(new T.ConeGeometry(.22,.45,12),purple,0,.15,-3.13);spinner.rotation.x=-Math.PI/2;
 const ailerons=[-1,1].map(s=>box(s*2.65,.04,.5,2,.09,.3,purple));const elevator=box(0,.36,2.95,2.9,.08,.25,purple);
 g.traverse(o=>{if(o.isMesh)o.castShadow=o.receiveShadow=!o.material.transparent;});
 return {mesh:g,update(f,u,dt){prop.rotation.z+=dt*(18+f.throttle*130);ailerons.forEach((a,i)=>a.rotation.x=u.roll*(i?-.4:.4));elevator.rotation.x=-u.pitch*.4;}};
}
export class AerobaticSmoke{
 constructor(scene){this.group=new T.Group();scene.add(this.group);const map=cloudTexture(81,64);this.particles=Array.from({length:480},()=>{const m=new T.Sprite(new T.SpriteMaterial({map,color:'#a04af5',transparent:true,depthWrite:false,opacity:0}));m.visible=false;this.group.add(m);return {m,age:20};});this.reset();}
 reset(){this.enabled=false;this.cursor=0;this.time=0;this.previous=null;for(const p of this.particles){p.age=20;p.m.visible=false;}}
 update(dt,f){if(dt<=0)return;
  for(const p of this.particles){p.age+=dt;if(p.age>=9){p.m.visible=false;continue;}p.m.position.y+=dt*.5;p.m.scale.setScalar(1.1+p.age*1.4);p.m.material.opacity=.65*(1-p.age/9);}
  if(!this.enabled||!f.config.aerobatic||f.ground||f.crashed){this.previous=null;this.time=0;return;}
  const q=new T.Quaternion().setFromEuler(new T.Euler(f.pitch,-f.heading,-f.bank,'YXZ')),pos=new T.Vector3(0,-.25,2.7).applyQuaternion(q).add(new T.Vector3(f.x,f.y,f.z));
  const before=this.previous||pos;this.time+=dt;const count=Math.min(20,Math.floor(this.time*45));this.time-=count/45;
  for(let i=0;i<count;i++){const p=this.particles[this.cursor++%this.particles.length];p.age=0;p.m.visible=true;p.m.position.copy(before).lerp(pos,(i+1)/count);p.m.scale.setScalar(1.1);p.m.material.opacity=.65;}this.previous=pos;
 }
}
