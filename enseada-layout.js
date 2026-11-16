export const ENSEADA_PLACES={football:{x:-650,z:-100,w:360,d:400},centre:{x:590,z:-650,w:440,d:450},golf:{x:-850,z:1510,w:660,d:440},park:{x:950,z:40,w:340,d:300}};
export function enseadaReserved(x,z,margin=0){return Object.values(ENSEADA_PLACES).some(p=>Math.abs(x-p.x)<p.w/2+margin&&Math.abs(z-p.z)<p.d/2+margin);}
