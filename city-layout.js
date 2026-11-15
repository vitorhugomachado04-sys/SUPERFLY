// Local metres around the metropolis. Shared by scenery and clearance tests.
export const CITY_PLACES={
 park:{x:700,z:850,w:650,d:660},
 golf:{x:150,z:-1470,w:690,d:650},
 stadium:{x:1280,z:-650,w:400,d:420},
 airport:{x:-1050,z:0,w:640,d:2500},
 signature:{x:350,z:-350,w:210,d:220},
 hotel:{x:1250,z:150,w:220,d:220},
 civic:{x:100,z:950,w:240,d:210}
};
export const intersects=(x,z,w,d,p,margin=0)=>Math.abs(x-p.x)<(w+p.w)/2+margin&&Math.abs(z-p.z)<(d+p.d)/2+margin;
export function approachCorridor(x,z,margin=0){return Math.abs(x+1050)<210+margin;}
export function residentialBelt(x,z){return Math.abs(z)>1250&&Math.abs(x+1050)<540;}
export function cityLotAllowed(x,z,w,d){return !approachCorridor(x,z,w/2)&&!residentialBelt(x,z)&&!Object.values(CITY_PLACES).some(p=>intersects(x,z,w,d,p,14));}
