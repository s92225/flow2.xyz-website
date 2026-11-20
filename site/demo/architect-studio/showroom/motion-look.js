const DEG=Math.PI/180,TAU=2*Math.PI;
const wrap=a=>((a+Math.PI)%TAU+TAU)%TAU-Math.PI;
const clamp=(a,lo,hi)=>Math.min(hi,Math.max(lo,a));

// Convert the W3C Z-X'-Y'' device angles into the ray through the back of the
// screen. Natural device axes, not viewport axes: screen roll doesn't change
// this ray, so portrait and either landscape use the same calculation.
export function deviceLook(alpha,beta,gamma){
 if(![alpha,beta,gamma].every(Number.isFinite))return null;
 const a=alpha*DEG,b=beta*DEG,g=gamma*DEG;
 const sx=-Math.sin(g),sz=-Math.cos(g)*Math.sin(b);
 const x=Math.cos(a)*sx+Math.sin(a)*sz,z=-Math.sin(a)*sx+Math.cos(a)*sz;
 const y=-Math.cos(g)*Math.cos(b),horizontal=Math.hypot(x,z);
 // At the poles there is no dependable horizontal bearing.
 return {yaw:horizontal>.20?Math.atan2(x,-z):null,pitch:Math.atan2(y,horizontal)}
}
export function bindMotionLook({view,limits,state,error,reduced}){
 let status='off',ticket=0,timer,base=null,attached=false;
 const canHear=()=>!document.hidden&&(status==='calibrating'||status==='on');
 function change(next){if(next!==status){status=next;state(next)}}
 function reset(){base=null}
 function detach(){
  clearTimeout(timer);
  if(attached){window.removeEventListener('deviceorientation',sample);attached=false}
  reset();
 }
 function stop(){ticket++;detach();change('off')}
 function sample(e){
  if(!canHear())return;
  const current=deviceLook(e.alpha,e.beta,e.gamma);
  if(!current)return;
  if(!base){
   const {yaw,pitch}=view();
   base={yaw,pitch,devicePitch:current.pitch,offsetPitch:0,previousHeading:current.yaw,offsetYaw:0};
   clearTimeout(timer);change('on');return
  }
  if(base.previousHeading!==null&&current.yaw!==null)base.offsetYaw+=wrap(current.yaw-base.previousHeading);
  base.previousHeading=current.yaw;
  base.offsetPitch=current.pitch-base.devicePitch;
 }
 function listen(){
  if(!canHear()||attached)return;
  change('calibrating');reset();
  window.addEventListener('deviceorientation',sample,{passive:true});attached=true;
  timer=setTimeout(()=>{stop();error('silent')},3500);
 }
 async function toggle(){
  if(status!=='off'){stop();return}
  if(!window.isSecureContext||!window.DeviceOrientationEvent){error('unavailable');return}
  const attempt=++ticket;change('permission');
  try{
   // Safari has to see this call inside the visitor's button press. The
   // default request is relative orientation; no compass access is needed.
   if(typeof DeviceOrientationEvent.requestPermission==='function'&&await DeviceOrientationEvent.requestPermission()!=='granted'){
    if(attempt===ticket){stop();error('denied')}return
   }
  }catch{if(attempt===ticket){stop();error('denied')}return}
  if(attempt!==ticket)return;
  change('calibrating');listen();
 }
 document.addEventListener('visibilitychange',()=>{
  if(document.hidden){detach();return}
  listen();
 });
 function recenter(){
  if(!attached)return;
  reset();change('calibrating');clearTimeout(timer);
  timer=setTimeout(()=>{stop();error('silent')},3500)
 }
 return {toggle,stop,recenter,get follows(){return status==='calibrating'||status==='on'},
  nudge(yaw,pitch){
   if(base){base.yaw+=yaw;base.pitch=clamp(base.pitch+pitch,...limits)}
  },
  tick(dt,yaw,pitch){
   if(!base||!canHear()||!dt)return null;
   const dy=base.yaw+base.offsetYaw-yaw,dp=clamp(base.pitch+base.offsetPitch,...limits)-pitch;
   if(Math.abs(dy)<.002&&Math.abs(dp)<.002)return null;
   const gain=reduced?1:1-Math.exp(-dt*24);
   return {yaw:yaw+dy*gain,pitch:pitch+dp*gain}
  }
 }
}
