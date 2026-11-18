import * as T from './three.js';
export const NEW_FILTERS=['gbc','virtualboy','film35','super8','camcorder','nightvision','ascii','macintosh','synthwave'];
// One shared scene target and one shader for all new looks. HUD stays in the DOM.
export class RetroFilters {
 constructor(){this.size=new T.Vector2();this.lastCapture=-Infinity;this.lastMode='';}
 init(renderer){
  if(this.target)return;
  const half=renderer.extensions?.has('EXT_color_buffer_float');
  this.target=new T.WebGLRenderTarget(1,1,{type:half?T.HalfFloatType:T.UnsignedByteType,depthBuffer:true,minFilter:T.NearestFilter,magFilter:T.NearestFilter});
  const canvas=document.createElement('canvas');canvas.width=320;canvas.height=32;const ctx=canvas.getContext('2d');ctx.fillStyle='#000';ctx.fillRect(0,0,320,32);ctx.fillStyle='#fff';ctx.font='bold 28px monospace';ctx.textAlign='center';ctx.textBaseline='middle';[...' .:-=+*#%@'].forEach((c,i)=>ctx.fillText(c,i*32+16,16));
  this.atlas=new T.CanvasTexture(canvas);this.atlas.minFilter=this.atlas.magFilter=T.NearestFilter;this.atlas.generateMipmaps=false;
  this.material=new T.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{film:{value:this.target.texture},atlas:{value:this.atlas},time:{value:0},pixels:{value:new T.Vector2(1,1)},resolution:{value:new T.Vector2(1,1)},mode:{value:0},strength:{value:1},asciiMode:{value:0},dither:{value:1},interlace:{value:0}},vertexShader:`varying vec2 v;void main(){v=uv;gl_Position=vec4(position.xy,0.,1.);}`,fragmentShader:`
  uniform sampler2D film,atlas;uniform vec2 pixels,resolution;uniform float time,strength,dither,interlace;uniform int mode,asciiMode;varying vec2 v;
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float lum(vec3 c){return dot(c,vec3(.299,.587,.114));}
  float b2(vec2 p){return p.x<1.?(p.y<1.?0.:3.):(p.y<1.?2.:1.);}
  float bayer(vec2 p){return (4.*b2(mod(p,2.))+b2(mod(floor(p/2.),2.))+.5)/16.;}
  vec3 color(vec2 uv){gl_FragColor=vec4(texture2D(film,clamp(uv,0.,1.)).rgb,1.);
   #include <tonemapping_fragment>
   #include <colorspace_fragment>
   return gl_FragColor.rgb;
  }
  vec3 palette(float i){if(i<.5)return vec3(.07,.10,.17);if(i<1.5)return vec3(.25,.22,.37);if(i<2.5)return vec3(.20,.38,.52);if(i<3.5)return vec3(.25,.59,.69);if(i<4.5)return vec3(.55,.79,.79);if(i<5.5)return vec3(.18,.34,.23);if(i<6.5)return vec3(.38,.53,.28);if(i<7.5)return vec3(.66,.73,.36);if(i<8.5)return vec3(.47,.32,.23);if(i<9.5)return vec3(.71,.51,.33);if(i<10.5)return vec3(.86,.72,.48);if(i<11.5)return vec3(.96,.91,.71);if(i<12.5)return vec3(.65,.25,.28);if(i<13.5)return vec3(.87,.43,.37);if(i<14.5)return vec3(.55,.46,.66);return vec3(.89,.86,.91);}
  void main(){vec2 uv=v;float tick=floor(time*24.);vec2 p=floor(v*pixels);float grain=hash(floor(v*resolution)+vec2(tick,tick*.71))-.5;
   if(mode==3){uv+=(vec2(hash(vec2(tick,8.)),hash(vec2(9.,tick)))-.5)*.0025*strength;}
   vec3 c=color(uv),original=c;float l=lum(c),pattern=bayer(p)-.5;
   if(mode==0){vec3 source=c+pattern*.10*dither;vec3 best=vec3(0.);float distance=9.;for(int i=0;i<16;i++){vec3 ink=palette(float(i));float d=dot(source-ink,source-ink);if(d<distance){distance=d;best=ink;}}c=best;}
   else if(mode==1){float red=floor(clamp((l-.13)*1.32,0.,1.)*3.+.5)/3.;c=vec3(red,0.,0.);}
   else if(mode==2||mode==3){vec2 texel=1./pixels;vec3 blur=(color(uv+texel*vec2(2.,0.))+color(uv-texel*vec2(2.,0.))+color(uv+texel*vec2(0.,2.))+color(uv-texel*vec2(0.,2.)))*.25;
    c=mix(c,blur,mode==3?.24:.09);c=c*c*(3.-2.*c);c=mix(c,vec3(.025)+c*.96,.3);vec3 glow=max(blur-.72,0.);c+=glow*vec3(.21,.065,.035);
    c+=grain*(mode==3?.14:.055)*(1.-l*.45);c*=1.+(hash(vec2(tick,3.))-.5)*(mode==3?.075:.018);
    if(mode==3){c.r+=sin(tick*.27)*.012;c.b-=sin(tick*.19)*.01;float scratch=step(.989,hash(vec2(floor(uv.x*270.),floor(time*3.))));c+=scratch*.12;float dust=step(.998,hash(floor(uv*vec2(300.,200.))+tick));c-=dust*.28;c*=.83+.17*pow(max(0.,16.*uv.x*uv.y*(1.-uv.x)*(1.-uv.y)),.25);}
   }
   else if(mode==4){vec2 t=1./pixels;vec3 near=(color(uv+t)+color(uv-t))*.5;c+=(c-near)*.65;c.r=color(uv+vec2(t.x,0.)).r;c.b=color(uv-vec2(t.x,0.)).b;c=clamp((c-.035)*1.13,0.,1.);c+=grain*.06*(1.-l);c*=1.-interlace*.065*mod(p.y+mod(tick,2.),2.);}
   else if(mode==5){vec2 t=4./pixels;float halo=(lum(color(uv+t))+lum(color(uv-t))+lum(color(uv+vec2(t.x,-t.y))) )/3.;float gain=pow(max(l,0.),.55)*1.12+max(halo-.55,0.)*.7+grain*.09;float edge=(1.-smoothstep(.32,.78,length((uv-.5)*vec2(1.1,1.))));c=vec3(.12,1.,.22)*gain*mix(.25,1.,edge);}
   else if(mode==6){vec2 grid=vec2(max(24.,floor(pixels.x/7.)),max(16.,floor(pixels.y/12.)));vec2 cell=floor(v*grid),local=fract(v*grid);vec3 cellColor=color((cell+.5)/grid);float density=floor(clamp(lum(cellColor)*1.2,0.,.999)*10.);float glyph=texture2D(atlas,vec2((density+local.x)/10.,local.y)).r;c=glyph*(asciiMode==0?vec3(.22,1.,.4):asciiMode==1?vec3(1.):cellColor);}
   else if(mode==7){c=vec3(step(bayer(p),clamp((l-.5)*1.25+.5,0.,1.)));}
   else if(mode==8){vec3 shadow=vec3(.12,.025,.29),mid=vec3(.52,.06,.58),high=vec3(1.,.5,.26);vec3 neon=l<.5?mix(shadow,mid,l*2.):mix(mid,high,(l-.5)*2.);c=mix(c,neon,.67);vec2 t=3./pixels;vec3 bloom=max((color(uv+t)+color(uv-t))*.5-.65,0.);c+=bloom*vec3(.65,.15,.5);}
   // Discrete displays keep exact palettes; their intensity changes pixel density instead.
   if(mode!=0&&mode!=1&&mode!=6&&mode!=7)c=mix(original,c,strength);
   gl_FragColor=vec4(clamp(c,0.,1.),1.);
  }`});
  this.scene=new T.Scene();this.camera=new T.Camera();this.quad=new T.Mesh(new T.PlaneGeometry(2,2),this.material);this.scene.add(this.quad);const previousError=renderer.debug?.onShaderError;try{if(renderer.debug)renderer.debug.onShaderError=()=>{throw Error('Visual filter shader unavailable');};renderer.compile?.(this.scene,this.camera);}catch(e){this.dispose();throw e;}finally{if(renderer.debug)renderer.debug.onShaderError=previousError;}
 }
 render(renderer,scene,camera,time,settings){
  if(!this.target)this.init(renderer);renderer.getDrawingBufferSize(this.size);const {mode,intensity,asciiMode,dither,interlace,cadence}=settings;
  let h=mode==='gbc'?Math.round(288-144*intensity):mode==='virtualboy'?Math.round(448-224*intensity):mode==='macintosh'?Math.round(540-198*intensity):mode==='ascii'?Math.round(720-360*intensity):mode==='camcorder'?480:mode==='super8'?540:720;
  h=Math.max(1,Math.min(h,this.size.y));const w=Math.max(1,Math.round(h*this.size.x/Math.max(1,this.size.y)));const resized=this.target.width!==w||this.target.height!==h;
  if(resized)this.target.setSize(w,h);const u=this.material.uniforms;u.pixels.value.set(w,h);u.resolution.value.copy(this.size);u.time.value=time;u.mode.value=NEW_FILTERS.indexOf(mode);u.strength.value=intensity;u.asciiMode.value=['green','mono','color'].indexOf(asciiMode);u.dither.value=dither?1:0;u.interlace.value=interlace?1:0;
  const previous=renderer.getRenderTarget();try{
   if(mode!=='super8'||!cadence||time-this.lastCapture>=1/18||this.lastMode!==mode||resized){renderer.setRenderTarget(this.target);renderer.render(scene,camera);this.lastCapture=time;}
   renderer.setRenderTarget(previous);renderer.render(this.scene,this.camera);this.lastMode=mode;
  }finally{renderer.setRenderTarget(previous);}
 }
 dispose(){this.target?.dispose();this.material?.dispose();this.atlas?.dispose();this.quad?.geometry.dispose();this.target=null;}
}
