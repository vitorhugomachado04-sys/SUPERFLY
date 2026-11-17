import * as T from './three.js';
// One scene-only pass: menus and instruments stay crisp, including Hide UI mode.
export class VHSFilter {
 constructor(){this.enabled=false;this.size=new T.Vector2();this.target=null;}
 toggle(){this.enabled=!this.enabled;return this.enabled;}
 init(){
  this.target=new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType,depthBuffer:true});
  this.material=new T.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{film:{value:this.target.texture},time:{value:0},resolution:{value:new T.Vector2(1,1)}},vertexShader:`varying vec2 uvFilm;
   void main(){uvFilm=uv;gl_Position=vec4(position.xy,0.,1.);}`,fragmentShader:`
   uniform sampler2D film;uniform float time;uniform vec2 resolution;varying vec2 uvFilm;
   float noise(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
   void main(){
    vec2 uv=uvFilm;float tick=floor(time*24.);float line=floor(uv.y*480.);
    float tracking=exp(-pow((uv.y-fract(time*.035))/.018,2.));
    float wobble=sin(uv.y*37.+time*1.7)*.00085+(noise(vec2(line,tick))-.5)*.001;
    uv.x+=wobble+tracking*sin(time*8.+uv.y*200.)*.0026;
    uv=clamp(uv,vec2(.002),vec2(.998));
    vec2 bleed=vec2(2.2/resolution.x,0.);
    vec3 col=vec3(texture2D(film,clamp(uv+bleed,0.,1.)).r,texture2D(film,uv).g,texture2D(film,clamp(uv-bleed,0.,1.)).b);
    gl_FragColor=vec4(col,1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    col=gl_FragColor.rgb;
    float luma=dot(col,vec3(.299,.587,.114));col=mix(vec3(luma),col,.78);
    col=col*.91+vec3(.038,.029,.043);
    // Tape grain and occasional short dropouts, without full-screen flashes.
    vec2 tapePixel=floor(uvFilm*vec2(min(resolution.x,960.),min(resolution.y,540.)));
    float grain=(noise(tapePixel+vec2(tick,tick*.71))-.5)*.085;
    float dropout=step(.994,noise(vec2(line,tick*.37)))*step(.78,noise(vec2(floor(uvFilm.x*32.),line+tick)));
    col+=grain+dropout*.09;
    col+=tracking*(.018+(noise(vec2(line,tick))-.5)*.045);
    // Resolve at least three physical pixels per scanline to avoid moire on small screens.
    float scanCount=min(360.,resolution.y/3.);
    float scan=.5+.5*cos(uvFilm.y*scanCount*6.28318);
    col*=1.-.075*scan;
    // Very light RGB phosphor grille, locked to physical output pixels.
    float phosphor=mod(floor(gl_FragCoord.x),3.);
    vec3 mask=vec3(.978);
    if(phosphor<1.)mask.r=1.;else if(phosphor<2.)mask.g=1.;else mask.b=1.;
    col*=mask;
    vec2 edge=uvFilm*(1.-uvFilm);col*=.82+.18*pow(clamp(edge.x*edge.y*16.,0.,1.),.22);
    gl_FragColor=vec4(col,1.);
   }`});
  this.scene=new T.Scene();this.camera=new T.Camera();
  this.scene.add(new T.Mesh(new T.PlaneGeometry(2,2),this.material));
 }
 render(renderer,scene,camera,time){
  if(!this.enabled){renderer.render(scene,camera);return;}
  if(!this.target)this.init();
  renderer.getDrawingBufferSize(this.size);
  if(this.target.width!==this.size.x||this.target.height!==this.size.y){this.target.setSize(this.size.x,this.size.y);this.material.uniforms.resolution.value.copy(this.size);}
  this.material.uniforms.time.value=time;
  const previous=renderer.getRenderTarget();
  try{renderer.setRenderTarget(this.target);renderer.render(scene,camera);renderer.setRenderTarget(previous);renderer.render(this.scene,this.camera);}
  finally{renderer.setRenderTarget(previous);}
 }
}                                                                                