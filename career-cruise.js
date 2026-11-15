import {airportById} from './airports.js?v=04.9';
import {terrain} from './geography.js?v=04.9';
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
export class CareerCruise{
 constructor(){this.active=false;}
 available(f,m){const a=airportById(m.to);return m.kind==='main'&&m.from!==m.to&&!f.ground&&!f.crashed&&f.y-terrain(f.x,f.z)>120&&Math.hypot(f.x-a.x,f.z-a.z)>4000;}
 start(f,m,obstacles=[]){if(!this.available(f,m))return false;const a=airportById(m.to),heading=a.heading;this.startPoint={x:f.x,y:f.y,z:f.z};this.end={x:a.x-Math.sin(heading)*2200,z:a.z+Math.cos(heading)*2200,heading};this.end.y=Math.max(a.elevation+200,terrain(this.end.x,this.end.z)+180);this.height=Math.max(f.y,this.end.y)+150;
 for(let i=0;i<=80;i++){const t=i/80,x=f.x+(this.end.x-f.x)*t,z=f.z+(this.end.z-f.z)*t;this.height=Math.max(this.height,terrain(x,z)+350);}
 for(const o of obstacles){const dx=this.end.x-f.x,dz=this.end.z-f.z,k=Math.max(0,Math.min(1,((o.x-f.x)*dx+(o.z-f.z)*dz)/(dx*dx+dz*dz)));if(Math.hypot(o.x-f.x-dx*k,o.z-f.z-dz*k)<Math.max(o.w,o.d)+100)this.height=Math.max(this.height,o.top+200);}
 this.time=0;this.active=true;return true;}
 update(dt,f){if(!this.active||dt<=0)return;this.time=Math.min(30,this.time+dt);const t=this.time/30,p=smooth((t-.12)/.76),start=this.startPoint,end=this.end;f.x=start.x+(end.x-start.x)*p;f.z=start.z+(end.z-start.z)*p;f.y=t<.5?start.y+(this.height-start.y)*smooth(t/.2):this.height+(end.y-this.height)*smooth((t-.8)/.2);f.heading=t>.85?end.heading:Math.atan2(end.x-start.x,start.z-end.z);f.pitch=0;f.bank=Math.sin(t*Math.PI*4)*.025;f.pr=f.rr=0;f.ground=false;f.airborne=true;f.throttle=.65;f.vy=0;f.vx=Math.sin(f.heading)*f.config.approachSpeed*1.15;f.vz=-Math.cos(f.heading)*f.config.approachSpeed*1.15;f.time+=dt;if(t>=1){this.active=false;f.bank=0;}}
}
