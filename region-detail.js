import {addDesertDetail} from './desert-detail.js?v=04.27';
import {addWinterActivity,winterReserved} from './winter-activity.js?v=04.27';
import {addSpaceport,oceanPlatform} from './spaceport.js?v=04.27';
import {addControlTower} from './control-tower.js?v=04.27';
import {addAlpineResort,resortReserved} from './alpine-resort.js?v=04.27';
import {addWindRecreation} from './winds-recreation.js?v=04.27';
import {windAmenityReserved,windFarmReserved,windTurbineReserved} from './winds-layout.js?v=04.27';
import {addVillages} from './villages.js?v=04.27';
import {addRegionalAirportLife} from './airport-life.js?v=04.27';
import {CITY_PLACES,cityLotAllowed,approachCorridor,residentialBelt} from './city-layout.js?v=04.27';
import {addCityParks} from './city-parks.js?v=04.27';
import * as T from './three.js';
import {AIRPORTS,airportById} from './airports.js?v=04.27';
import {terrain,regionRadius} from './geography.js?v=04.27';
// Deterministic scenery and instanced detail: revisiting never generates another city.
export function populateRegion(scene,world,r){
 let roofGeo=new T.BufferGeometry();roofGeo.setAttribute('position',new T.Float32BufferAttribute([-.5,-.5,-.5,.5,-.5,-.5,0,.5,-.5,-.5,-.5,.5,.5,-.5,.5,0,.5,.5],3));roofGeo.setIndex([0,2,1,3,4,5,0,3,5,0,5,2,1,2,5,1,5,4,0,1,4,0,4,3]);roofGeo=roofGeo.toNonIndexed();roofGeo.computeVertexNormals();
 const batches=new Map(),cube=new T.BoxGeometry(1,1,1),cone=new T.ConeGeometry(1,1,7),cylinder=new T.CylinderGeometry(1,1,1,10),ball=new T.IcosahedronGeometry(1,1),mats=new Map(),rand=n=>{const v=Math.sin(n*127.1+r.x*.01+r.z*.001)*43758.5453;return v-Math.floor(v);};
 const material=(color,facade=false)=>{const key=color+facade;if(!mats.has(key)){const m=new T.MeshStandardMaterial({color,roughness:facade?.38:.86,metalness:facade?.18:0});if(facade)m.onBeforeCompile=sh=>{sh.vertexShader='varying vec3 facadePos; varying vec3 facadeNormal;\n'+sh.vertexShader;sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
 vec4 fp=vec4(position,1.0);
 #ifdef USE_INSTANCING
 fp=instanceMatrix*fp;
 #endif
 facadePos=(modelMatrix*fp).xyz;facadeNormal=normal;`);sh.fragmentShader='varying vec3 facadePos; varying vec3 facadeNormal;\n'+sh.fragmentShader;sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 if(abs(facadeNormal.y)<0.6){float horizontal=abs(facadeNormal.x)>.5?facadePos.z:facadePos.x;vec2 cell=vec2(horizontal/6.0,facadePos.y/4.6);vec2 f=fract(cell),aa=max(fwidth(cell),vec2(.015));float win=smoothstep(.15-aa.x,.15+aa.x,f.x)*(1.0-smoothstep(.85-aa.x,.85+aa.x,f.x))*smoothstep(.15-aa.y,.15+aa.y,f.y)*(1.0-smoothstep(.85-aa.y,.85+aa.y,f.y));win*=clamp(1.0-max(aa.x,aa.y),0.0,1.0);float lit=step(.78,fract(sin(dot(floor(cell),vec2(12.9898,78.233)))*43758.5453));vec3 glass=mix(vec3(.17,.32,.39),vec3(.81,.73,.46),lit*.25);diffuseColor.rgb=mix(diffuseColor.rgb,glass,win*.6);}`);};mats.set(key,m);}return mats.get(key);};
 function item(x,y,z,w,h,d,color,kind='box',rot=0,facade=false){const key=color+kind+facade;let batch=batches.get(key);if(!batch){batch={geo:kind==='ball'?ball:kind==='roof'?roofGeo:kind==='cone'?cone:kind==='cylinder'?cylinder:cube,mat:material(color,facade),items:[]};batches.set(key,batch);}batch.items.push([x+r.x,y,z+r.z,w,h,d,rot]);}
 const ground=(x,z)=>terrain(r.x+x,r.z+z,false);
 const obstacle=(x,z,w,d,top)=>world.obstacles.push({x:r.x+x,z:r.z+z,w,d,top});
 const clear=(x,z,margin=65)=>!AIRPORTS.filter(a=>a.region===r.id).some(a=>Math.abs(r.x+x-a.x)<a.width/2+margin&&Math.abs(r.z+z-a.z)<a.length/2+margin);
 function building(x,z,w,d,h,color,style=0){const base=ground(x,z);if(base<1)return;if(style%7===1&&h>90){item(x,base+h*.3,z,w,h*.6,d,color,'box',0,true);item(x,base+h*.73,z,w*.76,h*.26,d*.76,color,'box',0,true);item(x,base+h*.93,z,w*.52,h*.14,d*.52,color,'box',0,true);}else if(style%9===2&&h>120){item(x,base+h/2,z,w*.5,h,d*.5,color,'cylinder',0,true);}else item(x,base+h/2,z,w,h,d,color,'box',0,true);obstacle(x,z,w,d,base+h+3);item(x,base+2,z,w+5,4,d+5,'#b9b6a6');item(x,base+h+1,z,w*(style%7===1&&h>90?.55:1)+1,2,d*(style%7===1&&h>90?.55:1)+1,'#b4c4be');
 if(style%3===0){item(x,base+h+3,z,w*.55,5,d*.5,'#7a8d93');item(x+w*.3,base+h+4,z-d*.22,4,6,5,'#c1c4b5');}
 if(style%4===0&&h>100){item(x,base+h*.66,z,w+3,2,d+3,'#d3d4c6');item(x,base+h*.33,z,w+3,2,d+3,'#d3d4c6');}
 if(style%5===0&&h>180){const top=h*.19;item(x,base+h+top/2,z,w*.55,top,d*.55,color,'box',0,true);item(x,base+h+top+15,z,.9,30,.9,'#d0d7cd');obstacle(x,z,w*.6,d*.6,base+h+top+30);}
 }
 function trees(count,conifer=false){for(let i=0;i<count;i++){const cluster=i%4,centres=[[-850,-500],[800,500],[-750,1150],[950,-1000]],x=conifer?centres[cluster][0]+(rand(i*9+1)-.5)*1050:(rand(i*9+1)-.5)*r.rx*1.9,z=conifer?centres[cluster][1]+(rand(i*9+2)-.5)*1000:(rand(i*9+2)-.5)*r.rz*1.9,y=ground(x,z);if(((r.id==='peaks'&&resortReserved(x,z))||(r.id==='peaks'&&winterReserved(x,z)))||(r.id==='winds'&&(windAmenityReserved(x,z,20)||windFarmReserved(x,z,15)||windTurbineReserved(x,z,20)))||regionRadius(r,r.x+x,r.z+z)>.9||y<5||!clear(x,z,110)||(['alpine','peaks'].includes(r.id)&&y>650))continue;const h=8+rand(i*9+3)*14;item(x,y+h*.35,z,1.2,h*.7,1.2,'#685e47','cylinder');if(conifer){const snowy=r.id==='aurora-snow'||r.id==='peaks'||y>450;for(let tier=0;tier<3;tier++){const width=h*(.34-tier*.075),height=h*(.58-tier*.1),cy=y+h*(.42+tier*.24);item(x,cy,z,width,height,width,'#3e6259','cone');if(snowy)item(x,cy+height*.10,z,width*.92,height*.83,width*.92,tier%2?'#edf2ef':'#dce8e9','cone');}}else item(x,y+h*.7,z,h*.32,h*.95,h*.32,i%2?'#6c8c70':'#8aa376','cone');}}
 function chalet(x,z,i){const samples=[ground(x-12,z-16),ground(x+12,z-16),ground(x-12,z+16),ground(x+12,z+16)],y=Math.max(...samples),low=Math.min(...samples)-2;if(y-low>12)return;item(x,(low+y)/2,z,20,y-low,27,'#8d9690');item(x,y+4,z,18,8,25,i%2?'#ae957c':'#958671');item(x,y+11,z,22,6,29,'#d6d5c7','roof');item(x,y+4,z+12.6,12,2,.25,'#e8d8a3');obstacle(x,z,20,27,y+14);}

 function airportBase(id){const a=airportById(id),x=a.x-r.x,z=a.z-r.z;
 addRegionalAirportLife(scene,world,a,{item,ground,r});
 addControlTower(scene,world.obstacles,a);
 }
 if(r.id==='metro'){
  const palette=['#91aeb5','#78969e','#aabfc1','#bdb9aa','#c7c6b8','#718c9a'];let count=0,maxHeight=0;
  for(let row=0;row<47;row++)for(let col=0;col<53;col++){const i=row*53+col,x=-1900+col*73+(rand(i+4)-.5)*8,z=-1840+row*80+(rand(i+5)-.5)*8,w=38+rand(i+32)*16,d=40+rand(i+33)*18;
   if(((r.id==='peaks'&&resortReserved(x,z))||(r.id==='peaks'&&winterReserved(x,z)))||(r.id==='winds'&&(windAmenityReserved(x,z,20)||windFarmReserved(x,z,15)||windTurbineReserved(x,z,20)))||regionRadius(r,r.x+x,r.z+z)>.91||!clear(x,z,65)||!cityLotAllowed(x,z,w+6,d+6))continue;
   const central=Math.exp(-((x-380)**2+(z+200)**2)/800000),h=26+rand(i+30)*95+central*(100+rand(i+31)*280);item(x,ground(x,z)+.06,z,66,.1,73,'#7d9291');building(x,z,w,d,h,palette[i%palette.length],i);count++;maxHeight=Math.max(maxHeight,h*1.19+30);
   // Shopfronts and awnings at street level, independent of tower height.
   if(i%3===0){item(x,ground(x,z)+4,z+d/2+.4,w*.8,4,.5,'#496775');item(x,ground(x,z)+6.5,z+d/2+2,w*.9,1,4,i%2?'#ba9276':'#9ba784');}
  }
  // Airport-facing district fills the western grass strip without blocking either final.
  let airportDistrict=0;
  for(let row=0;row<29;row++)for(let col=0;col<3;col++){
   const x=-1350+col*62,z=-1000+row*70,w=40,d=48,h=col===2?22+rand(row+900)*30:45+rand(row*3+col+940)*95;
   item(x,ground(x,z)+.08,z,52,.12,60,'#9ba69f');building(x,z,w,d,h,palette[(row+col)%palette.length],row+col*17);count++;airportDistrict++;
   item(x,ground(x,z)+3,z+25,30,4,.3,'#4a737f');item(x,ground(x,z)+5,z+27,34,.5,5,'#aa9e89');
  }
  let houses=0;
  for(const side of [-1,1])for(let row=0;row<13;row++)for(let col=0;col<22;col++){
   const x=-1050-510+col*48,z=side*(1295+row*46);
   if(approachCorridor(x,z,22)||regionRadius(r,r.x+x,r.z+z)>.92)continue;
   const y=ground(x,z),h=5+rand(row*22+col)*4,w=18+rand(col+row*17)*7;
   item(x,y+.05,z,40,.08,39,'#a6b49c');item(x,y+h/2,z,w,h,25,['#d5c6aa','#b6c5b4','#c7b5a6','#d8d6bd'][col%4]);
   item(x,y+h+2.3,z,w+4,4.6,29,col%2?'#a58570':'#829698','roof');item(x,y+2,z+12.6,w*.6,1.7,.2,'#718e93');
   item(x+w*.24,y+1.6,z+12.8,2.4,3.2,.3,'#786f5d');item(x,y+2.8,z+15,12,.4,5,'#c1b79e');
   item(x-15,y+1,z-14,2,2,17,'#819677');obstacle(x,z,w+4,29,y+h+4.6);houses++;
  }
  addCityParks({scene,r,item,ground,obstacle,rand,building});
  // Signature stepped tower, rounded hotel, civic hall and landscaped park.
  building(350,-350,80,75,410,'#6e9aa8',10);for(let i=0;i<4;i++)item(350,80+i*85,-350,87,3,82,'#c9d5ce');
  const hy=ground(1250,150);item(1250,hy+95,150,43,190,43,'#9ab5b7','cylinder',0,true);obstacle(1250,150,86,86,hy+193);item(1250,hy+193,150,45,5,45,'#d5d7c6','cylinder');
  building(100,950,115,80,30,'#c6c0a8',2);item(100,48,950,40,24,40,'#839b9a','cone');
  // Airport concourse, jet bridges, terminal glazing, gate markings and control tower.
  airportBase('city');
  // Cargo waterfront, cranes and containers.
  for(let i=0;i<6;i++){const x=300+i*155;let z=1800;while(ground(x,z)>-1&&z<2800)z+=10;const y=4;item(x,y-2,z-50,140,4,240,'#a7b3aa');item(x,y+30,z-65,4,60,4,'#d5aa6d');item(x+28,y+60,z-65,65,3,4,'#d5aa6d');item(x+55,y+40,z-65,.5,40,.5,'#677a7c');obstacle(x,z-65,8,8,y+62);for(let k=0;k<12;k++)item(x-50+(k%4)*25,y+5+Math.floor(k/8)*7,z-120+Math.floor(k/4)*24,21,8,12,['#a57864','#748f92','#b8aa78'][k%3]);if(i%2===0){item(x,-1,z+130,23,6,105,'#415966');item(x,3,z+130,21,2,100,'#c2cbbd');item(x,10,z+165,16,14,22,'#c8d4c9');for(let k=0;k<4;k++)item(x,6,z+96+k*17,17,6,14,'#b48365');obstacle(x,z+130,23,105,18);}}

  world.cityInfo={buildings:count+8,houses,airportDistrict,park:CITY_PLACES.park,golf:CITY_PLACES.golf,stadium:CITY_PLACES.stadium,tallest:Math.round(Math.max(520,maxHeight))};
 }else if(r.id==='winds'){
  const cx=-800,cz=-650,cy=ground(cx,cz);item(cx,cy+8,cz,30,16,46,'#eee2c4');item(cx,cy+20,cz,34,10,50,'#997768','roof');item(cx,cy+19,cz+30,12,38,12,'#e6d8ba');item(cx,cy+42,cz+30,9,10,9,'#73818a','cone');item(cx,cy+49,cz+30,1,7,1,'#f4e5b9');item(cx,cy+50,cz+30,5,1,1,'#f4e5b9');obstacle(cx,cz,35,80,cy+53);
  for(let i=0;i<60;i++){const a=i*2.399,d=65+(i%5)*12,x=cx+Math.cos(a)*d,z=cz+Math.sin(a)*d,y=ground(x,z);item(x,y+4,z,1,8,1,'#796b52');item(x,y+11,z,6,12,6,'#547d5b','ball');}
  trees(900);for(let i=0;i<14;i++){const x=380+(i%3)*185,z=-1050+Math.floor(i/3)*380,y=ground(x,z);if(y<4)continue;item(x,y+35,z,3,70,3,'#dce3d6','cylinder');const rotor=new T.Group();rotor.position.set(r.x+x,y+70,r.z+z);for(let k=0;k<3;k++){const pivot=new T.Group(),blade=new T.Mesh(new T.BoxGeometry(2.5,34,1.3),material('#e9ead8'));blade.position.y=17;pivot.rotation.z=k*Math.PI*2/3;pivot.add(blade);rotor.add(pivot);}scene.add(rotor);world.windRotors.push(rotor);obstacle(x,z,10,10,y+90);}
  airportBase('wind');addSpaceport(scene,r.x+850,24,r.z+950,world.obstacles);oceanPlatform(scene,r.x+2300,r.z+950);world.obstacles.push({x:r.x+2300,z:r.z+950,w:96,d:96,top:8});
 }else if(['alpine','peaks','aurora-snow'].includes(r.id)){
  trees(2200,true);
  airportBase(r.id==='alpine'?'alpine':r.id==='peaks'?'peak':'snow');
  // Ridge observatory, lift towers and rescue shelters anchored to sampled ground.
  if(r.id==='peaks')addWinterActivity({scene,world,r,ground,obstacle});
  if(r.id==='aurora-snow'){const y=ground(900,-550);item(900,y-10,-550,40,24,36,'#939e98');item(900,y+8,-550,34,16,30,'#b8c1b8');item(900,y+22,-550,14,20,14,'#dae1d2','cone');obstacle(900,-550,34,30,y+32);}
 }else if(r.id==='desert'){
  airportBase('dunes');airportBase('base');
  addDesertDetail({scene,world,r,item,ground,obstacle,clear,rand});
 }
 addVillages({r,item,ground,obstacle,clear,rand,world});
 if(r.id==='peaks')addAlpineResort({scene,world,r,item,ground,obstacle});
 if(r.id==='winds')addWindRecreation({scene,r,item,ground,obstacle,world});
 for(const b of batches.values()){const mesh=new T.InstancedMesh(b.geo,b.mat,b.items.length),dummy=new T.Object3D();b.items.forEach(([x,y,z,w,h,d,rot],i)=>{dummy.position.set(x,y,z);dummy.scale.set(w,h,d);dummy.rotation.set(0,rot,0);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.instanceMatrix.needsUpdate=true;mesh.castShadow=mesh.receiveShadow=true;mesh.computeBoundingSphere();scene.add(mesh);}
}
