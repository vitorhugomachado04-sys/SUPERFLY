import {CIRCUIT_POINTS,flightGate,orientGate,GATE_RADIUS} from './flight-plan.js?v=04.27';
import {terrain} from './geography.js?v=04.27';
import * as T from './three.js';
import {airportById} from './airports.js?v=04.27';
import {getAircraft} from './fleet.js?v=04.27';
import {jetAircraft} from './jets.js?v=04.27';
import {CrashEffect} from './crash.js?v=04.27';
export class SpecialMission{
 constructor(scene){this.scene=scene;this.group=new T.Group();scene.add(this.group);this.explosion=new CrashEffect(scene);this.reset();}
 reset(){for(const p of this.damageParts||[])this.scene.remove(p.m);for(const m of [...this.group.children]){this.group.remove(m);m.traverse(o=>{if(o.isSprite)o.material.dispose();if(o.isMesh){o.geometry.dispose();if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material.dispose();}});}this.explosion.reset();this.time=0;this.freeUntil=null;this.phase=0;this.done=false;this.triggered=false;this.hold=0;this.cooldown=0;this.drops=[];this.bullets=[];this.hits=0;this.message='';this.actionLabel='';this.target=null;this.points=null;this.truck=null;this.enemy=null;this.enemies=[];this.checkpointMade=false;this.damageParts=[];this.engineSmoke=[];}
 start(m){this.reset();this.kind=m.special;this.airport=airportById(m.to);this.done=!this.kind;for(let i=0;i<14;i++){const m=new T.Sprite(new T.SpriteMaterial({map:this.explosion.texture,color:i<10?'#4d5150':'#ee8b35',transparent:true,opacity:0,depthWrite:false}));this.group.add(m);this.engineSmoke.push(m);}this.origin=airportById(m.from);this.target={x:this.origin.x+700,z:this.origin.z,y:this.origin.elevation+280};if(this.kind==='circuit')this.target={x:0,y:160,z:-1500};
 if(['inspection','urgent','supply','rescue','escort'].includes(this.kind)){
  const o=this.origin;this.points=this.kind==='inspection'?[[o.x+580,o.z-1050],[o.x+765,o.z-670],[o.x+950,o.z-290]]:this.kind==='rescue'?[[-9870,-1100]]:[[o.x+1100,o.z-900]];
  if(this.kind==='urgent')this.points=[[o.x+2100,o.z+200]];
  this.points=this.points.map(([x,z])=>({x,z,y:terrain(x,z)+(this.kind==='rescue'?28:170)}));this.target={...this.points[0]};
  this.marker=flightGate();orientGate(this.marker,this.origin,this.target);this.group.add(this.marker);
  if(this.kind==='escort'){this.escort=new T.Group();this.box(0,0,0,1,1,6,'#e9e1c6',this.escort);this.box(0,.3,0,9,.15,1.4,'#9483bf',this.escort);this.group.add(this.escort);}
 }
}
 box(x,y,z,w,h,d,color,parent=this.group){const m=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshStandardMaterial({color,roughness:.7}));m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;}
 action(f){
 if(this.kind==='supply'&&!this.done&&this.target&&Math.hypot(f.x-this.target.x,f.y-this.target.y,f.z-this.target.z)<150){const g=new T.Group();g.position.set(f.x,f.y,f.z);this.box(0,0,0,2,2,2,'#d6b285',g);const canopy=new T.Mesh(new T.SphereGeometry(3,12,8,0,Math.PI*2,0,Math.PI/2),new T.MeshStandardMaterial({color:'#ab94d9',side:T.DoubleSide}));canopy.position.y=4;g.add(canopy);this.group.add(g);this.drops.push({g,canopy,age:2});this.done=true;this.target=null;this.message='Suprimentos entregues. Retorne à base alpina.';}

 if(this.kind==='birds'&&this.triggered&&!f.isolated){f.isolated=true;this.message='Motor isolado · hélice embandeirada. Compense com Q/E e retorne.';this.actionLabel='';}
 if(this.kind==='jump'&&!this.done){if(this.jumpReady){for(let i=0;i<6;i++){const g=new T.Group();g.position.set(f.x,f.y,f.z+i*2);this.box(0,0,0,.7,1.5,.5,'#6a659e',g);const canopy=new T.Mesh(new T.SphereGeometry(4,12,8,0,Math.PI*2,0,Math.PI/2),new T.MeshStandardMaterial({color:i%2?'#ede6b9':'#a39bcb',side:T.DoubleSide}));canopy.position.y=5;canopy.visible=false;g.add(canopy);this.group.add(g);this.drops.push({g,canopy,age:0});}this.done=true;this.target=null;this.message='Saltos realizados. Retorne e pouse no campo das dunas.';} }
 if(this.kind==='intercept'&&this.phase===2&&this.cooldown<=0){this.cooldown=.13;const b=this.box(f.x,f.y,f.z,.2,.2,2,'#fff4a2');this.bullets.push({m:b,age:0,v:new T.Vector3(Math.sin(f.heading)*Math.cos(f.pitch),Math.sin(f.pitch),-Math.cos(f.heading)*Math.cos(f.pitch)).multiplyScalar(420)});}
 }
 update(dt,f,camera){this.time+=dt;this.cooldown-=dt;const a=this.airport;this.actionLabel='';
 if(['inspection','urgent','supply','rescue','escort'].includes(this.kind)){
 if(this.kind==='urgent'&&this.time>720){f.crashed=true;f.reason='Tempo de transferência excedido. Repita o transporte urgente.';}
 if(!this.done){
  if(this.kind==='escort'){const p=this.points[0];this.target={x:p.x+Math.min(1400,this.time*22),y:p.y,z:p.z};this.escort.position.set(this.target.x,this.target.y,this.target.z);this.escort.rotation.y=-Math.PI/2;}
  const distance=Math.hypot(f.x-this.target.x,f.y-this.target.y,f.z-this.target.z);
  if(this.kind==='inspection'||this.kind==='urgent'){this.message=this.kind==='inspection'?`Inspeção ${this.phase+1}/${this.points.length} · passe no marcador roxo.`:`Transporte urgente · ${Math.max(0,720-this.time).toFixed(0)} s · alcance o ponto de transferência.`;if(distance<GATE_RADIUS){this.phase++;if(this.phase>=this.points.length){this.done=true;this.target=null;this.message='Lia: objetivo cumprido. Retorne e pouse.';}else this.target={...this.points[this.phase]};}}
  if(this.kind==='supply'){this.actionLabel='LANÇAR SUPRIMENTOS · X';this.message=distance<150?'Na zona · X para lançar.':'Alcance o marcador roxo na altitude indicada e lance com X.';}
  if(this.kind==='rescue'){this.hold=distance<45&&f.speed<5?this.hold+dt:0;this.message=`Busca no teleférico · mantenha pairado no marcador · ${Math.min(5,this.hold).toFixed(1)}/5 s`;if(this.hold>=5){this.done=true;this.target=null;this.message='Equipe recolhida. Pouse no heliponto do resort.';}}
  if(this.kind==='escort'){this.hold=distance<200?this.hold+dt:Math.max(0,this.hold-dt*.2);this.message=`Acompanhe a aeronave · ${Math.min(20,this.hold).toFixed(0)}/20 s · distância ${distance.toFixed(0)} m`;if(this.hold>=20){this.done=true;this.target=null;this.message='Visibilidade recuperada. Retorne à pista polar.';}}
 }
 this.marker.visible=!this.done;if(this.target)orientGate(this.marker,this.phase?this.points[this.phase-1]:this.origin,this.target);
 }
 if(this.kind==='circuit'&&!this.done){
  this.target=CIRCUIT_POINTS[this.phase];
  if(this.target&&Math.hypot(f.x-this.target.x,f.y-this.target.y,f.z-this.target.z)<GATE_RADIUS)this.phase++;
  if(this.phase>=CIRCUIT_POINTS.length){this.target=null;this.freeUntil??=this.time+25;this.message='Lia: circuito completo! Pode sobrevoar a Enseada livremente por um momento.';if(this.time>=this.freeUntil){this.done=true;this.message='Lia: retorne ao Aeroporto Joselito Geraldo de Sousa. Siga a aproximação no GPS, pouse e pare.';}}
  else{this.target=CIRCUIT_POINTS[this.phase];this.message=['Siga o plano no GPS · atravesse o primeiro arco a 160 m.','Suba para 240 m e curve à direita até o segundo arco.','Faça a curva de retorno pelo terceiro arco.','Siga pela ilha até o último arco do circuito.'][this.phase];}
 }
 if(this.kind==='heli'&&!this.done){const targets=['roof-a','roof-b','city'];const dest=airportById(targets[this.phase]);this.target={...dest,y:dest.elevation};this.message=['Pouse na Torre Porto para recolher a encomenda.','Encomenda a bordo. Pouse no Hospital.','Entrega concluída. Retorne ao aeroporto da cidade.'][this.phase];if(f.ground&&f.airborne&&f.touch?.airport===dest.id&&f.speed<1.5){this.hold+=dt;if(this.hold>2){this.phase++;this.hold=0;if(this.phase>=3){this.done=true;this.target=null;}}}else this.hold=0;}
 if(this.kind==='birds'){
 if(!this.triggered&&f.airborne&&f.y>a.elevation+80&&this.time>12){this.triggered=true;f.engineHealth=[0,1];for(let i=0;i<12;i++)this.enemies.push(this.box(f.x-25+i*4,f.y+Math.sin(i)*3,f.z-20,1.3,.15,.5,'#374746'));}
 this.enemies.forEach(b=>b.position.x+=dt*16);this.message=this.triggered?(f.isolated?'Pane controlada. Compense com Q/E e retorne à metrópole.':'Bird strike! Motor esquerdo sem potência. X para isolar.'):'Suba acima de 80 m AGL para o voo local.';this.actionLabel=this.triggered&&!f.isolated?'ISOLAR MOTOR · X':'';this.done=this.triggered&&f.isolated;this.target=null;
 }
 if(this.kind==='gear'){
 if(!this.triggered)this.message='Faça uma volta e inicie a descida com o trem baixado.';
 if(!this.triggered&&f.airborne&&f.y>a.elevation+40&&f.vy<-.2&&f.gearTarget===1&&this.time>15){this.triggered=true;f.gearFault=true;f.gearTarget=1;f.gearExtension=.55;this.truck=new T.Group();this.box(0,1,0,2.5,1.4,5,'#c87b58',this.truck);this.box(0,2,-.8,2.3,1.2,2,'#527a84',this.truck);this.mechanic=this.box(0,2.4,1,.5,1.6,.5,'#e7dbb8',this.truck);this.truck.position.set(a.x,a.elevation,a.z+a.length*.4);this.group.add(this.truck);}
 if(this.truck&&!this.done){const p=this.truck.position;let goal=Math.max(a.z-a.length*.4,Math.min(a.z+a.length*.4,f.z-6));p.z+=Math.max(-55*dt,Math.min(55*dt,goal-p.z));const agl=f.y-a.elevation,align=Math.abs(f.x-p.x),gap=Math.abs(f.z-p.z),kt=f.speed*1.94384;const valid=align<6&&gap<30&&agl>7&&agl<18&&kt>70&&kt<125&&Math.abs(f.bank)<.15;if(this.mechanic)this.mechanic.position.y=2.4+(valid?Math.sin(this.time*6)*.3:0);this.hold=valid?this.hold+dt:Math.max(0,this.hold-dt*.5);this.target={x:p.x,y:a.elevation+12,z:p.z};this.message=`Picape: lateral ${align.toFixed(0)} m · altura ${agl.toFixed(0)} m (7–18) · ${kt.toFixed(0)} kt (70–125) · ${Math.min(3,this.hold).toFixed(1)}/3 s`;if(this.hold>=3){f.gearFault=false;f.gearTarget=1;this.done=true;this.target=null;this.message='Mecânico destravou o trem. Ganhe altura e faça nova aproximação.';}}
 }
 if(this.kind==='jump'&&!this.done){const dx=f.x-this.target.x,dz=f.z-this.target.z,alt=f.y-a.elevation;this.jumpReady=Math.hypot(dx,dz)<220&&alt>=250&&alt<=450&&Math.abs(f.bank)<.12&&Math.abs(f.vy)<2&&f.speed<65;this.message=this.jumpReady?'Estável na zona · X para saltar':Math.hypot(dx,dz)>=220?'Entre na zona de salto marcada':alt<250||alt>450?'Altitude de salto: 250–450 m acima da base':'Estabilize: asas niveladas, vertical < 2 m/s e velocidade < 126 kt';this.actionLabel='SALTAR · X';}
 for(const p of this.drops){p.age+=dt;p.canopy.visible=p.age>1.5;p.g.position.y=Math.max(a.elevation+2,p.g.position.y-dt*(p.age<1.5?18:4));p.g.position.x+=dt*1.5;}
 if(this.kind==='intercept'){
 if(!this.enemy){const model=jetAircraft(getAircraft('boeing'));this.enemy=model;model.mesh.position.set(a.x+200,a.elevation+280,a.z-800);this.group.add(model.mesh);model.update({gearExtension:0,speed:0},{roll:0,pitch:0,yaw:0},0);this.hp=18;}
 if(this.phase<3){const p=this.enemy.mesh.position;const t=this.time*.025;p.set(a.x+700*Math.sin(t),a.elevation+280,a.z-900-700*Math.cos(t));const h=Math.atan2(Math.cos(t),-Math.sin(t));this.enemy.mesh.rotation.y=-h;this.target={x:p.x,y:p.y,z:p.z};let d=Math.hypot(f.x-p.x,f.y-p.y,f.z-p.z);if(this.phase===0&&d<250){this.phase=1;this.identifyTime=this.time;}if(this.phase===1&&this.time-this.identifyTime>4)this.phase=2;this.message=this.phase===0?'Aproxime a 250 m para identificar o cargueiro não tripulado':this.phase===1?'Rádio: cargueiro hostil recusou o desvio. Preparar interceptação.':`Alvo hostil · ${this.hp}/18 · X para disparar`;this.actionLabel=this.phase===2?'DISPARAR · X':'';
 for(const b of this.bullets){const before=b.m.position.clone();b.m.position.addScaledVector(b.v,dt);b.age+=dt;const segment=b.m.position.clone().sub(before),q=p.clone().sub(before),k=Math.max(0,Math.min(1,q.dot(segment)/segment.lengthSq()));if(before.addScaledVector(segment,k).distanceTo(p)<14&&b.age<2){b.age=4;this.hp--;this.hits++;if(this.hp===12||this.hp===6){const source=this.enemy.mesh.children[this.hp===12?1:2];if(source?.isMesh){source.updateWorldMatrix(true,false);const piece=source.clone();source.matrixWorld.decompose(piece.position,piece.quaternion,piece.scale);source.visible=false;this.scene.add(piece);this.damageParts.push({m:piece,v:8});}}this.enemy.mesh.rotation.z=.04*Math.sin(this.hits);if(this.hp<=0){this.phase=3;this.done=true;this.explosion.trigger(this.enemy.mesh,{x:p.x,y:p.y,z:p.z,vx:0,vz:-40,config:getAircraft('boeing')},camera);this.enemy.mesh.visible=false;this.target=null;this.message=this.airport.type==='carrier'?'Drone neutralizado. Pouse no PAN-01: G trem, F flaps, H gancho.':'Alvo destruído. Retorne à Base Horizonte e pouse.';break;}}}
 }
 for(const b of this.bullets){b.m.visible=b.age<3&&this.phase<3;}this.bullets=this.bullets.filter(b=>{if(b.age<3&&this.phase<3)return true;this.group.remove(b.m);b.m.geometry.dispose();b.m.material.dispose();return false;});
 if(this.phase===3)this.explosion.update(dt,{position:camera.position.clone(),lookAt(){}});
 }
 for(const part of this.damageParts){part.v+=dt*9.8;part.m.position.y-=part.v*dt;part.m.rotation.z+=dt*2;part.m.visible=part.m.position.y>0;}
 const emitting=this.kind==='birds'&&this.triggered||this.kind==='intercept'&&this.hp<15&&this.phase<3;
 for(let i=0;i<this.engineSmoke.length;i++){const p=this.engineSmoke[i];p.visible=!!emitting;if(!emitting)continue;const base=this.kind==='birds'?{x:f.x-Math.cos(f.heading)*3,y:f.y,z:f.z-Math.sin(f.heading)*3}:this.enemy.mesh.position;const phase=(this.time*.6+i/14)%1;p.position.set(base.x+Math.sin(i)*phase*3,base.y+phase*8,base.z+phase*25);p.scale.setScalar(1+phase*6);p.material.opacity=(1-phase)*(i<10?.4:this.kind==='intercept'&&this.hp<7?.65:0);}

 }
}
