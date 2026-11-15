import {topCamera} from './top-camera.js?v=04.3';
import * as T from './three.js';
import {terrain} from './geography.js?v=04.3';
import {buildYacht} from './yacht.js?v=04.3';
import {aircraft} from './aircraft.js?v=04.3';
import {getAircraft} from './fleet.js?v=04.3';
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
  this.reset();this.active=true;this.flight=f;this.spec=spec;this.id=spec.id;this.equipment=equipment;this.time=0;this.hold=0;this.failed='';this.done=false;this.phase='flight';this.cam=0;this.message='';this.gate=0;this.wakes=[];this.wakeTime=0;
  if(this.id==='luxury-jump'){
   this.ship=buildYacht(this.group,{obstacles:[],nightLights:[]});this.ship.position.set(4000,0,-6000);this.target={x:4000,y:10,z:-5945,vx:2,vz:-.5,height:10,id:'yacht-target'};this.ring(0,10.08,55,14,'#cbb2ff',this.ship);
   this.spawn(f,3997,235,-5925,38);this.parachute.surface=(x,z)=>Math.abs(x-this.target.x)<18&&Math.abs(z-this.target.z)<20?this.target:null;
  }else if(this.id==='ice-factory'){
   this.snow={x:-10000,z:-600,y:1450};this.buildSnow();this.spawn(f,-10003,1700,-570,0,Math.PI);this.parachute.surface=(x,z)=>this.snowSurface(x,z);
   if(checkpoint){this.parachute.jump(f,{enabled:true,mission:true});const p=this.parachute.focus;p.g.position.copy(checkpoint.position);p.heading=checkpoint.heading;p.landed=true;p.opened=true;p.landingVelocity={x:checkpoint.vx,z:checkpoint.vz};this.beginSnow(p);}
  }else if(this.id==='water-mirror'){
   this.lake={x:-7900,z:-10500,y:70};const a=this.lake;this.target={x:a.x,y:a.y,z:a.z-505};
   const water=this.mesh(new T.PlaneGeometry(800,1500),'#477f91',a.x,a.y,a.z);water.rotation.x=-Math.PI/2;water.material.roughness=.23;water.material.metalness=.35;
   this.box(a.x+45,68,a.z-530,80,4,65,'#ad9471');this.box(a.x+20,72,a.z-510,24,2,60,'#bca681');this.ring(this.target.x,70.1,this.target.z,24);
   for(let i=0;i<20;i++){const t=i*Math.PI/10,x=a.x+Math.sin(t)*650,z=a.z+Math.cos(t)*1000;const m=this.mesh(new T.ConeGeometry(350,350+(i%4)*70,7),'#84978f',x,150,z);m.rotation.y=i;this.mesh(new T.ConeGeometry(110,130,7),'#edf0e9',x,330+(i%4)*35,z);}
   f.surface=(x,z)=>Math.abs(x-a.x)<400&&Math.abs(z-a.z)<750?{height:70,water:true,airport:{id:'challenge-lake',heading:0}}:null;
   this.spawn(f,a.x,110,a.z+540,27);f.throttle=.1;f.flaps=1;f.vy=-1;f.surface=(x,z)=>Math.abs(x-a.x)<400&&Math.abs(z-a.z)<750?{height:70,water:true,airport:{id:'challenge-lake',heading:0}}:null;
  }else if(this.id==='wrong-tow'){
   this.fields=[{x:-11300,z:-1400,w:110,d:520,id:'field-a',name:'Campo A'},{x:-11800,z:-1900,w:130,d:460,id:'field-b',name:'Campo B'}];
   for(const a of this.fields){a.y=Math.max(...[-1,0,1].flatMap(i=>[-1,0,1].map(j=>terrain(a.x+i*a.w/2,a.z+j*a.d/2))))+3;this.box(a.x,a.y-5,a.z,a.w,10,a.d,'#93a078');for(const side of [-1,1])for(let z=-a.d/2;z<=a.d/2;z+=50)this.box(a.x+side*a.w/2,a.y+1,a.z+z,2,2,4,'#efe8c6');this.ring(a.x,a.y+.2,a.z,25);}
   const a=this.fields[0];this.spawn(f,a.x,a.y+200,a.z+1400,27);f.throttle=0;f.surface=(x,z)=>{const a=this.fields.find(a=>Math.abs(x-a.x)<a.w/2&&Math.abs(z-a.z)<a.d/2);return a?{height:a.y,airport:{id:a.id,heading:0}}:null;};
   this.phase='tow';this.tug=aircraft(getAircraft('cessna'));this.group.add(this.tug.mesh);this.rope=this.line();this.target={x:a.x,y:a.y,z:a.z};
  }else if(this.id==='last-ferry'){
   this.target={x:8800,y:5,z:-6200,vx:1.6,vz:0};this.ship=new T.Group();this.group.add(this.ship);this.box(0,2.5,0,42,5,90,'#365362',this.ship);this.box(0,5.05,0,39,.1,86,'#c8c6b3',this.ship);this.box(0,10,-25,30,10,22,'#e3e4d8',this.ship);this.box(0,12,-37,27,4,.2,'#37647b',this.ship);for(const side of [-1,1])for(let z=-40;z<42;z+=10)this.box(side*20,6,z,.25,2,.25,'#ede9d6',this.ship);this.ring(0,5.2,15,5,'#e8c57a',this.ship);this.survivor=this.person(0,6.2,15,this.ship);
   this.pad={x:8940,y:9,z:-6220};this.box(this.pad.x,3,this.pad.z,110,12,110,'#60767a');this.box(this.pad.x,9.1,this.pad.z,42,.2,42,'#9baba9');this.ring(this.pad.x,9.3,this.pad.z,16);for(const s of [-1,1])this.box(this.pad.x+s*4,9.4,this.pad.z,1,.1,12,'#f1e9c8');this.box(this.pad.x,9.4,this.pad.z,8,.1,1,'#f1e9c8');
   this.spawn(f,8800,35,-6185);f.surface=(x,z)=>Math.abs(x-this.pad.x)<50&&Math.abs(z-this.pad.z)<50?{height:9.2,airport:{id:'rescue-pad'}}:Math.abs(x-this.target.x)<21&&Math.abs(z-this.target.z)<45?{height:5,airport:{id:'ferry'}}:null;
   this.rope=this.line();this.hook=this.mesh(new T.SphereGeometry(.5,12,8),'#efcb7b',f.x,f.y,f.z);this.winch=0;this.lowered=false;this.rescued=false;this.aboard=false;this.swing={x:0,z:0,vx:0,vz:0};this.lastVelocity={x:0,z:0};this.ship.position.set(this.target.x,0,this.target.z);
  }
  this.flightCheckpoint={x:f.x,y:f.y,z:f.z,vx:f.vx,vy:f.vy,vz:f.vz,heading:f.heading,throttle:f.throttle};
 }
 snowCenter(z){return this.snow.x+Math.sin((z-this.snow.z)/150)*34;}
 snowHeight(z){return this.snow.y-(z-this.snow.z)*.32;}
 snowSurface(x,z){return z>=this.snow.z-80&&z<=this.snow.z+950&&Math.abs(x-this.snowCenter(z))<90?{height:this.snowHeight(z),id:'snow-slope',water:false}:null;}
 buildSnow(){
  const pos=[],idx=[];for(let i=0;i<=52;i++){const z=this.snow.z-80+i*20,y=this.snowHeight(z),x=this.snowCenter(z);pos.push(x-90,y,z,x+90,y,z);if(i<52){const a=i*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();this.mesh(geo,'#f2f3f2',0,0,0);
  // Banked shoulders tie the groomed trail into the mountain rather than leaving a floating plane.
  for(const side of [-1,1]){const vertices=[],indices=[];for(let i=0;i<=52;i++){const z=this.snow.z-80+i*20,x=this.snowCenter(z);vertices.push(x+side*90,this.snowHeight(z)-.1,z,x+side*220,terrain(x+side*220,z)-1,z);if(i<52){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();const m=this.mesh(geo,'#dce6eb',0,0,0);m.material.side=T.DoubleSide;}
  this.gates=[];for(let i=0;i<6;i++){const z=this.snow.z+210+i*115,x=this.snowCenter(z)+(i%2?18:-18),y=this.snowHeight(z);this.gates.push({x,z,y});for(const s of [-1,1]){this.box(x+s*23,y+2,z,.25,4,.25,'#735caa');this.box(x+s*20,y+3,z,6,1.6,.1,i%2?'#ba91d6':'#879eb9');}}
  const z=this.snow.z+890;this.finish={x:this.snowCenter(z),z,y:this.snowHeight(z)};this.box(this.finish.x,this.finish.y+.15,z,100,.12,5,'#a190c6');this.ring(this.snow.x,this.snow.y+.2,this.snow.z,48);
 }
 get navigationTarget(){
  if(this.id==='ice-factory')return this.phase==='snow'?(this.gates[this.gate]||this.finish):{x:this.snow.x,y:this.snow.y,z:this.snow.z+30};
  if(this.id==='last-ferry')return this.aboard?this.pad:{x:this.target.x,y:6.2,z:this.target.z+15};
  return this.target;
 }
 get actionState(){
  const p=this.parachute.focus;
  if(['luxury-jump','ice-factory'].includes(this.id))return p?{label:'Abrir paraquedas',enabled:!p.opened&&!p.landed,reason:p.landed?'Descida em andamento':p.opened?'Paraquedas aberto · setas: curvas / freio · espaço: frear':''}:{label:'Saltar',enabled:this.jumpReady,reason:this.jumpReady?'Zona de salto · X ou toque':'Entre na zona de salto indicada'};
  if(this.id==='wrong-tow')return {label:'Soltar cabo',enabled:this.phase==='tow',reason:this.phase==='tow'?'X ou toque para iniciar o planeio':'Cabo solto · voo sem motor · espaço: aerofreios'};
  if(this.id==='last-ferry')return {label:this.lowered?'Recolher guincho':'Baixar guincho',enabled:!this.aboard,reason:this.aboard?'Pessoa a bordo · pouse no cais':'X ou toque · mantenha o gancho sobre a pessoa'};
  return {label:'',enabled:false,reason:'W/S potência · setas/leme: direção · reduza para parar junto ao cais'};
 }
 action(f){if(!this.actionState.enabled)return false;if(['luxury-jump','ice-factory'].includes(this.id)){if(this.parachute.focus)return this.parachute.open();return this.parachute.jump(f,{enabled:this.spec.parachutists,mission:true});}if(this.id==='wrong-tow'){this.phase='glide';this.rope.visible=false;return true;}if(this.id==='last-ferry'){this.lowered=!this.lowered;return true;}return false;}
 get jumpReady(){if(!this.flight)return false;const f=this.flight,t=this.id==='ice-factory'?this.snow:this.target;return !f.ground&&!f.crashed&&distance(f,t)<300&&f.y-(this.id==='ice-factory'?this.snow.y:10)>85;}
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
  this.phase='snow';p.canopy.visible=false;p.canopy.scale.setScalar(.001);p.body.rotation.x=0;p.landed=true;
  this.snowSpeed=clamp(Math.hypot(p.landingVelocity?.x||0,p.landingVelocity?.z||0),4,18);
  this.checkpoint={position:p.g.position.clone(),heading:p.heading,vx:p.landingVelocity?.x||0,vz:p.landingVelocity?.z||0};
  const pieces=this.equipment==='ski'?[-.25,.25]:[0];for(const x of pieces)this.box(x,-1.3,0,this.equipment==='ski'?.16:.65,.1,2,'#765aac',p.body);
 }
 update(dt,f,u=ZERO){
  if(!this.active||this.done||this.failed||dt<=0)return;this.flight=f;if(this.phase!=='tow')this.time+=dt;
  if(this.id==='luxury-jump'){
   this.target.x+=this.target.vx*dt;this.target.z+=this.target.vz*dt;this.ship.position.set(this.target.x,0,this.target.z-55);
   const p=this.parachute.focus;this.message=p?'Convés roxo · curve com ←/→ · ↑ avança · ↓/espaço freia':'Saltar na zona indicada · acompanhe o iate em movimento';
   if(p?.landed){if(p.hardLanding||p.water||p.support?.id!=='yacht-target'||distance(p.g.position,this.target)>14)this.failed='Você errou a área do convés. R tenta novamente.';else{this.hold+=dt;this.message=`No convés · mantenha apoio ${(Math.max(0,2-this.hold)).toFixed(1)} s`;this.done=this.hold>=2;}}
  }else if(this.id==='ice-factory'){
   const p=this.parachute.focus;
   this.message=p?'Toque a parte alta da pista nevada · ←/→ curva · ↑ avança · ↓/espaço freia':'Saltar do Airbus H145 · zona de salto no alto da montanha';
   if(p?.landed&&this.phase!=='snow'){if(p.hardLanding||p.support?.id!=='snow-slope'||p.g.position.z>this.snow.z+160)this.failed='Pouse suavemente na parte alta da encosta. R repete o salto.';else this.beginSnow(p);}
   if(this.phase==='snow'){
    const pos=p.g.position,previous=pos.clone();p.heading+=(u.roll||0)*dt*(this.equipment==='ski'?1.2:1);this.snowSpeed=clamp(this.snowSpeed+(-Math.cos(p.heading)*4.5-.08*this.snowSpeed-(u.brake||u.pitch>0?8:0))*dt,0,26);p.vx=Math.sin(p.heading)*this.snowSpeed;p.vz=-Math.cos(p.heading)*this.snowSpeed;p.vy=0;pos.x+=p.vx*dt;pos.z+=p.vz*dt;pos.y=this.snowHeight(pos.z)+1.4;p.g.rotation.y=-p.heading;p.body.rotation.z=-(u.roll||0)*.22;p.canopy.visible=false;
    const gate=this.gates[this.gate];if(gate&&previous.z<=gate.z&&pos.z>=gate.z){const t=(gate.z-previous.z)/Math.max(.001,pos.z-previous.z),x=previous.x+(pos.x-previous.x)*t;if(Math.abs(x-gate.x)<23)this.gate++;else this.failed='Portão perdido. R retorna ao checkpoint da descida.';}
    if(Math.abs(pos.x-this.snowCenter(pos.z))>88||pos.z<this.snow.z-80)this.failed='Você saiu da pista. R repete a descida.';
    this.message=`${this.equipment==='ski'?'ESQUI':'SNOWBOARD'} · portões ${this.gate}/6 · ←/→ curva · ↓/espaço freia · R checkpoint`;
    if(pos.z>=this.finish.z)this.done=this.gate===6;if(pos.z>this.finish.z+40&&!this.done)this.failed='Complete todos os portões. R repete a descida.';
   }
  }else if(this.id==='water-mirror'){
   const d=distance(f,this.target);this.message=`Cais · ${Math.round(d)} m · pouse no lago, reduza potência e direcione na água`;
   const valid=f.ground&&f.touch?.airport==='challenge-lake'&&d<28&&f.speed<1.5;this.hold=valid?this.hold+dt:0;this.done=this.hold>=2;
   if(f.ground&&f.speed>2){this.wakeTime+=dt;if(this.wakeTime>.1){this.wakeTime=0;for(const side of [-1,1]){const m=this.ring(f.x+side*1.12,70.06,f.z+2,.8,'#dce9e9');this.wakes.push({m,age:0});}}}
   for(const w of this.wakes){w.age+=dt;w.m.scale.setScalar(1+w.age*2);w.m.visible=w.age<3;}while(this.wakes.length&&this.wakes[0].age>3){const w=this.wakes.shift();this.group.remove(w.m);w.m.geometry.dispose();}
  }else if(this.id==='wrong-tow'){
   if(this.phase==='tow'){this.tug.mesh.position.set(f.x+Math.sin(f.heading)*65,f.y+4,f.z-Math.cos(f.heading)*65);this.tug.mesh.rotation.y=-f.heading;this.setLine(this.rope,new T.Vector3(f.x,f.y,f.z-4),this.tug.mesh.position);this.tug.update(f,ZERO,dt);this.message=this.time>8?'O rebocador vai mudar de rota! Soltar cabo · X':'Em reboque · aguarde o aviso ou solte o cabo · X';}
   else{this.tug.mesh.position.x+=22*dt;this.tug.mesh.position.z-=18*dt;this.tug.mesh.rotation.y=-.8;this.tug.update({...f,throttle:.7},ZERO,dt);this.message=this.fields.map(a=>{const d=distance(f,a),reach=Math.max(0,f.y-a.y)*18;return `${a.name}: ${Math.round(d)} m · alcance ≈ ${Math.round(reach)} m ${d<reach?'✓':'baixo'}`;}).join(' | ');}
   const valid=this.phase==='glide'&&f.ground&&this.fields.some(a=>a.id===f.touch?.airport)&&f.speed<1.2;this.hold=valid?this.hold+dt:0;this.done=this.hold>=2;
  }else if(this.id==='last-ferry'){
   this.target.x+=this.target.vx*dt;this.ship.position.set(this.target.x,0,this.target.z);this.winch=clamp(this.winch+(this.lowered?5:-7)*dt,0,38);
   const a=this.swing;const ax=(f.vx-this.lastVelocity.x)/Math.max(dt,.001),az=(f.vz-this.lastVelocity.z)/Math.max(dt,.001);this.lastVelocity={x:f.vx,z:f.vz};a.vx+=(-a.x*2-a.vx*1.4-ax*.25)*dt;a.vz+=(-a.z*2-a.vz*1.4-az*.25)*dt;a.x=clamp(a.x+a.vx*dt,-5,5);a.z=clamp(a.z+a.vz*dt,-5,5);
   const overDeck=Math.abs(f.x+a.x-this.target.x)<20&&Math.abs(f.z+a.z-this.target.z)<44;const hookY=overDeck&&!this.rescued?Math.max(6.2,f.y-this.winch):f.y-this.winch;this.hook.position.set(f.x+a.x,hookY,f.z+a.z);this.setLine(this.rope,new T.Vector3(f.x,f.y,f.z),this.hook.position);
   const person={x:this.target.x,y:6.2,z:this.target.z+15};const aligned=distance(this.hook.position,person)<3&&Math.abs(this.hook.position.y-person.y)<2&&Math.abs(f.vy)<1.5;
   if(!this.rescued){this.hold=aligned&&this.lowered?this.hold+dt:0;this.message=aligned?`Alinhado · resgate ${this.hold.toFixed(1)}/3 s`:`Gancho → pessoa ${distance(this.hook.position,person).toFixed(0)} m · ${Math.abs(this.hook.position.y-person.y).toFixed(0)} m vertical · ${this.lowered?'corrija o alinhamento':'baixe o guincho'}`;if(this.hold>=3){this.rescued=true;this.group.attach(this.survivor);}}
   if(this.rescued&&!this.aboard){this.survivor.position.copy(this.hook.position);this.survivor.position.y-=1;this.message='Pessoa presa · Recolher guincho · mova devagar';if(!this.lowered&&this.winch<1){this.aboard=true;this.survivor.visible=false;this.rope.visible=false;this.hook.visible=false;this.hold=0;}}
   if(this.aboard){this.message=`Pessoa a bordo · heliporto do cais ${Math.round(distance(f,this.pad))} m · pouse e pare`;const valid=f.ground&&f.touch?.airport==='rescue-pad'&&f.speed<1;this.hold=valid?this.hold+dt:0;this.done=this.hold>=2;}
  }
  if(f.crashed&&!this.parachute.focus)this.failed=f.reason+' · R reinicia.';
  if(this.time>600)this.failed='Tempo esgotado · R reinicia a tentativa.';
 }
 camera(camera,f,flightMode=0){const p=this.parachute.focus;if(p){if(this.cam===3){topCamera(camera,p.g.position,this.phase==='snow'?65:55);return;}camera.up.set(0,1,0);const pos=p.g.position,offset=this.cam%3,d=offset===1?9:offset===2?36:22,h=offset===2?25:8;camera.position.set(pos.x-Math.sin(p.heading)*d+(offset===1?8:0),pos.y+h,pos.z+Math.cos(p.heading)*d);camera.lookAt(pos.x,pos.y+1,pos.z);return;}if(this.phase==='tow'&&flightMode===0){camera.position.set(f.x+20,f.y+10,f.z+35);camera.lookAt(f.x,f.y,f.z-30);}}
}
