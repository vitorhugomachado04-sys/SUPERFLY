import * as T from './three.js';
import {REGIONS} from './airports.js?v=04.9';
// Retain a bounded CPU cache; detach far details and free unreferenced GPU buffers.
// Geometry shared by a resident object is never disposed. Coarse terrain stays resident.
export class WorldStreaming{
 constructor(scene,objects){this.scene=scene;this.batches=REGIONS.map(r=>({region:r,objects:[],active:true}));this.geometries=new Map();this.disposals=0;
 for(const object of objects){if(object.userData.coarse||object.isLight||object.isCamera)continue;const bounds=new T.Box3().setFromObject(object);if(bounds.isEmpty()||bounds.getSize(new T.Vector3()).length()>12000)continue;const center=bounds.getCenter(new T.Vector3());const batch=this.batches.reduce((best,b)=>center.distanceTo(new T.Vector3(b.region.x,center.y,b.region.z))<center.distanceTo(new T.Vector3(best.region.x,center.y,best.region.z))?b:best);batch.objects.push(object);}
 this.totalObjects=this.batches.reduce((n,b)=>n+b.objects.length,0);
 }
 update(x,z){let changed=false;for(const b of this.batches){const d=Math.hypot(x-b.region.x,z-b.region.z),want=d<(b.active?4800:3900);if(want===b.active)continue;b.active=want;changed=true;for(const o of b.objects)want?this.scene.add(o):this.scene.remove(o);}
 if(changed){const resident=new Set();this.scene.traverse(o=>{if(o.geometry)resident.add(o.geometry);});const absent=new Set();for(const b of this.batches)if(!b.active)for(const o of b.objects)o.traverse(n=>{if(n.geometry&&!resident.has(n.geometry))absent.add(n.geometry);});for(const geo of absent)if(!this.geometries.get(geo)){geo.dispose();this.geometries.set(geo,true);this.disposals++;}for(const geo of resident)this.geometries.delete(geo);}
 }
 get stats(){return{regions:this.batches.filter(b=>b.active).map(b=>b.region.id),residentObjects:this.batches.filter(b=>b.active).reduce((n,b)=>n+b.objects.length,0),cachedObjects:this.totalObjects,disposedBuffers:this.disposals};}
}
