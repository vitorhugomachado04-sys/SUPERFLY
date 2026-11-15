import * as T from './three.js';
export const WATER_LEVEL=-3;
// Water impact preserves the silhouette: spray first, then a slow nose-first sinking.
export class WaterCrash {
 constructor(group,model,f,texture){
  this.group=group;this.center=new T.Vector3(f.x,WATER_LEVEL,f.z);this.size=Math.max(3,f.config.length*.22);
  this.wreck=model.clone(true);this.wreck.visible=true;this.wreck.name='sinking-aircraft';this.start=model.position.clone();this.initialRotation=model.rotation.clone();group.add(this.wreck);
  this.velocity=new T.Vector3(f.vx,0,f.vz);if(this.velocity.length()>60)this.velocity.setLength(60);
  this.spray=[];this.ripples=[];this.owned=[];
  for(let i=0;i<100;i++){
   const angle=i*Math.PI*2/100,spread=this.size*(.6+(i%7)*.18),life=1.3+(i%9)*.13;
   const mat=new T.SpriteMaterial({map:texture,color:i%3?'#d8f1ed':'#a9d7d9',transparent:true,opacity:0,depthWrite:false});
   const sprite=new T.Sprite(mat);sprite.visible=false;sprite.userData.water=true;group.add(sprite);
   this.spray.push({sprite,life,delay:(i%5)*.025,vx:Math.cos(angle)*spread+this.velocity.x*.12,vz:Math.sin(angle)*spread+this.velocity.z*.12,vy:5+(i%11)*.55,base:.18+this.size*.05});
  }
  const ring=new T.RingGeometry(.97,1,64);this.owned.push(ring);
  for(let i=0;i<4;i++){const mat=new T.MeshBasicMaterial({color:'#d1ebe6',transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide}),mesh=new T.Mesh(ring,mat);mesh.rotation.x=-Math.PI/2;mesh.position.copy(this.center);mesh.position.y=WATER_LEVEL+.05+i*.008;group.add(mesh);this.ripples.push(mesh);}
  this.update(0);
 }
 update(t){
  const drift=(1-Math.exp(-t*1.8))*.35,sink=Math.max(0,t-.55);
  this.wreck.position.copy(this.start).addScaledVector(this.velocity,drift);
  this.wreck.position.y=this.start.y+.18*Math.sin(t*6)*Math.exp(-t)-sink*(.6+this.size*.22)-sink*sink*.3;
  this.wreck.rotation.copy(this.initialRotation);this.wreck.rotation.x-=Math.min(.65,sink*.16);this.wreck.rotation.z+=Math.sin(t*1.6)*.08*Math.exp(-t*.2);
  for(const p of this.spray){const age=t-p.delay,y=WATER_LEVEL+.15+p.vy*age-5.5*age*age;p.sprite.visible=age>=0&&age<p.life&&y>WATER_LEVEL;if(!p.sprite.visible)continue;
   p.sprite.position.set(this.center.x+p.vx*age,y,this.center.z+p.vz*age);p.sprite.scale.set(p.base*(1+age*.8),p.base*(2.6-age*.6),1);p.sprite.material.opacity=.85*Math.max(0,1-age/p.life);
  }
  this.ripples.forEach((m,i)=>{const age=t-i*.35;m.visible=age>=0&&age<5;if(!m.visible)return;m.scale.setScalar(this.size*.6+age*(2+this.size*.15));m.material.opacity=.48*Math.max(0,1-age/5);});
 }
 dispose(){for(const p of this.spray)p.sprite.material.dispose();for(const m of this.ripples)m.material.dispose();for(const g of this.owned)g.dispose();}
}
