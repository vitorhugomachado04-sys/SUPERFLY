import {WaterCrash,WATER_LEVEL} from './water-crash.js?v=04.56';
import * as T from './three.js';
import {terrain} from './physics.js?v=04.56';
export class CrashEffect{
 constructor(scene){this.scene=scene;this.group=new T.Group();scene.add(this.group);this.center=new T.Vector3();this.reset();
 const n=32,data=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){let i=(y*n+x)*4,r=Math.hypot((x-15.5)/16,(y-15.5)/16);data[i]=data[i+1]=data[i+2]=255;data[i+3]=Math.round(Math.max(0,1-r*r)**2*255);}this.texture=new T.DataTexture(data,n,n);this.texture.needsUpdate=true;
 }
 reset(){this.water?.dispose();this.water=null;this.light=null;if(this.group)for(const o of [...this.group.children]){this.group.remove(o);if(o.isSprite&&!o.userData.water)o.material.dispose();}this.parts=[];this.cloud=[];this.active=false;this.time=0;this.shown=false;}
 trigger(model,f,camera){this.reset();this.active=true;this.center.set(f.x,f.y,f.z);this.cameraStart=camera.position.clone();this.size=Math.max(3,f.config.length*.25);model.updateMatrixWorld(true);
 if(f.crashSurface==='water'||f.reason==='Contato com a água'){this.water=new WaterCrash(this.group,model,f,this.texture);this.center.y=WATER_LEVEL;return;}

 model.traverse(o=>{if(!o.isMesh||o.material.transparent)return;const p=new T.Mesh(o.geometry,o.material);o.matrixWorld.decompose(p.position,p.quaternion,p.scale);p.castShadow=true;this.group.add(p);const away=p.position.clone().sub(this.center);const v=new T.Vector3((Math.random()-.5)*15,8+Math.random()*13,(Math.random()-.5)*15).addScaledVector(away,1.5).add(new T.Vector3(f.vx*.18,0,f.vz*.18));this.parts.push({mesh:p,v,spin:new T.Vector3(Math.random()*5-2.5,Math.random()*5-2.5,Math.random()*5-2.5)});});
 for(let i=0;i<180;i++){const fire=i<90,delay=i<32?0:(i%90)/90*4,life=fire?.7+Math.random()*.7:2.2+Math.random()*1.5;const mat=new T.SpriteMaterial({map:this.texture,color:fire?'#ff9a27':'#34383b',transparent:true,depthWrite:false,blending:fire&&i<16?T.AdditiveBlending:T.NormalBlending});const sprite=new T.Sprite(mat);sprite.visible=false;this.group.add(sprite);this.cloud.push({sprite,fire,delay,life,offset:new T.Vector3((Math.random()-.5)*this.size,Math.random()*this.size*.3,(Math.random()-.5)*this.size),drift:new T.Vector3((Math.random()-.5)*3,fire?4+Math.random()*4:5+Math.random()*4,(Math.random()-.5)*3)});}
 this.light=new T.PointLight('#ff9c39',70,this.size*15,1.5);this.light.position.copy(this.center).add(new T.Vector3(0,3,0));this.group.add(this.light);
 }
 update(dt,camera){if(!this.active)return;this.time+=dt;const t=this.time;
 if(this.water){this.water.update(t);this.updateCamera(camera,t);return;}
 for(const p of this.parts){p.v.y-=12*dt;p.mesh.position.addScaledVector(p.v,dt);p.mesh.rotation.x+=p.spin.x*dt;p.mesh.rotation.y+=p.spin.y*dt;p.mesh.rotation.z+=p.spin.z*dt;const floor=Math.max(-2,terrain(p.mesh.position.x,p.mesh.position.z))+.25;if(p.mesh.position.y<floor){p.mesh.position.y=floor;p.v.y=Math.abs(p.v.y)*.22;p.v.x*=Math.exp(-dt*3);p.v.z*=Math.exp(-dt*3);p.spin.multiplyScalar(Math.exp(-dt*3));}}
 for(const p of this.cloud){const age=t-p.delay;p.sprite.visible=age>=0&&age<p.life;if(!p.sprite.visible)continue;const k=age/p.life;p.sprite.position.copy(this.center).add(p.offset).addScaledVector(p.drift,age);p.sprite.scale.setScalar(this.size*(p.fire?.7:1)*(1+k*2));p.sprite.material.opacity=(p.fire?.9:.65)*Math.sin(Math.PI*.5*Math.min(1,k*4))*(1-k);if(p.fire)p.sprite.material.color.setHSL(.12-.1*k,1,.65-.3*k);}
 this.light.intensity=Math.max(0,1-t/5)*(45+25*Math.sin(t*35)**2);
 this.updateCamera(camera,t);
 }
 updateCamera(camera,t){const offset=this.cameraStart.clone().sub(this.center);if(offset.length()<this.size*4)offset.set(this.size*3,this.size*2,this.size*4);offset.multiplyScalar(1+Math.min(t,5)*.07);camera.position.copy(this.center).add(offset);camera.position.y=Math.max(camera.position.y,terrain(camera.position.x,camera.position.z)+5);camera.lookAt(this.center.x,this.center.y+this.size*.4,this.center.z);
 }
 get ready(){return this.active&&this.time>=5;}
}
