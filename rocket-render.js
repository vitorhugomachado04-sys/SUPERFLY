// Render between fixed physics steps so fast ascent does not judder at 60/144 Hz.
// Keep the live flight object untouched; its getters still work on the visual copy.
export function interpolateRocketPose(flight,previous,alpha){
 const pose=Object.assign(Object.create(Object.getPrototypeOf(flight)),flight);
 if(!previous||previous.phase!==flight.phase)return pose;
 const t=Math.max(0,Math.min(1,alpha));
 for(const key of ['x','y','z'])pose[key]=previous[key]+(flight[key]-previous[key])*t;
 return pose;
}
