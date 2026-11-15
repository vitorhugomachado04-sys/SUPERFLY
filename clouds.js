import * as T from './three.js';
const clamp=v=>Math.max(0,Math.min(1,v)),smooth=v=>{v=clamp(v);return v*v*(3-2*v);};
function noise(x,y,seed){
 const hash=(x,y)=>{const n=Math.sin(x*127.1+y*311.7+seed*73.3)*43758.5453;return n-Math.floor(n);};
 const ix=Math.floor(x),iy=Math.floor(y),fx=smooth(x-ix),fy=smooth(y-iy);
 return T.MathUtils.lerp(T.MathUtils.lerp(hash(ix,iy),hash(ix+1,iy),fx),T.MathUtils.lerp(hash(ix,iy+1),hash(ix+1,iy+1),fx),fy);
}
// Optical density with irregular billows, a lit crown and blue-grey undersides.
// Alpha reaches zero gradually; no opaque sphere silhouettes or hard cutouts.
export function cloudTexture(seed,size=192){
 const pixels=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=x/(size-1)*2-1,v=y/(size-1)*2-1;
  const n=noise(u*3+8,v*3+8,seed)*.57+noise(u*7+16,v*7+16,seed)*.28+noise(u*17+32,v*17+32,seed)*.15;
  const radius=Math.hypot(u,v),edge=.78+(n-.5)*.28;
  const density=smooth((edge-radius)/.3),alpha=(1-Math.exp(-density*2.8))*.92;
  const light=clamp(.62+v*.25-u*.12+(n-.5)*.32);
  const i=(y*size+x)*4;
  pixels[i]=Math.round(176+79*light);pixels[i+1]=Math.round(190+65*light);pixels[i+2]=Math.round(202+51*light);pixels[i+3]=Math.round(alpha*255);
 }
 const texture=new T.DataTexture(pixels,size,size);texture.colorSpace=T.SRGBColorSpace;texture.magFilter=T.LinearFilter;texture.minFilter=T.LinearMipmapLinearFilter;texture.generateMipmaps=true;texture.needsUpdate=true;return texture;
}
export function addClouds(scene,rand){
 const maps=[cloudTexture(1),cloudTexture(7),cloudTexture(19)],clouds=[];
 for(let i=0;i<24;i++){
  const g=new T.Group(),size=100+rand()*110;
  const lobes=[[-1.05,0,0,1.5,.85],[0,.02,.1,1.9,.95],[1.1,0,0,1.4,.8],[-.65,.45,-.2,1.2,1.25],[.25,.65,0,1.5,1.65],[.95,.35,.2,1.1,1.1],[0,-.18,.35,2.25,.6]];
  for(const [x,y,z,sx,sy]of lobes){
   const material=new T.SpriteMaterial({map:maps[Math.floor(rand()*maps.length)],color:'#fffaf2',transparent:true,depthWrite:false,opacity:.85,fog:true});
   const puff=new T.Sprite(material),variation=.85+rand()*.3;
   puff.position.set(x*size,y*size,z*size+(rand()-.5)*size*.6);puff.scale.set(size*sx*variation,size*sy*variation,1);g.add(puff);
  }
  g.rotation.y=rand()*Math.PI*2;g.position.set((rand()-.5)*8000,850+rand()*850,(rand()-.5)*8000);scene.add(g);clouds.push(g);
 }
 return clouds;
}
export function updateClouds(clouds,origins,w,viewer,time,day,twilight){
 const angle=w.direction*Math.PI/180,drift=time*(1+w.wind*.35),tint=new T.Color('#647186').lerp(new T.Color('#fffaf2'),day).lerp(new T.Color('#f4c5a4'),twilight*.3).lerp(new T.Color('#94a1ae'),w.cloud*.28);
 for(let i=0;i<clouds.length;i++){
  const cloud=clouds[i],origin=origins[i];
  cloud.position.x=viewer.x+((origin.x+Math.sin(angle)*drift-viewer.x)%8000+12000)%8000-4000;
  cloud.position.z=viewer.z+((origin.z-Math.cos(angle)*drift-viewer.z)%8000+12000)%8000-4000;
  cloud.scale.setScalar(.65+w.cloud*.9);
  const distance=Math.hypot(cloud.position.x-viewer.x,cloud.position.z-viewer.z),fade=1-smooth((distance-3000)/900);
  cloud.visible=w.cloud>.05&&fade>.001;
  for(const puff of cloud.children){puff.material.color.copy(tint);puff.material.opacity=(.66+w.cloud*.18)*fade;}
 }
}
