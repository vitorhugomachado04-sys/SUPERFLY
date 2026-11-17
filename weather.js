import {updateClouds} from './clouds.js?v=04.44';
import * as T from './three.js';
import {REGIONS} from './airports.js?v=04.44';
export const REGIONAL_WEATHER={aurora:'clear',winds:'coastal',metro:'partial',alpine:'overcast',peaks:'snow','aurora-snow':'blizzard',desert:'dust',ocean:'partial'};
export const regionAt=(x,z)=>REGIONS.reduce((best,r)=>Math.hypot(x-r.x,z-r.z)<Math.hypot(x-best.x,z-best.z)?r:best).id;
export const WEATHER={
 clear:{name:'Dia claro · calmo',cloud:.1,rain:0,snow:0,dust:0,wind:0,gust:0,turbulence:0,visibility:18000},
 partial:{name:'Parcialmente nublado',cloud:.4,rain:0,snow:0,dust:0,wind:2,gust:1,turbulence:.1,visibility:15000},
 overcast:{name:'Encoberto',cloud:1,rain:0,snow:0,dust:0,wind:3,gust:1,turbulence:.1,visibility:11000},
 coastal:{name:'Litoral · vento forte',cloud:.4,rain:0,snow:0,dust:0,wind:8,gust:4,turbulence:.3,visibility:14000},
 drizzle:{name:'Chuva leve',cloud:.75,rain:.25,snow:0,dust:0,wind:3,gust:2,turbulence:.15,visibility:7000},
 rain:{name:'Chuva forte',cloud:1,rain:1,snow:0,dust:0,wind:6,gust:3,turbulence:.35,visibility:4000},
 storm:{name:'Tempestade',cloud:1,rain:1,snow:0,dust:0,wind:9,gust:5,turbulence:.7,visibility:3500,lightning:true},
 fog:{name:'Neblina densa',cloud:.6,rain:0,snow:0,dust:0,wind:0,gust:0,turbulence:0,visibility:2200},
 snow:{name:'Neve leve',cloud:.7,rain:0,snow:.35,dust:0,wind:3,gust:1,turbulence:.1,visibility:8000},
 blizzard:{name:'Nevasca',cloud:1,rain:0,snow:1,dust:0,wind:9,gust:5,turbulence:.55,visibility:2400},
 dust:{name:'Poeira',cloud:.15,rain:0,snow:0,dust:.3,wind:5,gust:3,turbulence:.3,visibility:7000},
 sandstorm:{name:'Tempestade de areia',cloud:.5,rain:0,snow:0,dust:1,wind:10,gust:5,turbulence:.6,visibility:2500}
};
export class Weather{
 constructor(){this.current={...WEATHER.clear,direction:90};this.target={...this.current};this.hour=12;this.cycle=false;this.time=0;this.region='aurora';}
 set(id,overrides={},instant=false){this.target={...(WEATHER[id]||WEATHER.clear),direction:90,...overrides};if(instant)this.current={...this.target};}
 update(dt){this.time+=dt;for(const k of ['cloud','rain','snow','dust','wind','gust','turbulence','visibility'])this.current[k]+=(this.target[k]-this.current[k])*(1-Math.exp(-dt*.25));let delta=((this.target.direction-this.current.direction+540)%360)-180;this.current.direction+=delta*(1-Math.exp(-dt*.25));this.current.lightning=this.target.lightning;if(this.cycle)this.hour=(this.hour+dt/35)%24;}
 travel(x,z,regional=false){const region=regionAt(x,z);if(regional&&region!==this.climateRegion){this.set(REGIONAL_WEATHER[region]);this.climateRegion=region;}this.region=region;}
 sample(x,y,z,t){
 const w=this.current,a=w.direction*Math.PI/180;
 // Incommensurate continuous waves, modulated by a slower envelope: no frame RNG.
 const envelope=.18+.82*(.5+.5*Math.sin(t*.071+x*.00017+z*.00011))**2;
 const slow=Math.sin(t*.43+x*.0007)*.65+Math.sin(t*.719+z*.0009)*.35;
 const base=envelope*(.6*Math.sin(t*.83+x*.0011)+.4*Math.sin(t*.317+z*.0013));
 const g=w.gust*(Math.sin(t*.7+x*.0003)*.6+Math.sin(t*1.3+z*.0006)*.4);
 let local=0,thermal=0;const region=regionAt(x,z);
 if(region==='metro')local=Math.exp(-Math.max(0,y-80)/180)*w.wind*.012*(.5+.5*Math.sin(x*.017+z*.009)**2);
 if(region==='alpine'||region==='peaks')local=Math.exp(-Math.max(0,y-500)/500)*w.wind*.025*(.3+.7*Math.sin(x*.006+z*.003)**2);
 if(region==='desert')thermal=(.25+w.turbulence)*Math.exp(-Math.max(0,y-300)/800)*Math.max(0,Math.sin(x*.004+z*.002+t*.11))**4;
 const amp=w.turbulence*(.55+.45*Math.sin(x*.002+z*.001)**2)+local;
 return{x:Math.sin(a)*(w.wind+g)+base*.16,z:-Math.cos(a)*(w.wind+g)+slow*envelope*.13,y:base*.38+thermal+amp*(Math.sin(t*.8+x*.004)*3+Math.sin(t*.37+z*.003)*2),roll:slow*envelope*.038+amp*Math.sin(t*1.7+x*.002)*.23,pitch:base*.018+amp*Math.sin(t*1.1+z*.002)*.09};
 }

}
export class WeatherView{
 constructor(scene,world){this.scene=scene;this.world=world;this.windUniforms={windTime:{value:0},windStrength:{value:0}};const windMats=new Set();scene.traverse(o=>{if(o.userData.windResponsive)windMats.add(o.material);});for(const m of windMats)m.onBeforeCompile=shader=>{Object.assign(shader.uniforms,this.windUniforms);shader.vertexShader='uniform float windTime; uniform float windStrength;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n transformed.x+=sin(windTime*1.8+position.y*2.0)*max(0.0,position.y)*windStrength*.015;');};this.positions=new Float32Array(1500*3);for(let i=0;i<this.positions.length;i++)this.positions[i]=Math.random();const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(new Float32Array(this.positions.length),3));this.particles=new T.Points(geo,new T.PointsMaterial({color:'#e0e8e7',size:1.4,transparent:true,opacity:.5,depthWrite:false}));scene.add(this.particles);
 const stars=new Float32Array(900);for(let i=0;i<stars.length;i+=3){const a=Math.random()*Math.PI*2,h=.15+Math.random()*.85;stars[i]=Math.cos(a)*7000;stars[i+1]=h*8000;stars[i+2]=Math.sin(a)*7000;}const sg=new T.BufferGeometry();sg.setAttribute('position',new T.BufferAttribute(stars,3));this.stars=new T.Points(sg,new T.PointsMaterial({color:'#f5edda',size:7,transparent:true,opacity:0,depthWrite:false}));scene.add(this.stars);
 const ag=new T.PlaneGeometry(2600,500,50,6);this.aurora=new T.Mesh(ag,new T.MeshBasicMaterial({color:'#67dab7',transparent:true,opacity:0,side:T.DoubleSide,depthWrite:false}));scene.add(this.aurora);this.baseAurora=ag.attributes.position.array.slice();
 const ad=new Uint8Array(128*64*4);for(let y=0;y<64;y++)for(let x=0;x<128;x++){const i=(y*128+x)*4;ad[i]=110;ad[i+1]=240;ad[i+2]=180+y;ad[i+3]=Math.round(Math.sin(x/127*Math.PI)*Math.sin(y/63*Math.PI)**2*(.55+.45*Math.sin(x*.38)**2)*230);}const at=new T.DataTexture(ad,128,64);at.needsUpdate=true;this.aurora.material.map=at;
 const boltGeo=new T.BufferGeometry();boltGeo.setAttribute('position',new T.Float32BufferAttribute([0,600,0,40,430,0,40,430,0,-20,310,0,-20,310,0,30,160,0,30,160,0,-5,0,0],3));this.bolt=new T.LineSegments(boltGeo,new T.LineBasicMaterial({color:'#e4eaff'}));scene.add(this.bolt);
 this.cloudOrigins=world.clouds.map(c=>c.position.clone());
 this.overcast=new T.Mesh(new T.PlaneGeometry(18000,18000),new T.MeshBasicMaterial({color:'#78868d',transparent:true,opacity:0,side:T.DoubleSide,depthWrite:false}));this.overcast.rotation.x=-Math.PI/2;scene.add(this.overcast);

 }
 update(weather,f){const w=weather.current,t=weather.time,h=weather.hour;this.windUniforms.windTime.value=t;this.windUniforms.windStrength.value=w.wind+w.gust;const day=Math.max(0,Math.sin((h-6)/12*Math.PI)),twilight=day>0?Math.max(0,1-Math.abs(day-.12)*5):0;const sky=new T.Color('#101c38').lerp(new T.Color('#a6d6d9'),day).lerp(new T.Color('#b88a83'),twilight*.3).lerp(new T.Color('#657579'),w.cloud*.45).lerp(new T.Color('#bda27e'),w.dust*.6);this.scene.background.copy(sky);this.scene.fog.color.copy(sky);this.scene.fog.density=1.4/w.visibility;
 const sun=this.world.sun;sun.intensity=(.15+day*2.25)*(1-w.cloud*.65);sun.color.set(day<.25?'#ffc792':'#fff2ce');this.world.shadowOffset.set(Math.cos(h/24*Math.PI*2)*650,100+day*800,Math.sin(h/24*Math.PI*2)*500);this.world.ambient.intensity=.5+day*1.3;document.body.classList.toggle('night',day<.15);
 this.overcast.position.set(f.x,1900,f.z);this.overcast.material.opacity=Math.max(0,w.cloud-.6)*1.4;
 updateClouds(this.world.clouds,this.cloudOrigins,w,f,t,day,twilight);
 const intensity=Math.max(w.rain,w.snow,w.dust);this.particles.visible=intensity>.01;const a=this.particles.geometry.attributes.position;const wind=weather.sample(f.x,f.y,f.z,t);for(let i=0;i<a.count;i++){const p=i*3;a.array[p]=f.x+((this.positions[p]*240+t*wind.x)%240+240)%240-120;a.array[p+1]=f.y+((this.positions[p+1]*140-t*(w.rain>0?70:8))%140+140)%140-45;a.array[p+2]=f.z+((this.positions[p+2]*240+t*wind.z)%240+240)%240-120;}a.needsUpdate=true;this.particles.geometry.setDrawRange(0,Math.floor(a.count*intensity));this.particles.material.size=w.rain>0?.6:w.dust>0?2.5:1.2;this.particles.material.color.set(w.dust>0?'#ceb58f':'#e3edf2');
 const flash=w.lightning&&Math.sin(t*.73)>.998&&Math.sin(t*41)>.2; this.bolt.visible=!!flash;this.bolt.position.set(f.x+900,100,f.z-1500);if(flash){sun.intensity=5;this.scene.background.lerp(new T.Color('#e5edff'),.7);}
 this.stars.position.set(f.x,0,f.z);this.stars.material.opacity=(1-day)*(1-w.cloud);const polar=REGIONS.find(r=>r.id==='aurora-snow');this.aurora.position.set(polar.x,950,polar.z-3500);this.aurora.material.opacity=weather.region==='aurora-snow'?(1-day)*(1-w.cloud)*.32:0;const arr=this.aurora.geometry.attributes.position;for(let i=0;i<arr.count;i++){let p=i*3;arr.array[p+2]=Math.sin(this.baseAurora[p]*.004+t*.2)*180;arr.array[p+1]=this.baseAurora[p+1]+Math.sin(this.baseAurora[p]*.003+t*.3)*130;}arr.needsUpdate=true;
 for(const light of this.world.nightLights||[])light.material.opacity=.3+(1-day)*.7;
 }
}
