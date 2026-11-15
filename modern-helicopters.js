import * as T from './three.js';
// Hand-shaped cross sections follow each airframe instead of overlapping oval bodies.
export function modernHelicopter(c){
 const airbus=c.id==='h145',g=new T.Group();g.name=airbus?'Airbus H145 · Executive':'Bell 407 · Executive';
 const mats=new Map(),paint=airbus?'#293b45':'#e5e1d5',trim=airbus?'#c5ad83':'#454e77',silver='#a9b6bb',glass='#234957';
 const mat=color=>{if(!mats.has(color))mats.set(color,new T.MeshStandardMaterial({color,metalness:color===glass?.65:.32,roughness:color===glass?.16:.37}));return mats.get(color);};
 const add=(geo,color,x=0,y=0,z=0,parent=g)=>{const m=new T.Mesh(geo,mat(color));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m;};
 const box=(x,y,z,w,h,d,color,parent=g)=>add(new T.BoxGeometry(w,h,d),color,x,y,z,parent);
 const oval=(x,y,z,w,h,d,color)=>{const m=add(new T.SphereGeometry(1,24,16),color,x,y,z);m.scale.set(w,h,d);return m;};
 function rod(a,b,r,color,parent=g){a=new T.Vector3(...a);b=new T.Vector3(...b);const d=b.clone().sub(a),m=add(new T.CylinderGeometry(r,r,d.length(),8),color,0,0,0,parent);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m;}
 function tube(points,r,color){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),false,'catmullrom',0);return add(new T.TubeGeometry(curve,32,r,8,false),color);}
 function fin(points,x,color,hole){const shape=new T.Shape();points.forEach(([z,y],i)=>i?shape.lineTo(z,y):shape.moveTo(z,y));shape.closePath();if(hole){const path=new T.Path();path.absarc(...hole,0,Math.PI*2,true);shape.holes.push(path);}const geo=new T.ExtrudeGeometry(shape,{depth:airbus?.25:.12,bevelEnabled:true,bevelSegments:2,bevelSize:.035,bevelThickness:.025,steps:1});geo.rotateY(-Math.PI/2);return add(geo,color,x,0,0);}
 // z, half-width, lower belly, roof. The Airbus is a roomy rounded box;
 // the Bell has a slimmer teardrop cabin and a pronounced transmission cowling.
 const sections=airbus?
 [[-3.5,.03,-.30,-.25],[-3.27,.63,-.62,.28],[-2.85,1.03,-.78,.72],[-2.15,1.25,-.86,1.17],[-1.3,1.33,-.9,1.30],[.2,1.33,-.9,1.29],[1.35,1.17,-.78,1.23],[2.05,.83,-.48,1.04],[2.65,.4,.05,.82],[2.85,.12,.3,.66]]:
 [[-3.2,.03,-.27,-.22],[-3.02,.48,-.54,.12],[-2.65,.78,-.73,.48],[-1.95,.98,-.79,1.02],[-1.25,1.03,-.81,1.1],[.3,1.02,-.81,1.07],[1.25,.81,-.65,.97],[1.85,.5,-.24,.82],[2.25,.24,.18,.67],[2.4,.1,.35,.58]];
 function section(z){let i=0;while(i<sections.length-2&&z>sections[i+1][0])i++;const a=sections[i],b=sections[i+1],t=T.MathUtils.clamp((z-a[0])/(b[0]-a[0]),0,1);return [1,2,3].map(k=>T.MathUtils.lerp(a[k],b[k],t));}
 function surface(z,angle,offset=0){const [w,lo,hi]=section(z),sn=Math.sin(angle),cs=Math.cos(angle),power=airbus?.72:.94;return [Math.sign(sn)*Math.abs(sn)**power*(w+offset),(lo+hi)/2+Math.sign(cs)*Math.abs(cs)**power*((hi-lo)/2+offset),z];}
 function patch(z0,z1,a0,a1,color,offset=0){const pos=[],idx=[],nz=36,na=24;for(let j=0;j<=nz;j++)for(let i=0;i<=na;i++)pos.push(...surface(T.MathUtils.lerp(z0,z1,j/nz),T.MathUtils.lerp(a0,a1,i/na),offset));for(let j=0;j<nz;j++)for(let i=0;i<na;i++){const a=j*(na+1)+i,b=a+na+1;idx.push(a,b,a+1,b,b+1,a+1);}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();return add(geo,color);}
 patch(sections[0][0],sections.at(-1)[0],-Math.PI,Math.PI,paint);
 // Flush glazing and structural pillars: split windscreen, pilot doors, cabin doors.
 for(const side of [-1,1]){
  const cockpit=patch(airbus?-3.08:-2.87,airbus?-1.49:-1.4,side<0?-1.30:.06,side<0?-.06:1.30,glass,.025);cockpit.name='split-windscreen';
  const ranges=airbus?[[-1.30,-.34],[-.16,.65],[.82,1.46]]:[[-1.24,-.27],[-.08,.82]];
  for(const [a,b]of ranges){patch(a,b,side<0?-1.57:.57,side<0?-.57:1.57,glass,.027);}
  // A curved accent follows the fuselage rather than floating above it.
  patch(-2.65,airbus?1.6:1.25,side<0?-1.92:1.79,side<0?-1.79:1.92,trim,.03);
  for(const z of airbus?[-1.4,-.08,1.4]:[-1.34,-.18,1.03]){
   const points=[];for(let i=0;i<=10;i++)points.push(surface(z,side*(.46+i*.19),.04));tube(points,.013,silver);
  }
  const handle=surface(airbus?.95:.6,side*1.66,.06);box(...handle,.06,.045,.23,silver);
  const light=surface(-.3,side*1.9,.07);oval(...light,.055,.045,.075,side<0?'#df6663':'#8ccbb4');
 }
 // Roof fairings and exhaust layouts: twin turbines versus one engine.
 if(airbus){
  oval(0,1.24,.25,1.04,.32,1.52,paint);
  for(const side of [-1,1]){oval(side*.58,1.45,.5,.43,.34,1.3,paint);oval(side*.58,1.48,-.62,.31,.2,.07,'#122027');const exhaust=add(new T.CylinderGeometry(.2,.25,.65,18,1,true),silver,side*.6,1.44,1.65);exhaust.rotation.x=Math.PI/2;}
  // Rear clamshell door seam below the raised tail root.
  rod([0,-.47,2.07],[0,.32,2.58],.015,silver);
 }else{
  oval(0,1.26,.3,.64,.46,1.32,paint);oval(0,1.5,-.35,.43,.28,.62,paint);
  oval(0,1.3,-.91,.34,.19,.06,'#17262c');const exhaust=add(new T.CylinderGeometry(.22,.27,.48,18,1,true),silver,0,1.4,1.48);exhaust.rotation.x=Math.PI/2;
  for(const side of [-1,1])for(let i=0;i<6;i++)box(side*.57,1.31,.3+i*.12,.025,.19,.045,'#26373f');
 }
 const tailEnd=airbus?6.55:7.05,tailY=airbus?.83:.64;
 const boom=add(new T.CylinderGeometry(airbus?.24:.12,airbus?.49:.30,tailEnd-1.9,24),paint,0,tailY,(tailEnd+1.9)/2);boom.rotation.x=Math.PI/2;
 rod([0,tailY+.3,2.3],[0,tailY+.13,tailEnd-.2],.025,trim);
 if(airbus){
  // Fenestron is an opening in the fin, not a free-standing doughnut.
  fin([[5.6,.3],[5.9,1.62],[6.37,2.85],[7.1,2.96],[7.19,1.2],[7.05,-.26],[6.48,-.36],[6.12,.15]],-.125,paint,[6.55,1.05,.72]);
  const rim=add(new T.TorusGeometry(.775,.085,12,48),silver,0,1.05,6.55);rim.rotation.y=Math.PI/2;
  box(0,.83,5.3,3.2,.10,.68,paint);
  for(const side of [-1,1])fin([[4.96,.8],[5.1,1.2],[5.54,1.18],[5.65,.78]],side*1.52,trim);
 }else{
  fin([[6.48,.64],[6.78,2.21],[7.32,2.44],[7.32,.58],[7.12,-.33],[6.86,-.46]],-.06,trim);
  box(0,.65,5.4,2.75,.09,.68,paint);
  for(const side of [-1,1])fin([[5.06,.62],[5.22,1.14],[5.62,1.12],[5.76,.59]],side*1.32,trim);
 }
 const rotor=new T.Group();rotor.position.set(0,airbus?2.18:2.38,-.35);g.add(rotor);
 rod([0,1.3,-.35],[0,rotor.position.y,-.35],.10,silver);add(new T.CylinderGeometry(.26,.3,.16,16),silver,0,0,0,rotor);
 const blades=airbus?5:4;
 for(let i=0;i<blades;i++){const blade=new T.Group();blade.rotation.y=i*Math.PI*2/blades;rotor.add(blade);rod([.1,0,0],[.83,.02,0],.055,silver,blade);box(3.04,.01,0,4.95,.045,.27,'#26353e',blade);box(5.46,.01,0,.13,.05,.27,trim,blade);}
 const tailRotor=new T.Group();tailRotor.position.set(airbus?0:.29,airbus?1.05:.72,tailEnd);g.add(tailRotor);
 if(airbus){for(let i=0;i<10;i++){const blade=new T.Group();blade.rotation.x=i*Math.PI*2/10;tailRotor.add(blade);box(0,.38,0,.07,.59,.10,silver,blade);}}else{box(0,0,0,.07,1.65,.14,'#283642',tailRotor);for(const side of [-1,1])box(0,side*.73,0,.08,.19,.15,'#eee7d7',tailRotor);}
 const skidY=-c.gear+.075,track=airbus?1.43:1.19;
 for(const side of [-1,1]){
  tube([[side*track,skidY+.30,-2.65],[side*track,skidY,-2.27],[side*track,skidY,1.85]],.075,airbus?silver:trim);
  for(const z of [-1.45,.95])tube([[side*.65,-.65,z],[side*1.02,-.81,z],[side*track,skidY+.06,z]],.065,silver);
 }
 g.userData.helicopterType=c.id;g.userData.tailStructure=airbus?'fenestron':'open-tail-rotor';
 return{mesh:g,rotor,tailRotor,gears:[],update(f,u,dt){rotor.rotation.y+=dt*(28+(f.throttle||0)*20);tailRotor.rotation.x+=dt*70;}};
}
