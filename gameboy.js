import * as T from './three.js';

// A low-resolution scene with four LCD greens. Preserve the viewport's aspect ratio.
export class GameBoyFilter {
 constructor(){this.enabled=false;this.size=new T.Vector2();this.target=null;}
 init(){
  this.target=new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType,depthBuffer:true,minFilter:T.NearestFilter,magFilter:T.NearestFilter});
  this.material=new T.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{film:{value:this.target.texture},pixels:{value:new T.Vector2(160,144)}},vertexShader:`varying vec2 uvFilm;
   void main(){uvFilm=uv;gl_Position=vec4(position.xy,0.,1.);}`,fragmentShader:`
   uniform sampler2D film;uniform vec2 pixels;varying vec2 uvFilm;
   float bayer2(vec2 p){return p.x<1.?(p.y<1.?0.:3.):(p.y<1.?2.:1.);}
   void main(){
    vec2 pixel=min(floor(uvFilm*pixels),pixels-1.);
    vec2 uv=(pixel+.5)/pixels;
    gl_FragColor=vec4(texture2D(film,uv).rgb,1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    float light=dot(gl_FragColor.rgb,vec3(.299,.587,.114));
    light=clamp((light-.5)*1.55+.5,0.,1.);
    // Fixed ordered dithering: no random flicker as the camera moves.
    float pattern=(4.*bayer2(mod(pixel,2.))+bayer2(mod(floor(pixel/2.),2.))+.5)/16.-.5;
    float level=floor(clamp(light*3.+.5+pattern*.8,0.,3.));
    vec3 ink=vec3(15.,56.,15.)/255.;
    if(level>2.5)ink=vec3(155.,188.,15.)/255.;
    else if(level>1.5)ink=vec3(139.,172.,15.)/255.;
    else if(level>.5)ink=vec3(48.,98.,48.)/255.;
    gl_FragColor=vec4(ink,1.);
   }`});
  this.scene=new T.Scene();this.camera=new T.Camera();
  this.scene.add(new T.Mesh(new T.PlaneGeometry(2,2),this.material));
 }
 render(renderer,scene,camera){
  if(!this.enabled){renderer.render(scene,camera);return;}
  if(!this.target)this.init();
  renderer.getDrawingBufferSize(this.size);
  const height=Math.max(1,Math.min(144,Math.round(this.size.y))),width=Math.max(1,Math.round(height*this.size.x/Math.max(1,this.size.y)));
  if(this.target.width!==width||this.target.height!==height){this.target.setSize(width,height);this.material.uniforms.pixels.value.set(width,height);}
  const previous=renderer.getRenderTarget();
  try{renderer.setRenderTarget(this.target);renderer.render(scene,camera);renderer.setRenderTarget(previous);renderer.render(this.scene,this.camera);}
  finally{renderer.setRenderTarget(previous);}
 }
}
