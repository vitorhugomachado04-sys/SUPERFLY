import * as T from './three.js';
export const winterReserved=(x,z)=>x>830&&x<1190&&z>-850&&z<320;
export function addWinterActivity({scene,world,r,ground,obstacle}){
 const group=new T.Group();group.name=r.id+'-ski-animation';group.position.set(r.x,0,r.z);scene.add(group);
 const geo=new T.BoxGeometry(1,1,1),mats=new Map();
 function part(parent,x,y,z,w,h,d,color){if(!mats.has(color))mats.set(color,new T.MeshStandardMaterial({color,roughness:.8}));const m=new T.Mesh(geo,mats.get(color));m.position.set(x,y,z);m.scale.set(w,h,d);m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
 const top=r.id==='aurora-snow'?-740:-510,bottom=top+780,nodes=[];
 const groundPoint=(t,lane=0)=>({x:1000+lane*16+Math.sin(t*Math.PI*8+lane)*32,z:top+t*780});
 // Wide groomed trail over the sampled terrain.
 const positions=[],indices=[];for(let row=0;row<=156;row++)for(let col=0;col<=20;col++){const x=910+col*9,z=top+row*5;positions.push(x,ground(x,z)+.65,z);if(row&&col){const n=row*21+col;indices.push(n-22,n-1,n-21,n-21,n-1,n);}}
 const slope=new T.BufferGeometry();slope.setAttribute('position',new T.Float32BufferAttribute(positions,3));slope.setIndex(indices);slope.computeVertexNormals();group.add(new T.Mesh(slope,new T.MeshStandardMaterial({color:'#f4f4ed',roughness:1})));
 for(let i=0;i<=16;i++){const z=bottom-i*780/16,y=ground(1130,z);nodes.push(new T.Vector3(1130,y+30,z));part(group,1130,y+15,z,1.5,30,1.5,'#788d95');part(group,1130,y+30,z,18,1,2,'#526f7a');obstacle(1130,z,3,3,y+31);}
 for(let i=1;i<nodes.length;i++)for(const side of [-1,1]){const a=nodes[i-1].clone(),b=nodes[i].clone();a.x+=side*6;b.x+=side*6;const d=b.clone().sub(a),m=part(group,0,0,0,.18,d.length(),.18,'#50636d');m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());}
 for(const z of [top,bottom]){const y=ground(1130,z);part(group,1130,y+9,z,34,18,28,'#a17d5f');part(group,1130,y+19,z,40,2,34,'#f1f2e9');part(group,1130,y+12,z+14.1,25,5,.2,'#577d92');obstacle(1130,z,40,34,y+20);}
 const cabins=[];for(let i=0;i<16;i++){const c=new T.Group();c.userData.ascending=i<8;group.add(c);part(c,0,-3,0,.22,6,.22,'#4c626e');part(c,0,-7,0,6,5,5.5,i<8?'#c98368':'#7c82a6');for(const side of [-1,1]){part(c,0,-6.5,side*2.8,5,2.5,.12,'#5c8a9e');part(c,side*3.05,-6.5,0,.12,2.5,4.5,'#5c8a9e');}part(c,0,-4.5,0,6.6,.5,6,'#eeeee6');cabins.push(c);}
 const riders=[];for(let i=0;i<8;i++){
  const mesh=new T.Group(),body=new T.Group(),ski=i%2===0;mesh.add(body);group.add(mesh);const color=['#d67b5c','#6d85c0','#d0b259','#5b9f93'][i%4];
  if(ski)for(const side of [-1,1]){part(mesh,side*.4,.1,0,.22,.14,3.3,'#4b648a');const pole=part(body,side*.9,1.1,.4,.055,2.4,.055,'#b2c4cb');pole.rotation.x=-.3;}
  else part(mesh,0,.12,0,.85,.16,2.8,'#9870b7');
  part(body,0,1.6,0,.85,1.1,.65,color);part(body,0,2.4,0,.48,.48,.48,'#e5c7a7');part(body,0,2.67,0,.55,.23,.55,'#4a5e79');part(body,0,2.44,-.26,.5,.13,.06,'#233e4f');
  for(const side of [-1,1]){const leg=part(body,side*.28,.7,0,.3,1,.35,'#425b70');leg.rotation.x=-.2;const arm=part(body,side*.65,1.55,0,.25,.9,.3,color);arm.rotation.z=side*.7;}
  if(!ski)body.rotation.y=Math.PI/2;riders.push({mesh,body,ski,phase:i/8,lane:i%3-1});
 }
 let time=0;
 function update(dt){if(!group.parent)return;time+=dt;
  cabins.forEach((c,i)=>{const phase=(time/100+(i%8+.5)/8)%1,u=i<8?phase:1-phase,k=Math.min(15,Math.floor(u*16));c.position.copy(nodes[k]).lerp(nodes[k+1],u*16-k);c.position.x+=i<8?-6:6;c.rotation.z=Math.sin(time*.8+i)*.025;});
  for(const rider of riders){const t=(time/85+rider.phase)%1,a=groundPoint(t,rider.lane),b=groundPoint(Math.min(1,t+.002),rider.lane),y=ground(a.x,a.z);rider.mesh.position.set(a.x,y+.85,a.z);rider.mesh.rotation.set(-Math.atan2(ground(b.x,b.z)-y,Math.hypot(b.x-a.x,b.z-a.z)),Math.atan2(b.x-a.x,b.z-a.z),0,'YXZ');rider.body.rotation.z=Math.cos(t*Math.PI*8+rider.lane)*.25;rider.mesh.scale.setScalar(Math.max(.001,Math.min(1,t*50,(1-t)*50)));}
 }
 update(0);const activity={group,update,cabins,riders,nodes,region:r.id};(world.winterActivities??=[]).push(activity);return activity;
}
