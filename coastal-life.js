import * as T from './three.js';
import {REGIONS} from './airports.js?v=04.56';
import {terrain,coastRadius,regionRadius} from './geography.js?v=04.56';
export function addCoastalLife(scene,world){
 const moving=[],surfers=[],waves=[],materials=new Map(),cube=new T.BoxGeometry(1,1,1),clock={time:0};
 const mat=c=>{if(!materials.has(c))materials.set(c,new T.MeshStandardMaterial({color:c,roughness:.65}));return materials.get(c);};
 function block(parent,x,y,z,w,h,d,c){const m=new T.Mesh(cube,mat(c));m.position.set(x,y,z);m.scale.set(w,h,d);parent.add(m);return m;}
 // Beach ribbons sample the actual contour: sand is restricted to low, gently sloped shores.
 for(const r of REGIONS.filter(r=>!r.ocean)){
  const positions=[],indices=[];
  for(let i=0;i<512;i++){
   const pair=[];let valid=true;
   for(const angle of [i/512*Math.PI*2,(i+1)/512*Math.PI*2]){
    let lo=.75,hi=1.2;for(let k=0;k<20;k++){const radius=(lo+hi)/2,x=r.x+Math.cos(angle)*r.rx*radius,z=r.z+Math.sin(angle)*r.rz*radius;if(terrain(x,z,false)>-.8)lo=radius;else hi=radius;}
    const outer=hi,inner=outer-.018;
    for(const radius of [inner,outer]){const x=r.x+Math.cos(angle)*r.rx*radius,z=r.z+Math.sin(angle)*r.rz*radius,y=terrain(x,z,false);if(y>7)valid=false;pair.push(x,y+.18,z);}
   }
   if(valid){const n=positions.length/3;positions.push(...pair);indices.push(n,n+1,n+2,n+1,n+3,n+2);}
  }
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();const m=new T.Mesh(geo,new T.MeshStandardMaterial({color:r.id==='aurora-snow'||r.id==='peaks'?'#d7d9c9':'#ead7a5',side:T.DoubleSide,roughness:1,polygonOffset:true,polygonOffsetFactor:-1}));m.name='beach-'+r.id;m.userData.coarse=true;scene.add(m);
  for(let i=0;i<3;i++){
   const kind=i===0?(r.id==='aurora'||r.id==='metro'?'carrier':'cargo'):i===1?'yacht':'cargo',g=new T.Group();g.name='traffic-'+kind;g.userData.coarse=true;scene.add(g);
   if(kind==='carrier'){
    block(g,0,-.5,0,38,5,180,'#52646c');block(g,0,2.4,0,48,1.2,190,'#7b8b90');block(g,14,10,-15,12,15,30,'#a3b3b8');block(g,14,20,-15,.8,10,.8,'#c0c9c8');for(let z=-70;z<80;z+=15)block(g,-4,3.04,z,1,.08,8,'#efe9c8');for(let z=-40;z<=40;z+=25){block(g,15,4,z,3,2,12,'#ced6d4');block(g,15,4,z,12,.5,3,'#ced6d4');}
   }else if(kind==='cargo'){
    // Tapered bow, painted waterline and a working container deck.
    const outline=[[-8,-47],[8,-47],[11,-38],[11,31],[8,43],[0,49],[-8,43],[-11,31],[-11,-38]];
    const shape=new T.Shape();outline.forEach(([x,z],j)=>j?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();
    const hullGeo=new T.ExtrudeGeometry(shape,{depth:5,bevelEnabled:false});hullGeo.rotateX(-Math.PI/2);
    const hull=new T.Mesh(hullGeo,mat('#344957'));hull.position.y=-3.3;g.add(hull);
    const deck=new T.Mesh(new T.ShapeGeometry(shape),mat('#8a958b'));deck.rotation.x=-Math.PI/2;deck.position.y=1.76;g.add(deck);
    // Batch the small details by paint colour to keep passing fleets inexpensive.
    const details=new Map();const detail=(x,y,z,w,h,d,c)=>{if(!details.has(c))details.set(c,[]);details.get(c).push([x,y,z,w,h,d]);};
    for(const side of [-1,1]){detail(side*11.03,-1,0,.14,.65,63,'#b36b59');detail(side*10.2,2.8,0,.16,.16,72,'#e7e4ce');for(let z=-35;z<=35;z+=5)detail(side*10.2,2.3,z,.16,1.1,.16,'#e7e4ce');}
    detail(0,6,-35,17,8,17,'#eee9d8');detail(0,10.5,-35,19,1,19,'#6a659e');
    detail(0,9,-25.9,15,2,.22,'#305561');for(const side of [-1,1])detail(side*8.6,9,-35,.2,2,12,'#305561');
    detail(0,13,-37,.4,5,.4,'#e7e4ce');detail(0,14,-37,8,.35,.5,'#e7e4ce');detail(0,12,-40,4,5,4,'#6a659e');detail(0,14.6,-40,4.2,.7,4.2,'#303c43');
    detail(-9,5,-38,2.5,1.6,7,'#e79a53');detail(9,5,-38,2.5,1.6,7,'#e79a53');
    const paints=['#6a659e','#b96e54','#d1b777','#688c91','#e4dfc9'];
    for(let row=0;row<5;row++)for(let col=0;col<3;col++){
     const levels=1+(row+col)%3;
     for(let level=0;level<levels;level++){
      const x=(col-1)*6,z=-15+row*11,y=3.8+level*3.8,c=paints[(row*2+col+level)%paints.length];
      detail(x,y,z,5.6,3.6,9.8,c);
      for(const side of [-1,1]){for(let k=-4;k<=4;k+=2)detail(x+side*2.84,y,z+k,.12,3.2,.16,'#53656b');detail(x+side*1.3,y,z+4.95,.12,3,.1,'#d2d3c5');}
      detail(x,y+1.84,z,5.2,.1,.15,'#d2d3c5');
     }
    }
    // Foredeck winches and mooring bollards leave the pointed bow readable.
    for(const x of [-5,5]){detail(x,2.5,37,3,1.5,3,'#485b62');detail(x,3.1,37,4,.5,1,'#b2b8a5');detail(x,2.5,42,.8,1.4,.8,'#e3dec9');}
    detail(0,4,43,.3,4,.3,'#e5e3d4');detail(1.3,5.2,43,2.5,1.4,.12,'#6a659e');
    for(const [color,items]of details){const inst=new T.InstancedMesh(cube,mat(color),items.length),dummy=new T.Object3D();items.forEach(([x,y,z,w,h,d],j)=>{dummy.position.set(x,y,z);dummy.scale.set(w,h,d);dummy.updateMatrix();inst.setMatrixAt(j,dummy.matrix);});inst.computeBoundingSphere();g.add(inst);}

   }else if(kind==='yacht'){
    block(g,0,-1,0,10,3,36,'#f8f3e4');block(g,0,1,0,8.7,1,32,'#c6a477');block(g,0,3,-4,7,4,17,'#f8f3e4');block(g,0,4,-12.6,6.5,1.8,.2,'#376575');block(g,0,5.5,-4,8,.6,18,'#f9f5eb');
   }

   const radius=1.4+(i%2)*.18,angle=i*Math.PI/2+r.x*.0001,obstacle={x:0,z:0,w:kind==='carrier'?190:kind==='cargo'?100:kind==='yacht'?38:4,d:kind==='carrier'?190:kind==='cargo'?100:kind==='yacht'?38:4,top:kind==='carrier'?25:kind==='cargo'?16:kind==='yacht'?7:0};world.obstacles.push(obstacle);moving.push({g,r,radius,angle,speed:kind==='yacht'?6:3,obstacle});
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
