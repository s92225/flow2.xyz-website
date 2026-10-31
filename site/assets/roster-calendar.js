/* Rolling Hong Kong demo week. Preserve weekday settings and archive dated publications. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./demo-engine.js'));else root.FlowRosterCalendar=factory(root.FlowDemoEngine);})(typeof window==='undefined'?this:window,function(E){
  'use strict';
  const store='銅鑼灣門市';
  function sync(r,now=new Date()){
    const dates=E.nextWeek(now),weekChanged=JSON.stringify(r.dates)!==JSON.stringify(dates);
    let changed=false;
    if(weekChanged){
      if(r.dates?.length){
        r.weekHistory=[...(r.weekHistory||[]),E.clone({dates:r.dates,messages:r.messages,employees:r.employees,schedule:r.schedule,parsedSignature:r.parsedSignature,generatedSignature:r.generatedSignature,broadcasts:r.broadcasts||[]})].slice(-4);
      }
      r.dates=dates;r.broadcasts=[];r.calendarUpdatedAt=now.toISOString();changed=true;
    }
    if(r.store!==store){r.store=store;changed=true;}
    // Rename this fictional sample store without changing its employees or availability replies.
    for(const b of r.broadcasts||[]){if(b.text?.startsWith('向北生活選物｜')){b.text=b.text.replace(/^向北生活選物｜/,store+'｜');changed=true;}}
    return changed;
  }
  return {store,sync};
});
