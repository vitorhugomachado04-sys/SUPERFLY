import * as T from './three.js';
import {terrain} from './geography.js?v=04.3';
export class LettermanCode{
 constructor(onComplete){this.onComplete=onComplete;this.reset();}
 reset(){this.buffer='';this.last=0;}
 feed(e,enabled,now){
  if(!enabled||e.ctrlKey||e.metaKey||e.altKey||e.target?.isContentEditable||['INPUT','SELECT','TEXTAREA'].includes(e.target?.tagName)){this.reset();return false;}
  if(now-this.last>3000)this.buffer='';const key=e.key?.toLowerCase();if(e.repeat)return !!this.buffer&&key?.length===1;if(key?.length!==1)return false;
  const candidate=this.buffer+key;this.buffer='letterman'.startsWith(candidate)?candidate:key==='l'?'l':'';this.last=now;
  if(this.buffer==='letterman'){this.reset();this.onComplete();return true;}return !!this.buffer;
 }
}
// A weighted towline and cloth spine: inertia, air drag, gravity and length constraints.
export class BannerTow{
 constructor(){this.reset();}
 reset(){this.nodes=[];this.previous=[];this.acc=0;this.tension=0;}
 update(dt,f,length){
  const q=new T.Quaternion().setFromEuler(new T.Euler(f.pitch||0,-f.heading,-(f.bank||0),'YXZ'));
  const anchor=new T.Vector3(0,.4,3).applyQuaternion(q).add(new T.Vector3(f.x,f.y,f.z));
  const back=new T.Vector3(-Math.sin(f.heading),0,Math.cos(f.heading));
  if(!this.nodes.length){for(let i=0;i<=40;i++){const d=i<=8?i*9/8:9+(i-8)*length/32;const p=anchor.clone().addScaledVector(back,d);this.nodes.push(p);this.previous.push(p.clone());}this.lastAnchor=anchor.clone();}
  if(dt<=0)return;
  this.acc+=Math.min(dt,.1);const step=1/120;
  const speed=Math.hypot(f.vx||0,f.vy||0,f.vz||0),target=T.MathUtils.smoothstep(speed,4,38);
  this.tension+=(target-this.tension)*(1-Math.exp(-dt*2));
  while(this.acc>=step){this.acc-=step;
   // Move the attachment through the frame instead of snapping the entire banner.
   const a=this.lastAnchor.clone().lerp(anchor,1-this.acc/Math.min(dt,.1));this.nodes[0].copy(a);
   for(let i=1;i<=40;i++){const p=this.nodes[i],old=p.clone(),velocity=p.clone().sub(this.previous[i]).multiplyScalar(Math.exp(-step*1.8));p.add(velocity);p.y-=9.81*step*step;this.previous[i].copy(old);}
   for(let pass=0;pass<12;pass++){this.nodes[0].copy(a);for(let i=1;i<=40;i++){const left=this.nodes[i-1],p=this.nodes[i],delta=p.clone().sub(left),distance=delta.length(),rest=i<=8?9/8:length/32;if(distance>1e-7){delta.multiplyScalar((distance-rest)/distance);if(i===1)p.sub(delta);else{left.addScaledVector(delta,.5);p.addScaledVector(delta,-.5);}}const floor=Math.max(0,terrain(p.x,p.z))+(i>8?.18+this.tension*.95:.1);if(p.y<floor){p.y=floor;this.previous[i].x+=(p.x-this.previous[i].x)*.4;this.previous[i].z+=(p.z-this.previous[i].z)*.4;}}}
  }
  this.lastAnchor.copy(anchor);
 }
}
export class LettermanBanner{
 constructor(scene){this.group=new T.Group();scene.add(this.group);this.canvas=document.createElement('canvas');this.canvas.width=4096;this.canvas.height=192;this.texture=new T.CanvasTexture(this.canvas);this.texture.colorSpace=T.SRGBColorSpace;this.material=new T.MeshBasicMaterial({map:this.texture,side:T.FrontSide});this.tow=new BannerTow();this.cord=new T.Line(new T.BufferGeometry().setFromPoints(Array.from({length:9},()=>new T.Vector3())),new T.LineBasicMaterial({color:'#ddd5bc'}));this.group.add(this.cord);this.panels=[];for(const side of [-1,1]){const m=new T.Mesh(new T.PlaneGeometry(1,2.2,48,2),this.material);m.rotation.y=side*Math.PI/2;m.position.x=side*.015;this.group.add(m);this.panels.push(m);}this.reset();}
 reset(){this.text='';this.group.visible=false;this.time=0;this.tow.reset();}
 setText(text){
  this.text=Array.from(text.replace(/[\r\n]/g,' ')).slice(0,160).join('');this.group.visible=!!this.text.trim();
  const ctx=this.canvas.getContext('2d');ctx.font='bold 100px sans-serif';const width=Math.max(240,ctx.measureText(this.text).width+100);this.length=Math.max(5,width/90);
  // Keep GPU texture dimensions fixed after the first upload. Resize the drawing,
  // not the canvas, and reuse the same cloth meshes while the user types.
  ctx.setTransform(this.canvas.width/width,0,0,1,0,0);ctx.fillStyle='#fff1d4';ctx.fillRect(0,0,width,192);ctx.strokeStyle='#7840b9';ctx.lineWidth=12;ctx.strokeRect(6,6,width-12,180);ctx.fillStyle='#6431a0';ctx.font='bold 100px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(this.text,width/2,98);this.texture.needsUpdate=true;
  for(const m of this.panels){m.scale.setScalar(1);m.position.set(0,0,0);m.rotation.set(0,0,0);}

 }
 camera(camera,f){if(!this.group.visible)return;const q=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),-f.heading),origin=new T.Vector3(f.x,f.y,f.z);camera.position.copy(new T.Vector3(16+this.length*.55,9+this.length*.12,22+this.length*.7).multiplyScalar(Math.max(1,1/camera.aspect)).applyQuaternion(q).add(origin));camera.lookAt(new T.Vector3(0,0,6+this.length*.4).applyQuaternion(q).add(origin));}
 update(dt,f){this.group.visible=!!this.text.trim()&&f.config.id==='cessna'&&!f.crashed;if(!this.group.visible)return;this.time+=dt;this.tow.update(dt,f,this.length);this.group.position.set(f.x,f.y,f.z);this.group.rotation.set(0,0,0);
  const origin=this.group.position,nodes=this.tow.nodes,tension=this.tow.tension,cord=this.cord.geometry.attributes.position;
  for(let i=0;i<9;i++)cord.setXYZ(i,nodes[i].x-f.x,nodes[i].y-f.y,nodes[i].z-f.z);cord.needsUpdate=true;this.cord.geometry.computeBoundingSphere();
  for(let side=0;side<2;side++){const mesh=this.panels[side],p=mesh.geometry.attributes.position,uv=mesh.geometry.attributes.uv;
   for(let i=0;i<p.count;i++){const u=side===0?uv.getX(i):1-uv.getX(i),index=u*32,lo=Math.min(31,Math.floor(index)),center=nodes[8+lo].clone().lerp(nodes[9+lo],index-lo),next=nodes[Math.min(40,9+lo)],prev=nodes[Math.max(8,7+lo)],tangent=next.clone().sub(prev).normalize(),normal=new T.Vector3(tangent.z,0,-tangent.x).normalize();
    const flutter=Math.sin(u*this.length*1.6-this.time*(3+9*tension))*(.07+.28*tension)*u;
    // Full-width fabric lays flat near the ground instead of shrinking.
    const floor=Math.max(0,terrain(center.x,center.z)),angle=T.MathUtils.smoothstep(center.y-floor,.2,1.2)*Math.PI/2;
    const across=(uv.getY(i)-.5)*2.2,face=side===0?-.015:.015;
    center.addScaledVector(normal,across*Math.cos(angle)+flutter+face*Math.sin(angle));center.y+=across*Math.sin(angle)-face*Math.cos(angle);
    center.y=Math.max(Math.max(0,terrain(center.x,center.z))+.035,center.y);center.sub(origin);p.setXYZ(i,center.x,center.y,center.z);
   }p.needsUpdate=true;mesh.geometry.computeBoundingSphere();
  }
 }
}
