import {rooms,byId} from './places.js';
export function directory({en,at,move,stop}){
 const $=id=>document.getElementById(id),t=(a,b)=>en?b:a,dialog=$('index');let level=0;
 if(en){$('index-open').textContent='Room index';$('index-close').ariaLabel='Close';$('index-title').textContent='Room index';$('index-intro').textContent='Choose a space to explore.';$('travel-label').textContent='Travel by';$('travel').options[0].textContent='Walk the route';$('travel').options[1].textContent='Go directly';$('floor-tabs').ariaLabel='Floors'}
 if(matchMedia('(prefers-reduced-motion:reduce)').matches)$('travel').value='jump';
 function draw(){[...$('floor-tabs').children].forEach((b,i)=>b.setAttribute('aria-pressed',String(i===level)));$('entries').replaceChildren();
  for(const [i,r] of rooms.filter(r=>r.l===level*2).entries()){const b=document.createElement('button');b.dataset.place=r.id;const num=document.createElement('small');num.textContent=String(i+1).padStart(2,'0');const state=document.createElement('b');state.textContent=at().id===r.id?t('目前位置','Here'):'↗';b.append(num,document.createTextNode(r[en?'en':'zh']),state);b.onclick=()=>{dialog.close();move(r,$('travel').value==='jump')};$('entries').append(b)}
 }
 for(const [i,n] of ['G/F','1/F','2/F'].entries()){const b=document.createElement('button');b.textContent=n;b.onclick=()=>{level=i;draw()};$('floor-tabs').append(b)}
 $('index-open').onclick=()=>{stop();level=Math.round(at().l/2);draw();dialog.showModal()};$('index-close').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()});
}
