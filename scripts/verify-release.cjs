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
 for(const [name,html] of [['index.html',home],['demos.html',demos]]){
  for(const [,ref] of html.matchAll(/(?:src|href)="([^"?#]+)(?:[?#][^"]*)?"/g)){
   if(/^(?:https?:|mailto:|data:)/.test(ref))continue;
   assert(fs.existsSync(path.join(root,ref)),name+' '+ref);
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
check('Contact uses a verified address instead of a fake WhatsApp number',()=>{
 const js=fs.readFileSync(path.join(root,'assets/simple.js'),'utf8');assert(js.includes('mailto:info@flow2.xyz?subject='));assert(!js.includes('85200000000'));
});
console.log(JSON.stringify({passed:checks,failed:0}));

