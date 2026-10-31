/* STILL studio, local-only business rules. No network, authentication or payment capabilities. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./demo-engine.js'),require('./lab-engine-v2.js'));
  else root.YogaStudioEngine=factory(root.FlowDemoEngine,root.FlowLabEngine);
})(typeof window==='undefined'?this:window,function(E,V){
  'use strict';
  const plans=[{id:'intro',name:'初遇套票',credits:3,price:420,description:'3 Credits · 初次探索不同練習'},{id:'regular',name:'日常練習',credits:10,price:1280,description:'10 Credits · 適合建立固定練習'},{id:'committed',name:'深耕練習',credits:20,price:2380,description:'20 Credits · 自由選擇團體課堂'}];
  const fail=(message)=>({ok:false,errors:[message]});
  const ok=(data={})=>({ok:true,...data});
  function ensure(s){
    const y=s.yoga;
    y.waitlist??=[];y.sales??=[];y.classActivity??=[];y.preferences??={reminders:true,marketing:false};
    y.studio??={name:'澄息瑜伽',location:'中環工作室',room:'Studio A',cancellation:'此本機示範可隨時取消，並退回全部 Credits。'};
    for(const c of y.classes){c.location??=y.studio.location;c.room??=y.studio.room;c.kind??='group';c.status??='scheduled';}
    return y;
  }
  const active=c=>c.status!=='cancelled';
  function list(s,filters={}){ensure(s);return s.yoga.classes.filter(c=>active(c)&&(!filters.teacher||c.teacherId===filters.teacher)&&(!filters.date||c.date===filters.date)&&(!filters.location||c.location===filters.location)&&(!filters.level||c.level===filters.level)&&(!filters.kind||c.kind===filters.kind)&&(!filters.q||[c.name,c.teacher,c.location].join(' ').toLowerCase().includes(String(filters.q).toLowerCase()))).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));}
  function book(s,id){ensure(s);const c=s.yoga.classes.find(c=>c.id===id);if(!c||!active(c))return fail('此課程已取消或不存在。');const r=V.bookYoga(s,id);if(r.ok){s.yoga.waitlist.filter(w=>w.classId===id&&w.status==='waiting'&&w.email===s.yoga.member.email).forEach(w=>{w.status='promoted';w.bookingId=r.booking.id;});}return r;}
  function cancel(s,id){ensure(s);return V.cancelYoga(s,id);}
  function joinWaitlist(s,id){
    const y=ensure(s),c=y.classes.find(c=>c.id===id);
    if(!c||!active(c))return fail('此課程已取消或不存在。');
    if(E.remaining(s,c)>0)return fail('此課程尚有名額，請直接預約。');
    if(y.bookings.some(b=>b.classId===id&&b.status==='active'&&b.email===y.member.email))return fail('您已預約此課程。');
    if(y.waitlist.some(w=>w.classId===id&&w.email===y.member.email&&w.status==='waiting'))return fail('您已在候補名單內。');
    const entry={id:E.uid('wait'),classId:id,name:y.member.name,email:y.member.email,status:'waiting',at:new Date().toISOString()};y.waitlist.push(entry);return ok({entry});
  }
  function leaveWaitlist(s,id){const w=ensure(s).waitlist.find(w=>w.id===id&&w.status==='waiting');if(!w)return fail('此候補已處理。');w.status='cancelled';return ok();}
  function releaseSeedSeat(s,classId,attendeeId){
    const y=ensure(s),c=y.classes.find(c=>c.id===classId);if(!c||!active(c))return fail('找不到有效課程。');
    const i=c.attendees.findIndex(a=>a.id===attendeeId);if(i<0||c.reserved<1)return fail('找不到此示範學員。');
    const attendee=c.attendees.splice(i,1)[0];c.reserved--;return ok({attendee});
  }
  function promote(s,id){
    const y=ensure(s),w=y.waitlist.find(w=>w.id===id&&w.status==='waiting');if(!w)return fail('此候補已處理。');
    const first=y.waitlist.find(x=>x.classId===w.classId&&x.status==='waiting');
    if(first.id!==w.id)return fail('請先處理排在前面的候補學員。');
    if(w.email!==y.member.email)return fail('此本機版本只處理目前示範學員的候補。');
    return book(s,w.classId);
  }
  function purchase(s,planId){const y=ensure(s),p=plans.find(p=>p.id===planId);if(!p)return fail('找不到此套票。');const sale={id:E.uid('sale'),planId:p.id,name:p.name,credits:p.credits,total:p.price,member:y.member.name,email:y.member.email,status:'simulated',at:new Date().toISOString()};y.sales.unshift(sale);y.wallet.ledger.unshift({id:'purchase-'+sale.id,amount:p.credits,label:'示範購買 '+p.name,at:sale.at,saleId:sale.id});return ok({sale});}
  function profile(s,input){
    const y=ensure(s),name=String(input.name||'').trim();if(!name||name.length>60)return fail('姓名須為 1–60 個字元。');
    // Identity stays fixed: changing an email would orphan existing bookings and queue positions.
    y.member.name=name;y.preferences={reminders:!!input.reminders,marketing:!!input.marketing};
    y.bookings.filter(b=>b.email===y.member.email).forEach(b=>b.name=name);y.waitlist.filter(w=>w.email===y.member.email).forEach(w=>w.name=name);return ok();
  }
  function attendance(s,classId,id,present){const y=ensure(s),c=y.classes.find(c=>c.id===classId);if(!c||!active(c))return fail('找不到有效課程。');const a=c.attendees.find(a=>a.id===id)||y.bookings.find(b=>b.id===id&&b.classId===classId&&b.status==='active');if(!a)return fail('找不到有效預約。');a.present=!!present;return ok();}
  function validDate(d){if(!/^\d{4}-\d{2}-\d{2}$/.test(d))return false;const x=new Date(d+'T12:00:00Z');return Number.isFinite(+x)&&x.toISOString().slice(0,10)===d;}
  function saveClass(s,input,id){
    const y=ensure(s),old=id?y.classes.find(c=>c.id===id):null;
    if(id&&(!old||!active(old)))return fail('找不到有效課程。');
    const teacher=V.teachers.find(t=>t.id===input.teacherId),name=String(input.name||'').trim(),capacity=Number(input.capacity),creditCost=Number(input.creditCost),time=String(input.time||''),end=String(input.end||''),date=String(input.date||''),kind=input.kind==='private'?'private':'group';
    if(!name||name.length>60||!teacher||!validDate(date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(end)||time>=end||!Number.isInteger(capacity)||capacity<1||capacity>40||!Number.isInteger(creditCost)||creditCost<1||creditCost>10)return fail('請填寫有效課程名稱、導師、日期、起訖時間、1–40 人容量及 1–10 Credits。');
    if(kind==='private'&&capacity!==1)return fail('私人課堂的容量必須為 1 人。');
    if(old&&capacity<V.attendees(s,old).length)return fail('容量不可少於現有預約人數。');
    // Do not silently reschedule existing customer bookings. Substituting the instructor is allowed.
    if(old&&V.attendees(s,old).length&&(old.date!==date||old.time!==time||old.end!==end||old.creditCost!==creditCost||old.kind!==kind))return fail('已有預約的課堂不可直接更改時段、類型或 Credits；請另開新課或取消原課。');
    if(y.classes.some(c=>active(c)&&c.id!==id&&c.teacherId===teacher.id&&c.date===date&&c.time<end&&c.end>time))return fail('此導師在同一時段已有課程。');
    // This fixture has one studio room; the same room cannot host two classes at once.
    if(y.classes.some(c=>active(c)&&c.id!==id&&c.date===date&&c.time<end&&c.end>time))return fail('Studio A 在同一時段已有課程。');
    const c={...(old||{id:E.uid('class'),reserved:0,attendees:[],price:0}),name,teacherId:teacher.id,teacher:teacher.name,date,time,end,capacity,creditCost,kind,level:input.level==='進階'?'進階':'入門',location:y.studio.location,room:y.studio.room,status:'scheduled'};
    if(old)Object.assign(old,c);else y.classes.push(c);
    y.classActivity.unshift({id:E.uid('activity'),classId:c.id,label:(old?'更新課程：':'新增課程：')+name,at:new Date().toISOString()});return ok({class:c});
  }
  function cancelClass(s,id){
    const y=ensure(s),c=y.classes.find(c=>c.id===id&&active(c));if(!c)return fail('找不到有效課程。');
    for(const b of y.bookings.filter(b=>b.classId===id&&b.status==='active'))V.cancelYoga(s,b.id);
    y.waitlist.filter(w=>w.classId===id&&w.status==='waiting').forEach(w=>w.status='cancelled');c.status='cancelled';
    y.classActivity.unshift({id:E.uid('activity'),classId:id,label:'取消課程：'+c.name,at:new Date().toISOString()});return ok();
  }
  function members(s){const y=ensure(s),map=new Map();for(const c of y.classes)for(const a of V.attendees(s,c)){if(!map.has(a.email))map.set(a.email,{name:a.name,email:a.email,visits:0,present:0,isCurrent:a.email===y.member.email});const m=map.get(a.email);if(active(c)){m.visits++;m.present+=a.present?1:0;}}const current=map.get(y.member.email)||{...y.member,visits:0,present:0,isCurrent:true};current.name=y.member.name;map.set(y.member.email,current);return [...map.values()].sort((a,b)=>Number(b.isCurrent)-Number(a.isCurrent)||a.name.localeCompare(b.name,'zh-HK'));}
  function report(s){const y=ensure(s),cs=list(s),booked=cs.reduce((n,c)=>n+V.attendees(s,c).length,0),capacity=cs.reduce((n,c)=>n+c.capacity,0),present=cs.reduce((n,c)=>n+V.attendees(s,c).filter(a=>a.present).length,0);return {classes:cs.length,booked,capacity,present,occupancy:capacity?booked/capacity:0,waiting:y.waitlist.filter(w=>w.status==='waiting').length,sales:y.sales.reduce((n,x)=>n+x.total,0),transactions:y.sales.length,members:members(s).length,days:[...new Set(cs.map(c=>c.date))].map(date=>({date,booked:cs.filter(c=>c.date===date).reduce((n,c)=>n+V.attendees(s,c).length,0),capacity:cs.filter(c=>c.date===date).reduce((n,c)=>n+c.capacity,0)}))};}
  return {plans,ensure,list,book,cancel,joinWaitlist,leaveWaitlist,releaseSeedSeat,promote,purchase,profile,attendance,saveClass,cancelClass,members,report};
});
