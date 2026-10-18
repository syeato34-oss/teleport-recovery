# Teleport Recovery V4 — local implementation review

18 October 2026. Branch: `codex/teleport-v4`. Starting worktree was clean, at `5dd30b8` (`Finalize Birmingham hero with 30 minute ETA`). **No commit, push, deployment, advertising change, telephone-provider change or external form submission was performed.** No packages were added or upgraded.

This is a local engineering review, not legal certification, a telecom acceptance test or a guarantee of indexing/ranking. The existing [launch audit](LAUNCH_AUDIT_2026-10-17.md) remains unchanged and its operational acceptance gates still apply.

## A. Before versus after

| Before | V4 local result |
|---|---|
| Homepage hero combined speed, 24/7, guarantee and a numerical average ETA | One emergency proposition, a primary call and clearly branded optional location sharing |
| Pickup sharing existed in one homepage section | Shared location action in hero, pickup section, final CTA, directories, services and city pages |
| Homepage, Birmingham and three legal pages | 39 canonical pages, plus a genuine not-found page |
| Birmingham was the only authored city page | 12 authored city pages and a separate 133-area enquiry registry |
| Recovery areas navigated to a homepage section | Searchable `/areas`, 11 regional directories and useful city links |
| Services were homepage cards | Eight distinct service pages, a service hub and two selective city-service pages |
| Direct page HTML had metadata but React supplied most visible content | Actual build-time HTML with headings, content, links and fallback telephone CTAs, hydrated by React |
| Birmingham-specific slash handler | Known-page/alias canonical handler, preserving the original Birmingham route and complete query strings |

Premium purple styling, existing photographs, shared header/footer, callback contract, legal content and customer contact configuration remain. The V4 brief explicitly authorises the homepage change; it is not reported as visually unchanged.

## B. Hero and visual review

Exact homepage copy:

- Eyebrow: **NEED HELP NOW?**
- H1: **24/7 Vehicle Recovery Across the UK.**
- Supporting text: **Broken down or stranded? Call for a clear quote and realistic arrival estimate. Or send your pickup location through WhatsApp.**
- Primary: **Call Now — 01234 900 700**, using shared telephone-number synchronisation.
- Secondary: **Send Us Your Location**, with the WhatsApp mark and **Via WhatsApp**.
- Trust: **No membership needed · Price before booking · Independent recovery operators**.

The short adjacent location disclosure explains optional permission, passing the pickup link to WhatsApp when opening a draft, manual review/sending and the privacy link. The icon is the Simple Icons WhatsApp SVG, CC0; no icon package was installed. [Upstream mark](https://github.com/simple-icons/simple-icons/blob/develop/icons/whatsapp.svg), [licence](https://github.com/simple-icons/simple-icons/blob/develop/LICENSE.md).

Screenshots are local, under `qa-artifacts/` (ignored by Git):

| Evidence | File |
|---|---|
| Historical approved homepage, 17 October | `qa-artifacts/hero/before-home-390.png` |
| V4 homepage with fresh consent notice | `qa-artifacts/v4/final-home-390.png` |
| V4 homepage after rejecting advertising | `qa-artifacts/v4/review-home-390.png` |
| Desktop homepage | `qa-artifacts/v4/final-home-1440.png` |
| Directory, full mobile page | `qa-artifacts/v4/review-areas-390-full.png` |
| Milton Keynes, full mobile page | `qa-artifacts/v4/review-areas-milton-keynes-390-full.png` |
| Birmingham, full mobile page | `qa-artifacts/v4/review-recovery-birmingham-390-full.png` |
| Motorway service, full mobile page | `qa-artifacts/v4/review-services-motorway-recovery-390-full.png` |

![V4 mobile homepage after rejecting advertising](<C:/Users/syeat/Documents/Veridian devlopment/project/qa-artifacts/v4/review-home-390.png>)

Fresh layouts include 320, 375, 390, 430, 768 and 1440px. Representative pages also have 200% text screenshots. Birmingham retains its approved heading, both original contact buttons, two symmetrical check items, animations/reduced-motion support and centrally configurable enabled 30-minute ETA. Its new breadcrumbs are below the hero, preserving urgent-contact space. New city pages use location sharing directly as their secondary hero action. Long city-service pickup explanations sit below their concise first-screen summary.

## C. Location sharing

1. The customer explicitly selects **Send Us Your Location**. No background GPS request is made.
2. Existing acquisition requests a fresh high-accuracy position with a 7-second browser timeout and an 8-second hard deadline. Unusable/coarse accuracy falls back rather than presenting an unreliable pin.
3. A usable coordinate pair becomes an encoded Google Maps URL in the WhatsApp draft to **`https://wa.me/447827079669`**. City context names the enquiry city without pretending it establishes the GPS pickup.
4. The draft contains pickup, destination, vehicle, problem and the request for an available option, price and arrival estimate. The customer reviews and sends it manually.
5. Denied, unsupported, unavailable, timed-out, invalid or coarse location results open a manual-location draft with **Pickup location or postcode** and the option to use WhatsApp's own Location feature.

The mature acquisition, duplicate-tap, deadline, late-result, same-tab handoff and page restoration safeguards remain. Generic sticky WhatsApp links retain the existing non-GPS draft; Birmingham's **WhatsApp for a Quote** draft also remains unchanged. Location URLs are passed to WhatsApp on draft opening, even before manual sending; the UI and privacy policy disclose that boundary. No GPS history is persisted or sent in analytics. Existing UI events contain the action source only. No new Google conversion event was introduced.

Physical WhatsApp app/web handoff and actual business receipt still require an owner-approved device test; automated handoffs were intercepted and no message was sent.

## D. Architecture and changed files

Routing remains lightweight pathname-based rendering and ordinary HTML links. There is no new router, SSR service, backend or location platform. Build-time rendering uses the installed React server API and esbuild; client entry hydrates the generated HTML. [React rendering](https://react.dev/reference/react-dom/server/renderToString), [hydration](https://react.dev/reference/react-dom/client/hydrateRoot).

Exact changed/new files and purpose:

| Files | Purpose |
|---|---|
| `src/config/areas.ts` | Typed geographic registry, explicit named region groups, serviceability/maturity/indexing, road mappings, nearby links, source notes, review dates and original city pickup guidance |
| `src/config/recoveryServices.ts` | Eight service topics and two selective local-service content configurations |
| `src/config/locationTemplates.ts` | Reusable city configuration builder with individual local content and primary location-sharing action |
| `src/config/locations.ts` | Preserve Birmingham; incorporate authored registry pages and optional location-action configuration |
| `src/config/routes.ts` | Canonical routes, aliases, breadcrumbs and truthful Organization/WebSite/Service schema |
| `src/config/validateContent.ts` | Build gate for duplicates, unsafe routes, missing content, invalid relationships/classification and unsupported operator categories |
| `src/components/Hero.tsx` | Requested nationwide emergency hero |
| `src/components/WhatsAppIcon.tsx` | Properly sourced WhatsApp mark |
| `src/components/WhatsAppLink.tsx` | Use that mark while retaining destinations, drafts and events |
| `src/components/WhatsAppLocationButton.tsx` | Clear new action label, optional city context and compact/full disclosures; retain acquisition safeguards |
| `src/lib/whatsapp.ts` | New location-draft builder alongside unchanged generic builder/acquisition logic |
| `src/components/RecoveryNavigation.tsx` | Directory discovery, breadcrumbs, nearby/corridor links and shared recovery actions |
| `src/pages/DirectoryPage.tsx` | Regional browsing, accessible search/status and native region expansion |
| `src/pages/ServicePage.tsx` | Shared service hub, service detail and selective city-service rendering |
| `src/pages/LocationPage.tsx` | Reuse existing city layout, add location actions and meaningful related navigation |
| `src/components/Coverage.tsx` | Practical pickup section with optional location access |
| `src/components/ContactSection.tsx` | Final CTA location action; callback logic unchanged |
| `src/components/Services.tsx` | Crawlable links to the service topics |
| `src/components/Trust.tsx` | Include access/vehicle condition in dispatch preparation |
| `src/components/Header.tsx`, `src/components/Footer.tsx` | Link the new hubs and pickup section |
| `src/App.tsx`, `src/main.tsx`, `src/entry-server.tsx` | Route rendering, build entry and hydration |
| `src/index.css` | Scoped homepage/directory/responsive styling; retain existing accessibility rules |
| `src/pages/LegalPage.tsx` | **Only** change the quoted location-action label to match the UI; no legal terms rewritten |
| `vite.config.ts` | Per-route metadata, sitemap and CSP hashes for each trusted JSON-LD block |
| `scripts/prerender.mjs` | Full HTML generation, exact Netlify rewrites, Edge manifest and page inventory |
| `scripts/config-module.mjs`, `scripts/validate-content.mjs` | Dependency-aware TypeScript config loading and runnable content gate |
| `netlify/edge-functions/canonical-pages.js`, `netlify/edge-functions/generated-routes.js` | Query-preserving canonical redirects for known pages/aliases |
| `netlify.toml` | Page-prefix-scoped Edge declaration; build before manifest-dependent tests; retain callback/host/header settings |
| `package.json` | Add content validation and prerendering to the existing build command |
| `scripts/serve-production.mjs` | Replay the same canonical handler in local production QA |
| `tests/locations.test.mjs`, `tests/location-hero.test.mjs` | Retain Birmingham regressions and update the authorised publication contract/config loader |
| `tests/v4.test.mjs`, `tests/fixtures/v4-protected.json` | V4 inventory/geography/draft/schema/redirect regressions and protected audited-source hashes |
| `scripts/v4-browser-qa.mjs`, `scripts/check-preview.mjs` | Full route/link/rendering/mobile checks and preview indexing isolation |
| `scripts/browser-qa.mjs`, `scripts/location-browser-qa.mjs`, `scripts/hero-browser-qa.mjs`, `scripts/consent-browser-qa.mjs` | Update old hero/single-button selectors and publication expectations; retain functional/privacy assertions |
| `docs/DEPLOYMENT.md`, `docs/V4_IMPLEMENTATION_REVIEW.md` | Current deployment instructions and this review |

Unchanged protected code includes `CallLink`, `usePhoneNumber`, the number store, consent engine/interface, tracking helper, callback helper, business configuration and the legacy Birmingham handler. The original launch audit is also hash-protected.

To add another city: register it in the correct named region, author pickup/access guidance and FAQ in `areas.ts`, add verified nearby references/roads/source notes, and pass the validation gate. Merely adding a registry name creates a regional directory entry, **not** an indexed city page. Build generates routes, HTML, metadata, sitemap and Edge manifest; run tests after building. Add a city-service entry only where it supplies distinct customer utility. No Cartesian city/service page matrix exists.

## E. Coverage inventory

| Category | Count / status |
|---|---|
| Registered enquiry areas | **133** |
| Authored city pages in local V4 | **12** |
| Editorially reviewed/indexable city configurations | **12**; operational capacity is not thereby verified |
| Directory-only/draft area entries | **121**; no standalone city URL or sitemap entry |
| Regional hubs | **11** |
| Service detail pages | **8**, plus `/services` hub |
| Selective city-service pages | **2** |
| Canonical pages total | **39**, excluding 404 and callback infrastructure |
| Live city pages added by this task | **0**; the existing Birmingham route is retained. Current production inventory/indexing was not re-audited in this local build. |

All 133 entries are **dispatch-check**. No verified operator anchors, permanent stations, local depots, fleet ownership or immediate coverage capacity were invented. Northern Ireland is not registered; its arrangements require confirmation. Regional groups: London & Greater London; East of England; South East England; South West England; East Midlands; West Midlands; Yorkshire and the Humber; North West England; North East England; Wales; Scotland.

Authored city URLs:

`/recovery/birmingham`, `/areas/milton-keynes`, `/areas/bedford`, `/areas/kempston`, `/areas/northampton`, `/areas/luton`, `/areas/dunstable`, `/areas/cambridge`, `/areas/bristol`, `/areas/manchester`, `/areas/london`, `/areas/cardiff`.

Service URLs under `/services/`: `breakdown-recovery`, `non-runner-recovery`, `vehicle-transport`, `accident-recovery`, `van-recovery`, `motorway-recovery`, `garage-delivery`, `auction-collections`. City-service URLs: `/recovery/milton-keynes/breakdown-recovery`, `/recovery/bedford/non-runner-recovery`.

Roads are individually mapped, not joined by array position. Birmingham uses M6/M42/M5; Milton Keynes M1/A5/A421; Manchester M60/M62. Uncertain Cardiff/Kempston road claims were omitted. Corridors describe pickup context, never access authorisation. Source references are stored with the content, including [ONS regions](https://www.ons.gov.uk/methodology/geography/ukgeographies/administrativegeography/england), [National Highways network](https://nationalhighways.co.uk/roads-and-travel/road-projects/roads-we-manage/), [Milton Keynes council infrastructure evidence](https://www.milton-keynes.gov.uk/sites/default/files/2024-10/240718_MK_Reg18_IDP%201.pdf), [Bedford highways](https://www.bedford.gov.uk/parking-roads-and-travel/development-planning-travel/development-planning-travel-overview) and [Dunstable development timeline](https://www.centralbedfordshire.gov.uk/dunstable-development-timeline). A source link is geographic context, not proof of Teleport operator availability.

## F. Technical SEO

- Each canonical page has meaningful initial HTML, one H1, title/description, canonical and social metadata. Links are ordinary anchors; search is an enhancement. Region lists remain in the initial HTML even when their native disclosure is collapsed. A no-JavaScript check confirms useful city content and telephone links.
- Canonicals use apex HTTPS and no trailing slash, except `/`. Birmingham remains `/recovery/birmingham`; `/areas/birmingham` and `/birmingham` permanently redirect there. New city `/recovery/<city>` aliases point to their `/areas/<city>` canonical. GET/HEAD redirects change pathname only, preserving encoded/repeated advertising query parameters.
- Generated exact rewrites serve only known page HTML. Unknown areas/services/nested paths return custom **HTTP 404** with noindex. The callback endpoint remains exact and is not intercepted by the Edge function. No SPA catch-all 200 was added.
- The sitemap contains exactly 39 canonical pages, with no aliases, drafts, callback or 404. Preview/branch builds emit page/header noindex and disallow-all robots; production canonicals remain consistent.
- JSON-LD contains Organization and WebSite, plus real BreadcrumbList and relevant Service nodes. No fake LocalBusiness address, reviews, depot, rating, price or availability schema. Trusted route-specific JSON-LD hashes were added to the existing CSP; Google permissions and execution restrictions remain.
- Homepage discovery leads to priority cities, hubs and motorway guidance; city pages link selected neighbours, their region, relevant service topics and genuine local-service content. Directory-only locations lead to regional anchors, not thin placeholder pages.

Prerendering makes content available without relying on a search engine's JavaScript rendering. It does not guarantee indexing. [Google JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics). Netlify evaluates Edge functions before redirect rules/static content; actual deployed behaviour must still be checked. [Netlify request API](https://docs.netlify.com/build/edge-functions/api/), [redirect matching](https://docs.netlify.com/manage/routing/redirects/redirect-options/).

## G. QA results

| Check | Local result |
|---|---|
| `npm test` | **47/47 pass**: 41 existing cases adapted where V4 deliberately changes publication/homepage assumptions, plus six new V4 tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS; 39 prerendered canonical pages plus 404 |
| `scripts/v4-browser-qa.mjs` | PASS: 39 initial/hydrated pages, 1,314 internal links/fragments, 102 GET/HEAD redirect checks, 56 responsive/text200 layouts, no application/console/CSP errors |
| `scripts/browser-qa.mjs` | PASS: homepage/layout/legal/skip link/menu/reduced motion; eight GPS acquisition/fallback scenarios plus hero/final/Birmingham/Milton Keynes placements; intercepted callback success/server/unprocessed/offline cases |
| `scripts/location-browser-qa.mjs` | PASS: Birmingham direct/refresh/query routing, coverage/FAQs with keyboard and touch, back/forward, text200/text spacing, visible focus and intercepted callback validation/failure/retry |
| `scripts/launch-browser-qa.mjs` | PASS: six page types, shared displayed/dialled/accessibly named numbers, simulated forwarding, invalid-number fallback, withdrawal, callback mounts and navigation |
| `scripts/hero-browser-qa.mjs` | PASS: ordinary/forwarded Birmingham states across requested widths and short-phone heights; symmetrical trust, enabled/configurable ETA, reduced motion and preserved entrance animation |
| `scripts/consent-browser-qa.mjs` | PASS on home and Birmingham with **real** Google libraries: fresh/reject blocked, accept loads one base tag plus existing website-call config, repeated accept/persistence/withdrawal correct; no observed Google CSP error |
| Deploy-preview build + `node scripts/check-preview.mjs` | PASS on all 39 pages; production build subsequently restored |
| Source protection / `git diff --check` | Protected audit/contact/tracking code preserved; no whitespace errors |

Detailed browser evidence is in `qa-artifacts/v4/verification.json`, `qa-artifacts/browser-qa.json`, `qa-artifacts/location-pages/master-verification.json`, `qa-artifacts/hero/verification.json`, `qa-artifacts/launch-audit/local-contact-browser.json` and `qa-artifacts/consent/verification.json`. Tests intercept all customer handoffs/form requests. Only the consent suite loads real Google libraries, without an advert click or connected call. This is targeted accessibility QA, not a comprehensive WCAG certification or physical screen-reader/device test.

Performance: final shared JavaScript is **275.28 kB raw / 82.95 kB gzip**, CSS **39.29 kB raw / 8.86 kB gzip**. The prior launch audit measured roughly 70.16 kB gzip JS / 7.87 kB CSS: V4 adds content/navigation payload rather than claiming a bundle reduction. Fully prerendered home HTML is about **59.8 kB raw / 12.1 kB gzip**; `/areas` about **63.9 kB / 10.5 kB**. Vite's early per-HTML size log is before the prerender stage and is not the final HTML size. Local LCP observations are stored in the V4 evidence; they use desktop Edge, loopback delivery and mixed cache state, so cannot establish field Core Web Vitals or a production improvement. No field-speed or conversion-uplift claim is made.

## H. Exact remaining acceptance items

1. **Owner content/operations approval:** approve the requested 24/7 positioning and actual answering/dispatch arrangements, conditional service capabilities, all listed enquiry regions/cities and genuine equipment/operator coverage. Every current entry is conditional, not a verified base. Northern Ireland/remote-island arrangements are not established.
2. **Existing claims:** Birmingham's enabled **30 MIN ETA — Subject to availability** remains owner-approved and centrally configurable, but operational substantiation still needs owner review before publication. No average or guarantee was added. The historical **45-minute average** remains in the unchanged FAQ/legal explanation and central config, although removed from the homepage hero; retain supporting methodology/records or obtain an owner-approved wording decision. Do not silently infer evidence. Existing guarantee/booking promises require the review already documented in [LEGAL_OWNER_INPUT.md](LEGAL_OWNER_INPUT.md) and [CLAIMS_REGISTER.md](CLAIMS_REGISTER.md).
3. **Existing business/privacy inputs:** legal proprietor/controller, real correspondence address/email, actual retention/lawful-basis decisions, processor/WhatsApp handling, booking/cancellation/refund/complaint process and the previously identified image-host security-cookie assessment remain owner/specialist-dependent. No details were invented. Only the location control's name changed in the published policy.
4. **Real contact delivery:** test normal calls on iPhone/Android and Wi-Fi/mobile data, including receiving-device ringing, two-way audio, locked/background operation, missed-call/voicemail handling. Website link/forwarding mocks do not prove SwitchboardFREE delivery. Send one authorised WhatsApp test and verify business receipt. Test an authorised Netlify callback and dashboard/notification receipt; none was submitted here.
5. **Deployment verification:** verify the actual Edge deployment, headers, forms detection, direct/refresh/slash/alias/host redirects and query preservation on an approved Netlify preview and production. The existing Netlify badge's injected-script CSP issue remains a provider-setting matter; the CSP was not weakened to hide it.
6. **Advertising acceptance:** preserve the existing IDs and action mapping. Eligible Google forwarding allocation, completed telephone call and Ads attribution still require a separately authorised live advertising visit/call. No campaign, budget, destination or conversion setting was changed. A click is not an answered call, a WhatsApp enquiry or a booking.
7. **Search Console after approved release:** submit/check the production sitemap, inspect representative canonical pages and rendered HTML, verify sitemap discovery/status and monitor indexing/canonical reports. No account action was taken and no immediate indexing/ranking is promised.

These are concrete owner/live/provider acceptance gates, not an unbounded local refactor backlog.

## I. Preview, release and rollback

For an ordinary development preview: `npm run dev`, then the Vite URL printed in the terminal (normally `http://localhost:5173/`). Vite is not a Netlify routing test.

For the production-style local review currently running:

```powershell
npm run build
npm run qa:serve
```

Open **http://127.0.0.1:4173/**, **http://127.0.0.1:4173/areas**, **http://127.0.0.1:4173/areas/milton-keynes** and **http://127.0.0.1:4173/recovery/birmingham**. The QA server serves production HTML/CSP and replays the canonical handler; it deliberately does not accept real callback submissions.

Browser suites use the existing external Playwright installation, with no package installation:

```powershell
$env:PLAYWRIGHT_MODULE='C:/Users/syeat/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'
node scripts/v4-browser-qa.mjs
node scripts/browser-qa.mjs
node scripts/location-browser-qa.mjs
node scripts/hero-browser-qa.mjs
node scripts/launch-browser-qa.mjs
node scripts/consent-browser-qa.mjs
```

For preview isolation, set `$env:CONTEXT='deploy-preview'`, build, run `node scripts/check-preview.mjs`, remove `Env:CONTEXT`, then rebuild production. Do not rebuild `dist` while browser suites are exercising it.

Release sequence after explicit approval: complete owner acceptance above; review the branch/diff and make the owner's chosen commits; use the existing Git-connected Netlify workflow so **Edge source and generated manifest deploy together with static HTML**; inspect an approved preview; verify noindex/header/form/redirect/contact checks; authorise production publication; repeat live checks and authorised real-device enquiries. Keep Google Ads/account changes separate and explicitly approved. Do not upload only `dist` and assume it installs Edge Functions.

Recovery points: the clean original `main`/`5dd30b8` was not reset or modified; `qa-artifacts/v4/checkpoint-foundation.zip` and `qa-artifacts/v4/checkpoint-final-verified.zip` preserve local stages. They contain source/config/test/documentation, not `.git`, packages, secrets or build caches. Keep them until the approved Git history/deployment is established. For a release rollback, restore the previous known-good **complete Netlify deployment**, including Edge/routing, then verify home, Birmingham, legal routes, consent and contacts. For source rollback, preserve any subsequent owner work and restore through a reviewed Git change to the recorded baseline; do not blindly reset the shared worktree. No rollback or deployment was executed.
