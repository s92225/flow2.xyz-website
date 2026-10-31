/* Pure helpers shared by the demo views and regression checks. No network. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.FlowLabPolish=factory();})(typeof window==='undefined'?this:window,function(){
  const shiftName={early:'早班',late:'晚班'},week='一二三四五六日';
  function rosterSignature(r){return JSON.stringify([r.store,r.dates,r.parsedSignature,r.generatedSignature,r.employees.map(e=>[e.id,e.name]),r.schedule]);}
  function rosterMessage(r){const short=d=>`${+d.slice(5,7)}/${+d.slice(8)}`;return `${r.store||'銅鑼灣門市'}｜${short(r.dates[0])}–${short(r.dates[6])} 更表\n\n早班 10:00–18:00\n晚班 14:00–22:00\n\n`+r.employees.map(e=>`${e.name}\n${r.dates.map((d,i)=>`週${week[i]} ${short(d)} ${shiftName[r.schedule[e.id]?.[i]]||'休息'}`).join(' · ')}`).join('\n\n')+'\n\n請各位確認上班時間。如需調整，請在群組回覆。';}
  function outreachCounts(drafts){const sent=drafts.filter(d=>d.status==='simulated').length,inflight=drafts.filter(d=>d.status==='simulating').length;return {total:drafts.length,sent,pending:drafts.length-sent,inflight};}
  function filterRestaurants(data,filters){return data.filter(r=>(!filters.district||r.district===filters.district)&&(!filters.cuisine||(r.cuisines?r.cuisines.includes(filters.cuisine):r.cuisine===filters.cuisine))&&(!filters.budget||(r.high!=null&&r.high<=filters.budget))&&(!filters.people||(r.party!=null&&r.party>=filters.people))&&(!filters.vegetarian||r.vegetarian===true)&&(!filters.vegan||r.vegan===true)&&(!filters.family||r.family===true)&&(!filters.accessible||r.accessible===true));}
  return {rosterSignature,rosterMessage,outreachCounts,filterRestaurants};
});
