# Flow2 redesign release — 2026-10-31

Approved website: `https://flow2.xyz/`.

## Runtime source

The reviewed static website is in `site/`. Vercel runs
`node scripts/verify-release.cjs` and publishes **only** `site/`.
After regenerating public pages, run `node scripts/seo-metadata.cjs` to restore
the canonical public-page OG/Twitter cards. The release check verifies them.
Social artwork is application-owned static SVG/PNG under `site/assets/social/`.
SEO changes do not enable ads or resume the paused AdSense plan.
The public homepage also retains an owner-authorized Google Search Console
verification meta tag. Preserve it after regeneration; it is not an Analytics
or advertising script and does not send visitor events.
After rebuilding guide content, run `node scripts/seo-guide-links.cjs` before
`node scripts/seo-metadata.cjs`; the release check verifies both outputs.
Legacy root HTML/assets remain in Git history/source, not the output directory.
Do not run the legacy partial generator over this redesign.

The local authoring copy is `rebrand-preview/` in the owner's Flow2 workspace.
`scripts/prepare-production.py` there copies the approved files, removes internal
proposal chrome, and adds public metadata without changing the working demo data.

## Approved final changes

- Showcase section and navigation use the same name in both languages.
- Each showcase has a filled, full-width, descriptive 48 px CTA; its illustration
  and action share one semantic link instead of duplicate keyboard stops.
- Icon-only, labelled 44 × 44 px calendar toggle; compact/month views retained.
- Removed the redundant booking label from the User App's header only.
- Removed the studio/process explanation section and its footer anchor.
- Free assessment and custom project quotes retained.
- Public homepage indexed; interactive demo page remains noindex.
- Contact opens a user-reviewed WhatsApp draft to the owner-confirmed
  `+852 6311 1207`, with the existing public `info@flow2.xyz` as email fallback.
- Existing Hermes overview, privacy/terms, tissue-workshop privacy and `ads.txt`
  are preserved byte-for-byte.

## Demo boundaries

The four systems store example operations only in the visitor's browser. There
are no real payments, messages, outreach deliveries, authentication permissions,
booking service connections or runtime LLM calls. Restaurant answers come from
the attributed FEHD/OpenStreetMap snapshot, with unknown facts left unknown.
The public impact calculator is explicitly a worked estimate, not client results.

## Verification

160 local functional checks, 12 release checks, 24 animation combinations / 336
tracks, 8 prototype HTML reference checks. The release was also checked in the
browser for the calendar icon, header, bilingual pricing, retired section and
contact draft URL. No real message was sent during verification.

## Rollback baseline

- Previous source: `260a76a522fdff986758ab357849d5ea2c294a19`
- Previous production deployment: `dpl_6d7Xk6RXrwEnQmNKrkZqUMoqVoGL`
- Previous deployment URL:
  `zoomicc-website-2olabqewj-s92225s-projects.vercel.app`

Rollback is an explicit release operation, not part of the static build.

## Content/readiness update — 2026-10-31

The owner requested remediation after an AdSense email. The account's Sites view
identified **low-value content**; ads.txt was already authorized. This is not
represented as an ads.txt-only problem, and content updates do not guarantee
AdSense approval.

- Added four original, implementation-grounded system guides, a guide directory,
  About, Contact and a website-specific Privacy page. No invented customer cases,
  author credentials, traffic or outcomes were added.
- Kept the approved minimal homepage, adding only a guide entry and information
  links. Existing cards, prices and FAQs are also prerendered in initial HTML,
  with the same visible content enhanced by the existing browser scripts.
- Added the matching publisher verification meta tag without loading advertising
  JavaScript. No automatic ads, analytics, consent claims or payment settings
  were enabled.
- Expanded the sitemap to the nine canonical public content URLs. The interactive
  app remains noindex and explicitly a browser-local demonstration.
- Existing Hermes/tissue privacy pages and ads.txt remain byte-identical to their
  preserved source hashes. Private email/account evidence is not published.

The new authored content and local build helpers live in the owner's existing
`rebrand-preview/content/` and `rebrand-preview/scripts/` workspace. All generated
HTML and CSS needed to serve the site are committed under `site/`.
