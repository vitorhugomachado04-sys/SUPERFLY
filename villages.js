import {WIND_FARMS,windAmenityReserved,windFarmReserved,windTurbineReserved} from './winds-layout.js?v=04.45';
import {regionRadius} from './geography.js?v=04.45';
// Small settlements follow the relief; foundations prevent floating hillside houses.
export function addVillages({r,item,ground,obstacle,clear,rand,world}){
 if(!['winds','alpine','peaks','aurora-snow'].includes(r.id))return;
 let houses=0,farms=0;const mountain=r.id!=='winds';
 function house(x,z,i,w=19,d=24,h=8){
  if(!clear(x,z,170)||regionRadius(r,r.x+x,r.z+z)>.9||(r.id==='winds'&&(windAmenityReserved(x,z,24)||windTurbineReserved(x,z,16))))return false;
  const ys=[ground(x-w/2,z-d/2),ground(x+w/2,z-d/2),ground(x-w/2,z+d/2),ground(x+w/2,z+d/2)],y=Math.max(...ys),lo=Math.min(...ys);
  if(lo<4||y-lo>9)return false;
  item(x,(lo+y)/2-.5,z,w+2,y-lo+1,d+2,'#929b8f');
  item(x,y+h/2,z,w,h,d,['#d2c5aa','#b8bca6','#c3a58b','#e1d3b7'][i%4]);
  item(x,y+h+3,z,w+4,6,d+4,mountain?'#7a8b88':i%2?'#af8067':'#718c8b','roof');
  for(const s of [-1,1]){item(x+s*w*.27,y+h*.6,z+d/2+.15,3,2.7,.25,'#567d88');item(x+s*w*.27,y+h*.6,z-d/2-.15,3,2.7,.25,'#567d88');}
  item(x,y+2,z+d/2+.2,2.6,4,.3,'#6d7266');item(x+w*.3,y+h+4,z-d*.25,2,6,2,'#958d80');
  if(mountain){item(x,y+4,z+d/2+2,w+2,.5,4,'#8d7661');for(let k=-2;k<=2;k++)item(x+k*w/5,y+5,z+d/2+3.7,.3,2,.3,'#8d7661');}
  const tx=x+w/2+6,tz=z-5,ty=ground(tx,tz);item(tx,ty+2,tz,.7,4,.7,'#7d7960');item(tx,ty+5,tz,3,6,3,mountain?'#648776':'#8aa373','cone');
  for(let k=0;k<3;k++){const px=x-w/2+k*5,pz=z+d/2+5;item(px,ground(px,pz)+.5,pz,3,1,2,'#8e9e71');}
  obstacle(x,z,w+4,d+5,y+h+6);houses++;return true;
 }
 const centres=mountain?(r.id==='alpine'?[[-510,-80],[150,180],[-500,550]]:r.id==='peaks'?[[-200,0],[430,380]]:[[-520,100],[150,500]]):[[-610,-320],[-630,480],[50,950]];
 if(mountain)for(const [cx,cz]of centres)for(let row=0;row<7;row++)for(let col=0;col<6;col++){
  if(row===3&&col===3)continue;const x=cx+(col-2.5)*42+Math.sin(row*1.7)*9,z=cz+(row-3)*48+Math.cos(col*1.4)*7;
  house(x,z,row*6+col,17+rand(row*7+col)*6,22,7+(row%3)*2);
 }
 if(!mountain)for(let row=0;row<36;row++)for(let col=0;col<25;col++){const i=row*25+col,x=-1080+col*88+Math.sin(row*1.4)*12,z=-1470+row*84+Math.cos(col)*10;if(windFarmReserved(x,z,22))continue;house(x,z,i,16+rand(i+900)*9,21+rand(i+1100)*7,6+rand(i+1200)*5);}
 // Village centres: inn, bakery awnings, fountain and benches.
 for(const [cx,cz]of centres){const y=ground(cx,cz);if(!clear(cx,cz,170))continue;
  if(house(cx,cz,2,28,30,13)){item(cx,y+4,cz+18,30,1,7,'#b99b71');item(cx+32,ground(cx+32,cz)+1,cz,5,2,5,'#b5c0b3','cylinder');item(cx+32,ground(cx+32,cz)+2.1,cz,4,.2,4,'#6eafb4','cylinder');}
 }
 if(!mountain)for(const [cx,cz]of WIND_FARMS){
  if(!house(cx,cz,farms,30,38,12))continue;farms++;
  const y=ground(cx+28,cz);item(cx+28,y+10,cz,6,20,6,'#b6c1b6','cylinder');item(cx+28,y+22,cz,7,4,7,'#8a9995','cone');obstacle(cx+28,cz,14,14,y+24);
  // Tiled planted plots follow uneven land, without large floating flat planes.
  for(let row=0;row<12;row++)for(let col=0;col<10;col++){const x=cx-60+col*12,z=cz+55+row*10;if(!clear(x,z,160)||ground(x,z)<4||regionRadius(r,r.x+x,r.z+z)>.92||windAmenityReserved(x,z,15)||windTurbineReserved(x,z,5))continue;const h=ground(x,z);item(x,h+.25,z,10,.5,8,row%3?'#a9b56d':'#b9a36d');item(x,h+.8,z,8,.7,1.2,'#7f985b');}
  for(let k=0;k<8;k++){const x=cx-60+k*17,z=cz+180,h=ground(x,z);item(x,h+1.5,z,.6,3,.6,'#dfd0ae');item(x+8,h+1.5,z,16,.3,.4,'#dfd0ae');}
  for(let k=0;k<4;k++){const x=cx-30+k*13,z=cz-35,h=ground(x,z);item(x,h+2,z,2,4,2,'#c7b477','cylinder');}
 }
 (world.settlementInfo??={})[r.id]={houses,farms};
}
