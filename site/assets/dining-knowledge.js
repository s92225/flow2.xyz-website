/* Local, source-grounded retrieval. No LLM, network, prices or inferred restaurant facts. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./demo-engine.js'),require('./lab-polish-rules.js'));
  else root.FlowDiningKnowledge=factory(root.FlowDemoEngine,root.FlowLabPolish);
})(typeof window==='undefined'?this:window,function(E,P){
  'use strict';
  const areas=['尖沙咀','中環','銅鑼灣','旺角','觀塘'];
  const cuisineAliases={
    '中式':['中式','中菜','中國菜','chinese'], '粵菜':['粵菜','廣東菜','點心','cantonese'],
    '日本菜':['日本','日式','壽司','japanese','sushi'], '意大利菜':['意大利','意粉','italian','pasta'],
    '泰國菜':['泰國','泰式','thai'], '韓國菜':['韓國','韓式','korean'], '印度菜':['印度','indian'],
    '法國菜':['法國','法式','french'], '越南菜':['越南','vietnamese'], '台灣菜':['台灣','台式','taiwanese'],
    '四川菜':['四川','川菜','sichuan'], '薄餅':['薄餅','披薩','pizza'], '麵食':['麵食','noodle'],
    '火鍋':['火鍋','hotpot','hot pot'], '海鮮':['海鮮','seafood'], '扒房':['扒房','牛扒','steak'],
    '燒烤':['燒烤','barbecue'], '甜品':['甜品','dessert'], '咖啡店':['咖啡','coffee','cafe'],
    '墨西哥菜':['墨西哥','mexican'], '西班牙菜':['西班牙','spanish'], '港式':['港式'],
  };
  const outsideAreas=['上環','西環','灣仔','北角','鰂魚涌','太古','佐敦','油麻地','太子','深水埗','黃大仙','九龍灣','荃灣','沙田','元朗','大埔','上水','屯門','將軍澳','西貢','香港仔','堅尼地城'];
  const empty=()=>({...E.emptyFilters(),dish:''});
  function label(r){return r.cuisines?.length?r.cuisines.join('、'):r.cuisineRaw?.length?'菜式未分類':'菜式未收錄';}
  function filter(data,filters){
    return P.filterRestaurants(data,filters).filter(r=>!filters.dish||(!r.classificationReview&&r.cuisineRaw?.includes(filters.dish)));
  }
  function hasName(query,name){
    if(!name||name.length<2)return false;
    const text=String(name).toLowerCase();
    if(/[\u3400-\u9fff]/.test(text))return query.includes(text);
    const escaped=text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    return new RegExp('(^|[^a-z0-9])'+escaped+'($|[^a-z0-9])','i').test(query);
  }
  function resolve(data,metadata,query,previous=empty(),preset=false){
    const q=String(query).trim().toLowerCase(),parsed=E.parseDining(q,preset?empty():previous);
    const filters={...empty(),...parsed.filters,dish:/重設|重新搜尋|不限條件|reset|start over/.test(q)?'':preset?'':previous.dish||''};
    let explicitCuisine=false;
    for(const [name,words] of Object.entries(cuisineAliases))if(words.some(w=>q.includes(w))){filters.cuisine=name;filters.dish='';explicitCuisine=true;}
    for(const name of new Set(data.flatMap(r=>r.cuisines)))if(q.includes(name)){filters.cuisine=name;filters.dish='';explicitCuisine=true;}
    if(/拉麵|ramen/.test(q)){filters.cuisine='';filters.dish='ramen';explicitCuisine=true;}
    if(/不限菜式|任何菜式|all cuisines/.test(q)){filters.cuisine='';filters.dish='';}
    const outside=outsideAreas.find(a=>q.includes(a));if(outside)filters.district=outside;
    const response=(kind,text,sources=[],matches=[])=>({kind,filters,matches,response:{role:'assistant',text,sources,catalogueVersion:metadata.version}});
    if(/資料來源|source|更新日期|幾時更新|匯入日期/.test(q))return response('provenance',`此版本收錄五區共 ${data.length} 筆食環署餐廳記錄，並以名稱、街道及門牌核對 OpenStreetMap 配對。\n\n食環署快照：${metadata.fehdGeneratedAt}\n本次匯入：${metadata.importedAt}\n\n每張記錄的「來源與詳情」列明食環署牌照編號、OSM 要素更新時間及來源連結。來源日期不代表到店核實或即時營業狀態。`);
    if(parsed.safety)return response('unverified','這份知識庫沒有足夠資料確認過敏原、清真或無麩質製作條件。請直接向餐廳確認；我不會把未知欄位當作安全或符合要求。');
    if(parsed.unknownFact||/評價|最高分|最好|best rated|review|仲開|開緊|訂位|訂枱|可唔可以book/.test(q))return response('unverified','此版本沒有評分、評論、即時營業狀態、等候時間或訂座空位，也不會代為訂座。食環署牌照記錄不代表餐廳此刻營業，請直接向餐廳確認。');
    if(outside)return response('outside',`目前只收錄${areas.join('、')}五區的選定資料，未收錄${outside}。我不會以鄰近地區代替。`);
    if(parsed.unsupported&&/天氣|股票|新聞|weather|stock price/.test(q))return response('unsupported','我只檢索這份餐廳知識庫。請提供已收錄地區、餐廳名稱或菜式；我不會搜尋外部資訊。');
    const hasUnknownCuisine=!explicitCuisine&&/[\u3400-\u9fff]{2,8}(?:菜|料理)/.test(q)&&!/菜式|有甚麼菜|有什麼菜/.test(q);
    const id=q.match(/fehd-\d+/i)?.[0]?.toUpperCase();
    const named=data.filter(r=>id?r.id===id:r.aliases.some(name=>hasName(q,name)));
    const localNames=named.filter(r=>!filters.district||r.district===filters.district);
    const restricted=filters.budget||filters.people||filters.vegetarian||filters.vegan||filters.accessible||filters.family;
    if(named.length&&!localNames.length)return response('named-outside','這間餐廳在目前地區沒有已收錄的相符記錄。請重設地區或在公開知識庫查看分店，不能只憑同名判定是同一分店。');
    if(localNames.length===1){
      const r=localNames[0];return response('named',`${r.name}\n${r.district} · ${label(r)}\n\n地址：${r.address}\n牌照來源：食環署 ${r.licence.number}\n${r.cuisines.length?'菜式依 OpenStreetMap 社群標籤分類，未經餐廳確認。':'菜式分類尚未確認，暫不提供。'}\n\n食環署快照：${r.fehdDate}；匯入：${r.importedAt}。${restricted?'未有足夠欄位核實您提出的預算、人數、飲食或設施條件，不能確認符合要求。':'價格、營業時間、評分及即時空位未核實，不提供估計。'}`,[r.id],[r]);
    }
    if(hasUnknownCuisine)return response('unknown-cuisine','未能辨識或核實您指定的菜式。請使用公開知識庫列出的菜式分類；我沒有把這個條件忽略後返回其他餐廳。');
    if(restricted)return response('unverified','這份資料沒有足夠欄位核實預算、人數、飲食限制或設施要求。我沒有把未知資料當作符合條件；您可改按地區、餐廳名稱或已有來源的菜式搜尋。');
    if(!localNames.length&&/地址|電話|在哪|喺邊|where is|address|phone/.test(q))return response('missing','未能辨識相符的餐廳記錄。請使用公開知識庫列出的完整名稱或 FEHD 記錄編號，我不會用其他餐廳的地址代替。');
    let matches=localNames.length?localNames:filter(data,filters);
    if(id&&!matches.length)return response('missing','目前知識庫沒有這個記錄編號，請使用本頁列出的餐廳名稱或記錄。');
    const hasIntent=!!(E.parseDining(q,empty()).filters.district||explicitCuisine||localNames.length)||/餐廳|食|吃|吃飯|推薦|介紹|restaurant|dinner|lunch|food|reset|重設|不限/.test(q);
    if(!hasIntent)return response('unsupported','未能辨識這個餐廳查詢。您可以輸入地區、已收錄的餐廳名稱或菜式，亦可使用下方預設問題。');
    if(!matches.length)return response('empty','這份選定資料中沒有符合條件的記錄，不代表區內沒有這類餐廳。未有菜式來源的記錄不會被當作符合菜式條件；可改選其他菜式或輸入「重設搜尋」。');
    return response('results',`找到 ${matches.length} 筆符合已收錄條件的記錄，先列出 ${Math.min(3,matches.length)} 筆：\n\n${matches.slice(0,3).map(r=>`${r.name}｜${r.district} · ${label(r)}${matches.length===1?'\n'+r.address:''}`).join('\n\n')}\n\n匯入 ${metadata.importedAt}。非評分排名；菜式依 OSM 社群標籤。按下方記錄查看完整地址及來源。`,matches.slice(0,3).map(r=>r.id),matches);
  }
  return {areas,empty,label,filter,resolve};
});
