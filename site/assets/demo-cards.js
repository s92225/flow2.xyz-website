/* Screens captured from the working demos; each launches its own workspace. */
(() => {
  const shots={
    roster:['員工的群組回覆與產生的每週更表。','Staff availability messages beside the resulting weekly rota.'],
    yoga:['基礎哈達瑜伽的課堂詳情、剩餘點數及確認預約按鈕。','Hatha yoga class details, available credits and the booking confirmation button.'],
    dining:['餐廳助手回覆尖沙咀日本菜查詢，附上相符記錄的來源。','A Tsim Sha Tsui Japanese dining query, the matching restaurant and its source link.'],
    email:['外展成效工作台顯示示範活動的電郵送達、互動及預約圖表。','The outreach dashboard showing email engagement and bookings for a simulated campaign.']
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
  window.FlowDemoCards={render(container,locale){
    const en=locale==='en';
    container.innerHTML=cards.map(([id,zh,english,body,engBody,index])=>{
      const action=actions[id][en?1:0];
      return `<article class="demo-entry" data-demo-entry><div class="demo-entry-head"><span class="demo-number">${index}</span><h3>${en?english:zh}</h3><p>${en?engBody:body}</p></div><a class="demo-launch" href="demos.html?demo=${id}" aria-label="${action} — ${en?english+' (Chinese interface)':zh+'（互動示範）'}"><div class="demo-art-link demo-shot"><img src="assets/showcase/${id}.webp" width="1200" height="750" loading="lazy" decoding="async" alt="${shots[id][en?1:0]}"></div><div class="demo-entry-foot"><span class="demo-entry-cta">${action}<span aria-hidden="true">↗</span></span></div></a></article>`;
    }).join('')+(en?"<article id=\"architect-studio-showcase\" class=\"demo-entry architecture-feature\" data-demo-entry><div class=\"demo-entry-head\"><span class=\"demo-number\">05</span><h3>Architecture & interiors studio</h3><p>Explore a residential practice, its design process and the Mount Nicholson House 3 project.</p></div><a class=\"demo-launch\" href=\"/demo/architect-studio/\" aria-label=\"Enter the studio demo — Architecture & interiors studio\"><figure class=\"architecture-art\"><div class=\"demo-art-link\"><img loading=\"lazy\" width=\"1680\" height=\"945\" src=\"/demo/architect-studio/media/house03-web-walkthrough.webp\" alt=\"Daylight on cream and navy sofas beneath a brass ring pendant; terrace planting and trees are visible through full-height windows.\"><div class=\"studio-slip\" aria-hidden=\"true\"><div class=\"slip-sign\"><b lang=\"zh-HK\">靜築</b><span lang=\"en\">Stillform<small>Architects</small></span></div><div class=\"slip-subject\"><span>Mount Nicholson</span><strong>House 3</strong><small>Living room / terrace</small></div></div></div><figcaption>House 3, garden level. A still from the interactive Three.js walkthrough.</figcaption></figure><div class=\"demo-entry-foot\"><span class=\"demo-entry-cta\">Enter the studio demo<span aria-hidden=\"true\">↗</span></span></div></a></article>":"<article id=\"architect-studio-showcase\" class=\"demo-entry architecture-feature\" data-demo-entry><div class=\"demo-entry-head\"><span class=\"demo-number\">05</span><h3>建築及室內設計事務所</h3><p>由設計理念、項目作品到查詢流程，看看建築事務所如何呈現 Mount Nicholson 3 號屋。</p></div><a class=\"demo-launch\" href=\"/demo/architect-studio/\" aria-label=\"參觀事務所示範網站 — 建築及室內設計事務所\"><figure class=\"architecture-art\"><div class=\"demo-art-link\"><img loading=\"lazy\" width=\"1680\" height=\"945\" src=\"/demo/architect-studio/media/house03-web-walkthrough.webp\" alt=\"日光落在米白色梳化與地氈上，後方是深藍梳化；落地窗外可見露台植栽與樹木。\"><div class=\"studio-slip\" aria-hidden=\"true\"><div class=\"slip-sign\"><b lang=\"zh-HK\">靜築</b><span lang=\"en\">Stillform<small>Architects</small></span></div><div class=\"slip-subject\"><span>Mount Nicholson</span><strong>三號屋</strong><small>客廳與花園平台</small></div></div></div><figcaption>三號屋花園層客廳 · 擷取自可自由行走的 Three.js 網頁示範。</figcaption></figure><div class=\"demo-entry-foot\"><span class=\"demo-entry-cta\">參觀事務所示範網站<span aria-hidden=\"true\">↗</span></span></div></a></article>");
  }};
})();
