export const CAMERA_SHAKE_VALUES=[1,.25,0];
export function readCameraShake(storage){try{const raw=storage?.getItem('superfly-camera-shake');const v=raw===null||raw===undefined?1:Number(raw);return CAMERA_SHAKE_VALUES.includes(v)?v:1;}catch{return 1;}}
export function saveCameraShake(storage,value){const v=Number(value);if(!CAMERA_SHAKE_VALUES.includes(v))return false;try{storage?.setItem('superfly-camera-shake',String(v));return true;}catch{return false;}}
