import * as T from './three.js';
import {airportById,runwayLocal,airportAt} from './airports.js?v=04.56';
import {machNumber} from './legend-fleet.js?v=04.56';
import {flightGate,orientGate} from './flight-plan.js?v=04.56';
export const LEGEND_MISSIONS=['historic','delivery','supersonic','recon'];
export class LegendMission{
 constructor(m,group){this.kind=m.special;this.origin=airportById(m.from);this.airport=airportById(m.to);this.phase=0;this.done=false;this.time=0;this.hold=0;this.distance=0;this.message='';this.actionLabel='';this.target=null;this.points=null;this.group=group;this.previous=null;this.inFlight=false;this.photographed=false;if(group){const start=group.children.length;this.build();this.objects=group.children.slice(start);}}
 dispose(){const geometries=new Set(),materials=new Set();for(const o of this.objects||[]){o.removeFromParent();o.traverse(n=>{if(n.geometry)geometries.add(n.geometry);if(n.material)for(const m of Array.isArray(n.material)?n.material:[n.material])materials.add(m);});}for(const g of geometries)g.dispose();for(const m of materials)m.dispose();this.objects=[];}
 box(x,y,z,w,h,d,color){const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshStandardMaterial({color,roughness:.8}));mesh.position.set(x,y,z);this.group.add(mesh);return mesh;}
 build(){const a=this.origin;if(this.kind==='historic'){for(const side of [-1,1])for(let z=a.z+440;z>=a.z-450;z-=45){this.box(a.x+side*29,a.elevation+1.2,z,.1,2.4,.1,'#9c774b');this.box(a.x+side*30,a.elevation+2,z,2,.65,.045,z<a.z-80?'#b6a4eb':'#f4e6c2');}for(let i=0;i<18;i++){const x=a.x+38+i%3*2,z=a.z+200+Math.floor(i/3)*4;this.box(x,a.elevation+.85,z,.55,1.3,.4,i%2?'#6c776c':'#c3b49b');this.box(x,a.elevation+1.65,z,.4,.4,.4,'#bd997c');this.box(x,a.elevation+1.9,z,.6,.08,.6,'#605647');}this.box(a.x+50,a.elevation+2,a.z+180,9,.2,6,'#98734b');for(const x of [46,54])for(const z of [177,183])this.box(a.x+x,a.elevation+1,a.z+z,.2,2,.2,'#98734b');}
  if(this.kind==='delivery'){const d=this.airport;this.box(d.x+110,d.elevation+12,d.z,100,24,100,'#c2c9c1');this.box(d.x+110,d.elevation+25,d.z,108,3,108,'#6a659e');this.box(d.x+59,d.elevation+8,d.z,1,16,35,'#263f48');for(let z=-35;z<40;z+=14)this.box(d.x+58,d.elevation+20,d.z+z,.4,3,6,'#f6dfab');}
  if(this.kind==='recon'){const x=18500,z=-18000;for(let i=0;i<4;i++)this.box(x+(i%2)*40,12,z+Math.floor(i/2)*50,30,24,35,'#6a7482');this.box(x+20,-1,z+25,180,4,180,'#6d8275');this.reconSite={x:x+20,z:z+25,y:12000};}
  if(this.kind==='supersonic'||this.kind==='recon'){this.marker=flightGate();this.marker.scale.setScalar(8);this.group.add(this.marker);}
 }
 action(f){if(f.crashed)return;
  if(this.kind==='delivery'&&this.phase===1&&this.readyDelivery){f.cargoOpen=true;f.payloadMass=0;this.done=true;this.phase=2;this.message='Carga entregue à fábrica. Aguarde a confirmação.';}
  if(this.kind==='recon'&&this.phase===1){if(this.canPhotograph(f)){this.photographed=true;this.done=true;this.phase=2;this.target=null;this.message='Fotografia confirmada. Reduza, desça e retorne à Base Horizonte.';}else this.message='Fora da janela: alvo a até 2 km, 10–16 km de altitude, Mach 2.5–3.3 e asas niveladas.';}
 }
 canPhotograph(f){const target=this.reconSite||{x:18520,z:-17975};return !f.ground&&!f.crashed&&Math.hypot(f.x-target.x,f.z-target.z)<2000&&f.y>=10000&&f.y<=16000&&machNumber(f)>=2.5&&machNumber(f)<=3.3&&Math.abs(f.bank)<.3;}
 update(dt,f){this.time+=dt;this.actionLabel='';const a=this.airport;
  if(this.kind==='historic'){
   const p=runwayLocal(a,f.x,f.z);if(!f.ground&&!f.crashed&&f.y-a.elevation-f.config.gear>.4){if(!this.inFlight){this.inFlight=true;this.previous={x:f.x,z:f.z};this.distance=0;}if(this.previous){const forward=this.previous.z-f.z;this.distance+=Math.max(0,Math.min(forward,f.speed*dt*1.5));}this.previous={x:f.x,z:f.z};this.phase=1;if(this.distance>=220){this.done=true;this.phase=2;}}
   else if(f.ground&&!this.done){this.inFlight=false;this.previous=null;this.distance=0;this.phase=0;}
   this.target={x:a.x,z:this.done?a.z-300:a.z-50,y:a.elevation+(this.done?0:7)};
   this.message=this.done?'VOO CONCLUÍDO! PREPARE-SE PARA POUSAR entre as bandeiras roxas.':this.phase===0?'ACELERE E PREPARE-SE PARA DECOLAR · aos 22 kt, puxe suavemente.':`DISTÂNCIA: ${Math.min(220,Math.floor(this.distance))} / 220 M · voo baixo, asas niveladas.`;
   if(Math.abs(p.across)>22&&!f.ground)this.message+=' Corrija em direção ao centro do campo.';
  }else if(this.kind==='delivery'){
   this.target={...a,y:a.elevation};this.readyDelivery=f.airborne&&f.ground&&!f.crashed&&f.touch?.airport===a.id&&airportAt(f.x,f.z)?.id===a.id&&f.speed<2;
   if(this.readyDelivery&&!this.done)this.phase=1;
   if(!this.done)this.message=this.readyDelivery?'Carga no destino. X abre a porta e entrega a seção de fuselagem.':'SPECIAL DELIVERY · carga de 18 t · voe até a Base Horizonte. Aproximação com vento lateral.';
   if(this.readyDelivery&&!this.done)this.actionLabel='ENTREGAR CARGA · X';
  }else if(this.kind==='supersonic'){
   // Offshore corridor is intentionally long enough for Mach 2, with generous gates.
   const ocean={x:-25000,y:11000,z:-45000};
   if(this.phase===0){this.target=ocean;this.message='Decole, recolha o trem e siga o GPS para o corredor oceânico. Suba a 9–15 km.';if(!f.ground&&f.y>=9000&&f.y<=15000&&f.x<-16000&&f.z<-22000)this.phase=1;}
   else if(this.phase===1){this.target={x:-40000,y:11000,z:-70000};const valid=!f.ground&&f.y>=9000&&f.y<=15000&&f.x<-16000&&f.z<-22000&&machNumber(f)>=1.98;if(valid)this.distance+=Math.min(1000,f.speed)*dt;this.message=`CORREDOR OCEÂNICO · Mach 2 · ${(this.distance/1000).toFixed(1)} / 8 km · altitude 9–15 km.`;if(this.distance>=8000){this.done=true;this.phase=2;this.target=null;}}
   if(this.done)this.message='Mach 2 confirmado! Reduza potência, desça e pouse na Metrópole. X baixa o nariz.';
  }else if(this.kind==='recon'){
   this.reconSite||={x:18520,z:-17975,y:12000};this.target=this.done?null:this.reconSite;
   if(this.phase===0){this.message='BLACKBIRD RECON · suba a 10–16 km, recolha o trem e acelere. Siga o alvo no GPS.';if(f.y>=10000&&!f.ground)this.phase=1;}
   if(this.phase===1){this.actionLabel='RECON CAMERA · X';if(this.canPhotograph(f))this.message='ALVO ENQUADRADO · X para registrar a fotografia!';else if(!this.message.startsWith('Fora da janela'))this.message='Reconhecimento: 10–16 km, Mach 2.5–3.3, asas niveladas. Fotografe a até 2 km do alvo.';}
  }
  if(this.marker){this.marker.visible=!!this.target&&!this.done;if(this.target)orientGate(this.marker,this.origin,this.target);}
 }
}
