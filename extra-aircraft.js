import {cargoAircraft} from './cargo-aircraft.js?v=04.43';
import {helicopter} from './helicopters.js?v=04.43';
import * as T from './three.js';
export function extraAircraft(c){if(c.id==='skycourier')return cargoAircraft(c);if(c.helicopter)return helicopter(c);const g=new T.Group(),cache=new Map(),props=[],gears=[];let rotor,tailRotor;
 const mat=color=>{if(!cache.has(color))cache.set(color,new T.MeshStandardMaterial({color,roughness:.65,flatShading:true}));return cache.get(color);};
 const add=(geo,col,x,y,z,parent=g)=>{const m=new T.Mesh(geo,mat(col));m.position.set(x,y,z);parent.add(m);return m;};
 const box=(x,y,z,w,h,d,col,parent=g)=>add(new T.BoxGeometry(w,h,d),col,x,y,z,parent);
 const white='#eee7d3',purple='#6a659e',dark='#375765';
 {
 const l=c.length;const fus=add(new T.CylinderGeometry(.22,.8,l,12),white,0,.2,0);fus.rotation.x=Math.PI/2;
 box(0,.65,-l*.25,1.35,1.05,2,dark);box(0,1.25,-l*.25,1.45,.12,2.1,white);
 box(0,1.1,0,c.halfSpan*2,.18,1.7,white);box(0,.7,l*.39,c.halfSpan*.7,.13,1.1,white);box(0,1.4,l*.4,.13,1.8,1.4,purple);
 for(const side of [-1,1])box(side*(c.halfSpan-.4),1.1,0,.8,.22,1.8,purple);
 for(const x of c.twin?[-c.halfSpan*.4,c.halfSpan*.4]:[0]){const z=c.twin?-1:-l*.5;const engine=add(new T.CylinderGeometry(.45,.5,1.7,10),purple,x,.35,z);engine.rotation.x=Math.PI/2;const prop=new T.Group();prop.position.set(x,.35,z-.9);g.add(prop);box(0,0,0,.13,2.7,.08,dark,prop);box(0,0,0,2.7,.13,.08,dark,prop);props.push(prop);}
 for(const [x,z]of[[-c.wheelTrack,c.wheelZ],[c.wheelTrack,c.wheelZ],[0,-l*.3]]){const pivot=new T.Group();pivot.position.set(x,0,z);g.add(pivot);box(0,-c.gear*.5,0,.12,c.gear-.35,.12,white,pivot);const wheel=add(new T.CylinderGeometry(.35,.35,.25,12),dark,0,-c.gear+.35,0,pivot);wheel.rotation.z=Math.PI/2;gears.push(pivot);}
 }
 g.traverse(o=>{if(o.isMesh)o.castShadow=o.receiveShadow=true;});
 return{mesh:g,gears:gears.map(pivot=>({pivot})),update(f,u,dt){if(rotor){rotor.rotation.y+=dt*(28+(f.throttle||0)*20);tailRotor.rotation.x+=dt*65;}props.forEach((p,i)=>p.rotation.z+=dt*(18+(f.throttle||0)*90)*(f.engineHealth?.[i]??1));gears.forEach((p,i)=>{const retract=c.retractable?1-(f.gearExtension??1):0;p.rotation.z=i<2?retract*(i===0?1:-1)*1.4:0;p.rotation.x=i===2?-retract*1.4:0;p.visible=!c.retractable||(f.gearExtension??1)>.01;});}};
}
