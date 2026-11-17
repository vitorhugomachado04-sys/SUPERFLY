import {enseadaReserved} from './enseada-layout.js?v=04.43';
import * as T from './three.js';
import {terrain,coastRadius,eastCoast,groves} from './geography.js?v=04.43';

export function addScenery(scene,obstacles,rand){
 const mats=new Map(),mat=c=>{if(!mats.has(c))mats.set(c,new T.MeshStandardMaterial({color:c,roughness:.95,flatShading:true}));return mats.get(c);};
 const cube=new T.BoxGeometry(1,1,1),cone=new T.ConeGeometry(1,1,4),rockGeo=new T.IcosahedronGeometry(1,0);
 function mesh(geo,c,x,y,z,sx,sy,sz,ry=0){const m=new T.Mesh(geo,mat(c));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.y=ry;m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;}
 const block=(x,y,z,w,h,d,c)=>mesh(cube,c,x,y,z,w,h,d);
 function house(x,z,w,d,h,c,roofColor){const y=terrain(x,z);block(x,y+h/2,z,w,h,d,c);mesh(cone,roofColor,x,y+h+4,z,w*.78,9,d*.78,Math.PI/4);block(x,y+h*.6,z+d/2+.1,w*.6,h*.3,.15,'#456674');obstacles.push({x,z,w,d,top:y+h+9});}
 // Three tree silhouettes, clustered into woods rather than evenly scattered.
 const forest=[],broad=[],palms=[];
 for(let i=0;i<4500;i++){
  const x=(rand()-.5)*3640,z=(rand()-.5)*4550,h=terrain(x,z),r=coastRadius(x,z);
  if(enseadaReserved(x,z,20)||h<0||r>.94||Math.abs(x)<300&&Math.abs(z)<1500||x>550&&x<1100&&z>380&&z<900||x>-1200&&x<-450&&z>300&&z<1100)continue;
  const density=.5+.25*Math.sin(x*.005)*Math.cos(z*.004)+.2*Math.sin((x+z)*.009);
  if(rand()>density)continue;
  const size=9+rand()*16;(h>65?forest:broad).push({x,y:h,z,size,angle:rand()*6.28});
 }
 // Concentrated stands create distinct woodland silhouettes from altitude.
 for(const [cx,cz,radius]of groves)for(let i=0;i<220;i++){
  const angle=rand()*Math.PI*2,distance=Math.sqrt(rand())*radius,x=cx+Math.cos(angle)*distance,z=cz+Math.sin(angle)*distance,h=terrain(x,z);
  if(enseadaReserved(x,z,20)||h<0||Math.abs(x)<300&&Math.abs(z)<1500)continue;
  (h>65?forest:broad).push({x,y:h,z,size:18+rand()*17,angle:rand()*6.28});
 }
 // Palms follow the beaches, keeping the runway's two approach corridors open.
 for(let i=0;i<100;i++){
  const a=i/100*Math.PI*2,r=.955,x=Math.cos(a)*1820*r,z=Math.sin(a)*2275*r,h=terrain(x,z);
  if(enseadaReserved(x,z,20)||h<0||Math.abs(x)<300&&Math.abs(z)<1800)continue;palms.push({x,y:h,z,size:12+rand()*8,angle:rand()*6.28});
 }
 function batch(geo,color,items,transform){if(!items.length)return;const b=new T.InstancedMesh(geo,mat(color),items.length),dummy=new T.Object3D();items.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(0,p.angle,0);dummy.scale.set(1,1,1);transform(dummy,p,i);dummy.updateMatrix();b.setMatrixAt(i,dummy.matrix);});b.userData.windResponsive=color!=='#a6aa97';b.castShadow=true;b.receiveShadow=true;b.computeBoundingSphere();scene.add(b);}
 const trunk=new T.CylinderGeometry(.5,.7,1,5);
 batch(trunk,'#8b7860',[...forest,...broad,...palms],(d,p)=>{d.position.y+=p.size*.28;d.scale.set(p.size*.07,p.size*.56,p.size*.07);});
 batch(new T.ConeGeometry(1,1,6),'#426f60',forest,(d,p)=>{d.position.y+=p.size*.65;d.scale.set(p.size*.34,p.size,p.size*.34);});
 for(let k=0;k<2;k++)batch(new T.IcosahedronGeometry(1,1),k?'#709566':'#568460',broad.filter((_,i)=>i%2===k),(d,p)=>{d.position.y+=p.size*.7;d.scale.set(p.size*.42,p.size*.48,p.size*.4);});
 for(let k=0;k<5;k++)batch(new T.ConeGeometry(1,1,3),'#5d9678',palms,(d,p)=>{d.rotation.set(.22, p.angle+k*Math.PI*2/5, Math.PI/2);d.position.y+=p.size*.8;d.scale.set(p.size*.14,p.size*.68,p.size*.07);});
 // Seaside village: warm roofs, pastel walls, a plaza and a clock tower.
 const walls=['#e9d9b9','#c7dad0','#d7b9a0','#e8e5d0','#a9c5c6'],roofs=['#b77058','#867898','#c08b65'];
 for(let row=0;row<7;row++)for(let col=0;col<9;col++){
  if(col>=3&&col<=5&&row>=2&&row<=4)continue;
  house(600+col*52,450+row*55,22+rand()*9,24+rand()*7,10+rand()*12,walls[(col+row)%walls.length],roofs[(col+row*2)%3]);
 }
 const plazaX=808,plazaZ=615,plazaH=terrain(plazaX,plazaZ);
 block(plazaX,plazaH+.3,plazaZ,115,.6,115,'#d5c7a4');
 mesh(new T.CylinderGeometry(12,14,2,12),'#d9e1d5',plazaX,plazaH+1.3,plazaZ,1,1,1);
 mesh(new T.CylinderGeometry(9,9,.3,16),'#73b4bb',plazaX,plazaH+2.4,plazaZ,1,1,1);
 block(860,terrain(860,620)+23,620,17,46,17,'#ece0c2');mesh(cone,'#6a659e',860,terrain(860,620)+51,620,18,12,18,Math.PI/4);obstacles.push({x:860,z:620,w:20,d:20,top:terrain(860,620)+57});
 // Farmstead and silos beside the patchwork fields.
 house(-1220,260,45,65,18,'#b16f57','#5e6f70');
 for(const x of [-1140,-1105]){const y=terrain(x,280);mesh(new T.CylinderGeometry(12,12,30,10),'#d3d2bc',x,y+15,280,1,1,1);mesh(new T.ConeGeometry(14,9,10),'#7b8990',x,y+34,280,1,1,1);obstacles.push({x,z:280,w:28,d:28,top:y+39});}
 // Marina on the actual coastline, with piers, warehouses and moored boats.
 const shore=eastCoast(1000);
 block(shore-25,1,1000,100,4,230,'#b9b7a0');block(shore+70,.4,1000,160,2,12,'#9c9077');
 obstacles.push({x:shore+45,z:1000,w:210,d:18,top:2});
 for(let k=0;k<4;k++){
  const z=930+k*46;block(shore+75,.3,z,10,2,36,'#a2967b');
  mesh(new T.SphereGeometry(1,8,6),k%2?'#f1e5cc':'#6a659e',shore+110,-1.9,z,7,2.4,16);
  block(shore+110,.4,z,9,2,19,'#e8dec6');block(shore+110,2.5,z-2,5,3,7,'#d8e7df');
  obstacles.push({x:shore+110,z,w:14,d:32,top:5});
 }
 for(let k=0;k<3;k++)house(shore-90,920+k*70,42,44,15,'#d4d8c5',k%2?'#6a659e':'#ae8067');
 for(let k=0;k<10;k++){const x=shore-230-(k%5)*47,z=850+Math.floor(k/5)*75;house(x,z,24,28,10,walls[k%5],roofs[k%3]);}

 // Coastal rocks form visible headlands; kept outside the learning airfield.
 const rocks=[];
 for(let i=0;i<150;i++){const a=rand()*Math.PI*2,x=Math.cos(a)*1787.5,z=Math.sin(a)*2223,h=terrain(x,z);if(enseadaReserved(x,z,20)||h<0||coastRadius(x,z)<.9||Math.abs(x)<350)continue;rocks.push({x,y:h,z,size:6+rand()*18,angle:a});}
 batch(rockGeo,'#a6aa97',rocks,(d,p)=>{d.position.y+=p.size*.25;d.scale.set(p.size,p.size*.65,p.size*.7);});
 return {trees:forest.length+broad.length+palms.length,landmarks:4};
}
