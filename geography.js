import {WIND_PLACES} from './winds-layout.js?v=04.9';
import {REGIONS,AIRPORTS,runwayLocal,surfaceHeight} from './airports.js?v=04.9';
// Shared coastline and relief: rendering and ground contact use the same shape.
export function coastRadius(x,z){const a=Math.atan2(z/2275,x/1820);return Math.hypot(x/1820,z/2275)/(1+.055*Math.sin(a*3+.4)+.025*Math.cos(a*5));}
function schoolTerrain(x,z){if(coastRadius(x,z)>1)return -3;let h=3;for(const [cx,cz,a,w]of[[-950,-800,150,400],[1050,-1300,200,460],[-1200,1000,110,380]])h+=a*Math.exp(-((x-cx)**2+(z-cz)**2)/(w*w));const t=Math.max(0,Math.min(1,Math.max((Math.abs(x)-230)/250,(Math.abs(z)-1200)/400)));return 3+(h-3)*t*t*(3-2*t);}
export function eastCoast(z){let lo=0,hi=2100;for(let i=0;i<24;i++){let mid=(lo+hi)/2;if(coastRadius(mid,z)<1)lo=mid;else hi=mid;}return lo;}
export const groves=[[-1000,-800,240],[1050,-1200,280],[-1150,1000,220],[1300,100,200],[800,1200,200],[-550,-1500,220]];
export const landmarks=[{x:820,z:650,label:'VILA',color:'#e4bb8e'},{x:eastCoast(1000),z:1000,label:'PORTO',color:'#c7e5de'},{x:eastCoast(1600)-45,z:1600,label:'FAROL',color:'#fff2c2'},{x:-800,z:700,label:'CAMPOS',color:'#b7c97c'}];

const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
export function regionRadius(r,x,z){const dx=(x-r.x)/r.rx,dz=(z-r.z)/r.rz,a=Math.atan2(dz,dx);return Math.hypot(dx,dz)/(1+.055*Math.sin(a*3+.7)+.035*Math.cos(a*5));}
export function terrain(x,z,includePads=true){
 let h=schoolTerrain(x,z);
 for(const r of REGIONS.slice(1)){
  if(r.ocean)continue;const dx=x-r.x,dz=z-r.z,rad=regionRadius(r,x,z);if(rad>1.04)continue;
  let relief=0;
  if(['alpine','peaks'].includes(r.id)){
   for(const [px,pz,amp,w]of [[-950,-650,620,480],[900,-550,800,500],[1050,850,560,450],[-1000,1000,490,430],[150,-1550,530,470]])relief+=amp*Math.exp(-((dx-px)**2+(dz-pz)**2)/(w*w));
   relief*=.92+.08*Math.sin(dx*.018+Math.sin(dz*.007))*Math.sin(dz*.013);relief+=40*Math.sin(dx*.007+dz*.004)**2;
  }
  if(r.id==='winds')relief=110*Math.exp(-((dx-650)**2+(dz+500)**2)/280000)+25*Math.sin(dx*.004+dz*.002)**2;
  if(r.id==='aurora-snow')relief=260*Math.exp(-((dx-1000)**2+(dz+750)**2)/260000)+130*Math.exp(-((dx+1050)**2+(dz-700)**2)/160000);
  if(r.id==='desert')relief=45*Math.sin(dx*.003+dz*.006)**2+200*Math.exp(-(((dx+1300)/290)**4+((dz-1100)/340)**4))+150*Math.exp(-(((dx-1250)/320)**4+((dz-1000)/400)**4));
  const coast=smooth((1.04-rad)/.16);h=Math.max(h,-3+(r.height+3+relief)*coast);
 }
 // Engineered summit terrace with a gradual transition back to the natural ridge.
 const summitD=Math.hypot(Math.max(0,Math.abs(x+11000-960)-205),Math.max(0,Math.abs(z+1000+580)-110));if(summitD<240)h=h*smooth(summitD/240)+1118*(1-smooth(summitD/240));
 const winds=REGIONS.find(r=>r.id==='winds');for(const [id,height]of [['football',26],['tennis',28.4],['spaceport',24]]){const p=WIND_PLACES[id],dx=Math.max(0,Math.abs(x-winds.x-p.x)-p.w/2-2),dz=Math.max(0,Math.abs(z-winds.z-p.z)-p.d/2-2),d=Math.hypot(dx,dz);if(d<45)h=h*smooth(d/45)+height*(1-smooth(d/45));}
 for(const a of AIRPORTS){if(a.id==='school')continue;const p=runwayLocal(a,x,z),dx=Math.max(0,Math.abs(p.across)-a.width/2),dz=Math.max(0,Math.abs(p.along)-a.length/2);
  if(a.type==='carrier'||a.type==='helipad'){if(includePads&&dx===0&&dz===0)return a.elevation;continue;}
  // A continuous engineered plateau under runway, apron and foundations.
  const d=Math.hypot(dx,dz),width=['alpine','peaks'].includes(a.region)?340:180;
  if(d<width){const target=a.elevation+Math.max(-a.length/2,Math.min(a.length/2,p.along))*a.slope,w=1-smooth(Math.max(0,d-100)/(width-100));h=h*(1-w)+target*w;}
  // Level shared apron: wheel contact and visible terrain use this same surface.
  // The runway slope is preserved, with a smooth taxi transition outside its edge.
  const near=a.id==='city'?-850:-230,far=a.id==='city'?850:175,right=a.id==='city'?270:174;
  const apronWeight=smooth((p.across-50)/22)*(1-smooth((p.across-right)/35))*smooth((p.along-near+30)/30)*(1-smooth((p.along-far)/30));
  h=h*(1-apronWeight)+a.elevation*apronWeight;
 }
 return h;
}
