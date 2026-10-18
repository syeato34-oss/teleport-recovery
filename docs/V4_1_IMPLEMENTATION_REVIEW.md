# Teleport Recovery — V4.1 implementation review

18 October 2026. Existing branch: **`codex/teleport-v4`**. This extends the local, uncommitted V4 work. **No reset, stash, commit, push, deployment, Google Ads/account change, phone-provider change or real customer submission was performed. No dependencies were installed or upgraded.** The original V4 report and launch audit remain unchanged.

## A. Design changes

Exact homepage copy:

- **24/7 NATIONWIDE RECOVERY**
- **BROKEN DOWN? GET RECOVERY NOW.**
- **Stranded? Call now for availability, a clear quote and an estimated arrival time. Or send your exact pickup location via WhatsApp.**
- **CALL 01234 900 700**
- **SEND LOCATION ON WHATSAPP**
- **No membership needed · Price before booking**

`RecoveryHero` now supplies one shared emergency composition for the homepage and authored cities: uppercase heading, lavender action phrase, a small availability eyebrow, the retained recovery photograph with controlled gradients, and a call-first contact pair. Desktop type has an intentional two-line homepage composition; mobile type and spacing adapt to narrow/short screens. Text and contact controls are present from first paint. No new bitmap, animation system, typeface or external service was introduced.

Before V4.1, the mobile homepage had a 60px Call button and 70px WhatsApp button with a two-line label. The new hero uses equal 60px mobile buttons and equal 64px desktop buttons. Call has the filled purple/lavender treatment, stronger number typography and comes first; WhatsApp is a restrained outline action. The permission/privacy explanation sits below both actions rather than making the WhatsApp column taller.

Before, captured from the actual V4 worktree:

![V4 homepage before this pass](<C:/Users/syeat/Documents/Veridian devlopment/project/qa-artifacts/v4-1/before-home-390.png>)

After, with the notice dismissed:

![V4.1 mobile homepage](<C:/Users/syeat/Documents/Veridian devlopment/project/qa-artifacts/v4-1/visual/home-390-rejected.png>)

The existing cookie notice was actually bottom-positioned above the mobile bar. It was retained: equal Accept/Reject prominence, optional tracking off by default, persistent choice and later withdrawal. Its position/engine were not changed merely because the brief described it as top-positioned. Fresh-screen tests check that the main call is above the notice and the notice is above the sticky contacts.

## B. City heroes

| City | Eyebrow | H1 |
|---|---|---|
| Birmingham | 24/7 BIRMINGHAM RECOVERY | BROKEN DOWN IN BIRMINGHAM? GET RECOVERY NOW. |
| Milton Keynes | 24/7 MILTON KEYNES RECOVERY | BROKEN DOWN IN MILTON KEYNES? GET RECOVERY NOW. |
| Bedford | 24/7 BEDFORD RECOVERY | BROKEN DOWN IN BEDFORD? GET RECOVERY NOW. |
| Northampton | 24/7 NORTHAMPTON RECOVERY | BROKEN DOWN IN NORTHAMPTON? GET RECOVERY NOW. |
| Cambridge | 24/7 CAMBRIDGE RECOVERY | BROKEN DOWN IN CAMBRIDGE? GET RECOVERY NOW. |

The same pattern applies to all 12 authored cities. Each supporting sentence is: **“Need vehicle recovery in [City]? Call now for availability, a clear quote and an estimated arrival time.”** Both CTA labels match the homepage. The central `cityHero()` helper controls this pattern; smaller responsive city typography accommodates longer names without changing the actual words.

Birmingham stays at **`/recovery/birmingham`**, with its existing SEO title, description, canonical, local content, coverage/FAQ controls, booking/guarantee information and callback form. Its two manual **WhatsApp for a Quote — enter your pickup manually** links remain below the hero and in the final section, with the original city draft. The hero/final contact pair now uses the owner-authorised location action. The old three-action Birmingham hero stack was consolidated.

The enabled, centrally configurable **30 MIN ETA*** remains Birmingham-only with **\*Subject to availability**. It was not copied into other cities or changed into an average/guarantee. Existing operational substantiation requirements remain owner-dependent. Independent-operator disclosures remain in page content, service explanations and legal pages.

## C. CTA system and location journey

Measured at 390px:

| Surface | V4 before | V4.1 after |
|---|---|---|
| Homepage hero | Call 358×60; WhatsApp 358×70 | Both 358×60 |
| Pickup section | Call 358×52; WhatsApp 358×70 | Both 358×60 |
| “Check your recovery option” | Call 358×60; WhatsApp 358×70 | Both 358×60 |
| Homepage final contact | Call 358×87.67; WhatsApp 358×70 | Both 358×60 |
| Sticky contacts | Both 173×54; static messaging link | Both 173×52; **CALL NOW** and **SEND LOCATION** |
| Desktop hero | Not independently dimensioned before this pass | Both 346×64 at 1440px |

The 320px sticky bar uses equal widths and slightly tighter label spacing rather than forcing a cramped 55/45 split. All normal labels stay on one line; 200% text may wrap and grow to retain readability. Bottom padding still uses `env(safe-area-inset-bottom)` and the existing ResizeObserver reserves the actual bar height for scrolling and consent placement.

The shared WhatsApp SVG has explicit intrinsic 20×20 dimensions and a bounded CSS class. Visible normal marks are **20×20px**, sticky marks **18×18px**, with a square viewBox/aspect ratio and no giant circular background. Call icons use the matching optical size. Normal WhatsApp control border contrast was strengthened (approximately 3.76:1 against its solid base surface); its visible text remains high contrast. A shared heading-wrap rule fixes the observed service-heading overflow at 200% text without reducing the requested text size or hiding overflow.

Location acquisition and the `handleClick` body were compared with the captured V4 source and are unchanged. Explicit action requests permission, uses the existing 7-second browser timeout/8-second hard deadline, validates coordinates/accuracy, and prepares an encoded Maps link in a WhatsApp draft. Denial, unsupported location, timeout, coarse/invalid results and late callbacks retain safe manual-location fallbacks. Double taps do not create duplicate acquisition/handoffs. The customer reviews and sends; the site does not create a native live-location attachment or send automatically.

The sticky bar reuses that same component rather than a static WhatsApp link. Its accessible description explains optional permission and manual review without placing a focusable link offscreen. Contact controls continue to work independently of advertising consent. Coordinates are not stored in browser storage or sent in ordinary tracking events. The public destination remains **`https://wa.me/447827079669`** and the phone fallback remains **`tel:+441234900700`**.

## D. Definitive existing inventory

The starting worktree was independently checked: **133 enquiry entries, 11 regions, 12 authored cities, eight services, two city-service pages and 39 canonical pages; all 47 starting unit tests passed.** These were not simply repeated from the old report. Final built HTML checks cover all original routes plus the new advice routes.

The complete lists are in:

- [Every area, region, original canonical route, current route and alias](V4_1_ROUTE_INVENTORY.md).
- [All 133 names/slugs, status, actual destination, roads, nearby areas and sources — CSV](V4_1_AREA_INVENTORY.csv).
- [Captured 39-route V4 baseline](V4_BASELINE_ROUTES.json).

The 12 city paths remain: `/recovery/birmingham`; `/areas/milton-keynes`; `/areas/bedford`; `/areas/kempston`; `/areas/northampton`; `/areas/luton`; `/areas/dunstable`; `/areas/cambridge`; `/areas/bristol`; `/areas/manchester`; `/areas/london`; `/areas/cardiff`.

The eight service paths remain under `/services/`: `breakdown-recovery`, `non-runner-recovery`, `vehicle-transport`, `accident-recovery`, `van-recovery`, `motorway-recovery`, `garage-delivery`, `auction-collections`. Both local service pages remain `/recovery/milton-keynes/breakdown-recovery` and `/recovery/bedford/non-runner-recovery`.

There are **121 directory-only entries**, not 121 hidden authored city pages. Their regional anchors are crawlable; they do not have standalone city URLs or sitemap entries. There are **no redirects from one city to a different city's landing page**. Alias URLs resolve to the same city. All regions/areas still require a job-specific dispatch check; no private driver anchors, fleet or depot claims were fabricated.

Common service/process/legal explanations are intentionally shared between city pages. Individual pickup/access context, questions and relevant nearby links remain local. Broad geographic/road source references do not independently establish operator capacity. Northern Ireland, remote/island arrangements, actual hours and equipment availability remain unverified operational facts.

## E. SEO expansion and competitor comparison

**Six new canonical pages are implemented locally and indexable in a production build:**

| URL | Reason / distinct customer utility |
|---|---|
| `/advice` | A discoverable hub for practical recovery preparation |
| `/advice/car-wont-start` | Symptom reporting versus diagnosis, mobility/loading and receiving garage |
| `/advice/breakdown-at-home` | Driveway/entrance access, obstacles, permission and handover |
| `/advice/stuck-in-park-locked-wheels` | Consolidated immobilisation guidance; model-specific instructions rather than unsafe generic release steps |
| `/advice/failed-mot-transport` | Current official result/driving conditions, test-station release and receiving garage |
| `/advice/electric-vehicle-recovery` | Model-specific loading/transport considerations without universal EV/charging/repair claims |

Each guide has three substantive original sections, dispatch checklist, a useful question/answer, related services/guides and explicit references. Official MOT, Highway Code and manufacturer guidance underpin relevant statements. Guides are **Article** content, not new promises of specialist services. Existing garage, motorway, van, accident and non-runner service pages are retained rather than duplicated for keyword variants.

**Current totals:** 133 registry entries; 11 regions; 12 authored city pages; eight service detail pages; two city-service pages; five guides plus their hub; **45 canonical pages**. No new city page has been published or deployed. The owner selected “I’ll supply confirmed coverage locations”; the actual list has not arrived. Additional city/service publication is therefore held, while the authorised UI and useful advice expansion are complete.

[Expansion decisions](V4_1_EXPANSION_DECISIONS.md) explicitly assess the candidate towns and city/service combinations, including those already authored, those remaining directory entries and Heathrow/West London's separate-content/access questions. It explains why recovery-truck/towing synonyms and unverified van combinations were not mass-generated.

The five requested competitor URLs were fetched read-only as public HTML/XML. The sitemap contains **283 unique URLs**, including **157 area URLs** and **81 recovery URLs**. Useful observed ideas were linked location/service/problem pathways, nearby-area navigation and practical pickup preparation. Teleport extends those concepts with its own region hierarchy and advice pages; no competitor text, code, imagery, brand treatment, contact details or road pairings were imported. URL count is not ranking or conversion evidence. [Competitor areas](https://sos30mins.co.uk/areas), [services](https://sos30mins.co.uk/services), [sitemap counted](https://sos30mins.co.uk/sitemap.xml).

## F. Updated architecture and source changes

Ordinary HTML links connect **home → areas → regional directory → authored city → relevant services**, with nearby/regional links back into useful destinations. **Services → relevant advice → applicable service/quote** adds a problem-led pathway without a city/service Cartesian product. The footer and homepage services section expose the advice hub. Every guide links to applicable services, selected related guides and recovery enquiries.

No router/framework, consent library, location service or paid dependency was added. The existing typed route/configuration model, Vite plugin, React build-time renderer, hydration and Netlify manifest generation remain. `RecoveryHero`, `RecoveryContactActions` and the shared icon treatment replace the inconsistent hero/button presentations; the tested underlying contact helpers remain.

Incremental V4.1 source changes include:

- **Hero/CTA:** `src/config/heroes.ts`, `src/components/RecoveryHero.tsx`, `src/components/RecoveryContactActions.tsx`, `src/components/Hero.tsx`, `src/components/MobileCallBar.tsx`, `src/components/WhatsAppIcon.tsx`, `src/components/WhatsAppLocationButton.tsx`, `src/components/WhatsAppLink.tsx`, `src/index.css`.
- **Existing page integration:** `src/config/locations.ts`, `src/config/locationTemplates.ts`, `src/pages/LocationPage.tsx`, `src/components/Coverage.tsx`, `src/components/ContactSection.tsx`, `src/components/RecoveryNavigation.tsx`, `src/components/Services.tsx`, `src/components/Footer.tsx`, `src/App.tsx`.
- **Advice/SEO:** `src/config/advice.ts`, `src/pages/AdvicePage.tsx`, `src/pages/ServicePage.tsx`, `src/config/routes.ts`, `src/config/validateContent.ts`, `netlify.toml`, generated `netlify/edge-functions/generated-routes.js`.
- **Accurate notices:** `src/pages/LegalPage.tsx` changes only the quoted location-control name; `index.html` corrects the no-JavaScript notice to reflect prerendered pages and telephone links. The hidden Netlify form fields/contract were not changed.
- **Verification/inventory:** `tests/v41.test.mjs`, updated `tests/location-hero.test.mjs`, `tests/locations.test.mjs`, `tests/v4.test.mjs`, `scripts/v41-browser-qa.mjs`, `scripts/content-inventory.mjs`, and the six existing browser runners. Old-copy/static-WhatsApp assertions were adapted to the explicitly authorised V4.1 UI; functional, privacy, forwarding and redirect assertions remain.
- **Review documents:** this report, `docs/V4_1_ROUTE_INVENTORY.md`, `docs/V4_1_AREA_INVENTORY.csv`, `docs/V4_BASELINE_ROUTES.json`, `docs/V4_1_EXPANSION_DECISIONS.md`, updated `docs/DEPLOYMENT.md`.

Twelve V4 engine/config/report files remain byte-identical, including `whatsapp.ts`, phone store/hook/CallLink, consent engine/interface, tracking and callback helpers, business configuration, canonical handler, V4 report and launch audit. No unrelated owner changes were reset or discarded.

## G. Technical SEO and measurement

All **45** pages contain real initial HTML, one H1, distinct titles/descriptions, proper canonical/social metadata and useful anchor links. Canonicals remain apex HTTPS with no trailing slash except `/`. Birmingham remains at its established recovery URL. Added advice routes use the existing exact rewrite/manifest system; the Netlify Edge declaration adds the `advice` prefix without changing the canonical handler or callback endpoint.

The sitemap contains exactly 45 indexable canonical URLs, excluding aliases, directory-only city drafts, callback infrastructure and 404. Known slash/index/alias GET/HEAD redirects preserve the complete query, including click identifiers and repeated/encoded parameters. Unknown city/service/guide URLs return genuine HTTP 404 with noindex. A no-JavaScript check verifies visible city content and working telephone links; the notice now accurately explains that only interactive location/callback features need JavaScript.

Existing Organization/WebSite/Service/BreadcrumbList data remain truthful. New guides have Article schema referencing Teleport's existing organization node and their actual canonical/review date. No addresses, depots, reviews, ratings, unconditional service capabilities or numeric ETA evidence were invented. Route-specific trusted JSON-LD hashes are generated under the existing CSP; script origins/execution restrictions and consent gating are unchanged. Deploy-preview isolation was checked on all 45 pages, then the production build restored.

Measurement remains deliberately precise:

| Action/outcome | Existing measurement / interpretation |
|---|---|
| Call button | `call_click` UI interaction; not an answered call |
| WhatsApp/location action | `whatsapp_click` at explicit action; not proof of app opening, message receipt or booking |
| GPS success or fallback | Distinct live status/draft outcomes tested in the browser; no separate Google conversion/event added |
| Callback | `callback_submit` only after the helper accepts the platform response; live receipt still requires a real controlled test |
| Connected/attributed call | Existing Google website-call setup and real phone-provider/eligible-visit verification; not inferred from a click |

`AW-18493914811` and `AW-18493914811/BRTACI7HpZUdELv9yvJE` remain unchanged. Only one base installation exists. No primary goals, campaign URL, budgets, new conversion events or remarketing settings were changed. No coordinates or message contents go into the existing UI events.

After an explicitly approved deployment, the owner should:

1. Select the verified Search Console property for `teleportrecovery.co.uk`. Confirm the live production sitemap can be fetched, then use **Sitemaps → Add a new sitemap**, submit `https://teleportrecovery.co.uk/sitemap.xml`, and check the fetch/parse status. Submission does not establish that all listed pages are indexed. [Google Sitemaps instructions](https://support.google.com/webmasters/answer/7451001?hl=en).
2. Use **URL Inspection** for `/`, `/recovery/birmingham`, `/areas/milton-keynes`, `/areas/bedford` and a new guide. Run the live test; inspect fetch success, crawl/index permissions and rendered HTML. Check declared/Google-selected canonicals when available. Request indexing for appropriate priority URLs only, within Google's limits; no artificial engagement or bypass automation. [URL Inspection](https://support.google.com/webmasters/answer/9012289?hl=en).
3. Review the Page indexing report for submitted pages and inspect examples of discovered/crawled-not-indexed, duplicate/canonical, blocked/noindex or fetch-error cases. Diagnose the actual reason. Redirect aliases and directory fragments are not additional canonical pages requiring forced indexing.
4. In **Performance → Search results**, use Web search and page/date filters for priority routes; monitor impressions, clicks, CTR and position over a meaningful post-release period. Compare like periods and distinguish organic search metrics from genuine business enquiries. [Performance report](https://support.google.com/webmasters/answer/7576553?hl=en).

No Search Console or Google Ads account action was performed; publication, crawling, indexing, ranking and conversion uplift have not been claimed.

## H. Verification results

| Check | Result |
|---|---|
| Starting V4 unit suite | 47/47 passed before edits |
| Final unit suite | **51/51 passed** — existing 47 plus four V4.1 tests |
| TypeScript, lint, production build | PASS |
| Content registry validation/inventory export | PASS — 133 entries, 39 captured baseline routes, 45 current canonicals |
| Full production HTML/link/SEO browser suite | **PASS** — 45 routes, 1,534 internal links/fragments, 114 GET/HEAD redirects, 77 responsive/text200 layouts; no application/console/CSP errors |
| V4.1 visual/contact hierarchy suite | **PASS** — 90 layout/contact states, all 12 city heroes, two accessible busy/double-tap/manual-draft checks and synthetic safe-area geometry; no application/console/CSP errors |
| Existing homepage/GPS/callback browser suite | PASS — all acquisition/fallback scenarios plus hero, final, city and sticky placements; fresh/rejected sticky actions work |
| Existing Birmingham route/keyboard suite | PASS — direct/refresh/back-forward, coverage/FAQ touch/keyboard states, text scaling/spacing, visible focus and callback validation/failure/retry |
| Existing hero/forwarding/ETA suite | PASS — requested widths plus short phone screens, normal/forwarded states, two aligned trust items, motion/reduced motion and configurable ETA |
| Existing launch contact suite | PASS — six page types, matching displayed/dialled/accessibly named numbers, callback mounts, simulated forwarding and route rerenders |
| Real Google-library consent suite | PASS on home/Birmingham — fresh/reject blocked, accept single base tag + existing call config, persistence/repeat accept/withdrawal and no observed Google CSP error |
| Preview isolation build | PASS — all 45 pages noindex, disallow-all robots and noindex header; production build restored |
| Sitemap XML parser | PASS — no parse errors, correct sitemap namespace and exactly 45 entries |
| Protected source comparison | PASS — 12 engine/config/report files unchanged; location handler matches V4 checkpoint |

The four new unit tests cover exact hero configuration, distinct substantive guide content/references, truthful Article/schema/service separation and avoiding speculative keyword/city-service pages. Browser tests were extended for the changed sticky action rather than silently treating it as the former static WhatsApp link.

Evidence is under `qa-artifacts/v4-1/`: `before-dimensions.json`, `before-inventory.json`, `routes/verification.json`, `visual/verification.json`, `functional/browser-qa.json`, `birmingham/master-verification.json`, `hero/verification.json`, `contacts/local-contact-browser.json`, `consent/verification.json`. Calls, WhatsApp handoffs and forms were intercepted. Real Google libraries were loaded only in the consent suite, with no eligible advert click or connected call.

This is targeted desktop-browser accessibility/device emulation, not WCAG certification or a physical iOS/Android/assistive-technology acceptance claim. Safe-area coverage includes source inspection and synthetic 34px geometry, not a real notch measurement. The genuinely observed scaled-heading defect was corrected; stale title-case and hidden-icon test predicates were updated without relaxing the routing/contact/privacy requirements.

Final shared JS: **288.64 kB raw / 86.74 kB gzip**, versus V4's 275.28 / 82.95. CSS: **43.20 kB raw / 9.49 kB gzip**, versus 39.29 / 8.86. No new images or libraries account for that growth; it includes the shared design rules and five substantive guides. Local LCP spot observations are in the route evidence and are affected by external image/font delivery, caching and concurrent test load; they are not field Core Web Vitals or proof of a speed/conversion improvement.

## I. Screenshots and local review

Final first-screen screenshots exist for 320, 375, 390, 430, 768 and 1440px, with consent open and rejected. The representative set covers homepage, Birmingham, Milton Keynes, Bedford, area hub, motorway service and failed-MOT guide. All 12 actual city hero headings were also checked. Text200 and active location-acquisition screenshots are included.

| View | Artifact under `qa-artifacts/v4-1/visual/` |
|---|---|
| Homepage mobile, fresh | `home-390-fresh.png` |
| Homepage mobile, notice dismissed | `home-390-rejected.png` |
| Birmingham mobile | `recovery-birmingham-390-rejected.png` |
| Milton Keynes mobile | `areas-milton-keynes-390-rejected.png` |
| Bedford mobile | `areas-bedford-390-rejected.png` |
| Area directory mobile | `areas-390-rejected.png` |
| Service mobile | `services-motorway-recovery-390-rejected.png` |
| New guide mobile | `advice-failed-mot-transport-390-rejected.png` |
| Homepage desktop | `home-1440-rejected.png` |
| Active hero / sticky location | `hero-location-active-390.png`, `sticky-location-active-390.png` |
| Directory browsing / recovery option | `directory-browse-390.png`, `check-recovery-option-390.png` |
| Advice hub / substantive guide content | `advice-hub-cards-390.png`, `failed-mot-content-390.png` |

Production-style local preview remains **http://127.0.0.1:4173/**. Also inspect `/recovery/birmingham`, `/areas/milton-keynes`, `/areas/bedford`, `/areas`, `/services`, `/advice` and any guide. Start it with `npm run build`, then `npm run qa:serve`; the QA server intentionally does not accept real form submissions. Vite development (`npm run dev`) is useful for styling but does not reproduce Netlify headers/redirects.

## J. Release status and rollback

**Local implementation is ready for owner review; production remains untouched.** Additional city publication is owner-input-dependent because the promised confirmed supplier list is still pending. No coverage facts, local branches or equipment commitments were invented to satisfy a page count.

Remaining concrete acceptance items are: approve the V4.1 design/copy and actual 24/7 arrangements; supply/review genuine additional coverage and equipment limits; retain/review substantiation for the existing Birmingham 30-minute visual and historical 45-minute FAQ/legal explanation; complete the already documented business/controller/privacy/booking inputs; verify real iPhone/Android calls, WhatsApp receipt and controlled Netlify form receipt. The known production Netlify badge CSP issue remains a provider-setting matter, not a reason to enable unsafe script execution. Real Google forwarding allocation/call attribution still requires a separately authorised eligible visit and connected call. See the unchanged [launch audit](LAUNCH_AUDIT_2026-10-17.md) and [owner legal inputs](LEGAL_OWNER_INPUT.md).

After explicit approval, review the incremental diff, make only owner-authorised commits/pushes, deploy through the existing Git-connected Netlify flow so static output **and Edge source/manifest** are packaged together, inspect an approved preview, then authorise production publication and repeat live URL/header/contact tests. Do not upload `dist` alone and assume Edge Functions were installed. Do not change campaign destinations or settings as part of this release automatically.

Recovery checkpoints: `qa-artifacts/v4-1/checkpoint-before.zip` captures the existing uncommitted V4 source; `qa-artifacts/v4-1/checkpoint-final-verified.zip` captures the verified V4.1 source. `qa-artifacts/v4-1/before-files.json` records per-file hashes at task start. To undo V4.1 locally, preserve subsequent owner work and restore the **V4 checkpoint** through a reviewed change; resetting to old `main` would also discard the existing V4 implementation. For a production rollback after a future authorised release, restore the previous known-good complete Netlify deployment, including routing/Edge behaviour, then recheck home, Birmingham, legal routes, consent and contacts. No rollback was performed here.
