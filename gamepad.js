// W3C Standard Gamepad mapping. Never guess raw vendor-specific button indices.
export const padFamily=id=>/xbox|xinput|045e|microsoft/i.test(id)?'xbox':/dualsense|dualshock|playstation|wireless controller|054c|sony/i.test(id)?'playstation':'generic';
export const padLabels=family=>family==='playstation'?{action:'×',brake:'○',gear:'□',camera:'△',left:'L1',right:'R1',less:'L2',more:'R2',pause:'OPTIONS',restart:'CREATE/SHARE',gun:'L3',missile:'R3'}:{action:'A',brake:'B',gear:'X',camera:'Y',left:'LB',right:'RB',less:'LT',more:'RT',pause:'MENU',restart:'VIEW',gun:'LS↓',missile:'RS↓'};
export const deadzone=(v,d=.16)=>Number.isFinite(v)&&Math.abs(v)>d?Math.sign(v)*Math.min(1,(Math.abs(v)-d)/(1-d)):0;
const empty=()=>({pitch:0,roll:0,yaw:0,power:0,gun:false,missile:false,actionDown:false,brake:false,lookX:0,lookY:0,trim:0,trimReset:false});
const presses=[['context',0],['gear',2],['camera',3],['restart',8],['pause',9],['missile',11],['flap',12],['hook',13],['smoke',14],['map',15]];
export class GamepadInput{
 constructor({getPads=()=>navigator.getGamepads?.()||[],dispatch=()=>{},disconnect=()=>{}}={}){this.getPads=getPads;this.dispatch=dispatch;this.disconnect=disconnect;this.index=null;this.previous=[];this.ready=false;this.lookMode=false;this.family='generic';this.connected=false;this.unsupported=false;this.repeat=0;this.direction=null;}
 poll(dt,state={}){
  let all;try{all=Array.from(this.getPads()||[]).filter(p=>p?.connected!==false&&p);}catch{all=[];}
  const supported=all.filter(p=>p.mapping==='standard');this.unsupported=!!all.length&&!supported.length;
  const previous=supported.find(p=>p.index===this.index),pad=previous||supported[0];
  if(!pad){if(this.connected)this.disconnect();this.connected=false;this.index=null;this.ready=false;this.previous=[];return empty();}
  const changed=!this.connected||this.index!==pad.index||this.deviceId!==pad.id;if(changed){if(this.connected)this.disconnect();this.index=pad.index;this.deviceId=pad.id;this.ready=false;this.previous=[];this.direction=null;this.repeat=0;}
  this.connected=true;this.family=padFamily(pad.id);this.name=this.family==='playstation'?'PlayStation':this.family==='xbox'?'Xbox':'Controle';
  const value=i=>Math.max(0,Math.min(1,pad.buttons[i]?.value??(pad.buttons[i]?.pressed?1:0))),down=i=>value(i)>.5;
  const now=Array.from({length:17},(_,i)=>down(i));const ax=pad.axes.map(v=>deadzone(v));
  if(state.blocked){this.ready=false;this.previous=now;this._before=now.slice();return empty();}
  // Neutral once after connection/focus return avoids held buttons launching or restarting a flight.
  if(!this.ready){this.previous=now;this._before=now.slice();if(!now.some(Boolean)&&ax.every(v=>v===0))this.ready=true;return empty();}
  const before=this._before||[];this._before=now.slice();const rose=i=>now[i]&&!before[i];
  if(changed)this._before=now.slice();
  if(state.menu){this.lookMode=false;
   let direction=down(12)||ax[1]<-.55?'up':down(13)||ax[1]>.55?'down':down(14)||ax[0]<-.55?'left':down(15)||ax[0]>.55?'right':null;
   if(!direction&&({up:ax[1]<-.35,down:ax[1]>.35,left:ax[0]<-.35,right:ax[0]>.35})[this.direction])direction=this.direction;
   this.repeat-=dt;if(direction&&(direction!==this.direction||this.repeat<=0)){this.dispatch('navigate',direction);this.repeat=direction===this.direction ? .24 : .45;}this.direction=direction;
   if(rose(0))this.dispatch('confirm');if(rose(1))this.dispatch('back');if(rose(9))this.dispatch('pause');return empty();
  }
  const trimming=down(4)&&down(5);if(rose(3)&&trimming)this.dispatch('hideControls');else if(rose(3)&&down(4)){this.lookMode=!this.lookMode;this.dispatch('orbit',this.lookMode);}this.direction=null;for(const [action,index]of presses)if(!(index===3&&down(4))&&!(trimming&&[12,13,14].includes(index))&&rose(index))this.dispatch(action);
  return {pitch:this.lookMode?0:ax[1]||0,roll:this.lookMode?0:ax[0]||0,yaw:trimming||this.lookMode?0:value(5)-value(4),trim:trimming?(+down(12)-down(13)):0,trimReset:trimming&&rose(14),power:value(7)-value(6),gun:down(10),missile:false,actionDown:down(0),brake:down(1),lookX:this.lookMode?ax[0]||0:ax[2]||0,lookY:this.lookMode?ax[1]||0:ax[3]||0};
 }
}
const menuFocus=new WeakMap();let lastMenu=null;
export function syncPadMenu(){
 const root=['options-settings','letterman-editor','modal','space-end','challenge-settings','flight-settings','career-board','menu'].map(id=>document.getElementById(id)).find(e=>e&&!e.hidden&&e.getClientRects().length)||document.querySelector('#space-mission');
 if(!root)return null;
 if(root!==lastMenu){if(lastMenu?.contains(document.activeElement))menuFocus.set(lastMenu,document.activeElement);const saved=menuFocus.get(root);if(saved?.isConnected&&saved.getClientRects().length)saved.focus({preventScroll:true});else root.querySelector('button:not([disabled]),select:not([disabled]),input:not([disabled])')?.focus({preventScroll:true});lastMenu=root;}return root;
}
export function navigatePadMenu(direction){
 const root=syncPadMenu();if(!root)return;
 const items=[...root.querySelectorAll('button,select,input')].filter(e=>!e.disabled&&e.getClientRects().length);if(!items.length)return;
 let index=items.indexOf(document.activeElement),current=items[index];
 if((direction==='left'||direction==='right')&&current?.matches('select,input[type=range],input[type=number]')){const step=direction==='left'?-1:1;if(current.tagName==='SELECT')current.selectedIndex=Math.max(0,Math.min(current.options.length-1,current.selectedIndex+step));else current.value=Math.max(+current.min||0,Math.min(+current.max||100,+current.value+step*(+current.step||1)));current.dispatchEvent(new Event('input',{bubbles:true}));current.dispatchEvent(new Event('change',{bubbles:true}));return;}
 if(direction==='confirm'){if(!current){items[0].focus();return;}if(current.tagName==='BUTTON')current.click();return;}
 index=index<0?0:(index+(direction==='up'||direction==='left'?-1:1)+items.length)%items.length;items[index].focus({preventScroll:true});items[index].scrollIntoView({block:'nearest'});
}
