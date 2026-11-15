import * as T from './three.js';
export function rocketModel(){
 const g=new T.Group(),steel=new T.MeshStandardMaterial({color:'#bac5cc',metalness:.72,roughness:.3}),black=new T.MeshStandardMaterial({color:'#29343d',roughness:.9}),cream=new T.MeshStandardMaterial({color:'#e9e3cc'});
 const part=(geo,mat,x,y,z)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;g.add(m);return m;};
 const profile=[new T.Vector2(0,57),new T.Vector2(.55,56),new T.Vector2(1.5,54),new T.Vector2(2.6,51),new T.Vector2(3.5,47),new T.Vector2(4,44),new T.Vector2(4,4)];
 part(new T.LatheGeometry(profile.slice().reverse(),48),steel,0,0,0);
 part(new T.CylinderGeometry(4.035,4.035,39,48,1,true,Math.PI/2,Math.PI),black,0,24,0);
 part(new T.LatheGeometry(profile.slice(0,-1).reverse().map(v=>new T.Vector2(v.x+.025,v.y)),32,Math.PI/2,Math.PI),black,0,0,0);
 for(let y=6;y<44;y+=2.4){const ring=part(new T.TorusGeometry(4.045,.025,4,48),steel,0,y,0);ring.rotation.x=Math.PI/2;}
 for(const side of [-1,1]){
  for(const [y,h,w] of [[6,12,5],[39,7,3]]){
   const shape=new T.Shape();shape.moveTo(0,0);shape.lineTo(w,1);shape.lineTo(w*.8,h*.52);shape.lineTo(.4,h);shape.closePath();
   const fin=part(new T.ExtrudeGeometry(shape,{depth:.32,bevelEnabled:true,bevelSize:.12,bevelThickness:.08,bevelSegments:1,steps:1}),steel,side*3.7,y,-.16);fin.scale.x=side;
   const hinge=part(new T.CylinderGeometry(.22,.22,h,8),black,side*3.9,y+h/2,0);
  }
  part(new T.CylinderGeometry(.16,.16,26,8),steel,side*3.8,24,1.4);
  for(const y of [16,35]){const pod=part(new T.BoxGeometry(.6,.8,1.4),black,side*4,y,0);}
 }
 part(new T.CylinderGeometry(3.8,4,2,32,1,true),black,0,4,0);
 for(let i=0;i<6;i++){const a=i*Math.PI/3,r=i%2?2.5:1.5;part(new T.CylinderGeometry(.4,1.05,2.8,16,1,true),black,Math.sin(a)*r,2,Math.cos(a)*r);}
 g.name='Starship · Panorama';return g;
}
export function addSpaceport(scene,x,y,z,obstacles=[],withRocket=true){
 const group=new T.Group();group.name='winds-spaceport';group.position.set(x,y,z);scene.add(group);const mats=new Map();
 const mat=c=>{if(!mats.has(c))mats.set(c,new T.MeshStandardMaterial({color:c,roughness:.65,metalness:.2}));return mats.get(c);};
 function box(px,py,pz,w,h,d,c){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(c));m.position.set(px,py,pz);m.castShadow=m.receiveShadow=true;group.add(m);return m;}
 function cyl(px,py,pz,r,h,c){const m=new T.Mesh(new T.CylinderGeometry(r,r,h,24),mat(c));m.position.set(px,py,pz);m.castShadow=m.receiveShadow=true;group.add(m);return m;}
 // Keep the apron above the terrain: coplanar surfaces flicker with camera motion.
 box(0,-1.8,0,200,4,190,'#7e9290');cyl(0,3,0,19,6,'#3e505a');cyl(0,6.5,0,14,1,'#c2c5b6');
 for(const dx of [-6,6])for(const dz of [-6,6])box(27+dx,40,dz,2,80,2,'#71868d');
 for(let h=8;h<80;h+=9){box(27,h,0,16,1,16,'#b4bdb3');box(27,h+3,-7,16,1,1,'#879795');}
 // Braced service tower, umbilicals and access platforms.
 function beam(ax,ay,az,bx,by,bz,r,c){const d=new T.Vector3(bx-ax,by-ay,bz-az);const m=new T.Mesh(new T.CylinderGeometry(r,r,d.length(),6),mat(c));m.position.set((ax+bx)/2,(ay+by)/2,(az+bz)/2);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());group.add(m);return m;}
 for(let h=8;h<71;h+=9){for(const dz of [-7,7]){beam(20,h,dz,34,h+9,dz,.45,'#566773');beam(34,h,dz,20,h+9,dz,.45,'#566773');}for(const dx of [20,34])beam(dx,h,-7,dx,h+9,7,.4,'#81939b');}
 for(const dx of [24,27,30])cyl(dx,40,-9,.45,78,'#c6d0cf');
 for(let h=10;h<80;h+=9){box(27,h,10,16,.4,4,'#64717b');box(27,h+2,12,16,.16,.16,'#eee0a1');for(const dx of [20,27,34])box(dx,h+1,12,.16,2,.16,'#eee0a1');}
 for(const side of [-1,1]){box(side*15,3,0,3,6,18,'#9ba6a4');box(side*15,6.3,0,3,.5,18,'#f2c76d');}
 for(let i=0;i<12;i++){const a=i*Math.PI/6;beam(Math.sin(a)*17,.3,Math.cos(a)*17,Math.sin(a)*12,6,Math.cos(a)*12,.65,'#2d3d49');}
 const perimeter=cyl(0,.32,0,27,.12,'#d7cfaa');
 // The mount hides the center of the safety ring, leaving a clear service apron.
 cyl(0,.42,0,25,.12,'#657a7c');
 for(let i=0;i<3;i++){
  const z=-50+i*27;
  const dome=new T.Mesh(new T.SphereGeometry(10,20,12,0,Math.PI*2,0,Math.PI/2),mat('#d2dad6'));dome.position.set(-58,24,z);dome.scale.y=.35;group.add(dome);
  for(const y of [3,20]){const ring=new T.Mesh(new T.TorusGeometry(10.05,.18,6,24),mat('#8d9d9e'));ring.rotation.x=Math.PI/2;ring.position.set(-58,y,z);group.add(ring);}
  box(-47,13,z,1,26,1,'#687e87');
 }
 for(let i=0;i<8;i++){box(32+i*6.5,10,42.5,.4,7,.7,'#d5ded9');box(32+i*6.5,2,40,2,3,2,'#e7bf65');}
 for(const x of [39,56,73]){box(x,19,65,10,3,8,'#a6b6b5');for(let i=0;i<4;i++)box(x-3+i*2,20.6,65,.5,.2,6,'#516874');}
 for(const x of [-91,91])for(const z of [-78,78]){cyl(x,9,z,.3,18,'#677a83');box(x,18,z,4,.6,2,'#fff0bd');}
 box(15,57,0,27,2,5,'#a2b3b6');box(27,82,0,20,2,20,'#d1d3c6');
 for(let i=0;i<3;i++){cyl(-58,12,-50+i*27,10,24,'#d2dad6');cyl(-58,24.5,-50+i*27,10,1,'#7e929d');box(-29,1,-50+i*27,40,1,1,'#bbc3bd');}
 box(55,8,62,58,16,38,'#c2cdc5');box(55,17,62,62,2,42,'#72758f');box(55,10,42.8,48,7,.3,'#467181');
 for(let i=0;i<7;i++){box(-80+i*25,.27,87,17,.06,1,'#eee0a1');box(-80+i*25,1.1,-90,14,2,2,'#b89b69');}
 if(withRocket){const rocket=rocketModel();rocket.position.y=8;group.add(rocket);}
 obstacles.push({x:x+27,z,w:22,d:22,top:y+85},{x,z,w:40,d:40,top:y+65},{x:x+55,z:z+62,w:62,d:42,top:y+19});return group;
}
export function oceanPlatform(scene,x,z){
 const g=new T.Group();g.position.set(x,0,z);scene.add(g);g.name='ocean-landing-platform';
 const add=(geo,color,y)=>{const m=new T.Mesh(geo,new T.MeshStandardMaterial({color,roughness:.7,metalness:.3}));m.position.y=y;m.receiveShadow=true;g.add(m);return m;};
 add(new T.CylinderGeometry(48,43,8,64),'#334c5c',3);add(new T.CylinderGeometry(42,42,1,64),'#748b8b',7.5);
 for(const radius of [38,7]){const ring=add(new T.TorusGeometry(radius,.15,6,64),'#b6a4eb',8.22);ring.rotation.x=Math.PI/2;}
 for(let i=0;i<16;i++){const a=i*Math.PI/8,m=add(new T.SphereGeometry(.7,8,6),'#75d6ac',8.5);m.position.x=Math.sin(a)*45;m.position.z=Math.cos(a)*45;}
 for(let i=0;i<24;i++){const a=i*Math.PI/12;const post=add(new T.CylinderGeometry(.15,.15,2,6),'#c3d3cf',9);post.position.set(Math.sin(a)*46,9,Math.cos(a)*46);}
 const rail=add(new T.TorusGeometry(46,.15,6,64),'#bdcecb',10);rail.rotation.x=Math.PI/2;
 for(const x of [-15,15]){const mark=add(new T.BoxGeometry(10,.1,2),'#b6a4eb',8.15);mark.position.x=x;}
 return g;
}
