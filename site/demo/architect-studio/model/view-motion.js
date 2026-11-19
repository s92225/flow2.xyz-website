// One ground-anchored lens for all storeys. The selected storey is deliberately cut low.
export const siteFrame=Object.freeze({x:3.5,z:-1.8,diameter:49.5});
export const elevations=[0,4.20,7.95], slabDepth=.20;
export const sectionAt=i=>elevations[i]+2.45;
export const soffitAt=i=>(elevations[i+1]??(elevations[i]+3.75))-elevations[i]-slabDepth;
export const halfSpan=(frame,aspect,zoom)=>frame.diameter/2*Math.max(1,1/aspect)/zoom;
const unit=x=>Math.max(0,Math.min(1,x)),ease=x=>x*x*(3-2*x);
// A readable open cut while the floor is on top, full-height construction once a storey covers it.
export function wallHeight(i,worldSection,readingHeight){
 const height=worldSection-elevations[i],open=sectionAt(i)-elevations[i],full=soffitAt(i);
 return height<=open ? readingHeight*unit(height/open) : readingHeight+(full-readingHeight)*unit((height-open)/(full-open));
}
// A single interruptible clock: clear the outgoing annotations, move the actual section,
// then commit and fade in the destination annotations. Never pass through intermediate floor labels.
export function revealStoreys(initial,apply,reduced,state){
 let h=sectionAt(initial),to=h,raf=0,moving=false,ink=1;
 function finish(){cancelAnimationFrame(raf);raf=0;moving=false;h=to;ink=1;state('');apply(h,ink,true,true)}
 return {get moving(){return moving},settle(){if(moving)finish()},go(level,instant=false){
  cancelAnimationFrame(raf);to=sectionAt(level);
  if(instant||reduced.matches){finish();return}
  const from=h,startInk=ink,distance=Math.abs(to-from);
  const outMs=100*startInk,sweepMs=distance<.001?0:Math.min(640,Math.max(160,460*Math.sqrt(distance/4.2))),inMs=150;
  let start;moving=true;state(to>=from?'up':'down');
  function tick(now){
   start??=now;const elapsed=now-start;
   if(elapsed>=outMs+sweepMs+inMs){finish();return}
   const arrived=elapsed>=outMs+sweepMs;
   const s=sweepMs?ease(unit((elapsed-outMs)/sweepMs)):1;
   h=from+(to-from)*s;
   ink=arrived?ease(unit((elapsed-outMs-sweepMs)/inMs)):outMs?startInk*(1-ease(unit(elapsed/outMs))):0;
   apply(h,ink,arrived,false);raf=requestAnimationFrame(tick)
  }
  raf=requestAnimationFrame(tick)
 }};
}
