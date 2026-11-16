import {helicopter} from './helicopters.js?v=04.27';
import {getAircraft} from './fleet.js?v=04.27';
export const resortReserved=(x,z)=>x>780&&x<1190&&z>-720&&z<250;
export function addAlpineResort({scene,world,r,item,ground,obstacle}){
 const y=1118,hx=895,hz=-600;
 // Stone podium, timber wings, exposed floor beams and generous balconies.
 item(925,y-1.65,-575,270,4,200,'#92958d');
 function lodge(x,z,w,d,h){item(x,y+h/2,z,w,h,d,'#967154');for(let floor=0;floor<3;floor++){const fy=y+7+floor*10;
  item(x,fy-4,z,w+3,1.2,d+3,'#634f43');
  for(let side of [-1,1]){item(x,fy-2,z+side*(d/2+4),w+10,.8,8,'#ae8c63');item(x,fy+1,z+side*(d/2+7.7),w+10,.35,.35,'#665a49');
   for(let k=0;k<Math.floor(w/9);k++){const xx=x-w/2+5+k*9;item(xx,fy+1,z+side*(d/2+.12),5,5,.25,'#668e9e');item(xx,fy+.5,z+side*(d/2+7.7),.3,3,.3,'#76654e');}}
 }
 item(x,y+h+9,z,w+18,18,d+18,'#596e73','roof');item(x,y+h+9.5,z,w+17,18,d+17,'#e6e9df','roof');obstacle(x,z,w+18,d+18,y+h+18);
 for(let side of [-1,1])item(x+side*w*.3,y+h+13,z-10,4,15,5,'#92978d');}
 lodge(hx,hz,110,64,34);lodge(815,-575,38,82,26);
 // Entrance glazing and a covered portico facing the ski slope.
 item(895,y+8,-559,30,16,1,'#698e9b');item(895,y+14,-548,40,2,24,'#7b644b');for(const x of [878,912])item(x,y+7,-540,1.5,14,1.5,'#6c5844');
 // Pool and pale coping, terrace loungers and parasols.
 const px=1000,pz=-535;item(px,y+.45,pz,70,.9,44,'#d1ccb4');item(px,y+.95,pz,59,.12,31,'#64bec6');
 for(const side of [-1,1]){item(px+side*31,y+1.1,pz,2,1,35,'#e5dfc8');item(px,y+1.1,pz+side*17,64,1,2,'#e5dfc8');}
 for(let i=0;i<7;i++){const x=967+i*11;item(x,y+1.3,-501,4,.6,8,'#cfc0a0');item(x,y+2.2,-498,4,2,2,'#e2d8ba');if(i%2===0){item(x+4,y+4,-500,.25,8,.25,'#a3947a');item(x+4,y+8,-500,5,2,5,'#c1b4cc','cone');}}
 for(let i=0;i<11;i++){const x=795+i*26;item(x,y+2,-474,.4,4,.4,'#7f7766');if(i<10)item(x+13,y+3,-474,26,.3,.3,'#aaa58f');}
 obstacle(px,pz,70,44,y+1.6);
 // Two tennis courts and a stationary resort helicopter on the rear terrace.
 for(const cx of [982,1025]){
  item(cx,y+.48,-608,31,.25,46,'#658b83');item(cx,y+.63,-608,23.8,.06,36.6,'#6e8098');
  for(const side of [-1,1]){item(cx+side*11.9,y+.68,-608,.12,.05,36.6,'#eee9d9');item(cx,y+.68,-608+side*18.3,23.8,.05,.12,'#eee9d9');item(cx+side*13,y+1.4,-608,.18,2,.18,'#d5d4c1');}
  for(const dz of [-6.4,6.4])item(cx,y+.68,-608+dz,16.4,.05,.12,'#eee9d9');
  item(cx,y+.68,-608,.12,.05,12.8,'#eee9d9');item(cx,y+1.15,-608,26,1.2,.08,'#475c5d');item(cx,y+1.8,-608,26,.09,.1,'#eee9d9');
  for(let k=0;k<9;k++)for(const side of [-1,1])item(cx+side*15,y+2,-629+k*5,.16,3,.16,'#697d79');
  obstacle(cx,-608,31,46,y+2);
 }
 item(1005,y+.5,-658,34,.3,34,'#617b7b');
 for(const dx of [-4,4])item(1005+dx,y+.78,-658,1,.05,12,'#ece9d7');item(1005,y+.78,-658,8,.05,1,'#ece9d7');
 // Separate parking apron keeps the active landing pad clear.
 item(1070,y+.5,-658,19,.3,19,'#929a92');
 for(const side of [-1,1]){item(1005+side*16,y+.78,-658,.18,.06,32,'#ece9d7');item(1005,y+.78,-658+side*16,32,.06,.18,'#ece9d7');}
 const hc=getAircraft('bell47'),heli=helicopter(hc);heli.mesh.name='resort-parked-bell47';heli.mesh.position.set(r.x+1070,y+.7+hc.gear,r.z-658);heli.mesh.rotation.y=.55;scene.add(heli.mesh);obstacle(1070,-658,12,12,y+5);
 world.mountainResort={region:r.id,hotel:{x:r.x+895,z:r.z-600,y},pool:{x:r.x+1000,z:r.z-535,y}};
}
