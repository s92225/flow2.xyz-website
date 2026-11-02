'use strict';
// Small, deterministic navigation improvement. No generated claims or new services.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../site');
const guides={
 'whatsapp-roster':{name:'零售排班',title:'用可用時間建立零售門市更表',related:['yoga-booking','restaurant-knowledge-base']},
 'yoga-booking':{name:'瑜伽預約',title:'課堂預約、名額與候補點樣同步',related:['whatsapp-roster','outreach-attribution']},
 'restaurant-knowledge-base':{name:'餐廳知識庫',title:'知識庫點樣保留答案來源同限制',related:['outreach-attribution','whatsapp-roster']},
 'outreach-attribution':{name:'外展與歸因',title:'外展研究、草稿覆核同預約來源',related:['restaurant-knowledge-base','yoga-booking']},
};
for(const [slug,guide] of Object.entries(guides)){
 const file=path.join(root,'guides',slug+'.html');let html=fs.readFileSync(file,'utf8');
 html=html.replace(/<!-- SEO BREADCRUMB START -->[\s\S]*?<!-- SEO BREADCRUMB END -->\s*/g,'').replace(/<!-- SEO RELATED START -->[\s\S]*?<!-- SEO RELATED END -->\s*/g,'');
 // The original editorial template already has a visual breadcrumb. Replace
 // that trail rather than publishing a second navigation above it.
 html=html.replace(/<nav[^>]+aria-label="麵包屑"[^>]*>[\s\S]*?<\/nav>/,'');
 html=html.replace(/\s*<script id="flow2-breadcrumb-data"[^>]*>[\s\S]*?<\/script>/,'');
 const url='https://flow2.xyz/guides/'+slug;
 const schema={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[
  {'@type':'ListItem',position:1,name:'首頁',item:'https://flow2.xyz/'},
  {'@type':'ListItem',position:2,name:'指南',item:'https://flow2.xyz/guides'},
  {'@type':'ListItem',position:3,name:guide.name,item:url},
 ]};
 const crumb=`<!-- SEO BREADCRUMB START --><nav class="editorial-breadcrumb" aria-label="麵包屑導航"><a href="/">首頁</a><span aria-hidden="true"> / </span><a href="/guides">指南</a><span aria-hidden="true"> / </span><span aria-current="page">${guide.name}</span></nav><!-- SEO BREADCRUMB END -->`;
 const related=`<!-- SEO RELATED START --><section class="editorial-related" aria-labelledby="related-guides"><h2 id="related-guides">繼續了解相關流程</h2><ul>${guide.related.map(id=>`<li><a href="/guides/${id}">${guides[id].title} ↗</a></li>`).join('')}</ul></section><!-- SEO RELATED END -->`;
 assert(html.includes('<main class="editorial-main" id="main">'));assert(html.includes('</article></div></main>'));
 html=html.replace('<main class="editorial-main" id="main">','<main class="editorial-main" id="main">'+crumb).replace('</article></div></main>',related+'</article></div></main>');
 html=html.replace('</head>','\n<script id="flow2-breadcrumb-data" type="application/ld+json">'+JSON.stringify(schema)+'</script>\n</head>');
 if(process.argv.includes('--check')){
  const current=fs.readFileSync(file,'utf8');
  const actual=JSON.parse(current.match(/<script id="flow2-breadcrumb-data"[^>]*>([\s\S]*?)<\/script>/)?.[1]||'null');
  assert.deepEqual(actual,schema,slug);assert(current.includes(crumb),slug);assert(current.includes(related),slug);
  assert.equal((current.match(/aria-label="麵包屑(?:導航)?"/g)||[]).length,1,'One breadcrumb trail only: '+slug);
 }else fs.writeFileSync(file,html);
}
console.log('PASS: 4 guides have visible breadcrumbs, matching BreadcrumbList and descriptive related links.');
