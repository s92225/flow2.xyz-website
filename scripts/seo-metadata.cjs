'use strict';
// Regenerate only sharing metadata for canonical public editorial pages.
// Deliberately excludes demos, Hermes and the preserved product policies.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../site');
const image = 'https://flow2.xyz/assets/social/flow2-v1.png';
const alt = 'Flow2 — Less admin. More flow. Hong Kong AI automation and custom business systems.';
const escape = s => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const pages = ['index.html', 'guides.html', 'about.html', 'contact.html', 'privacy.html', ...['whatsapp-roster', 'yoga-booking', 'restaurant-knowledge-base', 'outreach-attribution'].map(s => `guides/${s}.html`)];
for (const page of pages) {
  const file = path.join(root, page);
  let html = fs.readFileSync(file, 'utf8');
  if (page === 'index.html') html = html.replace(/<title>[^<]*<\/title>/, '<title>Flow2 — 香港 AI 自動化與客製化業務系統</title>');
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  assert(title && description && canonical, `Missing public SEO metadata: ${page}`);
  html = html.replace(/\s*<meta\s+(?:property|name)="(?:og:|twitter:)[^"]+"[^>]*>/g, '');
  const tags = {
    'og:type': page.startsWith('guides/') ? 'article' : 'website',
    'og:locale': 'zh_HK', 'og:site_name': 'Flow2', 'og:url': canonical,
    'og:title': title, 'og:description': description,
    'og:image': image, 'og:image:secure_url': image, 'og:image:type': 'image/png',
    'og:image:width': '1200', 'og:image:height': '630', 'og:image:alt': alt,
    'twitter:card': 'summary_large_image', 'twitter:title': title,
    'twitter:description': description, 'twitter:image': image, 'twitter:image:alt': alt,
  };
  html = html.replace(/\s*<\/head>/, '\n'+Object.entries(tags).map(([key, value]) => `  <meta ${key.startsWith('og:') ? 'property' : 'name'}="${key}" content="${escape(value)}">`).join('\n')+'\n</head>');
  if (process.argv.includes('--check')) assert(fs.readFileSync(file, 'utf8').replace(/\r\n/g,'\n') === html.replace(/\r\n/g,'\n'), `Stale social metadata: ${page}`);
  else fs.writeFileSync(file, html);
}
const png = fs.readFileSync(path.join(root, 'assets/social/flow2-v1.png'));
assert.equal(png.readUInt32BE(16), 1200); assert.equal(png.readUInt32BE(20), 630);
console.log(`PASS: ${pages.length} canonical public pages have complete, consistent SEO/social metadata.`);
