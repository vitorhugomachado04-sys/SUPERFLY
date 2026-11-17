// One player for the whole game: scene changes never recreate or rewind it.
export class Soundtrack{
 constructor(){
  this.enabled=true;try{this.enabled=localStorage.getItem('superfly-music')!=='off';}catch{}
  this.audio=document.createElement('audio');this.audio.id='soundtrack';this.audio.src=new URL('./superfly-soundtrack.m4a?v=04.43',import.meta.url).href;this.audio.loop=true;this.audio.preload='auto';this.audio.volume=.32;this.audio.hidden=true;document.body.append(this.audio);
  document.querySelectorAll('[data-music]').forEach(button=>button.addEventListener('click',()=>this.toggle()));
  // Browsers may require the first click/key before allowing audible playback.
  const unlock=e=>{if(e.target.closest?.('[data-music]'))return;this.play();};
  window.addEventListener('pointerdown',unlock);window.addEventListener('click',unlock);window.addEventListener('keydown',unlock);
  this.audio.addEventListener('playing',()=>this.render());this.audio.addEventListener('error',()=>this.render());this.render();this.play();
 }
 play(){if(!this.enabled||!this.audio.paused)return;this.audio.play().catch(()=>{});}
 toggle(){this.enabled=!this.enabled;try{localStorage.setItem('superfly-music',this.enabled?'on':'off');}catch{}if(this.enabled)this.play();else this.audio.pause();this.render();}
 render(){document.querySelectorAll('[data-music]').forEach(b=>{b.textContent=this.enabled?'MÚSICA ON':'MÚSICA OFF';b.setAttribute('aria-pressed',String(this.enabled));b.title=this.audio.error?'Não foi possível carregar a trilha. Recarregue a página.':this.enabled?'Desligar só a música':'Ligar a música';});}
}
