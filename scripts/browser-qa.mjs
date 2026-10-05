// Uses an existing Playwright installation; no production dependency is added.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const origin = process.env.QA_URL ?? 'http://127.0.0.1:4173';
const artifacts = resolve(process.env.QA_ARTIFACT_DIR ?? 'qa-artifacts');
await mkdir(artifacts, { recursive: true });
const browser = await chromium.launch({ channel: process.env.QA_BROWSER ?? 'msedge', headless: true });
const results = { viewports: [], routes: [], interactions: [], pageErrors: [], consoleErrors: [], cspViolations: [], externalFailures: [] };
const context = await browser.newContext();
await context.addInitScript(() => {
  window.dataLayer = [];
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
  await page.getByLabel('Your location').fill('QA location');
  await page.getByLabel('What happened?').fill('QA request; intercepted locally and never delivered.');
}

try {
  for (const [width, height] of [[1440, 900], [1180, 750], [768, 1024], [390, 844]]) {
    await page.setViewportSize({ width, height });
    const response = await visit();
    assert.equal(response.status(), 200);
    const metrics = await verifyLayout(`${width}x${height}`);
    assert.equal(await page.locator('#top img').evaluate((img) => img.naturalWidth > 0), true, 'Hero image must load');
    const text = await page.locator('body').innerText();
    assert.ok(text.includes('45 MIN AVERAGE ETA*'));
    assert.ok(text.includes('01234 900 700'));
    assert.equal(await page.locator('a[href*="wa.me"], a[href^="mailto:"]').count(), 0);
    await page.screenshot({ path: resolve(artifacts, `home-${width}x${height}.png`), fullPage: true });
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await page.screenshot({ path: resolve(artifacts, `contact-${width}x${height}.png`) });
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
  await page.locator('#top a').filter({ hasText: 'Terms apply.' }).click();
  await page.waitForURL('**/guarantee');
  assert.equal(await page.locator('h1').innerText(), 'Money-Back Guarantee');
  assert.equal(await page.evaluate(() => window.dataLayer.filter((event) => event.event === 'guarantee_terms_view').length), 1);
  results.interactions.push('Hero guarantee summary opens full policy and emits one view event');

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
  assert.equal(await page.locator('#top .hero-call-cta').innerText(), 'Call 01234 900 700');
  results.interactions.push('Mobile menu Escape returns focus; numbered Call CTA works');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await page.locator('.hero-background-motion').evaluate((image) => getComputedStyle(image).animationName), 'none');
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
  results.interactions.push('Reduced motion removes hero motion and smooth scrolling');

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
  assert.equal(await page.getByRole('status').evaluate((element) => document.activeElement === element), true);
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
