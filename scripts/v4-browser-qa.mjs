// Local production QA. No form delivery, real phone calls or WhatsApp messages.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { resolve } from 'node:path';
import { configModule } from './config-module.mjs';
const { siteRoutes, routeAliases } = await import(configModule('src/config/routes.ts'));
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const origin = process.env.QA_URL ?? 'http://127.0.0.1:4173';
const output = resolve(process.env.QA_ARTIFACT_DIR ?? 'qa-artifacts/v4');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({ reducedMotion: 'reduce' });
await context.addInitScript(() => {
  window.qaGps = 0; window.qaCsp = [];
  Object.defineProperty(navigator, 'geolocation', { value: { getCurrentPosition() { window.qaGps++; } }, configurable: true });
  document.addEventListener('securitypolicyviolation', (event) => window.qaCsp.push(event.violatedDirective + ': ' + event.blockedURI));
  window.qaLcp = 0;
  new PerformanceObserver((list) => { window.qaLcp = list.getEntries().at(-1).startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
});
const page = await context.newPage();
const results = { routes: [], links: 0, redirects: 0, layouts: [], errors: [], advertisingBeforeConsent: [], performance: [], protectedFiles: [] };
const docs = new Map();
page.on('pageerror', (error) => results.errors.push(error.message));
page.on('console', (message) => { if (message.type() === 'error' && !message.text().includes('status of 404')) results.errors.push(message.text()); });
page.on('request', (request) => { if (/googletagmanager|googleadservices|doubleclick|googlesyndication/.test(request.url())) results.advertisingBeforeConsent.push(request.url()); });
async function visit(path) {
  const response = await page.goto(origin + path, { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200, path);
  return response;
}
async function layout(path, width, variant = 'normal') {
  const metrics = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth,
    h1: document.querySelectorAll('h1').length, gps: window.qaGps, csp: window.qaCsp,
    names: [...document.querySelectorAll('button,a[href]')].filter((el) => el.getClientRects().length).map((el) => (el.getAttribute('aria-label') || el.textContent).trim()),
    phones: [...document.querySelectorAll('a[href^="tel:"]')].map((el) => el.getAttribute('href')) }));
  assert.ok(metrics.scroll <= metrics.width, `${path} ${width} ${variant}: horizontal overflow`);
  assert.equal(metrics.h1, 1); assert.equal(metrics.gps, 0); assert.deepEqual(metrics.csp, []);
  assert.ok(metrics.names.every(Boolean), `${path}: unnamed visible control`);
  assert.ok(metrics.phones.every((href) => href === 'tel:+441234900700'));
  results.layouts.push({ path, width, variant, passed: true });
}
try {
  // Parse network HTML separately from the hydrated DOM; this catches empty-shell regressions.
  for (const route of siteRoutes) {
    const response = await visit(route.path);
    const html = await response.text();
    const raw = await page.evaluate((html) => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return { title: doc.title, h1s: [...doc.querySelectorAll('h1')].map((el) => el.textContent), canonical: doc.querySelector('link[rel="canonical"]').getAttribute('href'),
        description: doc.querySelector('meta[name="description"]').content, robots: doc.querySelector('meta[name="robots"]').content,
        ids: [...doc.querySelectorAll('[id]')].map((el) => el.id), links: [...doc.querySelectorAll('a[href]')].map((el) => el.getAttribute('href')),
        schema: [...doc.querySelectorAll('script[type="application/ld+json"]')].map((el) => el.textContent) };
    }, html);
    assert.equal(raw.h1s.length, 1, `${route.path}: no real initial H1`);
    assert.ok(raw.h1s[0].trim().length > 5);
    assert.equal(raw.canonical, 'https://teleportrecovery.co.uk' + route.path);
    assert.equal(raw.robots, 'index, follow');
    assert.equal(new Set(raw.ids).size, raw.ids.length, `${route.path}: duplicate IDs`);
    assert.equal(await page.title(), raw.title);
    if (route.kind !== 'legal') { assert.equal(raw.title, route.title); assert.equal(raw.description, route.description); }
    for (const json of raw.schema) {
      JSON.parse(json);
      const hash = "'sha256-" + createHash('sha256').update(json).digest('base64') + "'";
      assert.ok(response.headers()['content-security-policy'].includes(hash), `${route.path}: schema CSP hash`);
    }
    assert.equal(await page.locator('#teleport-google-ads').count(), 0);
    assert.equal(await page.evaluate(() => window.qaGps), 0);
    docs.set(route.path, raw);
    results.routes.push({ path: route.path, rawHtmlBytes: Buffer.byteLength(html), rawHtmlGzipBytes: gzipSync(html).length, title: raw.title, initialH1: raw.h1s[0] });
    if (['/', '/areas', '/areas/milton-keynes', '/recovery/birmingham'].includes(route.path)) results.performance.push(await page.evaluate((path) => ({ path, localLcpMs: window.qaLcp, navigationMs: performance.getEntriesByType('navigation')[0].duration }), route.path));
  }
  for (const [path, doc] of docs) for (const href of doc.links) {
    const url = new URL(href, origin + path);
    if (url.origin !== origin) continue;
    const target = docs.get(url.pathname);
    assert.ok(target, `${path}: broken internal href ${href}`);
    if (url.hash) assert.ok(target.ids.includes(decodeURIComponent(url.hash.slice(1))), `${path}: missing fragment ${href}`);
    results.links++;
  }
  const sitemap = await (await page.request.get(origin + '/sitemap.xml')).text();
  assert.deepEqual([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, url]) => url).sort(), siteRoutes.map((route) => 'https://teleportrecovery.co.uk' + route.path).sort());
  for (const [alias, canonical] of [...Object.entries(routeAliases), ...siteRoutes.filter((route) => route.path !== '/').map((route) => [route.path + '/', route.path])]) {
    for (const method of ['get', 'head']) {
      const query = '?gclid=local-only&gbraid=b&wbraid=w&utm_source=google&key=a%2Bb&key=two';
      const response = await page.request[method](origin + alias + query, { maxRedirects: 0 });
      assert.equal(response.status(), 301); assert.equal(response.headers().location, origin + canonical + query);
      assert.equal((await page.request[method](response.headers().location, { maxRedirects: 0 })).status(), 200);
      results.redirects++;
    }
  }
  for (const path of ['/areas/not-a-real-city', '/areas/bletchley', '/services/unsupported-specialist', '/recovery/birmingham/unknown']) {
    const response = await page.request.get(origin + path);
    assert.equal(response.status(), 404);
    assert.match(await response.text(), /noindex, nofollow/);
  }
  const representative = ['/', '/areas', '/areas/regions/east-of-england', '/areas/milton-keynes', '/recovery/birmingham', '/services/motorway-recovery', '/recovery/bedford/non-runner-recovery', '/recovery/milton-keynes/breakdown-recovery', '/advice', '/advice/failed-mot-transport', '/advice/electric-vehicle-recovery'];
  for (const path of representative) {
    for (const width of [320, 375, 390, 430, 768, 1440]) {
      await page.setViewportSize({ width, height: width >= 768 ? 1024 : 844 });
      await visit(path);
      await layout(path, width);
      if (width < 768) {
        const contact = await page.evaluate(() => ({ phoneBottom: document.querySelector('main a[href^="tel:"]').getBoundingClientRect().bottom, noticeTop: document.querySelector('.consent-panel').getBoundingClientRect().top }));
        assert.ok(contact.phoneBottom <= contact.noticeTop, path + ': first call obscured by consent');
      }
      if (width === 390 || width === 1440 || path === '/') await page.screenshot({ path: resolve(output, `final-${path === '/' ? 'home' : path.slice(1).replaceAll('/', '-')}-${width}.png`), fullPage: false });
      if (path === '/recovery/birmingham' && width < 768) {
        const boxes = await page.locator('.location-hero__trust > *').evaluateAll((els) => els.map((el) => ({ width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height })));
        assert.equal(boxes.length, 2); { assert.equal(boxes[0].width, boxes[1].width); assert.equal(boxes[0].height, boxes[1].height); }
        assert.match(await page.locator('main').innerText(), /30 MIN ETA/);
      }
    }
    await page.setViewportSize({ width: 390, height: 844 }); await visit(path);
    await page.addStyleTag({ content: 'html { font-size: 200%; }' }); await layout(path, 390, 'text200');
    await page.screenshot({ path: resolve(output, `text200-${path === '/' ? 'home' : path.slice(1).replaceAll('/', '-')}.png`) });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await visit('/'); await page.getByRole('button', { name: 'Reject advertising', exact: true }).click();
  await page.screenshot({ path: resolve(output, 'review-home-390.png') });
  for (const path of ['/areas', '/areas/milton-keynes', '/recovery/birmingham', '/services', '/services/motorway-recovery']) {
    await visit(path);
    await page.screenshot({ path: resolve(output, 'review-' + path.slice(1).replaceAll('/', '-') + '-390-full.png'), fullPage: true });
  }
  await visit('/areas');
  await page.getByLabel('Search recovery areas', { exact: true }).fill('Milton Keynes');
  assert.match(await page.locator('#area-search-results').innerText(), /^1 area shown/);
  assert.equal(await page.locator('details[open]').count(), 1);
  assert.equal(await page.locator('details li').count(), 1);
  await page.getByLabel('Search recovery areas', { exact: true }).fill('no-match-xx');
  assert.equal(await page.locator('details').count(), 0);
  await page.getByLabel('Search recovery areas', { exact: true }).fill('');
  const summary = page.locator('summary').first(); await summary.focus(); await page.keyboard.press('Enter');
  assert.equal(await summary.evaluate((el) => el.parentElement.open), true);
  await page.keyboard.press('Space'); assert.equal(await summary.evaluate((el) => el.parentElement.open), false);
  await page.locator('a[href="/areas/milton-keynes"]').first().click();
  await page.waitForURL('**/areas/milton-keynes'); await page.reload({ waitUntil: 'networkidle' });
  await page.goBack({ waitUntil: 'networkidle' }); assert.equal(new URL(page.url()).pathname, '/areas');
  await page.goForward({ waitUntil: 'networkidle' }); assert.equal(new URL(page.url()).pathname, '/areas/milton-keynes');
  // Initial HTML remains useful with scripts disabled.
  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const noJsPage = await noJs.newPage(); await noJsPage.goto(origin + '/areas/milton-keynes');
  assert.match(await noJsPage.locator('h1').innerText(), /MILTON KEYNES/);
  assert.equal(await noJsPage.locator('main a[href="tel:+441234900700"]').count() > 0, true);
  await noJs.close();
  const protectedFiles = JSON.parse(await readFile('tests/fixtures/v4-protected.json', 'utf8'));
  for (const [file, hash] of Object.entries(protectedFiles)) {
    if (file === 'src/pages/LegalPage.tsx') continue; // Only the action label in the location disclosure changed.
    assert.equal(createHash('sha256').update(await readFile(file)).digest('hex'), hash, `${file}: protected audited code changed`);
    results.protectedFiles.push(file);
  }
  assert.deepEqual(results.errors, []); assert.deepEqual(results.advertisingBeforeConsent, []);
  results.result = 'passed';
  console.log(JSON.stringify({ result: results.result, routes: results.routes.length, internalLinks: results.links, redirects: results.redirects, layouts: results.layouts.length, errors: results.errors, performance: results.performance }, null, 2));
} catch (error) { results.result = 'failed'; results.error = error.stack; throw error; }
finally { await writeFile(resolve(output, 'verification.json'), JSON.stringify(results, null, 2)); await browser.close(); }
