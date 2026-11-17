import {padLabels} from './gamepad.js?v=04.44';
export class GamepadUI{
 constructor(){this.sources=new WeakMap();this.root=document.createElement('aside');this.root.id='gamepad-help';this.root.setAttribute('aria-label','Comandos do controle');document.body.append(this.root);this.last='';}
 update(pad,menu=false){
  this.root.hidden=!pad.connected&&!pad.unsupported&&!menu;const l=padLabels(pad.family),signature=[pad.connected,pad.family,pad.ready,pad.unsupported,menu,pad.lookMode].join(':');
  document.body.classList.toggle('gamepad-connected',pad.connected);
  if(signature!==this.last){this.last=signature;this.root.replaceChildren();const title=document.createElement('strong');title.textContent=pad.connected?`${pad.name} conectado${pad.ready?'':' · solte os botões'}`:pad.unsupported?'Controle sem mapeamento padrão · use teclado ou modo XInput':'Xbox / PlayStation · conecte e pressione um botão';this.root.append(title);
   if(pad.connected){const pairs=menu?[[l.action,'selecionar'],[l.brake,'voltar'],['✚ / LS','navegar'],['← →','alterar opção']]:[['LS',pad.lookMode?'orbitar câmera':'pilotar'],[`${l.less}/${l.more}`,'potência'],[`${l.left}/${l.right}`,'leme'],['RS','olhar'],[l.action,'ação'],[l.brake,'frear'],[l.gear,'trem'],[`${l.left}+${l.right}+✚ ↑/↓`,'trim'],[`${l.left}+${l.right}+✚ ←`,'zerar trim'],[l.camera,'câmera'],[`${l.left}+${l.camera}`,'órbita / voo'],[`${l.left}+${l.right}+${l.camera}`,'Hide / Show Controls'],['✚ ↑','flaps'],['✚ ↓','gancho'],['✚ ←','fumaça'],['✚ →','mapa'],[l.gun,'tiros'],[l.missile,'míssil'],[l.pause,'pausa'],[l.restart,'reiniciar']];for(const [button,action]of pairs){const item=document.createElement('span'),key=document.createElement('kbd');key.textContent=button;item.append(key,document.createTextNode(action));this.root.append(item);}}
  }
  // UI producers rebuild these labels every frame. Preserve their latest keyboard source for disconnect.
  const roots=document.querySelectorAll('#hud,#space-mission,#modal,#show-controls');
  for(const root of roots){const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode()){if(node.parentElement?.id==='space-offset')continue;const text=node.nodeValue,old=this.sources.get(node),source=old&&text===old.output?old.source:text;let output=source;
    if(pad.connected){output=output.replace(/SETAS(?: ATITUDE| DESLOCAMENTO| para mover|: JATOS DE MANOBRA)?/gi,'ANALÓGICO ESQUERDO').replace(/W\/S/g,`${l.less}/${l.more}`).replace(/Q\/E/g,`${l.left}/${l.right}`).replace(/ESPAÇO|espaço/g,l.brake).replace(/MOUSE DIREITO(?: \+ ARRASTAR)?: OLHAR|MOUSE DIREITO: OLHAR/g,'ANALÓGICO DIREITO: OLHAR').replace(/ · ([XCGHFRMVJKUO])\b/g,(_,key)=>' · '+({X:l.action,C:l.camera,G:l.gear,H:'✚ ↓',F:'✚ ↑',R:l.restart,M:'✚ →',V:'✚ ←',J:l.gun,K:l.missile,U:`${l.left}+${l.right}+${l.camera}`,O:`${l.left}+${l.camera}`}[key])).replace(/\b([XCR]) (?=ou toque|para|abre|volta|alterna|reinicia|reinicie|repete|retorna|retoma|checkpoint)/gi,(_,key)=>({X:l.action,C:l.camera,R:l.restart}[key.toUpperCase()])+' ').replace(/\b([GFH]) (?=trem|flaps|gancho)/gi,(_,key)=>({G:l.gear,F:'✚ ↑',H:'✚ ↓'}[key.toUpperCase()])+' ').replace(/com X\b/g,'com '+l.action);}
    if(output!==text)node.nodeValue=output;this.sources.set(node,{source,output});
  }}
 }
}
