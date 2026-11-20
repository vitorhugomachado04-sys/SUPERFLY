import * as T from './three.js';
import {airportById,runwayLocal} from './airports.js?v=04.56';
import {jetAircraft} from './jets.js?v=04.56';
import {getAircraft} from './fleet.js?v=04.56';
export const CABLES=[-108,-92,-76,-60];
export function hookPoint(f){const aft=f.config.length*.32+2.35*Math.cos(.58*f.hookExtension);return{x:f.x-Math.sin(f.heading)*aft,z:f.z+Math.cos(f.heading)*aft,y:f.y-.45-2.35*Math.sin(.58*f.hookExtension)-aft*Math.sin(f.pitch)};}
export function stepArrestor(f,dt){
 if(!f.config.naval)return;
 const a=airportById('carrier'),h=hookPoint(f),p=runwayLocal(a,h.x,h.z),old=f.previousHook;f.previousHook={...p,y:h.y};
 if(!f.arrest&&old&&f.ground&&f.hookExtension>.97&&f.gearExtension>.98&&f.flaps>=1&&Math.cos(f.heading-a.heading)>.97&&Math.abs(f.bank)<.15&&f.speed>18&&f.speed<85&&h.y>=a.elevation-.8&&h.y<=a.elevation+.65){
  for(const cable of CABLES)if(old.along<cable&&p.along>=cable&&p.along-old.along<5){const t=(cable-old.along)/(p.along-old.along),cross=old.across+(p.across-old.across)*t;if(Math.abs(cross)<19){f.arrest={cable,time:0,stopped:false,travel:0};break;}}
 }
 if(!f.arrest)return;
 const r=f.arrest;r.time+=dt;
 const speed=Math.hypot(f.vx,f.vz),decel=5+26*(1-Math.exp(-r.time*2.3)),next=Math.max(0,speed-decel*dt);r.travel+=next*dt;
 if(Math.abs(p.across)>25||Math.abs(p.along)>a.length/2-5||r.travel>180){f.arrest=null;return;}
 const ratio=speed?next/speed:0;f.vx*=ratio;f.vz*=ratio;f.vy=0;f.y=a.elevation+f.config.gear;f.ground=true;f.bank*=Math.exp(-dt*8);f.pitch+=(.025*Math.exp(-r.time*1.5)-f.pitch)*(1-Math.exp(-dt*6));
 if(next<.3){r.stopped=true;f.vx=f.vz=0;f.throttle=0;}
}
export function carrierGuidance(f){const a=airportById('carrier'),p=runwayLocal(a,f.x,f.z),distance=Math.max(0,-p.along-130),desired=a.elevation+f.config.gear+distance*.055,delta=f.y-desired;
 if(f.ground&&!f.airborne)return 'CONVÉS 000° · Potência para decolar. Recolha o gancho antes da corrida.';
 if(f.arrest)return f.arrest.stopped?'Convés: parada confirmada. Bem-vindo a bordo.':'CABO PRESO · Reduza a potência. Frenagem em curso.';
 if(f.ground&&p.along>-55)return 'BOLTER · Sem cabo! Potência máxima, decole e faça outra passagem.';
 return `CONVÉS 000° · ${Math.abs(p.across)<12?'ALINHADO':p.across>0?'CORRIJA À ESQUERDA':'CORRIJA À DIREITA'} · ${Math.abs(delta)<9?'NA RAMPA':delta>0?'ALTO':'BAIXO'} · 90–110 kt · G trem / F flaps / H gancho`;
}
export function buildCarrier(scene,world){const a=airportById('carrier'),group=new T.Group();group.position.set(a.x,0,a.z);scene.add(group);const materials=new Map();
 const mat=c=>{if(!materials.has(c))materials.set(c,new T.MeshStandardMaterial({color:c,roughness:.8}));return materials.get(c);};
 const box=(x,y,z,w,h,d,c)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(c));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;group.add(m);return m;};
 // Profiled bow, stern and port-side sponson instead of rectangular slabs.
 const slab=(points,top,depth,color)=>{const shape=new T.Shape();points.forEach(([x,z],i)=>i?shape.lineTo(x,z):shape.moveTo(x,z));shape.closePath();const geo=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false});geo.rotateX(Math.PI/2);const m=new T.Mesh(geo,mat(color));m.position.y=top;m.castShadow=m.receiveShadow=true;group.add(m);return m;};
 slab([[-24,-197],[24,-197],[42,-145],[42,155],[30,190],[-30,190],[-42,155],[-42,-145]],15,19,'#536772');
 slab([[-28,-202],[28,-202],[50,-155],[54,-85],[54,175],[30,202],[-30,202],[-52,178],[-58,70],[-55,-80],[-45,-158]],18,3,'#566169');
 slab([[-25,-197],[25,-197],[38,-145],[38,155],[28,189],[-28,189],[-38,155],[-38,-145]],1.5,3,'#303f49');
 // Starboard island: bridge glazing, flight control, funnel and radar mast.
 box(43,23,-35,18,10,64,'#899b9e');box(43,30,-46,16,6,40,'#afbcba');
 box(43,34,-49,19,2,28,'#304d5b');box(43,36,-49,21,1.5,30,'#bbc7c4');
 for(let z=-60;z<-35;z+=5)box(33.3,34,z,.3,2, .35,'#d5ddd4');
 box(45,38,-25,9,16,13,'#788b91');box(45,46,-25,10,1,14,'#344752');
 box(43,47,-49,1.2,22,1.2,'#b3c2bf');box(43,51,-49,18,.6,2,'#c7d0c7');
 box(43,57,-49,12,4,.7,'#50646d');for(const x of [38,43,48])box(x,60,-49,.18,5,.18,'#b9cac5');
 const radar=new T.Mesh(new T.SphereGeometry(3,12,8),mat('#d2dbd3'));radar.position.set(44,42,-67);group.add(radar);
 world.obstacles.push({x:a.x+43,z:a.z-35,w:22,d:70,top:62});
 // Deck-edge aircraft lifts and a recessed hangar opening below the flight deck.
 for(const [x,z]of[[-44,-100],[43,100]]){box(x,18.04,z,19,.08,29,'#75868a');for(const dx of [-9,9])box(x+dx,18.13,z,.35,.08,28,'#d5bc76');}
 box(-42,10,8,.35,9,40,'#243840');box(-44,15,8,5,1,44,'#8d9b9b');
 for(let z=-10;z<30;z+=8)box(-42.5,10,z,.4,9,.35,'#657980');
 for(const side of [-1,1]){
  box(side*24,18.12,0,.35,.08,380,'#ede7c5');
  for(let z=-165;z<=175;z+=20){const m=new T.Mesh(new T.SphereGeometry(.45,6,4),new T.MeshBasicMaterial({color:'#9fe0cb'}));m.position.set(side*26,18.4,z);group.add(m);world.nightLights.push(m);}
  for(let z=-140;z<170;z+=24){box(side*51,17,z,3,.4,16,'#a6b4ad');box(side*51,18.5,z,.2,3,.2,'#bac5bb');box(side*51,20,z,.2,.2,16,'#bac5bb');}
 }
 for(let z=-180;z<190;z+=18)box(0,18.15,z,.45,.06,9,'#f0ebd0');
 for(const side of [-1,1])box(side*10,18.15,132,1.5,.08,18,'#d4ac6e');
 // Bow catapult tracks and jet blast deflectors outside the landing centerline.
 for(const x of [-15,15]){box(x,18.13,-115,.75,.06,132,'#253d48');box(x+1,18.14,-115,.2,.07,132,'#c6d0c6');box(x,18.3,-43,10,.5,5,'#909e99');}
 // Ten full naval fighters on the apron, pointed toward the bow and centerline.
 const config=getAircraft('naval');
 for(const [x,z]of[[-41,-140],[-43,-105],[-44,-65],[-44,-25],[-44,20],[-43,65],[-41,110],[41,25],[41,65],[41,135]]){
  const parked=jetAircraft(config);parked.mesh.name='parked-naval-fighter';parked.mesh.position.set(x,18+config.gear,z);parked.mesh.rotation.y=x<0?-.22:.22;group.add(parked.mesh);
  parked.update({gearExtension:1,hookExtension:0,speed:0},{roll:0,pitch:0,yaw:0},0);
  world.obstacles.push({x:a.x+x,z:a.z+z,w:14,d:20,top:18+config.gear+4});
  for(const dx of [-7,7])box(x+dx,18.16,z,.2,.06,21,'#e4d298');
 }
 // Tow tractors, deck equipment and stern safety markings.
 for(const z of [48,95]){box(47,19,z,3,2,5,'#d9b05c');box(47,20.5,z-1,2,1,2,'#3d5560');}
 for(let x=-20;x<=20;x+=5)box(x,18.14,192,2,.08,5,'#e3d7b3');
 const cables=CABLES.map(along=>{const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute([-20,18.16,-along,0,18.16,-along,20,18.16,-along],3));const line=new T.Line(geo,new T.LineBasicMaterial({color:'#f2b969'}));group.add(line);return line;});
 const lights=[];for(let i=-2;i<=2;i++){const m=box(-22,20+i*.65,140,1.5,.45,.6,i===0?'#7be6ac':'#e88e70');lights.push(m);}
 return {group,update(f){const h=hookPoint(f);cables.forEach((line,i)=>{const v=line.geometry.attributes.position;v.setXYZ(1,f.arrest?.cable===CABLES[i]?h.x-a.x:0,18.16,f.arrest?.cable===CABLES[i]?h.z-a.z:-CABLES[i]);v.needsUpdate=true;line.geometry.computeBoundingSphere();});const p=runwayLocal(a,f.x,f.z),delta=f.y-(a.elevation+f.config.gear+Math.max(0,-p.along-130)*.055);lights.forEach((l,i)=>{l.material.emissive.set(Math.abs(i-2-Math.round(Math.max(-2,Math.min(2,delta/10))))<.5?'#c2aa63':'#000000');});}};
}
