import {floors,eye} from './navigation.js';
import {arrival,seat,sill,floorName} from './lift-fronts.js';

const smooth=n=>n*n*(3-2*n),mix=(a,b,t)=>a+(b-a)*t;
// The car can answer a hall call unoccupied. The passenger can only board or
// alight when both sets of leaves are fully open at the same sill.
export function liftRide({model,pose,move,look,halt,prepare,refresh,notice,t,canvas,reduced}){
 const $=id=>document.getElementById(id),action=$('lift-action'),panel=$('lift-panel');
 const choices=[...panel.querySelectorAll('[data-stop]')],leave=$('lift-exit');
 const prop=(o,k,v)=>{if(o[k]!==v)o[k]=v};
 let state='idle',dock=0,wanted=0,height=0,opening=0,aboard=false,time=0,origin=0,startPos=null;
 const busy=()=>aboard||state==='boarding'||state==='exiting';
 const near=()=>{const {x,z,l}=pose();return !(l%2)&&x>=1.95&&x<=3.72&&z>=6.39&&z<=7.21};
 const transition=(s)=>{state=s;time=0;refresh()};
 const setCamera=(x,z)=>move({x,z,y:height+eye,l:dock*2});
 function ui(){
  const local=near(),f=pose().l/2,available=(state==='idle'||state==='open');
  prop(action,'hidden',!local||busy());prop(action,'disabled',!available);
  prop(action,'textContent',state==='open'&&dock===f?t('入升降機','Enter lift'):available?t('召喚升降機','Call lift'):t('升降機到站中…','Lift arriving…'));
  prop(panel,'hidden',!aboard);const open=state==='open';
  choices.forEach((b,i)=>{prop(b,'disabled',!open||i===dock);const current=String(i===dock);if(b.getAttribute('aria-current')!==current)b.setAttribute('aria-current',current)});prop(leave,'disabled',!open);
  prop(leave,'textContent',t('出升降機','Exit lift'));
  prop($('lift-status'),'textContent',state==='preparing'?t('準備樓層…','Preparing floor…'):open?t('已到 ','At ')+floorName(dock):state==='exiting'?t('出升降機','Leaving lift'):t('前往 ','To ')+floorName(wanted));
  prop($('index-open'),'disabled',busy());prop($('route'),'disabled',busy());
  prop(canvas.dataset,'lift',state);prop(canvas.dataset,'dock',String(dock));prop(canvas.dataset,'liftDoor',opening.toFixed(3));
  if(busy()){prop($('location'),'textContent',t('住戶升降機','Residential lift'));prop($('tip'),'textContent',aboard&&open?t('揀樓層，或者出升降機。','Choose a floor or exit the lift.'):t('可以拖動視角。','Drag to look around.'))}
 }
 function call(){
  if(!near()||busy()||!['idle','open'].includes(state))return;
  const floor=pose().l/2;halt();
  if(state==='open'&&dock===floor){startPos=pose();transition('boarding');return}
  wanted=floor;
  if(opening>0)transition('closing');else if(dock!==wanted){origin=height;transition('travel')}else transition('opening');
 }
 async function select(i){
  if(!aboard||state!=='open'||i===dock||!Number.isInteger(i)||!floors.hasOwnProperty(i))return;
  wanted=i;transition('preparing');
  try{await prepare(i*2);transition('closing')}catch{wanted=dock;transition('open');notice('樓層暫時未能載入，可以再揀或者出𨋢。','Floor unavailable. Retry or exit the lift.')}
 }
 function exit(){if(aboard&&state==='open'){look(Math.PI/2);transition('exiting')}}
 function interact(v){if(v==='call'){call();return}if(typeof v==='number')select(v)}
 function tick(dt){
  if(state==='open'&&!aboard){
   // Keep the doorway open while the visitor is reading the entry control.
   // Once they walk away, park closed; an empty car never exposes the shaft.
   time=near()&&pose().l===2*dock?0:time+dt;
   if(time>3){wanted=dock;transition('closing')}
   return false
  }
  if(['idle','open','preparing'].includes(state))return false;
  time+=dt;const duration=d=>(reduced?Math.min(.46,d):d);
  if(state==='opening'||state==='closing'){
   const u=Math.min(1,time/duration(.86));opening=state==='opening'?smooth(u):1-smooth(u);
   model.update(height,dock,opening);
   if(u===1){if(opening)transition('open');else if(wanted===dock)transition('idle');else{origin=height;transition('travel')}}
  }else if(state==='travel'){
   const u=Math.min(1,time/duration(.8+Math.abs(floors[wanted]-origin)*.36));height=mix(origin,floors[wanted],smooth(u));model.update(height,-1,0);
   if(aboard)setCamera(seat.x,seat.z);
   if(u===1){dock=wanted;if(aboard)setCamera(seat.x,seat.z);transition('opening')}
  }else if(state==='boarding'){
   const u=Math.min(1,time/duration(2.05));
   if(u<.37){const f=smooth(u/.37);setCamera(mix(startPos.x,arrival.x,f),mix(startPos.z,sill.z,f));look(-Math.PI/2)}
   else{const f=smooth((u-.37)/.63);setCamera(mix(arrival.x,seat.x,f),sill.z);look(f<.4?-Math.PI/2:Math.PI/2)}
   if(u===1){aboard=true;transition('open')}
  }else if(state==='exiting'){
   const u=Math.min(1,time/duration(1.25));setCamera(mix(seat.x,arrival.x,smooth(u)),sill.z);
   if(u===1){aboard=false;transition('open')}
  }
  return true
 }
 action.onclick=call;choices.forEach((b,i)=>b.onclick=()=>select(i));leave.onclick=exit;
 return {ui,tick,interact,locked:busy,key(){if(aboard){exit();return true}if(near()){call();return true}return false}}
}

