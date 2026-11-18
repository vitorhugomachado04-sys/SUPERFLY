import {legendFleet} from './legend-fleet.js?v=04.53';
// Arcade tuning, not certified performance data.
const common={gravity:9.81,step:1/120,drag:.032,induced:.055,liftSlope:4.7,stallAngle:.29,pitchMin:-.35,pitchMax:.55,pitchResponse:.55,pitchDamping:3.2,pitchTrim:.05,neutralAssist:.85,overspeedStart:55,overspeedDrag:.0006,rollResponse:1.5,rollDamping:3.5,controlSpeed:26,thrustFalloff:115,groundSteering:.35,groundPitchRelax:1.4,maxSink:6.5,flapLift:.24,flapDrag:.026,retractable:false,gearSeconds:0,gearDrag:0,belly:.5,halfSpan:5,wingY:1.5,length:6.3,wheelTrack:1.1,wheelZ:.3,cameraDistance:18,cameraHeight:6,cabinY:1.05,cabinZ:1.6,rotationSpeed:25,approachSpeed:27,engine:'prop'};
export const C152={...common,id:'cessna',name:'Cessna 152',short:'CESSNA',description:'Leve e dócil · Hélice · Trem fixo',mass:650,wing:16.2,thrust:2100,gear:1.18};
export const FLEET=[C152,
 {...common,id:'boeing',name:'Boeing 737',short:'BOEING 737',description:'Pesado e estável · Dois turbofans · Trem retrátil',mass:32000,wing:125,thrust:130000,gear:3.5,belly:1.8,halfSpan:17,wingY:-.3,length:36,wheelTrack:3.7,wheelZ:2.3,retractable:true,gearSeconds:4.5,groundPitchRelax:.45,gearDrag:.018,rollResponse:.72,rollDamping:4.2,pitchResponse:.42,pitchDamping:3.9,controlSpeed:60,thrustFalloff:360,overspeedStart:155,overspeedDrag:.000035,groundSteering:.16,maxSink:5.5,flapLift:.32,flapDrag:.035,cameraDistance:70,cameraHeight:22,cabinY:1.5,cabinZ:14,rotationSpeed:58,approachSpeed:66,engine:'airliner'},
 {...common,id:'executive',name:'Panorama Jet',short:'JATINHO',description:'Executivo ágil · Motores traseiros · Trem retrátil',mass:5600,wing:32,thrust:25000,gear:1.8,belly:.85,halfSpan:7.4,wingY:-.15,length:15,wheelTrack:1.9,wheelZ:1.1,retractable:true,gearSeconds:3,groundPitchRelax:.55,gearDrag:.018,rollResponse:1.6,pitchResponse:.6,controlSpeed:44,thrustFalloff:280,overspeedStart:125,overspeedDrag:.00006,groundSteering:.24,flapLift:.28,cameraDistance:34,cameraHeight:11,cabinY:.8,cabinZ:5.2,rotationSpeed:44,approachSpeed:48,engine:'jet'},
 {...common,id:'fighter',name:'Panorama Falcon',short:'CAÇA',description:'Rápido e responsivo · Asa enflechada · Trem retrátil',mass:8500,wing:38,thrust:65000,gear:1.75,belly:.75,halfSpan:5.2,wingY:0,length:15.5,wheelTrack:1.55,wheelZ:1.2,retractable:true,gearSeconds:2.5,groundPitchRelax:.6,gearDrag:.025,rollResponse:2.8,rollDamping:3,pitchResponse:.8,pitchDamping:3.1,pitchMax:.65,controlSpeed:52,thrustFalloff:440,overspeedStart:225,overspeedDrag:.000012,groundSteering:.27,flapLift:.28,cameraDistance:34,cameraHeight:10,cabinY:1,cabinZ:3.4,rotationSpeed:52,approachSpeed:55,engine:'fighter'}
];
export const getAircraft=id=>FLEET.find(c=>c.id===((id==='transport'||id==='twin'||id==='caravan')?'skycourier':id==='agusta'?'bell407':id))||C152;
const propBase={...common,mass:950,wing:24,thrust:4200,gear:1.4,belly:.6,halfSpan:6,length:8,wheelTrack:1.4,wheelZ:.5,cameraDistance:23,cameraHeight:8,rotationSpeed:22,approachSpeed:26,overspeedStart:65,groundPitchRelax:.9,rollArcade:3.5,engine:'prop'};
FLEET.push(
 {...propBase,id:'skycourier',name:'Cargo',short:'CARGO',description:'Cargueiro de asa alta · Cabine larga · Dois motores independentes',twin:true,mass:4800,wing:52,thrust:22000,halfSpan:11,length:16,gear:2.5,wingY:1.7,wheelTrack:2.8,cameraDistance:42,cameraHeight:12,rotationSpeed:35,approachSpeed:39,overspeedStart:105,thrustFalloff:230,groundPitchRelax:.6,rollResponse:1,rollArcade:2,asymmetricRoll:1.25,asymmetricYaw:.16},
 {...propBase,id:'r22',name:'Robinson R22',short:'R22',description:'Helicóptero leve · Pairado assistido',helicopter:true,mass:620,gear:1.1,halfSpan:4,length:6,cameraDistance:18,cameraHeight:6,heliSpeed:25,heliResponse:.7,collective:14,yawRate:.9,engine:'heli',maxSink:3.8},
 {...propBase,id:'bell47',name:'Bell 47',short:'BELL 47',description:'Bolha clássica · Mais inércia · Pairado assistido',helicopter:true,mass:1100,gear:1.35,halfSpan:5,length:8,cameraDistance:22,cameraHeight:7,heliSpeed:22,heliResponse:.5,collective:12,yawRate:.65,engine:'heli',maxSink:4}
);

FLEET.push({...FLEET.find(c=>c.id==='fighter'),id:'naval',name:'Panorama Hornet',short:'CAÇA NAVAL',description:'Naval · Duas derivas · Gancho de cauda',naval:true,mass:9800,wing:48,thrust:88000,controlSpeed:42,rotationSpeed:42,approachSpeed:48,maxSink:8,flapLift:.4,flapDrag:.035,rollResponse:2.2,gear:1.95});


for(const spec of [{id:'h145',name:'Airbus H145',short:'H145',description:'Executivo · Cinco pás · Rotor de cauda carenado',mass:3700,gear:1.65,halfSpan:5.6,length:11,cameraDistance:31,heliSpeed:40},{id:'bell407',name:'Bell 407',short:'BELL 407',description:'Executivo · Quatro pás · Cauda convencional',mass:2300,gear:1.5,halfSpan:5.6,length:11,cameraDistance:28,heliSpeed:38}])FLEET.push({...FLEET.find(c=>c.id==='bell47'),...spec,cameraHeight:9,heliResponse:.6,collective:15,yawRate:.65});

FLEET.push({...common,id:'aerobatic',name:'Panorama Acro',short:'ACRO',description:'Acrobático · Asa baixa · Fumaça roxa · V liga/desliga',aerobatic:true,mass:620,wing:11.5,thrust:3900,gear:1.2,halfSpan:3.9,wingY:.05,length:6.3,wheelTrack:.95,wheelZ:-.8,rotationSpeed:24,approachSpeed:29,rollResponse:3.6,rollArcade:4.5,rollDamping:2.7,pitchResponse:1.25,pitchDamping:2.8,pitchMin:-.8,pitchMax:1.15,neutralAssist:.5,controlSpeed:25,overspeedStart:85,overspeedDrag:.00012,thrustFalloff:160,cameraDistance:20,cameraHeight:6});

// Mission capabilities are data, so new drop missions can reuse the same controls.
FLEET.find(c=>c.id==='skycourier').parachutists=true;
FLEET.filter(c=>c.helicopter).forEach(c=>c.parachutists=true);
FLEET.push(
 {...C152,id:'c152-floats',name:'Cessna 152 com flutuadores',short:'C152 FLOAT',floats:true,amphibious:true,waterGear:1.65,gear:1.95,drag:.038,description:'Anfíbio · Rodas para pista e flutuadores para água'},
 {...C152,id:'ask21',name:'Schleicher ASK 21',short:'ASK 21',glider:true,engine:'glider',thrust:0,mass:580,wing:17.95,halfSpan:8.5,length:8.35,gear:.6,drag:.013,induced:.025,flapDrag:.06,rotationSpeed:19,approachSpeed:25,cameraDistance:26,description:'Planador tandem · Reboque e voo sem motor'},
 {...FLEET.find(c=>c.id==='bell407'),id:'bell412',name:'Bell 412',short:'BELL 412',mass:4800,gear:1.8,length:13,halfSpan:7,heliSpeed:32,cameraDistance:35,description:'Utilitário bimotor · Quatro pás · Guincho de resgate'}
);

export const FLEET_NAMES={cessna:'Brisa',boeing:'Horizon',executive:'Velar',fighter:'Vetor',skycourier:'Atlas',r22:'Libélula',bell47:'Bolha',naval:'Corsário',h145:'Nimbo',bell407:'Vento',aerobatic:'Faísca','c152-floats':'Maré',ask21:'Pluma',bell412:'Guardião'};
for(const c of FLEET){c.referenceName=c.name;c.name='Superfly '+FLEET_NAMES[c.id];c.short=c.name.toUpperCase();}

FLEET.push(...legendFleet(common));
