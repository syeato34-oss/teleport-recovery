# Teleport Recovery deployment and launch checks

Last reviewed: 18 October 2026. V4.1 is local and awaiting owner approval; no deployment was performed. See [V4_1_IMPLEMENTATION_REVIEW.md](V4_1_IMPLEMENTATION_REVIEW.md) and [V4_1_ROUTE_INVENTORY.md](V4_1_ROUTE_INVENTORY.md) for the current release inventory/evidence. The original V4 and launch-audit reports remain historical records.

## Build and route architecture

The site retains its Vite/React application, existing typography, purple identity, truck photography and Teleport favicon. No router package, analytics service or backend is required.

`src/config/business.ts` is the source of public business details. `src/config/routes.ts`, `areas.ts`, `locations.ts` and `recoveryServices.ts` define the authored pages, aliases and geographic relationships. The Vite plugin generates metadata, truthful JSON-LD, robots and sitemap. The existing Pexels truck photograph is retained; its availability remains an external dependency.

`netlify.toml` runs typecheck, lint, production build and tests, then publishes `dist`. Build precedes tests so the generated Edge route manifest matches the current content configuration. No packages were added or upgraded for V4. The build emits:

- 45 canonical HTML pages with actual React-rendered content, distinct metadata, canonical URLs and Open Graph/Twitter metadata, including the advice hub and five source-backed recovery-planning guides. `src/entry-server.tsx` and `scripts/prerender.mjs` use the existing React server API; the client hydrates that HTML.
- `404.html` with noindex metadata. Netlify automatically returns it with HTTP 404 for unknown paths because there is no catch-all SPA 200 rewrite.
- `__forms/callback.html`, an exact static form submission URL with a failure marker.
- `robots.txt`, `sitemap.xml`, `_headers`, exact known-page `_redirects` and `route-manifest.json`.
- `netlify/edge-functions/generated-routes.js`, consumed by `canonical-pages.js`. Include the Edge Function source in a future authorised Git-connected deployment; uploading only `dist` does not establish Edge deployment.

Every authored route has a generated exact static rewrite. The Edge Function permanently normalises known slash/index paths and aliases before static rewriting, retaining query parameters. Birmingham remains `/recovery/birmingham`; `/areas/birmingham` is an alias. Unknown locations receive 404 rather than a generic city page. Netlify normalizes trailing slashes before ordinary redirect matching, so do not add slash-only redirect rules that can loop. Pretty URLs stays disabled for the callback POST endpoint. Deploy previews and branch deployments receive noindex metadata/header and disallow-all robots; canonicals still point to production.

Local Vite dev/preview is not Netlify: it does not apply Netlify redirects, security headers, HTTP 404 handling or Forms processing. Confirm these on a Netlify deploy before launch.

## Netlify account and domain steps — required before launch

1. Connect/deploy this repository with `netlify.toml`; use the publish directory `dist`.
2. Assign `teleportrecovery.co.uk` as the primary custom domain and `www.teleportrecovery.co.uk` as its domain alias, update DNS and verify valid HTTPS certificates. Enable Netlify's HTTPS enforcement. The code redirects HTTP and www traffic to `https://teleportrecovery.co.uk`; those domains must be assigned to the project for domain redirects to work.
3. In **Forms**, select **Enable form detection**, then redeploy. A local build alone cannot register the form. Verify `recovery-callback` appears with fields `name`, `phone`, `location`, `details` and its `bot-field` honeypot. The static form blueprint in `index.html` matches the React form exactly.
4. In **Forms > Submission notifications**, add a notification to a real, monitored owner-selected destination and test receipt. There is no invented public support email or automatic notification recipient in code.
5. Submit a controlled callback from the deployed site. Confirm the honest success state, the exact field values in the Netlify dashboard and notification delivery. Check **Spam** if a legitimate test is filtered. Form success confirms the platform response; it does not guarantee a particular callback time.
6. Confirm who monitors requests, and agree a retention/deletion process for callback personal data and notification copies. Review the Netlify account's Forms usage settings for its actual plan.

The owner must complete the legal identity and privacy-operation inputs in `docs/LEGAL_OWNER_INPUT.md` and review the policies before publishing. These code changes do not establish complete legal compliance.

## Callback handling

The visible React form sends an `application/x-www-form-urlencoded` POST to `/__forms/callback.html` with `form-name=recovery-callback`, `name`, `phone`, `location`, `details` and an empty `bot-field`. Netlify detects the static HTML blueprint at deployment and handles submissions, including its honeypot/spam filtering.

The exact static endpoint has no route rewrite or redirect that could consume or convert the POST. If Forms is not configured and static HTML comes back instead, the response contains `data-callback-unprocessed="true"`; the helper rejects it. It also rejects Vite SPA bootstrap HTML, non-success HTTP responses, network errors and timeouts. The UI then says it could not confirm the request and offers the real telephone link, retaining entered details. Duplicate clicks are locked while sending. Tracking receives a callback event only after the helper accepts a successful platform response; no personal form data is included.

Test a failed request by blocking the endpoint or taking the browser offline. Confirm it does not announce success, retains the details and permits retry. Local submission is expected to fail honestly because Vite does not run Netlify Forms. A real production submission and dashboard persistence cannot be verified without a deployed project and account access.

## Security and asset checks

Netlify configuration sets `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY` and a Permissions Policy disabling unused camera, microphone and payment browser features. Same-origin geolocation is allowed for the user-initiated WhatsApp pickup-location action; browser permission is still required. Hashed Vite assets have immutable caching.

The generated `_headers` preserves the enforced Content Security Policy and existing consent-gated Google Ads origins/configuration. It hashes each route's generated JSON-LD without enabling inline executable scripts or eval. Existing image/font permissions and inline-style allowance are retained. No new advertising IDs, conversion actions, analytics services or secrets were introduced.

Before launch, inspect actual Netlify document response headers and browser console. Confirm Google Fonts, both Pexels photographs, all legal routes and the callback POST load without CSP violations. A standard Vite preview cannot verify Netlify headers. Future analytics, embeds, new image/font origins or Netlify snippet injection require an intentional CSP review before activation.

Verify all 45 canonical pages and the sitemap, including homepage, Birmingham, Milton Keynes, directory, services and advice. Directory-only entries have regional anchors, not standalone pages in the sitemap. Confirm unknown URLs/assets return HTTP 404. Check HTTP/www and slash/alias redirects with advertising queries, without loops. Confirm the callback endpoint and 404 remain excluded from indexing. Repeat controlled form receipt testing after routing or Netlify processing changes.

## Primary references

- [Netlify Forms setup](https://docs.netlify.com/manage/forms/setup/) — deployment-time static detection and URL-encoded JavaScript submissions.
- [Netlify spam filters](https://docs.netlify.com/manage/forms/spam-filters/) — matching honeypot field and spam review.
- [Netlify form notifications](https://docs.netlify.com/manage/forms/notifications/) — monitored destination setup.
- [Netlify form troubleshooting support guide](https://answers.netlify.com/t/support-guide-form-problems-form-debugging-404-when-submitting/92) — endpoint redirects/rewrites can consume form submissions.
- [Netlify redirect options](https://docs.netlify.com/manage/routing/redirects/redirect-options/) — automatic `404.html`, forced static rewrites, trailing-slash normalization and assigned-domain redirects.
- [Netlify file-based configuration](https://docs.netlify.com/build/configure-builds/file-based-configuration/) — build and Pretty URLs settings.
- [Netlify custom headers](https://docs.netlify.com/manage/routing/headers/) and [Content Security Policy](https://docs.netlify.com/manage/security/content-security-policy/) — static header configuration.
