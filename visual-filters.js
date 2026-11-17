import {VHSFilter} from './vhs.js?v=04.44';
import {GameBoyFilter} from './gameboy.js?v=04.44';

export class VisualFilters {
 constructor(){this.mode='off';this.vhs=new VHSFilter();this.dmg=new GameBoyFilter();}
 toggle(mode){
  if(!['vhs','dmg'].includes(mode))return false;
  this.mode=this.mode===mode?'off':mode;
  this.vhs.enabled=this.mode==='vhs';this.dmg.enabled=this.mode==='dmg';
  return this.mode===mode;
 }
 render(renderer,scene,camera,time){(this.dmg.enabled?this.dmg:this.vhs).render(renderer,scene,camera,time);}
}
