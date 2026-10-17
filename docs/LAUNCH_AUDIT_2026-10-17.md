# Teleport Recovery — end-to-end launch audit

Audit date: **17 October 2026**. Production: https://teleportrecovery.co.uk. Workspace: `C:\Users\syeat\Documents\Veridian devlopment\project`.

**Publishing recommendation: NO-GO for unconditional public-launch sign-off today.** The targeted local patch is ready for owner review and an authorised deployment/preview check. It has not been deployed. Acceptance still needs real call delivery, callback receipt and the existing owner privacy/business inputs. This does not recommend taking the existing site offline.

**Google Ads spending recommendation: NO-GO.** Keep the campaign paused until the deployed forwarding fix, correct website-call conversion action, real incoming-call reliability and an explicitly authorised eligible-Ads call test are verified. No campaign, budget, advert, final URL or provider setting was changed.

PASS means independently checked within the stated environment. FAIL means an observed defect or failed assertion. UNVERIFIED means evidence requires owner access, physical devices, an authorised real enquiry/call or eligible advertising traffic. A local PASS is not a production PASS.

## 1. Live URLs and routing

Raw public HTTP checks and rendered browser checks were made on 17 October. Full redirect chains, headers, titles, canonical URLs and timestamps are in [qa-artifacts/launch-audit/live-urls.json](<C:/Users/syeat/Documents/Veridian devlopment/project/qa-artifacts/launch-audit/live-urls.json>). Query fixtures were requested as raw HTTP only: they were never executed as Google advertising sessions.

| Public URL | Live response | Content / canonical | Status |
|---|---|---|---|
| `https://teleportrecovery.co.uk/` | 200 | Nationwide homepage; canonical `/` | PASS |
| `https://teleportrecovery.co.uk/recovery/birmingham` | 200 | Birmingham; canonical `/recovery/birmingham` | PASS |
| `https://teleportrecovery.co.uk/recovery/birmingham/` | 200, no redirect | Birmingham; canonical `/recovery/birmingham` | PASS content; FAIL requested permanent normalisation |
| `https://www.teleportrecovery.co.uk/recovery/birmingham` | 301 → apex, then 200 | Birmingham; slash-free apex canonical | PASS |
| `https://www.teleportrecovery.co.uk/recovery/birmingham/` | 301 → apex slash URL, then 200 | Birmingham; slash-free apex canonical | PASS hostname; slash normalisation still pending |
| `https://teleportrecovery.co.uk/birmingham` | 404 | Custom not-found page | FAIL live; fixed locally |
| `https://teleportrecovery.co.uk/birmingham/` | 404 | Custom not-found page | FAIL live; fixed locally |
| `/terms`, `/guarantee`, `/privacy` on apex HTTPS | 200 each | Correct legal title and page canonical | PASS |

HTTP apex Birmingham redirects to HTTPS with 301. HTTP www slash Birmingham takes two 301s to apex HTTPS and then returns 200. HTTPS www behaviour is independently verified; the Netlify dashboard's primary-domain setting itself was not inspected.

**Precise current cause:** there is no deployed short-alias handler. The current production bundle is `/assets/index-22CklE9y.js`; both full Birmingham variants work now. The earlier slash-free custom 404 is **not reproducible** in this audit. React already normalises trailing slashes, Vite generates the Birmingham HTML entry point, and source contains an explicit Netlify clean-path rewrite. Evidence does not establish which old deployment/cache caused the historical 404; attributing it to React would be speculative.

**Local fix:** preserve the existing slash-free canonical and the prior worktree's route-scoped Netlify Edge Function. Extend it to permanently redirect `/recovery/birmingham/`, `/birmingham` and `/birmingham/` to `/recovery/birmingham`. Changing only `URL.pathname` preserves the complete query, including `gclid`, `gbraid`, `wbraid`, UTMs, encoded plus signs and repeated keys. Canonical GET/HEAD pass through, with no redirect loop. Other routes and POSTs are excluded. Keep Pretty URLs disabled for the exact callback POST endpoint. Netlify's ordinary redirect matching normalises trailing slashes; adding a regular slash-only redirect is not a safe replacement for this handler. See [Netlify redirect matching](https://docs.netlify.com/manage/routing/redirects/redirect-options/).

**PASS local:** GET/HEAD tests for all three redirects, query preservation, canonical response 200, direct visits, refreshes, legal routes, real missing-route 404, canonical HTML and sitemap. Live www/HTTPS redirects also preserved every tested query exactly. A query surviving an alias 404 does not make that alias usable or prove attribution.

**UNVERIFIED deployment:** the Edge Function must be included by Netlify's GitHub build, not by uploading `dist` alone. Recheck real 301 responses after owner-approved deployment. Local QA executes the actual handler but does not reproduce the entire Netlify platform. Vite, React route handling, homepage metadata and city configuration needed no changes in this audit.

## 2. Telephone contact inventory

**PASS fallback:** every rendered telephone anchor on home, Birmingham, all three legal pages and the custom 404 used **`tel:+441234900700`**. Displayed numbers were **01234 900 700**. This includes hidden desktop/mobile variants, expanded FAQ content and conditional callback success/failure links. Complete live and local per-element text, `aria-label`, visibility and actual href records are in [qa-artifacts/launch-audit/live-contact-browser.json](<C:/Users/syeat/Documents/Veridian devlopment/project/qa-artifacts/launch-audit/live-contact-browser.json>) and `local-contact-browser.json`.

| File / contact point | Pages | Observed fallback href |
|---|---|---|
| [src/components/Header.tsx](<C:/Users/syeat/Documents/Veridian devlopment/project/src/components/Header.tsx>) — desktop number | All six page types | `tel:+441234900700` |
| [src/components/Header.tsx](<C:/Users/syeat/Documents/Veridian devlopment/project/src/components/Header.tsx>) — mobile phone icon | All six | `tel:+441234900700` |
| [src/components/Footer.tsx](<C:/Users/syeat/Documents/Veridian devlopment/project/src/components/Footer.tsx>) — public phone | All six | `tel:+441234900700` |
| [src/components/MobileCallBar.tsx](<C:/Users/syeat/Documents/Veridian devlopment/project/src/components/MobileCallBar.tsx>) — Call Now | All six | `tel:+441234900700` |
| [src/components/Hero.tsx](<C:/Users/syeat/Documents/Veridian devlopment/project/src/components/Hero.tsx>) — numbered primary call | Home | `tel:+441234900700` |
| [src/components/Coverage.tsx](<C:/Users/syeat/Documents/Veridian devlopment/project/src/components/Coverage.tsx>) — Check Availability | Home | `tel:+441234900700` |
| [src/components/ReassuranceStrip.tsx](<C:/Users/syeat/Documents/Veridian devlopment/project/src/components/ReassuranceStrip.tsx>) — Call Now | Home | `tel:+441234900700` |
| [src/components/Services.tsx](<C:/Users/syeat/Documents/Veridian devlopment/project/src/components/Services.tsx>) — Call to Discuss | Home | `tel:+441234900700` |
| [src/components/HowItWorks.tsx](<C:/Users/syeat/Documents/Veridian devlopment/project/src/components/HowItWorks.tsx>) — Call to Get Started | Home | `tel:+441234900700` |
| [src/components/FAQs.tsx](<C:/Users/syeat/Documents/Veridian devlopment/project/src/components/FAQs.tsx>) — number inside expanded answer | Home | `tel:+441234900700` |
| [src/components/FAQs.tsx](<C:/Users/syeat/Documents/Veridian devlopment/project/src/components/FAQs.tsx>) — Call Us, We're Happy to Help | Home | `tel:+441234900700` |
| [src/components/ContactSection.tsx](<C:/Users/syeat/Documents/Veridian devlopment/project/src/components/ContactSection.tsx>) — final numbered call | Home | `tel:+441234900700` |
| [src/components/ContactSection.tsx](<C:/Users/syeat/Documents/Veridian devlopment/project/src/components/ContactSection.tsx>) — callback failure call | Home + Birmingham, conditional | `tel:+441234900700` |
| [src/components/ContactSection.tsx](<C:/Users/syeat/Documents/Veridian devlopment/project/src/components/ContactSection.tsx>) — callback success Call Instead | Home + Birmingham, conditional | `tel:+441234900700` |
| [src/pages/LocationPage.tsx](<C:/Users/syeat/Documents/Veridian devlopment/project/src/pages/LocationPage.tsx>) — Birmingham hero | Birmingham | `tel:+441234900700` |
| [src/pages/LocationPage.tsx](<C:/Users/syeat/Documents/Veridian devlopment/project/src/pages/LocationPage.tsx>) — Birmingham final CTA | Birmingham | `tel:+441234900700` |
| [src/pages/LegalPage.tsx](<C:/Users/syeat/Documents/Veridian devlopment/project/src/pages/LegalPage.tsx>) — terms contact + bottom CTA | Terms, two anchors | `tel:+441234900700` each |
| [src/pages/LegalPage.tsx](<C:/Users/syeat/Documents/Veridian devlopment/project/src/pages/LegalPage.tsx>) — guarantee contact + bottom CTA | Guarantee, two anchors | `tel:+441234900700` each |
| [src/pages/LegalPage.tsx](<C:/Users/syeat/Documents/Veridian devlopment/project/src/pages/LegalPage.tsx>) — privacy contact, rights contact + bottom CTA | Privacy, three anchors | `tel:+441234900700` each |
| [src/pages/NotFoundPage.tsx](<C:/Users/syeat/Documents/Veridian devlopment/project/src/pages/NotFoundPage.tsx>) — numbered call | Custom 404 | `tel:+441234900700` |

Source and rendered destinations contain the confirmed public phone and customer WhatsApp destinations; no obsolete/private driver contact was found in the audited public code/contact surfaces. Schema.org organization metadata and no-JavaScript HTML deliberately retain the genuine business number, not a transient Google number. Native iOS/Android dialler handoff and actual ringing are **UNVERIFIED**, despite the correct international-format hrefs.

## 3. Website-call tracking correction

**FAIL live capability gap; PASS local correction:** the deployed website-call config has no `phone_conversion_callback`. Its React call links are hardwired to the business number. A real forwarding allocation was not obtained, so an actual displayed-versus-dialled mismatch is **UNVERIFIED**; the absence of shared display/href handling is verified. Google's mobile guidance specifically calls for updating both. [Google website-call setup](https://support.google.com/google-ads/answer/6095883?hl=en).

Preserved identifiers:

- Base tag: **`AW-18493914811`**.
- Website-call config: **`AW-18493914811/BRTACI7HpZUdELv9yvJE`**.
- `phone_conversion_number`: **`01234 900 700`**, matching the public display.

The new callback publishes a valid Google-supplied number to one memory-only external store. `useSyncExternalStore`, shared `CallLink` and `PhoneNumber` components update all numbered displays, number-bearing accessible labels and telephone destinations together, including subsequently mounted callback controls. Generic labels such as “Call Now” keep their wording. Existing click event names/source fields remain unchanged.

Both callback arguments must represent the same syntactically valid phone number. Missing, malformed or mismatched arguments restore the genuine fallback. Consent is checked when the callback executes, including late callbacks. Withdrawal resets the number immediately before the existing unload/reload path. No number is invented, permanently cached by application code or derived from a URL parameter. Google's own consented call-number cache behaviour was not replaced.

**PASS simulated:** the isolated test fixture uses fictional UK `07700 900123` / `tel:+447700900123`, never dialled or sent to Google. All six page types, header/footer/sticky links, FAQ rerenders, callback success/failure mounts, invalid callbacks, withdrawal and same-document React page rerenders stay consistent. This proves state handling, not that the fixture is a Google forwarding number.

**PASS navigation:** actual header links use full-document navigation, not a SPA router. Home/Birmingham and back/forward content were checked. A new document safely starts with the business number until Google supplies a number; a restored document keeps display and href consistent. A separate test harness rerenders the real App across home, Birmingham and privacy in one JS realm and retains the supplied number. It does not claim production `pushState` alone performs routing.

| Conversion type | What establishes it | Audit conclusion |
|---|---|---|
| A — call directly from an advert call asset | Google call-asset/action setup and an actual connected call | Account reporting enabled; delivery/action details still UNVERIFIED |
| B — call to a website Google forwarding number | Eligible Ads visit, consent, allocation, same displayed/dialled number and an actual call meeting action settings | Local code now supports the documented callback; end-to-end result UNVERIFIED |
| C — mobile website phone-link click | A click interaction, if separately configured for measurement | Existing `call_click` is a UI event; not evidence of a connected call |

No new `gtag('event', 'conversion', ...)`, conversion label or tracking installation was added. WhatsApp clicks are not bookings. Callback success events occur only after a response accepted by the existing submission contract, not on button click. Browser contact tests intercept external handoffs and form requests.

## 4. Consent, CSP and privacy

**PASS live and local consent behaviour on both main pages:** fresh/rejected visitors made no observed Google advertising requests or commands; Reject persisted. Accept loaded exactly one base library and the existing website-call config. Repeated Accept did not duplicate them. Saved acceptance restored correctly. Withdrawal stored rejection, queued denied signals, removed readable first-party Ads cookies and reloaded; no subsequent advertising requests occurred in the new rejected document. Contact links and an intercepted callback remained usable without consent. Existing expiry, invalid storage, cross-tab withdrawal and restoration also pass unit tests.

The real Google libraries, not mocks, returned HTTP 200 after consent: `googletagmanager.com/gtag/js`, `gstatic.com/wcm/loader.js`, `gstatic.com/call-tracking/call-tracking_9.js`. Defaults precede configs; only `ad_storage` and `ad_user_data` are granted, with analytics and personalisation denied. No paid advert was opened. The basic-mode implementation remains consistent with [Google's consent guidance](https://developers.google.com/tag-platform/security/guides/consent).

**PASS Google-related CSP in the tested direct-visit flows:** no Google CSP violation was observed live or locally. The CSP was not weakened. A real eligible forwarding session could exercise additional traffic; that remains part of the authorised Ads test.

**FAIL live strict no-console-error check:** Netlify injects `/.netlify/scripts/hud?variant=public` outside the repository. Its `nl-badge-frame` srcdoc contains an inline script with SHA-256 `BkKP2XO6WOEc3kXOiLr2ZoY83hamalKjPY9xBcbXVuw=`, exactly matching the blocked-script console message at `about:srcdoc`, line 84. The organization JSON-LD hash matches the allowed CSP hash, so it is not the cause. The live real-Google suite completed the consent assertions but correctly failed its final zero-console-error assertion. That failure has not been suppressed or reported as a clean pass.

Recommended owner action: Netlify project → **Project configuration → General → Powered by Netlify badge → Off → Save**, then rerun live QA. Netlify says this applies on the next request without redeployment. Do not add unsafe inline execution or a brittle vendor-script hash to permit an unnecessary badge. This is a provider-setting action, not a local-code omission; no setting was changed. Netlify documents the exact CSP incompatibility and says it does not affect the rest of the site. [Netlify badge documentation](https://docs.netlify.com/manage/projects/powered-by-netlify-badge/).

**PASS limited policy consistency:** `/privacy` now accurately describes installed consent-gated Google Ads measurement, optional storage, the preference duration, withdrawal and manual WhatsApp/GPS sharing. No contradictory “advertising tags are not installed” statement was found. No privacy wording needed changing in this audit.

**UNVERIFIED existing owner/legal facts:** the repository still explicitly lacks confirmed legal proprietor/controller identity, geographic correspondence address and genuine written contact email. Existing owner notes also require actual lawful bases, retention/recipient/transfer arrangements, operator and enquiry handling, cancellation/refund process, and the image-host security-cookie assessment. These are retained owner-input items in [docs/LEGAL_OWNER_INPUT.md](<C:/Users/syeat/Documents/Veridian devlopment/project/docs/LEGAL_OWNER_INPUT.md>), not newly invented code requirements. Supply and review those facts before representing the site as fully launch-compliant. A consent test is not independent legal certification. Withdrawing consent deliberately reloads the page, as disclosed; an unsent callback draft can be lost, so do not withdraw midway through the acceptance test form.

## 5. Read-only Google Ads account evidence

Used the [Windsor.ai skill](C:/Users/syeat/.codex/plugins/cache/openai-curated-remote/windsor-ai/4.0.0/skills/windsor/SKILL.md) for read-only discovery and reports, account **894-512-7078, teleport recovery**. Snapshot queried on 17 October, `this_yearT`, including inactive entities. Connector caching may apply; no forced uncached refresh or mutation was requested. Raw returned data is in [qa-artifacts/launch-audit/ads-account.json](<C:/Users/syeat/Documents/Veridian devlopment/project/qa-artifacts/launch-audit/ads-account.json>).

**PASS connector corroboration:** Birmingham campaign `24344532420` is PAUSED. Ad `827955294647`, pointing to the homepage, has 11 clicks, 51.46 recorded spend and zero conversions. Birmingham final-URL ad `828373746181` has zero clicks/spend/conversions. This matches the owner's £51.46 history; it provides no evidence that the new page has yet converted paid traffic. Auto-tagging, account call reporting and call conversion reporting return True. The account-level call action is `customers/8945127078/conversionActions/179`.

Two returned GB call assets use `01234 900 700` and `01234 900700` — the same digits. One references action 179 using account-level call-conversion settings; the other returned null action/reporting fields. Their current associations, schedules, approval and delivery were not established by this report.

**UNVERIFIED action mapping:** the account's returned global tag snippet matches installed `AW-18493914811`. A separate `conversion_tracking_id` field returns `55481744433`, with conversion tracking managed by this account and cross-account ID 0. Do not replace the installed ID on that fact alone: the returned global snippet supports preserving it. Confirm the actual website-call action's Tag setup ID/label/destination mapping. Conversion-action detail queries returned zero rows; that is an access/report limitation, not proof there are no conversion actions.

Owner must provide read-only access or screenshots of these exact screens, with sensitive credentials omitted:

1. **Goals → Conversions → Summary → website-call action → Settings and Tag setup / phone snippet:** action name/source/type, enabled/status/diagnostics, ID and label, displayed number, conversion duration threshold, count/window and primary/secondary optimisation setting. Match the existing installed config exactly.
2. The corresponding **Calls from ads action**, including action 179's identity and duration/goal settings. Keep A separate from website calls B and any phone-click action C.
3. **Birmingham campaign → Settings → Goals:** account-default versus campaign-specific goals and the actual included call action. Secondary actions may appear in All conversions without contributing to the main Conversions column, depending on goal configuration.
4. **Assets → Call assets**, filtered to Birmingham: associations, GB phone, approval, schedule and call reporting/conversion selection. Enabled account reporting alone does not establish asset delivery.
5. **Reports / Call details** and campaign/ad reporting segmented by conversion action, with Conversions and All conversions and the appropriate test date/time zone. Also show the website-call action's recent status/diagnostics after the controlled test.

### One authorised real advertising test — not performed

1. First pass the ordinary phone-delivery test below, review the owner/privacy facts, deploy the approved patch and confirm live redirects, consent and the callback function. Verify the account/action screens above. The campaign stays paused until the owner explicitly authorises the test spend and temporary serving arrangement.
2. Agree one tester, one legitimate eligible Ads-originated visit, a spending limit and an available call receiver. Do not repeatedly search/click your own adverts or create a fake enquiry. Use a fresh test browser with no prior rejection, note time/device/campaign/ad and obtain the visit only under that explicit approval. A direct visit, Tag Assistant check or manually invented `gclid` cannot substitute for eligible traffic.
3. On the actual landing page, choose Accept advertising voluntarily. Check consent signals, one base tag, call config and browser console/network. Confirm a real Google-supplied forwarding number appears. If none is allocated, stop and investigate action/tag eligibility; do not manufacture a number or continue claiming B is verified.
4. Compare visible number, accessible label and actual `tel:` destination at hero, header, footer, sticky bar and final CTA; national and international formats must represent the same digits. Open an accordion/mobile menu, navigate and return, then recheck. The native dialler must show that same forwarding destination.
5. Place the single agreed call to the genuine allocated number. Receiver confirms SwitchboardFREE rings, answers, and maintains two-way audio for several minutes and longer than the action's **verified configured duration threshold**. Record the time/duration/outcome without publishing the caller's personal details. Do not call the fictional automated-test fixture.
6. Receiver checks SwitchboardFREE call records. After Google's normal processing delay, inspect Call details plus the correct website-call action and Conversions/All conversions. Check status, duration threshold, date/time zone, attribution window and primary/secondary/campaign goals if a connected call is not counted. The paid click itself, `call_click` event or call-asset setting does not complete this proof. Record whether the result is a type-B call/conversion rather than A or C.
7. Restore the owner's agreed campaign state and document the outcome; any campaign change still requires explicit authorisation. No such steps were executed by this audit.

## 6. SwitchboardFREE acceptance and missed-call risks

**UNVERIFIED:** no physical phone, receiving app/account, inbound call, two-way audio, voicemail or notification was available to this audit. Browser tests cannot establish them. Provider settings were not inspected or changed.

Owner/tester acceptance matrix: real iPhone and Android; Wi-Fi and mobile data; both a normal business-number call and, separately, an eligible Google-forwarding call when allocated. Record OS/app version, receiving-device connection, locked/foreground/background state, expected/dialled number, ring/answer time, connected duration, two-way audio, missed-call alert and voicemail receipt. For the ordinary test, use a rejected-consent/direct visit so fallback calling is independently established.

For each agreed test: open public Birmingham → tap Call → inspect native dialler **01234 900 700** (or the genuinely allocated Google number in its separate test) → place call → verify the SwitchboardFREE **Phone app** rings → answer for several minutes → verify speech in both directions → repeat on mobile data. Repeat relevant receiver tests with screen locked/backgrounded. Arrange one intentionally unanswered call and one voicemail with the owner, then confirm logs, notification and responsible follow-up. Never infer live delivery from a mock browser response.

Check these plausible failure points on the real receiving device/account: weak or changing Wi-Fi/mobile connection; notification/call permissions; Focus/Do Not Disturb; battery/background restrictions; logged-out/unregistered receiving user; account number-to-user/redirect routing; hours/bank-holiday closed state; ring timeout/voicemail destination; concurrent call handling. These are **risks to test, not diagnosed faults**. Distinguish the Phone app from the Management app. SwitchboardFREE documents those separate roles and voicemail/missed-call access. [Official apps](https://www.switchboardfree.co.uk/app/).

Practical fallback for owner approval: verify/enable the provider's **missed-call email alerts** to a genuine monitored business mailbox, appoint a duty responder and test prompt callback handling. Confirm voicemail reaches that monitored recipient. If supported by the actual subscription, consider a second tested redirect recipient/device; keep internal destinations private. These are documented provider capabilities, not claims that Teleport already has them enabled. Do not buy a service or change routing automatically. [Missed-call alerts](https://www.switchboardfree.co.uk/missed-call-email-alerts), [hours and voicemail](https://www.switchboardfree.co.uk/open-close-your-phone-lines).

## 7. WhatsApp, callbacks and mobile accessibility

**PASS link/configuration checks:** all ordinary WhatsApp anchors use `https://wa.me/447827079669`. Home hero/final/sticky retain the generic recovery draft. Birmingham hero/final/sticky all decode to the exact city message:

```text
Hi Teleport Recovery, I need vehicle recovery in Birmingham.

Pickup postcode:
Destination:
Vehicle:
Is it urgent?:

Could I please get a quote and estimated arrival time?
```

No automatic send or GPS capture occurs on ordinary WhatsApp links. The explicit home coverage location feature retains bounded permission requests and manual-location fallbacks; existing simulated success/denied/unavailable/timeout/coarse/deadline tests pass. **UNVERIFIED:** actual WhatsApp app/web handoff, manual send and business receipt on physical devices. Those require an owner-approved test message, not a fabricated recovery enquiry.

**PASS callback contract/UI:** required fields and malformed numbers block submission; duplicate requests are locked; server/offline/unprocessed-HTML failures retain details and show focused honest errors; retry works; simulated confirmed success shows “Callback requested” and emits one source-only UI event only with consent. Live and local browser runs intercepted all POSTs. No real enquiry was submitted.

**UNVERIFIED actual Netlify receipt/notification:** `/__forms/callback.html` is reachable and its form name/field blueprint match the submission contract; that GET does not prove POST processing. Owner-approved acceptance: submit clearly labelled test details on live home and Birmingham, confirm exactly one record in Netlify Forms **recovery-callback**, verify the designated notification/responder receives it, and remove test data under the agreed process. Inspect spam classification if missing. Do not count a button click or static 200 page as a received enquiry.

**PASS tested responsive/accessibility scope:** existing browser suites cover 320, 390, 768, 1180 and 1440 widths, plus 200% text, text-spacing and 320-pixel reflow. Coverage expansion uses keyboard and touch; FAQ collapsed panels, skip link, menu Escape/focus return, reduced motion, visible/unobscured keyboard focus and legal navigation pass. Consent Accept/Reject have equal prominence and at least 44-pixel targets in tested layouts; the notice sits above the sticky contacts and does not obscure the hero call CTA. Historical homepage text/DOM attributes, header/footer content and metadata comparisons pass at all five widths; serialization comparison ignores only attribute order and the pre-existing empty style normalisation. Design, CSS and service claims were not changed.

Live first screens at **390×844 and 412×915** were rendered and visually inspected. No horizontal overflow or broken observed images; call and WhatsApp remain usable with the notice visible. Live observed LCP samples were approximately 2.18–2.45 seconds on home and 0.33–0.58 seconds on Birmingham in this desktop-browser environment, with mixed cache state. These are spot observations, not field Core Web Vitals, throttled mobile results or a speed guarantee. Local production JS is about 70.16 kB gzip and CSS 7.87 kB gzip. No package/image/animation changes were made.

**UNVERIFIED:** real Safari/iOS and Android browser/dialler behaviour, VoiceOver/TalkBack announcements and physical-device/background app behaviour. Headless Edge viewport emulation and accessible-name inspection do not prove those. No broad WCAG certification is claimed.

## 8. Exact local changes

The earlier uncommitted trailing-slash patch was retained and extended, not overwritten. All paths below are relative to the workspace stated at the top.

| File | Purpose / provenance |
|---|---|
| [netlify.toml](<C:/Users/syeat/Documents/Veridian devlopment/project/netlify.toml>) | Existing pending Edge declaration now also scopes the short aliases; existing rewrites/domain rules/Pretty URLs retained |
| [netlify/edge-functions/canonical-birmingham.js](<C:/Users/syeat/Documents/Veridian devlopment/project/netlify/edge-functions/canonical-birmingham.js>) | Existing pending slash handler extended to both short aliases; query-preserving 301 |
| [src/lib/phoneNumber.ts](<C:/Users/syeat/Documents/Veridian devlopment/project/src/lib/phoneNumber.ts>) | New validated, subscribable, memory-only display/dial state with genuine fallback |
| [src/hooks/usePhoneNumber.ts](<C:/Users/syeat/Documents/Veridian devlopment/project/src/hooks/usePhoneNumber.ts>) | New React external-store subscription |
| [src/components/CallLink.tsx](<C:/Users/syeat/Documents/Veridian devlopment/project/src/components/CallLink.tsx>) | Shared dynamic href and number-bearing accessible label; exported display component; original UI event preserved |
| [src/components/Header.tsx](<C:/Users/syeat/Documents/Veridian devlopment/project/src/components/Header.tsx>) | Dynamic numbered display, same layout/labels |
| [src/components/Hero.tsx](<C:/Users/syeat/Documents/Veridian devlopment/project/src/components/Hero.tsx>) | Dynamic numbered display, same homepage content/layout |
| [src/components/Footer.tsx](<C:/Users/syeat/Documents/Veridian devlopment/project/src/components/Footer.tsx>) | Dynamic numbered display, same content/layout |
| [src/components/FAQs.tsx](<C:/Users/syeat/Documents/Veridian devlopment/project/src/components/FAQs.tsx>) | Dynamic number in existing answer link; canonical split delimiter retained |
| [src/components/ContactSection.tsx](<C:/Users/syeat/Documents/Veridian devlopment/project/src/components/ContactSection.tsx>) | Shared final/success/failure call links and number displays; existing callback process retained |
| [src/pages/LocationPage.tsx](<C:/Users/syeat/Documents/Veridian devlopment/project/src/pages/LocationPage.tsx>) | Shared dynamic city hero/final number; no city redesign/content change |
| [src/pages/LegalPage.tsx](<C:/Users/syeat/Documents/Veridian devlopment/project/src/pages/LegalPage.tsx>) | Shared dynamic contact links only; legal wording retained |
| [src/pages/NotFoundPage.tsx](<C:/Users/syeat/Documents/Veridian devlopment/project/src/pages/NotFoundPage.tsx>) | Dynamic number in existing call link |
| [src/lib/advertisingConsent.ts](<C:/Users/syeat/Documents/Veridian devlopment/project/src/lib/advertisingConsent.ts>) | Existing website-call config gains guarded Google callback; reset on withdrawal |
| [tests/phone-number.test.mjs](<C:/Users/syeat/Documents/Veridian devlopment/project/tests/phone-number.test.mjs>) | New state/validation/subscription/shared-source regression tests |
| [tests/advertising-consent.test.mjs](<C:/Users/syeat/Documents/Veridian devlopment/project/tests/advertising-consent.test.mjs>) | Real module callback test, including late callback after withdrawal |
| [tests/locations.test.mjs](<C:/Users/syeat/Documents/Veridian devlopment/project/tests/locations.test.mjs>) | Existing pending routing tests extended to aliases and attribution parameters |
| [scripts/launch-browser-qa.mjs](<C:/Users/syeat/Documents/Veridian devlopment/project/scripts/launch-browser-qa.mjs>) | New live fallback/contact inventory and isolated local forwarding/React/navigation regressions; intercepted submissions |
| [scripts/launch-http-qa.mjs](<C:/Users/syeat/Documents/Veridian devlopment/project/scripts/launch-http-qa.mjs>) | New reproducible live status/redirect/query/metadata checks without executing Ads |
| [scripts/consent-browser-qa.mjs](<C:/Users/syeat/Documents/Veridian devlopment/project/scripts/consent-browser-qa.mjs>) | Separate configurable evidence directories and origin/time labels for live versus local real-library tests |
| [scripts/location-browser-qa.mjs](<C:/Users/syeat/Documents/Veridian devlopment/project/scripts/location-browser-qa.mjs>) | Existing pending routing QA extended to aliases; meaningful homepage comparison ignores HTML attribute order |
| [scripts/serve-production.mjs](<C:/Users/syeat/Documents/Veridian devlopment/project/scripts/serve-production.mjs>) | Retained prior pending patch: execute the actual Edge handler locally before static serving |
| [docs/BIRMINGHAM_LAUNCH_REVIEW.md](<C:/Users/syeat/Documents/Veridian devlopment/project/docs/BIRMINGHAM_LAUNCH_REVIEW.md>) | Prior pending routing handoff notes retained; this report supplies the current audit outcome |
| [docs/LAUNCH_AUDIT_2026-10-17.md](<C:/Users/syeat/Documents/Veridian devlopment/project/docs/LAUNCH_AUDIT_2026-10-17.md>) | This single launch audit report |

No changes to packages, Vite configuration, App routing, city configuration, styling, original home content/claims, Ads identifiers or provider settings. Test artifacts are ignored under `qa-artifacts/` and contain no real submitted customer enquiry.

## 9. Verification results and evidence

| Check | Result | Evidence / scope |
|---|---|---|
| `npm test` | PASS — 38/38 | Node unit suite; routing, consent, callback, WhatsApp and forwarding |
| `npm run typecheck` | PASS | Both existing TS projects |
| `npm run lint` | PASS | Existing ESLint configuration |
| `npm run build` | PASS | Vite production output; current bundle `index-0mg9Fi9O.js` |
| `npm run qa:browser` | PASS | [qa-artifacts/browser-qa.json](<C:/Users/syeat/Documents/Veridian devlopment/project/qa-artifacts/browser-qa.json>); original UI/legal/callback/GPS regressions; Google isolated |
| `node scripts/location-browser-qa.mjs` | PASS | [qa-artifacts/location-pages/master-verification.json](<C:/Users/syeat/Documents/Veridian devlopment/project/qa-artifacts/location-pages/master-verification.json>); 8 layout variants, 14 routes, 5 baseline comparisons, GET/HEAD aliases and queries, keyboard/touch |
| `node scripts/launch-browser-qa.mjs` local | PASS | [qa-artifacts/launch-audit/local-contact-browser.json](<C:/Users/syeat/Documents/Veridian devlopment/project/qa-artifacts/launch-audit/local-contact-browser.json>); 6 page types, simulated forwarding, conditional callback mounts, same-realm React and actual back/forward |
| Same launch browser script with live `QA_URL` | PASS within stated contact scope | [qa-artifacts/launch-audit/live-contact-browser.json](<C:/Users/syeat/Documents/Veridian devlopment/project/qa-artifacts/launch-audit/live-contact-browser.json>); real rendered fallback links/WhatsApp/callback UI, Google isolated; not a strict live console/CSP test |
| `node scripts/consent-browser-qa.mjs` local | PASS, real Google | [qa-artifacts/consent/verification.json](<C:/Users/syeat/Documents/Veridian devlopment/project/qa-artifacts/consent/verification.json>); both pages, all consent states, script responses, zero CSP/application/console errors |
| Same consent script live | FAIL strict console assertion | [qa-artifacts/launch-audit/live-consent/verification.json](<C:/Users/syeat/Documents/Veridian devlopment/project/qa-artifacts/launch-audit/live-consent/verification.json>); all consent flows completed, Google libraries 200; Netlify badge inline CSP error |
| `node scripts/launch-http-qa.mjs` | PASS evidence capture; observed alias FAILs retained | [qa-artifacts/launch-audit/live-urls.json](<C:/Users/syeat/Documents/Veridian devlopment/project/qa-artifacts/launch-audit/live-urls.json>); 20 URL chains plus discovery endpoints |
| Live mobile/image/inline-script diagnostics | PASS evidence; badge defect confirmed | [qa-artifacts/launch-audit/live-mobile-diagnostics.json](<C:/Users/syeat/Documents/Veridian devlopment/project/qa-artifacts/launch-audit/live-mobile-diagnostics.json>), `live-inline-scripts.json`, `live-home-412.png`, `live-birmingham-390.png` |
| `git diff --check` | PASS | No patch whitespace errors |
| Physical calls, actual callback/WhatsApp receipt, live eligible forwarding/conversion | UNVERIFIED | No real submissions, calls, paid clicks or synthetic conversions performed |

Thus **all local suites pass; the combined live/local audit is not all green**. The live strict suite remains failed for the identified Netlify badge error, and the live alias/forwarding corrections remain undeployed.

Local preview: from the workspace run `npm run build`, then `npm run qa:serve` and open **http://127.0.0.1:4173/recovery/birmingham**. The QA server is currently running on 4173. It intentionally cannot deliver Netlify Forms. Browser scripts need Playwright supplied by the existing runtime through `PLAYWRIGHT_MODULE`; no dependency was installed.

## 10. Required acceptance order and final decisions

1. **Owner review:** approve this targeted patch; supply/review the existing business/controller/privacy facts. Confirm the actual website-call Tag setup and goal/duration settings; preserve identifiers until their mapping is established.
2. **Owner/provider action:** switch off the unwanted Netlify badge and rerun live consent QA. Verify SwitchboardFREE receiving user/routing/hours and monitored missed-call/voicemail handling without silently changing them.
3. **Normal real-phone tests:** complete the iPhone/Android Wi-Fi/mobile-data matrix against the existing public number; verify native dialler, ring, several-minute two-way audio, background/locked receiving state and missed-call/voicemail fallback.
4. **Authorised preview/deployment:** publish the approved repository build including the Edge Function; verify aliases/slash 301s, preserved queries, home/legal/canonical behaviour, real Google CSP/consent and new callback presence on production. No automatic deployment has occurred.
5. **Authorised contact acceptance:** check real Netlify callback record/notification and WhatsApp app/web draft/send/receipt; test real assistive technology/mobile behaviour. Appoint who responds to each channel.
6. **Only with separate spending approval:** perform the one controlled eligible-Ads forwarding/connected-call/report test above. Resolve any action mapping or counting issue before resuming ordinary advertising spend.

**Publishing: NO-GO for declaring a fully accepted public launch today; local targeted corrections are ready for review and controlled deployment.** Outstanding evidence is specific: deployed routing/forwarding behaviour, normal real call delivery and missed-call fallback, actual enquiry receipt, owner/privacy inputs and the known provider badge error. No speculative refactor backlog remains.

**Google Ads spend: NO-GO until publishing gates plus correct conversion-action mapping and genuine type-B forwarding/call attribution are verified.** The 11 historical clicks and zero recorded conversions do not establish whether callers were missed or whether attribution failed. No commit, push, deployment, Ads reactivation, spend or provider-setting mutation was made.
