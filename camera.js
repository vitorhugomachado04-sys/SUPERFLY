import {topCamera} from './top-camera.js?v=04.43';
import * as T from './three.js';
import {terrain} from './physics.js?v=04.43';
import {nearestAirport} from './airports.js?v=04.43';
export const CAMERA_MODES=['SEGUIR','CABINE','AEROPORTO','CINEMÁTICA','DE CIMA'];
export const CINEMATIC_SHOTS=['Escolta lateral','Frente a frente','Asa esquerda','Vista do alto','Passagem','Traseira baixa','Órbita','Panorama','Diagonal frontal','Despedida'];
export const nextCameraMode=mode=>(mode+1)%CAMERA_MODES.length;
export class FlightCamera {
 constructor(camera){this.camera=camera;this.offset=new T.Vector3();this.desired=new T.Vector3();this.target=new T.Vector3();this.aim=new T.Object3D();this.anchor=new T.Vector3();this.reset();}
 reset(){this.mode=null;this.orbiting=false;this.orbitYaw=0;this.lastHeading=0;this.yaw=0;this.elevation=0;this.zoom=1;this.focus=null;this.cinemaTime=0;this.shot=-1;}
 orbit(dx,dy){if(this.mode===2||this.mode===3||this.mode===4)return;this.focus=null;if(!this.orbiting){this.orbitYaw=this.lastHeading+this.yaw;this.elevation=.25;this.orbiting=true;}this.orbitYaw-=dx*.006;this.elevation=Math.max(-.35,Math.min(1.45,this.elevation+dy*.004));}
 focusAirport(a){this.focus=a;}
 get label(){return this.mode===3?`CINEMÁTICA ${this.shot+1}/10`:CAMERA_MODES[this.mode??0];}
 update(f,mode,dt){
 const c=f.config||{cameraDistance:18,cameraHeight:6,cabinZ:1.6,cabinY:1.05},camera=this.camera,snap=this.mode!==mode;this.mode=mode;
 this.lastHeading=f.heading;if(snap){if(mode!==0)this.orbiting=false;this.yaw=this.elevation=0;if(mode!==2)this.focus=null;if(mode===3){this.cinemaTime=0;this.shot=-1;}if(mode===2)this.focus=nearestAirport(f.x,f.z,!!c.helicopter);}
 if(mode===4){this.focus=null;camera.fov=50;camera.updateProjectionMatrix();topCamera(camera,f,Math.max(55,c.halfSpan*7)*this.zoom);return;}camera.up.set(0,1,0);
 if(mode===0&&this.orbiting){const radius=Math.hypot(c.cameraDistance,c.cameraHeight)*this.zoom,pivotY=f.y+(c.cabinY||0);let elevation=this.elevation;for(let i=0;i<3;i++){const h=Math.cos(elevation)*radius,x=f.x-Math.sin(this.orbitYaw)*h,z=f.z+Math.cos(this.orbitYaw)*h;elevation=Math.max(elevation,Math.asin(Math.max(-1,Math.min(.99,(terrain(x,z)+2-pivotY)/radius))));}const h=Math.cos(elevation)*radius;camera.position.set(f.x-Math.sin(this.orbitYaw)*h,pivotY+Math.sin(elevation)*radius,f.z+Math.cos(this.orbitYaw)*h);camera.lookAt(f.x,pivotY,f.z);if(camera.fov!==50){camera.fov=50;camera.updateProjectionMatrix();}return;}
 const yaw=f.heading+this.yaw,fx=Math.sin(yaw),fz=-Math.cos(yaw),dist=c.cameraDistance*this.zoom;
 let cut=snap,fov=50;
 if(mode===0||mode===2){
 this.desired.set(-fx*dist*Math.cos(this.elevation),c.cameraHeight+Math.sin(this.elevation)*dist,-fz*dist*Math.cos(this.elevation));if(snap)this.offset.copy(this.desired);else this.offset.lerp(this.desired,1-Math.exp(-dt*9));camera.position.set(f.x+this.offset.x,f.y+this.offset.y,f.z+this.offset.z);camera.position.y=Math.max(camera.position.y,terrain(camera.position.x,camera.position.z)+2);this.target.set(f.x+fx*dist*.67,f.y+c.cameraHeight*.25,f.z+fz*dist*.67);
 }else if(mode===1){
 camera.position.set(f.x+Math.sin(f.heading)*c.cabinZ,f.y+c.cabinY,f.z-Math.cos(f.heading)*c.cabinZ);const pitch=f.pitch-this.elevation;this.target.set(camera.position.x+fx*Math.cos(pitch)*100,camera.position.y+Math.sin(pitch)*100,camera.position.z+fz*Math.cos(pitch)*100);
 }else{
 this.cinemaTime+=Math.max(0,dt);const shot=Math.floor((this.cinemaTime+1e-8)/10)%10,t=(this.cinemaTime%10)/10,d=Math.max(c.cameraDistance,(this.bannerLength||0)+18);
 const placements=[[1.7,.5,.3],[.45,.32,1.8],[-1.2,.25,-.2],[.15,2.8,.2],[2,.5,2.2],[.4,.18,-1.7],[Math.cos(t*1.8)*1.8,.65,Math.sin(t*1.8)*1.8],[-3.6,1.8,-2.7],[1.1,.7,1.4],[-.8,1+t,-2-t*2]];
 const [side,up,ahead]=placements[shot],rx=Math.cos(f.heading),rz=Math.sin(f.heading);
 this.desired.set(f.x+rx*side*d+fx*ahead*d,f.y+up*d,f.z+rz*side*d+fz*ahead*d);
 if(shot!==this.shot){this.anchor.copy(this.desired);if(shot===4){this.anchor.x+=fx*Math.min(350,(f.speed||0)*4);this.anchor.z+=fz*Math.min(350,(f.speed||0)*4);}this.shot=shot;cut=true;}
 if(shot===4)camera.position.copy(this.anchor);else if(cut)camera.position.copy(this.desired);else camera.position.lerp(this.desired,1-Math.exp(-dt*5));
 const trailing=this.bannerLength?(9+this.bannerLength)*.45:0;this.target.set(f.x-fx*trailing,f.y+c.cabinY*.3,f.z-fz*trailing);
 camera.position.y=Math.max(camera.position.y,terrain(camera.position.x,camera.position.z)+3);
 // Raise cinematic viewpoints when terrain or scenery cuts the line of sight.
 for(const k of [0,.25,.5,.75]){const x=camera.position.x+(f.x-camera.position.x)*k,z=camera.position.z+(f.z-camera.position.z)*k;let top=terrain(x,z)+3;for(const o of this.obstacles||[])if(Math.abs(x-o.x)<o.w/2+3&&Math.abs(z-o.z)<o.d/2+3)top=Math.max(top,o.top+3);camera.position.y=Math.max(camera.position.y,(top-f.y*k)/(1-k));}
 fov=[48,44,55,58,50,52,48,62,46,58][shot];
 }
 if(camera.fov!==fov){camera.fov=fov;camera.updateProjectionMatrix();}
 if(this.focus)this.target.set(this.focus.x,this.focus.elevation+2,this.focus.z);
 this.aim.position.copy(camera.position);this.aim.up.set(0,1,0);this.aim.lookAt(this.target);this.aim.rotateY(Math.PI);if(cut||mode===3)camera.quaternion.copy(this.aim.quaternion);else camera.quaternion.slerp(this.aim.quaternion,1-Math.exp(-dt*8));
 }
}
export function bindCamera(canvas,fc){let pointer=null,lastX=0,lastY=0;canvas.addEventListener('contextmenu',e=>e.preventDefault());canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==2)return;pointer=e.pointerId;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(pointer);});canvas.addEventListener('pointermove',e=>{if(pointer!==e.pointerId)return;fc.orbit(e.clientX-lastX,e.clientY-lastY);lastX=e.clientX;lastY=e.clientY;});const end=()=>pointer=null;canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);canvas.addEventListener('wheel',e=>{e.preventDefault();fc.zoom=Math.max(.45,Math.min(3,fc.zoom*Math.exp(e.deltaY*.001)));},{passive:false});}
