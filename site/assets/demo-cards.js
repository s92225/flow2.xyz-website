/* Small explanatory films lead to real, local-only workspaces. */
(() => {
  const art={
    roster:`<g class="dc-first"><rect x="54" y="45" width="245" height="170" rx="13" fill="white"/><path d="M54 82h245M96 45v170M137 82v133M178 82v133M219 82v133M260 82v133M54 126h245M54 170h245"/><g class="dc-grid"><rect x="106" y="94" width="22" height="20" rx="4" fill="#dce5ff"/><rect x="147" y="138" width="22" height="20" rx="4" fill="#dce5ff"/><rect x="188" y="94" width="22" height="20" rx="4" fill="#dce5ff"/><rect x="229" y="182" width="22" height="20" rx="4" fill="#e4daf5"/><rect x="270" y="138" width="20" height="20" rx="4" fill="#e4daf5"/></g></g><g class="dc-second"><circle cx="335" cy="112" r="24" fill="white"/><circle cx="370" cy="153" r="24" fill="white"/><circle cx="335" cy="105" r="6"/><path d="M324 125v-5a11 11 0 0 1 22 0v5M360 165v-4a10 10 0 0 1 20 0v4"/><circle cx="370" cy="147" r="6"/></g><g class="dc-third"><circle cx="289" cy="211" r="22" fill="#e8f4eb" stroke="none"/><path d="m280 211 6 6 12-13" stroke="#176f4e" stroke-width="2.4"/></g>`,
    yoga:`<g class="dc-first"><rect x="75" y="58" width="136" height="157" rx="13" fill="white"/><path d="M75 100h136M107 46v24m72-24v24"/><g stroke="none" fill="#d9def0"><rect x="96" y="122" width="22" height="20" rx="4"/><rect x="130" y="122" width="22" height="20" rx="4"/><rect x="164" y="122" width="22" height="20" rx="4"/><rect x="96" y="157" width="22" height="20" rx="4"/><rect x="130" y="157" width="22" height="20" rx="4"/></g></g><g class="dc-second"><rect x="238" y="85" width="146" height="114" rx="13" fill="white"/><circle cx="270" cy="119" r="14" fill="#edf1ff"/><path d="M268 112v8l5 3M295 116h64m-64 14h38"/><rect x="258" y="153" width="102" height="25" rx="12" fill="#171717" stroke="none"/></g><g class="dc-third"><circle cx="211" cy="162" r="25" fill="#e8f4eb" stroke="none"/><path d="m201 162 7 7 14-15" stroke="#176f4e" stroke-width="2.4"/></g>`,
    dining:`<g class="dc-first"><rect x="64" y="62" width="113" height="143" rx="11" fill="white" transform="rotate(-6 120 130)"/><path d="M86 91h57m-57 17h43m-43 43h57m-57 17h43"/><rect x="108" y="91" width="113" height="133" rx="11" fill="white"/><path d="M130 117h66m-66 17h43m-43 50h66m-66 17h43"/></g><g class="dc-second"><path d="M251 76h131a13 13 0 0 1 13 13v91a13 13 0 0 1-13 13h-98l-20 18v-18h-13a13 13 0 0 1-13-13V89a13 13 0 0 1 13-13Z" fill="white"/><path d="M264 107h102m-102 17h70"/><rect x="263" y="145" width="40" height="23" rx="5" fill="#edf1ff" stroke="none"/><rect x="310" y="145" width="57" height="23" rx="5" fill="#edf1ff" stroke="none"/></g><g class="dc-third"><circle cx="217" cy="75" r="23" fill="#fff0de" stroke="none"/><path d="m206 75 7 7 14-15" stroke="#99520c" stroke-width="2.4"/></g>`,
    email:`<g class="dc-first"><rect x="64" y="78" width="118" height="135" rx="12" fill="white"/><path d="M85 111h75m-75 18h54m-54 18h65"/><rect x="85" y="173" width="52" height="17" rx="5" fill="#edf1ff" stroke="none"/></g><g class="dc-second"><path d="m257 108 59-37 59 37v94H257Z" fill="white"/><rect x="277" y="57" width="80" height="111" rx="6" fill="white"/><path d="M292 82h50m-50 16h36m-36 16h44"/><path d="m257 108 59 43 59-43v94H257Z" fill="#e6ebff"/><path d="m257 202 59-51 59 51"/></g><g class="dc-third"><path d="M199 141h37m-9-9 9 9-9 9" stroke="#1749e7" stroke-width="2.8"/></g>`
  };
  const cards=[
    ['roster','零售門市排班','Retail staff scheduling','可用時間、班次與人手需求，一次安排。','Availability, shifts and staffing needs in one place.','01'],
    ['yoga','瑜伽課程預約','Yoga class booking','從選課到取消預約，名額自動更新。','Choose a class. Book a place. See capacity update.','02'],
    ['dining','餐廳知識庫 Chatbot','Restaurant knowledge assistant','用對話尋找餐廳，每個建議都有資料來源。','Find a restaurant in conversation, with traceable sources.','03'],
    ['email','客戶研究與外展','Research & outreach','設定目標客群，研究、撰寫及模擬寄送外展電郵。','Define an audience. Research, draft and simulate outreach.','04']
  ];
  const actions={
    roster:['試用排班系統','Try staff scheduling'],
    yoga:['試用瑜伽預約','Try yoga booking'],
    dining:['開啟餐廳助手','Open restaurant assistant'],
    email:['試用外展工作台','Try outreach workspace']
  };
  let observer;
  window.FlowDemoCards={render(container,locale){
    observer?.disconnect();const en=locale==='en';
    container.innerHTML=cards.map(([id,zh,english,body,engBody,index])=>{
      const action=actions[id][en?1:0];
      return `<article class="demo-entry" data-demo-entry><div class="demo-entry-head"><span class="demo-number">${index}</span><h3>${en?english:zh}</h3><p>${en?engBody:body}</p></div><a class="demo-launch" href="demos.html?demo=${id}" aria-label="${action} — ${en?english+' (Chinese interface)':zh+'（互動示範）'}"><div class="demo-art-link"><svg class="demo-entry-art" viewBox="0 0 460 260" aria-hidden="true">${art[id]}</svg></div><div class="demo-entry-foot"><span class="demo-entry-cta">${action}<span aria-hidden="true">↗</span></span></div></a></article>`;
    }).join('');
    observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-in-view');observer.unobserve(entry.target);}}),{threshold:.2});
    container.querySelectorAll('[data-demo-entry]').forEach(el=>observer.observe(el));
  }};
})();
