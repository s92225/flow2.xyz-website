/* Pure data rules for the second local demo iteration. No outbound capabilities. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./demo-engine.js'));else root.FlowLabEngine=factory(root.FlowDemoEngine);})(typeof window==='undefined'?this:window,function(E){
  'use strict';
  const clone=E.clone,days='一二三四五六日',shifts=['early','late'];
  const slots=[['early','早班','10:00–18:00'],['late','晚班','14:00–22:00']];
  const messageTexts=[
    '下星期：星期一早班；星期二全天；星期三全天；星期四晚班；星期五休息；星期六全天；星期日全天。',
    '我的時間：星期一全天；星期二休息；星期三早班；星期四全天；星期五全天；星期六晚班；星期日全天。',
    '下週可以：星期一晚班；星期二全天；星期三全天；星期四休息；星期五全天；星期六早班；星期日全天。',
    '星期一全天；星期二全天；星期三休息；星期四全天；星期五全天；星期六全天；星期日全天。',
    '星期一休息；星期二晚班；星期三全天；星期四全天；星期五全天；星期六全天；星期日全天。',
    '星期一全天；星期二全天；星期三全天；星期四早班；星期五全天；星期六全天；星期日休息。'
  ];
  function parseAvailability(text){
    const result=Array(7).fill(null),errors=[];let rest=null;
    for(const part of String(text).split(/[；;，,。\n]+/).filter(x=>x.trim())){
      let value=null;
      if(/休息|不能|不可|不行|唔得|沒空|冇空/.test(part))value=[];
      else if(/全天|全日|早晚|任何班|都可以/.test(part))value=shifts.slice();
      else if(/早班/.test(part))value=['early'];else if(/晚班/.test(part))value=['late'];
      if(value===null){if(/星期|週|周|其餘|每天|全週/.test(part))errors.push('未能確認班次：'+part.trim());continue;}
      if(/其餘/.test(part)){rest=value;continue;}
      let indexes=[];
      if(/每天|全週|全星期/.test(part))indexes=[0,1,2,3,4,5,6];
      else{
        const range=part.match(/(?:星期|週|周)([一二三四五六日天])\s*(?:至|到|-)\s*(?:星期|週|周)?([一二三四五六日天])/);
        if(range){const a=days.indexOf(range[1].replace('天','日')),b=days.indexOf(range[2].replace('天','日'));if(a<=b)indexes=Array.from({length:b-a+1},(_,i)=>a+i);}
        else indexes=[...part.matchAll(/(?:星期|週|周)([一二三四五六日天])/g)].map(x=>days.indexOf(x[1].replace('天','日')));
        if(/週末|周末/.test(part))indexes.push(5,6);
      }
      for(const day of new Set(indexes)){if(result[day]!==null&&JSON.stringify(result[day])!==JSON.stringify(value))errors.push(`星期${days[day]}出現互相矛盾的回覆。`);result[day]=value.slice();}
    }
    for(let i=0;i<7;i++)if(result[i]===null){if(rest!==null)result[i]=rest.slice();else errors.push(`未提供星期${days[i]}的可用班次。`);}
    return {ok:!errors.length,days:result,errors};
  }
  const signature=messages=>messages.map(m=>m.id+':'+m.text).join('|');
  function parseRoster(r){
    const errors=[],employees=clone(r.employees);
    for(const employee of employees){const message=r.messages.find(m=>m.employeeId===employee.id);const parsed=parseAvailability(message?.text||'');if(!parsed.ok)errors.push(...parsed.errors.map(x=>employee.name+'：'+x));else{employee.shifts=parsed.days;employee.available=parsed.days.map(x=>x.length?1:0);employee.sourceMessage=message.id;}}
    return errors.length?{ok:false,errors}:{ok:true,employees,signature:signature(r.messages)};
  }
  function planRoster(employees){
    const schedule=Object.fromEntries(employees.map(e=>[e.id,Array(7).fill('')])),counts=Object.fromEntries(employees.map(e=>[e.id,0]));let attempts=0;
    function solve(slot){if(slot===14)return true;if(++attempts>60000)return false;const day=slot>>1,shift=shifts[slot%2];const available=employees.filter(e=>e.shifts[day].includes(shift)&&!schedule[e.id][day]&&counts[e.id]<e.max);const pairs=[];for(let a=0;a<available.length;a++)for(let b=a+1;b<available.length;b++)if(available[a].key||available[b].key)pairs.push([available[a],available[b]]);pairs.sort((a,b)=>(counts[a[0].id]+counts[a[1].id])-(counts[b[0].id]+counts[b[1].id]));for(const pair of pairs){pair.forEach(e=>{schedule[e.id][day]=shift;counts[e.id]++;});if(solve(slot+1))return true;pair.forEach(e=>{schedule[e.id][day]='';counts[e.id]--;});}return false;}
    if(!solve(0))return {ok:false,reason:attempts>60000?'未能在此示範的運算上限內找到完整更表。請放寬可用時間或班數限制。':'訊息中的可用班次不足以符合每班人數及負責人要求。請調整回覆後重新解析。'};
    const used=Object.fromEntries(employees.map(e=>[e.id,Array(7).fill('')])),usedCount=Object.fromEntries(employees.map(e=>[e.id,0]));const trace=[];
    for(let day=0;day<7;day++)for(const shift of shifts){const chosen=employees.filter(e=>schedule[e.id][day]===shift).map(e=>e.id);const candidates=employees.map(e=>({id:e.id,name:e.name,source:e.sourceMessage,chosen:chosen.includes(e.id),reason:!e.shifts[day].includes(shift)?'訊息未提供此班':used[e.id][day]?'同日已安排班次':usedCount[e.id]>=e.max?'已達每週上限':chosen.includes(e.id)?'符合條件，完成配對':'本班名額已滿'}));trace.push({day,shift,chosen,candidates});chosen.forEach(id=>{used[id][day]=shift;usedCount[id]++;});}
    return {ok:true,schedule,trace,attempts};
  }
  function rosterIssues(r){const issues=E.rosterIssues(r.employees,r.schedule);for(const employee of r.employees)for(let day=0;day<7;day++){const shift=r.schedule[employee.id]?.[day];if(shift&&employee.shifts&&!employee.shifts[day].includes(shift)&&employee.available[day])issues.push({employee:employee.id,day,text:`${employee.name}的群組回覆未提供星期${days[day]}${shift==='early'?'早班':'晚班'}。`});}return issues;}
  const memberNames=['陳芷晴','林卓軒','黃思穎','李浩然','何穎欣','張樂瑤','周俊熙','鄭嘉敏','許梓軒','葉凱婷','梁曉彤','吳子朗','黃凱欣','陳俊廷','劉詠詩','謝樂怡','何柏言','林紫晴','李卓言','蔡詠恩','唐思晴','鄧嘉朗','徐可盈','馮展鵬'];
  const teachers=[{id:'t1',name:'林思穎',initial:'穎',style:'哈達瑜伽 · 入門基礎',about:'循序建立呼吸與動作的配合。',color:'sage'},{id:'t2',name:'陳允希',initial:'希',style:'流動瑜伽 · 力量訓練',about:'以連貫動作探索力量與平衡。',color:'lavender'},{id:'t3',name:'何詠晴',initial:'晴',style:'伸展放鬆 · 肩頸舒緩',about:'透過溫和練習，安排片刻休息。',color:'sand'}];
  function walletBalance(s){return s.yoga.wallet.initial+s.yoga.wallet.ledger.reduce((n,x)=>n+x.amount,0);}
  function bookYoga(s,id){const c=s.yoga.classes.find(x=>x.id===id);if(!c)return {ok:false,errors:['找不到此課程。']};if(walletBalance(s)<c.creditCost)return {ok:false,errors:['剩餘 Credits 不足，請先在 Credits 頁加入示範點數。']};const overlapping=s.yoga.bookings.find(b=>b.status==='active'&&s.yoga.classes.some(x=>x.id===b.classId&&x.date===c.date&&x.time<c.end&&x.end>c.time));if(overlapping)return {ok:false,errors:['您在這個時段已有其他預約，請先取消或改選時段。']};const result=E.reserve(s,id,s.yoga.member.name,s.yoga.member.email);if(result.ok){result.booking.creditCost=c.creditCost;s.yoga.wallet.ledger.unshift({id:'credit-'+result.booking.id,amount:-c.creditCost,label:`預約 ${c.name}`,bookingId:result.booking.id,at:new Date().toISOString()});}return result;}
  function cancelYoga(s,id){const b=s.yoga.bookings.find(x=>x.id===id);const result=E.cancel(s,id);if(result.ok)s.yoga.wallet.ledger.unshift({id:'refund-'+id,amount:b.creditCost||1,label:'取消課程，退回 Credits',bookingId:id,at:new Date().toISOString()});return result;}
  function attendees(s,c){return [...c.attendees.map(x=>({...x,seed:true})),...s.yoga.bookings.filter(b=>b.classId===c.id&&b.status==='active').map(b=>({...b,seed:false}))];}
  const industries=['保險','婚禮策劃','科技'],departments=['市場推廣','人力資源','商務發展'];
  function companySeed(){const groups=[['保險',['澄信保險顧問','盛曜保險服務','匯衡保險經紀','維港保障顧問','遠晴保險方案','朗譽風險顧問']],['婚禮策劃',['森嶼婚禮','映日婚禮策劃','悅序婚禮設計','晴海婚宴顧問','拾光婚禮企劃','白序婚禮工作室']],['科技',['序光科技','雲橋數碼','維度軟件','青嶼系統','嶺峰資訊','晴川科技']]];return groups.flatMap(([industry,names],g)=>names.map((name,i)=>({id:`co-${g}-${i}`,name,industry,region:i%2?'九龍':'香港島',size:i<2?'50–200':i<5?'201–1000':'1000+',domain:`demo-${g}-${i}.example`,departments:departments.filter((_,d)=>!(i===2&&d===2)),contact:i!==4,suppressed:i===5,contactName:['陳凱琳','林宇軒','何樂怡','鄭詠晴','黃子朗','梁嘉敏'][i],description:industry==='保險'?'企業保障及保險顧問服務':industry==='婚禮策劃'?'婚宴策劃及婚禮活動統籌':'企業軟件及數碼產品服務',source:'內建示範公司名錄'})));}
  function researchCompanies(s,criteria){return s.outreach.companies.filter(c=>(!criteria.industry||c.industry===criteria.industry)&&(!criteria.region||c.region===criteria.region)&&(!criteria.size||c.size===criteria.size)&&c.departments.includes(criteria.department)).map(c=>({...c,department:criteria.department,email:c.contact?`${criteria.department==='市場推廣'?'marketing':criteria.department==='人力資源'?'hr':'partnerships'}@${c.domain}`:'',selectable:c.contact&&!c.suppressed}));}
  function draftOutreach(s,companies){return companies.map(company=>({id:E.uid('outreach'),companyId:company.id,company:company.name,to:company.email,subject:`${company.name}｜${s.outreach.profile.venue}企業活動場地合作邀請`,body:`${company.contactName} 您好：\n\n我是 ${s.outreach.profile.sender}，來自 ${s.outreach.profile.venue}。我們留意到貴公司從事${company.industry}業務，希望向${company.department}團隊介紹一個適合${company.industry==='保險'?'客戶分享會、品牌活動及內部培訓':company.industry==='婚禮策劃'?'婚宴交流、婚禮發布及合作活動':'產品發布、客戶交流及團隊活動'}的活動空間。\n\n場地位於${s.outreach.profile.location}，可容納約 ${s.outreach.profile.capacity} 人，提供${s.outreach.profile.features}。\n\n如您正在規劃活動，歡迎回覆以了解場地安排。若這不是合適的聯絡方式，請告知，我們不會再跟進。\n\n${s.outreach.profile.sender}\n${s.outreach.profile.venue}\n${s.outreach.profile.email}`,status:'draft',reviewed:false,createdAt:new Date().toISOString()}));}
  function draftErrors(draft){const errors=[];if(!draft.subject.trim()||!draft.body.trim())errors.push('主旨及內容不可留空。');if(/[\r\n]/.test(draft.subject))errors.push('主旨不可包含換行。');if(!/^[^\s@]+@[^\s@]+\.example$/.test(draft.to))errors.push('本機模擬只接受 .example 示範收件地址。');return errors;}
  function seed(now){const s=E.seed(now);s.version=2;s.roster.messages=s.roster.employees.map((e,i)=>({id:'WA-'+e.id.toUpperCase(),employeeId:e.id,name:e.name,text:messageTexts[i],time:`09:${String(3+i*2).padStart(2,'0')}`}));s.roster.parsedSignature='';s.roster.generatedSignature='';s.yoga.member={id:'member-leah',name:'陳樂晴',email:'leah.chan@example.com'};s.yoga.wallet={initial:8,ledger:[]};s.yoga.classes.forEach((c,i)=>{c.teacherId=teachers.find(t=>t.name===c.teacher).id;c.creditCost=c.level==='進階'?2:1;c.attendees=Array.from({length:c.reserved},(_,n)=>({id:`seed-${c.id}-${n}`,name:memberNames[(i*3+n)%memberNames.length],email:`student-${i}-${n}@example.com`,present:false}));});s.outreach={criteria:{industry:'保險',department:'市場推廣',region:'',size:''},companies:companySeed(),profile:{venue:'海際活動空間',sender:'林家朗',location:'觀塘海濱',capacity:120,features:'投影設備、音響及彈性座位',email:'events@harbourroom.example'},results:[],drafts:[],researchAt:'',logs:[]};return s;}
  return {seed,clone,slots,days,teachers,parseAvailability,signature,parseRoster,planRoster,rosterIssues,walletBalance,bookYoga,cancelYoga,attendees,industries,departments,researchCompanies,draftOutreach,draftErrors};
});
