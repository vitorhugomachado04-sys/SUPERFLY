import {airportById} from './airports.js?v=04.44';
import {topCamera} from './top-camera.js?v=04.44';
import * as T from './three.js';
import {terrain} from './geography.js?v=04.44';
import {buildYacht} from './yacht.js?v=04.44';
import {aircraft} from './aircraft.js?v=04.44';
import {getAircraft} from './fleet.js?v=04.44';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const ZERO={pitch:0,roll:0,yaw:0,power:0,brake:false};
export class ChallengeAdventures{
 constructor(scene,parachute){this.scene=scene;this.parachute=parachute;this.group=new T.Group();scene.add(this.group);this.active=false;this.materials=new Map();}
 reset(){this.active=false;this.parachute.surface=null;const gs=new Set(),ms=new Set();this.group.traverse(o=>{if(o.geometry)gs.add(o.geometry);if(o.material)ms.add(o.material);});this.group.clear();gs.forEach(g=>g.dispose());ms.forEach(m=>{m.map?.dispose();m.dispose();});this.materials.clear();this.checkpoint=null;this.fields=null;this.target=null;this.flight=null;}
 mesh(geo,color,x,y,z,parent=this.group){if(!this.materials.has(color))this.materials.set(color,new T.MeshStandardMaterial({color,roughness:.65}));const m=new T.Mesh(geo,this.materials.get(color));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
 box(x,y,z,w,h,d,color,parent){return this.mesh(new T.BoxGeometry(w,h,d),color,x,y,z,parent);}
 ring(x,y,z,r=16,color='#cbb2ff',parent){const m=this.mesh(new T.TorusGeometry(r,.3,6,64),color,x,y,z,parent);m.rotation.x=Math.PI/2;return m;}
 line(){const l=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(),new T.Vector3()]),new T.LineBasicMaterial({color:'#eee9db'}));this.group.add(l);return l;}
 setLine(l,a,b){const v=l.geometry.attributes.position;v.setXYZ(0,a.x,a.y,a.z);v.setXYZ(1,b.x,b.y,b.z);v.needsUpdate=true;l.geometry.computeBoundingSphere();}
 person(x,y,z,parent=this.group){const g=new T.Group();g.position.set(x,y,z);parent.add(g);this.box(0,.1,0,.6,1,.4,'#ed9c56',g);this.mesh(new T.SphereGeometry(.28,12,8),'#f0d7ac',0,.85,0,g);for(const s of [-1,1]){this.box(s*.18,-.65,0,.22,.65,.25,'#34566a',g);this.box(s*.45,.1,0,.2,.8,.22,'#ed9c56',g);}return g;}
 spawn(f,x,y,z,speed=0,heading=0){f.reset();Object.assign(f,{x,y,z,heading,vx:Math.sin(heading)*speed,vz:-Math.cos(heading)*speed,vy:0,ground:false,airborne:true,throttle:f.config.helicopter?.5:.48,pitch:.04,flaps:0});}
 start(spec,f,{equipment='snowboard',checkpoint=null}={}){
  this.reset();this.active=true;this.flight=f;this.spec=spec;this.id=spec.id;this.equipment=equipment;this.time=0;this.hold=0;this.failed='';this.done=false;this.phase='flight';this.cam=0;this.offTrackTime=0;this.airEquipment=null;this.message='';this.gate=0;this.wakes=[];this.wakeTime=0;
  if(this.id==='luxury-jump'){
   this.ship=buildYacht(this.group,{obstacles:[],nightLights:[]});this.ship.position.set(4000,0,-6000);this.target={x:4000,y:10,z:-5945,vx:2,vz:-.5,height:10,id:'yacht-target'};this.ring(0,10.08,55,14,'#cbb2ff',this.ship);
   this.spawn(f,4000,300,-3745,55,Math.atan2(60,2215));f.throttle=.52;this.parachute.surface=(x,z)=>Math.abs(x-this.target.x)<18&&Math.abs(z-this.target.z)<20?this.target:null;
  }else if(this.id==='ice-factory'){
   this.snow={x:-10000,z:-100,y:terrain(-10000,-100,false)};this.buildSnow();f.spawn('resort');f.heading=Math.PI;this.parachute.surface=(x,z)=>this.snowSurface(x,z);
   if(checkpoint){f.ground=false;f.y=terrain(f.x,f.z)+250;this.parachute.jump(f,{enabled:true,mission:true});const p=this.parachute.focus;p.g.position.copy(checkpoint.position);p.heading=checkpoint.heading;p.landed=true;p.opened=true;p.landingVelocity={x:checkpoint.vx,z:checkpoint.vz};this.beginSnow(p);}
  }else if(this.id==='water-mirror'){
   this.lake={x:-8500,z:-10500,y:70};const a=this.lake;this.target={x:a.x,y:a.y,z:a.z-505};
   const water=this.mesh(new T.CircleGeometry(1,128),'#477f91',a.x,a.y,a.z);water.scale.set(400,750,1);water.rotation.x=-Math.PI/2;water.material.roughness=.23;water.material.metalness=.35;
   // Continuous shoreline ridges: one mesh, no stacked snow cones.
   const vertices=[],indices=[],segments=96,rings=8;
   for(let j=0;j<=rings;j++)for(let i=0;i<=segments;i++){
    const angle=i/segments*Math.PI*2,t=j/rings;
    const rx=400+t*450,rz=750+t*430;
    const ridge=Math.sin(t*Math.PI)*(.55+.22*Math.sin(angle*3)+.16*Math.cos(angle*5));
    const y=70+ridge*170-t*t*72;
    vertices.push(a.x+Math.cos(angle)*rx,y,a.z+Math.sin(angle)*rz);
   }
   for(let j=0;j<rings;j++)for(let i=0;i<segments;i++){const q=j*(segments+1)+i;indices.push(q,q+1,q+segments+1,q+1,q+segments+2,q+segments+1);}
   const shore=new T.BufferGeometry();shore.setAttribute('position',new T.Float32BufferAttribute(vertices,3));shore.setIndex(indices);shore.computeVertexNormals();
   const hills=this.mesh(shore,'#78947b',0,0,0);hills.material.side=T.DoubleSide;
   // Raised wharf and timber piers, clear of the water surface.
   this.box(a.x+75,71,a.z-555,100,4,75,'#8e9387');
   this.box(a.x+38,72.2,a.z-515,12,.7,80,'#b89d76');
   this.box(a.x+64,72.2,a.z-480,64,.7,10,'#b89d76');
   for(let i=0;i<9;i++){const z=a.z-550+i*9;this.box(a.x+38,72.62,z,12,.08,.18,'#75674e');for(const x of [a.x+33,a.x+43])this.box(x,70,z,.7,6,.7,'#695b48');}
   this.box(a.x+78,77,a.z-562,28,10,22,'#e6dec7');this.box(a.x+78,82.3,a.z-562,31,1,25,'#6d7f87');
   for(let i=0;i<4;i++){this.box(a.x+67+i*7,77,a.z-550.8,3,3,.2,'#365b6a');this.box(a.x+60+i*8,74,a.z-535,4,3,4,'#a98355');}
   for(const z of [-500,-525]){this.box(a.x+55,71.2,a.z+z,5,2,13,'#f1eee0');this.box(a.x+55,72.5,a.z+z,3,1.4,5,'#587d89');}
   // Bollards, fenders, crane, gangway and mooring lines make the wharf legible at low altitude.
   for(let i=0;i<6;i++){const z=a.z-550+i*13;this.box(a.x+33,73,z,.7,1,.7,'#394d55');const tire=this.mesh(new T.TorusGeometry(.8,.24,8,16),'#29383e',a.x+31.8,71.7,z);tire.rotation.y=Math.PI/2;}
   this.box(a.x+100,80,a.z-535,1,16,1,'#d2aa66');this.box(a.x+92,87,a.z-535,18,1,1,'#d2aa66');this.box(a.x+84,82,a.z-535,.1,10,.1,'#52646c');
   this.box(a.x+53,72.5,a.z-550,26,.4,6,'#b89d76');
   for(let i=0;i<4;i++)this.box(a.x+108+(i%2)*6,74,a.z-570+Math.floor(i/2)*7,5,2,5,'#9a7857');
   this.ring(this.target.x,70.5,this.target.z,20);
   f.surface=(x,z)=>this.lakeSurface(x,z);
   this.spawn(f,a.x,110,a.z+540,27);f.throttle=.1;f.flaps=1;f.vy=-1;f.surface=(x,z)=>this.lakeSurface(x,z);
  }else if(this.id==='wrong-tow'){
   const airport=airportById('peak');
   this.fields=[{...airport,y:airport.elevation,w:airport.width,d:airport.length}];
   const a=this.fields[0],startZ=a.z+1400;
   const safeHeight=Math.max(a.y+280,...Array.from({length:29},(_,i)=>terrain(a.x,startZ-i*50)+180));
   this.spawn(f,a.x,safeHeight,startZ,27);f.throttle=0;f.surface=null;
   this.phase='tow';this.tug=aircraft(getAircraft('cessna'));this.group.add(this.tug.mesh);this.rope=this.line();this.target={x:a.x,y:a.y,z:a.z};
  }else if(this.id==='last-ferry'){
   this.target={x:8800,y:5,z:-6200,vx:1.6,vz:0};this.ship=new T.Group();this.group.add(this.ship);
   this.box(0,2.8,0,14,4.4,38,'#365362',this.ship);this.box(0,5.1,0,13,.2,36,'#c8c6b3',this.ship);
   this.box(0,7.5,-10,9,4.8,10,'#eee9da',this.ship);this.box(0,10,-10,10,.4,11,'#e4aa57',this.ship);
   for(const x of [-3,0,3])this.box(x,8,-4.9,2,2,.15,'#315966',this.ship);
   for(const side of [-1,1]){
    this.box(side*6.7,6.4,0,.15,.18,35,'#eee9da',this.ship);
    for(let z=-17;z<=17;z+=4)this.box(side*6.7,5.8,z,.15,1.6,.15,'#eee9da',this.ship);
    for(const z of [-12,6]){const tire=this.mesh(new T.TorusGeometry(.7,.22,8,16),'#263940',side*7,4.5,z,this.ship);tire.rotation.y=Math.PI/2;}
    const life=this.mesh(new T.TorusGeometry(.6,.16,8,16),'#e88741',side*4.6,7,-10,this.ship);life.rotation.y=Math.PI/2;
   }
   this.box(0,12,-10,.16,4,.16,'#879a9b',this.ship);this.box(0,13,-10,3,.12,.12,'#879a9b',this.ship);
   this.ship.scale.set(.7,1,.7);this.ring(0,5.6,15,2.2,'#75d6ac',this.ship);this.survivor=this.person(0,6.2,15,this.ship);this.survivor.scale.set(1/.7,1,1/.7);
   const base=airportById('wind-heli');this.pad={...base,y:base.elevation};
   this.spawn(f,8800,40,-6189.5,0);f.throttle=.5;
   f.surface=(x,z)=>Math.abs(x-this.target.x)<4.9&&Math.abs(z-this.target.z)<13.3?{height:5.2,airport:{id:'ferry'}}:null;
   this.rope=this.line();this.hook=this.mesh(new T.SphereGeometry(.5,12,8),'#b6a4eb',f.x,f.y,f.z);this.winch=0;this.lowered=false;this.rescued=false;this.aboard=false;this.swing={x:0,z:0,vx:0,vz:0};this.lastVelocity={x:0,z:0};this.ship.position.set(this.target.x,0,this.target.z);
  }
  this.flightCheckpoint={x:f.x,y:f.y,z:f.z,vx:f.vx,vy:f.vy,vz:f.vz,heading:f.heading,throttle:f.throttle};
 }
 lakeSurface(x,z){const a=this.lake,dx=x-a.x,dz=z-a.z;if(Math.hypot(dx/400,dz/750)<=1)return {height:70,water:true,airport:{id:'challenge-lake',heading:0}};
  if(Math.hypot(dx/850,dz/1180)>1)return null;let lo=0,hi=1;for(let i=0;i<24;i++){const t=(lo+hi)/2;if(Math.hypot(dx/(400+t*450),dz/(750+t*430))>1)lo=t;else hi=t;}const t=(lo+hi)/2,angle=Math.atan2(dz/(750+t*430),dx/(400+t*450));return {height:70+Math.sin(t*Math.PI)*(.55+.22*Math.sin(angle*3)+.16*Math.cos(angle*5))*170-t*t*72,water:false};
 }
 snowCenter(z){return this.snow.x+(z<this.snow.z?0:Math.sin((z-this.snow.z)/150)*34);}
 snowHeight(z,x=this.snowCenter(z)){return terrain(x,z,false);}
 snowSurface(x,z){return z>=this.snow.z-1600&&z<=this.snow.z+950&&Math.abs(x-this.snowCenter(z))<90?{height:this.snowHeight(z,x),id:'snow-slope',water:false}:null;}
 buildSnow(){
  // Descend on the existing mountain, without floating surfaces or skirts.
  this.gates=[];for(let i=0;i<6;i++){const z=this.snow.z+210+i*115,x=this.snowCenter(z)+(i%2?18:-18),y=this.snowHeight(z,x);this.gates.push({x,z,y});for(const s of [-1,1]){const px=x+s*23,base=this.snowHeight(z,px),pole=this.box(px,base+1.85,z,.25,4.3,.25,'#735caa');pole.name='snow-gate-pole';pole.userData.ground=base;this.box(px-s*2.8,base+3,z,5.6,1.6,.1,i%2?'#ba91d6':'#879eb9');}}
  const z=this.snow.z+890;this.finish={x:this.snowCenter(z),z,y:this.snowHeight(z)};const top=Math.max(...[-40,40].map(dx=>this.snowHeight(z,this.finish.x+dx)))+6;this.box(this.finish.x,top,z,80,.4,.5,'#a190c6');for(const dx of [-40,40]){const x=this.finish.x+dx,base=this.snowHeight(z,x);this.box(x,(base+top)/2-.15,z,.45,top-base+.3,.45,'#735caa');}const ringY=Math.max(...Array.from({length:64},(_,i)=>this.snowHeight(this.snow.z+Math.sin(i/64*Math.PI*2)*20,this.snow.x+Math.cos(i/64*Math.PI*2)*20)))+9;
  this.dropRing=this.ring(this.snow.x,ringY,this.snow.z,20);this.dropRing.name='snow-drop-ring';
  // Continuous paired boundary flags, including the resort approach. The marked edge is the actual limit.
  for(let z=this.snow.z-1600;z<=this.snow.z+950;z+=25)for(const side of [-1,1]){
   const x=this.snowCenter(z)+side*88,base=this.snowHeight(z,x);
   const pole=this.box(x,base+1.8,z,.18,4.2,.18,'#cf714e');pole.name='snow-boundary';
   this.box(x-side*1.2,base+3,z,2.4,1.3,.12,'#ed9b54');
  }
  // Small blue guide chevrons follow the ground all the way to the timed gates.
  for(let z=this.snow.z-1570;z<this.snow.z+200;z+=35){const x=this.snowCenter(z);for(const side of [-1,1]){
   const points=[];for(let i=0;i<=8;i++){const px=x+side*i*.5,pz=z-i*.5;points.push(new T.Vector3(px,this.snowHeight(pz,px)+.18,pz));}
   const line=new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color:'#527fa0'}));line.name='snow-guide';this.group.add(line);
  }}
 }
 get navigationTarget(){
  if(this.id==='ice-factory')return this.phase==='snow'?(this.gates[this.gate]||this.finish):{x:this.snow.x,y:this.snow.y,z:this.snow.z+30};
  if(this.id==='last-ferry')return this.aboard?this.pad:{x:this.target.x,y:6.2,z:this.target.z+10.5};
  return this.target;
 }
 get actionState(){
  const p=this.parachute.focus;
  if(this.id==='ice-factory')return p?{label:'',enabled:false,reason:'←/→ curvas · ↓/espaço freia · siga as marcas azuis entre as bandeiras laranjas'}:{label:this.jumpReady?'Saltar do helicóptero':'Aproxime da pista',enabled:!this.flight?.crashed,reason:'Sobre a pista marcada, voe entre 2 e 12 m do chão e abaixo de 12 m/s. Salto sem paraquedas.'};
  if(['luxury-jump','ice-factory'].includes(this.id))return p?{label:'Abrir paraquedas',enabled:!p.opened&&!p.landed,reason:p.landed?'Descida em andamento':p.opened?'Paraquedas aberto · setas: curvas / freio · espaço: frear':''}:{label:this.id==='ice-factory'?'Saltar do helicóptero':'Saltar',enabled:this.jumpReady,reason:'Salte quando quiser · X salta / abre o paraquedas · aproxime-se do iate e reserve altura para a descida'};
  if(this.id==='wrong-tow')return {label:'Soltar cabo',enabled:this.phase==='tow',reason:this.phase==='tow'?'X ou toque para iniciar o planeio':'Cabo solto · voo sem motor · espaço: aerofreios'};
  if(this.id==='last-ferry')return {label:this.lowered?'Recolher guincho':'Baixar guincho',enabled:!this.aboard,reason:this.aboard?'Pessoa a bordo · pouse na vila':'X ou toque · mantenha o gancho sobre a pessoa'};
  return {label:'',enabled:false,reason:'W/S potência · setas/leme: direção · reduza para parar junto ao cais'};
 }
 action(f){
  if(this.id==='ice-factory'){
   if(!this.jumpReady){this.message='Sobre a pista: altura de 2 a 12 m, velocidade abaixo de 12 m/s. Sem paraquedas.';return false;}
   if(!this.parachute.jump(f,{enabled:true,mission:true,minAltitude:2}))return false;
   const p=this.parachute.focus;p.snowJump=true;p.heading=Math.PI;p.g.rotation.y=-Math.PI;p.vx=0;p.vz=3;p.vy=-1;p.body.rotation.x=0;p.body.rotation.y=this.equipment==='snowboard'?Math.PI/2:0;
   this.addSnowEquipment(p);return true;
  }
  if(!this.actionState.enabled)return false;
  if(this.id==='luxury-jump'){if(this.parachute.focus)return this.parachute.open();return this.parachute.jump(f,{enabled:this.spec.parachutists,mission:true,minAltitude:0});}
  if(this.id==='wrong-tow'){this.phase='glide';this.rope.visible=false;return true;}
  if(this.id==='last-ferry'){this.lowered=!this.lowered;return true;}return false;
 }
 get jumpReady(){if(!this.flight)return false;const f=this.flight;
  if(this.id==='ice-factory'){const agl=f.y-terrain(f.x,f.z);return !f.ground&&!f.crashed&&agl>=2&&agl<=12&&Math.hypot(f.vx,f.vz)<12&&Math.abs(f.x-this.snowCenter(f.z))<65&&f.z>=this.snow.z-1570&&f.z<=this.snow.z+100&&!this.parachute.focus&&this.parachute.cooldown<=0;}
  return !f.ground&&!f.crashed&&!this.parachute.focus&&this.parachute.cooldown<=0;
 }
 addSnowEquipment(p){if(p.snowEquipment)return;p.snowEquipment=new T.Group();p.g.add(p.snowEquipment);for(const x of this.equipment==='ski'?[-.25,.25]:[0])this.box(x,-1.3,0,this.equipment==='ski'?.16:.65,.1,2,'#765aac',p.snowEquipment);}
 physics(dt,f,u){this.flight=f;
  if(this.phase==='tow'){
   this.time+=dt;const turn=this.time>12?.018:0;f.heading+=turn*dt;f.vx=Math.sin(f.heading)*27;f.vz=-Math.cos(f.heading)*27;f.vy=.8;f.x+=f.vx*dt;f.y+=f.vy*dt;f.z+=f.vz*dt;f.bank=turn*4;f.pitch=.03;f.time+=dt;return;
  }
  if(this.parachute.focus){ // The abandoned launch aircraft keeps a stable autonomous track.
   f.time+=dt;f.x+=f.vx*dt;f.z+=f.vz*dt;f.bank*=Math.exp(-dt);f.pitch=0;f.vy=0;return;
  }
  f.step(dt,u);
 }
 beginSnow(p){
  this.airEquipment?.removeFromParent();this.airEquipment=null;this.phase='snow';p.canopy.visible=false;p.canopy.scale.setScalar(.001);p.body.rotation.x=0;p.body.rotation.y=this.equipment==='snowboard'?Math.PI/2:0;p.landed=true;p.snowJump=false;
  this.snowSpeed=clamp(Math.hypot(p.landingVelocity?.x||0,p.landingVelocity?.z||0),4,18);
  this.checkpoint={position:p.g.position.clone(),heading:p.heading,vx:p.landingVelocity?.x||0,vz:p.landingVelocity?.z||0};
  this.addSnowEquipment(p);
 }
 update(dt,f,u=ZERO){
  if(!this.active||this.done||this.failed||dt<=0)return;this.flight=f;if(this.phase!=='tow')this.time+=dt;
  if(this.id==='luxury-jump'){
   this.target.x+=this.target.vx*dt;this.target.z+=this.target.vz*dt;this.ship.position.set(this.target.x,0,this.target.z-55);
   const p=this.parachute.focus;this.message=p?'Convés roxo · Q/E gira · ←/→ curva · ↑ avança · ↓/espaço freia':`Iate a ${Math.round(distance(f,this.target))} m · siga o GPS · você escolhe onde saltar · recomendado: aproxime-se com mais de 100 m de altura`;
   if(p?.landed){if(p.hardLanding||p.water||p.support?.id!=='yacht-target'||distance(p.g.position,this.target)>14)this.failed='Você errou a área do convés. R tenta novamente.';else{this.hold+=dt;this.message=`No convés · mantenha apoio ${(Math.max(0,2-this.hold)).toFixed(1)} s`;this.done=this.hold>=2;}}
  }else if(this.id==='ice-factory'){
   const p=this.parachute.focus;
   this.message=p?'Salto curto · prepare a descida':(this.jumpReady?'SALTAR · sem paraquedas · siga as marcas azuis':'Voe sobre a pista marcada entre 2 e 12 m do chão, devagar, para saltar.');
   if(p?.snowJump){p.vy-=9.81*dt;p.g.position.y+=p.vy*dt;p.g.position.z+=p.vz*dt;const floor=this.snowHeight(p.g.position.z,p.g.position.x)+1.4;if(p.g.position.y<=floor){p.g.position.y=floor;p.landed=true;p.hardLanding=false;p.support=this.snowSurface(p.g.position.x,p.g.position.z);p.landingVelocity={x:p.vx,z:p.vz};}}
   if(p?.landed&&this.phase!=='snow'){if(p.hardLanding||p.support?.id!=='snow-slope'||p.g.position.z>this.snow.z+160)this.failed='Pouse suavemente na parte alta da encosta. R repete o salto.';else this.beginSnow(p);}
   if(this.phase==='snow'){
    const pos=p.g.position,previous=pos.clone();p.heading+=(u.roll||0)*dt*(this.equipment==='ski'?1.2:1);this.snowSpeed=clamp(this.snowSpeed+(-Math.cos(p.heading)*4.5-.08*this.snowSpeed-(u.brake||u.pitch>0?8:0))*dt,0,26);p.vx=Math.sin(p.heading)*this.snowSpeed;p.vz=-Math.cos(p.heading)*this.snowSpeed;p.vy=0;pos.x+=p.vx*dt;pos.z+=p.vz*dt;pos.y=this.snowHeight(pos.z,pos.x)+1.4;p.g.rotation.y=-p.heading;p.body.rotation.z=-(u.roll||0)*.22;p.canopy.visible=false;
    const gate=this.gates[this.gate];if(gate&&previous.z<=gate.z&&pos.z>=gate.z){const t=(gate.z-previous.z)/Math.max(.001,pos.z-previous.z),x=previous.x+(pos.x-previous.x)*t;if(Math.abs(x-gate.x)<23)this.gate++;else this.failed='Portão perdido. R retorna ao checkpoint da descida.';}
    const outside=Math.abs(pos.x-this.snowCenter(pos.z))>88||pos.z<this.snow.z-1600;this.offTrackTime=outside?(this.offTrackTime||0)+dt:0;if(this.offTrackTime>3)this.failed='Você saiu da pista. R repete a descida.';
    this.message=`${this.equipment==='ski'?'ESQUI':'SNOWBOARD'} · portões ${this.gate}/6 · ←/→ curva · ↓/espaço freia · R checkpoint`;
    if(outside)this.message='Volte para dentro das bandeiras laranjas!';
    if(pos.z>=this.finish.z)this.done=this.gate===6;if(pos.z>this.finish.z+40&&!this.done)this.failed='Complete todos os portões. R repete a descida.';
   }
  }else if(this.id==='water-mirror'){
   const d=distance(f,this.target);this.message=`Cais · ${Math.round(d)} m · pouse no lago, reduza potência e direcione na água`;
   const valid=f.ground&&f.touch?.airport==='challenge-lake'&&d<28&&f.speed<1.5;this.hold=valid?this.hold+dt:0;this.done=this.hold>=2;
   if(f.ground&&f.speed>2){this.wakeTime+=dt;if(this.wakeTime>.1){this.wakeTime=0;for(const side of [-1,1]){const m=this.ring(f.x+side*1.12,70.36,f.z+2,.8,'#dce9e9');this.wakes.push({m,age:0});}}}
   for(const w of this.wakes){w.age+=dt;w.m.scale.setScalar(1+w.age*2);w.m.visible=w.age<3;}while(this.wakes.length&&this.wakes[0].age>3){const w=this.wakes.shift();this.group.remove(w.m);w.m.geometry.dispose();}
  }else if(this.id==='wrong-tow'){
   if(this.phase==='tow'){this.tug.mesh.position.set(f.x+Math.sin(f.heading)*65,f.y+4,f.z-Math.cos(f.heading)*65);this.tug.mesh.rotation.y=-f.heading;this.setLine(this.rope,new T.Vector3(f.x,f.y,f.z-4),this.tug.mesh.position);this.tug.update(f,ZERO,dt);this.message=this.time>8?'O rebocador vai mudar de rota! Soltar cabo · X':'Em reboque · aguarde o aviso ou solte o cabo · X';}
   else{this.tug.mesh.position.x+=22*dt;this.tug.mesh.position.z-=18*dt;this.tug.mesh.rotation.y=-.8;this.tug.update({...f,throttle:.7},ZERO,dt);this.message=this.fields.map(a=>{const d=distance(f,a),reach=Math.max(0,f.y-a.y)*18;return `${a.name}: ${Math.round(d)} m · alcance ≈ ${Math.round(reach)} m ${d<reach?'✓':'baixo'}`;}).join(' | ');}
   const valid=this.phase==='glide'&&f.ground&&this.fields.some(a=>a.id===f.touch?.airport)&&f.speed<1.2;this.hold=valid?this.hold+dt:0;this.done=this.hold>=2;
  }else if(this.id==='last-ferry'){
   this.target.x+=this.target.vx*dt;this.ship.position.set(this.target.x,0,this.target.z);this.winch=clamp(this.winch+(this.lowered?5:-7)*dt,0,38);
   const a=this.swing;const ax=(f.vx-this.lastVelocity.x)/Math.max(dt,.001),az=(f.vz-this.lastVelocity.z)/Math.max(dt,.001);this.lastVelocity={x:f.vx,z:f.vz};a.vx+=(-a.x*2-a.vx*1.4-ax*.25)*dt;a.vz+=(-a.z*2-a.vz*1.4-az*.25)*dt;a.x=clamp(a.x+a.vx*dt,-5,5);a.z=clamp(a.z+a.vz*dt,-5,5);
   const overDeck=Math.abs(f.x+a.x-this.target.x)<4.55&&Math.abs(f.z+a.z-this.target.z)<12.6;const hookY=overDeck&&!this.rescued?Math.max(6.2,f.y-this.winch):f.y-this.winch;this.hook.position.set(f.x+a.x,hookY,f.z+a.z);this.setLine(this.rope,new T.Vector3(f.x,f.y,f.z),this.hook.position);
   const person={x:this.target.x,y:6.2,z:this.target.z+10.5};const aligned=distance(this.hook.position,person)<3&&Math.abs(this.hook.position.y-person.y)<2&&Math.abs(f.vy)<1.5;
   if(!this.rescued){this.hold=aligned&&this.lowered?this.hold+dt:0;this.message=aligned?`Alinhado · resgate ${this.hold.toFixed(1)}/3 s`:`Gancho → pessoa ${distance(this.hook.position,person).toFixed(0)} m · ${Math.abs(this.hook.position.y-person.y).toFixed(0)} m vertical · ${this.lowered?'corrija o alinhamento':'baixe o guincho'}`;if(this.hold>=3){this.rescued=true;this.group.attach(this.survivor);}}
   if(this.rescued&&!this.aboard){this.survivor.position.copy(this.hook.position);this.survivor.position.y-=1;this.message='Pessoa presa · Recolher guincho · mova devagar';if(!this.lowered&&this.winch<1){this.aboard=true;this.survivor.visible=false;this.rope.visible=false;this.hook.visible=false;this.hold=0;}}
   if(this.aboard){this.message=`Pessoa a bordo · heliponto da vila ${Math.round(distance(f,this.pad))} m · pouse e pare`;const valid=f.ground&&f.touch?.airport===this.pad.id&&f.speed<1;this.hold=valid?this.hold+dt:0;this.done=this.hold>=2;}
  }
  if(f.crashed&&!this.parachute.focus)this.failed=f.reason+' · R reinicia.';
  if(this.time>600)this.failed='Tempo esgotado · R reinicia a tentativa.';
 }
 camera(camera,f,flightMode=0){const p=this.parachute.focus;if(p){
  const pos=p.g.position;if(this.cam===3){topCamera(camera,pos,65);camera.position.y=Math.max(camera.position.y,terrain(pos.x,pos.z)+4);return;}
  camera.up.set(0,1,0);const mode=this.cam%3,d=mode===0?6:mode===1?10:24,h=mode===0?2.6:mode===1?5:16;
  const target=new T.Vector3(pos.x,pos.y+.5,pos.z);
  camera.position.set(pos.x-Math.sin(p.heading)*d+(mode===1?6:0),pos.y+h,pos.z+Math.cos(p.heading)*d);
  // Raise the camera until the entire sight line clears the terrain, not just its endpoint.
  let lift=0;for(let i=1;i<=32;i++){const t=i/32,x=target.x+(camera.position.x-target.x)*t,z=target.z+(camera.position.z-target.z)*t,y=target.y+(camera.position.y-target.y)*t;lift=Math.max(lift,(terrain(x,z)+.8-y)/t);}
  camera.position.y+=Math.max(0,lift);camera.lookAt(target);return;
 }if(this.phase==='tow'&&flightMode===0){camera.position.set(f.x+20,f.y+10,f.z+35);camera.lookAt(f.x,f.y,f.z-30);}}
}
