import * as T from './three.js';
export function cargoAircraft(c){
 const mesh=new T.Group(),mats=new Map(),props=[];
 const mat=color=>{if(!mats.has(color))mats.set(color,new T.MeshStandardMaterial({color,roughness:.65}));return mats.get(color);};
 function part(geo,col,x,y,z){const m=new T.Mesh(geo,mat(col));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;mesh.add(m);return m;}
 const box=(x,y,z,w,h,d,col)=>part(new T.BoxGeometry(w,h,d),col,x,y,z);
 const white='#e9e4d5',purple='#7771a6',glass='#477784',dark='#303f49';
 box(0,.25,0,2.9,2.9,9.5,white);const nose=part(new T.SphereGeometry(1,16,12),white,0,.05,-4.7);nose.scale.set(1.45,1.4,2.7);
 const tail=part(new T.CylinderGeometry(.28,1.45,5.3,12),white,0,.5,6.6);tail.rotation.x=Math.PI/2;
 box(0,1,-4.6,2.6,1,1.5,glass);box(0,1.65,-4.6,2.8,.2,1.8,white);box(0,1,-5.4,.13,1,.1,white);
 box(0,1.8,-.8,c.halfSpan*2,.28,2.6,white);box(0,2.9,7,7,.2,1.8,white);box(0,2.25,7,.2,3.5,2.3,purple);
 for(const side of [-1,1]){
  box(side*1.46,-.15,.2,.06,.4,9,purple);box(side*1.48,.35,2.3,.06,2.2,3.4,'#b3bbb7');
  for(const dz of [.8,3.8])box(side*1.53,.35,dz,.06,2.15,.06,dark);
  box(side*1.55,.3,1.2,.07,.12,.5,dark);box(side*10.5,1.82,-.8,1,.32,2.6,purple);
  const eng=part(new T.CylinderGeometry(.65,.72,3.5,14),purple,side*4.3,1,-1.5);eng.rotation.x=Math.PI/2;
  part(new T.SphereGeometry(.4,12,8),white,side*4.3,1,-3.45);
  const prop=new T.Group();prop.position.set(side*4.3,1,-3.4);mesh.add(prop);props.push(prop);
  for(let i=0;i<2;i++){const blade=new T.Mesh(new T.BoxGeometry(.19,3.8,.09),mat(dark));blade.rotation.z=i*Math.PI/2;prop.add(blade);}
  box(side*4.3,.4,-2.5,.5,.4,.6,dark);
 }
 for(const [x,z]of[[-c.wheelTrack,c.wheelZ],[c.wheelTrack,c.wheelZ],[0,-4.8]]){box(x,-1.2,z,.16,2.1,.16,white);const w=part(new T.CylinderGeometry(.42,.42,.3,14),dark,x,-c.gear+.42,z);w.rotation.z=Math.PI/2;}
 return {mesh,gears:[],props,update(f,u,dt){props.forEach((p,i)=>p.rotation.z+=dt*(18+(f.throttle||0)*90)*(f.engineHealth?.[i]??1));}};
}
