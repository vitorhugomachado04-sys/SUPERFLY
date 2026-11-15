// One connected archipelago. Distances are metres; ~40 m/s light-plane cruise.
export const REGIONS=[
 {id:'aurora',name:'Ilha Escola',x:0,z:0,rx:1820,rz:2275,color:'#9ab895',height:3},
 {id:'winds',name:'Ilha dos Ventos',x:10000,z:-4000,rx:1250,rz:1750,color:'#89a596',height:16},
 {id:'metro',name:'Metrópole',x:5000,z:-10500,rx:2300,rz:2350,color:'#91a59b',height:8},
 {id:'alpine',name:'Frente Alpina',x:-5500,z:-10500,rx:1800,rz:2200,color:'#729182',height:190},
 {id:'peaks',name:'Entre Picos',x:-11000,z:-1000,rx:1750,rz:2200,color:'#e4eceb',height:310},
 {id:'aurora-snow',name:'Neve e Aurora',x:-5500,z:10000,rx:1800,rz:2100,color:'#e5e9df',height:65},
 {id:'desert',name:'Deserto',x:6500,z:10000,rx:2100,rz:2200,color:'#d5b386',height:22},
 {id:'ocean',name:'Oceano · Frota Panorama',x:14500,z:5000,rx:850,rz:1100,color:'#527f91',height:-3,ocean:true}
];
const runway=(id,name,region,x,z,length,width,elevation,slope=0,surface='asfalto')=>({id,name,region,x,z,length,width,elevation,slope,surface,heading:0,type:'runway'});
const localRunway=(id,name,region,dx,dz,length,width,elevation,slope=0,surface='asfalto')=>{const r=REGIONS.find(r=>r.id===region);return runway(id,name,region,r.x+dx,r.z+dz,length,width,elevation,slope,surface);};
export const AIRPORTS=[
 localRunway('school','Aurora · Escola','aurora',0,0,1700,62,3),
 localRunway('wind','Ventos · Costa','winds',-200,0,1100,48,16),
 {...localRunway('wind-heli','Ventos · Heliponto da Vila','winds',100,-300,32,32,56),type:'helipad'},
 localRunway('city','Metrópole Internacional','metro',-1050,0,2300,76,8),
 {...localRunway('stadium','Panorama Arena · Gramado','metro',1280,-650,170,118,8.34),type:'helipad',customGeometry:true,surface:'grama'},
 {...localRunway('yacht','Panorama Yacht · Convés','metro',-2900,-1500,32,32,10),type:'helipad',customGeometry:true},
 {...localRunway('roof-a','Torre Porto · H1','metro',550,350,36,36,240),type:'helipad'},
 {...localRunway('roof-b','Hospital · H2','metro',850,-350,36,36,155),type:'helipad'},
 localRunway('alpine','Alpina · Pista inclinada','alpine',-200,0,760,44,190,.035),
 localRunway('peak','Posto dos Picos','peaks',150,0,690,42,310,.025),
 {...localRunway('resort','Resort dos Picos · Heliponto','peaks',1005,-658,34,34,1118.65),type:'helipad',customGeometry:true},
 localRunway('snow','Aurora Polar','aurora-snow',-200,0,2200,52,65),
 localRunway('dunes','Dunas · Terra','desert',-650,0,1100,48,22,0,'terra'),
 localRunway('base','Base Horizonte','desert',700,-300,2000,68,22),
 {...localRunway('carrier','PAN-01 · Porta-aviões','ocean',0,0,400,54,18),type:'carrier'}
];
// Migrate pre-02.2 airport-relative saved ground positions, preserving campaign progress.
export const LEGACY_AIRPORTS={school:[0,0],wind:[2550,0],city:[4200,0],'roof-a':[4650,350],'roof-b':[4950,-350],alpine:[6500,0],peak:[8400,0],snow:[10400,0],dunes:[12300,0],base:[13300,-300],carrier:[15300,2300]};
export const airportById=id=>AIRPORTS.find(a=>a.id===id)||AIRPORTS[0];
export const regionById=id=>REGIONS.find(r=>r.id===id)||REGIONS[0];
export function runwayLocal(a,x,z){const dx=x-a.x,dz=z-a.z;return{across:dx*Math.cos(a.heading)+dz*Math.sin(a.heading),along:dx*Math.sin(a.heading)-dz*Math.cos(a.heading)};}
export function surfaceHeight(a,x,z){return a.elevation+runwayLocal(a,x,z).along*a.slope;}
export function airportAt(x,z,pad=0){return AIRPORTS.find(a=>{const p=runwayLocal(a,x,z);return Math.abs(p.across)<=a.width/2+pad&&Math.abs(p.along)<=a.length/2+pad;});}
export function nearestAirport(x,z,heli=false){return AIRPORTS.filter(a=>!heli||a.type==='helipad').reduce((best,a)=>Math.hypot(x-a.x,z-a.z)<Math.hypot(x-best.x,z-best.z)?a:best);}
export function spawnAt(a,c){const along=a.type==='helipad'?0:-a.length*.38;const x=a.x+Math.sin(a.heading)*along,z=a.z-Math.cos(a.heading)*along;return{x,z,y:surfaceHeight(a,x,z)+c.gear,heading:a.heading,pitch:Math.atan(a.slope),ground:true};}

// Return to the approach-side threshold, facing along the landing direction.
export function arrivalSpawn(a,c,heading){const direction=Math.cos(heading-a.heading)>=0?1:-1,along=a.type==='helipad'?0:-direction*a.length*.38,x=a.x+Math.sin(a.heading)*along,z=a.z-Math.cos(a.heading)*along;return{airport:a.id,x,z,y:surfaceHeight(a,x,z)+c.gear,heading:a.heading+(direction<0?Math.PI:0),pitch:Math.atan(a.slope*direction),ground:true};}
