'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../site'),hashes=require('./preserved-public-hashes.json'),crypto=require('node:crypto');
const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
const demos=fs.readFileSync(path.join(root,'demos.html'),'utf8');
let checks=0;
function check(name,run){run();checks++;console.log('PASS '+name);}
check('Public homepage is indexable with the correct canonical domain',()=>{assert(home.includes('content="index,follow"'));assert(home.includes('rel="canonical" href="https://flow2.xyz/"'));});
check('No internal proposal UI or retired studio section is published',()=>{for(const x of ['prototype-bar','footer-preview','id="studio"','href="#studio"','strategy.html','verification.html'])assert(!home.includes(x),x);});
check('Every local HTML stylesheet, script, image and public source link resolves',()=>{
 const all=fs.readdirSync(root,{recursive:true}).filter(f=>f.endsWith('.html'));
 for(const name of all){
  const html=fs.readFileSync(path.join(root,name),'utf8');
  for(const [,ref] of html.matchAll(/(?:src|href)="([^"]+)"/g)){
   const url=new URL(ref,'https://flow2.xyz/'+name.replaceAll('\\','/'));
   if(url.origin!=='https://flow2.xyz')continue;
   const file=path.join(root,decodeURIComponent(url.pathname).replace(/^\/+/,''));
   const target=[file,file+'.html',path.join(file,'index.html')].find(p=>fs.existsSync(p)&&fs.statSync(p).isFile());
   assert(target,name+' '+ref);
   if(url.hash&&target.endsWith('.html'))assert(fs.readFileSync(target,'utf8').includes('id="'+decodeURIComponent(url.hash.slice(1))+'"'),name+' '+ref);
  }
 }
});
check('Demo interfaces remain explicitly noindex and have a working home link',()=>{assert(demos.includes('content="noindex,nofollow"'));assert(demos.includes('href="/#services"'));});
check('Existing Hermes legal pages and AdSense verification file are preserved byte-for-byte',()=>{
 for(const f of ['hermes/index.html','hermes/privacy.html','hermes/terms.html','ads.txt','tissue-workshop-privacy.html'])
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex'),hashes[f],f);
});
check('Source-backed restaurant downloads and photo/logo licences are present',()=>{for(const f of ['data/dining/fehd-records.json','data/dining/osm-enrichment.json','data/dining/catalogue.json','assets/yoga-photos/provenance.json','assets/integration-logos/sources.json'])assert(fs.existsSync(path.join(root,f)),f);});
check('Calendar control is icon-only, labelled and sized for touch',()=>{
 const js=fs.readFileSync(path.join(root,'assets/yoga-studio-view.js'),'utf8'),css=fs.readFileSync(path.join(root,'assets/yoga-calendar.css'),'utf8');
 assert(js.includes("button(icon('calendar'),"));assert(js.includes('data-st-calendar-toggle aria-label'));
 assert(css.includes('.st-calendar-icon{width:44px;height:44px'));
 assert(!js.includes("<span>${role==='user'?'預約課堂'"));
});
check('Contact uses the owner-confirmed WhatsApp number with an email fallback',()=>{
 const js=fs.readFileSync(path.join(root,'assets/simple.js'),'utf8');assert(js.includes('https://wa.me/85263111207?text='));assert(js.includes('mailto:info@flow2.xyz'));assert(!js.includes('85200000000'));
});
check('Showcase has four descriptive actions, one link per card and visible filled CTAs',()=>{
 assert(home.includes('data-copy="services.title">Showcase</h2>'));
 const sandbox={window:{},IntersectionObserver:class{observe(){} disconnect(){}}};
 require('node:vm').runInNewContext(fs.readFileSync(path.join(root,'assets/demo-cards.js'),'utf8'),sandbox);
 const container={innerHTML:'',querySelectorAll(){return []}};
 sandbox.window.FlowDemoCards.render(container,'zh');
 assert.equal((container.innerHTML.match(/<a /g)||[]).length,4);
 for(const label of ['試用排班系統','試用瑜伽預約','開啟餐廳助手','試用外展工作台'])assert(container.innerHTML.includes(label));
 assert(fs.readFileSync(path.join(root,'assets/demo-cards.css'),'utf8').includes('min-height:48px'));
});
check('Original guides, business information and privacy pages are public, canonical and linked',()=>{
 const pages=['guides.html','about.html','contact.html','privacy.html',...['whatsapp-roster','yoga-booking','restaurant-knowledge-base','outreach-attribution'].map(s=>'guides/'+s+'.html')];
 for(const file of pages){const html=fs.readFileSync(path.join(root,file),'utf8');assert.equal((html.match(/<h1>/g)||[]).length,1,file);assert(html.includes('content="index,follow"'),file);assert(html.includes('rel="canonical"'),file);assert(html.includes('name="google-adsense-account" content="ca-pub-8769011123659282"'),file);assert(!/<script[^>]+src=/i.test(html),file);}
 for(const link of ['/guides','/about','/contact','/privacy'])assert(home.includes('href="'+link+'"'));
});
check('Homepage publishes the same cards, prices and FAQs before JavaScript enhancement',()=>{
 assert.equal((home.match(/class="demo-launch"/g)||[]).length,4);
 assert.equal((home.match(/class="price-card /g)||[]).length,3);
 assert(home.includes('<div id="faq-list"><details>'));
 assert(home.includes('name="google-adsense-account" content="ca-pub-8769011123659282"'));
});
check('No live advertising or analytics runtime is silently introduced',()=>{
 for(const name of fs.readdirSync(root,{recursive:true}).filter(f=>f.endsWith('.html'))){const html=fs.readFileSync(path.join(root,name),'utf8');assert(!/<script[^>]+src=["'][^"']*(googlesyndication|googletagmanager|google-analytics)/i.test(html),name);}
 const policy=fs.readFileSync(path.join(root,'privacy.html'),'utf8');assert(policy.includes('flow2-interactive-lab-v2'));assert(policy.includes('未載入 AdSense 廣告腳本'));
});
console.log(JSON.stringify({passed:checks,failed:0}));

