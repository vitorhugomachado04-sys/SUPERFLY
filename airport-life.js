import {aircraft} from './aircraft.js?v=04.43';
import * as T from './three.js';
import {jetAircraft} from './jets.js?v=04.43';
import {getAircraft} from './fleet.js?v=04.43';

export const PARKING_STANDS=[-480,-410,-340,-270,-200];
export function addAirportLife(scene,obstacles){
 const group=new T.Group();group.name='airport-terminal-and-parked-boeings';scene.add(group);
 const mats=new Map(),cube=new T.BoxGeometry(1,1,1);
 function block(x,y,z,w,h,d,color){if(!mats.has(color))mats.set(color,new T.MeshStandardMaterial({color,roughness:.8}));const m=new T.Mesh(cube,mats.get(color));m.position.set(x,y,z);m.scale.set(w,h,d);m.castShadow=m.receiveShadow=true;group.add(m);return m;}
 // One model shared by all static copies; no additional per-frame animation.
 const config=getAircraft('boeing'),prototype=jetAircraft(config);
 prototype.update({gearExtension:1,speed:0},{roll:0,pitch:0,yaw:0},0);
 for(const z of PARKING_STANDS){
  const plane=prototype.mesh.clone(true);plane.name='parked-boeing-737';plane.position.set(115,3+config.gear,z);plane.rotation.y=Math.PI/2;group.add(plane);
  obstacles.push({x:115,z,w:36,d:4,top:11},{x:113,z,w:12,d:34,top:7});
  // Mobile boarding stairs beside the forward door.
  for(let i=0;i<7;i++)block(135,3.2+i*.21,z-8+i*.65,2,.4+i*.42,.65,'#e5dfc9');
  block(135,6.2,z-3.6,2,.3,2,'#6a659e');
  // Tow tractor and two baggage carts, clear of the taxi lane.
  block(145,4,z+11,3,2,4,'#e4d878');block(145,5.2,z+11,2,1,2,'#536d73');
  for(let j=0;j<2;j++){block(145,3.6,z+17+j*5,2.4,1.1,3.5,'#6a659e');block(145,4.3,z+17+j*5,2, .5,3,'#c9c5ae');}
 }
 // Low terminal with a glass apron facade and shaded entrance canopy.
 block(177,9,-340,28,12,340,'#e4ddc5');block(161.9,9,-340,.25,7,326,'#527983');
 block(174,15.6,-340,36,1.2,348,'#6a659e');
 for(let z=-495;z<=-185;z+=15)block(161.5,9,z,.6,10,.6,'#e5dfc9');
 obstacles.push({x:174,z:-340,w:36,d:348,top:16.2});
 for(const z of [-525,-155]){block(151,11,z,.55,16,.55,'#697d7c');block(149,19,z,5,.4,1.5,'#f5e8b7');}
 parked(group,obstacles,'cessna',99,75,3,'school');
 block(99,3.03,75,18,.04,20,'#9aa69b');
 block(108,4,85,2,2,3,'#d9c87b');
 // Flight-school clubhouse, briefing windows and a shaded observation deck.
 block(170,7,360,40,8,28,'#ede4c7');block(149.8,7,360,.3,5,23,'#618b9a');
 block(168,11.6,360,46,1.2,32,'#7770ac');block(142,7.5,360,14,.6,32,'#aaa1ce');
 for(const z of [346,374]){block(136,5,z,.5,4,.5,'#e8e2cb');block(140,3.8,z+2,6,1,2,'#967a59');}
 obstacles.push({x:168,z:360,w:46,d:32,top:12.2});
 airportSign(group,'PANORAMA • ESCOLA DE VOO',149.5,10,360,25);
 return group;
}

// Static models share their geometry and remain part of regional streaming.
const parkedModels=new Map();
function parked(scene,obstacles,id,x,z,y,airport){
 const c=getAircraft(id);if(!parkedModels.has(id)){const model=aircraft(c);model.update({gearExtension:1,speed:0,throttle:0},{roll:0,pitch:0,yaw:0},0);parkedModels.set(id,model.mesh);}
 const plane=parkedModels.get(id).clone(true);plane.name=`parked-${id}`;plane.userData.airport=airport;plane.position.set(x,y+c.gear,z);plane.rotation.y=Math.PI/2;scene.add(plane);
 obstacles.push({x,z,w:c.length,d:c.halfSpan*2,top:y+c.gear+5});return plane;
}
export function addRegionalAirportLife(scene,world,a,{item,ground,r}){
 const fleet=a.id==='city'?Array(14).fill('boeing'):a.id==='base'?['skycourier','fighter','fighter','executive']:a.id==='snow'?['skycourier','cessna','skycourier']:a.id==='wind'?['cessna','cessna','cessna','skycourier']:a.id==='dunes'?['cessna','cessna','skycourier']:['cessna','cessna','skycourier'];
 const ax=a.x-r.x,az=a.z-r.z,spacing=a.id==='city'?110:60,start=a.id==='city'?-770:-90;
 for(let i=0;i<fleet.length;i++){
  const x=ax+(a.id==='city'?112:86),z=az+start+i*spacing,id=fleet[i],c=getAircraft(id),w=c.length+12,d=c.halfSpan*2+12;
  const top=ground(x,z)+.035;
  parked(scene,world.obstacles,id,r.x+x,r.z+z,top,a.id);
  // Stand boundary, yellow lead-in and wheel chocks.
  item(x,top+.025,z-d/2+1,w-2,.04,.35,'#e9ddb0');item(x,top+.025,z+d/2-1,w-2,.04,.35,'#e9ddb0');
  item(x-w*.35,top+.04,z,w*.25,.06,.45,'#e1c773');
  for(const side of [-1,1])item(x,top+.2,z+side*c.wheelTrack,.6,.35,.6,'#cfa95d');
  const sx=x+28,sy=ground(sx,z+21);item(sx,sy+1,z+21,3,2,4,'#dfc775');item(sx,sy+2.2,z+21,2,1.3,2,'#52737c');
  for(let j=0;j<2;j++)item(sx,ground(sx,z+27+j*5)+.8,z+27+j*5,2,1.6,3.5,'#8c91a1');
 }
 // A continuous taxi lane and short connectors; no overlap with the runway.
 const lanePositions=[],laneIndices=[],laneMarks=[];
 for(let z=az+start-30;z<=az+start+(fleet.length-1)*spacing+30;z+=5){
  for(const dx of [-7.5,7.5])lanePositions.push(r.x+ax+54+dx,ground(ax+54+dx,z)+.25,r.z+z);
  for(const dx of [-.22,.22])laneMarks.push(r.x+ax+54+dx,ground(ax+54+dx,z)+.28,r.z+z);
  const n=lanePositions.length/3-2;if(n>=2)laneIndices.push(n-2,n,n-1,n-1,n,n+1);
 }
 for(const [positions,color]of [[lanePositions,'#8a9894'],[laneMarks,'#e3cf8e']]){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setIndex(laneIndices);geo.computeVertexNormals();const m=new T.Mesh(geo,new T.MeshStandardMaterial({color,roughness:1}));m.receiveShadow=true;scene.add(m);}

 addAirportArchitecture(world,a,{item,ground,r});
 airportSign(scene,a.id.toUpperCase()+' • TERMINAL',a.x+(a.id==='city'?183:121),a.elevation+(a.id==='city'?23:8),a.z+(a.id==='city'?-55:-205),a.id==='city'?100:22);
 // Fuel station, utility truck, covered waiting shelter and apron lamps.
 const x=ax+160,z=az+240,y=ground(x,z);
 item(x,y+4,z,9,8,9,'#c8cdc0','cylinder');item(x,y+8.5,z,9.5,1,9.5,'#7c9395','cylinder');world.obstacles.push({x:r.x+x,z:r.z+z,w:20,d:20,top:y+10});
 item(x+23,ground(x+23,z)+2,z,4,4,10,'#d9c9a4');item(x+23,ground(x+23,z)+4,z-3,4,2,3,'#5c7b85');
 for(const dz of [-210,210]){const lx=ax+118,lz=az+dz,ly=ground(lx,lz);item(lx,ly+8,lz,.6,16,.6,'#748886');item(lx-2,ly+16,lz,5,.4,2,'#f2e6bd');world.obstacles.push({x:r.x+lx,z:r.z+lz,w:1,d:1,top:ly+16});}
 (world.airportLifeInfo??={})[a.id]=fleet;
}

// Buildings face the apron; the compact back edge stays clear of the mountains.
function addAirportArchitecture(world,a,{item,ground,r}){
 const x=a.x-r.x,z=a.z-r.z,city=a.id==='city',cold=['alpine','peak','snow'].includes(a.id),desert=['base','dunes'].includes(a.id);
 const wall=a.id==='base'?'#a6ac91':cold?'#a57c59':desert?'#dbc19a':a.id==='wind'?'#d8ddc4':'#c3d4d6';
 const trim=cold?'#eff0e5':desert?'#9c7960':a.id==='wind'?'#658a76':'#7470aa';
 const add=(dx,y,dz,w,h,d,c,kind='box')=>item(x+dx,a.elevation+y,z+dz,w,h,d,c,kind);
 const solid=(dx,dz,w,d,h)=>world.obstacles.push({x:a.x+dx,z:a.z+dz,w,d,top:a.elevation+h});
 if(city){
  // Fourteen gates on a long glass concourse, with a generous terminal hall.
  add(220,13,-55,72,26,1590,wall);solid(220,-55,78,1600,31);
  add(183.8,14,-55,.4,19,1560,'#527f91');add(220,27,-55,80,2,1600,'#dae3df');
  for(let i=0;i<14;i++){const dz=-770+i*110;
   add(220,30,dz,66,5,64,'#a7c5cb');add(220,33,dz,48,1,48,'#5c8998');
   // Side entrance reaches the aircraft door without crossing the fuselage.
   add(157,5,dz-9,52,4,5,'#c8d2d0');add(135,4,dz-9,7,5,7,'#647b89');
   add(157,5,dz-11.6,46,2,.2,'#4e7b8a');solid(158,dz-9,52,5,8);
   for(const dd of [-40,40])add(183.4,14,dz+dd,1,22,1,'#d9e3de');
   add(249,3,dz,12,6,24,'#708ba0');add(249,6.5,dz,12,1,24,trim);
   // Ground power unit and apron safety equipment.
   add(145,1,dz+19,4,2,3,'#e5c777');
  }
  add(220,20,790,84,40,100,wall);add(177.8,21,790,.3,30,86,'#537e90');add(220,41,790,90,2,108,trim);solid(220,790,90,108,43);
 }else{
  for(let i=0;i<3;i++){const dz=-150+i*120;
   add(146,7,dz,40,14,56,wall);add(146,16,dz,44,cold?8:3,60,trim,cold?'roof':'box');
   add(125.8,6,dz,.3,10,40,'#435965');solid(146,dz,44,60,cold?21:18);
   for(let j=0;j<5;j++)add(125.5,6,dz-16+j*8,.4,10,.35,'#9baea8');
   add(146,5,dz+28.2,26,3,.3,'#668c96');
  }
  // Regional departure lounge, verandah and shaded passenger seating.
  add(143,4,-205,42,8,25,wall);add(143,9,-205,46,2,29,trim);add(121.8,4,-205,.3,5,21,'#61828a');solid(143,-205,46,29,11);
  add(114,5,-205,14,.6,29,trim);
  for(const dz of [-217,-193]){add(109,2.5,dz,.5,5,.5,wall);add(114,1,dz+3,5,1,1.5,'#8a7054');}
  if(desert){for(const dz of [-175,120]){add(158,20,dz,5,8,5,wall);add(158,24.5,dz,6,1,6,trim);}}
  if(cold){for(const dz of [-130,-10,110]){add(155,19,dz,3,9,3,'#726b62');add(170,1,dz,6,2,15,'#eceee5');}}
  if(a.id==='wind'){for(let i=0;i<5;i++)add(144,18,-150+i*9,30,.3,6,'#476f86');}
 }
 // Repeated apron light poles, service bays and clear stop lines.
 const count=city?7:3;
 for(let i=0;i<count;i++){const dz=city?-720+i*220:-175+i*120,dx=city?170:115;
  add(dx,9,dz,.5,18,.5,'#738581');add(dx,18,dz,7,.5,2,'#f5e5b9');solid(dx,dz,1,1,19);
 }
}

function airportSign(scene,label,x,y,z,width){
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=128;const ctx=canvas.getContext('2d');
 ctx.fillStyle='#394d62';ctx.fillRect(0,0,1024,128);ctx.fillStyle='#f4f3ea';ctx.font='600 54px sans-serif';ctx.textAlign='center';ctx.fillText(label,512,84);
 const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;
 const sign=new T.Mesh(new T.PlaneGeometry(width,width/8),new T.MeshBasicMaterial({map:tex}));sign.position.set(x,y,z);sign.rotation.y=-Math.PI/2;scene.add(sign);
}
