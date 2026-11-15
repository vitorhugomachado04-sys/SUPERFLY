import * as T from './three.js';
export function jetAircraft(c){
 const g=new T.Group(),cache=new Map(),white=(c.id==='fighter'||c.naval)?'#aebcbb':'#f3ecdc',purple='#6a659e',dark='#2b414c';
 const mat=color=>{if(!cache.has(color))cache.set(color,new T.MeshStandardMaterial({color,roughness:.65,flatShading:true}));return cache.get(color);};
 const add=(geo,color,x=0,y=0,z=0,parent=g)=>{const m=new T.Mesh(geo,mat(color));m.position.set(x,y,z);parent.add(m);return m;};
 const box=(x,y,z,w,h,d,color,parent=g)=>add(new T.BoxGeometry(w,h,d),color,x,y,z,parent);
 function tube(x,y,z,r,length,color){const m=add(new T.CylinderGeometry(r,r,length,16),color,x,y,z);m.rotation.x=Math.PI/2;return m;}
 function fuselage(stations){const vertices=[],indices=[],n=16;for(const [z,r]of stations)for(let j=0;j<n;j++){const a=j/n*Math.PI*2;vertices.push(Math.cos(a)*r,Math.sin(a)*r,z);}for(let k=0;k<stations.length-1;k++)for(let j=0;j<n;j++){const a=k*n+j,b=k*n+(j+1)%n,d=a+n,e=b+n;indices.push(a,b,d,b,e,d);}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();return add(geo,white);}
 // Extruded planforms give swept wings their own silhouette, not scaled boxes.
 function surface(points,thickness,color,y=0,parent=g){const shape=new T.Shape();points.forEach(([x,z],i)=>i?shape.lineTo(x,z):shape.moveTo(x,z));shape.closePath();const geo=new T.ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:false});geo.rotateX(Math.PI/2);const m=add(geo,color,0,y,0,parent);return m;}
 function wing(span,rootFront,rootBack,tipFront,tipBack,y,color=white){for(const side of [-1,1])surface([[0,rootFront],[side*span,tipFront],[side*span,tipBack],[0,rootBack]],.16,color,y);}
 function fin(z,height,chord,color){const m=surface([[0,0],[height,chord*.45],[height,chord*.7],[0,chord]],.18,color);m.rotation.z=Math.PI/2;m.position.set(0,0,z);return m;}
 function engine(x,y,z,r,length){tube(x,y,z,r,length,white);const intake=add(new T.CylinderGeometry(r*.82,r*.82,.06,16),dark,x,y,z-length/2-.025);intake.rotation.x=Math.PI/2;const hub=add(new T.ConeGeometry(r*.25,r*.55,10),purple,x,y,z-length/2-.12);hub.rotation.x=-Math.PI/2;tube(x,y,z+length*.46,r*.68,length*.15,'#47545b');}
 let ailerons=[],elevators=[],rudders=[];
 if(c.id==='boeing'){
  fuselage([[-18,.05],[-17,.8],[-15,1.7],[-12,1.9],[10,1.9],[14,1.25],[18,.1]]);
  wing(17,-4,4,5.2,7.5,-.35);wing(6.3,12,16,15,17,.75);
  fin(11,6.5,6,purple);
  for(const side of [-1,1]){
   box(side*5,-1.1,-1.5,.5,1.3,2.5,purple);engine(side*5,-2,-2.3,1.3,4.6);
   const winglet=box(side*16.8,.5,6.4,.2,2.5,2.1,purple);winglet.rotation.z=-side*.2;
   for(let z=-11;z<10;z+=1.05)box(side*1.88,.5,z,.07,.43,.53,dark);
   box(side*1.9,-.1,-.5,.06,.23,26,purple);
   ailerons.push(box(side*12,-.35,6,6,.12,.7,purple));elevators.push(box(side*3.8,.75,16,4.5,.12,.7,purple));
  }
  const glass=add(new T.SphereGeometry(1,12,8),dark,0,.85,-15);glass.scale.set(1.35,.7,1.5);
  rudders.push(box(0,3.1,16,.22,4,1,purple));
 }else if(c.id==='executive'){
  fuselage([[-7.5,.03],[-6.5,.55],[-4.5,.9],[3.7,.9],[6.3,.5],[7.5,.06]]);
  wing(7.4,-1.6,1.9,2.7,3.6,-.15);fin(4,3.3,3,purple);wing(3.2,4.7,6.7,6.2,7.2,3.1);
  for(const side of [-1,1]){
   box(side*1.2,.15,3.8,.9,.18,1.4,purple);engine(side*1.65,.25,3.8,.58,2.8);
   for(let z=-3.5;z<2.5;z+=1)box(side*.89,.2,z,.06,.38,.48,dark);
   box(side*.9,-.27,-1,.05,.18,9,purple);
   ailerons.push(box(side*5.3,-.15,2.9,3,.1,.45,purple));elevators.push(box(side*1.7,3.1,6.8,2.5,.1,.4,purple));
  }
  const glass=add(new T.SphereGeometry(1,12,8),dark,0,.45,-5);glass.scale.set(.7,.45,1.15);rudders.push(box(0,1.7,6.7,.16,2,.55,purple));
 }else{
  fuselage([[-7.8,.02],[-5.3,.55],[-2.4,.82],[2,.85],[6.3,.6],[7.5,.48]]);
  wing(5.2,-2,3.2,1.8,4.1,0);wing(3.5,4.2,7.3,6,7.6,.1);if(c.naval){for(const side of [-1,1]){const tail=fin(3.7,2.8,3.4,purple);tail.position.x=side*1.15;tail.rotation.z+=side*.15;engine(side*.55,-.1,5.6,.48,2.8);}}else fin(3.7,3.4,3.4,purple);
  const canopy=add(new T.SphereGeometry(1,16,10),'#527e8c',0,.7,-2.5);canopy.scale.set(.65,.7,1.9);
  box(0,-.65,-1.2,1.25,.65,2.7,dark);if(!c.naval){tube(0,0,7,.65,1.2,'#46515c');tube(0,0,7.65,.5,.1,'#262e36');}else for(const side of [-1,1])tube(side*.55,-.1,7.2,.43,.15,'#262e36');
  for(const side of [-1,1]){surface([[side*.5,-4],[side*1.5,-1],[side*1.6,1],[side*.5,2]],.12,white,.1);ailerons.push(box(side*3.5,0,3.6,2.5,.1,.5,purple));elevators.push(box(side*2,.1,6.8,2.2,.1,.6,purple));}
  for(const x of c.naval?[-1.15,1.15]:[0])rudders.push(box(x,1.7,6.5,.16,2.3,.6,purple));
 }
 // Each wheel assembly pivots into the fuselage/wing; gear doors open in transit.
 const gears=[],doors=[],wheelRadius=c.id==='boeing'?.65:c.id==='executive'?.32:.34;
 for(const [x,z,side]of [[-c.wheelTrack,c.wheelZ,-1],[c.wheelTrack,c.wheelZ,1],[0,-c.length*.32,0]]){
  const pivot=new T.Group();pivot.position.set(x,-c.belly*.7,z);g.add(pivot);
  const leg=c.gear-c.belly*.7-wheelRadius;
  box(0,-leg/2,0,.13,leg,.13,'#adb5b4',pivot);
  const wheels=[];
  for(const offset of (c.id==='boeing'?[-.35,.35]:[0])){const w=add(new T.CylinderGeometry(wheelRadius,wheelRadius,wheelRadius*.7,12),'#29313b',offset,-leg,0,pivot);w.rotation.z=Math.PI/2;wheels.push(w);}
  const door=box(x,-c.belly*.72,z,c.id==='boeing'?1.1:.65,.08,c.id==='boeing'?2.2:1.2,white);doors.push(door);gears.push({pivot,side,wheels});
 }
 const hook=new T.Group();hook.position.set(0,-.45,c.length*.32);g.add(hook);hook.visible=!!c.naval;const rod=box(0,0,1.2,.14,.14,2.4,'#d3c9a4',hook);box(0,-.12,2.35,.32,.35,.2,'#343f48',hook);
 g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
 return{mesh:g,gears,update(f,u,dt){hook.rotation.x=(f.hookExtension||0)*.58;const extension=f.gearExtension??1,retracted=1-extension;gears.forEach(({pivot,side,wheels},i)=>{const e=f.gearFault?(i===1?.15:1):extension,r=1-e;pivot.visible=e>.015;pivot.rotation.z=-side*r*Math.PI*.48;pivot.rotation.x=side?0:-r*Math.PI*.48;wheels.forEach(w=>w.rotation.x+=(f.speed||0)*dt/wheelRadius);});doors.forEach((door,i)=>{door.rotation.z=Math.sin(extension*Math.PI)*(i===0?-1:1)*1.15;});ailerons.forEach((a,i)=>a.rotation.x=(i%2?-1:1)*u.roll*.35);elevators.forEach(e=>e.rotation.x=-u.pitch*.3);rudders.forEach(r=>r.rotation.y=-u.yaw*.3);}};
}
