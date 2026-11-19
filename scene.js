import {addEnseada} from './enseada.js?v=04.55';
import {CIRCUIT_POINTS,flightGate,orientGate} from './flight-plan.js?v=04.55';
import {addClouds} from './clouds.js?v=04.55';
import {addControlTower} from './control-tower.js?v=04.55';
import {addAirportLife} from './airport-life.js?v=04.55';
import * as T from './three.js';import{terrain}from './physics.js?v=04.55';import{islandGeometry,airportSurface,landTexture}from './airport.js?v=04.55';
import{eastCoast}from './geography.js?v=04.55';
import{addScenery}from './scenery.js?v=04.55';
export const material=(color)=>new T.MeshStandardMaterial({color,flatShading:true,roughness:.85});
export function box(parent,x,y,z,w,h,d,color){let m=new T.Mesh(new T.BoxGeometry(w,h,d),material(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
export function buildWorld(scene,anisotropy=1){const obstacles=[],clouds=[];scene.background=new T.Color('#a6d6d9');scene.fog=new T.FogExp2('#b1d8d6',.00012);scene.add(new T.HemisphereLight('#f9f2d1','#648784',1.8));let sun=new T.DirectionalLight('#fff2ce',2.4);sun.position.set(-400,800,300);sun.castShadow=true;
 sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-180,right:180,top:180,bottom:-180,near:1,far:2000});
 sun.shadow.bias=-.00008;sun.shadow.normalBias=.08;sun.shadow.radius=2;
 scene.add(sun);scene.add(sun.target);
 const shadowOffset=new T.Vector3(-400,800,300),shadowDirection=shadowOffset.clone().negate().normalize();
 const shadowRight=new T.Vector3().crossVectors(shadowDirection,new T.Vector3(0,1,0)).normalize();
 const shadowUp=new T.Vector3().crossVectors(shadowRight,shadowDirection).normalize();
 const shadowCenter=new T.Vector3(),texel=360/2048;
 function updateShadows(position){
  shadowCenter.set(position.x,Math.max(3,terrain(position.x,position.z)),position.z);
  for(const axis of [shadowRight,shadowUp]){const d=shadowCenter.dot(axis);shadowCenter.addScaledVector(axis,Math.round(d/texel)*texel-d);}
  sun.target.position.copy(shadowCenter);sun.position.copy(shadowCenter).add(shadowOffset);
 }

 const ocean=box(scene,0,-7,0,600000,8,600000,'#4c9da8');ocean.castShadow=false;ocean.userData.coarse=true;
 ocean.material.onBeforeCompile=shader=>{
  shader.uniforms.shallowColor={value:new T.Color('#79c5be')};
  shader.vertexShader='varying vec2 coastXZ;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ncoastXZ=(modelMatrix*vec4(transformed,1.0)).xz;');
  shader.fragmentShader='varying vec2 coastXZ; uniform vec3 shallowColor;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   vec2 coastP=coastXZ/vec2(1820.0,2275.0);float coastA=atan(coastP.y,coastP.x);
   float coastR=length(coastP)/(1.0+.055*sin(coastA*3.0+.4)+.025*cos(coastA*5.0));
   float shelf=1.0-smoothstep(1.005,1.11,coastR);diffuseColor.rgb=mix(diffuseColor.rgb,shallowColor,shelf*.85);`);
 };
 const geo=islandGeometry();const ground=new T.Mesh(geo,new T.MeshStandardMaterial({vertexColors:true,map:landTexture(anisotropy),flatShading:true,roughness:1}));ground.receiveShadow=true;ground.userData.coarse=true;scene.add(ground);
 const airport=airportSurface(anisotropy);airport.receiveShadow=true;scene.add(airport);
 for(let z=-830;z<850;z+=65)for(const x of [-34,34])box(scene,x,3.5,z,.8,.7,.8,'#fff7c3');
 for(let z of [90,190,290]){obstacles.push({x:155,z,w:64,d:65,top:30});box(scene,155,15,z,58,24,60,'#e0d9bd');box(scene,155,28,z,64,4,65,'#6a659e');box(scene,124,13,z,1,20,48,'#526369');}addControlTower(scene,obstacles,{id:'school',x:0,z:0});
 addAirportLife(scene,obstacles);
 let seed=17;const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};const sceneryInfo=addScenery(scene,obstacles,rand);const enseadaWorld={obstacles};addEnseada(scene,enseadaWorld);
 let lx=eastCoast(1600)-45,lz=1600,lh=Math.max(2,terrain(lx,lz));
 // A solid rocky islet supports the lighthouse down below the waterline.
 const reef=new T.Group();reef.name='aurora-lighthouse-reef';scene.add(reef);
 const core=new T.Mesh(new T.CylinderGeometry(17,35,lh+10,11),material('#8b9185'));
 core.position.set(lx,(lh-10)/2,lz);core.castShadow=true;core.receiveShadow=true;reef.add(core);
 const rockGeometry=new T.IcosahedronGeometry(1,0),rockMaterials=['#858d83','#a3a694','#727f79'].map(material);
 for(let i=0;i<18;i++){
  const angle=i*Math.PI*2/18,radius=22+Math.sin(i*2.7)*5;
  const rock=new T.Mesh(rockGeometry,rockMaterials[i%3]);
  const height=5+(i%4)*1.2;
  rock.position.set(lx+Math.cos(angle)*radius,lh-height*.55,lz+Math.sin(angle)*radius);
  rock.scale.set(9+i%3*2,height,8+(i*3%5));rock.rotation.y=angle+.4;
  rock.castShadow=true;rock.receiveShadow=true;reef.add(rock);
  obstacles.push({x:rock.position.x,z:rock.position.z,w:rock.scale.x*1.6,d:rock.scale.z*1.6,top:rock.position.y+height});
 }
 obstacles.push({x:lx,z:lz,w:34,d:34,top:lh});
 obstacles.push({x:lx,z:lz,w:20,d:20,top:lh+60});for(let i=0;i<5;i++){let cyl=new T.Mesh(new T.CylinderGeometry(9-i,10-i,9,10),material(i%2?'#c78069':'#f4ead1'));cyl.position.set(lx,lh+4.5+i*9,lz);cyl.castShadow=true;cyl.receiveShadow=true;scene.add(cyl);}box(scene,lx,lh+48,lz,15,7,15,'#536b75');let roof=new T.Mesh(new T.ConeGeometry(13,9,10),material('#ffffff'));roof.position.set(lx,lh+56,lz);roof.castShadow=true;roof.receiveShadow=true;scene.add(roof);
 clouds.push(...addClouds(scene,rand));
 const gates=CIRCUIT_POINTS.map((p,i)=>{const m=flightGate();orientGate(m,i?CIRCUIT_POINTS[i-1]:{x:0,z:0},p);scene.add(m);return m;});return{enseadaInfo:enseadaWorld.enseadaInfo,gates,obstacles,updateShadows,sceneryInfo,sun,shadowOffset,clouds,ambient:scene.children.find(o=>o.isHemisphereLight),nightLights:[]};}
