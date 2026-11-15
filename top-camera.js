// North stays at the top. A horizontal up vector avoids the vertical lookAt singularity.
export function topCamera(camera,position,height=70){camera.up.set(0,0,-1);camera.position.set(position.x,position.y+height,position.z);camera.lookAt(position.x,position.y,position.z);}
