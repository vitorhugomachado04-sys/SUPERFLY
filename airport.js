import {PARKING_STANDS} from './airport-life.js?v=04.43';
import * as T from './three.js';
import {terrain,coastRadius,groves} from './geography.js?v=04.43';
export const AIRPORT={left:-36,right:195,near:-885,far:885};

// Cut an exact opening for the airport: no terrain remains under its surface.
export function islandGeometry(){
 const xs=[...new Set([...Array.from({length:241},(_,i)=>-2400+i*20),AIRPORT.left-35,AIRPORT.left-30,AIRPORT.left,AIRPORT.right,AIRPORT.right+5])].sort((a,b)=>a-b);
 const zs=[...new Set([...Array.from({length:281},(_,i)=>-2800+i*20),AIRPORT.near-5,AIRPORT.near,AIRPORT.far,AIRPORT.far+5])].sort((a,b)=>a-b);
 const positions=[],colors=[],indices=[],uvs=[],color=new T.Color();
 for(const z of zs)for(const x of xs){
  const r=coastRadius(x,z),h=terrain(x,z);
  positions.push(x,h,z);uvs.push((x+3100)/6200,1-(z+3900)/7800);
  color.set(r>.94&&h<8?'#e2d7a4':h>180?'#879b8b':h>70?'#779779':'#9ab895');if(x>=AIRPORT.left-30&&x<=AIRPORT.right&&z>=AIRPORT.near&&z<=AIRPORT.far)color.set('#929a98');colors.push(color.r,color.g,color.b);
 }
 for(let j=0;j<zs.length-1;j++)for(let i=0;i<xs.length-1;i++){
  const x=(xs[i]+xs[i+1])/2,z=(zs[j]+zs[j+1])/2;
  if(x>AIRPORT.left&&x<AIRPORT.right&&z>AIRPORT.near&&z<AIRPORT.far)continue;
  const a=j*xs.length+i,b=a+1,c=a+xs.length,d=c+1;indices.push(a,c,b,b,c,d);
 }
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}

export function airportSurface(anisotropy){
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=4096;
 const ctx=canvas.getContext('2d');ctx.scale(canvas.width/231,canvas.height/1770);ctx.translate(36,885);
 const rect=(x,z,w,d,color)=>{ctx.fillStyle=color;ctx.fillRect(x,z,w,d);};
 rect(-36,-885,231,1770,'#929a98');
 rect(-36,-885,72,1770,'#a7aca8');
 rect(-31,-850,62,1700,'#48565b');
 rect(40,-550,155,925,'#82908b');rect(31,312.5,9,35,'#82908b');
 // Taxi route and parking marks are part of the same texture as the pavement.
 ctx.strokeStyle='#e7d584';ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(31,330);ctx.lineTo(65,330);ctx.lineTo(65,-525);ctx.stroke();
 PARKING_STANDS.forEach((z,i)=>{
  ctx.strokeStyle='#d7cba3';ctx.lineWidth=.35;ctx.strokeRect(92,z-24,48,48);
  ctx.strokeStyle='#edda85';ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(65,z);ctx.lineTo(132,z);ctx.moveTo(131,z-4);ctx.lineTo(131,z+4);ctx.stroke();
  ctx.fillStyle='#f5e8ba';ctx.font='bold 6px monospace';ctx.textAlign='center';ctx.fillText('A'+(i+1),145,z+2);
 });
 ctx.setLineDash([3,3]);ctx.strokeStyle='#e4e1ce';ctx.lineWidth=.4;ctx.beginPath();ctx.moveTo(153,-535);ctx.lineTo(153,-150);ctx.stroke();ctx.setLineDash([]);
 for(let z=-790;z<=790;z+=70)rect(-.6,z-12.5,1.2,25,'#f4eed8');
 for(const z of [-770,770])for(const x of [-24,-18,-12,12,18,24])rect(x-1.5,z-20,3,40,'#f4eed8');
 for(const z of [-620,620])for(const x of [-17,17])rect(x-2.5,z-17.5,5,35,'#f4eed8');
 for(const [text,z,rotation]of [['36',700,0],['18',-700,Math.PI]]){
  ctx.save();ctx.translate(0,z);ctx.rotate(rotation);ctx.fillStyle='#f4eed8';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 20px monospace';ctx.fillText(text,0,0,20);ctx.restore();
 }
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=anisotropy;texture.minFilter=T.LinearMipmapLinearFilter;texture.magFilter=T.LinearFilter;
 const surface=new T.Mesh(new T.PlaneGeometry(231,1770),new T.MeshStandardMaterial({map:texture,roughness:1}));
 surface.name='airport-single-surface';surface.rotation.x=-Math.PI/2;surface.position.set(79.5,3,0);return surface;
}

// Fields are painted into the terrain material, never stacked on it.
export function landTexture(anisotropy){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=2048;
 const ctx=canvas.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,2048,2048);
 ctx.scale(2048/6200,2048/7800);ctx.translate(3100,3900);
 for(const [x,z,r]of groves){const gradient=ctx.createRadialGradient(x,z,r*.25,x,z,r*1.25);gradient.addColorStop(0,'#a3bf96');gradient.addColorStop(1,'#ffffff00');ctx.fillStyle=gradient;ctx.fillRect(x-r*1.3,z-r*1.3,r*2.6,r*2.6);}
 const fieldColors=['#d8d092','#b3c987','#e6daa4','#9eb880','#c3cb8c'];
 for(let j=0;j<4;j++)for(let i=0;i<4;i++){
  const x=-1150+i*160,z=350+j*170;ctx.fillStyle=fieldColors[(i+j*2)%5];ctx.fillRect(x,z,148,155);
  ctx.strokeStyle='#fff9da55';ctx.lineWidth=2.4;ctx.beginPath();for(let k=12;k<148;k+=14){ctx.moveTo(x+k,z);ctx.lineTo(x+k,z+155);}ctx.stroke();
 }
 const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=anisotropy;return tex;
}
