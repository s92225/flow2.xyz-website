// Desktop mouse movement is FPS-style; touch still grabs the view.
// Never take the cursor on a normal click or keep it after release.
export function bindLook(canvas,{stop,turn,tap}){
 let active=null,lockRequest=null;
 const locked=()=>document.pointerLockElement===canvas;
 function cancel(){
  const old=active;active=null;
  if(old&&canvas.hasPointerCapture(old.id))canvas.releasePointerCapture(old.id);
  if(locked())document.exitPointerLock();
 }
 function lock(p){
  if(!canvas.requestPointerLock||lockRequest||document.pointerLockElement)return;
  lockRequest=p;
  try{
   canvas.requestPointerLock()?.catch(()=>{if(lockRequest===p)lockRequest=null})
  }catch{lockRequest=null}
 }
 function raise(x,y){
  const old=active;cancel();
  if(!old.secondary&&!old.drag)tap(x,y);
 }
 canvas.addEventListener('pointerdown',e=>{
  const mouse=e.pointerType==='mouse',secondary=mouse&&e.button===2;
  if(active||(!secondary&&e.button!==0))return;
  const p=active={id:e.pointerId,x:e.clientX,y:e.clientY,lx:e.clientX,ly:e.clientY,mouse,secondary,button:e.button,mask:secondary?2:1,drag:secondary};
  canvas.setPointerCapture(e.pointerId);canvas.focus({preventScroll:true});stop();
  if(secondary){e.preventDefault();lock(p)}
 });
 canvas.addEventListener('pointermove',e=>{
  const p=active;if(!p||p.id!==e.pointerId||(p.mouse&&locked()))return;
  if(p.mouse&&!(e.buttons&p.mask)){cancel();return}
  const began=!p.drag;
  if(began&&Math.hypot(e.clientX-p.x,e.clientY-p.y)<5)return;
  turn(e.clientX-p.lx,e.clientY-p.ly,p.mouse);
  p.lx=e.clientX;p.ly=e.clientY;p.drag=true;
  // A left press becomes mouse-look only after it is clearly a drag.
  if(began&&p.mouse)lock(p);
 });
 canvas.addEventListener('pointerup',e=>{if(active?.id===e.pointerId)raise(e.clientX,e.clientY)});
 canvas.addEventListener('pointercancel',e=>{if(active?.id===e.pointerId)cancel()});
 canvas.addEventListener('lostpointercapture',e=>{if(active?.id===e.pointerId&&(!active.mouse||!active.drag||(!locked()&&lockRequest!==active)))cancel()});
 canvas.addEventListener('contextmenu',e=>{if(e.button===2)e.preventDefault()});

 // Pointer lock can arrive after a very quick release, or be denied by
 // an embedded browser. On denial, captured in-window moves still work.
 document.addEventListener('pointerlockchange',()=>{
  const request=lockRequest;lockRequest=null;
  if(locked()&&(!active?.mouse||!active.drag||request!==active))document.exitPointerLock();
  else if(!locked()&&active?.mouse&&active.drag&&!request)cancel()
 });
 document.addEventListener('pointerlockerror',()=>{lockRequest=null});
 document.addEventListener('mousemove',e=>{
  const p=active;if(!p?.mouse||!p.drag||!locked())return;
  if(!(e.buttons&p.mask)){cancel();return}
  if(e.movementX||e.movementY)turn(e.movementX,e.movementY,true)
 });
 window.addEventListener('mouseup',e=>{if(active?.mouse&&active.drag&&e.button===active.button)cancel()},true);
 window.addEventListener('blur',cancel);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel()});
 return {cancel,get held(){return active!==null},get moving(){return !!active?.drag}};
}
