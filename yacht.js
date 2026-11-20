import * as T from './three.js';
import {airportById} from './airports.js?v=04.56';
export function buildYacht(scene,world){
 const a=airportById('yacht'),g=new T.Group();g.name='Panorama · superyacht';g.position.set(a.x,0,a.z-55);scene.add(g);const mats=new Map();
 const mat=color=>{if(!mats.has(color))mats.set(color,new T.MeshStandardMaterial({color,roughness:.35,metalness:.18}));return mats.get(color);};
 const mesh=(geo,color,x,y,z)=>{const m=new T.Mesh(geo,mat(color));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;g.add(m);return m;};
 const box=(x,y,z,w,h,d,color)=>mesh(new T.BoxGeometry(w,h,d),color,x,y,z);
 function deck(points,top,depth,color){const shape=new T.Shape();points.forEach(([x,z],i)=>i?shape.lineTo(x,z):shape.moveTo(x,z));shape.closePath();const geo=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false});geo.rotateX(Math.PI/2);return mesh(geo,color,0,top,0);}
 const outline=[[-2,-98],[2,-98],[12,-78],[19,-47],[21,67],[17,86],[-17,86],[-21,67],[-19,-47],[-12,-78]];
 deck(outline,8,12,'#e8e7dd');deck(outline,8.3,.3,'#bd9b70');
 deck([[-14,-70],[0,-88],[14,-70],[18,-40],[18,76],[-18,76],[-18,-40]],9.7,1.5,'#e8e8df');
 box(0,9.78,10,35,.12,40,'#bfa378');
 // Tiered saloons, continuous glazing and overhanging terraces.
 for(const [y,w,d,z]of[[13,30,78,-22],[19,26,62,-25],[25,20,42,-28]]){
  box(0,y,z,w,6,d,'#eceee7');box(0,y+.7,z,w+.2,2.2,d-5,'#365563');box(0,y+3.4,z,w+3,.8,d+4,'#faf8ed');
  for(const side of [-1,1])for(let dz=-d/2+6;dz<d/2-3;dz+=7)box(side*(w/2+.15),y+.7,z+dz,.3,2.3,.25,'#aab9b8');
  world.obstacles.push({x:a.x,z:a.z-55+z,w:w+3,d:d+4,top:y+4});
 }
 // Bridge and chimney vents.
 box(0,30,-33,14,5,18,'#e7ebe5');box(0,30.5,-42.2,13,2,.3,'#304e5d');box(0,33,-33,17,.7,21,'#f6f4e8');
 for(const x of [-6,6])box(x,29,-9,3,3,5,'#778b8e');
 world.obstacles.push({x:a.x,z:a.z-88,w:18,d:25,top:33.35});
 // Aft pool and teak sun deck sit forward of the clear landing area.
 box(0,10.3,21,13,.5,17,'#eee8d6');box(0,10.59,21,11,.08,15,'#64b6bb');
 for(const x of [-12,12])for(const z of [14,23,32]){box(x,10.7,z,3,.8,5,'#f2ead5');const back=box(x,11.4,z-1.8,3,.25,2.5,'#e1d1ad');back.rotation.x=-.45;}
 // Landing deck 32 × 32 m: no furniture or railings inside its clear envelope.
 box(0,9.8,55,36,.4,36,'#7e9490');
 const ring=mesh(new T.TorusGeometry(12,.13,6,64),'#f3e8bb',0,10.2,55);ring.rotation.x=Math.PI/2;
 for(const x of [-3,3])box(x,10.08,55,.8,.08,10,'#f3e8bb');box(0,10.08,55,6,.08,.8,'#f3e8bb');
 for(const x of [-17,17])for(const z of [39,55,71]){const lamp=mesh(new T.SphereGeometry(.25,8,6),'#ccefd2',x,10.4,z);world.nightLights.push(lamp);}
 for(const side of [-1,1]){
  for(let z=-55;z<78;z+=6){const x=side*19;box(x,10.8,z,.1,1.4,.1,'#c5cfca');box(x,11.5,z,.1,.1,6,'#e7e5d9');}
  for(let z=-60;z<60;z+=9){const port=mesh(new T.CylinderGeometry(.55,.55,.15,12),'#314d5b',side*20,4,z);port.rotation.z=Math.PI/2;}
  const tender=mesh(new T.SphereGeometry(1,16,10),'#b8c8cc',side*23,1,65);tender.scale.set(2.6,1.1,7);box(side*23,1.6,65,3,.5,6,'#efe3c7');
 }
 for(let i=0;i<5;i++)box(0,1+i*1.4,86-i*1.3,24,1.4,2.5,'#dbd4bd');
 // Hull sides remain solid below the elevated landing deck.
 world.obstacles.push({x:a.x,z:a.z-55,w:38,d:174,top:8.3});
 return g;
}
