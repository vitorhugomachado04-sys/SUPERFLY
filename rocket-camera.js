import {topCamera} from './top-camera.js?v=04.9';
import * as T from './three.js';
export const ROCKET_CAMERAS=['CINEMÁTICA','ACOMPANHAMENTO','POUSO','DE CIMA'];
// Smooth local offsets, not world positions: the camera must keep up with ascent.
export class RocketCamera{
 constructor(camera){this.camera=camera;this.reset();}
 reset(){this.mode=0;this.offset=new T.Vector3();this.aim=new T.Vector3();this.initialized=false;}
 cycle(){this.mode=(this.mode+1)%ROCKET_CAMERAS.length;this.initialized=false;return ROCKET_CAMERAS[this.mode];}
 update(f,pad,time,dt){
 if(this.mode===3){topCamera(this.camera,{x:f.x,y:f.y+26,z:f.z},Math.min(450,Math.max(160,(f.y-pad.y)*.45)));return;}this.camera.up.set(0,1,0);
 const offset=new T.Vector3(),aim=new T.Vector3(0,26,0);
 const returning=['descent','braking','success','failure'].includes(f.phase);
 if(this.mode===1)offset.set(-85,52,135);
 else if(this.mode===2){
  const height=Math.min(320,Math.max(120,(f.y-pad.y)*.3));
  offset.set(20,height,Math.max(160,height*1.3));
  if(returning){const blend=Math.max(0,1-(f.y-pad.y)/2500)*.4;aim.set((pad.x-f.x)*blend,26+(pad.y-f.y-26)*blend,(pad.z-f.z)*blend);}
 }else if(returning){
  const h=Math.min(500,Math.max(130,f.y*.4));offset.set(65,h,Math.max(210,h*1.35));
  const blend=Math.max(0,1-(f.y-pad.y)/2500)*.35;aim.set((pad.x-f.x)*blend,20+(pad.y-f.y-20)*blend,(pad.z-f.z)*blend);
 }else if(f.phase==='space'){offset.set(90,48,240);aim.y=60;}else{
  const a=['ready','countdown'].includes(f.phase)?-1+.25*Math.sin(time*.07):-.7+time*.025;offset.set(Math.sin(a)*210, f.phase==='space'?48:90,Math.cos(a)*210);
 }
 const alpha=this.initialized?1-Math.exp(-Math.min(dt,.1)*3):1;
 this.offset.lerp(offset,alpha);this.aim.lerp(aim,alpha);this.initialized=true;
 this.camera.position.set(f.x+this.offset.x,Math.max(28,f.y+this.offset.y),f.z+this.offset.z);
 this.camera.lookAt(f.x+this.aim.x,f.y+this.aim.y,f.z+this.aim.z);
 }
}
