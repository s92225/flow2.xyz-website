/* Pure local demo data and business rules. No network, credentials or live services. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FlowDemoEngine = api;
})(typeof window === 'undefined' ? this : window, function () {
  'use strict';
  const VERSION = 1;
  const clone = x => JSON.parse(JSON.stringify(x));
  const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const uid = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
  const iso = date => date.toISOString().slice(0,10);
  function nextWeek(now = new Date()) {
    const today = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Hong_Kong',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
    const d = new Date(`${today}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + ((8-d.getUTCDay()) % 7 || 7));
    return Array.from({length:7}, (_,i) => { const n = new Date(d); n.setUTCDate(n.getUTCDate()+i); return iso(n); });
  }
  const staff = [
    {id:'e1',name:'林芷晴',initial:'晴',role:'店長',key:true,max:5,available:[1,1,1,1,0,1,1]},
    {id:'e2',name:'陳浩然',initial:'然',role:'副店長',key:true,max:5,available:[1,0,1,1,1,1,1]},
    {id:'e3',name:'黃嘉敏',initial:'敏',role:'資深店務員',key:true,max:5,available:[1,1,1,0,1,1,1]},
    {id:'e4',name:'李俊熙',initial:'熙',role:'店務員',key:false,max:5,available:[1,1,0,1,1,1,1]},
    {id:'e5',name:'何穎欣',initial:'欣',role:'店務員',key:false,max:5,available:[0,1,1,1,1,1,1]},
    {id:'e6',name:'鄭樂文',initial:'文',role:'兼職店務員',key:false,max:5,available:[1,1,1,1,1,1,0]}
  ];
  function rosterIssues(employees, schedule) {
    const issues=[];
    for(let day=0;day<7;day++) for(const shift of ['early','late']) {
      const assigned=employees.filter(e=>schedule[e.id]?.[day]===shift);
      if(assigned.length!==2) issues.push({day,shift,text:`星期${'一二三四五六日'[day]}${shift==='early'?'早班':'晚班'}需要 2 人，目前 ${assigned.length} 人。`});
      if(assigned.length && !assigned.some(e=>e.key)) issues.push({day,shift,text:`星期${'一二三四五六日'[day]}${shift==='early'?'早班':'晚班'}缺少開店／結店負責人。`});
    }
    for(const e of employees) {
      const row=schedule[e.id]||[];const assigned=row.filter(Boolean).length;
      if(assigned>e.max) issues.push({employee:e.id,text:`${e.name}已排 ${assigned} 班，超過上限 ${e.max} 班。`});
      row.forEach((v,day)=>{if(v&&!e.available[day])issues.push({employee:e.id,day,text:`${e.name}在星期${'一二三四五六日'[day]}不可上班。`});});
    }
    return issues;
  }
  function autoRoster(employees) {
    if(employees.reduce((n,e)=>n+Math.min(e.max,e.available.filter(Boolean).length),0)<28 || employees.filter(e=>e.key).reduce((n,e)=>n+Math.min(e.max,e.available.filter(Boolean).length),0)<14 || Array.from({length:7},(_,d)=>employees.filter(e=>e.available[d]).length<4||employees.filter(e=>e.available[d]&&e.key).length<2).some(Boolean)) return {ok:false,reason:'可用人手或負責人班數不足。每日至少需要 4 位員工（其中 2 位為負責人），全週需要 28 個人次。請調整條件後重試。',attempts:0};
    const schedule=Object.fromEntries(employees.map(e=>[e.id,Array(7).fill('')]));
    const counts=Object.fromEntries(employees.map(e=>[e.id,0]));
    let attempts=0;
    function solve(slot) {
      if(slot===14)return true;
      if(++attempts>50000)return false;
      const day=Math.floor(slot/2),shift=slot%2?'late':'early';
      const available=employees.filter(e=>e.available[day]&&!schedule[e.id][day]&&counts[e.id]<e.max);
      const pairs=[];
      for(let i=0;i<available.length;i++)for(let j=i+1;j<available.length;j++) {
        const a=available[i],b=available[j]; if(!a.key&&!b.key)continue;
        pairs.push([a,b]);
      }
      pairs.sort((a,b)=>(counts[a[0].id]+counts[a[1].id])-(counts[b[0].id]+counts[b[1].id]) || a[0].id.localeCompare(b[0].id));
      for(const pair of pairs) {
        pair.forEach(e=>{schedule[e.id][day]=shift;counts[e.id]++;});
        if(solve(slot+1))return true;
        pair.forEach(e=>{schedule[e.id][day]='';counts[e.id]--;});
      }
      return false;
    }
    return solve(0)?{ok:true,schedule,attempts}:{ok:false,reason:attempts>50000?'此示範未能在運算上限內找到合適更表。請放寬條件後重試。':'目前的可用時間或每週班數不足，無法同時滿足每日人數與負責人要求。請調整條件後重試。',attempts};
  }
  const restaurants = [
    {id:'R-001',name:'小森食堂',district:'尖沙咀',cuisine:'日本菜',low:120,high:180,vegetarian:false,vegan:false,family:true,accessible:true,party:6,hours:'12:00–15:00、18:00–22:00',signature:'烤魚定食、季節野菜天婦羅',description:'主打日式定食，設有四人餐桌及少量六人座位。',note:'可提供不含肉類的個別菜式，但不是素食餐廳。'},
    {id:'R-002',name:'青禾蔬食',district:'尖沙咀',cuisine:'素食',low:90,high:150,vegetarian:true,vegan:true,family:true,accessible:true,party:8,hours:'11:30–21:00',signature:'烤南瓜穀物碗、菇菌燴飯',description:'全素餐廳，菜單不使用肉類、蛋或奶類，適合小型聚餐。',note:'過敏原及交叉接觸資料未列明，需另行確認。'},
    {id:'R-003',name:'榆木餐桌',district:'中環',cuisine:'意大利菜',low:220,high:320,vegetarian:false,vegan:false,family:false,accessible:false,party:6,hours:'12:00–15:00、18:00–23:00',signature:'手工闊麵、檸檬烤雞',description:'以手工意粉為主，晚市氣氛安靜，適合二至四人用餐。',note:'入口設有樓梯；未提供無障礙升降設施。'},
    {id:'R-004',name:'曼谷小院',district:'銅鑼灣',cuisine:'泰國菜',low:140,high:200,vegetarian:false,vegan:false,family:true,accessible:true,party:8,hours:'12:00–22:30',signature:'香茅烤雞、青咖喱、芒果糯米飯',description:'泰式家常菜，可分享大份菜式，適合朋友及家庭聚餐。',note:'部分菜式含魚露；未列明所有配料。'},
    {id:'R-005',name:'日和壽司屋',district:'銅鑼灣',cuisine:'日本菜',low:180,high:280,vegetarian:false,vegan:false,family:false,accessible:true,party:4,hours:'12:00–14:30、18:00–22:00',signature:'午市壽司定食、海鮮丼',description:'以壽司及刺身為主，設吧枱及四人座位。',note:'示範資料未列出即日漁獲及實際供應。'},
    {id:'R-006',name:'街角茶記',district:'旺角',cuisine:'港式',low:50,high:85,vegetarian:false,vegan:false,family:true,accessible:false,party:4,hours:'07:30–21:30',signature:'焗豬扒飯、菠蘿油、奶茶',description:'港式茶餐廳，提供早餐、午市快餐及晚餐。',note:'繁忙時段的等候時間沒有紀錄。'},
    {id:'R-007',name:'南風粵饌',district:'觀塘',cuisine:'粵菜',low:130,high:190,vegetarian:false,vegan:false,family:true,accessible:true,party:12,hours:'11:00–15:00、18:00–22:00',signature:'點心拼盤、豉油雞、時令小炒',description:'設有大圓桌及兒童座椅，適合家庭及同事聚餐。',note:'包房、訂座空位及服務費未在示範資料中確認。'},
    {id:'R-008',name:'豆町咖啡',district:'上環',cuisine:'咖啡店',low:70,high:120,vegetarian:true,vegan:false,family:false,accessible:true,party:4,hours:'08:00–18:00',signature:'咖啡、牛油果多士、芝士蛋糕',description:'提供蛋奶素輕食，適合早餐及下午茶。',note:'不是全素餐廳；部分菜式含蛋奶。'},
    {id:'R-009',name:'和煦小館',district:'中環',cuisine:'日本菜',low:110,high:170,vegetarian:false,vegan:false,family:true,accessible:true,party:6,hours:'11:30–21:30',signature:'雞肉親子丼、蕎麥麵、烤鯖魚',description:'日式家庭料理，以簡單定食及飯麵為主。',note:'不提供即時排隊或訂座資訊。'},
    {id:'R-010',name:'田野植物廚房',district:'旺角',cuisine:'素食',low:100,high:160,vegetarian:true,vegan:true,family:true,accessible:true,party:6,hours:'12:00–21:00',signature:'植物漢堡、香草菇菌意粉',description:'全素西式料理，設兒童餐及無障礙入口。',note:'菜式及價錢均為虛構示範設定。'}
  ];
  const emptyFilters=()=>({district:'',cuisine:'',budget:0,people:0,vegetarian:false,vegan:false,accessible:false,family:false});
  function parseDining(query, previous=emptyFilters()) {
    const q=String(query).trim().toLowerCase();
    const filters=/重設|重新搜尋|不限條件|reset|start over/.test(q)?emptyFilters():{...emptyFilters(),...previous};
    const aliases={尖沙咀:['尖沙咀','尖沙嘴','tst','tsim sha tsui'],中環:['中環','central'],銅鑼灣:['銅鑼灣','cwb','causeway bay'],旺角:['旺角','mong kok'],觀塘:['觀塘','kwun tong'],上環:['上環','sheung wan']};
    for(const [district,names] of Object.entries(aliases))if(names.some(n=>q.includes(n)))filters.district=district;
    const cuisines={日本菜:['日本','日式','壽司','japanese','sushi'],意大利菜:['意大利','意粉','italian','pasta'],泰國菜:['泰國','泰式','thai'],港式:['港式','茶餐廳','茶記'],粵菜:['粵菜','廣東菜','點心','cantonese'],咖啡店:['咖啡','下午茶','cafe','coffee'],韓國菜:['韓國','韓式','korean'],法國菜:['法國','法式','french']};
    for(const [cuisine,names] of Object.entries(cuisines))if(names.some(n=>q.includes(n)))filters.cuisine=cuisine;
    if(/不限地區|任何地區|all districts/.test(q))filters.district='';
    if(/不限菜式|任何菜式|all cuisines/.test(q))filters.cuisine='';
    const budget=q.match(/(?:人均|每人|每位|預算|budget|under|hkd?|\$)\s*\$?\s*(\d{2,4})/)||q.match(/(\d{2,4})\s*(?:元|蚊|以下|內)/);
    if(budget)filters.budget=Math.min(2000,Number(budget[1]));
    if(/一百五十/.test(q))filters.budget=150;else if(/二百|兩百/.test(q))filters.budget=200;else if(/一百/.test(q))filters.budget=100;
    if(/便宜|平一點|平啲|cheaper/.test(q))filters.budget=Math.max(50,(filters.budget||200)-50);
    const people=q.match(/(\d{1,2})\s*(?:位|人|people|persons)/);if(people)filters.people=Number(people[1]);
    if(/不需要素食|唔使素食|不要素食/.test(q)){filters.vegetarian=false;filters.vegan=false;}
    else if(/全素|vegan/.test(q)){filters.vegan=true;filters.vegetarian=true;}
    else if(/素食|vegetarian/.test(q))filters.vegetarian=true;
    if(/無障礙|輪椅|wheelchair|accessible/.test(q))filters.accessible=true;
    if(/親子|兒童|小朋友|family|children/.test(q))filters.family=true;
    const safety=/過敏|敏感|allerg|gluten|清真|halal|無麩質/.test(q);
    const unknownFact=/評分|評價最高|訂座空位|即時|等位|營業中|rating|availability|open now/.test(q);
    const record=restaurants.find(r=>q.includes(r.name.toLowerCase()));
    const unsupported=/天氣|股票|新聞|weather|stock price/.test(q);
    const intent=Object.keys(aliases).some(d=>filters.district===d)||Boolean(filters.cuisine||filters.budget||filters.people||filters.vegetarian||filters.family||filters.accessible)||/餐廳|食|吃|推薦|介紹|restaurant|dinner|lunch|food|reset|重設/.test(q);
    return {filters,safety,unknownFact,recordId:record?.id,unsupported:unsupported||(!intent&&!record)};
  }
  function findRestaurants(filters, catalogue=restaurants) {
    return catalogue.filter(r=>(!filters.district||r.district===filters.district)&&(!filters.cuisine||r.cuisine===filters.cuisine)&&(!filters.budget||r.high<=filters.budget)&&(!filters.people||r.party>=filters.people)&&(!filters.vegetarian||r.vegetarian)&&(!filters.vegan||r.vegan)&&(!filters.accessible||r.accessible)&&(!filters.family||r.family)).sort((a,b)=>a.high-b.high||a.id.localeCompare(b.id));
  }
  const templates={
    'booking.confirmed':{enabled:true,subject:'{name}，您的 {class} 預約已確認',body:'您好 {name}：\n\n感謝您預約澄息瑜伽的課程。\n\n課程：{class}\n日期：{date}\n時間：{time}\n預約編號：{bookingId}\n\n請提前 10 分鐘到達。若需要取消，請返回示範預約頁操作。\n\n澄息瑜伽團隊'},
    'booking.cancelled':{enabled:true,subject:'{name}，您的課程預約已取消',body:'您好 {name}：\n\n您的 {class} 預約（{bookingId}）已取消，名額已釋出。\n\n日期：{date}\n時間：{time}\n\n歡迎選擇其他課程。\n澄息瑜伽團隊'},
    'enquiry.received':{enabled:true,subject:'{name}，我們已收到您的查詢',body:'您好 {name}：\n\n感謝您聯絡 {company}。我們已收到您的查詢：\n{topic}\n\n查詢編號：{enquiryId}\n我們會在下一個工作天跟進。\n\n{company} 團隊'}
  };
  const allowedTokens=['name','class','date','time','bookingId','company','topic','enquiryId'];
  function templateErrors(t) {
    const errors=[];if(!t.subject.trim())errors.push('請填寫電郵主旨。');if(!t.body.trim())errors.push('請填寫電郵內容。');
    const tokens=[...`${t.subject}\n${t.body}`.matchAll(/\{([^{}]+)\}/g)].map(x=>x[1]);
    for(const key of new Set(tokens))if(!allowedTokens.includes(key))errors.push(`未支援的變數：{${key}}。`);
    if(/[\r\n]/.test(t.subject))errors.push('電郵主旨不可包含換行。');
    return errors;
  }
  const merge=(s,data)=>String(s).replace(/\{([^{}]+)\}/g,(_,key)=>String(data[key]??'—'));
  function queueEmail(state,event) {
    if(state.events.includes(event.id))return {ok:true,duplicate:true};
    const t=state.email.rules[event.type];
    if(!t?.enabled)return {ok:true,skipped:true};
    const errors=templateErrors(t);if(errors.length)return {ok:false,errors};
    const item={id:uid('mail'),eventId:event.id,type:event.type,to:event.email,name:event.data.name,subject:merge(t.subject,event.data),body:merge(t.body,event.data),createdAt:new Date().toISOString(),status:'draft'};
    state.email.outbox.unshift(item);state.events.push(event.id);return {ok:true,item};
  }
  function reserve(state,classId,name,email) {
    const course=state.yoga.classes.find(c=>c.id===classId);const errors=[];
    name=String(name).trim();email=String(email).trim().toLowerCase();
    if(!course)errors.push('找不到所選課程。');
    if(!name||name.length>60)errors.push('請填寫 1 至 60 個字的姓名。');
    if(!/^[^\s@\r\n]+@[^\s@\r\n]+\.[^\s@\r\n]+$/.test(email)||email.length>160)errors.push('請填寫有效的電郵地址。');
    if(course&&remaining(state,course)<=0)errors.push('此課程已額滿，請選擇其他課程。');
    if(state.yoga.bookings.some(b=>b.classId===classId&&b.email===email&&b.status==='active'))errors.push('此電郵地址已有同一課程的有效預約。');
    if(errors.length)return {ok:false,errors};
    const booking={id:uid('Y').toUpperCase(),classId,name,email,status:'active',createdAt:new Date().toISOString()};
    state.yoga.bookings.unshift(booking);
    const mail=queueEmail(state,{id:booking.id+'-confirmed',type:'booking.confirmed',email,data:{name,class:course.name,date:course.date,time:course.time,bookingId:booking.id}});
    return {ok:true,booking,mail};
  }
  function cancel(state,id) {
    const booking=state.yoga.bookings.find(b=>b.id===id);if(!booking||booking.status!=='active')return {ok:false,errors:['此預約已取消或不存在。']};
    booking.status='cancelled';const course=state.yoga.classes.find(c=>c.id===booking.classId);
    const mail=queueEmail(state,{id:booking.id+'-cancelled',type:'booking.cancelled',email:booking.email,data:{name:booking.name,class:course.name,date:course.date,time:course.time,bookingId:id}});
    return {ok:true,booking,mail};
  }
  function remaining(state,course){return course.capacity-course.reserved-state.yoga.bookings.filter(b=>b.classId===course.id&&b.status==='active').length;}
  function seed(now=new Date()) {
    const dates=nextWeek(now);const employees=clone(staff);const solved=autoRoster(employees);const schedule=clone(solved.schedule);
    Object.values(schedule).forEach(row=>row.forEach((_,d)=>{if(d>2)row[d]='';}));
    const rows=[['基礎哈達瑜伽','入門','林思穎','09:00','10:00',0,12,7,180],['流動瑜伽','進階','陳允希','19:00','20:00',0,10,6,200],['肩頸舒緩','入門','何詠晴','12:30','13:20',1,10,10,160],['日落伸展','入門','林思穎','18:30','19:30',2,12,8,180],['力量流動','進階','陳允希','19:00','20:00',3,10,5,200],['週末晨間瑜伽','入門','何詠晴','10:00','11:00',5,14,11,180],['深層放鬆','入門','林思穎','16:00','17:00',6,12,8,180]];
    return {version:VERSION,roster:{dates,employees,schedule},yoga:{classes:rows.map((r,i)=>({id:'C'+(i+1),name:r[0],level:r[1],teacher:r[2],time:r[3],end:r[4],date:dates[r[5]],capacity:r[6],reserved:r[7],price:r[8]})),bookings:[]},dining:{filters:emptyFilters(),messages:[]},email:{rules:clone(templates),outbox:[]},events:[]};
  }
  function csv(rows){return '\uFEFF'+rows.map(row=>row.map(value=>{let s=String(value??'');if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}).join(',')).join('\r\n');}
  function eml(mail) {
    const b64=s=>typeof Buffer!=='undefined'?Buffer.from(s,'utf8').toString('base64'):btoa(String.fromCharCode(...new TextEncoder().encode(s)));
    const clean=s=>String(s).replace(/[\r\n]/g,' ');
    return ['From: Flow2 Demo <no-reply@demo.example>',`To: ${clean(mail.to)}`,`Subject: =?UTF-8?B?${b64(clean(mail.subject))}?=`,'MIME-Version: 1.0','Content-Type: text/plain; charset=UTF-8','Content-Transfer-Encoding: base64','X-Unsent: 1','',b64(mail.body).match(/.{1,76}/g).join('\r\n')].join('\r\n');
  }
  return {VERSION,clone,esc,uid,nextWeek,seed,rosterIssues,autoRoster,restaurants,emptyFilters,parseDining,findRestaurants,templates,allowedTokens,templateErrors,merge,queueEmail,reserve,cancel,remaining,csv,eml};
});
