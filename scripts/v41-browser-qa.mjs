// Rendered CTA hierarchy and mobile interaction checks. All handoffs are intercepted.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { configModule } from './config-module.mjs';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const { locationPages, getLocationPath } = await import(configModule('src/config/locations.ts'));
const { homepageHero } = await import(configModule('src/config/heroes.ts'));
const origin = process.env.QA_URL ?? 'http://127.0.0.1:4173';
const output = resolve('qa-artifacts/v4-1/visual');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const result = { layouts: [], cityHeroes: [], pending: [], errors: [], csp: [], advertisingRequests: [], safeArea: false };
async function makePage(viewport = { width: 390, height: 844 }, extra = {}) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce', ...extra });
  await context.addInitScript(() => {
    window.qaGpsCalls = 0; window.qaCsp = [];
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value: {
      getCurrentPosition(success) { window.qaGpsCalls++; window.qaFinishGps = success; },
    } });
    document.addEventListener('securitypolicyviolation', (event) => window.qaCsp.push(event.violatedDirective + ': ' + event.blockedURI));
  });
  const page = await context.newPage();
  page.on('pageerror', (error) => result.errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') result.errors.push(message.text()); });
  page.on('request', (request) => { if (/googletagmanager|googleadservices|doubleclick|googlesyndication/.test(request.url())) result.advertisingRequests.push(request.url()); });
  return page;
}
async function visit(page, path) {
  assert.equal((await page.goto(origin + path, { waitUntil: 'networkidle' })).status(), 200);
  await page.evaluate(async () => { await document.fonts.ready; });
}
async function inspect(page, path, state, scaling = false) {
  const metric = await page.evaluate(() => {
    const rect = (element) => element.getBoundingClientRect().toJSON();
    const call = document.querySelector('main a[href^="tel:"]');
    const whatsapp = document.querySelector('main .whatsapp-location-button');
    const sticky = document.querySelector('.mobile-conversion-bar');
    const stickyButtons = [...sticky.querySelectorAll('a[href^="tel:"],button')];
    const textLines = (element) => { const r = document.createRange(); r.selectNodeContents(element.querySelector('span')); return [...new Set([...r.getClientRects()].map((line) => line.top))].length; };
    return { width: innerWidth, scrollWidth: document.documentElement.scrollWidth, heading: document.querySelector('h1').textContent.replace(/\s+/g, ' ').trim(), h1Count: document.querySelectorAll('h1').length,
      call: rect(call), whatsapp: rect(whatsapp), callText: call.textContent.trim(), whatsappText: whatsapp.textContent.trim(),
      callFont: parseFloat(getComputedStyle(call).fontSize), waFont: parseFloat(getComputedStyle(whatsapp).fontSize),
      callFill: getComputedStyle(call).backgroundImage, waFill: getComputedStyle(whatsapp).backgroundImage,
      mainLines: [textLines(call), textLines(whatsapp)],
      sticky: rect(sticky), stickyButtons: stickyButtons.map((el) => ({ ...rect(el), lines: textLines(el) })),
      notice: document.querySelector('.consent-panel') ? rect(document.querySelector('.consent-panel')) : null,
      icons: [...document.querySelectorAll('.whatsapp-icon')].filter((icon) => icon.getClientRects().length).map((icon) => ({ ...rect(icon), sticky: !!icon.closest('.mobile-conversion-bar') })),
      phones: [...document.querySelectorAll('a[href^="tel:"]')].map((el) => el.getAttribute('href')), gps: window.qaGpsCalls,
      hiddenLinks: [...document.querySelectorAll('.mobile-conversion-bar .sr-only a')].length,
      csp: window.qaCsp };
  });
  assert.equal(metric.h1Count, 1); assert.ok(metric.scrollWidth <= metric.width, `${path} ${state}: overflow`);
  assert.equal(metric.gps, 0); assert.equal(metric.hiddenLinks, 0);
  assert.ok(metric.phones.every((href) => href === 'tel:+441234900700'));
  assert.deepEqual(metric.csp, []);
  assert.match(metric.callFill, /linear-gradient/); assert.equal(metric.waFill, 'none');
  assert.ok(metric.callFont >= metric.waFont);
  assert.ok(metric.icons.every((icon) => Math.abs(icon.width - icon.height) < 0.1 && icon.width === (icon.sticky ? 18 : 20)));
  if (!scaling) {
    assert.ok(Math.abs(metric.call.height - metric.whatsapp.height) < 0.5, `${path}: unequal CTA heights`);
    assert.ok(Math.abs(metric.call.width - metric.whatsapp.width) < 0.5, `${path}: unequal CTA widths`);
    assert.deepEqual(metric.mainLines, [1, 1], `${path}: wrapped default contact label`);
    if (metric.width < 1024) {
      assert.equal(metric.stickyButtons[0].height, metric.stickyButtons[1].height);
      assert.ok(metric.stickyButtons.every((button) => button.height >= 44 && button.lines === 1), `${path}: sticky clipping/wrap`);
    }
    if (metric.notice) assert.ok(metric.call.bottom <= metric.notice.top, `${path} ${metric.width}: first call obscured`);
  }
  if (metric.notice && metric.width < 1024) assert.ok(metric.notice.bottom <= metric.sticky.top + 1, 'Consent covers sticky actions');
  result.layouts.push({ path, state, scaling, ...metric });
}
try {
  const pages = ['/', '/recovery/birmingham', '/areas/milton-keynes', '/areas/bedford', '/areas', '/services/motorway-recovery', '/advice/failed-mot-transport'];
  for (const [width, height] of [[320,844],[375,812],[390,844],[430,932],[768,1024],[1440,900]]) for (const path of pages) {
    const page = await makePage({ width, height });
    await visit(page, path); await inspect(page, path, 'fresh');
    const name = path === '/' ? 'home' : path.slice(1).replaceAll('/', '-');
    await page.screenshot({ path: resolve(output, `${name}-${width}-fresh.png`) });
    await page.getByRole('button', { name: 'Reject advertising', exact: true }).click();
    await inspect(page, path, 'rejected');
    await page.screenshot({ path: resolve(output, `${name}-${width}-rejected.png`) });
    await page.context().close();
  }
  const cityPage = await makePage();
  for (const city of locationPages) {
    await visit(cityPage, getLocationPath(city));
    assert.equal((await cityPage.locator('h1').innerText()).replace(/\s+/g, ' '), city.heading);
    assert.equal(await cityPage.locator('.recovery-hero__eyebrow').innerText(), city.eyebrow);
    result.cityHeroes.push({ city: city.city, path: getLocationPath(city), heading: city.heading });
  }
  await cityPage.context().close();
  for (const path of ['/', '/recovery/birmingham', '/areas/milton-keynes', '/services/motorway-recovery', '/advice/electric-vehicle-recovery']) {
    const page = await makePage(); await visit(page, path);
    await page.addStyleTag({ content: 'html { font-size: 200%; }' });
    await page.getByRole('button', { name: 'Reject advertising', exact: true }).click();
    await inspect(page, path, 'text200', true);
    const call = page.locator('main a[href^="tel:"]').first(); await call.focus();
    assert.ok(await call.evaluate((el) => { const r=el.getBoundingClientRect(); return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)); }));
    await page.screenshot({ path: resolve(output, `${path === '/' ? 'home' : path.slice(1).replaceAll('/', '-')}-text200.png`) });
    await page.context().close();
  }
  const safePage = await makePage({ width: 390, height: 844 }, { isMobile: true, hasTouch: true });
  await visit(safePage, '/');
  await safePage.addStyleTag({ content: '.mobile-conversion-bar__actions { padding-bottom: 46px !important; }' });
  await safePage.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
  await inspect(safePage, '/', 'synthetic-34px-safe-area');
  result.safeArea = 'PASS synthetic geometry; physical iOS safe-area acceptance remains manual';
  await safePage.context().close();
  for (const selector of ['.recovery-hero', '.mobile-conversion-bar']) {
    const page = await makePage(); let handoff;
    await page.route('https://wa.me/**', async (route) => { handoff = route.request().url(); await route.fulfill({ status: 200, contentType: 'text/html', body: 'Intercepted local QA.' }); });
    await visit(page, '/');
    const button = page.locator(selector).locator('button.whatsapp-location-button');
    await button.evaluate((el) => { el.click(); el.click(); });
    assert.equal(await page.evaluate(() => window.qaGpsCalls), 1);
    assert.equal(await button.getAttribute('aria-busy'), 'true'); assert.equal(await button.isDisabled(), true);
    await page.screenshot({ path: resolve(output, selector.includes('mobile') ? 'sticky-location-active-390.png' : 'hero-location-active-390.png') });
    await page.evaluate(() => window.qaFinishGps({ coords: { latitude: 52.123456, longitude: -0.56789, accuracy: 20 } }));
    await page.waitForURL('https://wa.me/**');
    const url = new URL(handoff); assert.equal(url.origin+url.pathname, 'https://wa.me/447827079669');
    assert.match(url.searchParams.get('text'), /query=52.123456%2C-0.56789/); assert.deepEqual([...url.searchParams.keys()], ['text']);
    result.pending.push({ selector, requests: 1, busyAccessible: true, manualDraft: true });
    await page.context().close();
  }
  assert.equal(homepageHero.heading, 'BROKEN DOWN? GET RECOVERY NOW.');
  assert.deepEqual(result.errors, []); assert.deepEqual(result.advertisingRequests, []);
  result.result = 'passed';
  console.log(JSON.stringify({ result: result.result, layouts: result.layouts.length, cityHeroes: result.cityHeroes.length, pending: result.pending, safeArea: result.safeArea, errors: result.errors }, null, 2));
} catch (error) { result.result='failed'; result.error=error.stack; throw error; }
finally { await writeFile(resolve(output, 'verification.json'), JSON.stringify(result, null, 2)); await browser.close(); }
