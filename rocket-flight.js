export const SPACEPORT={x:850,z:950,y:32};
export const OCEAN_PAD={x:2300,z:950,y:8,radius:42};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t;
export class RocketFlight{
 constructor(){this.reset();}
 reset(){Object.assign(this,{phase:'ready',time:0,phaseTime:0,x:SPACEPORT.x,y:SPACEPORT.y,z:SPACEPORT.z,vx:0,vy:0,vz:0,thrust:0,braking:false,landed:false,crashed:false,reason:'',sink:0,lateral:0});}
 action(){if(this.phase==='ready'){this.phase='countdown';this.phaseTime=0;return true;}if(this.phase==='descent'&&this.y<=2200&&this.y>OCEAN_PAD.y){this.phase='braking';this.braking=true;this.phaseTime=0;return true;}return false;}
 get distance(){return Math.hypot(this.x-OCEAN_PAD.x,this.z-OCEAN_PAD.z);}
 get canIgnite(){return this.phase==='descent'&&this.y<=2200;}
 step(dt,u={}){
 if(['ready','success','failure'].includes(this.phase))return;this.time+=dt;this.phaseTime+=dt;const t=this.phaseTime;
 if(this.phase==='countdown'){this.thrust=.15*t/5;if(t>=5){this.phase='ascent';this.phaseTime=0;}return;}
 if(this.phase==='ascent'){const k=clamp(t/25,0,1),s=k*k*(3-2*k);this.x=mix(SPACEPORT.x,OCEAN_PAD.x+30,s);this.z=mix(SPACEPORT.z,OCEAN_PAD.z-25,s);this.y=SPACEPORT.y+10500*k**1.6;this.vy=672*k**.6;this.thrust=1;if(k===1){this.phase='space';this.phaseTime=0;this.thrust=0;}return;}
 if(this.phase==='space'){this.y=10532+220*Math.sin(Math.PI*clamp(t/9,0,1));this.vy=0;this.thrust=0;if(t>=9){this.phase='descent';this.phaseTime=0;this.vy=-35;}return;}
 if(this.phase==='descent'){this.vy=Math.max(-240,this.vy-25*dt);this.thrust=0;}
 if(this.phase==='braking'){
  const h=Math.max(0,this.y-OCEAN_PAD.y),target=-clamp(h*.11,2.2,65),acc=clamp((target-this.vy)*1.8,-18,60);this.vy+=acc*dt;this.thrust=clamp((acc+25)/85,.1,1);
 }
 // Cold-gas jets allow alignment before the main landing burn.
 if(this.phase==='descent'||this.phase==='braking'){
  const power=this.phase==='descent'?9:23, damping=this.phase==='descent'?1.2:1.8;
  const roll=clamp(u.roll||0,-1,1),pitch=clamp(u.pitch||0,-1,1);
  this.vx+=(roll*power-this.vx*damping)*dt;this.vz+=(pitch*power-this.vz*damping)*dt;
  this.x+=this.vx*dt;this.z+=this.vz*dt;
 }
 this.y+=this.vy*dt;
 if(this.y<=OCEAN_PAD.y){this.sink=-this.vy;this.lateral=Math.hypot(this.vx,this.vz);this.landed=this.distance<34&&this.sink<=5&&this.lateral<6&&this.braking;this.crashed=!this.landed;this.phase=this.landed?'success':'failure';this.phaseTime=0;this.y=OCEAN_PAD.y;this.thrust=0;if(this.landed)this.vx=this.vy=this.vz=0;this.reason=this.landed?'Starship recuperada!':this.distance>=34?'Fora da plataforma':this.sink>5?'Impacto vertical forte':'Velocidade lateral excessiva';}
 }
}
