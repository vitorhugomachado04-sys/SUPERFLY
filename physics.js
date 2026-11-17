import {stepArrestor} from './carrier.js?v=04.44';
import {airportAt,surfaceHeight,spawnAt,airportById,helicopterDeparture} from './airports.js?v=04.44';
import{terrain}from './geography.js?v=04.44';
export{terrain}from './geography.js?v=04.44';
import{C152}from './fleet.js?v=04.44';
export{C152}from './fleet.js?v=04.44';
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const onRunway=(x,z)=>!!airportAt(x,z);
export class Flight{
 constructor(config=C152){this.config=config;this.reset();}
 select(config){this.config=config;this.reset();}
 toggleGear(){if(!this.config.retractable||this.crashed||this.ground||this.y-terrain(this.x,this.z)<this.config.gear+1)return false;this.gearTarget=1-this.gearTarget;return true;}
 reset(){this.surface=null;this.crashSurface=null;this.hookTarget=0;this.hookExtension=0;this.arrest=null;this.previousHook=null;this.engineHealth=[1,1];this.isolated=false;this.gearFault=false;this.wind=null;Object.assign(this,{x:0,y:3+this.config.gear,z:680,vx:0,vy:0,vz:0,heading:0,pitch:0,bank:0,pr:0,rr:0,throttle:.08,trim:0,flaps:0,gearExtension:1,gearTarget:1,ground:true,crashed:false,airborne:false,stall:0,alpha:0,touch:null,time:0});}
 spawn(id){this.reset();const a=this.config.helicopter?helicopterDeparture(id):airportById(id);this.spawnId=a.id;Object.assign(this,spawnAt(a,this.config));}
 get speed(){return Math.hypot(this.vx,this.vy,this.vz);}
 step(dt,u){if(this.crashed)return;const c=this.config;this.time+=dt;this.hookExtension+=Math.sign(this.hookTarget-this.hookExtension)*Math.min(Math.abs(this.hookTarget-this.hookExtension),dt/1.2);
 if(c.retractable){const delta=this.gearTarget-this.gearExtension;this.gearExtension=clamp(this.gearExtension+Math.sign(delta)*Math.min(Math.abs(delta),dt/c.gearSeconds),0,this.gearFault?.55:1);}
 this.trim=u.trimReset?0:clamp((this.trim||0)+(u.trim||0)*dt*.3,-1,1);
 if(c.helicopter){this.stepHelicopter(dt,u);return;}
this.throttle=c.glider?0:clamp(this.throttle+(u.power||0)*dt*.25,0,1);const wind=this.wind?.sample(this.x,this.y,this.z,this.time)||{x:0,y:0,z:0,roll:0,pitch:0};if(this.ground){wind.x=wind.y=wind.z=wind.roll=wind.pitch=0;}const avx=this.vx-wind.x,avy=this.vy-wind.y,avz=this.vz-wind.z;let v=Math.hypot(avx,avy,avz),hs=Math.hypot(avx,avz),gamma=Math.atan2(avy,Math.max(.001,hs));this.alpha=this.pitch-gamma;const eff=clamp(v/c.controlSpeed,.06,1.25);// Fade commands near the arcade attitude envelope; release assists recovery.
 const pitchInput=clamp(u.pitch,-1,1);
 const room=pitchInput>0?(c.pitchMax-this.pitch):(this.pitch-c.pitchMin);
 const authority=clamp(room/.16,0,1);
 const neutral=(1-Math.abs(pitchInput))**2;
 this.pr+=(pitchInput*c.pitchResponse*eff*authority-this.pr*c.pitchDamping-(this.ground?0:this.alpha*.28)+
 (this.ground?0:neutral*c.neutralAssist*(c.pitchTrim+(this.trim||0)*.18-this.pitch)))*dt;this.rr+=(u.roll*c.rollResponse*(c.rollArcade||3)*eff-this.rr*c.rollDamping-Math.sin(this.bank)*.13*(1-Math.abs(u.roll)))*dt;this.pitch+=this.pr*dt;
 if(this.pitch<c.pitchMin){this.pitch=c.pitchMin;this.pr=Math.max(0,this.pr);}
 if(this.pitch>c.pitchMax){this.pitch=c.pitchMax;this.pr=Math.min(0,this.pr);}this.bank+=this.rr*dt;this.bank=Math.atan2(Math.sin(this.bank),Math.cos(this.bank));const weatherResponse=Math.min(1.2,(650/c.mass)**.3);if(!this.ground){this.pr+=wind.pitch*dt*weatherResponse;this.rr+=wind.roll*dt*weatherResponse;if(c.twin)this.rr+=(this.engineHealth[0]-this.engineHealth[1])*(c.asymmetricRoll||.18)*this.throttle*(this.isolated?.4:1)*dt;}
 if(this.ground){this.bank*=Math.exp(-dt*7);this.pitch=clamp(this.pitch,-.025,.16);this.heading+=(u.yaw*c.groundSteering+u.roll*c.groundSteering*.34)*clamp(v/10,0,1)*dt;}
 else {
 const track=Math.atan2(this.vx,-this.vz);
 const slip=Math.atan2(Math.sin(track-this.heading),Math.cos(track-this.heading));
 this.heading+=(Math.sin(this.bank)*c.gravity/Math.max(v,16)+u.yaw*.14*eff+slip*.8)*dt;
 }
 const fx=Math.sin(this.heading),fz=-Math.cos(this.heading),rx=Math.cos(this.heading),rz=Math.sin(this.heading);const a=this.alpha;this.stall=clamp((Math.abs(a)-c.stallAngle)/.22,0,1);let cl=clamp(.24+c.liftSlope*a+this.flaps*c.flapLift,-1.3,1.7)*(1-this.stall*.8);let q=.5*1.225*v*v;let lift=q*c.wing*cl,drag=q*c.wing*(c.drag+(c.glider&&u.brake?.12:0)+c.induced*cl*cl+this.flaps*c.flapDrag+this.stall*.22+c.gearDrag*this.gearExtension+c.overspeedDrag*Math.max(0,v-c.overspeedStart)**2);let thrust=c.thrust*this.throttle*clamp(1-v/c.thrustFalloff,.15,1)*(this.engineHealth[0]+this.engineHealth[1])*.5; if(c.twin&&!this.ground)this.heading+=(this.engineHealth[0]-this.engineHealth[1])*(this.isolated?.025:(c.asymmetricYaw||.07))*this.throttle*dt;if(c.twin&&!this.isolated&&this.engineHealth.some(v=>v===0))drag+=q*c.wing*.035;let inv=1/Math.max(v,1);
 // Lift must be perpendicular to velocity, including sideslip and turns.
 const tx=hs>.001?avx/hs:fx,tz=hs>.001?avz/hs:fz;
 const lx=-tx*Math.sin(gamma)*Math.cos(this.bank)-tz*Math.sin(this.bank);
 const ly=Math.cos(gamma)*Math.cos(this.bank);
 const lz=-tz*Math.sin(gamma)*Math.cos(this.bank)+tx*Math.sin(this.bank);let ax=(fx*Math.cos(this.pitch)*thrust-avx*inv*drag+lift*lx)/c.mass;let ay=(Math.sin(this.pitch)*thrust-avy*inv*drag+lift*ly)/c.mass-c.gravity;let az=(fz*Math.cos(this.pitch)*thrust-avz*inv*drag+lift*lz)/c.mass;
 if(this.ground){let lateral=this.vx*rx+this.vz*rz;ax-=lateral*rx*9;az-=lateral*rz*9;let resistance=c.floats&&(this.surface?.(this.x,this.z)?.water||terrain(this.x,this.z)<0)?(u.brake?.65:.08):(u.brake?5.8:.22);ax-=this.vx/Math.max(hs,1)*resistance;az-=this.vz/Math.max(hs,1)*resistance;}
 if(this.ground&&hs<.1&&this.throttle<=.1){this.vx=0;this.vz=0;ax=0;az=0;}this.vx+=ax*dt;this.vy+=ay*dt;this.vz+=az*dt;this.x+=this.vx*dt;this.y+=this.vy*dt;this.z+=this.vz*dt;
 for(const o of this.obstacles||[]){if(Math.abs(this.x-o.x)<o.w/2+1&&Math.abs(this.z-o.z)<o.d/2+2&&this.y<o.top+1){this.crashed=true;this.reason='Colisão com uma construção';return;}}
 const custom=this.surface?.(this.x,this.z),landing=custom?.airport||airportAt(this.x,this.z),slope=landing?.slope||0,groundHeight=custom?.height??terrain(this.x,this.z),floor=groundHeight+Math.max(c.belly,(c.floats&&(custom?.water||groundHeight<0)?(c.waterGear||c.gear):c.gear)*this.gearExtension);
 if(this.y<=floor){
  if(landing?.type==='carrier'&&this.y<landing.elevation-1){this.crashed=true;this.reason='Colisão com o casco do porta-aviões';return;}
  if(groundHeight<0&&!c.floats){this.crashed=true;this.reason='Contato com a água';this.crashSurface='water';return;}
  if(c.retractable&&this.gearExtension<.98){this.crashed=true;this.reason='Pouso sem trem baixado e travado';return;}
  const groundVy=slope*(this.vx*Math.sin(landing?.heading||0)-this.vz*Math.cos(landing?.heading||0));let bounce=0;
  if(!this.ground){const sink=groundVy-this.vy,align=Math.abs(Math.sin(this.heading-(landing?.heading||0)));this.touch={sink,align,heading:this.heading,airport:landing?.id,runway:!!landing};if(sink>c.maxSink||Math.abs(Math.atan2(Math.sin(this.bank),Math.cos(this.bank)))>.25||this.pitch<-.15||this.pitch>.4){this.crashed=true;this.reason='Impacto severo';return;}bounce=landing?.type==='carrier'?0:sink>2.4?sink*.22:0;}
  if(c.floats&&(custom?.water||groundHeight<0)){bounce=0;const friction=Math.exp(-dt*(.055+(u.brake?.12:0)));this.vx*=friction;this.vz*=friction;this.heading+=(u.roll*.25+u.yaw*.4)*dt;}
  this.vy=groundVy+bounce;this.y=floor;this.ground=bounce<.2;this.pitch+=(Math.atan(slope)-this.pitch)*(1-Math.exp(-dt*c.groundPitchRelax));
 }
 else{this.ground=false;if(this.y>floor+4)this.airborne=true;}
 stepArrestor(this,dt);
 if(this.touch&&this.ground&&!onRunway(this.x,this.z))this.touch.excursion=true;
 if(!this.ground&&this.stall>.15)this.pr-=Math.sign(this.alpha)*this.stall*.18*dt;
 // Wing and fuselage probes prevent terrain penetration on slopes.
 if(!this.ground)for(const side of [-1,1]){let wx=this.x+rx*c.halfSpan*side,wz=this.z+rz*c.halfSpan*side,wy=this.y+c.wingY-Math.sin(this.bank)*c.halfSpan*side;if(wy<terrain(wx,wz)+.15){this.crashed=true;this.reason='Contato da asa com o terreno';if(terrain(wx,wz)<0){this.reason='Contato com a água';this.crashSurface='water';}}}
 }
 stepHelicopter(dt,u){
 const c=this.config;this.throttle=clamp(this.throttle+(u.power||0)*dt*.22,0,1);
 const w=this.wind?.sample(this.x,this.y,this.z,this.time)||{x:0,y:0,z:0,roll:0,pitch:0};
 if(this.ground){w.x=w.y=w.z=w.roll=w.pitch=0;}const response=Math.min(1.2,(650/c.mass)**.3);
 this.vy+=((this.throttle-.5)*c.collective+w.y*.25-this.vy*.9)*dt;
 const support=(this.surface?.(this.x,this.z)?.height??terrain(this.x,this.z))+Math.max(c.belly,c.gear*this.gearExtension);
 const canMove=!this.ground||this.y+this.vy*dt>support+1e-8;
 if(canMove){
 const longitudinal=clamp((u.pitch||0)+(this.trim||0)*.35,-1,1);
 this.pitch+=(longitudinal*.28+w.pitch*response-this.pitch)*dt*3;this.bank+=(u.roll*.3+w.roll*response-this.bank)*dt*3;
 this.heading+=(u.yaw||0)*dt*c.yawRate;
 const fx=Math.sin(this.heading),fz=-Math.cos(this.heading),rx=Math.cos(this.heading),rz=Math.sin(this.heading);
 const forward=-longitudinal*c.heliSpeed-w.pitch*response*9,side=u.roll*c.heliSpeed*.75+w.roll*response*9;
 this.vx+=((fx*forward+rx*side+w.x*.35)-this.vx)*dt*c.heliResponse;
 this.vz+=((fz*forward+rz*side+w.z*.35)-this.vz)*dt*c.heliResponse;
 }else{this.vx=this.vz=0;this.pitch=this.bank=0;}
 this.x+=this.vx*dt;this.y+=this.vy*dt;this.z+=this.vz*dt;
 const custom=this.surface?.(this.x,this.z),a=custom?.airport||airportAt(this.x,this.z),floor=(custom?.height??terrain(this.x,this.z))+Math.max(c.belly,c.gear*this.gearExtension);
 for(const o of this.obstacles||[]){if(a?.type==='helipad'&&o.top<=a.elevation)continue;if(Math.abs(this.x-o.x)<o.w/2+1&&Math.abs(this.z-o.z)<o.d/2+1&&this.y<o.top+1){this.crashed=true;this.reason='Colisão com edifício';return;}}
 if(this.y<=floor){if(a?.type==='carrier'&&this.y<a.elevation-1){this.crashed=true;this.reason='Colisão com o casco do porta-aviões';return;}if((custom?.height??terrain(this.x,this.z))<0){this.crashed=true;this.reason='Contato com a água';this.crashSurface='water';return;}if(c.retractable&&this.gearExtension<.98){this.crashed=true;this.reason='Pouso sem trem baixado e travado';return;}if(this.vy<-c.maxSink||Math.hypot(this.vx,this.vz)>10){this.crashed=true;this.reason='Impacto no pouso do helicóptero';return;}
 if(!this.ground)this.touch={sink:-this.vy,align:0,heading:this.heading,airport:a?.id,runway:!!a};this.y=floor;this.vy=Math.max(0,this.vy);this.ground=true;this.vx=this.vz=0;this.pitch=this.bank=0;
 }else{this.ground=false;if(this.y>floor+2)this.airborne=true;}
 }

}
