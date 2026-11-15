import * as T from './three.js';
import {CITY_PLACES} from './city-layout.js?v=04.3';
export function addCityParks({scene,r,item,ground,obstacle,rand,building}){
 const tree=(x,z,i)=>{const y=ground(x,z),h=8+rand(i)*7;item(x,y+h*.36,z,1,h*.72,1,'#756650','cylinder');item(x,y+h*.8,z,5+rand(i+1)*3,h*.45,5+rand(i+2)*3,['#567f64','#71996a','#89a977'][i%3],'ball');};
 const stripe=(x,z,w,d,color,y=.18)=>item(x,ground(x,z)+y,z,w,.08,d,color);
 const ring=(x,z,rx,rz,color,y=.25)=>{const points=[];for(let i=0;i<100;i++){const a=i*Math.PI*2/100;points.push(new T.Vector3(r.x+x+Math.cos(a)*rx,ground(x,z)+y,r.z+z+Math.sin(a)*rz));}const g=new T.BufferGeometry().setFromPoints(points);scene.add(new T.LineLoop(g,new T.LineBasicMaterial({color})));};
 const p=CITY_PLACES.park;
 stripe(p.x,p.z,p.w-18,p.d-18,'#779969',.12);stripe(p.x,p.z,12,p.d-18,'#d0c2a0',.22);stripe(p.x,p.z,p.w-18,12,'#d0c2a0',.23);
 // A wooded urban park with lake, promenades, playground and formal garden.
 item(p.x+115,ground(p.x,p.z)+.2,p.z-140,100,.1,62,'#65a6a8','cylinder');ring(p.x+115,p.z-140,108,70,'#ddd3b6',.27);
 for(let i=0;i<320;i++){const x=p.x+(rand(i+8000)-.5)*(p.w-50),z=p.z+(rand(i+8100)-.5)*(p.d-50);if(Math.abs(x-p.x)<20||Math.abs(z-p.z)<20||((x-p.x-115)/122)**2+((z-p.z+140)/83)**2<1||(x<p.x-90&&z>p.z+110))continue;tree(x,z,i+500);}
 for(let side of [-1,1])for(let i=0;i<16;i++){const x=p.x+side*23,z=p.z-280+i*36,y=ground(x,z);item(x,y+1,z,5,1,1.6,'#bd9d78');item(x,y+1.5,z+.8,5,1,.3,'#bd9d78');item(x+side*8,y+5,z,.3,10,.3,'#617b7e');item(x+side*8,y+10,z,1.8,.5,1.8,'#e7ddb5');}
 const px=p.x-190,pz=p.z+210,y=ground(px,pz);stripe(px,pz,120,120,'#caad86');for(let i=0;i<4;i++){item(px-35+i*22,y+4,pz,6,8,6,['#b7a4c3','#d2b56f'][i%2]);item(px-35+i*22,y+7,pz+10,6,1,20,'#7e9eaa');}
 building(p.x-230,p.z-250,65,42,9,'#d0c4a9',2);ring(p.x,p.z,18,18,'#e1d8b6');item(p.x,ground(p.x,p.z)+1,p.z,12,1.5,12,'#6fa8ad','cylinder');
 const g=CITY_PLACES.golf;stripe(g.x,g.z,g.w-18,g.d-18,'#6e9160',.12);
 for(let row=0;row<3;row++)for(let col=0;col<3;col++){const i=row*3+col,x=g.x-220+col*220,z=g.z-205+row*205,y=ground(x,z),turn=(i%2?1:-1)*.18;
 item(x,y+.22,z,31,.08,82,i%2?'#9eb47a':'#91aa70','cylinder',turn);item(x+12,y+.3,z-60,25,.08,23,'#b2c78b','cylinder');item(x-31,y+.3,z-30,12,.08,18,'#e0d1a9','cylinder');item(x+38,y+.3,z+12,9,.08,15,'#e0d1a9','cylinder');stripe(x,z+70,14,10,'#abc38d',.3);item(x+12,y+3,z-60,.22,6,.22,'#eee4c7');item(x+15,y+5.3,z-60,6,1.8,.15,'#b97165');
 for(let k=0;k<5;k++)tree(x-70+(k%2)*140,z-80+k*35,900+i*9+k);
 }
 building(g.x+250,g.z+255,90,45,12,'#e0d5b7',2);item(g.x+240,ground(g.x,g.z)+.3,g.z-245,55,.1,26,'#73a8ab','cylinder');
 // Football pitch and four stepped stands. The centre remains physically open.
 const s=CITY_PLACES.stadium,sx=s.x,sz=s.z,sy=ground(sx,sz);stripe(sx,sz,360,375,'#a8b3ae');stripe(sx,sz,118,170,'#4c845b',.24);
 for(let i=0;i<12;i++)stripe(sx,sz-77+i*14,108,14,i%2?'#629568':'#54895d',.3);
 for(const side of [-1,1]){stripe(sx+side*34,sz,.7,105,'#eee9cc',.4);stripe(sx,sz+side*52.5,68,.7,'#eee9cc',.4);stripe(sx,sz+side*36,40,.65,'#eee9cc',.42);for(const x of [-20,20])stripe(sx+x,sz+side*44,.65,17,'#eee9cc',.42);
 // White goal frames and thin net bars.
 for(const x of [-3.7,3.7])item(sx+x,sy+1.5,sz+side*54,.3,3,.3,'#f0e9cf');item(sx,sy+3,sz+side*54,7.7,.3,.3,'#f0e9cf');for(let k=-3;k<=3;k++)item(sx+k,sy+1.4,sz+side*57,.12,2.8,.12,'#d1d7c2');
 for(let row=0;row<12;row++){const h=4+row*2.3,offset=79+row*3.8;item(sx+side*offset,sy+h/2,sz,5,h,210,'#9ca8a9');item(sx+side*offset,sy+h+.15,sz,4,.3,207,row%3?'#837aa5':'#d8c48e');item(sx,sy+h/2,sz+side*(111+row*3.8),150,h,5,'#9ca8a9');item(sx,sy+h+.15,sz+side*(111+row*3.8),147,.3,4,row%3?'#837aa5':'#d8c48e');}
 item(sx+side*111,sy+35,sz,44,2,225,'#d7dccc');obstacle(sx+side*102,sz,65,225,sy+36);obstacle(sx,sz+side*132,160,56,sy+33);
 }
 stripe(sx,sz,68,.7,'#eee9cc',.42);ring(sx,sz,9.15,9.15,'#eee9cc',.45);
 for(const side of [-1,1])for(const end of [-1,1]){const x=sx+side*148,z=sz+end*160;item(x,sy+26,z,2,52,2,'#6f858d');item(x,sy+52,z,14,5,2,'#ebe4bf');obstacle(x,z,14,3,sy+55);}
 item(sx,sy+28,sz-160,42,20,3,'#344d60');item(sx,sy+28,sz-158.4,37,15,.15,'#b9cfae');
 const board=document.createElement('canvas');board.width=640;board.height=240;const bc=board.getContext('2d');bc.fillStyle='#233e4c';bc.fillRect(0,0,640,240);bc.fillStyle='#e9edb9';bc.textAlign='center';bc.font='bold 32px sans-serif';bc.fillText('PANORAMA ARENA',320,52);bc.font='bold 112px monospace';bc.fillText('0 : 0',320,177);const texture=new T.CanvasTexture(board);texture.colorSpace=T.SRGBColorSpace;const score=new T.Mesh(new T.PlaneGeometry(37,15),new T.MeshBasicMaterial({map:texture}));score.position.set(r.x+sx,sy+28,r.z+sz-158.15);scene.add(score);
 // Individual seat blocks, aisles, roof trusses and concourse entrances.
 for(const side of [-1,1]){
  for(let row=0;row<12;row++){
   const h=4+row*2.3,offset=79+row*3.8;
   for(let n=0;n<58;n++){if(n%15<2)continue;const z=sz-99+n*3.5;item(sx+side*offset,sy+h+.65,z,2,.9,2.3,n%7===0?'#e3d7b2':'#6b6595');}
   for(let n=0;n<40;n++){if(n%12<2)continue;item(sx-68+n*3.5,sy+h+.65,sz+side*(111+row*3.8),2.3,.9,2,n%7===0?'#e3d7b2':'#6b6595');}
  }
  for(let z=-100;z<=100;z+=25){item(sx+side*129,sy+18,sz+z,1.2,36,1.2,'#74868b');item(sx+side*111,sy+36.5,sz+z,43,.6,.6,'#899a9e');}
  // Advertising boards stay beyond the grass apron, never on the landing surface.
  for(let z=-70;z<=70;z+=20)item(sx+side*64,sy+1,sz+z,.4,1.5,17,z%40?'#6676a3':'#c9b87c');
  for(let x=-110;x<=110;x+=55){item(sx+x,sy+3,sz+side*166,18,6,2,'#465d6b');item(sx+x,sy+6.5,sz+side*167,22,1,5,'#d9d8c7');}
  // Goal net roof and horizontal strands make the goals readable from a hover.
  for(let y=.5;y<=2.5;y+=.5)item(sx,sy+y,sz+side*57,7.5,.045,.045,'#d1d7c2');
  for(const x of [-3.7,3.7])item(sx+x,sy+3,sz+side*55.5,.12,.12,3,'#eee9cc');
 }
 for(const side of [-1,1])for(const end of [-1,1]){const x=sx+side*35,z=sz+end*53;item(x,sy+1,z,.08,2,.08,'#eee7ca');item(x+.5,sy+1.7,z,1,.5,.06,'#dfb56d');}
 // Forecourt, parked cars and pedestrian entrances outside the seating bowl.
 for(let i=0;i<28;i++){const x=sx-135+(i%14)*20,z=sz+182+Math.floor(i/14)*9;item(x,sy+1.2,z,4,2.4,7,['#668b98','#c4b690','#b38070'][i%3]);}
}
