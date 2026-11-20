import * as T from './three.js';
import {WIND_PLACES} from './winds-layout.js?v=04.56';
export function addWindRecreation({scene,r,item,ground,obstacle,world}){
 function base(p,color){const samples=[];for(let z=-p.d/2;z<=p.d/2;z+=5)for(let x=-p.w/2;x<=p.w/2;x+=5)samples.push(ground(p.x+x,p.z+z));const y=Math.max(...samples)+.1,lo=Math.min(...samples);item(p.x,(lo+y)/2,p.z,p.w,y-lo,p.d,'#a5a393');item(p.x,y+.02,p.z,p.w,.04,p.d,color);return y+.06;}
 function line(x,y,z,w,d){item(x,y,z,w,.035,d,'#ded9bd');}
 function ring(x,y,z,radius){const pts=Array.from({length:65},(_,i)=>new T.Vector3(r.x+x+Math.cos(i/64*Math.PI*2)*radius,y,r.z+z+Math.sin(i/64*Math.PI*2)*radius));scene.add(new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:'#ded9bd'})));}
 const f=WIND_PLACES.football,y=base(f,'#89976b');
 // Patchy community pitch: exposed earth at the goals and centre, faded chalk.
 for(const [dx,dz,w,d]of [[0,0,13,10],[0,-40,20,13],[0,40,20,13],[-21,23,8,12],[20,-18,9,6]])item(f.x+dx,y+.025,f.z+dz,w,.025,d,'#b2a27b');
 for(const side of [-1,1]){line(f.x+side*30,y+.08,f.z,.3,90);line(f.x,y+.08,f.z+side*45,60,.3);line(f.x,y+.08,f.z+side*31,32,.3);for(const dx of [-16,16])line(f.x+dx,y+.08,f.z+side*38,.3,14);
 for(const dx of [-3.5,3.5])item(f.x+dx,y+1.3,f.z+side*46,.18,2.6,.18,'#d4d1b9');item(f.x,y+2.6,f.z+side*46,7.2,.18,.18,'#d4d1b9');
 for(let k=-3;k<=3;k++)item(f.x+k,y+1.2,f.z+side*48,.055,2.4,.055,'#b1b3a0');
 for(let j=0;j<3;j++){item(f.x+side*39,y+.7+j*.55,f.z,3,.3,26,'#9b876b');}
 obstacle(f.x,f.z+side*47,8,3,y+2.8);
 }
 line(f.x,y+.08,f.z,60,.3);ring(f.x,y+.1,f.z,7);
 // Three separate clay courts, each with singles/doubles lines, service boxes and net.
 const t=WIND_PLACES.tennis,ty=base(t,'#a8947b');
 for(let i=0;i<3;i++){const x=t.x+(i-1)*27,z=t.z;item(x,ty+.03,z,24,.05,42,'#b67c5f');
 for(const dx of [-5.49,-4.115,4.115,5.49])line(x+dx,ty+.09,z,.12,23.77);
 for(const dz of [-11.885,-6.4,6.4,11.885])line(x,ty+.09,z+dz,10.97,.12);line(x,ty+.09,z,.12,12.8);
 for(const side of [-1,1])item(x+side*6.1,ty+.65,z,.12,1.3,.12,'#657778');
 item(x,ty+.65,z,12.2,.85,.045,'#536867');item(x,ty+1.1,z,12.2,.08,.06,'#e0dbbd');
 for(const side of [-1,1]){for(let k=0;k<5;k++)item(x-11+k*5.5,ty+2,z+side*20,.12,4,.12,'#758780');for(let k=1;k<=4;k++)item(x,ty+k*.8,z+side*20,22,.055,.055,'#819087');}
 item(x+9,ty+.7,z+12,2,.5,4,'#c4b18b');obstacle(x,z,12.5,.3,ty+1.2);
 }
 // Clubhouse, shade canopy and benches between the village and the courts.
 const cx=t.x,cz=t.z+45,cy=ground(cx,cz);item(cx,cy+3,cz,25,6,14,'#d6c7a7');item(cx,cy+6.5,cz,28,1,17,'#8c9c90');item(cx,cy+3,cz-7.1,15,2,.2,'#648893');obstacle(cx,cz,28,17,cy+7);
 const h=WIND_PLACES.heli;for(let k=0;k<8;k++){const z=h.z+27+k*2,x=h.x,base=ground(x,z),top=56-k*.8;if(top>base)item(x,(base+top)/2,z,8,top-base,2,'#a9b1a8');}
 world.windRecreation={football:f,tennisCourts:3,helipad:'wind-heli'};
}
