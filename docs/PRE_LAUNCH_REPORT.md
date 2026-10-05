# Teleport Recovery final architecture and trust pass

Completed locally: 3 October 2026. The approved purple visual identity, truck imagery, hero composition, section order, typography and animation styles are preserved. This implementation has not been published and is not a certification of legal compliance.

## 1. Files changed

| Area | Files |
| --- | --- |
| Shared facts and event handling | `src/config/business.ts`, `src/config/faqs.ts`, `src/lib/tracking.ts`, `src/components/CallLink.tsx` |
| Routing and accessibility | `src/App.tsx`, `src/index.css`, `src/pages/LegalPage.tsx`, `src/pages/NotFoundPage.tsx` |
| Public components | `src/components/BrandLogo.tsx`, `Header.tsx`, `Hero.tsx`, `Coverage.tsx`, `ReassuranceStrip.tsx`, `Services.tsx`, `HowItWorks.tsx`, `Trust.tsx`, `FAQs.tsx`, `ContactSection.tsx`, `Footer.tsx`, `MobileCallBar.tsx` |
| Callback submission | `src/lib/callback.ts` and the existing `ContactSection.tsx` |
| Deployment and metadata | `index.html`, `vite.config.ts`, `netlify.toml` |
| Validation/tooling | `package.json`, `package-lock.json`, `.gitignore`, `tests/launch.test.mjs`, `scripts/serve-production.mjs`, `scripts/browser-qa.mjs` |
| Internal business/developer records | `docs/CLAIMS_REGISTER.md`, `docs/LEGAL_OWNER_INPUT.md`, `docs/DEPLOYMENT.md`, `docs/SECURITY_TOOLING.md`, this report |

Generated build artifacts include the three legal HTML entry files, `404.html`, `robots.txt`, `sitemap.xml`, CSP `_headers`, and `__forms/callback.html`. They are generated from source and are not separately maintained copies. Existing public branding assets were retained.

## 2. Exact customer-visible copy changes

- Verified public telephone is **01234 900 700**, with every call link targeting **tel:+441234900700**.
- Hero desktop/tablet CTA: **“Call 01234 900 700”**. Narrow mobile retains **“Call Now”** with **“Call us on 01234 900 700”** immediately nearby. The nearby number is modestly larger.
- Hero claim: **“MONEY-BACK GUARANTEE*”**. Supporting line: **“If we're unable to provide the agreed recovery service. Terms apply.”** Both the claim and “Terms apply.” link to `/guarantee`.
- ETA label: **“45 MIN AVERAGE ETA*”**. Supporting qualifier: **“Average ETA is based on historical recovery experience. Actual arrival times can vary by location, traffic and operator availability.”** It is displayed unobtrusively beneath the hero number, prefixed with an asterisk.
- Contact FAQ: **“The fastest way is to call 01234 900 700. You can also use the callback form at the bottom of this page to request a call about your recovery.”** The telephone in that answer is clickable.
- Guarantee FAQ: **“If Teleport Recovery accepts payment but is unable to provide the agreed recovery service, the amount paid to Teleport for that booking will be refunded. Conditions and exclusions apply; estimated arrival times are not guaranteed. Your statutory rights are unaffected.”** Link: **“Read the full Money-Back Guarantee”**.
- New FAQ **“Who carries out the recovery?”**: **“Teleport Recovery manages your booking and may use independent recovery operators to carry out the physical recovery service. Teleport remains your point of contact for the booking.”**
- New FAQ **“Is the average ETA a guaranteed arrival time?”**: **“No. Our 45-minute average ETA is an average, not a guaranteed arrival time. Average ETA is based on historical recovery experience. Actual arrival times can vary by location, traffic and operator availability. We’ll confirm the estimated arrival time for your booking before dispatch.”**
- Final recovery section displays **01234 900 700** as a major clickable element. Footer telephone is the verified number.
- Persistent footer links: **“Terms & Conditions”**, **“Money-Back Guarantee”**, **“Privacy Policy”**.
- Callback phone input hint: **“Your callback number”**; support line: **“Include the country code if you're outside the UK.”**
- Callback privacy copy: **“We'll use these details to respond to your recovery request. See our Privacy Policy.”** The policy label links to `/privacy`.
- Callback pending label: **“Sending callback request…”**. Success heading: **“Callback requested”**. Success copy: **“We've received your details and will call you back to discuss your recovery request. For immediate help, please call us directly.”**
- Callback failure copy: **“We couldn't confirm your callback request. Please call 01234 900 700 for immediate help, or try again.”** The number calls directly. A timeout does not assert that the request definitely failed to reach the server.
- Added keyboard-only **“Skip to content”** link.
- Not-found state: **“Page not found”**, **“Let’s get you back on the road.”**, **“This page could not be found. You can return to our recovery services or call us for help.”**
- The new legal text is in [LegalPage.tsx](../src/pages/LegalPage.tsx). The guarantee retains the supplied refund/exclusion/replacement/payment-method/statutory-rights policy. No fixed refund time, liability waiver, insurance promise, invented identity or payment-agent model is added.

The confirmed 24/7 and UK/nationwide recovery claims remain. Approved ordinary service copy is otherwise preserved.

## 3. Stale values and placeholders removed

Removed the old freephone contact placeholder and its telephone URI, matching WhatsApp display placeholder and fake messaging destination, example-domain email and mail link, superseded ETA reference, guarantee “published before launch” holding answer, callback visual-only copy/behaviour, footer placeholder-details notice and unverified reviews holding line. The symbolic mobile-number input hint was replaced with a neutral callback-number hint.

Repository and generated-output searches found no stale phone, example email, fake messaging destination, obsolete branding or superseded ETA claim. No obsolete public branding was present to remove. No confirmed real email or WhatsApp contact existed; neither is invented or displayed. Exact removed contact strings are recorded in the chat delivery report to keep the obsolete values out of the repository.

## 4. Where the verified number appears

Visible: desktop header, desktop/tablet hero CTA, nearby hero telephone line on all layouts, expanded contact FAQ answer, final “Call for Recovery” number, footer, mobile fixed call bar, legal-page contact/refund/privacy links and legal-page call CTA, not-found call CTA, callback failure call link, generated JavaScript-disabled telephone fallback, and the unprocessed callback endpoint's honest fallback.

Mobile header uses a compact phone icon with the number in its accessible label. Other calls retain the approved labels: coverage check, reassurance strip, services discussion, how-it-works start, FAQs help and callback-success “Call Instead”. Every destination and accessible phone label uses the central configuration. The Organization structured data also uses the verified telephone.

## 5. Callback architecture and remaining deployment step

Netlify detects the hidden static `recovery-callback` blueprint in built HTML. React submits URL-encoded POST data to the exact static `/__forms/callback.html` endpoint. Fields: required name and phone; optional location and details; `form-name` and empty `bot-field` honeypot.

The form validates input, prevents duplicate submissions immediately, disables controls while pending, applies a 15-second abort timeout and focuses an accessible success or failure state. Success is shown only after a successful response that is not the unprocessed static endpoint or a Vite/SPA fallback. Failures retain input and permit retry. No backend, CRM or marketing-consent checkbox is added.

**Actual Netlify acceptance, dashboard persistence and notifications remain unverified.** Enable Forms detection, redeploy, confirm `recovery-callback` registration, configure a genuine monitored notification destination, then verify a controlled deployed submission in the dashboard and recipient inbox. See [DEPLOYMENT.md](DEPLOYMENT.md).

## 6. Legal routes and internal claims record

Created `/terms`, `/guarantee`, `/privacy` and a polished not-found state. Legal routes have first-class build-time metadata and direct-navigation Netlify entry rules. Navigation links return correctly to homepage sections. The guarantee is available from the hero, its support line, FAQ and persistent footer links.

The terms state customers buy/pay Teleport, Teleport manages bookings and the customer relationship, physical recovery may use independent operators, and Teleport pays operators separately. Privacy covers callback information, Netlify processing, existing Google Fonts/Pexels connections, rights and the ICO complaint route. It remains incomplete until actual controller and data-handling decisions are supplied.

[CLAIMS_REGISTER.md](CLAIMS_REGISTER.md) records confirmed claims and the evidence the business should retain; no supporting evidence is invented.

## 7. Tracking prepared

Typed events: `call_click`, `callback_submit`, `whatsapp_click`, `guarantee_terms_view`. The helper pushes only an event name and optional UI location to an existing `window.dataLayer`, safely doing nothing when absent and tolerating analytics failure. No advertising/analytics tags, IDs or dependencies are installed, and no callback details enter tracking.

All call controls are instrumented. Callback success emits one event only after acceptance; failures emit no callback success event. Viewing the guarantee emits once, including React StrictMode. WhatsApp event support is prepared but no unconfirmed contact control is rendered.

## 8. SEO, accessibility, performance and security

- Central business values generate titles, descriptions, canonicals, Open Graph/Twitter metadata and known-facts Organization data for the canonical domain. Sitemap covers the four public pages; robots excludes the form endpoint. Preview/branch deployments and errors are noindex. Existing favicon is preserved.
- Semantic page headings, keyboard skip link, labelled call links, non-focusable collapsed FAQ links, visible existing focus styles, Escape-close mobile menu with returned focus, 44px mobile header targets, accessible callback validation/status/focus and safe-area footer clearance.
- Existing responsive hero image remains eager, with high fetch priority. Below-fold coverage image remains responsive and lazy, with asynchronous decoding. Existing reduced-motion rules remain effective. No new animation style or intrusive hero disclosure is added.
- Netlify configuration adds nosniff, referrer policy, frame protection, permissions policy and hashed-asset caching. Generated CSP permits required images/fonts/styles while restricting scripts/connections/forms to appropriate origins, hashing the JSON-LD and blocking frames/objects. No secrets or client-side private environment values are introduced.
- Unknown Netlify paths use `404.html` with an error status; no catch-all successful SPA rewrite hides errors. HTTPS/www canonical rules and certificates require deployed verification.

Existing development-tool security findings remain: full npm audit reports seven findings, all in development/build packages; production-only npm audit reports zero. A major Tailwind/Vite migration was not applied in this design-frozen pass. See [SECURITY_TOOLING.md](SECURITY_TOOLING.md) for actual findings and exposure limits.

## 9. Validation results

| Check | Result |
| --- | --- |
| Typecheck (React + Vite configuration) | Passed |
| ESLint | Passed, no warnings |
| Native Node tests | 7 passed, 0 failed |
| Production build | Passed; generated legal entries, error page, metadata, discovery files and CSP |
| Git whitespace check | Passed |
| Browser responsive sizes | Passed at 1440x900, 1180x750, 768x1024, 390x844 |
| Direct legal routes and aliases | Passed locally with generated production files |
| Keyboard, click-to-call, hero/FAQ guarantee paths | Passed |
| Callback validation, rapid duplicate submission, accepted success | Passed with intercepted responses; no live customer request sent |
| Callback server error, offline and unprocessed HTTP-success response | Honest failure, retained input, enabled retry, no success event |
| Actual timeout | Helper abort/rejection verified at approximately 15 seconds |
| Console/JavaScript errors, CSP violations, failed external assets | None on successful page paths |
| Horizontal overflow and h1 count | No overflow at requested sizes; one h1 per page |
| Reduced motion | Hero motion disabled; smooth scrolling disabled |
| Production dependency audit | Zero reported vulnerabilities |
| Full development dependency audit | Seven outstanding findings, documented separately |

Browser checks use an existing Playwright installation and a loopback-only static QA server that replays generated CSP/security and expected static/error routing. This is evidence about built files, not a substitute for Netlify account verification. Browser results/screenshots are saved in the chat's visualization workspace. Reproduce with `npm run qa:serve` and `npm run qa:browser` using `PLAYWRIGHT_MODULE` if Playwright is outside the project. No browser-testing package was added to the application.

## 10. Pre-launch owner input and remaining checks

Required legal proprietor/controller identity, legal form, genuine geographic correspondence/business address and real written-contact/support email are absent. Company registration/registered office/place of registration and VAT details are required only if applicable; no numbers were invented.

The owner must confirm lawful bases, retention periods/criteria, processor/recipient arrangements and international transfers, privacy request handling, booking acceptance/confirmation, cancellation procedures and an owned refund/complaints process. The public privacy notice must be completed with the actual facts before launch. Retain evidence for 24/7 availability, nationwide coverage and the 45-minute average.

Complete Forms detection/notification/live-delivery checks, DNS/HTTPS/canonical redirects and real hosted headers/404 checks. Review the remaining development-tool update separately. Exact owner information and deployment procedures are in [LEGAL_OWNER_INPUT.md](LEGAL_OWNER_INPUT.md) and [DEPLOYMENT.md](DEPLOYMENT.md).
