export const touchDevice=()=>matchMedia('(any-pointer: coarse)').matches||matchMedia('(pointer: coarse)').matches||navigator.maxTouchPoints>1||innerWidth<650;
const pref='house03.resolution';
const modes=['auto','smooth','detail'];
// Shared by the loading cover and visitor guide. Changing it does not reset the camera.
export function qualityPreference(controls){
 let mode='auto';const listeners=new Set();
 try{const v=localStorage.getItem(pref);if(modes.includes(v))mode=v}catch{}
 function sync(){for(const select of controls)select.value=mode}
 sync();
 for(const select of controls)select.addEventListener('change',()=>{
  if(!modes.includes(select.value)||mode===select.value)return;
  mode=select.value;sync();
  try{localStorage.setItem(pref,mode)}catch{}
  for(const fn of listeners)fn();
 });
 return {get mode(){return mode},onChange:fn=>listeners.add(fn)}
}
export function setupResolution({quality,compact,r,canvas,resize}){
 let step=0,failures=0,samples=0,last=-Infinity,settle=0,lastW=0,lastH=0;
 function ratio(w,h){
  let profiles;
  switch(quality.mode){
   case 'detail':profiles=compact?[[1.35,1400000],[1.10,1000000]]:[[1.6,2400000],[1.30,1600000]];break;
   case 'smooth':profiles=compact?[[.83,470000],[.69,325000],[.56,225000]]:[[.91,760000],[.76,535000],[.60,345000]];break;
   default:profiles=compact?[[.95,650000],[.76,440000],[.58,280000]]:[[1.3,1500000],[1.05,1000000],[.82,640000]];
  }
  const [cap,pixels]=profiles[Math.min(step,profiles.length-1)];
  return Math.min(devicePixelRatio||1,cap,Math.sqrt(pixels/Math.max(1,w*h)))
 }
 function fit(){
  const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;
  const next=ratio(w,h),changedRatio=r.getPixelRatio()!==next;
  if(changedRatio)r.setPixelRatio(next);
  if(changedRatio||w!==lastW||h!==lastH){lastW=w;lastH=h;resize(w,h)}
  if(canvas.dataset.resolution!==quality.mode)canvas.dataset.resolution=quality.mode;
 }
 function reset(ms=performance.now()){step=samples=failures=0;last=-Infinity;settle=ms+750;fit()}
 quality.onChange(reset);
 new ResizeObserver(fit).observe(canvas);
 reset();
 return {fit,observe(ms,frameMs,moving){
  if(!moving){last=-Infinity;failures=samples=0;return}
  const gap=ms-last;last=ms;
  if(step===2||ms<settle||!Number.isFinite(gap))return;
  failures+=gap>26||frameMs>26?1:0;
  if(++samples<18)return;
  if(failures>=12){step++;settle=ms+900;fit()}
  failures=samples=0;
 }}
}
