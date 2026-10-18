// Uses an existing Playwright installation; no production dependency is added.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { consentedFunctionalContext } from './consent-qa-fixture.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const origin = process.env.QA_URL ?? 'http://127.0.0.1:4173';
const artifacts = resolve(process.env.QA_ARTIFACT_DIR ?? 'qa-artifacts');
await mkdir(artifacts, { recursive: true });
const browser = await chromium.launch({ channel: process.env.QA_BROWSER ?? 'msedge', headless: true });
const results = { viewports: [], routes: [], interactions: [], pageErrors: [], consoleErrors: [], cspViolations: [], externalFailures: [] };
const context = await browser.newContext();
await consentedFunctionalContext(context);
await context.addInitScript(() => {
  window.dataLayer = [];
  window.qaGpsCalls = 0;
  Object.defineProperty(navigator, 'geolocation', { configurable: true, value: {
    getCurrentPosition() { window.qaGpsCalls += 1; },
  } });
  window.qaCspViolations = [];
  document.addEventListener('securitypolicyviolation', (event) => {
    window.qaCspViolations.push({ directive: event.violatedDirective, blockedURI: event.blockedURI });
  });
});
const page = await context.newPage();
let expectedFailure = false;
page.on('pageerror', (error) => results.pageErrors.push(error.message));
page.on('console', (message) => {
  if (message.type() === 'error' && !expectedFailure) results.consoleErrors.push(message.text());
});
page.on('requestfailed', (request) => {
  if (!request.url().startsWith(origin)) results.externalFailures.push({ url: request.url(), error: request.failure()?.errorText });
});

async function visit(path = '/') {
  return page.goto(`${origin}${path}`, { waitUntil: 'networkidle' });
}
async function verifyLayout(label) {
  const metrics = await page.evaluate(() => ({
    width: innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
    h1: document.querySelectorAll('h1').length,
    phones: [...document.querySelectorAll('a[href^="tel:"]')].map((a) => ({ href: a.getAttribute('href'), label: a.getAttribute('aria-label') ?? a.textContent.trim() })),
  }));
  assert.ok(metrics.documentWidth <= metrics.width, `${label}: document overflows`);
  assert.ok(metrics.bodyWidth <= metrics.width, `${label}: body overflows`);
  assert.equal(metrics.h1, 1, `${label}: expected one h1`);
  assert.ok(metrics.phones.length > 0);
  assert.ok(metrics.phones.every((phone) => phone.href === 'tel:+441234900700' && phone.label));
  results.cspViolations.push(...await page.evaluate(() => window.qaCspViolations));
  return metrics;
}
async function clickWithoutCalling(selector) {
  // Prevent the OS phone action while preserving the component's event handler.
  const link = page.locator(`${selector}:visible`).first();
  await link.evaluate((element) => element.addEventListener('click', (event) => event.preventDefault(), { once: true }));
  await link.click();
  const events = await page.evaluate(() => window.dataLayer);
  assert.equal(events.at(-1).event, 'call_click');
  results.interactions.push(`${selector}: canonical call href and event verified`);
}
async function fillCallback() {
  await page.getByLabel('Your name', { exact: true }).fill('QA visitor');
  await page.getByLabel('Phone number', { exact: true }).fill('01234 900 700');
  await page.getByRole('textbox', { name: 'Your location (optional)', exact: true }).fill('QA location');
  await page.getByLabel('What happened?').fill('QA request; intercepted locally and never delivered.');
}

try {
  for (const [width, height] of [[1440, 900], [1180, 750], [768, 1024], [390, 844], [320, 844]]) {
    await page.setViewportSize({ width, height });
    const response = await visit();
    assert.equal(response.status(), 200);
    const metrics = await verifyLayout(`${width}x${height}`);
    assert.equal(await page.locator('#top img').evaluate((img) => img.naturalWidth > 0), true, 'Hero image must load');
    const text = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    assert.ok(text.includes('BROKEN DOWN? GET RECOVERY NOW.'));
    assert.ok(!text.includes('45 MIN AVERAGE ETA*'));
    assert.ok(text.includes('01234 900 700'));
    assert.equal(await page.locator('a[href^="mailto:"]').count(), 0);
    for (const href of await page.locator('a[href*="wa.me"]').evaluateAll((links) => links.map((link) => link.href))) {
      const url = new URL(href);
      assert.equal(url.origin + url.pathname, 'https://wa.me/447827079669');
      assert.ok(url.searchParams.get('text').includes('Pickup:\n\nDestination:'));
      assert.ok(!url.searchParams.get('text').includes('google.com'));
    }
    assert.equal(await page.locator('#callback form:not([inert])').count(), 1);
    assert.equal(await page.locator('#contact form').count(), 0);
    assert.deepEqual(await page.locator('main > section[id]').evaluateAll((sections) => sections.map((section) => section.id)),
      ['top', 'pickup', 'coverage', 'services', 'how-it-works', 'trust', 'callback', 'faqs', 'contact']);
    await page.screenshot({ path: resolve(artifacts, `home-${width}x${height}.png`), fullPage: true });
    for (const section of ['coverage', 'callback', 'faqs', 'contact']) {
      await page.locator(`#${section}`).scrollIntoViewIfNeeded();
      await page.screenshot({ path: resolve(artifacts, `${section}-${width}x${height}.png`) });
    }
    results.viewports.push({ width, height, ...metrics });
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await visit();
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.textContent), 'Skip to content');
  await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'main-content');
  results.interactions.push('Keyboard skip link focuses main content');
  await clickWithoutCalling('header a[href^="tel:"]');
  await clickWithoutCalling('#top .hero-call-cta');
  await clickWithoutCalling('footer a[href^="tel:"]');
  await page.locator('footer a[href="/guarantee"]').first().click();
  await page.waitForURL('**/guarantee');
  assert.equal(await page.locator('h1').innerText(), 'Money-Back Guarantee');
  assert.equal(await page.evaluate(() => window.dataLayer.filter((event) => event.event === 'guarantee_terms_view').length), 1);
  results.interactions.push('Footer guarantee link opens full policy and emits one view event');

  await visit();
  const guaranteeButton = page.getByRole('button', { name: 'What is the money-back guarantee?' });
  const guaranteeLink = page.getByRole('link', { name: 'Read the full Money-Back Guarantee', includeHidden: true });
  assert.equal(await guaranteeLink.getAttribute('tabindex'), '-1');
  await guaranteeButton.click();
  assert.equal(await guaranteeLink.getAttribute('tabindex'), '0');
  await guaranteeLink.click();
  await page.waitForURL('**/guarantee');
  results.interactions.push('FAQ guarantee link opens full policy; closed panels exclude links from Tab');

  for (const path of ['/terms', '/guarantee', '/privacy', '/terms/', '/guarantee/index.html']) {
    const response = await visit(path);
    assert.equal(response.status(), 200);
    const metrics = await verifyLayout(path);
    const canonicalPath = path.replace(/\/index\.html$/, '').replace(/\/$/, '');
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), `https://teleportrecovery.co.uk${canonicalPath}`);
    assert.ok((await page.title()).includes('Teleport Recovery'));
    results.routes.push({ path, status: response.status(), title: await page.title(), ...metrics });
    await page.screenshot({ path: resolve(artifacts, `legal-${canonicalPath.slice(1)}.png`) });
  }
  for (const path of ['/terms', '/guarantee', '/privacy']) {
    await page.setViewportSize({ width: 390, height: 844 });
    await visit(path);
    await verifyLayout(`mobile ${path}`);
    await page.screenshot({ path: resolve(artifacts, `mobile-${path.slice(1)}.png`), fullPage: true });
  }
  expectedFailure = true;
  const missing = await visit('/page-that-does-not-exist');
  expectedFailure = false;
  assert.equal(missing.status(), 404);
  assert.ok((await page.locator('h1').innerText()).includes('back on the road'));
  assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex, nofollow');
  results.routes.push({ path: '/page-that-does-not-exist', status: 404 });

  await visit();
  const mobileMenu = page.getByRole('button', { name: 'Open menu' });
  await mobileMenu.click();
  await page.keyboard.press('Escape');
  assert.equal(await mobileMenu.getAttribute('aria-expanded'), 'false');
  assert.ok(await mobileMenu.evaluate((button) => document.activeElement === button));
  await clickWithoutCalling('#top .hero-call-cta');
  assert.equal(await page.locator('#top .hero-call-cta').innerText(), 'CALL 01234 900 700');
  results.interactions.push('Mobile menu Escape returns focus; numbered Call CTA works');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await page.locator('#top img').evaluate((image) => getComputedStyle(image).animationName), 'none');
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
  results.interactions.push('Reduced motion removes hero motion and smooth scrolling');

  assert.equal(await page.locator('.mobile-conversion-bar').getByRole('button', { name: 'Send location on WhatsApp' }).isEnabled(), true);
  assert.equal(await page.evaluate(() => window.qaGpsCalls), 0);
  results.interactions.push('Sticky location action is available and requests no location on load');

  for (const { scenario, selector, source, city, consent } of [
    ...['success', 'denied', 'unavailable', 'timeout', 'unsupported', 'coarse', 'deadline', 'duplicate'].map((scenario) => ({ scenario, selector: '#pickup', source: 'coverage_location' })),
    { scenario: 'success', selector: '#top', source: 'hero_location' },
    { scenario: 'denied', selector: '#contact', source: 'final_cta_location' },
    { scenario: 'success', selector: '.location-hero', source: 'birmingham_hero_location', city: 'Birmingham' },
    { scenario: 'success', selector: '.location-hero', source: 'milton-keynes_hero_location', city: 'Milton Keynes' },
    { scenario: 'success', selector: '.mobile-conversion-bar', source: 'sticky_mobile' },
    { scenario: 'denied', selector: '.mobile-conversion-bar', source: 'sticky_mobile', consent: 'rejected' },
    { scenario: 'success', selector: '.mobile-conversion-bar', source: 'sticky_mobile', consent: 'fresh' },
  ]) {
    const gpsContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    if (!consent) await consentedFunctionalContext(gpsContext);
    else if (consent === 'rejected') await gpsContext.addInitScript(() => localStorage.setItem('teleport-advertising-consent', JSON.stringify({ version: 1, choice: 'rejected', updatedAt: Date.now() })));
    let snapshot;
    await gpsContext.exposeBinding('qaCapture', (_source, value) => { snapshot = value; });
    await gpsContext.addInitScript((scenario) => {
      window.dataLayer = [];
      window.qaGps = { calls: 0, options: null };
      const capture = () => window.qaCapture({ gps: window.qaGps, events: window.dataLayer.filter((item) => item?.event),
        local: { ...localStorage }, session: { ...sessionStorage } });
      const geolocation = {
        getCurrentPosition(success, failure, options) {
          window.qaGps.calls += 1;
          window.qaGps.options = options;
          capture();
          if (scenario === 'deadline') return;
          setTimeout(() => {
            if (['denied', 'unavailable', 'timeout'].includes(scenario)) {
              failure({ code: { denied: 1, unavailable: 2, timeout: 3 }[scenario] });
            } else {
              success({ coords: { latitude: 52.123456, longitude: -0.56789, accuracy: scenario === 'coarse' ? 100000 : 20 } });
            }
          }, 80);
        },
      };
      Object.defineProperty(navigator, 'geolocation', { configurable: true, get() {
        if (scenario !== 'unsupported') return geolocation;
        capture();
        return undefined;
      } });
    }, scenario);
    const gpsPage = await gpsContext.newPage();
    let handoff;
    // Intercept the handoff before contacting WhatsApp. No test sends a customer message.
    await gpsPage.route('https://wa.me/**', async (route) => {
      handoff = route.request().url();
      await route.fulfill({ status: 200, contentType: 'text/html', body: '<p>Intercepted QA handoff.</p>' });
    });
    await gpsPage.goto(origin + (city === 'Birmingham' ? '/recovery/birmingham' : city ? '/areas/milton-keynes' : '/'), { waitUntil: 'networkidle' });
    assert.equal(await gpsPage.evaluate(() => window.qaGps.calls), 0, 'No GPS on page load');
    const locationButton = gpsPage.locator(selector).getByRole('button', { name: 'Send location on WhatsApp', exact: true });
    await locationButton.scrollIntoViewIfNeeded();
    const navigation = gpsPage.waitForURL('https://wa.me/**');
    if (scenario === 'duplicate') await locationButton.evaluate((button) => { button.click(); button.click(); });
    else await locationButton.click();
    await navigation;
    const url = new URL(handoff);
    assert.equal(url.origin + url.pathname, 'https://wa.me/447827079669');
    const message = url.searchParams.get('text');
    if (city) assert.ok(message.includes(`in ${city}`));
    assert.equal(message.includes('https://www.google.com/maps/search/'), ['success', 'duplicate'].includes(scenario));
    if (['success', 'duplicate'].includes(scenario)) assert.ok(message.includes('query=52.123456%2C-0.56789'));
    else assert.ok(message.includes('Pickup location or postcode:\n\nDestination:'));
    assert.deepEqual([...url.searchParams.keys()], ['text'], 'Draft only; no automatic send parameters');
    assert.equal(snapshot.gps.calls, scenario === 'unsupported' ? 0 : 1);
    if (snapshot.gps.calls) assert.deepEqual(snapshot.gps.options, { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 });
    assert.deepEqual(snapshot.events, consent ? [] : [{ event: 'whatsapp_click', location: source }]);
    assert.deepEqual(Object.keys(snapshot.local), consent === 'fresh' ? [] : ['teleport-advertising-consent']);
    if (consent !== 'fresh') assert.equal(JSON.parse(snapshot.local['teleport-advertising-consent']).choice, consent === 'rejected' ? 'rejected' : 'accepted');
    assert.deepEqual(snapshot.session, {});
    results.interactions.push(`Location ${source} ${scenario}: bounded explicit request, same-tab manual draft, no storage or personal tracking data`);
    await gpsContext.close();
  }

  let acceptedRequests = 0;
  await page.route('**/__forms/callback.html', async (route) => {
    acceptedRequests += 1;
    const request = route.request();
    assert.equal(request.method(), 'POST');
    const fields = new URLSearchParams(request.postData());
    assert.equal(fields.get('form-name'), 'recovery-callback');
    assert.equal(fields.get('name'), 'QA visitor');
    assert.equal(fields.get('phone'), '01234 900 700');
    assert.equal(fields.get('bot-field'), '');
    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.fulfill({ status: 200, contentType: 'text/html', body: '<p>Thank you for your submission.</p>' });
  });
  await visit();
  await fillCallback();
  await page.getByLabel('Phone number', { exact: true }).fill('not a number');
  await page.getByRole('button', { name: 'Request Callback', exact: true }).click();
  assert.equal(acceptedRequests, 0);
  assert.equal(await page.getByLabel('Phone number', { exact: true }).evaluate((input) => input.checkValidity()), false);
  await page.getByLabel('Phone number', { exact: true }).fill('01234 900 700');
  await page.locator('form[name="recovery-callback"]:not([inert])').evaluate((form) => { form.requestSubmit(); form.requestSubmit(); });
  await page.getByText('Callback requested', { exact: true }).waitFor();
  assert.equal(acceptedRequests, 1);
  assert.equal(await page.locator('#callback [role="status"]').evaluate((element) => document.activeElement === element), true);
  assert.equal(await page.evaluate(() => window.dataLayer.filter((event) => event.event === 'callback_submit').length), 1);
  results.interactions.push('Callback success: URL encoding, validation, duplicate lock, focus and one accepted event');
  await page.screenshot({ path: resolve(artifacts, 'callback-success.png') });
  await page.unroute('**/__forms/callback.html');

  for (const failure of ['server', 'unprocessed', 'offline']) {
    await page.route('**/__forms/callback.html', async (route) => {
      if (failure === 'offline') return route.abort('failed');
      return route.fulfill({ status: failure === 'server' ? 500 : 200, contentType: 'text/html', body: failure === 'server' ? 'Unavailable' : '<html data-callback-unprocessed="true"><div id="root"></div></html>' });
    });
    await visit();
    await fillCallback();
    expectedFailure = true;
    await page.getByRole('button', { name: 'Request Callback', exact: true }).click();
    await page.getByRole('alert').waitFor();
    expectedFailure = false;
    assert.ok((await page.getByRole('alert').innerText()).includes("couldn't confirm"));
    assert.equal(await page.getByLabel('Your name', { exact: true }).inputValue(), 'QA visitor');
    assert.equal(await page.getByRole('button', { name: 'Request Callback', exact: true }).isEnabled(), true);
    assert.equal(await page.getByRole('alert').evaluate((element) => document.activeElement === element), true);
    assert.equal(await page.evaluate(() => window.dataLayer.filter((event) => event.event === 'callback_submit').length), 0);
    await verifyLayout(`callback ${failure}`);
    results.interactions.push(`Callback ${failure}: honest focused failure, details retained, retry enabled, no success event`);
    if (failure === 'server') await page.screenshot({ path: resolve(artifacts, 'callback-failure.png') });
    await page.unroute('**/__forms/callback.html');
  }

  assert.deepEqual(results.pageErrors, []);
  assert.deepEqual(results.consoleErrors, []);
  assert.deepEqual(results.cspViolations, []);
  assert.deepEqual(results.externalFailures, []);
  results.result = 'passed';
  console.log(JSON.stringify(results, null, 2));
} catch (error) {
  results.result = 'failed';
  results.error = error.stack;
  throw error;
} finally {
  await writeFile(resolve(artifacts, 'browser-qa.json'), JSON.stringify(results, null, 2));
  await browser.close();
}
