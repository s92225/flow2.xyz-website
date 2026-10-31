/* Three distinct explanatory films. Uses the approved invoice film's playback
   controller without changing that film. All business records below are samples. */
(() => {
  'use strict';
  const MOVE='cubic-bezier(.77,0,.175,1)', OUT='cubic-bezier(.22,1,.36,1)';
  const transform=(x=0,y=0,s=1,r=0)=>`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(4)})`;
  const k=(offset,value,opacity=1,easing=MOVE)=>({offset,transform:value,opacity,easing});
  const orders=[{id:1006,quantity:2,day:'MON'},{id:1007,quantity:3,day:'TUE'},{id:1008,quantity:2,day:'WED'}].map(o=>({...o,amount:o.quantity*180}));
  const incoming=orders[2], total=orders.reduce((n,o)=>n+o.amount,0), quantity=orders.reduce((n,o)=>n+o.quantity,0);
  const dollars=n=>'HK$'+n.toLocaleString('en-HK');
  const svg=(body,viewBox='0 0 24 24')=>`<svg viewBox="${viewBox}" aria-hidden="true">${body}</svg>`;
  const symbols={
    check:svg('<path d="m5 12 4 4L19 6"/>'),
    file:svg('<path d="M14 3H5v18h14V8l-5-5Z"/><path d="M14 3v6h5M9 13h6M9 17h6"/>'),
    database:svg('<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>'),
    report:svg('<path d="M4 3h12l4 4v14H4Z"/><path d="M8 16v-4M12 16V8M16 16v-6"/>'),
    cycle:svg('<path d="M20 7h-5l3-3M4 17h5l-3 3M19 7a8 8 0 0 0-14 3M5 17a8 8 0 0 0 14-3"/>'),
    book:svg('<path d="M12 5C8 2 4 3 2 4v15c4-2 7-1 10 1 3-2 6-3 10-1V4c-2-1-6-2-10 1Zm0 0v15"/>'),
    folder:svg('<path d="M3 7V4h6l3 3h9v13H3V7Zm0 4h18"/>')
  };
  const dictionary={
    shopify:{
      zh:{label:'Shopify 新訂單的欄位整理成資料列，自動同步到本地資料庫',header:'訂單自動入庫。',phases:['Shopify 訂單','欄位對應','寫入資料庫','同步完成'],captions:['Shopify，有新訂單。','資料自動對應，無須重複輸入。','訂單，寫入本地資料庫。','Shopify 與本地記錄已同步。'],reply:'已同步至本地資料庫',button:'體驗訂單同步',note:'此為示例訂單，不會接駁商店或寫入真實資料庫。',newOrder:'新訂單',item:'禮盒',units:'件',database:'本地資料庫',order:'單號',qty:'數量',amount:'金額',mapping:['單號','數量','金額'],synced:'已同步'},
      en:{label:'A new Shopify order is mapped into a record and synced to a local database',header:'Orders, automatically in sync.',phases:['New order','Map fields','Write record','Synced'],captions:['A new Shopify order.','Same details. No retyping.','Written to your local database.','The store and your records, connected.'],reply:'Synced to the local database',button:'Try a sync',note:'Sample order. No store is connected and no database is written.',newOrder:'New order',item:'Gift sets',units:'units',database:'Local database',order:'Order',qty:'Qty',amount:'Amount',mapping:['Order ID','Quantity','Amount'],synced:'Synced'}
    },
    report:{
      zh:{label:'三筆示例訂單的數據匯集，轉成圖表及一份已生成的營運報表',header:'數據入，報表出。',phases:['收集數據','自動整理','生成圖表','報表就緒'],captions:['整合分散於不同記錄的數據。','Flow2，自動整理。','將數字轉為清晰易讀的圖表。','營運報表已完成。'],reply:'營運報表已生成',button:'體驗報表生成',note:'此為示例數據，不會讀取真實資料或產生下載檔案。',title:'營運報表',revenue:'銷售總額',summary:`${orders.length} 筆訂單 · ${quantity} 件商品`,document:'營運報表.pdf',units:'件商品'},
      en:{label:'Three sample order records combine into a chart and a finished operations report',header:'Data in. Report ready.',phases:['Collect data','Organise','Build chart','Report ready'],captions:['Data, spread across records.','Flow2 brings it together.','Numbers become a readable chart.','One report. Ready to use.'],reply:'Operations report generated',button:'Try a report',note:'Sample data. No live records are read and no download file is created.',title:'Operations report',revenue:'Sales total',summary:`${orders.length} orders · ${quantity} items`,document:'Operations report.pdf',units:'items'}
    },
    knowledge:{
      zh:{label:'資料自動建立知識庫，兩批新資料持續加入，下一次回答使用更新內容及來源',header:'新資料，變成新知識。',phases:['吸收資料','建立知識庫','持續更新','更新答案'],captions:['從現有資料開始。','自動建立可追溯來源的知識庫。','新資料加入後，知識庫持續更新。','以最新內容回答下一次查詢。'],reply:'答案已採用最新資料',button:'體驗知識更新',note:'此為資料入庫與檢索更新的示意，並不代表模型自行訓練。',sourceA:'產品資料',sourceB:'常見問題',updateA:'保養條款',updateB:'FAQ 補充',vault:'知識庫',question:'最新的保養資料？',answer:'已採用最新資料',citationA:'保養條款 v2',citationB:'FAQ v3'},
      en:{label:'Source documents build a knowledge base; two new updates are absorbed and the next answer uses fresh content and citations',header:'New information. New knowledge.',phases:['Read sources','Build knowledge','Keep updating','Update answers'],captions:['Start with the information you have.','A knowledge base with traceable sources.','New information keeps it up to date.','The next answer uses the latest sources.'],reply:'New sources. Updated answers.',button:'Try an update',note:'Illustration of ingestion and retrieval updates, not a model training itself.',sourceA:'Product data',sourceB:'FAQs',updateA:'Warranty terms',updateB:'FAQ update',vault:'Knowledge',question:'The latest warranty information?',answer:'Using the latest sources',citationA:'Warranty v2',citationB:'FAQ v3'}
    }
  };
  const flowTile='<div class="fn-flow-tile"><span>flow<sup>2</sup></span></div>';
  const end=(w)=>`<div class="story-delivered fn-complete"><span>${symbols.check}</span>${w.reply}</div><p class="story-caption" aria-hidden="true">${w.captions[0]}</p>`;
  function shopifyMarkup(w){
    return `<div class="fs-order"><div class="fs-order-brand"><span class="shopify-mark" aria-hidden="true"></span><strong>Shopify</strong><span>${w.newOrder}</span></div><div class="fs-order-number">#${incoming.id}</div><div class="fs-product"><span class="gift-glyph" aria-hidden="true">${svg('<rect x="4" y="9" width="16" height="12" rx="1"/><path d="M2 6h20v4H2ZM12 6v15M12 6C1 7 5-3 12 6Zm0 0c11 1 7-9 0 0Z"/>')}</span><div><strong>${w.item}</strong><small>${incoming.quantity} ${w.units} × HK$180</small></div></div><div class="fs-order-total">${dollars(incoming.amount)}</div></div>
      <div class="fs-core">${flowTile}<div class="fs-mapping">${w.mapping.map(v=>`<span>${v}</span>`).join('')}</div></div>
      <div class="fs-record-token"><span>#${incoming.id}</span><span>${incoming.quantity}</span><strong>${dollars(incoming.amount)}</strong></div>
      <div class="fs-database"><div class="fs-db-title"><span>${symbols.database}</span><div><strong>${w.database}</strong><small>orders</small></div><span class="fs-db-status">${symbols.check}</span></div><div class="fs-table"><div class="fs-table-head"><span>${w.order}</span><span>${w.qty}</span><span>${w.amount}</span></div>${orders.map((o,i)=>`<div class="fs-row ${i===2?'fs-new-row':''}"><span>#${o.id}</span><span>${o.quantity}</span><span>${dollars(o.amount)}</span></div>`).join('')}</div><div class="fs-db-origin"><span class="shopify-mark" aria-hidden="true"></span>Shopify #${incoming.id}<span>${w.synced} ${symbols.check}</span></div></div>`;
  }
  function reportMarkup(w){
    return `<div class="fr-sources">${orders.map((o,i)=>`<div class="fr-source source-${i}"><span class="fr-sheet-icon">${symbols.report}</span><small>${o.day}</small><strong>${dollars(o.amount)}</strong><span>${o.quantity} ${w.units}</span></div>`).join('')}</div>
      <div class="fr-core">${flowTile}</div>
      ${orders.map((o,i)=>`<div class="fr-packet packet-${i}">${dollars(o.amount)}</div>`).join('')}
      <div class="fr-report"><div class="fr-report-head"><strong>${w.title}</strong><span>REPORT</span></div><div class="fr-revenue"><span>${w.revenue}</span><strong>${dollars(total)}</strong></div><div class="fr-plot">${orders.map((o,i)=>`<div class="fr-column"><span class="fr-bar-number number-${i}">${o.amount}</span><div class="fr-bar bar-${i}"></div><span class="fr-day">${o.day}</span></div>`).join('')}</div><div class="fr-summary">${w.summary}</div><div class="fr-pdf">${symbols.file}<span>PDF</span></div></div>
      <div class="fr-tray"><span>${symbols.folder}</span><span>${w.document}</span><i>${symbols.check}</i></div>`;
  }
  function knowledgeMarkup(w){
    const node=(cls,label,version,ic)=>`<div class="fk-node ${cls}"><span>${ic}</span><strong>${label}</strong><small>${version}</small></div>`;
    return `<div class="fk-sources"><div>${symbols.file}<span>${w.sourceA}</span><small>v1</small></div><div>${symbols.file}<span>${w.sourceB}</span><small>v1</small></div></div>
      <div class="fk-network"><svg class="fk-links" viewBox="-175 -125 350 250" aria-hidden="true"><path class="link-0" d="M0 0-125-64"/><path class="link-1" d="M0 0 125-64"/><path class="link-2" d="M0 0-125 64"/><path class="link-3" d="M0 0 125 64"/></svg><div class="fk-hub"><span>flow<sup>2</sup></span><small>${w.vault}</small><i class="fk-cycle">${symbols.cycle}</i></div>${node('node-0',w.sourceA,'v1',symbols.file)}${node('node-1',w.sourceB,'v1',symbols.book)}${node('node-2',w.updateA,'v2',symbols.file)}${node('node-3',w.updateB,'v3',symbols.book)}</div>
      <div class="fk-update update-2">${symbols.file}<span>${w.updateA}</span><b>v2</b></div><div class="fk-update update-3">${symbols.book}<span>${w.updateB}</span><b>v3</b></div>
      <div class="fk-answer"><div class="fk-question">${w.question}</div><strong>${w.answer}</strong><div class="fk-citations"><span class="citation-2">[1] ${w.citationA}</span><span class="citation-3">[2] ${w.citationB}</span></div></div>`;
  }
  class FlowFunctionStory extends window.FlowInvoiceStory {
    static markup(kind,locale='zh'){
      const w=dictionary[kind][locale];
      const content=kind==='shopify'?shopifyMarkup(w):kind==='report'?reportMarkup(w):knowledgeMarkup(w);
      return `<div class="invoice-film function-film function-${kind}" data-function-kind="${kind}" data-ui role="img" aria-label="${w.label}">${content}${end(w)}</div><p class="story-honesty function-note">${w.note}</p>`;
    }
    static phases(kind,locale){return dictionary[kind][locale].phases;}
    static button(kind,locale){return dictionary[kind][locale].button;}
    static header(kind,locale){return dictionary[kind][locale].header;}
    build(at=0){
      this.animations.forEach(a=>a.cancel());this.animations=[];
      const r=this.root.getBoundingClientRect();this.width=r.width;this.height=r.height;
      const kind=this.root.dataset.functionKind;this.w=dictionary[kind][this.locale];
      const phone=r.width<580;
      if(kind==='shopify')this.buildShopify(phone,r.width);
      else if(kind==='report')this.buildReport(phone);
      else this.buildKnowledge(phone,r.width);
      this.track('.story-delivered',[k(0,transform(0,9,.97),0),k(.91,transform(0,9,.97),0,OUT),k(.956,transform(),1),k(1,transform(),1)]);
      this.seek(Math.min(11000,at));this.sync();
    }
    buildShopify(phone,width){
      const left=phone?0:-Math.min(255,width*.26),right=phone?0:Math.min(220,width*.225),quiet=phone?0:.28;
      this.clock=this.track('.fs-order',[k(0,transform(0,0,.96),0,OUT),k(.045,transform(),1),k(.17,transform(),1),k(.28,transform(left,phone?-75:0,.8),quiet),k(.65,transform(left,phone?-75:0,.8),quiet),k(.78,transform(left,phone?-75:0,.8),0),k(1,transform(left,0,.8),0)]);
      this.track('.fs-core',[k(0,transform(0,0,.94),0),k(.22,transform(0,0,.94),0,OUT),k(.29,transform(),1),k(.4,transform(),1),k(.49,transform(-32,0,.76),0),k(1,transform(-32,0,.76),0)]);
      this.track('.fs-mapping',[k(0,transform(0,8),0),k(.28,transform(0,8),0,OUT),k(.32,transform(),1),k(.39,transform(),1),k(.45,transform(12,0),0),k(1,transform(12,0),0)]);
      this.track('.fs-record-token',[k(0,transform(left,0,.9),0),k(.19,transform(left,0,.9),0),k(.22,transform(left,0),1),k(.31,transform(0,-8),1),k(.37,transform(0,-8),1),k(.49,transform(right,44,.84),1),k(.53,transform(right,44,.84),0),k(1,transform(right,44,.84),0)]);
      this.track('.fs-database',[k(0,transform(right,14,.94),0),k(.38,transform(right,14,.94),0,OUT),k(.48,transform(right,0),1),k(.67,transform(right,0),1),k(.82,transform(),1),k(1,transform(),1)]);
      this.track('.fs-new-row',[k(0,transform(-18,0),0),k(.49,transform(-18,0),0,OUT),k(.56,transform(),1),k(1,transform(),1)]);
      this.track('.fs-db-status',[k(0,transform(0,4,.94),0),k(.65,transform(0,4,.94),0,OUT),k(.71,transform(),1),k(1,transform(),1)]);
      this.track('.fs-db-origin',[k(0,transform(0,6),0),k(.76,transform(0,6),0,OUT),k(.84,transform(),1),k(1,transform(),1)]);
    }
    buildReport(phone){
      this.clock=this.track('.fr-sources',[k(0,transform(0,0,.96),0,OUT),k(.045,transform(),1),k(.18,transform(),1),k(.32,transform(0,-35,.72),0),k(1,transform(0,-35,.72),0)]);
      this.track('.fr-core',[k(0,transform(0,-16,.94),0),k(.23,transform(0,-16,.94),0,OUT),k(.29,transform(0,-16),1),k(.36,transform(0,-16),1),k(.44,transform(0,-16,.85),0),k(1,transform(0,-16,.85),0)]);
      orders.forEach((o,i)=>{
        const x=(i-1)*(phone?78:120),target=(i-1)*72;
        this.track(`.packet-${i}`,[k(0,transform(x,-20,.9),0),k(.2+i*.02,transform(x,-20,.9),0),k(.23+i*.02,transform(x,-20),1),k(.35+i*.02,transform(0,-5,.8),1),k(.47+i*.02,transform(target,69,.7),1),k(.52+i*.02,transform(target,69,.7),0),k(1,transform(target,69,.7),0)]);
        const height=o.amount/Math.max(...orders.map(v=>v.amount));
        this.track(`.bar-${i}`,[k(0,`scaleY(.06)`,0),k(.48+i*.025,`scaleY(.06)`,0,OUT),k(.58+i*.025,`scaleY(${height})`,1),k(1,`scaleY(${height})`,1)]);
        this.track(`.number-${i}`,[k(0,transform(0,6),0),k(.56+i*.025,transform(0,6),0,OUT),k(.62+i*.025,transform(0,(1-height)*74),1),k(1,transform(0,(1-height)*74),1)]);
      });
      this.track('.fr-report',[k(0,transform(0,18,.94),0),k(.38,transform(0,18,.94),0,OUT),k(.49,transform(),1),k(.73,transform(),1),k(.83,transform(0,7,.96),1),k(1,transform(0,7,.96),1)]);
      this.track('.fr-summary',[k(0,transform(0,5),0),k(.63,transform(0,5),0,OUT),k(.69,transform(),1),k(1,transform(),1)]);
      this.track('.fr-pdf',[k(0,transform(8,0,.94),0),k(.68,transform(8,0,.94),0,OUT),k(.75,transform(),1),k(1,transform(),1)]);
      this.track('.fr-tray',[k(0,transform(0,12),0),k(.74,transform(0,12),0,OUT),k(.83,transform(),1),k(1,transform(),1)]);
    }
    buildKnowledge(phone,width){
      const left=phone?-60:-Math.min(240,width*.24),right=phone?60:Math.min(240,width*.24),rise=phone?-65:-48;
      this.clock=this.track('.fk-sources',[k(0,transform(0,0,.96),0,OUT),k(.05,transform(),1),k(.16,transform(),1),k(.32,transform(0,-10,.7),0),k(1,transform(0,-10,.7),0)]);
      this.track('.fk-network',[k(0,transform(0,0,.94),0),k(.23,transform(0,0,.94),0,OUT),k(.32,transform(),1),k(.56,transform(),1),k(.7,transform(0,rise,.9),1),k(1,transform(0,rise,.9),1)]);
      [0,1,2,3].forEach(i=>{
        const arrive=[.3,.35,.55,.82][i];
        this.track(`.node-${i}`,[k(0,transform(0,8,.94),0),k(arrive,transform(0,8,.94),0,OUT),k(arrive+.065,transform(),1),k(1,transform(),1)]);
        this.track(`.link-${i}`,[{offset:0,opacity:0},{offset:arrive,opacity:0},{offset:arrive+.065,opacity:1},{offset:1,opacity:1}]);
      });
      this.track('.update-2',[k(0,transform(left,-10,1,-6),0),k(.42,transform(left,-10,1,-6),0),k(.45,transform(left,-10,1,-6),1),k(.56,transform(0,-5,.65),1),k(.6,transform(0,-5,.65),0),k(1,transform(0,-5,.65),0)]);
      this.track('.update-3',[k(0,transform(right,-45,1,6),0),k(.7,transform(right,-45,1,6),0),k(.735,transform(right,-45,1,6),1),k(.83,transform(0,rise,.65),1),k(.87,transform(0,rise,.65),0),k(1,transform(0,rise,.65),0)]);
      this.track('.fk-cycle',[k(0,transform(0,0,1,0),0),k(.43,transform(0,0,1,0),0),k(.46,transform(0,0,1,0),1),k(.62,transform(0,0,1,180),1),k(.69,transform(0,0,1,180),1),k(.86,transform(0,0,1,360),1),k(.9,transform(0,0,1,360),0),k(1,transform(0,0,1,360),0)]);
      this.track('.fk-answer',[k(0,transform(0,10,.97),0),k(.62,transform(0,10,.97),0,OUT),k(.7,transform(),1),k(1,transform(),1)]);
      this.track('.citation-2',[k(0,transform(0,4),0),k(.65,transform(0,4),0,OUT),k(.72,transform(),1),k(1,transform(),1)]);
      this.track('.citation-3',[k(0,transform(0,4),0),k(.84,transform(0,4),0,OUT),k(.9,transform(),1),k(1,transform(),1)]);
    }
  }
  window.FlowFunctionStory=FlowFunctionStory;
})();
