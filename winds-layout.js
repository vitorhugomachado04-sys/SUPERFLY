export const WIND_PLACES={spaceport:{x:850,z:950,w:230,d:230},football:{x:-650,z:70,w:100,d:135},tennis:{x:-620,z:850,w:90,d:58},heli:{x:100,z:-300,w:100,d:110},church:{x:-800,z:-650,w:95,d:120}};
export const WIND_FARMS=[[-730,-1030],[30,-1050],[-800,1100],[180,550],[490,850],[530,-1450],[-950,300],[80,1250]];
export function windAmenityReserved(x,z,margin=0){return Object.values(WIND_PLACES).some(p=>Math.abs(x-p.x)<p.w/2+margin&&Math.abs(z-p.z)<p.d/2+margin);}
export function windFarmReserved(x,z,margin=0){return WIND_FARMS.some(([cx,cz])=>Math.abs(x-cx)<90+margin&&z>cz-60-margin&&z<cz+195+margin);}
export function windTurbineReserved(x,z,margin=0){if(x>270-margin&&x<860+margin&&z>-1170-margin&&z<640+margin)return true;return Array.from({length:14},(_,i)=>[380+i%3*185,-1050+Math.floor(i/3)*380]).some(([cx,cz])=>Math.hypot(x-cx,z-cz)<40+margin);}
