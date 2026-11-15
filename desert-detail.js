import * as T from './three.js';
export function addDesertDetail({scene,world,r,item,ground,obstacle,clear,rand}){
 // Irregular sandstone outcrops, with low shrubs around their bases.
 let rocks=0,palms=0,houses=0;const leafTransforms=[],dummy=new T.Object3D();
 for(let i=0;i<85;i++){
  const x=-1500+rand(i+8100)*2900,z=-1500+rand(i+8200)*2900,y=ground(x,z);
  if(x>-1470&&x<-1030&&z>-530&&z<40)continue;
  if(y<4||!clear(x,z,180)||Math.hypot(x/r.rx,z/r.rz)>.85)continue;
  const size=3+rand(i+8300)*10;
  item(x,y+size*.3,z,size,size*.65,size*.8,i%2?'#b5936f':'#c6a17a','ball',rand(i+8400)*6.28);obstacle(x,z,size*2,size*1.6,y+size);
  for(let j=0;j<3;j++)item(x+size+j*2,y+.5,z+j*2,1.3,.8,1.4,'#8c9160','ball');rocks++;
 }
 // Date palms in small groves beside the fields and settlement, away from approaches.
 for(let i=0;i<112;i++){
  const centers=[[-1000,-850],[-1200,350],[350,-200],[1100,800]],center=centers[i%4],x=center[0]+(rand(i+8500)-.5)*350,z=center[1]+(rand(i+8600)-.5)*360,y=ground(x,z);
  if(y<4||!clear(x,z,160)||Math.hypot(x/r.rx,z/r.rz)>.88)continue;
  const h=12+rand(i+8700)*10;item(x,y+h/2,z,.55,h,.55,'#8c7452','cylinder');item(x,y+h-.3,z,1.6,1.1,1.6,'#6e8054','ball');
  for(let j=0;j<8;j++){dummy.position.set(r.x+x,y+h,r.z+z);dummy.rotation.set(0,j*Math.PI/4+rand(i+8800)*6.28,0);dummy.scale.set(5+rand(i+j+8900)*3,1.7+rand(i+j+9000),1.0);dummy.updateMatrix();leafTransforms.push(dummy.matrix.clone());}
  obstacle(x,z,1.5,1.5,y+h);palms++;
 }
 const positions=[],indices=[];
 for(let i=0;i<=10;i++){const t=i/10,width=Math.sin(Math.PI*t)*.75;for(const side of [-1,1])positions.push(t,Math.sin(t*Math.PI)*.6-t*t*.85,side*width);if(i){const n=i*2;indices.push(n-2,n-1,n,n-1,n+1,n);}}
 const leaf=new T.BufferGeometry();leaf.setAttribute('position',new T.Float32BufferAttribute(positions,3));leaf.setIndex(indices);leaf.computeVertexNormals();const foliage=new T.InstancedMesh(leaf,new T.MeshStandardMaterial({color:'#667e4a',side:T.DoubleSide,roughness:.9}),leafTransforms.length);leafTransforms.forEach((m,i)=>foliage.setMatrixAt(i,m));foliage.instanceMatrix.needsUpdate=true;foliage.castShadow=foliage.receiveShadow=true;foliage.computeBoundingSphere();scene.add(foliage);
 // Sand-coloured courtyard houses with flat roofs and parapets.
 for(let i=0;i<42;i++){
  const x=-1420+i%6*65+(rand(i+9100)-.5)*15,z=-480+Math.floor(i/6)*75,w=24+rand(i+9200)*10,d=27+rand(i+9300)*8;
  if(!clear(x,z,170))continue;
  const samples=[ground(x-w/2,z-d/2),ground(x+w/2,z-d/2),ground(x-w/2,z+d/2),ground(x+w/2,z+d/2)],base=Math.max(...samples),low=Math.min(...samples);
  if(low<3||base-low>9)continue;
  const h=7+i%3*3,color=['#d9bf96','#c7a780','#e2cda9'][i%3];item(x,(base+low)/2,z,w+2,base-low+1,d+2,'#b99d78');item(x,base+h/2,z,w,h,d,color);
  item(x,base+h+.25,z,w+1,.5,d+1,'#e8d4b1');for(const side of [-1,1]){item(x+side*w/2,base+h+1,z,.6,1.5,d,color);item(x,base+h+1,z+side*d/2,w,1.5,.6,color);}
  item(x,base+2,z+d/2+.1,3,4,.2,'#6e6954');for(const side of [-1,1])item(x+side*w*.28,base+h*.6,z+d/2+.12,2.6,2.4,.25,'#526d77');
  if(i%3===0)item(x-w*.22,base+h+2.5,z, w*.35,5,d*.5,color);
  obstacle(x,z,w+2,d+2,base+h+5);houses++;
 }
 world.desertDetail={rocks,palms,houses};
}
