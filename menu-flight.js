import * as T from './three.js';

// A continuous scenic circuit, independent of the playable flight state.
export class MenuFlight {
 constructor(){this.position=new T.Vector3();this.offset=new T.Vector3();this.target=new T.Vector3();this.axis=new T.Vector3(0,1,0);}
 update(time,model,camera,config){
  const a=time*.034+.6,dx=-850*Math.sin(a),dz=1150*Math.cos(a);
  const heading=Math.atan2(dx,-dz),yaw=-heading;
  const pitch=.025+Math.sin(a*2)*.018,bank=.12+Math.sin(time*.32)*.035;
  this.position.set(350+850*Math.cos(a),340+35*Math.sin(a*2),-150+1150*Math.sin(a));
  model.mesh.position.copy(this.position);model.mesh.rotation.set(pitch,yaw,-bank,'YXZ');
  const scale=config.cameraDistance/18;
  // Keep the plane to the right of the menu copy, with scenery moving underneath.
  this.offset.set((15+Math.sin(time*.09)*1.2)*scale,(6+Math.sin(time*.12)*.5)*scale,16*scale).applyAxisAngle(this.axis,yaw);
  camera.position.copy(this.position).add(this.offset);
  this.target.set(-6*scale,0,-scale).applyAxisAngle(this.axis,yaw).add(this.position);
  camera.lookAt(this.target);
  model.update({throttle:.7,speed:Math.hypot(dx,dz)*.034,gearExtension:config.retractable?0:1},{pitch:Math.sin(time*.32)*.04,roll:Math.sin(time*.32)*.08,yaw:0},0);
 }
}
