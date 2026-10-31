window.FlowLabViews=window.FlowLabViews||{};
window.FlowLabViews.dining=ctx=>{
  const {h,$,icons}=ctx,D=window.FlowDiningKnowledge,data=window.FlowRestaurantData,metadata=window.FlowDiningMetadata;
  let open=false,catalogueOpen=false,guideDismissed=false,lastChatTrigger='dining-launcher',search='',cuisine='',district='',page=1,lastDialogTrigger=null,pending=null,replyTimer=null,replySequence=0;
  const pageSize=18,districts=metadata.districts;
  const cuisineLabels=[...new Set(data.flatMap(r=>r.cuisines))].sort((a,b)=>a.localeCompare(b,'zh-HK'));
  const dateTime=value=>new Intl.DateTimeFormat('zh-HK',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Hong_Kong',hour12:false}).format(new Date(value));
  const meta={
    brand:'TABLE / 網站餐廳助手',title:'讓知識庫，以對話回應。',
    intro:'在模擬網站內開啟 Chatbot，親身體驗有來源可查的餐廳搜尋。',
    info:`本機來源快照：食環署資料日期 ${metadata.fehdGeneratedAt}；匯入 ${metadata.importedAt}。每區最多 30 筆，並非完整名錄或評分排名。名稱、地址及牌照來自食環署；菜式只採用已配對的 OSM 社群標籤，未經餐廳確認。價格、營業時間、評分、飲食安全及即時空位沒有核實，不作推測。對話採本機規則檢索，約 0.8 秒回覆，不呼叫 AI 或任何外部服務。`
  };
  // Keep old-version conversations locally, but never mix obsolete citations into this dataset.
  if(ctx.state.dining.catalogueVersion!==metadata.version){
    ctx.state.dining.previousConversation=ctx.state.dining.messages.slice(-20);
    ctx.state.dining.messages=[];ctx.state.dining.filters=D.empty();
    ctx.state.dining.catalogueVersion=metadata.version;ctx.save();
  }
  const prompts=districts.map(area=>{
    const labels=data.filter(r=>r.district===area).flatMap(r=>r.cuisines);
    const suggested={'尖沙咀':'日本菜','中環':'意大利菜','銅鑼灣':'韓國菜','旺角':'粵菜','觀塘':'日本菜'}[area];
    const preferred=labels.includes(suggested)?suggested:labels[0];
    return area+(preferred||'有哪些餐廳');
  });
  const sourceLinks=()=>`<a href="${metadata.sourceUrls.fehd}" target="_blank" rel="noopener noreferrer">食物環境衞生署／DATA.GOV.HK</a><span aria-hidden="true"> · </span><a href="${metadata.sourceUrls.osm}" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors</a>`;
  function card(r){
    return `<article class="restaurant-card real-restaurant"><div class="restaurant-card-head"><span class="food-mark" aria-hidden="true">${icons.dining}</span><div><h3>${h(r.name)}</h3><p>${h(r.district)} · ${r.cuisines.length?'OSM 分類：':''}${h(D.label(r))}</p></div></div><p class="restaurant-address">${h(r.address)}</p><div class="restaurant-source-stamp"><span>${r.osm.length?'食環署 + OSM':'食環署'}</span><span>匯入 ${r.importedAt}</span></div><div class="restaurant-card-bottom"><small>${r.cuisines.length?'菜式：OSM 社群標籤':'菜式未分類，沒有推測'}</small><button class="text-action" data-real-restaurant="${r.id}" aria-label="查看${h(r.name)}的來源與詳情">來源與詳情 ↗</button></div></article>`;
  }
  function list(){
    const q=search.trim().toLocaleLowerCase();
    return D.filter(data,{district,cuisine}).filter(r=>!q||[r.name,r.nameEn,...r.aliases,r.address,r.addressEn,r.id,r.licence.number,...r.cuisines,...(r.classificationReview?[]:r.cuisineRaw)].join(' ').toLocaleLowerCase().includes(q));
  }
  function library(){
    const items=list(),pages=Math.max(1,Math.ceil(items.length/pageSize));page=Math.min(page,pages);
    const shown=items.slice((page-1)*pageSize,page*pageSize);
    return `<section class="surface real-catalogue"><div class="section-top"><div><h2 id="catalogue-title" tabindex="-1">五個地區，${data.length} 筆來源記錄。</h2><p>每區選取 30 筆，並非完整名錄。${metadata.withCuisine} 筆有可對應的 OSM 菜式分類，其餘保留未知。</p></div><span class="badge">公開知識庫</span></div>
      <div class="dining-data-strip"><div><span>食環署資料日期</span><strong>${metadata.fehdGeneratedAt}</strong></div><div><span>OSM 資料快照</span><strong>${h(dateTime(metadata.osmSnapshotAt))}</strong></div><div><span>本次匯入日期</span><strong>${metadata.importedAt}</strong></div></div>
      <p class="dining-source-byline">資料來源：${sourceLinks()}</p>
      <form id="real-catalogue-form" class="real-catalogue-controls"><label>餐廳、地址或記錄編號<input id="real-catalogue-search" type="search" name="search" maxlength="100" value="${h(search)}" placeholder="例如：鼎泰豐、彌敦道、牌照編號"></label><label>地區<select name="district" id="real-district"><option value="">所有地區</option>${districts.map(x=>`<option value="${x}" ${district===x?'selected':''}>${x}（${metadata.counts[x]}）</option>`).join('')}</select></label><label>已有來源的菜式<select name="cuisine" id="real-cuisine"><option value="">所有分類，包括未知</option>${cuisineLabels.map(x=>`<option ${cuisine===x?'selected':''}>${x}</option>`).join('')}</select></label><button class="button subtle" id="catalogue-search-submit" type="submit">搜尋資料庫</button></form>
      <div class="dining-list-top"><p id="dining-result-summary" role="status" tabindex="-1">${items.length?`${items.length} 筆相符記錄 · 顯示 ${(page-1)*pageSize+1}–${Math.min(page*pageSize,items.length)}`:'沒有相符記錄'}<small>依來源記錄及資料完整度展示，非評分排名。</small></p><nav class="dining-pagination" aria-label="餐廳清單分頁"><button class="button subtle" data-dining-page="${page-1}" ${page===1?'disabled':''} aria-label="上一頁餐廳">←</button><span>第 ${page} / ${pages} 頁</span><button class="button subtle" data-dining-page="${page+1}" ${page===pages?'disabled':''} aria-label="下一頁餐廳">→</button></nav></div>
      <div class="catalogue-grid" id="real-catalogue-grid">${shown.map(card).join('')||'<div class="empty-state"><p>這份選定資料沒有符合條件的記錄，不代表區內沒有相關餐廳。</p><button class="text-action" data-clear-catalogue>清除搜尋條件</button></div>'}</div>
      <div class="dining-source-footer"><p>${sourceLinks()}</p><details><summary>資料來源、更新日期及使用限制</summary><div><p>名稱、地址及牌照記錄：食物環境衞生署／香港特別行政區政府／DATA.GOV.HK，資料日期 ${metadata.fehdGeneratedAt}。使用依 <a href="${metadata.sourceUrls.fehdTerms}" target="_blank" rel="noopener noreferrer">DATA.GOV.HK 條款</a>。</p><p>配對與菜式資料：© OpenStreetMap contributors，按 <a href="${metadata.sourceUrls.osmLicense}" target="_blank" rel="noopener noreferrer">ODbL 1.0</a> 提供。只有名稱、街道及門牌一致的記錄才關聯；有歧義的配對不會使用。這是來源記錄配對，不代表餐廳已確認菜式。${metadata.classificationsWithheld} 筆分類有疑點，保留原始標籤供追溯，但不加入菜式搜尋。</p><p>地區依食環署地址文字及區碼篩選，並非精確行政邊界。來源更新時間、OSM 要素編輯時間及匯入日期各有不同含義，均不代表到店核實。未收錄價格、營業時間、評分、飲食安全、設施或即時空位。</p><div class="dining-data-downloads"><a href="data/dining/fehd-records.json" download>食環署來源子集 JSON ↓</a><a href="data/dining/osm-enrichment.json" download>OSM 資料及配對表 JSON ↓</a><a href="data/dining/catalogue.json" download>本機知識庫 JSON ↓</a></div></div></details></div></section>`;
  }
  function widget(){
    if($('#dining-launcher'))return;
    const wrap=document.createElement('div');wrap.id='dining-widget-root';
    wrap.innerHTML=`<aside class="dining-launcher-guide" id="dining-launcher-guide" aria-label="餐廳助手使用提示"><button type="button" class="dining-guide-open" id="open-dining-guide" aria-controls="dining-chat-panel"><strong>想找合適的餐廳？</strong><span>點擊下方圖示，開始對話</span></button><button type="button" class="dining-guide-dismiss" id="dismiss-dining-guide" aria-label="關閉餐廳助手提示"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></aside><button class="dining-launcher" id="dining-launcher" aria-label="開啟餐廳助手" aria-expanded="false" aria-controls="dining-chat-panel"><span class="launcher-icon">${icons.chat}</span></button><section id="dining-chat-panel" class="dining-chat-panel" role="dialog" aria-modal="false" aria-label="餐廳探索助手" hidden><div class="widget-head"><span class="chat-avatar" aria-hidden="true">${icons.dining}</span><div><strong>餐廳探索助手</strong><small>食環署 + OpenStreetMap · ${data.length} 筆</small></div><button class="icon-button" id="close-dining-chat" aria-label="收起餐廳助手">×</button></div><div class="widget-messages" id="widget-messages" role="log" aria-live="polite"></div><div class="widget-prompts">${prompts.map(q=>`<button type="button" data-real-prompt="${q}">${q}</button>`).join('')}</div><form id="widget-query-form" class="widget-query-form"><label><span class="sr-only">輸入餐廳問題</span><input id="widget-query" name="query" maxlength="300" required placeholder="輸入餐廳、地區或菜式…" autocomplete="off"></label><button class="button" type="submit" aria-label="送出餐廳問題">${icons.chat}</button></form><p class="widget-source-label">匯入 ${metadata.importedAt} · 非即時資料 · 本機規則檢索</p></section>`;
    $('#dining-browser-stage').append(wrap);paintMessages();$('#dining-chat-panel').hidden=!open;$('#dining-launcher-guide').hidden=open||guideDismissed;$('#dining-launcher').setAttribute('aria-expanded',String(open));$('#dining-launcher').setAttribute('aria-label',open?'收起聊天視窗':'開啟餐廳助手');$('#dining-launcher').classList.toggle('is-open',open);if(pending)setBusy(true);
  }
  function messageHTML(message){
    return `<div class="chat-bubble ${message.role==='user'?'user':'assistant'}"><p>${h(message.text).replace(/\n/g,'<br>')}</p>${message.sources?.length?`<div class="citations">${message.sources.map(id=>{const r=data.find(x=>x.id===id);return r?`<button class="citation" data-real-restaurant="${r.id}">${h(r.name)} · 來源 ↗</button>`:'';}).join('')}</div>`:''}</div>`;
  }
  function paintMessages(){
    const log=$('#widget-messages');
    log.innerHTML=`<div class="chat-bubble assistant"><p>您好，想在哪個地區找餐廳？這裡收錄尖沙咀、中環、銅鑼灣、旺角及觀塘共 ${data.length} 筆選定記錄。</p><p>名稱與地址來自食環署；菜式取自已配對的 OSM 社群標籤。匯入日期 ${metadata.importedAt}，非即時資料。未核實的價格、營業時間及空位不會推測。</p></div>${ctx.state.dining.messages.filter(m=>m.catalogueVersion===metadata.version).map(messageHTML).join('')}`;
    log.scrollTop=log.scrollHeight;
  }
  function ask(query,preset=false){
    if(pending)return;
    const pageY=window.scrollY,log=$('#widget-messages');ctx.reload();
    const result=D.resolve(data,metadata,query,ctx.state.dining.filters,preset),user={role:'user',text:query,id:'query-'+Date.now()+'-'+(++replySequence),catalogueVersion:metadata.version};
    ctx.state.dining.filters=result.filters;ctx.state.dining.messages.push(user);ctx.save();pending={id:user.id,response:result.response};
    log.insertAdjacentHTML('beforeend',messageHTML(user));$('#widget-query').value='';setBusy(true);log.scrollTop=log.scrollHeight;
    window.scrollTo({top:pageY,behavior:'auto'});
    replyTimer=setTimeout(()=>{
      if(!pending||pending.id!==user.id)return;ctx.reload();
      if(ctx.state.dining.messages.at(-1)?.id===user.id){ctx.state.dining.messages.push(result.response);ctx.state.dining.messages=ctx.state.dining.messages.slice(-20);ctx.save();}
      pending=null;setBusy(false);paintMessages();
    },800);
  }
  function setBusy(busy){
    const panel=$('#dining-chat-panel'),log=$('#widget-messages');panel.setAttribute('aria-busy',String(busy));
    panel.querySelectorAll('[data-real-prompt],button[type=submit],.widget-query-form button').forEach(b=>b.disabled=busy);$('#widget-query').readOnly=busy;
    log.querySelector('.typing-indicator')?.remove();
    if(busy)log.insertAdjacentHTML('beforeend','<div class="typing-indicator" role="status" aria-label="正在整理回覆"><span></span><span></span><span></span><small>正在整理來源記錄</small></div>');
  }
  function openChat(trigger='dining-launcher'){lastChatTrigger=trigger;guideDismissed=true;open=true;$('#dining-launcher-guide').hidden=true;$('#dining-launcher').setAttribute('aria-label','收起聊天視窗');$('#dining-chat-panel').hidden=false;$('#dining-launcher').setAttribute('aria-expanded','true');$('#dining-launcher').classList.add('is-open');$('#widget-messages').scrollTop=$('#widget-messages').scrollHeight;$('#main-dining-chat')?.setAttribute('aria-expanded','true');$('#dining-browser-stage').scrollIntoView({block:'nearest',behavior:'auto'});$('#close-dining-chat').focus({preventScroll:true});}
  function closeChat(){open=false;$('#dining-launcher').setAttribute('aria-label','開啟餐廳助手');$('#dining-chat-panel').hidden=true;$('#dining-launcher').setAttribute('aria-expanded','false');$('#dining-launcher').classList.remove('is-open');$('#main-dining-chat')?.setAttribute('aria-expanded','false');($('#'+lastChatTrigger)||$('#dining-launcher')).focus({preventScroll:true});}
  function detail(id,trigger){
    const r=data.find(x=>x.id===id);if(!r)return;lastDialogTrigger=trigger;
    const licenceLabels={RL:'一般食肆牌照',RR:'小食食肆牌照',MR:'水上食肆牌照'};
    $('#restaurant-detail').innerHTML=`<p class="dining-record-id">${r.id} / 來源記錄</p><h2 id="restaurant-title">${h(r.name)}</h2>${r.nameEn!==r.name?`<p class="detail-lead">${h(r.nameEn)}</p>`:''}<dl><dt>地區</dt><dd>${h(r.district)}</dd><dt>食環署地址</dt><dd>${h(r.address)}</dd><dt>菜式分類</dt><dd>${h(D.label(r))}${r.cuisineRaw.length?`<small class="dining-raw-tag">OSM 原始標籤：${h(r.cuisineRaw.join('；'))}</small>`:''}</dd>${r.classificationReview?`<dt>分類待確認</dt><dd>${h(r.classificationReview)}</dd>`:''}<dt>牌照記錄</dt><dd>${h(r.licence.number)} · ${h(licenceLabels[r.licence.type]||r.licence.type)}</dd><dt>來源所列有效期</dt><dd>${h(r.licence.expiryAsRecorded)}（非即時營業狀態）</dd><dt>食環署資料日期</dt><dd>${r.fehdDate}</dd><dt>本次匯入日期</dt><dd>${r.importedAt}</dd><dt>營業時間／價格</dt><dd>未核實，不提供估計</dd><dt>評分／即時空位</dt><dd>未收錄、不提供</dd></dl>
      <section class="dining-record-sources" aria-label="此餐廳的資料來源"><h3>此記錄的來源</h3><article><a href="${metadata.sourceUrls.fehd}" target="_blank" rel="noopener noreferrer">食物環境衞生署／DATA.GOV.HK ↗</a><p>牌照 ${h(r.licence.number)}；名稱、地址及牌照資料。資料日期 ${r.fehdDate}。</p></article>${r.osm.map(o=>`<article><a href="${o.url}" target="_blank" rel="noopener noreferrer">OpenStreetMap ${h(o.id)} ↗</a><p>OSM 要素更新：${h(dateTime(o.updatedAt))}；版本 ${o.version}。${o.cuisineRaw?'菜式原文：'+h(o.cuisineRaw)+'。':'沒有可用的菜式標籤。'}</p></article>`).join('')||'<p>此記錄未建立可靠的 OSM 關聯，因此沒有補入菜式或位置資料。</p>'}</section><p class="fine-print">菜式只反映已配對的 OSM 社群標籤，未經餐廳確認。要素更新時間不等於每個欄位都在該日核實。此頁不是即時餐廳系統，到訪前請向餐廳確認。</p><p class="dining-dialog-attribution">${sourceLinks()} · <a href="${metadata.sourceUrls.osmLicense}" target="_blank" rel="noopener noreferrer">OSM 資料授權 ODbL</a></p>`;
    $('#restaurant-dialog').showModal();
  }
  function home(){return `<div class="dining-site-hero"><h2>今天，想在哪裡用餐？</h2><p class="dining-site-intro">告訴我地區與菜式，找到合適的餐廳。</p><button class="button" id="main-dining-chat" aria-controls="dining-chat-panel" aria-expanded="${open}">${icons.chat} 與餐廳助手對話 <span aria-hidden="true">↗</span></button></div>`;}
  function siteFooter(){return `<footer class="dining-site-footer"><details id="dining-source-note"><summary>資料來源與更新</summary><div><p>資料：${sourceLinks()}</p><p>食環署資料日期 ${metadata.fehdGeneratedAt}；OSM 快照 ${h(dateTime(metadata.osmSnapshotAt))}；本次匯入 ${metadata.importedAt}。</p><p>五區共 ${data.length} 筆選定記錄，並非完整名錄或即時資料。未核實的價格、營業時間、評分及空位不作推測。</p><p>OSM 資料依 <a href="${metadata.sourceUrls.osmLicense}" target="_blank" rel="noopener noreferrer">ODbL 1.0</a> 提供；食環署資料依 <a href="${metadata.sourceUrls.fehdTerms}" target="_blank" rel="noopener noreferrer">DATA.GOV.HK 條款</a> 使用。</p></div></details><p class="dining-footer-credit"><a href="${metadata.sourceUrls.fehd}" target="_blank" rel="noopener noreferrer">食環署</a> · <a href="${metadata.sourceUrls.osm}" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors</a></p></footer>`;}
  function render(resetScroll=false){
    const y=resetScroll?0:$('#dining-site-scroll')?.scrollTop||0;
    $('#workspace').classList.add('dining-workspace');
    ctx.replace(`<section class="dining-browser" aria-label="TABLE Safari 風格網站示範"><div class="dining-safari-bar"><div class="safari-traffic" aria-hidden="true"><i></i><i></i><i></i></div><div class="dining-safari-address"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="10" width="12" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg><span>table.flow2.local</span></div><span class="dining-browser-caption">模擬網站</span></div><div class="dining-browser-stage" id="dining-browser-stage"><div class="dining-site-scroll" id="dining-site-scroll"><header class="dining-site-header"><button class="dining-site-wordmark" data-dining-view="home" aria-label="返回 TABLE 首頁">table<span>香港餐廳探索</span></button><button class="text-action" data-dining-view="${catalogueOpen?'home':'library'}">${catalogueOpen?'返回餐廳助手':'查看資料庫'} <span aria-hidden="true">↗</span></button></header>${catalogueOpen?library():home()}${siteFooter()}</div></div></section>`);
    widget();$('#dining-site-scroll').scrollTop=y;
  }
  document.addEventListener('click',event=>{
    const b=event.target.closest('button');if(!b)return;
    if(b.id==='main-dining-chat')openChat('main-dining-chat');else if(b.hasAttribute('data-dining-view')){catalogueOpen=b.dataset.diningView==='library';render(true);(catalogueOpen?$('#catalogue-title'):$('#main-dining-chat'))?.focus({preventScroll:true});}
    else if(b.id==='dining-launcher')open?closeChat():openChat();else if(b.id==='open-dining-guide')openChat();else if(b.id==='dismiss-dining-guide'){guideDismissed=true;$('#dining-launcher-guide').hidden=true;$('#main-dining-chat')?.setAttribute('aria-expanded','false');($('#'+lastChatTrigger)||$('#dining-launcher')).focus({preventScroll:true});}else if(b.id==='close-dining-chat')closeChat();
    else if(b.hasAttribute('data-real-prompt'))ask(b.dataset.realPrompt,true);
    else if(b.hasAttribute('data-real-restaurant'))detail(b.dataset.realRestaurant,b);
    else if(b.hasAttribute('data-close-restaurant'))$('#restaurant-dialog').close();
    else if(b.hasAttribute('data-dining-page')){page=Number(b.dataset.diningPage);render();$('#dining-result-summary').focus({preventScroll:true});}
    else if(b.hasAttribute('data-clear-catalogue')){search='';cuisine='';district='';page=1;render();}
  });
  document.addEventListener('submit',event=>{
    const form=event.target;
    if(form.id==='real-catalogue-form'){event.preventDefault();const fd=new FormData(form);search=String(fd.get('search')).trim();cuisine=String(fd.get('cuisine'));district=String(fd.get('district')||'');page=1;render();}
    else if(form.id==='widget-query-form'){event.preventDefault();const query=$('#widget-query').value.trim();if(query)ask(query);}
  });
  document.addEventListener('change',event=>{if(['real-cuisine','real-district'].includes(event.target.id)){cuisine=$('#real-cuisine').value;district=$('#real-district').value;search=$('#real-catalogue-search').value.trim();page=1;render();}});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&open&&!$('#restaurant-dialog').open)closeChat();});
  $('#restaurant-dialog').addEventListener('close',()=>lastDialogTrigger?.isConnected&&lastDialogTrigger.focus({preventScroll:true}));
  return {meta,render,reset(){clearTimeout(replyTimer);pending=null;open=false;catalogueOpen=false;guideDismissed=false;search='';cuisine='';district='';page=1;setTimeout(()=>{ctx.state.dining.catalogueVersion=metadata.version;ctx.save();paintMessages();setBusy(false);$('#dining-launcher-guide').hidden=open;},0);},externalChange(){render();paintMessages();if(pending)setBusy(true);}};
};
