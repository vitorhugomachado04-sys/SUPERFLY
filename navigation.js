import {WIND_PLACES} from './winds-layout.js?v=04.3';
import {CITY_PLACES} from './city-layout.js?v=04.3';
import {AIRPORTS,REGIONS,airportById} from './airports.js?v=04.3';
export class NavigationMap{
 constructor(canvas){this.ctx=canvas.getContext('2d');this.zoom=1;this.scales=[18,70,250];}
 cycle(){this.zoom=(this.zoom+1)%3;}
 draw(f,destination,focus,special){const ctx=this.ctx,s=this.scales[this.zoom],mid=95;ctx.clearRect(0,0,190,190);ctx.save();ctx.translate(mid,mid);ctx.beginPath();ctx.arc(0,0,91,0,7);ctx.clip();ctx.fillStyle='#142b3d55';ctx.fillRect(-95,-95,190,190);
 for(const r of REGIONS){if(r.ocean)continue;ctx.fillStyle=r.color+'88';ctx.beginPath();ctx.ellipse((r.x-f.x)/s,(r.z-f.z)/s,r.rx/s,r.rz/s,0,0,7);ctx.fill();if(['alpine','peaks'].includes(r.id)){ctx.fillStyle='#54687088';for(const side of [-1,1]){const x=(r.x+side*650-f.x)/s,z=(r.z-f.z)/s;ctx.beginPath();ctx.moveTo(x-10,z+12);ctx.lineTo(x,z-14);ctx.lineTo(x+10,z+12);ctx.fill();}}}
 for(const a of AIRPORTS){const x=(a.x-f.x)/s,z=(a.z-f.z)/s;ctx.save();ctx.translate(x,z);ctx.rotate(a.heading);ctx.fillStyle=a.id===destination?.id?'#e9f296':a.id===focus?.id?'#beadff':'#fff2d6';if(a.type==='carrier'){ctx.font='bold 10px sans-serif';ctx.fillText('⚓',-4,3);}else if(a.type==='helipad'){ctx.font='bold 9px sans-serif';ctx.fillText(a.id==='stadium'?'⚽':a.id==='yacht'?'⚓':'H',-3,3);}else ctx.fillRect(-Math.max(1,a.width/s/2),-a.length/s/2,Math.max(2,a.width/s),a.length/s);ctx.restore();}
 const metro=REGIONS.find(r=>r.id==='metro');for(const [id,label]of [['park','PARQUE'],['golf','GOLFE'],['stadium','ARENA']]){const p=CITY_PLACES[id],x=(metro.x+p.x-f.x)/s,z=(metro.z+p.z-f.z)/s;if(Math.hypot(x,z)<82){ctx.fillStyle=id==='park'?'#c6e7ab':id==='golf'?'#e3edaf':'#dac6fa';ctx.fillRect(x-2,z-2,4,4);ctx.font='6px monospace';ctx.fillText(label,x+4,z+2);}}
 const winds=REGIONS.find(r=>r.id==='winds');for(const [id,label]of [['football','CAMPO'],['tennis','TÊNIS']]){const p=WIND_PLACES[id],x=(winds.x+p.x-f.x)/s,z=(winds.z+p.z-f.z)/s;if(Math.hypot(x,z)<82){ctx.fillStyle='#e2d5bb';ctx.fillRect(x-2,z-2,4,4);ctx.font='6px monospace';ctx.fillText(label,x+4,z+2);}}
 const alpine=REGIONS.find(r=>r.id==='alpine');{const x=(alpine.x+895-f.x)/s,z=(alpine.z-600-f.z)/s;if(Math.hypot(x,z)<82){ctx.fillStyle='#f2e6d0';ctx.fillRect(x-2,z-2,4,4);ctx.font='6px monospace';ctx.fillText('HOTEL · ESQUI',x+4,z+2);}}
 const marker=(target,color)=>{if(!target)return;let x=(target.x-f.x)/s,z=(target.z-f.z)/s,d=Math.hypot(x,z);if(d>80){x*=80/d;z*=80/d;}ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,z,6,0,7);ctx.stroke();};marker(destination,'#e9f296');marker(focus,'#beadff');marker(special,'#f5b887');
 ctx.save();ctx.rotate(f.heading);ctx.fillStyle='#ffffff';ctx.beginPath();ctx.moveTo(0,-7);ctx.lineTo(-4,5);ctx.lineTo(0,2);ctx.lineTo(4,5);ctx.closePath();ctx.fill();ctx.restore();ctx.restore();ctx.fillStyle='#f3eed9';ctx.font='9px monospace';ctx.fillText('N ↑',89,14);ctx.fillText(`${s*100/1000} km`,10,180);
 }
}
