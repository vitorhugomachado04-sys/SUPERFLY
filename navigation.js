import {AIRPORTS,REGIONS} from './airports.js?v=04.45';
export const GPS_COLORS={target:'#b6a4eb',focus:'#75d6ac',airport:'#b9d2cc',text:'#ecf4f2'};
export function mapPoint(f,target,scale,limit=76){const x=(target.x-f.x)/scale,z=(target.z-f.z)/scale,d=Math.hypot(x,z),k=d>limit?limit/d:1;return{x:x*k,z:z*k,outside:d>limit,distance:d*scale};}
export class NavigationMap{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.zoom=1;this.scales=[18,70,250];this.names=['LOCAL','ILHA','ARQUIPÉLAGO'];}
 cycle(){this.zoom=(this.zoom+1)%this.scales.length;}
 draw(f,destination,focus,special,plan=[]){
 const ctx=this.ctx,s=this.scales[this.zoom],target=special||destination,C=GPS_COLORS;
 ctx.setTransform(this.canvas.width/190,0,0,this.canvas.height/190,0,0);ctx.clearRect(0,0,190,190);ctx.fillStyle='#142a30ed';ctx.fillRect(0,0,190,190);
 ctx.save();ctx.translate(95,95);ctx.beginPath();ctx.arc(0,0,81,0,Math.PI*2);ctx.clip();
 // Quiet land silhouettes leave enough contrast for the route and landing points.
 for(const r of REGIONS){if(r.ocean)continue;ctx.fillStyle='#36544f';ctx.strokeStyle='#607e73';ctx.lineWidth=.7;ctx.beginPath();ctx.ellipse((r.x-f.x)/s,(r.z-f.z)/s,r.rx/s,r.rz/s,0,0,Math.PI*2);ctx.fill();ctx.stroke();if(this.zoom===2){const x=(r.x-f.x)/s,z=(r.z-f.z)/s+r.rz/s+7;if(Math.hypot(x,z)<72){ctx.fillStyle='#bdd6cd';ctx.font='5.5px sans-serif';ctx.textAlign='center';ctx.fillText(({aurora:'ENSEADA',winds:'VENTOS',metro:'METRÓPOLE',alpine:'ALPINA',peaks:'PICOS','aurora-snow':'AURORA',desert:'DESERTO'})[r.id]||r.name,x,z);}}}
 ctx.strokeStyle='#d9ece519';ctx.lineWidth=.7;for(const radius of[30,60]){ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.stroke();}ctx.beginPath();ctx.moveTo(-81,0);ctx.lineTo(81,0);ctx.moveTo(0,-81);ctx.lineTo(0,81);ctx.stroke();
 if(plan.length){ctx.strokeStyle='#e9f296';ctx.lineWidth=1.7;ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(0,0);for(const p of plan)ctx.lineTo((p.x-f.x)/s,(p.z-f.z)/s);ctx.stroke();ctx.setLineDash([]);plan.forEach((p,i)=>{const x=(p.x-f.x)/s,z=(p.z-f.z)/s;if(Math.hypot(x,z)>78)return;ctx.fillStyle='#e9f296';ctx.beginPath();ctx.arc(x,z,2.5,0,Math.PI*2);ctx.fill();ctx.font='bold 7px sans-serif';ctx.fillText(String(i+1),x+4,z-4);});}
 if(target){const p=mapPoint(f,target,s);ctx.strokeStyle=C.target;ctx.lineWidth=1.5;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(p.x,p.z);ctx.stroke();ctx.setLineDash([]);}
 for(const a of AIRPORTS){const x=(a.x-f.x)/s,z=(a.z-f.z)/s;if(Math.hypot(x,z)>83)continue;ctx.save();ctx.translate(x,z);ctx.rotate(a.heading);ctx.fillStyle=a.id===destination?.id?C.target:a.id===focus?.id?C.focus:C.airport;
 if(a.type==='helipad'){ctx.font='bold 8px sans-serif';ctx.textAlign='center';ctx.fillText('H',0,3);}else if(a.type==='carrier'){ctx.fillRect(-2,-5,4,10);}else ctx.fillRect(-1.3,-Math.max(3,a.length/s/2),2.6,Math.max(6,a.length/s));ctx.restore();}
 const marker=(point,color,shape)=>{if(!point)return;const p=mapPoint(f,point,s);ctx.save();ctx.translate(p.x,p.z);ctx.strokeStyle=color;ctx.fillStyle='#142a30';ctx.lineWidth=2;ctx.beginPath();
 if(p.outside){ctx.rotate(Math.atan2(p.x,-p.z));ctx.moveTo(0,-6);ctx.lineTo(-4,4);ctx.lineTo(4,4);ctx.closePath();}else if(shape==='square'){ctx.rect(-4,-4,8,8);}else ctx.arc(0,0,5,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();};
 marker(focus,C.focus,'square');marker(destination,C.target);if(special)marker(special,C.target);
 ctx.save();ctx.rotate(f.heading);ctx.strokeStyle='#142a30';ctx.lineWidth=2;ctx.fillStyle='#ffffff';ctx.beginPath();ctx.moveTo(0,-8);ctx.lineTo(-5,6);ctx.lineTo(0,3);ctx.lineTo(5,6);ctx.closePath();ctx.stroke();ctx.fill();ctx.restore();ctx.restore();
 ctx.textAlign='left';ctx.font='bold 8px sans-serif';ctx.fillStyle=C.text;ctx.fillText('GPS · '+this.names[this.zoom],9,12);ctx.textAlign='right';ctx.fillStyle=C.focus;ctx.fillText('N ↑',180,12);
 ctx.textAlign='left';ctx.font='8px sans-serif';ctx.fillStyle=C.text;
 if(target){const d=Math.hypot(target.x-f.x,target.z-f.z),distance=d>=1000?(d/1000).toFixed(1)+' km':Math.round(d)+' m';ctx.fillStyle=C.target;ctx.fillText('● '+(special?'OBJETIVO':'DESTINO')+' · '+distance,9,181);this.canvas.setAttribute('aria-label',`GPS ${this.names[this.zoom]}, ${target.name||'objetivo'} a ${distance}`);}else{ctx.fillText('VOO LIVRE',9,181);this.canvas.setAttribute('aria-label','GPS '+this.names[this.zoom]+', norte para cima');}
 ctx.strokeStyle=C.focus;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(141,170);ctx.lineTo(181,170);ctx.moveTo(141,167);ctx.lineTo(141,172);ctx.moveTo(181,167);ctx.lineTo(181,172);ctx.stroke();ctx.textAlign='right';ctx.fillStyle=C.focus;ctx.font='7px sans-serif';const m=s*40;ctx.fillText(m>=1000?(m/1000)+' km':m+' m',181,181);
 }
}
