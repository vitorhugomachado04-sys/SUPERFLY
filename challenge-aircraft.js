import * as T from './three.js';
// Lightweight arcade silhouettes; dimensions come from the fleet's flight envelope.
export function challengeAircraft(c){
 const g=new T.Group(),rotors=[],wheels=[],mats=new Map();g.name=c.name;
 const add=(geo,col,x,y,z,parent=g)=>{if(!mats.has(col))mats.set(col,new T.MeshStandardMaterial({color:col,roughness:.5}));const m=new T.Mesh(geo,mats.get(col));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m;};
 const box=(x,y,z,w,h,d,col,parent=g)=>add(new T.BoxGeometry(w,h,d),col,x,y,z,parent);
 const oval=(x,y,z,w,h,d,col)=>{const m=add(new T.SphereGeometry(1,24,16),col,x,y,z);m.scale.set(w,h,d);return m;};
 const rod=(a,b,r=.09)=>{a=new T.Vector3(...a);b=new T.Vector3(...b);const d=b.clone().sub(a),m=add(new T.CylinderGeometry(r,r,d.length(),10),'#aab9bb',0,0,0);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m;};
 const white='#eee9db',ink='#294954',purple='#7667ae';
 if(c.glider){
  oval(0,0,0,.47,.48,4.17,white);oval(0,.45,-1.7,.43,.46,1.35,ink);
  box(0,.12,.1,16,.11,.72,white);box(0,.18,-.1,6,.12,.9,white);
  box(0,.55,3.5,3.1,.1,.65,white);box(0,.7,3.65,.1,1.5,.7,purple);
  for(const s of [-1,1])box(s*8.25,.12,.1,.5,.11,.72,purple);
  const wheel=add(new T.CylinderGeometry(.26,.26,.17,16),ink,0,-.36,0);wheel.rotation.z=Math.PI/2;
 }else if(c.helicopter){
  oval(0,.35,-1,1.35,1.3,3.1,white);oval(0,.8,-3.1,1.2,.9,1.15,ink);
  box(0,1.65,.2,2.1,.7,2.8,white);for(const s of [-1,1]){oval(s*.65,1.8,1,.42,.4,1.5,ink);for(let z=-1.7;z<1.5;z+=.95)box(s*1.27,.7,z,.05,.75,.7,ink);box(s*1.3,.07,-.1,.08,.16,3.7,purple);box(s*1.6,-c.gear+.12,-.8,.14,.16,6,ink);for(const z of [-2,1])rod([s*.65,-.5,z],[s*1.6,-c.gear+.12,z],.075);}
  const tail=add(new T.CylinderGeometry(.13,.65,6,16),white,0,.5,4.3);tail.rotation.x=Math.PI/2;
  box(0,1.3,7,.13,2,1,purple);box(0,.65,5.5,3,.12,.7,white);
  const rotor=new T.Group();rotor.position.y=2.65;g.add(rotor);box(0,0,0,14,.06,.3,ink,rotor);box(0,0,0,.3,.06,14,ink,rotor);rotors.push([rotor,'y']);
  box(0,2.2,0,.18,.8,.18,ink);const tr=new T.Group();tr.position.set(.25,1.4,7);g.add(tr);box(0,0,0,.08,2,.13,ink,tr);box(0,0,0,.08,.13,2,ink,tr);rotors.push([tr,'x']);box(1.7,1.1,0,1,.15,.15,purple);
 }else{
  oval(0,.1,.3,1.0,1.05,5.65,white);box(0,1.1,-3,1.8,1.1,1.8,ink);box(0,1.7,-.8,13.8,.2,2.1,white);
  for(const s of [-1,1]){for(let z=-1.7;z<2.7;z+=1)box(s*.98,.7,z,.04,.62,.68,ink);box(s*7.4,1.7,-.8,1,.2,2.1,purple);rod([s*.75,-.45,.6],[s*1.7,-1.4,.6]);}
  box(0,.55,4.4,5,.14,1.2,white);box(0,1.4,4.55,.15,2.3,1.25,purple);box(0,-.9,0,1.25,.6,5,white);
  const prop=new T.Group();prop.position.set(0,.3,-5.8);g.add(prop);for(let i=0;i<3;i++){const blade=box(0,.85,0,.17,1.7,.08,ink,prop);blade.rotation.z=i*Math.PI*2/3;blade.position.set(Math.sin(-i*Math.PI*2/3)*.85,Math.cos(i*Math.PI*2/3)*.85,0);}rotors.push([prop,'z']);
  rod([0,-.55,-3.6],[0,-1.4,-3.6]);
  for(const [x,z]of[[-1.7,.6],[1.7,.6],[0,-3.6]]){const w=add(new T.CylinderGeometry(.4,.4,.25,16),ink,x,-1.4,z);w.rotation.z=Math.PI/2;wheels.push(w);}
 }
 return {mesh:g,update(f,u,dt){for(const [r,axis]of rotors)r.rotation[axis]+=dt*(20+f.throttle*60);for(const w of wheels)w.rotation.x+=f.speed*dt;}};
}
export function addFloats(model){
 // Hide only the C152 wheels and their struts; retain the high-wing supports.
 for(const m of model.mesh.children){if(m.geometry?.type==='CylinderGeometry'&&m.position.y<0)m.visible=false;}
 const mat=new T.MeshStandardMaterial({color:'#d3dce0',metalness:.35,roughness:.4});
 for(const side of [-1,1]){const float=new T.Mesh(new T.SphereGeometry(1,24,12),mat);float.scale.set(.36,.34,2.5);float.position.set(side*1.12,-1.28,-.3);float.castShadow=true;model.mesh.add(float);for(const z of [-1.2,.8]){const strut=new T.Mesh(new T.CylinderGeometry(.045,.045,1,8),mat);strut.position.set(side*1.12,-.67,z);model.mesh.add(strut);}}
 return model;
}
