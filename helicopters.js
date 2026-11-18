import * as T from './three.js';
import {modernHelicopter} from './modern-helicopters.js?v=04.53';
// Recognisable R22 Beta II and Bell 47G silhouettes, scaled to existing flight envelopes.
export function helicopter(c){
 if(['h145','bell407'].includes(c.id))return modernHelicopter(c);
 const bell=c.id==='bell47',g=new T.Group(),mats=new Map();g.name=bell?'Bell 47G · bubble and lattice':'Robinson R22 · enclosed cabin';
 const cream='#ede6cf',trim=bell?'#b17c5c':'#736c9e',steel='#687b7d',dark='#344c59';
 const material=color=>{if(!mats.has(color))mats.set(color,new T.MeshStandardMaterial({color,roughness:.52,metalness:.12}));return mats.get(color);};
 function mesh(geo,color,x,y,z,parent=g){const m=new T.Mesh(geo,material(color));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
 const box=(x,y,z,w,h,d,color,parent=g)=>mesh(new T.BoxGeometry(w,h,d),color,x,y,z,parent);
 function ellipsoid(x,y,z,w,h,d,color){const m=mesh(new T.SphereGeometry(1,24,16),color,x,y,z);m.scale.set(w,h,d);return m;}
 function rod(a,b,r,color,parent=g){a=new T.Vector3(...a);b=new T.Vector3(...b);const delta=b.clone().sub(a),m=mesh(new T.CylinderGeometry(r,r,delta.length(),8),color,0,0,0,parent);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return m;}
 function curve(points,r,color){const path=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return mesh(new T.TubeGeometry(path,24,r,6,false),color,0,0,0);}
 function fin(points,x,color){const shape=new T.Shape();points.forEach(([z,y],i)=>i?shape.lineTo(z,y):shape.moveTo(z,y));shape.closePath();const geo=new T.ExtrudeGeometry(shape,{depth:.09,bevelEnabled:false});geo.rotateY(-Math.PI/2);return mesh(geo,color,x,0,0);}
 const glassMat=new T.MeshStandardMaterial({color:bell?'#84b8c5':'#6d9bac',transparent:true,opacity:bell?.44:.53,roughness:.16,metalness:.23,depthWrite:false,side:T.FrontSide});
 function glass(geo,x,y,z,sx,sy,sz){const m=new T.Mesh(geo,glassMat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.name='canopy-glass';g.add(m);return m;}
 // Visible seats, instrument pod and cyclic give the clear cabins depth.
 const seatZ=bell?-1.05:-.7;
 for(const side of [-1,1]){box(side*.43,-.17,seatZ,.58,.18,.65,'#677c7e');box(side*.43,.15,seatZ+.28,.55,.64,.16,'#66757e');rod([side*.43,-.3,seatZ-.3],[side*.43,.18,seatZ-.5],.035,steel);box(side*.43,.18,seatZ-.5,.22,.045,.07,dark);}
 box(0,.15,bell?-1.85:-1.5,.63,.48,.3,dark);for(const x of [-.2,0,.2]){const dial=mesh(new T.CylinderGeometry(.065,.065,.025,12),'#d4d9cd',x,.27,bell?-1.68:-1.33);dial.rotation.x=Math.PI/2;}
 if(bell){
  // Full bubble, low floor pan and almost no framing across the view.
  const bowl=mesh(new T.SphereGeometry(1,24,12,0,Math.PI*2,Math.PI/2,Math.PI/2),trim,0,-.25,-1.15);bowl.scale.set(1.2,.42,1.48);
  glass(new T.SphereGeometry(1,32,24),0,.35,-1.15,1.22,1.24,1.52);
  curve([[-1.18,-.25,-1.15],[-.82,-.25,-2.22],[0,-.25,-2.63],[.82,-.25,-2.22],[1.18,-.25,-1.15]],.035,cream);
  box(0,-.2,.35,1.1,.25,1.35,steel);
  // Exposed piston engine with cylinder fins, exhaust and twin saddle fuel tanks.
  box(0,.3,.7,.7,.72,.8,'#59696a');for(const side of [-1,1]){for(let k=0;k<3;k++){box(side*.48,.35,.4+k*.25,.4,.4,.19,'#8f9c97');for(let j=0;j<4;j++)box(side*.49,.21+j*.085,.4+k*.25,.44,.035,.21,'#506267');}ellipsoid(side*.87,1.0,.55,.36,.4,.74,trim);rod([side*.45,.05,.8],[side*.65,-.1,1.3],.065,'#8d8070');}
  const fan=mesh(new T.CylinderGeometry(.45,.45,.16,16),steel,0,.45,1.3);fan.rotation.x=Math.PI/2;
  // Triangular lattice boom: three continuous longerons and alternating braces.
  const sections=[];for(let i=0;i<=7;i++){const t=i/7,z=1.1+t*4.3,w=.52*(1-t)+.08,y=.2+t*.4;sections.push([[-w,y-.28*(1-t),z],[w,y-.28*(1-t),z],[0,y+.55*(1-t)+.08,z]]);}
  for(let i=0;i<7;i++)for(let k=0;k<3;k++){rod(sections[i][k],sections[i+1][k],.035,trim);rod(sections[i][k],sections[i+1][(k+1)%3],.025,steel);rod(sections[i][k],sections[i][(k+1)%3],.028,trim);}
  box(0,.52,4.15,2.3,.08,.55,cream);fin([[4.5,.5],[5.15,1.3],[5.45,.65],[5.3,.2]],-.04,trim);
 }else{
  // Compact enclosed fuselage, framed doors, tapered fairing and slender tail tube.
  const lower=mesh(new T.SphereGeometry(1,24,16,0,Math.PI*2,Math.PI/2,Math.PI/2),cream,0,.25,-.7);lower.scale.set(.9,.9,1.5);
  glass(new T.SphereGeometry(1,28,18,0,Math.PI*2,0,Math.PI/2),0,.25,-.7,.91,1.1,1.5);
  ellipsoid(0,.35,.35,.68,.8,.65,cream);box(0,1.16,-.15,1.35,.16,1.25,cream);
  curve([[0,.27,-2.2],[0,.95,-1.8],[0,1.35,-.7],[0,1.23,-.1]],.045,cream);
  for(const side of [-1,1]){curve([[side*.82,.25,-1.25],[side*.74,.91,-1.2],[side*.62,1.2,-.25],[side*.68,.4,.25]],.045,cream);rod([side*.9,.23,-1.35],[side*.78,.25,.1],.035,trim);box(side*.82,.35,-.05,.055,.04,.27,steel);box(side*.81,-.08,-.5,.055,.16,1.5,trim);}
  // Cooling grille and exposed lower engine detail below the rear fairing.
  box(0,-.2,.55,.8,.55,.7,steel);for(let i=0;i<6;i++)box(.69,.25+i*.09,.48,.04,.035,.52,dark);
  const boom=mesh(new T.CylinderGeometry(.085,.28,3.5,12),cream,0,.46,2.25);boom.rotation.x=Math.PI/2;
  rod([0,.66,.55],[0,.9,3.9],.035,steel);box(0,.55,3.1,1.55,.065,.45,cream);
  fin([[3.45,.46],[3.86,1.4],[4.05,1.4],[4.02,.46]],-.045,trim);
 }
 // Tubular skids with upturned toes and two arched cross braces.
 const track=bell?1.22:1.05,front=bell?-2.3:-1.95,rear=bell?1.25:1.05,skidY=-c.gear+.075;
 for(const side of [-1,1]){curve([[side*track,skidY+.38,front-.2],[side*track,skidY+.04,front],[side*track,skidY,rear]],.075,dark);
  for(const z of [-1.35,.55])curve([[side*track,skidY+.05,z],[side*.92,skidY+.38,z],[side*.55,-.3,z]],.055,cream);
 }
 const mastZ=bell?.35:.15,mastTop=bell?2.45:2.15;
 rod([0,.65,mastZ],[0,mastTop,mastZ],.085,steel);box(0,1.35,mastZ,.45,.35,.48,steel);
 const rotor=new T.Group();rotor.position.set(0,mastTop,mastZ);g.add(rotor);box(0,0,0,.65,.16,.32,steel,rotor);
 for(const side of [-1,1]){box(side*(c.halfSpan*.5+.13),.05,0,c.halfSpan-.26,.055,.24,dark,rotor);box(side*(c.halfSpan-.16),.055,0,.3,.065,.24,'#e2d3a0',rotor);}
 if(bell){rod([0,.14,-1.05],[0,.14,1.05],.035,steel,rotor);for(const z of [-1.05,1.05])box(0,.14,z,.28,.12,.22,steel,rotor);}
 const tailRotor=new T.Group();tailRotor.position.set(.23,bell?.65:.6,bell?5.4:4.02);g.add(tailRotor);rod([0,tailRotor.position.y,tailRotor.position.z],[.3,tailRotor.position.y,tailRotor.position.z],.07,steel);
 box(0,0,0,.06,bell?1.7:1.25,.13,cream,tailRotor);for(const side of [-1,1])box(0,side*(bell?.73:.52),0,.07,.18,.14,trim,tailRotor);
 // Navigation lamps and aerial stay visible without additional dynamic lights.
 for(const side of [-1,1])ellipsoid(side*(bell?1.1:.85),.1,-.7,.06,.06,.06,side<0?'#bd7865':'#88b79b');if(bell)rod([0,.4,.9],[0,-.55,1.3],.018,steel);
 g.userData.helicopterType=c.id;g.userData.tailStructure=bell?'open-lattice':'enclosed-boom';
 return{mesh:g,gears:[],rotor,tailRotor,update(f,u,dt){rotor.rotation.y+=dt*(28+(f.throttle||0)*20);tailRotor.rotation.x+=dt*65;}};
}

 
