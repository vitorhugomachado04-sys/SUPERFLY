import * as T from './three.js';
import {terrain} from './geography.js?v=04.53';
// One architectural family, sized for the airport; all aprons follow the ground.
export function addControlTower(scene,obstacles,a){
 const metro=a.id==='city',school=a.id==='school',x=a.x+(school?100:-110),z=a.z+(school?-30:80),y=terrain(x,z,false),height=metro?56:school?29:25,radius=metro?13:9;
 const g=new T.Group();g.name=`control-tower-${a.id}`;g.position.set(x,y,z);scene.add(g);const mats=new Map();
 const mat=color=>{if(!mats.has(color))mats.set(color,new T.MeshStandardMaterial({color,roughness:.55,metalness:.15}));return mats.get(color);};
 const add=(geo,color,px,py,pz)=>{const m=new T.Mesh(geo,mat(color));m.position.set(px,py,pz);m.castShadow=m.receiveShadow=true;g.add(m);return m;};
 const box=(px,py,pz,w,h,d,c)=>add(new T.BoxGeometry(w,h,d),c,px,py,pz);
 const hex=(rt,rb,h,py,col)=>add(new T.CylinderGeometry(rt,rb,h,6),col,0,py,0);
 // Pavement and a pedestrian connection to the runway-side apron, no floating slab.
 const end=school?-35:65,positions=[],indices=[];
 for(let row=0;row<=14;row++)for(let col=0;col<=20;col++){const dx=-32+col*5,dz=-35+row*5;const inPlaza=dx<=32,inPath=dx<=end&&Math.abs(dz)<7;if(!inPlaza&&!inPath)continue;const n=positions.length/3;for(const [ox,oz]of[[0,0],[5,0],[0,5],[5,5]])positions.push(x+dx+ox,terrain(x+dx+ox,z+dz+oz,false)+.045,z+dz+oz);indices.push(n,n+2,n+1,n+1,n+2,n+3);}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();const pavement=new T.Mesh(geo,mat('#959f9b'));pavement.receiveShadow=true;scene.add(pavement);
 box(0,3,0,29,6,27,'#c8c9b9');box(0,6.3,0,31,.6,29,'#6f7c89');box(14.6,3,0,.2,4,17,'#527d8a');
 hex(4.7,6.8,height-8,(height-8)/2+6,'#c2c9bf');
 for(let i=0;i<6;i++){const ang=i*Math.PI/3,px=Math.sin(ang)*5.6,pz=Math.cos(ang)*5.6;box(px,height*.48,pz,.38,height*.6,.38,'#859699');}
 hex(radius+1,6,4,height-2,'#83959a');hex(radius,radius-1,7,height+3.5,'#4d7c8c');
 for(let i=0;i<6;i++){const ang=i*Math.PI/3;box(Math.sin(ang)*(radius-.2),height+3.5,Math.cos(ang)*(radius-.2),.45,7.8,.45,'#e0dfca');}
 hex(radius+1.8,radius+1.8,.8,height+7.4,'#d4dccf');hex(radius+1,radius+1,.6,height-.3,'#d4dccf');
 box(0,height+11,0,.18,7,.18,'#899697');add(new T.SphereGeometry(.5,8,6),'#d58c78',0,height+14.6,0);
 box(5,height+9,0,5,.5,1.5,'#bbc5b8');box(5,height+8.2,0,.25,1.5,.25,'#71818a');
 for(const side of [-1,1]){box(side*21,.65,20,9,1.3,2,'#77706a');box(side*25,1.3,-24,5,2.6,5,'#aab7a2');add(new T.IcosahedronGeometry(2.8,1),'#77927a',side*25,4,-24);}
 obstacles.push({x,z,w:32,d:30,top:y+height+15});g.userData.airport=a.id;g.userData.cabinSides=6;return g;
}
