# Flow2 redesign release — 2026-10-31

Approved website: `https://flow2.xyz/`.

## Runtime source

The reviewed static website is in `site/`. Vercel runs
`node scripts/verify-release.cjs` and publishes **only** `site/`.
Legacy root HTML/assets remain in Git history/source, not the output directory.
Do not run the legacy partial generator over this redesign.

The local authoring copy is `rebrand-preview/` in the owner's Flow2 workspace.
`scripts/prepare-production.py` there copies the approved files, removes internal
proposal chrome, and adds public metadata without changing the working demo data.

## Approved final changes

- Icon-only, labelled 44 × 44 px calendar toggle; compact/month views retained.
- Removed the redundant booking label from the User App's header only.
- Removed the studio/process explanation section and its footer anchor.
- Free assessment and custom project quotes retained.
- Public homepage indexed; interactive demo page remains noindex.
- Contact opens a user-reviewed email to the existing public `info@flow2.xyz`.
  A real WhatsApp number has not yet been supplied; no placeholder number is used.
- Existing Hermes overview, privacy/terms, tissue-workshop privacy and `ads.txt`
  are preserved byte-for-byte.

## Demo boundaries

The four systems store example operations only in the visitor's browser. There
are no real payments, messages, outreach deliveries, authentication permissions,
booking service connections or runtime LLM calls. Restaurant answers come from
the attributed FEHD/OpenStreetMap snapshot, with unknown facts left unknown.
The public impact calculator is explicitly a worked estimate, not client results.

## Verification

148 local functional checks, 8 release checks, 24 animation combinations / 336
tracks, 8 prototype HTML reference checks. The release was also checked in the
browser for the calendar icon, header, bilingual pricing, retired section and
contact draft URL. No real message was sent during verification.

## Rollback baseline

- Previous source: `260a76a522fdff986758ab357849d5ea2c294a19`
- Previous production deployment: `dpl_6d7Xk6RXrwEnQmNKrkZqUMoqVoGL`
- Previous deployment URL:
  `zoomicc-website-2olabqewj-s92225s-projects.vercel.app`

Rollback is an explicit release operation, not part of the static build.
