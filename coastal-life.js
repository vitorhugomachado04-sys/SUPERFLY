import * as T from './three.js';
import {REGIONS} from './airports.js?v=04.27';
import {terrain,coastRadius,regionRadius} from './geography.js?v=04.27';
export function addCoastalLife(scene,world){
 const moving=[],surfers=[],waves=[],materials=new Map(),cube=new T.BoxGeometry(1,1,1),clock={time:0};
 const mat=c=>{if(!materials.has(c))materials.set(c,new T.MeshStandardMaterial({color:c,roughness:.65}));return materials.get(c);};
 function block(parent,x,y,z,w,h,d,c){const m=new T.Mesh(cube,mat(c));m.position.set(x,y,z);m.scale.set(w,h,d);parent.add(m);return m;}
 // Beach ribbons sample the actual contour: sand is restricted to low, gently sloped shores.
 for(const r of REGIONS.filter(r=>!r.ocean)){
  const positions=[],indices=[];
  for(let i=0;i<256;i++){
   const pair=[];let valid=true;
   for(const angle of [i/256*Math.PI*2,(i+1)/256*Math.PI*2]){
    let lo=.75,hi=1.2;for(let k=0;k<20;k++){const radius=(lo+hi)/2,x=r.x+Math.cos(angle)*r.rx*radius,z=r.z+Math.sin(angle)*r.rz*radius;if(terrain(x,z,false)>-.8)lo=radius;else hi=radius;}
    const outer=hi,inner=outer-.018;
    for(const radius of [inner,outer]){const x=r.x+Math.cos(angle)*r.rx*radius,z=r.z+Math.sin(angle)*r.rz*radius,y=terrain(x,z,false);if(y>7)valid=false;pair.push(x,y+.18,z);}
   }
   if(valid){const n=positions.length/3;positions.push(...pair);indices.push(n,n+1,n+2,n+1,n+3,n+2);}
  }
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();const m=new T.Mesh(geo,new T.MeshStandardMaterial({color:r.id==='aurora-snow'||r.id==='peaks'?'#d7d9c9':'#ead7a5',side:T.DoubleSide,roughness:1,polygonOffset:true,polygonOffsetFactor:-1}));m.name='beach-'+r.id;m.userData.coarse=true;scene.add(m);
  for(let i=0;i<4;i++){
   const kind=i===0?(r.id==='aurora'||r.id==='metro'?'carrier':'cargo'):i===1?'yacht':i===2?'cargo':'jetski',g=new T.Group();g.name='traffic-'+kind;g.userData.coarse=true;scene.add(g);
   if(kind==='carrier'){
    block(g,0,-.5,0,38,5,180,'#52646c');block(g,0,2.4,0,48,1.2,190,'#7b8b90');block(g,14,10,-15,12,15,30,'#a3b3b8');block(g,14,20,-15,.8,10,.8,'#c0c9c8');for(let z=-70;z<80;z+=15)block(g,-4,3.04,z,1,.08,8,'#efe9c8');for(let z=-40;z<=40;z+=25){block(g,15,4,z,3,2,12,'#ced6d4');block(g,15,4,z,12,.5,3,'#ced6d4');}
   }else if(kind==='cargo'){
    block(g,0,-.8,0,22,5,95,'#405766');block(g,0,3,-34,18,8,18,'#e9e4d2');for(let row=0;row<5;row++)for(let col=0;col<3;col++)for(let level=0;level<2;level++)block(g,(col-1)*6,3+level*4,-15+row*12,5.6,3.7,10,['#bd795d','#d1b777','#718f96'][(row+col)%3]);
   }else if(kind==='yacht'){
    block(g,0,-1,0,10,3,36,'#f8f3e4');block(g,0,1,0,8.7,1,32,'#c6a477');block(g,0,3,-4,7,4,17,'#f8f3e4');block(g,0,4,-12.6,6.5,1.8,.2,'#376575');block(g,0,5.5,-4,8,.6,18,'#f9f5eb');
   }else{block(g,0,-2.5,0,1.2,.6,3,'#df9254');block(g,0,-1.9,0,.5,.7,1,'#354d5a');block(g,0,-1.1,0,.5,1,.5,'#e3b78d');}
   const wake=block(g,0,-2.65,kind==='carrier'?110:kind==='cargo'?60:kind==='yacht'?25:5,kind==='carrier'?20:8,.08,kind==='carrier'?50:20,'#a8dcd4');
   const radius=1.4+(i%2)*.18,angle=i*Math.PI/2+r.x*.0001,obstacle={x:0,z:0,w:kind==='carrier'?190:kind==='cargo'?100:kind==='yacht'?38:4,d:kind==='carrier'?190:kind==='cargo'?100:kind==='yacht'?38:4,top:kind==='carrier'?25:kind==='cargo'?12:kind==='yacht'?7:0};world.obstacles.push(obstacle);moving.push({g,r,radius,angle,speed:kind==='jetski'?16:kind==='yacht'?6:3,obstacle,wake});
  }
 }
 // Three surf breaks on the first island, away from the airport approaches and marina.
 for(const [spot,angle] of [0,1,2].map((i)=>[i,[.03,2.4,3.8][i]])){
  let radius=1;while(coastRadius(Math.cos(angle)*1820*radius,Math.sin(angle)*2275*radius)<1.03)radius+=.005;
  const x=Math.cos(angle)*1820*radius,z=Math.sin(angle)*2275*radius,group=new T.Group();group.position.set(x,0,z);group.rotation.y=-angle;group.name='surf-break-'+(spot+1);scene.add(group);
  for(let k=0;k<4;k++){const m=block(group,k*12,-2.6,0,2,.18,100,'#d0eee3');waves.push({m,k});}
  for(let k=0;k<3;k++){const g=new T.Group();group.add(g);block(g,0,0,0,.65,.15,2.7,k%2?'#eed48c':'#df9d87');block(g,0,.65,0,.45,1.1,.3,'#3d6074');block(g,0,1.4,0,.34,.34,.34,'#d4a17c');block(g,0,1,-.1,1.2,.2,.2,'#d4a17c');g.rotation.y=Math.PI/2;surfers.push({g,k,spot});}
 }
 world.coastalInfo={vessels:moving.length,surfSpots:3};
 world.updateCoastal=dt=>{clock.time+=dt;for(const boat of moving){const {g,r,radius,speed,obstacle}=boat;const next=boat.angle+speed/Math.max(r.rx,r.rz)*dt,x=r.x+Math.cos(next)*r.rx*radius,z=r.z+Math.sin(next)*r.rz*radius;if(terrain(x,z,false)<-2.8)boat.angle=next;else boat.angle+=.04;const a=boat.angle;g.position.set(r.x+Math.cos(a)*r.rx*radius,0,r.z+Math.sin(a)*r.rz*radius);g.rotation.y=Math.atan2(Math.sin(a)*r.rx,-Math.cos(a)*r.rz);g.visible=terrain(g.position.x,g.position.z,false)<-2.8;obstacle.x=g.visible?g.position.x:1e8;obstacle.z=g.position.z;}
 for(const {m,k}of waves){m.position.x=((clock.time*3+k*12)%48);m.position.y=-2.6+Math.sin(clock.time*2+k)*.15;}
 for(const {g,k,spot}of surfers){g.position.set(12+Math.sin(clock.time*.4+k)*12,-2.35+Math.sin(clock.time*2+k)*.15,-30+k*28+Math.sin(clock.time*.2+spot)*10);g.rotation.z=Math.sin(clock.time+k)*.12;}};world.updateCoastal(0);
}
