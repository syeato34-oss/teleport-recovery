// Local rendered design checks plus the preserved contact integration. No real calls,
// WhatsApp sends, Ads traffic or callback requests. ETA previews are test fixtures only.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { build } from 'esbuild';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const origin = 'http://127.0.0.1:4173';
const directory = resolve('qa-artifacts/hero');
await mkdir(directory, { recursive: true });
const baseline = JSON.parse(await readFile(resolve(directory, 'visual-before.json'), 'utf8'));
const protectedBefore = JSON.parse(await readFile(resolve(directory, 'protected-before.json'), 'utf8'));
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const results = { result: 'running', viewports: [], preservation: [], interactions: [], errors: [], consoleErrors: [], csp: [] };

async function context(options = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', ...options });
  await ctx.route('https://www.googletagmanager.com/gtag/js**', (route) => route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* Isolated Google test fixture. */' }));
  await ctx.addInitScript(() => {
    window.qaCsp = [];
    document.addEventListener('securitypolicyviolation', (event) => window.qaCsp.push({ directive: event.violatedDirective, blocked: event.blockedURI }));
  });
  return ctx;
}
async function open(ctx, route = '/recovery/birmingham') {
  const page = await ctx.newPage();
  page.on('pageerror', (error) => results.errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') results.consoleErrors.push(message.text()); });
  assert.equal((await page.goto(origin + route, { waitUntil: 'networkidle' })).status(), 200);
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((image) => image.decode().catch(() => {}))); });
  return page;
}
async function checkLayout(page, label, fresh = true) {
  const metric = await page.evaluate(() => {
    const rect = (selector) => document.querySelector(selector)?.getBoundingClientRect().toJSON();
    const call = document.querySelector('.location-hero__call');
    const range = document.createRange(); range.selectNodeContents(call.querySelector('span'));
    return { width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth,
      heading: document.querySelector('h1').textContent.replace(/\s+/g, ' ').trim(),
      h1Count: document.querySelectorAll('h1').length, call: rect('.location-hero__call'),
      whatsapp: rect('.location-hero__whatsapp'), consent: rect('.consent-panel'), sticky: rect('.mobile-conversion-bar'),
      callTextRects: [...range.getClientRects()].map((rect) => rect.toJSON()),
      trust: [...document.querySelectorAll('.location-hero__trust li')].map((item) => item.textContent),
      phone: call.getAttribute('href'), etaVisible: !!document.querySelector('.location-hero__eta') };
  });
  assert.ok(metric.scrollWidth <= metric.width, `${label}: horizontal overflow`);
  assert.equal(metric.h1Count, 1);
  assert.equal(metric.heading, 'Broken Down in Birmingham? Get Recovery Now.');
  assert.equal(metric.etaVisible, false, 'Unsubstantiated ETA must stay unpublished');
  assert.equal(metric.trust.length, 3);
  assert.ok(metric.call.height >= 44 && metric.whatsapp.height >= 44);
  assert.ok(metric.callTextRects.every((rect) => rect.left >= metric.call.left && rect.right <= metric.call.right + 1), 'Phone label clipped');
  if (fresh) {
    assert.ok(metric.call.bottom <= metric.consent.top, `${label}: consent obscures hero call`);
    if (metric.width < 1024) assert.ok(metric.consent.bottom <= metric.sticky.top + 1);
  }
  results.viewports.push({ label, ...metric });
}

try {
  for (const [width, height] of [[320, 844], [375, 812], [390, 844], [430, 932], [768, 1024], [1440, 900], [375, 667]]) {
    const ctx = await context({ viewport: { width, height }, hasTouch: width < 1024, isMobile: width < 1024 });
    const page = await open(ctx);
    await checkLayout(page, `${width}x${height}`);
    assert.equal(await page.locator('script[src*="googletagmanager.com"]').count(), 0);
    await page.screenshot({ path: resolve(directory, `hero-${width}x${height}-fresh.png`) });
    await page.getByRole('button', { name: 'Reject advertising', exact: true }).click();
    assert.equal(await page.locator('.location-hero__call').getAttribute('href'), 'tel:+441234900700');
    for (const link of await page.locator('a[href*="wa.me"]').all()) {
      const url = new URL(await link.getAttribute('href'));
      assert.equal(url.origin + url.pathname, 'https://wa.me/447827079669');
      assert.equal(url.searchParams.get('text'), 'Hi Teleport Recovery, I need vehicle recovery in Birmingham.\n\nPickup postcode:\nDestination:\nVehicle:\nIs it urgent?:\n\nCould I please get a quote and estimated arrival time?');
    }
    await page.screenshot({ path: resolve(directory, `hero-${width}x${height}-rejected.png`) });
    await page.locator('footer [data-privacy-settings]').click();
    await page.getByRole('button', { name: 'Accept advertising', exact: true }).click();
    await page.evaluate(() => window.dataLayer.find((item) => item[0] === 'config' && item[1] === 'AW-18493914811/BRTACI7HpZUdELv9yvJE')[2].phone_conversion_callback('07700 900123', '+447700900123'));
    await page.waitForFunction(() => document.querySelector('.location-hero__call').getAttribute('href') === 'tel:+447700900123');
    assert.equal(await page.locator('.location-hero__call').innerText(), 'Call Now — 07700 900123');
    assert.ok((await page.locator('.mobile-conversion-bar a[href^="tel:"]').getAttribute('aria-label')).includes('07700 900123'));
    assert.equal(await page.locator('.mobile-conversion-bar a[href^="tel:"]').getAttribute('href'), 'tel:+447700900123');
    await page.locator('.location-hero__call').scrollIntoViewIfNeeded();
    await checkLayout(page, `${width}x${height}-forwarded`, false);
    const call = page.locator('.location-hero__call');
    await call.evaluate((a) => a.addEventListener('click', (event) => event.preventDefault(), { once: true }));
    await call.click();
    assert.deepEqual(await page.evaluate(() => window.dataLayer.at(-1)), { event: 'call_click', location: 'birmingham_hero' });
    assert.equal(await page.evaluate(() => window.dataLayer.filter((item) => item[0] === 'event' && item[1] === 'conversion').length), 0);
    results.csp.push(...await page.evaluate(() => window.qaCsp));
    await ctx.close();
  }

  for (const width of [390, 1440]) {
    const ctx = await context({ viewport: { width, height: 900 } });
    await ctx.addInitScript(() => localStorage.setItem('teleport-advertising-consent', JSON.stringify({ version: 1, choice: 'rejected', updatedAt: Date.now() })));
    for (const route of ['/', '/recovery/birmingham']) {
      const page = await open(ctx, route);
      const snapshot = await page.evaluate(() => ({ main: document.querySelector('main').innerHTML,
        lower: [...document.querySelector('main').children].slice(1).map((e) => e.outerHTML).join(''), title: document.title,
        description: document.querySelector('meta[name=description]').content, canonical: document.querySelector('link[rel=canonical]').href }));
      const before = baseline[(route === '/' ? 'home' : 'city') + width];
      assert.equal(route === '/' ? snapshot.main : snapshot.lower, route === '/' ? before.main : before.lower, 'Unrelated page content changed');
      for (const key of ['title', 'description', 'canonical']) assert.equal(snapshot[key], before[key]);
      if (route === '/') {
        const image = await page.screenshot({ path: resolve(directory, `after-home-${width}.png`) });
        assert.deepEqual(image, await readFile(resolve(directory, `before-home-${width}.png`)), 'Homepage pixels changed');
      }
      results.preservation.push({ route, width, contentAndMetadata: true, homepagePixels: route === '/' });
      await page.close();
    }
    await ctx.close();
  }

  const ctx = await context();
  const page = await open(ctx);
  await page.getByRole('button', { name: 'Reject advertising', exact: true }).click();
  await page.addStyleTag({ content: 'html { font-size: 200%; }' });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  const call = page.locator('.location-hero__call');
  await call.focus();
  assert.ok(await call.evaluate((a) => { const r = a.getBoundingClientRect(); return a.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)) && getComputedStyle(a).boxShadow !== 'none'; }));
  await page.screenshot({ path: resolve(directory, 'hero-text200.png'), fullPage: true });
  assert.equal(await page.locator('.location-hero__check').first().evaluate((e) => getComputedStyle(e).animationName), 'none');
  results.interactions.push('200% text: no overflow, call focus visible/unobscured; reduced motion: no check animation');
  await ctx.close();

  const motionContext = await context({ reducedMotion: 'no-preference' });
  const motionPage = await open(motionContext);
  const motion = await motionPage.locator('.location-hero__check').evaluateAll((checks) => checks.map((e) => ({ name: getComputedStyle(e).animationName, iterations: getComputedStyle(e).animationIterationCount, opacity: getComputedStyle(e).opacity })));
  assert.ok(motion.every((item) => item.name === 'location-check-arrive' && item.iterations === '1' && item.opacity === '1'));
  results.interactions.push('Three check icons use a short staggered entrance that settles; text and CTAs are never hidden');
  await motionContext.close();

  // Render the real App with in-memory ETA fixtures. No query parameter or production
  // preview switch is added; the shipped Birmingham config remains disabled/unconfirmed.
  const harness = await build({ stdin: { contents: `import React from 'react'; import {createRoot} from 'react-dom/client'; import App from './src/App'; import {locationPages} from './src/config/locations'; const root=createRoot(document.getElementById('root')); history.replaceState({},'','/recovery/birmingham'); window.qaEta=(eta)=>{locationPages[0].eta=eta;root.render(<App/>)};window.qaEta({enabled:false,minutes:30,operationalEvidenceConfirmed:false,qualification:'Subject to availability'});`, resolveDir: process.cwd(), loader: 'tsx' }, alias: { '@': resolve('src') }, jsx: 'automatic', bundle: true, write: false, format: 'iife', define: { 'process.env.NODE_ENV': '"production"' } });
  const etaContext = await context();
  await etaContext.route('**/qa-eta-fixture', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<div id="root"></div><script src="/qa-eta-fixture.js"></script>' }));
  await etaContext.route('**/qa-eta-fixture.js', (route) => route.fulfill({ status: 200, contentType: 'application/javascript', body: harness.outputFiles[0].text }));
  const etaPage = await etaContext.newPage();
  await etaPage.goto(origin + '/qa-eta-fixture', { waitUntil: 'networkidle' });
  const css = await readFile('dist/index.html', 'utf8');
  await etaPage.addStyleTag({ url: origin + css.match(/href="([^"]+\.css)"/)[1] });
  await etaPage.getByRole('button', { name: 'Reject advertising', exact: true }).click();
  const fixture = { enabled: true, minutes: 30, operationalEvidenceConfirmed: false, qualification: 'Subject to availability' };
  await etaPage.evaluate((eta) => window.qaEta(eta), fixture);
  await etaPage.waitForTimeout(100);
  assert.equal(await etaPage.locator('.location-hero__eta').count(), 0);
  await etaPage.evaluate((eta) => window.qaEta(eta), { ...fixture, operationalEvidenceConfirmed: true });
  await etaPage.locator('.location-hero__eta').waitFor();
  assert.ok((await etaPage.locator('.location-hero__eta').innerText()).includes('30 MIN ETA*'));
  await etaPage.screenshot({ path: resolve(directory, 'eta-preview-only.png') });
  await etaPage.evaluate((eta) => window.qaEta(eta), { ...fixture, operationalEvidenceConfirmed: true, minutes: 40 });
  await etaPage.getByText('40 MIN ETA*', { exact: true }).waitFor();
  await etaPage.evaluate((eta) => window.qaEta(eta), { ...fixture, enabled: false, operationalEvidenceConfirmed: true });
  await etaPage.locator('.location-hero__eta').waitFor({ state: 'detached' });
  results.interactions.push('ETA fixture: hidden without evidence, previewed at 30, changed to 40, disabled again; shipped config stays hidden');
  await etaContext.close();

  for (const [file, hash] of Object.entries(protectedBefore)) {
    assert.equal(createHash('sha256').update(await readFile(file)).digest('hex'), hash, `Protected audit file changed: ${file}`);
  }
  results.interactions.push(`${Object.keys(protectedBefore).length} protected audit/homepage/routing/tracking files remain byte-identical`);
  assert.deepEqual(results.errors, []); assert.deepEqual(results.consoleErrors, []); assert.deepEqual(results.csp, []);
  results.result = 'passed';
  console.log(JSON.stringify(results, null, 2));
} catch (error) {
  results.result = 'failed'; results.error = error.stack; throw error;
} finally {
  await writeFile(resolve(directory, 'verification.json'), JSON.stringify(results, null, 2));
  await browser.close();
}
