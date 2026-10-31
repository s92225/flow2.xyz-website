/* Pure calendar arithmetic. Dates are date-only values, never host-local midnight timestamps. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FlowYogaCalendar=api;})(typeof window==='undefined'?this:window,function(){
  'use strict';
  const pad=n=>String(n).padStart(2,'0'); // taste-skill-ignore: ISO calendar dates require two-digit months and days.
  function validMonth(value){return typeof value==='string'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(value)&&+value.slice(0,4)>0;}
  function dateObject(year,month,day){const d=new Date('2000-01-01T12:00:00Z');d.setUTCFullYear(year,month-1,day);return d;}
  function daysInMonth(month){if(!validMonth(month))throw new RangeError('Invalid calendar month');const [y,m]=month.split('-').map(Number);return dateObject(y,m+1,0).getUTCDate();}
  function shiftMonth(month,delta){if(!validMonth(month)||!Number.isInteger(delta))throw new RangeError('Invalid calendar month step');const [y,m]=month.split('-').map(Number),index=(y-1)*12+(m-1)+delta,bounded=Math.max(0,Math.min(9999*12-1,index));return String(Math.floor(bounded/12)+1).padStart(4,'0')+'-'+pad(bounded%12+1);}
  function monthLabel(month){if(!validMonth(month))throw new RangeError('Invalid calendar month');return `${+month.slice(0,4)} 年 ${+month.slice(5)} 月`;}
  function validDate(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||!validMonth(value.slice(0,7)))return false;return +value.slice(8)>0&&+value.slice(8)<=daysInMonth(value.slice(0,7));}
  function iso(d){return d.toISOString().slice(0,10);}
  function moveFocus(value,key){
    if(!validDate(value))throw new RangeError('Invalid calendar day');
    const [y,m,day]=value.split('-').map(Number),d=dateObject(y,m,day),weekday=(d.getUTCDay()+6)%7;
    if(key==='PageUp'||key==='PageDown'){const month=shiftMonth(value.slice(0,7),key==='PageUp'?-1:1);return month+'-'+pad(Math.min(day,daysInMonth(month)));}
    const delta={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7,Home:-weekday,End:6-weekday}[key];
    if(delta===undefined)return value;
    d.setUTCDate(d.getUTCDate()+delta);if(d.getUTCFullYear()<1||d.getUTCFullYear()>9999)return value;return iso(d);
  }
  function monthModel(month,classes,remaining=c=>Math.max(0,c.capacity-c.reserved)){
    if(!validMonth(month))throw new RangeError('Invalid calendar month');
    const [y,m]=month.split('-').map(Number),offset=(dateObject(y,m,1).getUTCDay()+6)%7,total=daysInMonth(month),length=Math.ceil((offset+total)/7)*7;
    const items=classes.filter(c=>c.status!=='cancelled'&&validDate(c.date)&&c.date.startsWith(month)).slice().sort((a,b)=>a.time.localeCompare(b.time)||a.id.localeCompare(b.id));
    const cells=Array.from({length},(_,i)=>{const day=i-offset+1;if(day<1||day>total)return null;const date=month+'-'+pad(day),rows=items.filter(c=>c.date===date);return {day,date,classes:rows,count:rows.length,seats:rows.reduce((n,c)=>n+Math.max(0,Number(remaining(c))||0),0)};});
    return {month,label:monthLabel(month),offset,total,classes:items,cells};
  }
  return {validMonth,validDate,daysInMonth,shiftMonth,monthLabel,moveFocus,monthModel};
});
