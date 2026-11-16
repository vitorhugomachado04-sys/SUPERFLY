import * as T from './three.js';
import {terrain} from './geography.js?v=04.27';
export function addEnseada(scene,world){
 const mats=new Map(),geo=new T.BoxGeometry(1,1,1),ball=new T.IcosahedronGeometry(1,1),batches=new Map();
 function item(x,y,z,w,h,d,c,shape=geo){const key=c+shape.uuid;if(!batches.has(key))batches.set(key,{geo:shape,mat:new T.MeshStandardMaterial({color:c,roughness:.85}),items:[]});batches.get(key).items.push([x,y,z,w,h,d]);}
 const box=(x,z,w,h,d,c,offset=0)=>item(x,terrain(x,z,false)+h/2+offset,z,w,h,d,c);
 const tree=(x,z)=>{const y=terrain(x,z,false);item(x,y+4,z,1.1,8,1.1,'#7a6850');item(x,y+10,z,5,7,5,'#4d805c',ball);};
 function patch(cx,cz,w,d,c,offset=.16){const positions=[],index=[];const nx=Math.ceil(w/12),nz=Math.ceil(d/12);for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const x=cx-w/2+w*i/nx,z=cz-d/2+d*j/nz;positions.push(x,terrain(x,z,false)+offset,z);}for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i;index.push(a,a+nx+1,a+1,a+1,a+nx+1,a+nx+2);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setIndex(index);g.computeVertexNormals();const m=new T.Mesh(g,new T.MeshStandardMaterial({color:c,roughness:1,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));scene.add(m);return m;}
 function home(x,z,h=10,w=22,d=26){const ys=[terrain(x-w/2,z-d/2,false),terrain(x+w/2,z+d/2,false)],base=Math.max(...ys);item(x,base+h/2,z,w,h,d,'#e6d5b9');item(x,base+h+.8,z,w+3,1.6,d+3,'#b56f55');for(const dx of [-w*.27,w*.27])for(let floor=4;floor<h;floor+=5)item(x+dx,base+floor,z+d/2+.12,4,2,.25,'#4d7180');world.obstacles.push({x,z,w:w+3,d:d+3,top:base+h+2});}
 // Three distinct neighborhoods: a football village, compact centre, and coastal golf park.
 patch(-650,-100,100,150,'#4e8a5a');for(const x of [-697,-603])patch(x,-100,1,144,'#eee8cc',.24);for(const z of [-172,-100,-28])patch(-650,z,95,1,'#eee8cc',.24);
 for(const z of [-171,-29]){for(const x of [-662,-638])box(x,z,.6,7,.6,'#f5efdd');item(-650,terrain(-650,z)+7,z,25,.6,.6,'#f5efdd');for(let x=-660;x<=-640;x+=4)item(x,terrain(x,z)+3,z+Math.sign(z+100)*4,.12,6,.12,'#a6b7ab');}
 for(let i=0;i<8;i++){home(-790+(i%2)*280,-220+Math.floor(i/2)*75);tree(-745+(i%2)*190,-220+Math.floor(i/2)*75);}
 for(let row=0;row<5;row++)for(let col=0;col<6;col++){const x=420+col*65,z=-810+row*78;if(row===2&&col>=2&&col<=3)continue;home(x,z,row===1||row===3?24:10,row===1||row===3?32:24,30);tree(x+24,z-24);}
 patch(580,-650,100,95,'#d9c9a8');box(580,-650,18,1,18,'#789fa3');
 for(let i=0;i<6;i++)patch(420+i*65,-650,8,430,'#a8a398');for(let i=0;i<5;i++)patch(590,-810+i*78,420,8,'#a8a398');
 // Nine short holes, inspired by the coastal par-3 character of The Hay (not a replica).
 const holeInfo=[];for(let i=0;i<9;i++){const x=-1090+(i%3)*220,z=1370+Math.floor(i/3)*140;patch(x,z,145,34,'#78a564');patch(x+61,z,27,29,'#9fbd79',.25);patch(x+37,z+28,24,17,'#e6d4a7');box(x-65,z,8,.12,10,'#a7bb87',.2);box(x+61,z,.22,5,.22,'#f1ecdc');item(x+65,terrain(x+61,z)+4,z,8,2.5,.12,'#d98165');holeInfo.push({number:i+1,x:x+61,z});for(const dz of [-51,51])tree(x-10,z+dz);}
 world.enseadaInfo={holes:holeInfo,neighborhoods:3,surfSpots:3};
 // A grassy clearing around the pond; its basin is part of the collision terrain.
 const water=new T.Mesh(new T.CircleGeometry(1,64),new T.MeshStandardMaterial({color:'#609fa7',roughness:.24,metalness:.2}));water.rotation.x=-Math.PI/2;water.scale.set(85,57,1);water.position.set(950,2.4,40);water.name='enseada-park-pond';scene.add(water);
 for(let i=0;i<40;i++){const a=i/40*Math.PI*2,x=950+Math.cos(a)*140,z=40+Math.sin(a)*115;box(x,z,9,.15,7,'#d8c7a3',.12);if(i%5===0){box(x+8,z,7,1,2,'#8e7455');tree(950+Math.cos(a)*180,40+Math.sin(a)*150);}}
 // Airport nameplate, readable from the apron and low fly-bys.
 const cv=document.createElement('canvas');cv.width=2048;cv.height=256;const ctx=cv.getContext('2d');ctx.fillStyle='#243e49';ctx.fillRect(0,0,2048,256);ctx.fillStyle='#fff4cf';ctx.textAlign='center';ctx.font='bold 80px sans-serif';ctx.fillText('Aeroporto Joselito Geraldo de Sousa',1024,150,1940);const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;const sign=new T.Mesh(new T.BoxGeometry(100,12,.8),new T.MeshStandardMaterial({map:tex,roughness:.7}));sign.position.set(155,40,320);scene.add(sign);for(const x of [112,198])box(x,320,1,38,1,'#667a7d');world.obstacles.push({x:155,z:320,w:100,d:2,top:46});
 for(const b of batches.values()){const m=new T.InstancedMesh(b.geo,b.mat,b.items.length),d=new T.Object3D();b.items.forEach(([x,y,z,w,h,depth],i)=>{d.position.set(x,y,z);d.scale.set(w,h,depth);d.updateMatrix();m.setMatrixAt(i,d.matrix);});m.castShadow=m.receiveShadow=true;m.computeBoundingSphere();scene.add(m);}
}
