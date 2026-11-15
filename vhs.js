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
    float wobble=sin(uv.y*37.+time*1.7)*.00065+(noise(vec2(line,tick))-.5)*.0007;
    uv.x+=wobble+tracking*sin(time*8.+uv.y*200.)*.002;
    uv=clamp(uv,vec2(.002),vec2(.998));
    vec2 bleed=vec2(1.8/resolution.x,0.);
    vec3 col=vec3(texture2D(film,clamp(uv+bleed,0.,1.)).r,texture2D(film,uv).g,texture2D(film,clamp(uv-bleed,0.,1.)).b);
    gl_FragColor=vec4(col,1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    col=gl_FragColor.rgb;
    float luma=dot(col,vec3(.299,.587,.114));col=mix(vec3(luma),col,.78);
    col=col*.91+vec3(.038,.029,.043);
    float grain=(noise(floor(uvFilm*resolution)+vec2(tick,tick*.71))-.5)*.055;
    col+=grain;col*=1.-.035*(.5+.5*sin(uvFilm.y*480.*6.28318));
    col+=tracking*.012;
    vec2 edge=uvFilm*(1.-uvFilm);col*=.86+.14*pow(clamp(edge.x*edge.y*16.,0.,1.),.22);
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