'use strict';

// Interactive presentation. Contact opens an owner-confirmed WhatsApp draft; no automatic sending or form backend.
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const pair = (zh, en) => [zh, en];
let lang = 'zh';
const text = value => Array.isArray(value) ? value[lang === 'zh' ? 0 : 1] : value;
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const copy = {
  skip:pair('跳到內容','Skip to content'), proposal:pair('← 提案總覽','← All concepts'), prototype:pair('Simple V5 · 本機互動原型，未部署','Simple V5 · Local prototype, not deployed'), previous:pair('上一版 ↗','Previous ↗'),
  'nav.services':pair('Showcase','Showcase'),'nav.work':pair('成效','Impact'),'nav.pricing':pair('收費','Pricing'),
  'contact.short':pair('預約諮詢 <span aria-hidden="true">↗</span>','Let’s talk <span aria-hidden="true">↗</span>'),
  'contact.full':pair('諮詢自動化方案 <span aria-hidden="true">↗</span>','Talk through a workflow <span aria-hidden="true">↗</span>'),
  'hero.first':pair('仲用緊人手去管理<wbr><span class="hero-question-tail">你盤生意?</span>','Still running it manually?'),
  'hero.body':pair('為香港中小企業整合查詢、文件與日常營運。<br>由您掌握決策，讓流程處理重複工作。','Practical automation for Hong Kong SMEs.<br>You make decisions. The workflow does the repeat work.'),
  'hero.try':pair('了解運作方式 <span aria-hidden="true">↓</span>','See it in action <span aria-hidden="true">↓</span>'),
  'demo.title':pair('一份資料，接好下一步。','One input. The next steps, connected.'),'demo.caption':pair('概念示範 · 非客戶系統','Illustrative demo · Not a client system'),
  replay:pair('再播一次','Replay'), 'tools.lead':pair('沿用您熟悉的工具。','Keep the tools you know.'),'tools.note':pair('接駁按項目確認，並非合作或認證聲明。','Integrations are scoped per project, not partnership or certification claims.'),
  'services.title':pair('Showcase','Showcase'),'services.body':pair('','Four services. Shown, not just described.'),
  'work.title':pair('把重複工作，<br>換成更多時間。','Less repetition.<br>More time for what matters.'),'work.note':pair('根據原網站六個案例整理；畫面為流程示意，並非客戶系統截圖。名稱及細節的公開使用仍待確認。','Adapted from the six existing website cases. These are rebuilt workflow illustrations, not client screenshots. Public use of names and details is still to be confirmed.'),
  'studio.title':pair('理解營運，<br>才能做好自動化。','Operations first.<br>Automation second.'),'studio.body':pair('結合市場推廣與電商營運經驗，先了解您的工作方式，再找出值得自動化的環節。','Built on marketing and ecommerce operating experience. We map how work happens before deciding what to automate.'),
  'pricing.title':pair('由一條流程開始。','Start with one workflow.'),'pricing.body':pair('明確界定範圍，再設計合適方案。','Define the scope. Then connect the work.'),'pricing.custom':pair('流程製作、AI／業務系統及團隊培訓，均按項目需求報價。','Workflow builds, AI / business systems and team training are quoted per project.'),'pricing.note':pair('先確認需求、交付範圍及支援安排，再提供項目報價；第三方訂閱、API／AI 用量、WhatsApp、hosting 及平台費，除非另有說明，並不包括在內。','Project quotes follow an agreed scope, requirements and support arrangement. Third-party subscriptions, APIs, AI usage, WhatsApp, hosting and platform costs are excluded unless stated.'),
  'faq.title':pair('常見問題','A few useful answers.'), 'contact.title':pair('下一項改善，<br>由您開始。','Your next flow<br>starts here.'),'contact.body':pair('告訴我們，您希望優先改善哪一項重複工作。','Tell us the task you would rather not repeat.'),
  'footer.studio':pair('工作室','Studio'),'footer.strategy':pair('架構及文案','Content strategy'),'footer.qa':pair('驗證紀錄','Verification'),'footer.note':pair('本機提案，未接駁真實業務或傳送資料。','Local concept only; no business systems connected and no data sent.'),'footer.reference':pair('互動參考：Mobbin ↗','Interaction reference: Mobbin ↗'),
  'footer.description':pair('香港 AI 自動化工作室。<br>為您的生意，建立專屬系統。','A Hong Kong AI automation studio.<br>Systems built around your business.'), 'footer.location':pair('香港 · 為每一步接上可能','Hong Kong · Connecting what comes next'),
  'footer.sitemap':pair('網站導覽','Explore'),'footer.contact':pair('預約諮詢','Book a consultation'),'footer.demos':pair('親身試用','Try the systems'),'footer.roster':pair('零售排班','Retail scheduling'),'footer.yoga':pair('瑜伽預約','Yoga booking'),'footer.dining':pair('餐廳助手','Restaurant assistant'),'footer.reach':pair('客戶研究與外展','Research & outreach'),'footer.social':pair('保持聯繫','Stay connected'),'footer.preview':pair('本機預覽資訊','About this local preview')
};
const c = key => text(copy[key]);
const icons = {
  message:'<path d="M5 4h14v12H9l-4 4V4Z"/><path d="M9 8h6M9 12h4"/>',
  sheet:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h8M12 8v8"/>',
  doc:'<path d="M14 3H6v18h12V7l-4-4Z"/><path d="M14 3v5h5M9 12h6M9 16h6"/>',
  spark:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/>',
  box:'<path d="m3 7 9-4 9 4-9 5-9-5Zm0 0v10l9 4 9-4V7M12 12v9"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 14h2M14 14h2M8 17h2"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  link:'<path d="m9 15 6-6M9 6l2-2a5 5 0 0 1 7 7l-2 2M15 18l-2 2a5 5 0 0 1-7-7l2-2"/>'
};
const icon = (name, color='blue') => `<span class="app-symbol symbol-${color}" aria-hidden="true"><svg viewBox="0 0 24 24">${icons[name] || icons.doc}</svg></span>`;
const check = '<span class="mini-check" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg></span>';

// All business facts below are adapted from the retained original source.
// Example messages and UI records are deliberately labelled illustrative.
const scenarios = [
  {name:pair('查詢 → 報價','Enquiry → quote'),input:pair('新報價查詢','New quote request'),from:pair('表單 / WhatsApp','Form / WhatsApp'),symbol:'message',color:'green',message:pair('想了解 11 月 3 日約 50 人的公司活動安排，請提供報價。','Could you quote for a company event on 3 November, for around 50 people?'),output:pair('活動報價草稿','Event quote draft'),rows:[pair('活動日期','Event date'),pair('參加人數','Attendees'),pair('下一步','Next action')],values:[pair('11 月 3 日','3 November'),pair('50 人','50 people'),pair('日曆預留＋跟進任務','Calendar hold + follow-up')],review:pair('確認報價草稿','Approve this draft'),approved:pair('草稿已確認。正式寄送仍由團隊決定。','Draft approved. The team still decides when to send.')},
  {name:pair('入件 → 庫存','Intake → inventory'),input:pair('新寄售入件','New consignment intake'),from:pair('客戶入件表單','Client intake form'),symbol:'box',color:'orange',message:pair('手袋一件，款式及狀況已記錄。等客戶確認寄售資料。','One handbag, with model and condition recorded. Awaiting client confirmation of the intake.'),output:pair('寄售入件記錄','Consignment record'),rows:[pair('入件編號','Intake ID'),pair('文件','Document'),pair('同步記錄','Connected records')],values:[pair('IN-003 · 示例','IN-003 · Sample'),pair('收據草稿','Receipt draft'),pair('庫存＋銷售＋結算表','Inventory + sales + payout sheet')],review:pair('確認入件資料','Approve intake details'),approved:pair('入件已確認。庫存與後續記錄採用同一資料來源。','Intake approved. Inventory and downstream records share one source.')},
  {name:pair('資料 → 週報','Research → draft'),input:pair('本週資料已整理','Weekly research ready'),from:pair('Notion 資料庫','Notion database'),symbol:'sheet',color:'blue',message:pair('篩選過去七日的內容，保留來源連結，整理成可編輯的週報。','Filter the last seven days of research, preserve the source links and prepare an editable weekly issue.'),output:pair('本週編輯草稿','Weekly editorial draft'),rows:[pair('資料範圍','Source window'),pair('輸出位置','Draft location'),pair('審核紀錄','Review record')],values:[pair('過去七日','Last seven days'),pair('Google Docs','Google Docs'),pair('連結寫回 Notion','Link returned to Notion')],review:pair('交由編輯覆核','Send to editorial review'),approved:pair('草稿已交由編輯覆核，不會自動發送 EDM。','Draft ready for review. No newsletter is sent automatically.')},
  {name:pair('更新 → 知識','Updates → knowledge'),input:pair('新事件更新','New incident update'),from:pair('Email / SharePoint','Email / SharePoint'),symbol:'doc',color:'purple',message:pair('將更新整理成具備來源、狀態及追蹤記錄的知識條目。','Turn an update into a structured knowledge record with its source, status and trace ID.'),output:pair('待確認知識記錄','Knowledge record for review'),rows:[pair('資料來源','Source'),pair('發佈規則','Publishing rule'),pair('追蹤紀錄','Trace record')],values:[pair('Email＋SharePoint','Email + SharePoint'),pair('Active 才可發佈','Publish active content only'),pair('ID 寫回 Excel','ID returned to Excel')],review:pair('確認發佈狀態','Confirm publishing status'),approved:pair('狀態已確認，並保留記錄及來源追蹤。','Status confirmed, with record and source trace preserved.')}
];
const initialWorkflow=Math.max(0,['enquiries','shopify','report','knowledge'].indexOf(new URLSearchParams(location.search).get('scenario')));
const hero = {scenario:initialWorkflow,step:0,approved:false};
const phases = [pair('收到資料','Received'),pair('整理記錄','Structured'),pair('接好下一步','Connected'),pair('人手覆核','Human review')];
const cases = [
  {id:'playnest',name:'PlayNest Events',category:'operations',title:pair('查詢接收與後續跟進，一次接通。','Enquiry in. Follow-up ready.'),summary:pair('將報價要求整合為聯絡記錄、文件、日曆預留、Notion 任務及覆核提醒。','One quote request becomes a contact, document, calendar hold, Notion task and review alert.'),input:pair('報價查詢','Quote request'),output:pair('報價草稿','Quote draft'),symbol:'message',outSymbol:'doc',color:'green',tools:'Form · Google Docs · Calendar · Notion',human:pair('客戶溝通、最終報價及寄送均由團隊確認。','The team owns client communication, final pricing and sending.'),steps:[pair('收到查詢','Receive'),pair('整理資料','Structure'),pair('建立草稿','Prepare'),pair('團隊覆核','Review')],details:[pair('將一個活動查詢記錄低，保留日期、人數及需求。','Capture the event enquiry, including date, attendee count and requirements.'),pair('建立統一聯絡記錄，無須在不同系統重複輸入。','Create the contact record without re-entering it in each system.'),pair('建立報價文件、日曆預留及跟進任務。','Prepare the quote document, calendar hold and follow-up task.'),pair('通知負責人，由團隊決定最終內容及客戶回覆。','Notify the owner. The team decides the final content and client reply.')],records:[pair('查詢內容 → 結構記錄','Enquiry → structured record'),pair('聯絡人 → 單一資料來源','Contact → one source of truth'),pair('文件＋日曆＋任務 → 已接通','Document + calendar + task → connected'),pair('下一步 → 等團隊確認','Next action → team review')]},
  {id:'lumeluxe',name:'LumeLuxe',category:'operations',title:pair('一份入件，接通寄售全程。','One intake, connected records.'),summary:pair('從客戶簽署、收據、庫存、Shopify 銷售資料至結算表，均沿用同一份入件資料。','Client sign-off, receipts, inventory, Shopify sales and payout sheets share the same intake details.'),input:pair('寄售入件','Consignment intake'),output:pair('庫存記錄','Inventory record'),symbol:'box',outSymbol:'sheet',color:'orange',tools:'Client form · Receipts · Shopify · Sheets',human:pair('商品狀況、寄售條件及結算仍須確認。','Item condition, consignment terms and payouts still require review.'),steps:[pair('客戶入件','Intake'),pair('簽署收據','Sign-off'),pair('庫存銷售','Inventory'),pair('整理結算','Payout')],details:[pair('記錄商品及客戶資料，建立一致入件編號。','Record item and client details under a consistent intake ID.'),pair('接通客戶簽署及收據建立，保留文件。','Connect client sign-off and receipt creation, preserving the documents.'),pair('入件記錄延續到庫存及 Shopify 銷售資料。','Carry the intake record into inventory and Shopify sales data.'),pair('將對應銷售整理入結算表，供團隊核對。','Bring the corresponding sales into payout sheets for team checks.')],records:[pair('入件 → 同一編號','Intake → one ID'),pair('簽署＋收據 → 有紀錄','Sign-off + receipt → recorded'),pair('庫存＋銷售 → 有對應','Inventory + sale → linked'),pair('結算表 → 等核對','Payout sheet → ready to check')]},
  {id:'rsvp',name:'RSVP',category:'knowledge',title:pair('自動整理內容訊號。','A content watchlist in one place.'),summary:pair('整理指定 Instagram 帳戶的帖文、中繼資料、訊號及圖片預覽，匯入 Notion 供團隊檢視。','Posts, metadata, signals and image previews from selected Instagram accounts are organised into Notion for review.'),input:pair('指定帳戶','Selected accounts'),output:pair('內容清單','Content watchlist'),symbol:'message',outSymbol:'sheet',color:'purple',tools:'Instagram · Notion · Automation',human:pair('先確認來源權限及平台規則，再由團隊判斷內容。','Source permissions and platform rules must be checked; editorial judgment stays with the team.'),steps:[pair('指定來源','Sources'),pair('收集帖文','Collect'),pair('整理訊號','Organise'),pair('團隊檢視','Review')],details:[pair('先界定需要關注的帳戶，避免無差別收集。','Define the accounts that matter rather than collecting indiscriminately.'),pair('依照已確認的接駁方式，取得帖文資料及預覽。','Collect post data and previews through the agreed integration.'),pair('保留中繼資料及訊號，匯入 Notion 資料庫供團隊檢視。','Preserve metadata and signals in a Notion review database.'),pair('由團隊參考原始來源作出判斷，不自動代為下結論。','The team checks the source and decides what to do next.')],records:[pair('來源 → 已指定','Sources → selected'),pair('帖文＋圖片 → 已整理','Posts + previews → collected'),pair('訊號 → 可篩選清單','Signals → filterable list'),pair('下一步 → 團隊判斷','Next action → team judgment')]},
  {id:'harbour',name:'Harbour Weekly',category:'knowledge',title:pair('整合一週資料，建立可編輯草稿。','A week of research. One editable draft.'),summary:pair('篩選過去七日的 Notion 資料，整理編輯簡報，以 AI 建立 Google Docs 草稿，再將連結寫回原記錄。','Filter seven days of Notion research, prepare an editorial brief, create an AI-assisted Google Docs draft and return its link to the original record.'),input:pair('每週研究','Weekly research'),output:pair('編輯草稿','Editorial draft'),symbol:'sheet',outSymbol:'doc',color:'blue',tools:'Notion · Gemini · Google Docs · Make',human:pair('輸出為編輯草稿，並非自動發送的 EDM。編輯保留最終決定權。','The output is a draft, not an automatically sent newsletter. Editors make the final call.'),steps:[pair('篩選七日','Filter'),pair('整理來源','Brief'),pair('草擬內容','Draft'),pair('編輯覆核','Review')],details:[pair('只用本週研究資料，避免舊內容混入今期。','Use only the current week’s research, keeping older material out of the issue.'),pair('將來源打包成編輯簡報，保留連結。','Pack the sources into an editorial brief with links preserved.'),pair('建立具備段落、主題及參考來源的繁體中文 Google Docs 草稿。','Create a Traditional Chinese Google Docs draft with sections, topics and references.'),pair('將草稿連結及內容寫回 Notion，方便覆核與日後檢索。','Return the draft link and body to Notion for review and retrieval.')],records:[pair('範圍 → 過去七日','Window → last seven days'),pair('來源 → 保留連結','Sources → links preserved'),pair('草稿 → Google Docs','Draft → Google Docs'),pair('審核 → Notion 記錄','Review → Notion record')]},
  {id:'swire',name:'Swire Group',category:'knowledge',title:pair('分散更新，變可追蹤知識。','Updates become traceable knowledge.'),summary:pair('接通 Line to Take 電郵、SharePoint 事件資料、AI 整理、知識庫及 Excel 追蹤 ID。','Connect Line to Take emails, SharePoint incident material, AI preparation, the knowledge base and Excel trace IDs.'),input:pair('事件更新','Incident updates'),output:pair('知識記錄','Knowledge record'),symbol:'doc',outSymbol:'link',color:'purple',tools:'Email · SharePoint · AI · Knowledge base · Excel',human:pair('按 Active／reference 規則控制發佈，保留來源及 ID。','Active/reference rules control publishing, with sources and trace IDs retained.'),steps:[pair('收集更新','Capture'),pair('AI 整理','Structure'),pair('判斷狀態','Status'),pair('記錄來源','Trace')],details:[pair('從電郵及 SharePoint 接收更新，保留原始上下文。','Receive email and SharePoint updates without losing their original context.'),pair('整理日期、分類及文字，建立一致記錄。','Prepare dates, classifications and text as consistent records.'),pair('Active 內容先進入知識庫；其他內容保留作內部參考。','Active content enters the knowledge base; other material remains an internal reference.'),pair('將 collection／chunk ID 寫回 Excel，保留答案的來源追蹤記錄。','Return collection/chunk IDs to Excel so answers can be traced to their source.')],records:[pair('輸入 → Email＋SharePoint','Inputs → email + SharePoint'),pair('記錄 → 日期＋分類＋摘要','Record → date + class + summary'),pair('發佈 → Active 才通過','Publish → active only'),pair('追蹤 → ID 寫回 Excel','Trace → ID returned to Excel')]},
  {id:'shiftwise',name:'Shiftwise Staffing',category:'operations',title:pair('自動辨識更表空缺。','Find the gaps in tomorrow’s roster.'),summary:pair('每日檢查翌日尚未填補的班次，讀取相關可用日期，整理候選人摘要以供跟進。','Check tomorrow’s unfilled roster slots, read the nearby availability window and return a clean candidate summary.'),input:pair('明日更表','Tomorrow’s roster'),output:pair('空缺摘要','Staffing summary'),symbol:'calendar',outSymbol:'doc',color:'green',tools:'Google Sheets · Make · Parent workflow',human:pair('自動處理重複檢查；人員聯絡、排班及確認仍由負責人決定。','The repetitive check is automated; outreach, scheduling and confirmation stay with the owner.'),steps:[pair('篩選聽日','Date'),pair('識別班次空缺','Gaps'),pair('讀取可用人','Availability'),pair('交回摘要','Handoff')],details:[pair('篩選下一個日曆日的更表，避免掃描所有日期。','Filter the next calendar day’s roster instead of scanning every date.'),pair('只保留關鍵人員欄位尚未填寫的記錄。','Keep only rows where the key staffing fields are still blank.'),pair('讀取相應行及附近幾行，保留可用日期上下文。','Read the matching row and nearby rows for availability context.'),pair('將候選人整理成一段文字，交回母流程作提醒或覆核。','Aggregate candidates into one text summary for the parent workflow to notify or review.')],records:[pair('日期 → 下一個日曆日','Date → next calendar day'),pair('條件 → 人員欄空白','Rule → unfilled staff fields'),pair('資料 → 附近可用日期','Context → nearby availability'),pair('輸出 → 候選人摘要','Output → candidate summary')]}
];
const plans = [
  {name:pair('流程評估','Flow Audit'),price:'0',from:false,lead:pair('找出重複工作，確立改善方向。','Know it is too manual, but not where to start.'),items:[pair('一次諮詢及流程檢視','Consultation and process review'),pair('改善機會及優先建議','Opportunity map and priorities'),pair('建議第一條自動流程','Recommended first workflow')]},
  {name:pair('流程製作','Workflow Build'),price:pair('按需求報價','Custom quote'),quote:true,from:false,lead:pair('針對已明確界定的問題，建立實用流程。','A clear problem, built into a usable workflow.'),items:[pair('按需求設計及製作流程','Workflows designed around your requirements'),pair('工具接駁、測試及交接','Integrations, testing and handover'),pair('支援期按項目範圍確認','Support period agreed by scope')]},
  {name:pair('AI／業務系統','AI / Business OS'),price:pair('按需求報價','Custom quote'),quote:true,from:false,lead:pair('運用 AI 整理、草擬，串連跨系統營運。','AI extraction, drafting or wider operations.'),items:[pair('AI 資料擷取、草稿或助理設定','AI extraction, drafts or assistant setup'),pair('接通業務流程及測試','Workflow integration and testing'),pair('先定資料、審批及維護規則','Data, review and maintenance rules')]}
];
const methods = [
  {word:'Map',label:pair('了解流程','Map the work'),body:pair('先梳理資料入口、決策權責及交接環節。','Map the inputs, the decisions and the handoffs first.'),nodes:[pair('資料來源','Source'),pair('負責人','Owner'),pair('優先改善環節','Next step')]},
  {word:'Trigger',label:pair('定義起點','Define the trigger'),body:pair('以表單、電郵或指定時間，明確定義流程的觸發條件。','A form, an email or a schedule: define exactly when the workflow starts.'),nodes:[pair('新查詢','Enquiry'),pair('符合條件','Rule'),pair('開始流程','Start')]},
  {word:'Action',label:pair('接好動作','Connect the action'),body:pair('接通記錄、草稿與提醒，將需要判斷的環節保留給團隊。','Connect records, drafts and alerts. Keep judgment with people.'),nodes:[pair('整理資料','Structure'),pair('建立草稿','Draft'),pair('人手覆核','Review')]},
  {word:'Goal',label:pair('測試交接','Test & hand over'),body:pair('以測試資料驗證流程，訂定檢查方法、例外處理及維護安排。','Run sample data, agree output checks, exception handling and a maintenance rhythm.'),nodes:[pair('測試輸出','Test'),pair('團隊接手','Handover'),pair('持續檢查','Maintain')]}
];
const faqs = [
  [pair('系統會自動回覆客戶嗎？','Will it reply to customers on its own?'),pair('自動回覆取決於雙方確認的流程規則。涉及報價、例外或判斷的內容，可先產生草稿交由團隊覆核，不預設全自動寄送。','That depends on the rules you agree to. This demo deliberately stops for human review. Quotes, exceptions and judgment calls can stay as drafts for your team; automatic sending is not assumed.')],
  [pair('是否需要更換現有工具？','Do we have to replace our tools?'),pair('不一定。我們會先了解現有工具及交接方式，再確認合適的 API、權限與整合方法，避免為自動化而增加不必要的改動。','Not necessarily. We review your current tools and handoffs, then confirm suitable APIs, access and integrations. Automation should not mean rebuilding your company.')],
  [pair('報價是否包括平台費用？','Do project quotes include software fees?'),pair('除非報價另有說明，第三方訂閱、AI／API 用量、WhatsApp、寄存及自動化平台費用均不包括在內。正式開始前會確認服務範圍及支援安排。','Unless the quote says otherwise, third-party subscriptions, AI/API usage, WhatsApp, hosting and automation platform fees are excluded. Scope and support are agreed before work begins.')]
];

let paused = false;
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const demos = new Map();
let activeFilter='all', methodIndex=0, modal=null, modalStep=0;
const dialog=$('#detail-dialog');
let lastDialogTrigger=null;
const draft={name:'',message:'',workflow:''};
let invoiceStory=null;

function paintCopy(){
  document.documentElement.lang=lang==='zh'?'zh-Hant':'en';
  document.title=lang==='zh'?'Flow2 — 仲用緊人手去管理你盤生意?':'Flow2 — Still running it manually?';
  $$('[data-copy]').forEach(el=>{if(copy[el.dataset.copy]) el.innerHTML=c(el.dataset.copy);});
  $('[data-language]').textContent=lang==='zh'?'EN':'中';
  $('[data-language]').setAttribute('aria-label',lang==='zh'?'Switch to English':'切換至中文');
  $('#main-nav').setAttribute('aria-label',text(pair('主要導覽','Main navigation')));
  $('#workflow').setAttribute('aria-label',text(pair('互動流程示範','Interactive workflow demonstration')));
  $('#scenario-tabs').setAttribute('aria-label',text(pair('選擇示範流程','Choose a workflow')));
  $('#hero-steps').setAttribute('aria-label',text(pair('示範步驟','Demonstration steps')));

  $('#method-buttons')?.setAttribute('aria-label',text(pair('合作步驟','How we work')));
  $('[data-menu]').setAttribute('aria-label',text(pair($('#main-nav').classList.contains('is-open')?'關閉導覽選單':'開啟導覽選單',$('#main-nav').classList.contains('is-open')?'Close menu':'Open menu')));
  $('[data-close]').setAttribute('aria-label',text(pair('關閉','Close')));
  $('.footer-sitemap').setAttribute('aria-label',text(pair('網站導覽','Website navigation')));
  $('.footer-demos').setAttribute('aria-label',text(pair('互動系統示範','Interactive system demos')));
  $('.footer-social a').setAttribute('aria-label',text(pair('Flow2 Instagram（在新分頁開啟）','Flow2 Instagram (opens in a new tab)')));
  paintPause();
}
function renderHero(){
  const saved=invoiceStory?.snapshot();invoiceStory?.destroy();invoiceStory=null;
  const stage=$('[data-demo="hero"]'), isInvoice=hero.scenario===0;
  const kind=[null,'shopify','report','knowledge'][hero.scenario];
  const Factory=isInvoice?FlowInvoiceStory:FlowFunctionStory;
  const args=isInvoice?[lang]:[kind,lang];
  const titles=[pair('自動處理客人查詢','Automate enquiries'),pair('Shopify 訂單同步','Shopify order sync'),pair('生成報表','Generate reports'),pair('知識庫持續學習','Growing knowledge base')];
  stage.classList.toggle('is-invoice-story',isInvoice);stage.classList.toggle('is-function-story',!isInvoice);
  $('#scenario-tabs').innerHTML=titles.map((label,i)=>`<button data-scenario="${i}" aria-pressed="${i===hero.scenario}">${text(label)}</button>`).join('');
  $('.stage-label [data-copy="demo.title"]').textContent=isInvoice?text(pair('回覆查詢，一鍵生成發票。','Reply, then generate an invoice')):FlowFunctionStory.header(kind,lang);
  $('#hero-canvas').innerHTML=Factory.markup(...args);
  const note=$('.story-honesty', $('#hero-canvas'));
  $('#workflow-info').textContent=note?.textContent||text(pair('此動畫不會執行真實操作。','This animation performs no live actions.'));
  note?.remove();
  $('.demo-info summary').setAttribute('aria-label',text(pair('關於此示範','About this demonstration')));
  $('#hero-steps').innerHTML=Factory.phases(...args).map((label,i)=>`<button class="step-button" data-story-phase="${i}" aria-pressed="false"><span class="step-circle" aria-hidden="true">${i+1}</span><span>${label}</span></button>`).join('');
  $('#hero-announcement').textContent='';
  invoiceStory=new Factory(stage,{locale:lang,isPaused:()=>paused,onPhase:phase=>{hero.step=phase;},state:saved});
}
function syncHero(){invoiceStory?.update(true);}
function renderServices(){ FlowDemoCards.render($('#service-grid'),lang); }
function previewMarkup(s){
  let body='';
  if(s.id==='playnest')body=`<div class="case-quote-date">3 <small>NOV</small></div><div class="preview-line"><span>${text(pair('活動','Event'))}</span><span>${text(pair('公司活動','Company event'))}</span></div><div class="preview-line"><span>${text(pair('參加人數','Attendees'))}</span><span>50</span></div>`;
  if(s.id==='lumeluxe')body=`<div class="case-stock-line">${icon('box','orange')}<div>IN-003<small>${text(pair('寄售商品','Consignment item'))}</small></div></div>${[pair('入件記錄','Intake'),pair('庫存同步','Inventory'),pair('結算表','Payout sheet')].map(v=>`<div class="preview-line"><span>${text(v)}</span>${check}</div>`).join('')}`;
  if(s.id==='rsvp')body=`<div class="watchlist-covers"><div>${icon('message','purple')}<span>POST 01</span></div><div>${icon('spark','blue')}<span>POST 02</span></div></div><div class="preview-line"><span>${text(pair('來源＋訊號','Source + signal'))}</span><span>Notion ↗</span></div>`;
  if(s.id==='harbour')body=`<div class="editor-sheet"><small>WEEKLY / DRAFT</small><strong>${text(pair('本週值得留意','This week’s focus'))}</strong><p>${text(pair('整理來源，保留觀點。','Sources organised. Editorial judgment retained.'))}</p></div><div class="preview-line"><span>Google Docs</span><span>${text(pair('待覆核','For review'))}</span></div>`;
  if(s.id==='swire')body=`<div class="case-stock-line">${icon('link','purple')}<div>KB-003<small>${text(pair('來源可追蹤','Source traceable'))}</small></div></div><div class="preview-line"><span>${text(pair('狀態','Status'))}</span><span class="status-tag done">Active</span></div><div class="preview-line"><span>Excel ID</span><span>KB-003 ↗</span></div>`;
  if(s.id==='shiftwise')body=`<div class="roster-mini"><span></span><span>3</span><span>4</span><span>5</span><span>A</span><i></i><i class="gap"></i><i></i><span>B</span><i></i><i></i><i class="gap"></i><span>C</span><i class="gap"></i><i></i><i></i></div><div class="preview-line"><span>${text(pair('空缺已標示','Gaps highlighted'))}</span><span class="roster-legend"></span></div>`;
  return `<div class="preview-paper"><div class="mini-heading"><span>${text(s.output)}</span><span aria-hidden="true">↗</span></div>${body}</div>`;
}
function renderCases(){window.FlowOutcomeEstimator.render($('#outcome-estimator'),lang);}
function renderMethod(){
  $('#method-buttons').innerHTML=methods.map((m,i)=>`<button data-method="${i}" aria-pressed="${i===methodIndex}">${i+1} · ${text(m.label)}</button>`).join('');
  const m=methods[methodIndex];$('#method-stage').innerHTML=`<div class="content-enter"><div class="method-big">${m.word}</div><p>${text(m.body)}</p><div class="method-art">${m.nodes.map((v,i)=>`${i?'<i aria-hidden="true">→</i>':''}<span>${text(v)}</span>`).join('')}</div></div>`;
}
function renderPricing(){
  $('#pricing-grid').innerHTML=plans.map((p,i)=>`<article class="price-card ${i===1?'featured':''}"><h3>${text(p.name)}</h3><p class="plan-for">${text(p.lead)}</p><p class="price ${p.quote?'price-quote':''}">${p.quote?text(p.price):`<small>HK$</small>${p.price}`}</p><p class="plan-billing">${text(p.quote?pair('按項目計費','Per project'):pair('免費流程諮詢','Free process consultation'))}</p><ul class="plan-list">${p.items.map(v=>`<li>${text(v)}</li>`).join('')}</ul><button class="pill light" data-plan="${i}">${text(pair('諮詢此方案','Talk about this plan'))} <span aria-hidden="true">↗</span></button></article>`).join('');
}
function renderFaq(){ $('#faq-list').innerHTML=faqs.map(([q,a])=>`<details><summary>${text(q)}</summary><p>${text(a)}</p></details>`).join(''); }

const observer=new IntersectionObserver(entries=>entries.forEach(e=>{const d=demos.get(e.target.dataset.demo);if(d){d.visible=e.isIntersecting;d.last=performance.now();syncDemo(d);}}),{threshold:.18});
function bindDemos(){
  const old=new Map(demos);observer.disconnect();demos.clear();
  $$('[data-demo]').forEach(el=>{const id=el.dataset.demo, previous=old.get(id);const d={id,el,step:id==='hero'?hero.step:previous?.step??(reduce.matches?3:0),running:previous?.running??!reduce.matches,visible:false,last:performance.now()};if(d.step>=3||(id==='hero'&&invoiceStory))d.running=false;demos.set(id,d);el.dataset.step=d.step;observer.observe(el);syncDemo(d);});
}
function syncDemo(d){d.el.classList.toggle('is-resting',!d.visible||!d.running);}
function replay(id){
  if(id==='hero'&&invoiceStory){invoiceStory.replay();return;}
  const d=demos.get(id);if(!d)return;d.step=reduce.matches?3:0;d.running=!reduce.matches;d.last=performance.now();d.el.dataset.step=d.step;
  if(id==='hero'){hero.step=d.step;hero.approved=false;syncHero(true);}syncDemo(d);
}
function paintPause(){
  document.body.classList.toggle('is-paused',paused);
  const b=$('[data-pause]');b.setAttribute('aria-pressed',paused);
  b.setAttribute('aria-label',text(paused?pair('繼續動畫','Resume animations'):pair('暫停動畫','Pause animations')));
  $('[data-pause-icon]').textContent=paused?'▷':'Ⅱ';
  $('[data-pause-text]').textContent=text(paused?pair('繼續動畫','Resume animations'):pair('暫停動畫','Pause animations'));
  invoiceStory?.sync();
}
setInterval(()=>{
  if(paused||reduce.matches||document.hidden)return;
  const now=performance.now();
  demos.forEach(d=>{if(!d.visible||!d.running||now-d.last<1700)return;d.step=Math.min(3,d.step+1);d.last=now;d.el.dataset.step=d.step;if(d.id==='hero'){hero.step=d.step;syncHero();}if(d.step===3)d.running=false;syncDemo(d);});
},200);
document.addEventListener('visibilitychange',()=>{demos.forEach(d=>d.last=performance.now());document.body.classList.toggle('is-hidden',document.hidden);});
reduce.addEventListener('change',()=>{demos.forEach(d=>{d.running=false;if(reduce.matches){d.step=3;d.el.dataset.step=3;if(d.id==='hero'){hero.step=3;syncHero();}}syncDemo(d);});});

function openDialog(kind,data,trigger){
  modal={kind,data};modalStep=0;lastDialogTrigger=trigger||document.activeElement;renderDialog();if(!dialog.open)dialog.showModal();
}
function renderDialog(){
  const type=$('#detail-type'),container=$('#detail-content');
  if(!modal)return;
  if(modal.kind==='case'){
    const s=cases.find(v=>v.id===modal.data);type.textContent=text(pair('原網站案例 · 流程重編','Existing case · Rebuilt workflow'));
    container.innerHTML=`<h2 id="detail-title">${s.name}</h2><p class="dialog-lead">${text(s.summary)}</p><div class="detail-steps" role="group" aria-label="${text(pair('案例步驟','Case steps'))}">${s.steps.map((v,i)=>`<button data-detail-step="${i}" aria-pressed="${i===modalStep}">${i+1}. ${text(v)}</button>`).join('')}</div><div class="detail-preview" data-ui><div class="detail-output content-enter"><h3>${text(s.steps[modalStep])}</h3><p>${text(s.details[modalStep])}</p><ul>${s.records.slice(0,modalStep+1).map(v=>`<li><span>${text(v)}</span>${check}</li>`).join('')}</ul></div></div><p class="detail-caption">${text(s.human)}</p><p class="dialog-tools">${s.tools}</p><p class="small-note" style="margin-top:12px">${text(pair('此為概念流程示意，並非客戶系統截圖；名稱及內容的公開使用仍待確認。','Illustrative flow, not a client screenshot. Public use of names and content is to be confirmed.'))}</p><button class="pill dark dialog-contact" data-contact>${text(pair('諮詢類似流程','I have a similar workflow'))} <span aria-hidden="true">↗</span></button>`;
  }else{
    type.textContent=text(pair('預約諮詢','Book a consultation'));
    container.innerHTML=`<h2 id="detail-title">${text(pair('從一項重複工作開始。','Start with one repetitive task.'))}</h2><p class="dialog-lead">${text(pair('留下您的稱呼及需求，確認草稿後與我們聯絡。','Add your name and requirements, then review your message before contacting us.'))}</p><div class="brief-fields"><label>${text(pair('您的稱呼','Your name'))}<input data-brief="name" autocomplete="name" maxlength="80" value="${esc(draft.name)}" placeholder="${text(pair('如何稱呼您？','How should we address you?'))}"></label><label>${text(pair('希望改善的工作','What would you like to improve?'))}<textarea data-brief="message" maxlength="1200" rows="5" placeholder="${text(pair('例如：整合客戶查詢、報價及後續跟進。','For example: connecting enquiries, quotes and follow-ups.'))}">${esc(draft.message||draft.workflow)}</textarea></label></div><div class="draft-preview" data-draft-preview></div><div class="draft-actions"><a class="pill dark" data-contact-send href="https://wa.me/85263111207" target="_blank" rel="noopener noreferrer">${text(pair('透過 WhatsApp 聯絡','Contact on WhatsApp'))} <span aria-hidden="true">↗</span></a><button class="pill light" data-copy-draft>${text(pair('複製草稿','Copy draft'))}</button><p class="copy-status" data-copy-status aria-live="polite"></p></div><p class="small-note" style="margin-top:18px">${text(pair('將開啟 WhatsApp 並帶入草稿，請確認內容後自行傳送。此網站不會儲存或自動提交您的諮詢資料。如需電郵聯絡：','Opens WhatsApp with your draft. Review and send it yourself. This website does not store or automatically submit your enquiry. Prefer email?'))} <a href="mailto:info@flow2.xyz">info@flow2.xyz</a></p>`;
    updateDraft();
  }
}
function updateDraft(){
  const message=draft.message||draft.workflow||text(pair('希望了解適合業務的自動化方案。','I would like to discuss automation for my business.'));
  const value=lang==='zh'?`您好 Flow2，我是${draft.name||'＿＿'}。\n\n${message}`:`Hi Flow2, I’m ${draft.name||'___'}.\n\n${message}`;
  const send=$('[data-contact-send]');
  if(send)send.href='https://wa.me/85263111207?text='+encodeURIComponent(value);
  const el=$('[data-draft-preview]');if(el)el.textContent=value;
  const status=$('[data-copy-status]');if(status)status.textContent='';
}
dialog.addEventListener('close',()=>{modal=null;if(lastDialogTrigger?.isConnected)lastDialogTrigger.focus();});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
document.addEventListener('input',e=>{if(e.target.matches('[data-brief]')){draft[e.target.dataset.brief]=e.target.value;updateDraft();}});
document.addEventListener('click',async e=>{
  const b=e.target.closest('button,a');if(!b)return;
  if(b.matches('[data-language]')){lang=lang==='zh'?'en':'zh';renderAll();if(dialog.open)renderDialog();}
  else if(b.matches('[data-pause]')){paused=!paused;paintPause();demos.forEach(d=>d.last=performance.now());}
  else if(b.matches('[data-menu]')){const on=$('#main-nav').classList.toggle('is-open');b.setAttribute('aria-expanded',on);paintCopy();}
  else if(b.matches('#main-nav a')){closeMenu();}
  else if(b.matches('[data-scenario]')){invoiceStory?.destroy();invoiceStory=null;hero.scenario=+b.dataset.scenario;hero.step=reduce.matches?3:0;hero.approved=false;renderHero();const d=demos.get('hero');d.step=hero.step;d.running=!reduce.matches&&!invoiceStory;d.last=performance.now();syncDemo(d);syncHero(true);$(`[data-scenario="${hero.scenario}"]`).focus();}
  else if(b.matches('[data-hero-step]')){hero.step=+b.dataset.heroStep;hero.approved=false;const d=demos.get('hero');d.step=hero.step;d.running=false;syncDemo(d);syncHero(true);}
  else if(b.matches('[data-approve]')){hero.approved=true;demos.get('hero').running=false;syncHero(true);}
  else if(b.matches('[data-replay]')){replay(b.dataset.replay);}
  else if(b.matches('[data-filter]')){activeFilter=b.dataset.filter;renderCases();$(`[data-filter="${activeFilter}"]`).focus();}
  else if(b.matches('[data-method]')){methodIndex=+b.dataset.method;renderMethod();$(`[data-method="${methodIndex}"]`).focus();}
  else if(b.matches('[data-case]')){openDialog('case',b.dataset.case,b);}
  else if(b.matches('[data-detail-step]')){modalStep=+b.dataset.detailStep;renderDialog();$(`[data-detail-step="${modalStep}"]`).focus();}
  else if(b.matches('[data-plan]')){draft.workflow=text(plans[+b.dataset.plan].name);openDialog('contact',null,b);}
  else if(b.matches('[data-contact]')){openDialog('contact',null,b);}
  else if(b.matches('[data-close]')){dialog.close();}
  else if(b.matches('[data-copy-draft]')){
    try{await navigator.clipboard.writeText($('[data-draft-preview]').textContent);$('[data-copy-status]').textContent=text(pair('已複製，未傳送任何資料。','Copied. Nothing has been sent.'));}
    catch{$('[data-copy-status]').textContent=text(pair('未能複製，請自行選取上面草稿。','Copy unavailable. Please select the draft above.'));}
  }
});
function closeMenu(){const on=$('#main-nav').classList.contains('is-open');$('#main-nav').classList.remove('is-open');$('[data-menu]').setAttribute('aria-expanded','false');if(on)paintCopy();}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dialog.open&&$('#main-nav').classList.contains('is-open')){closeMenu();$('[data-menu]').focus();}});
function renderAll(){paintCopy();renderHero();renderServices();renderCases();renderPricing();renderFaq();bindDemos();}
if(reduce.matches)hero.step=3;
renderAll();

// Restore an entry anchor after JS sections and local fonts settle, never after the visitor starts interacting.
const entryAnchor=location.hash;let entryInteracted=false;
if(entryAnchor){
  const markEntryInteraction=()=>{entryInteracted=true;};
  for(const type of ['pointerdown','keydown','wheel'])window.addEventListener(type,markEntryInteraction,{capture:true,passive:true,once:true});
  const alignEntry=()=>document.fonts.ready.then(()=>{
    if(!entryInteracted&&location.hash===entryAnchor){try{document.getElementById(decodeURIComponent(entryAnchor.slice(1)))?.scrollIntoView({block:'start',behavior:'instant'});}catch{}}
    for(const type of ['pointerdown','keydown','wheel'])window.removeEventListener(type,markEntryInteraction,true);
  });
  if(document.readyState==='complete')alignEntry();else window.addEventListener('load',alignEntry,{once:true});
}
