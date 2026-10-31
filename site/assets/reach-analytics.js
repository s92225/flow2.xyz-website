/* Historical, fictional campaign fixtures. Never inferred from the user's current send queue. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.FlowReachAnalytics=factory();})(typeof window==='undefined'?this:window,function(){
  'use strict';
  const DAY=86400000,end='2026-10-30',cutoff='2026-10-30T15:59:59.999Z';
  const campaigns=[{id:'year-end',name:'年末企業活動'},{id:'team-day',name:'團隊工作坊'},{id:'partner-night',name:'品牌交流酒會'}];
  const companies=['澄信保險顧問','盛曜保險服務','匯衡科技','向海策劃','晴川品牌顧問','啟程活動製作'];
  const dayOf=iso=>new Date(Date.parse(iso)+8*3600000).toISOString().slice(0,10);
  const normalize=email=>String(email||'').trim().toLowerCase();
  function fixture(){
    const messages=[],bookings=[];let serial=0;
    for(let day=1;day<=30;day++){
      const date=`2026-10-${String(day).padStart(2,'0')}`,weekday=new Date(date+'T12:00:00+08:00').getUTCDay(); // taste-skill-ignore: ISO calendar dates and clock hours, not decorative numbered labels
      const count=[0,6].includes(weekday)?0:13+(day*7)%12;
      for(let n=0;n<count;n++){
        const i=++serial,campaign=campaigns[(day+n)%campaigns.length],company=companies[i%companies.length],sentAt=`${date}T${String(1+n%7).padStart(2,'0')}:15:00.000Z`; // taste-skill-ignore: ISO calendar dates and clock hours, not decorative numbered labels
        const status=i%19===0?'bounced':day===30&&n>=count-2?'pending':'delivered';
        const deliveredAt=status==='delivered'?new Date(Date.parse(sentAt)+120000).toISOString():null;
        const openedAt=status==='delivered'&&i%7<3?new Date(Date.parse(sentAt)+35*60000).toISOString():null;
        const clickedAt=openedAt&&i%3===0?new Date(Date.parse(openedAt)+12*60000).toISOString():null;
        const m={id:'MSG-'+String(i).padStart(4,'0'),campaignId:campaign.id,company,email:`events+${i}@company-${i%6}.example`,sentAt,status,deliveredAt,openedAt,clickedAt};messages.push(m);
        if(status==='delivered'&&(clickedAt&&i%2===0||openedAt&&i%17===0)){
          const bookedAt=new Date(Date.parse(sentAt)+(1+i%4)*DAY).toISOString();
          if(bookedAt>cutoff)continue;
          const viaUtm=i%17!==0;
          bookings.push({id:'BK-'+String(bookings.length+1).padStart(3,'0'),company,email:viaUtm?`booking+${i}@company-${i%6}.example`:m.email.toUpperCase(),bookedAt,eventDate:new Date(Date.parse(bookedAt)+(14+i%21)*DAY).toISOString().slice(0,10),status:i%11===0?'cancelled':'confirmed',value:4200+(i%9)*800,utm:viaUtm?{source:'reach',medium:'email',campaign:campaign.id,content:m.id}:null});
        }
      }
    }
    // A genuine unmatched and a cancelled fixture keep attribution from being a 100% success story.
    bookings.push({id:'BK-DIRECT',company:'栩栩設計工作室',email:'hello@direct-booking.example',bookedAt:'2026-10-24T03:00:00.000Z',eventDate:'2026-11-12',status:'confirmed',value:5200,utm:{source:'direct',medium:'website'}});
    return {simulated:true,periodEnd:end,cutoff,campaigns:campaigns.map(c=>({...c})),messages,bookings};
  }
  function attribution(history){
    const seen=new Set(),rows=[];
    for(const b of history.bookings){
      if(seen.has(b.id))continue;seen.add(b.id);
      if(b.status!=='confirmed'||!Number.isFinite(Date.parse(b.bookedAt))||b.bookedAt>history.cutoff)continue;
      const eligible=history.messages.filter(m=>m.status==='delivered'&&m.deliveredAt&&Date.parse(m.deliveredAt)<=Date.parse(b.bookedAt)&&Date.parse(b.bookedAt)-Date.parse(m.sentAt)<=30*DAY);
      const u=b.utm,hasUtm=u&&Object.values(u).some(Boolean);
      let message=null,method='';
      if(hasUtm){if(u.source==='reach'&&u.medium==='email')message=eligible.find(m=>m.id===u.content&&m.campaignId===u.campaign);if(message)method='utm';}
      else if(normalize(b.email)){message=eligible.filter(m=>normalize(m.email)===normalize(b.email)).sort((a,c)=>Date.parse(c.sentAt)-Date.parse(a.sentAt)||a.id.localeCompare(c.id))[0];if(message)method='email';}
      if(message)rows.push({booking:{...b},message:{...message},method});
    }
    return rows.sort((a,b)=>b.booking.bookedAt.localeCompare(a.booking.bookedAt));
  }
  function report(history,{days=30,campaign='all'}={}){
    days=[7,14,30].includes(Number(days))?Number(days):30;
    if(campaign!=='all'&&!history.campaigns.some(c=>c.id===campaign))campaign='all';
    const end=history.periodEnd,start=new Date(Date.parse(end+'T00:00:00Z')-(days-1)*DAY).toISOString().slice(0,10);
    const dates=Array.from({length:days},(_,i)=>new Date(Date.parse(start+'T00:00:00Z')+i*DAY).toISOString().slice(0,10));
    const inRange=iso=>iso&&dayOf(iso)>=start&&dayOf(iso)<=end&&Date.parse(iso)<=Date.parse(history.cutoff);
    const messages=history.messages.filter(m=>inRange(m.sentAt)&&(campaign==='all'||m.campaignId===campaign));
    const rows=attribution(history).filter(r=>inRange(r.booking.bookedAt)&&(campaign==='all'||r.message.campaignId===campaign));
    const totals={sent:messages.length,delivered:0,opened:0,bounced:0,pending:0,bookings:rows.length,revenue:rows.reduce((n,r)=>n+r.booking.value,0),utm:rows.filter(r=>r.method==='utm').length,email:rows.filter(r=>r.method==='email').length};
    const daily=dates.map(date=>({date,sent:0,delivered:0,opened:0,bounced:0,pending:0,bookings:0})),byDate=new Map(daily.map(r=>[r.date,r]));
    for(const m of messages){const d=byDate.get(dayOf(m.sentAt));d.sent++;if(m.status==='delivered'&&m.deliveredAt<=history.cutoff){totals.delivered++;d.delivered++;if(m.openedAt&&m.openedAt<=history.cutoff){totals.opened++;d.opened++;}}else if(m.status==='bounced'){totals.bounced++;d.bounced++;}else{totals.pending++;d.pending++;}}
    for(const r of rows)byDate.get(dayOf(r.booking.bookedAt)).bookings++;
    return {simulated:true,start,end,cutoff:history.cutoff,days,campaign,totals,daily,rows,campaigns:history.campaigns};
  }
  return {fixture,attribution,report,dayOf};
});
