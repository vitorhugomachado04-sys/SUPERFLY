import {exportSave,parseSave,loadBackup,importProgress,describeSave,MAX_SAVE_BYTES} from './save-game.js?v=04.53';
import {navigatePadMenu,syncPadMenu} from './gamepad.js?v=04.53';
export class SaveMenu{
 constructor(career,onLoaded){
  this.career=career;this.onLoaded=onLoaded;this.root=document.getElementById('save-menu');this.pending=null;this.request=0;
  this.el('close').onclick=()=>this.close();this.el('export').onclick=()=>this.download();
  this.el('now').onclick=()=>{const ok=career.save();this.refresh();this.message(ok?'Carreira e último checkpoint salvos neste navegador.':'Não foi possível salvar neste navegador. Baixe um arquivo para guardar o progresso.');};
  this.el('import').onclick=()=>{this.el('file').value='';this.el('file').click();};
  this.el('file').onchange=()=>this.readFile(this.el('file').files?.[0]);
  this.el('backup').onclick=()=>{try{const backup=loadBackup(career);if(!backup)throw Error('Nenhum backup disponível.');this.preview(backup,'Backup anterior');}catch(e){this.message(e.message);}};
  this.el('cancel').onclick=()=>this.cancel();this.el('confirm').onclick=()=>this.confirm();
  window.addEventListener('keydown',e=>{if(!this.isOpen)return;e.stopImmediatePropagation();if(e.code==='Escape'){e.preventDefault();this.close();}else if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){e.preventDefault();navigatePadMenu(({ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'})[e.code]);}},true);
 }
 el(id){return document.getElementById('save-'+id);}
 get isOpen(){return !this.root.hidden;}
 message(text){this.el('status').textContent=text;}
 summary(node,p,exportedAt){const s=describeSave(p);node.replaceChildren();for(const text of [s.mission,`${s.completed} missões concluídas · ${s.checkpoint?'checkpoint disponível':'partida no aeroporto'}`,`Salvo: ${s.date}`,exportedAt?`Arquivo exportado: ${new Date(exportedAt).toLocaleString('pt-BR')}`:'']){if(!text)continue;const line=document.createElement('p');line.textContent=text;node.append(line);}}
 refresh(){this.summary(this.el('current'),this.career.progress);try{this.el('backup').disabled=!loadBackup(this.career);}catch{this.el('backup').disabled=true;}}
 open(){if(this.isOpen)return;this.returnFocus=document.activeElement;this.request++;this.pending=null;this.el('preview').hidden=true;this.el('actions').hidden=false;this.message('');this.refresh();this.root.hidden=false;
  this.inert=[...document.body.children].filter(e=>e!==this.root).map(e=>[e,e.inert]);for(const [e]of this.inert)e.inert=true;
  this.el('now').focus();syncPadMenu();
 }
 close(focus=true){if(!this.isOpen)return;if(this.pending&&focus){this.cancel();return;}this.request++;this.pending=null;this.root.hidden=true;for(const [e,was]of this.inert||[])e.inert=was;this.inert=[];if(focus&&this.returnFocus?.isConnected)this.returnFocus.focus();}
 cancel(){this.request++;this.pending=null;this.el('preview').hidden=true;this.el('actions').hidden=false;this.message('Carregamento cancelado. Seu progresso foi mantido.');this.el('import').focus();}
 async readFile(file){if(!file)return;const request=++this.request;this.pending=null;this.el('preview').hidden=true;this.el('actions').hidden=false;
  try{if(file.size>MAX_SAVE_BYTES)throw Error('Arquivo muito grande. Escolha um save do Superfly de até 1 MB.');const text=await file.text();if(request!==this.request||!this.isOpen)return;this.preview(parseSave(text),file.name);}
  catch(e){if(request===this.request&&this.isOpen)this.message(e.message||'Não foi possível ler o arquivo.');}
 }
 preview(save,name){this.pending=save;this.el('filename').textContent=name;this.summary(this.el('incoming'),save.progress,save.exportedAt);this.el('actions').hidden=true;this.el('preview').hidden=false;this.message('');this.el('cancel').focus();}
 confirm(){if(!this.pending)return;try{importProgress(this.career,this.pending.progress);this.close(false);this.onLoaded();}catch(e){this.message(e.message);}}
 download(){try{const blob=new Blob([exportSave(this.career.progress)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`superfly-save-${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.json`;this.root.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);this.message('Download solicitado. Guarde o arquivo para carregar aqui ou em outro navegador.');}catch(e){this.message(e.message);}}
}
