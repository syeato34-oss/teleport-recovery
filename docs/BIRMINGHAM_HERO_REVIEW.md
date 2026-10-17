# Birmingham hero — local review

17 October 2026. The completed launch audit and its uncommitted corrections were read and preserved. This pass changes the reusable location hero only. No commit, push, deployment, advertising change or provider-setting change was made.

## A. Hero changes and design reasoning

The city identifier is substantially larger, followed by the smaller service label. One H1 combines a strong white question with a lavender-highlighted recovery action. The shorter paragraph leads directly to the dominant numbered call button and understated WhatsApp action. Three compact circular tick icons replace the sentence-style trust line.

The existing recovery image, midnight-purple palette, Inter typography and shared contact components are retained. Location-only gradients improve reading contrast and retain the recovery scene on desktop. Buttons stack on phones and sit together on larger screens. Short-phone spacing keeps the primary call above the unchanged consent notice. Check icons have one short staggered entrance; text and contacts remain visible immediately. Reduced motion disables that entrance. No animation dependency was added.

The layout remains configuration-driven for future cities. No additional city page was published. Lower Birmingham sections, callbacks, coverage expansion, guarantee, FAQs, footer and SEO metadata remain unchanged.

## B. Exact visible copy

- Location: **BIRMINGHAM**
- Service label: **VEHICLE & BREAKDOWN RECOVERY**
- H1: **Broken Down in Birmingham? Get Recovery Now.** The second sentence is highlighted and starts a new visual line.
- Paragraph: **Need vehicle recovery? Call for a quote and estimated arrival time. We'll confirm availability and the price before booking.**
- Primary: **Call Now — 01234 900 700**, using the shared dynamic number rather than a hardcoded display.
- Secondary: **WhatsApp for a Quote**, with the unchanged Birmingham draft and public customer destination.
- Reassurance: **No membership required**, **Price before booking**, **Independent recovery operators**.
- Optional ETA visual: **30 MIN ETA*** with **\*Subject to availability**. **Hidden in the actual page configuration.**

The ETA is configured in [locations.ts](<C:/Users/syeat/Documents/Veridian devlopment/project/src/config/locations.ts>) with `enabled: false`, `minutes: 30`, `operationalEvidenceConfirmed: false` and `qualification: 'Subject to availability'`. Both enablement and operational confirmation must be true before rendering; missing/invalid estimates or blank qualifications stay hidden. The confirmation flag is an owner attestation, not supporting evidence itself. Do not enable it until an operationally supportable basis has been supplied and approved. A qualification alone does not substantiate a typical 30-minute arrival.

## C. Files changed by this hero pass

| File | Purpose |
|---|---|
| [src/pages/LocationPage.tsx](<C:/Users/syeat/Documents/Veridian devlopment/project/src/pages/LocationPage.tsx>) | Reusable hero composition, highlighted H1, shared dynamic call label, tick row and optional clock element; final CTA and lower rendered content preserved |
| [src/config/locations.ts](<C:/Users/syeat/Documents/Veridian devlopment/project/src/config/locations.ts>) | Requested hero copy, optional highlight, central ETA settings and evidence gate; original metadata/WhatsApp/lower content retained |
| [src/index.css](<C:/Users/syeat/Documents/Veridian devlopment/project/src/index.css>) | Location-hero-scoped responsive styling, motion and forced-colour support |
| [scripts/location-browser-qa.mjs](<C:/Users/syeat/Documents/Veridian devlopment/project/scripts/location-browser-qa.mjs>) | Normalise H1 whitespace when comparing the new multiline heading; all existing routing/contact/baseline assertions retained |
| [scripts/hero-browser-qa.mjs](<C:/Users/syeat/Documents/Veridian devlopment/project/scripts/hero-browser-qa.mjs>) | New responsive, forwarding, preservation, enlarged-text, motion and isolated ETA visual tests |
| [tests/location-hero.test.mjs](<C:/Users/syeat/Documents/Veridian devlopment/project/tests/location-hero.test.mjs>) | Three new unit tests for copy and optional ETA controls |
| [docs/BIRMINGHAM_HERO_REVIEW.md](<C:/Users/syeat/Documents/Veridian devlopment/project/docs/BIRMINGHAM_HERO_REVIEW.md>) | This review handoff |

Other modified/untracked files shown by Git were already present from the audit. They were not reverted, replaced or included as new hero work.

## D. Audit protection

The hero continues to use the existing `CallLink` and `PhoneNumber`. Their implementation, `usePhoneNumber`, shared number store and consent-gated Google callback are unchanged. In ordinary state, display is 01234 900 700 and destination is `tel:+441234900700`. The reserved fictional callback fixture updates the hero's displayed number and href together, as well as sticky-bar href and number-bearing accessible labels. The original audit's all-page tests also pass through invalid callbacks, withdrawal, conditional callback mounts and React/navigation changes.

SHA-256 comparisons confirm **15 protected files remain byte-identical**, including the launch report, phone synchronisation, tracking/consent, sticky bar, homepage hero, WhatsApp component, App, Vite and Netlify/Edge configuration. Before-state hashes are in [protected-before.json](<C:/Users/syeat/Documents/Veridian devlopment/project/qa-artifacts/hero/protected-before.json>).

Homepage screenshots at 390px and 1440px match the before images byte-for-byte. Its DOM and metadata match too. Lower Birmingham section DOM and page title/description/canonical also match their before snapshots at both widths.

## E. Mobile and visual QA

Rendered and inspected the actual production build at 320, 375, 390, 430, 768 and 1440 pixels, plus a short **375×667** screen. All have no horizontal overflow or clipped phone labels. Main call and sticky contacts work in ordinary and simulated-forwarding states. The fresh notice does not cover the primary call; on short screens the sticky WhatsApp remains available while lower hero content is behind the unchanged notice.

Reviewed screenshots:

- [390px, fresh visitor](<C:/Users/syeat/Documents/Veridian devlopment/project/qa-artifacts/hero/hero-390x844-fresh.png>)
- [430px, advertising rejected](<C:/Users/syeat/Documents/Veridian devlopment/project/qa-artifacts/hero/hero-430x932-rejected.png>)
- [375×667, fresh visitor](<C:/Users/syeat/Documents/Veridian devlopment/project/qa-artifacts/hero/hero-375x667-fresh.png>)
- [Desktop, fresh visitor](<C:/Users/syeat/Documents/Veridian devlopment/project/qa-artifacts/hero/hero-1440x900-fresh.png>)
- [Optional ETA visual — isolated test preview only](<C:/Users/syeat/Documents/Veridian devlopment/project/qa-artifacts/hero/eta-preview-only.png>)

## F. Test results

**All 38 previously passing launch unit tests still pass. All three newly added unit tests pass: 41/41 total.** None of the original unit assertions was removed or weakened.

| Check | Result |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm test` | PASS — 41/41, zero skipped |
| `npm run build` | PASS |
| `npm run qa:browser` | PASS — original homepage/legal/contact/GPS/mobile regressions |
| `node scripts/location-browser-qa.mjs` | PASS — five historical homepage comparisons, 14 routes, query-preserving GET/HEAD redirects, refresh/back/forward, coverage/FAQ keyboard/touch, enlarged text/reflow |
| `node scripts/launch-browser-qa.mjs` | PASS — existing all-page phone/callback/forwarding/navigation audit regressions |
| `node scripts/consent-browser-qa.mjs` | PASS — real Google scripts under existing local CSP, fresh/Reject/Accept/persist/withdraw on both pages, no duplicate tags or invented conversions |
| `node scripts/hero-browser-qa.mjs` | PASS — seven viewport cases in ordinary/forwarded states, 200% text/focus, reduced/full motion, identical homepage pixels/lower sections, ETA duration/change/disable fixture and protected hashes |
| `git diff --check` | PASS |

Local browser runs report zero application/console/CSP errors. Detailed new visual evidence is in [hero verification.json](<C:/Users/syeat/Documents/Veridian devlopment/project/qa-artifacts/hero/verification.json>). Existing audit/browser evidence remains in its respective QA directories. No real paid Ads visit, connected phone call, WhatsApp send or callback receipt is claimed by these automated checks.

## G. Remaining issues

The 30-minute label remains disabled pending operational evidence and owner approval. The previously identified **live Netlify-injected badge CSP issue remains separate**, documented in the preserved [launch audit](<C:/Users/syeat/Documents/Veridian devlopment/project/docs/LAUNCH_AUDIT_2026-10-17.md>). This pass neither weakens CSP nor changes provider settings. Existing live deployment, real-device/call attribution and owner/legal acceptance items in that audit remain outstanding; the hero redesign does not clear them.

## H. Preview and approval

Open [Birmingham local preview](http://127.0.0.1:4173/recovery/birmingham). The local production QA server is running on port 4173. To restart later, run `npm run build` then `npm run qa:serve` from the project directory. It intentionally does not submit to Netlify Forms.

Review the hero visually before authorising publication. The optional ETA screenshot is a test fixture, not the default page or approval to publish an unsupported claim. All work remains local and uncommitted.
