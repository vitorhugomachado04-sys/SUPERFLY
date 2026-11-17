const main=[
 ['school','01 · Primeiro circuito','school','school','cessna','clear',12,'circuit','Siga o plano no GPS: suba, complete quatro arcos, explore a Enseada e retorne ao aeroporto.'],
 ['winds','02 · Entrega aos Ventos','school','wind','cessna','coastal',11,null,'Leve a primeira entrega à pista costeira e corrija as rajadas.'],
 ['fog','03 · Manhã na metrópole','wind','city','cessna','fog',7,null,'Siga as luzes de aproximação e entregue a carga na metrópole.'],
 ['storm','04 · Frente de tempestade','city','alpine','cessna','storm',16,null,'Cruze a frente e pouse na pista curta e inclinada da base alpina.'],
 ['peaks','05 · Medicamentos entre picos','alpine','peak','cessna','snow',16,null,'Leve os medicamentos ao posto entre as montanhas.'],
 ['aurora','06 · Nevasca e aurora','peak','snow','cessna','blizzard',21,null,'Atravesse a neve e encontre a pista iluminada sob a aurora.'],
 ['desert','07 · Travessia do deserto','snow','base','boeing','dust',17,null,'Assuma o Superfly Horizon em solo e leve a equipe à Base Horizonte.'],
 ['carrier','08 · Regresso à frota','base','carrier','naval','partial',16,'intercept','Intercepte o drone cargueiro fictício e pouse no PAN-01 com gancho e cabos.']
];
const extras=[
 ['turbines','Inspeção das turbinas','wind','wind','cessna','partial',12,'inspection','Passe pelos três pontos de inspeção e retorne à pista costeira.','winds'],
 ['heli','Entre prédios','city','city-heli','r22','partial',9,'heli','Recolha a encomenda na Torre Porto, entregue no Hospital e pouse no heliponto do Aeroporto Metrópole.','fog'],
 ['gear','Trem e picape','city','city','executive','clear',14,'gear','Um trem de pouso travou. Acompanhe a picape em movimento para o mecânico destravar; depois siga os arcos, dê a volta e pouse.','fog'],
 ['lito','Homenagem ao Lito · Carga vital','city','city','executive','storm',23,'urgent','Decole da Metrópole, pouse e pare na Ilha dos Ventos para recolher a carga vital e volte à Metrópole em 12 minutos. Homenagem fictícia à aviação.','fog'],
 ['birds','Bird strike · Retorno do Superfly Atlas','city','city','skycourier','partial',10,'birds','Enfrente a perda de um motor, isole a pane e retorne à metrópole.','fog'],
 ['supplies','Suprimentos nas montanhas','alpine','alpine','cessna','partial',14,'supply','Sobrevoe a zona, lance os suprimentos com X e retorne à base alpina.','storm'],
 ['cable-rescue','Busca no teleférico','peak','resort','h145','snow',15,'rescue','Localize o posto do teleférico, mantenha o pairado e leve a equipe ao resort.','peaks'],
 ['escort','Escolta na nevasca','snow','snow','cessna','blizzard',20,'escort','Encontre a aeronave e acompanhe-a até a área de melhor visibilidade; depois pouse.','aurora'],
 ['jump','Paraquedistas nas dunas','base','base','skycourier','clear',16,'jump','Leve o grupo à zona, estabilize, libere com X e retorne à Base Horizonte.','desert'],
 ['canyons','Correio dos cânions','base','dunes','cessna','clear',15,null,'Leve o correio ao pequeno campo de terra. A viagem principal continua na Base Horizonte.','desert']
];
export const MAIN_IDS=main.map(m=>m[0]);
const make=(row,extra=false,index=0)=>{const [id,name,from,to,aircraft,weather,hour,special,objective,dep]=row;return{id,name,from,to,aircraft,weather,hour,special,kind:extra?'extra':'main',dependencies:extra?[dep]:index?[main[index-1][0]]:[],objectives:[objective],completion:{type:'landing',airport:to,maxGroundSpeed:2,holdSeconds:2,requiresSpecial:!!special,requiresCable:to==='carrier'},cover:`./${id}.jpg`,status:'playable',radio:`Lia · Operações Panorama: ${objective}`};};
export const MISSIONS=[...main.map((r,i)=>make(r,false,i)),...extras.map(r=>make(r,true))];
const pending=[
 ['levee','Pouso no dique','fog','boeing','city','city','Dique com superfície de pouso e cenário próprio.'],
 ['raceway','A antiga pista de corrida','desert','boeing','base','base','Autódromo convertido em pista, com aproximação e obstáculos.'],
 ['river','Pouso no rio','fog','boeing','city','city','Amerissagem controlada, flutuação e resgate; hoje a água encerra o voo.'],
 ['hydraulics','Pane hidráulica','desert','boeing','base','base','Falha hidráulica e controle por empuxo diferencial.'],
 ['four-engine','Retorno do quadrimotor','desert',null,'base','base','Aeronave quadrimotora e simulação independente dos quatro motores.'],
 ['windscreen','Perda do para-brisa','fog','executive','city','city','Dano de cabine, despressurização e objetivo de descida de emergência.'],
 ['fuselage','Dano na fuselagem','desert','boeing','base','base','Dano estrutural visual e efeitos aerodinâmicos próprios.']
];
export const PENDING_MISSIONS=pending.map(([id,name,dep,aircraft,from,to,reason])=>({id,name,kind:'extra',dependencies:[dep],aircraft,from,to,objectives:[reason],completion:{type:'custom',implemented:false},cover:`./${id}.svg`,status:'planned',reason}));
export const CATALOG=[...MISSIONS,...PENDING_MISSIONS];
