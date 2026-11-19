import {VHSFilter} from './vhs.js?v=04.55';
import {GameBoyFilter} from './gameboy.js?v=04.55';
import {RetroFilters,NEW_FILTERS} from './retro-filters.js?v=04.55';
export const FILTERS=[['off','ORIGINAL',''],['dmg','Game Boy DMG','RETRO GAMING'],['gbc','Game Boy Color','RETRO GAMING'],['virtualboy','Virtual Boy','RETRO GAMING'],['macintosh','Macintosh 1984','RETRO GAMING'],['vhs','VHS / CRT','ANALOG & CINEMA'],['film35','35mm Film','ANALOG & CINEMA'],['super8','Super 8','ANALOG & CINEMA'],['camcorder','Camcorder 2000','ANALOG & CINEMA'],['nightvision','Night Vision','EXPERIMENTAL'],['ascii','ASCII','EXPERIMENTAL'],['synthwave','Synthwave','EXPERIMENTAL']];
const defaults=()=>({mode:'camcorder',intensity:1,asciiMode:'green',dither:true,interlace:false,cadence:false,overlay:false});
export class VisualFilters{
 constructor(storage=globalThis.localStorage){this.storage=storage;this.settings=defaults();this.vhs=new VHSFilter();this.dmg=new GameBoyFilter();this.retro=new RetroFilters();try{this.configure(JSON.parse(storage?.getItem('superfly-visual-filters')||'{}'));}catch{}this.error='';}
 get mode(){return this.settings.mode;}
 configure(value={}){const v=value||{};if(FILTERS.some(f=>f[0]===v.mode))this.settings.mode=v.mode;if(Number.isFinite(v.intensity))this.settings.intensity=Math.max(0,Math.min(1,v.intensity));if(['green','mono','color'].includes(v.asciiMode))this.settings.asciiMode=v.asciiMode;for(const k of ['dither','interlace','cadence','overlay'])if(typeof v[k]==='boolean')this.settings[k]=v[k];this.vhs.enabled=this.mode==='vhs';this.dmg.enabled=this.mode==='dmg';}
 save(){try{this.storage?.setItem('superfly-visual-filters',JSON.stringify(this.settings));return true;}catch{return false;}}
 toggle(mode){if(!FILTERS.some(f=>f[0]===mode))return false;this.configure({mode:this.mode===mode?'off':mode});this.save();return this.mode===mode;}
 prepare(renderer){try{this.retro.init(renderer);}catch(e){this.retroUnavailable=true;this.error='Este dispositivo não suporta os filtros novos.';}}
 render(renderer,scene,camera,time){try{if(this.settings.intensity===0||this.mode==='off')renderer.render(scene,camera);else if(NEW_FILTERS.includes(this.mode)){if(this.retroUnavailable)throw Error('unsupported');this.retro.render(renderer,scene,camera,time,this.settings);}else (this.dmg.enabled?this.dmg:this.vhs).render(renderer,scene,camera,time);}catch(e){this.error='Filtro indisponível neste dispositivo. Visual original restaurado.';this.configure({mode:'off'});renderer.render(scene,camera);}}
}
