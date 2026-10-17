// Uses the same externally supplied Playwright installation as browser-qa.mjs.
// Run after npm run build, with npm run qa:serve in another terminal.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { transformSync } from 'esbuild';
import { consentedFunctionalContext } from './consent-qa-fixture.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const origin = process.env.QA_URL ?? 'http://127.0.0.1:4173';
const artifacts = resolve('qa-artifacts/location-pages');
await mkdir(artifacts, { recursive: true });
const config = transformSync(await readFile('src/config/locations.ts', 'utf8'), { loader: 'ts', format: 'esm' }).code;
const { locationPages } = await import(`data:text/javascript;base64,${Buffer.from(config).toString('base64')}`);
const city = locationPages[0];
const path = `/recovery/${city.slug}`;
const browser = await chromium.launch({ channel: process.env.QA_BROWSER ?? 'msedge', headless: true });
const results = { viewports: [], routes: [], interactions: [], homepage: [], pageErrors: [], consoleErrors: [], existingTrackingIssues: [] };
let homeBaseline;
try { homeBaseline = JSON.parse(await readFile(resolve(artifacts, 'baseline.json'), 'utf8')); } catch { /* Optional historical artifact. */ }

async function newPage(viewport, extra = {}) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce', ...extra });
  await consentedFunctionalContext(context);
  await context.addInitScript(() => {
    window.qaGpsCalls = 0;
    window.qaCsp = [];
    // This collector tests the existing UI hooks, not a working Google integration.
    window.dataLayer = [];
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value: {
      getCurrentPosition() { window.qaGpsCalls += 1; },
    } });
    document.addEventListener('securitypolicyviolation', (event) => window.qaCsp.push({
      directive: event.violatedDirective, blockedURI: event.blockedURI,
    }));
  });
  const page = await context.newPage();
  page.on('pageerror', (error) => results.pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && !/Content Security Policy|status of (404|503)/.test(message.text())) results.consoleErrors.push(message.text());
  });
  return page;
}
async function visit(page, route) {
  const response = await page.goto(origin + route, { waitUntil: 'networkidle' });
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((image) => image.decode().catch(() => {}))); });
  return response;
}
function normalizeDom(value) { return value.replaceAll(' style=""', ''); }
async function inspectLayout(page, label) {
  const metrics = await page.evaluate(() => ({
    width: innerWidth, documentWidth: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight,
    h1s: document.querySelectorAll('h1').length,
    phones: [...document.querySelectorAll('a[href^="tel:"]')].map((a) => a.getAttribute('href')),
    ids: [...document.querySelectorAll('[id]')].map((element) => element.id),
  }));
  assert.ok(metrics.documentWidth <= metrics.width, `${label}: horizontal overflow`);
  assert.equal(metrics.h1s, 1);
  assert.ok(metrics.phones.length > 0 && metrics.phones.every((href) => href === 'tel:+441234900700'));
  assert.equal(new Set(metrics.ids).size, metrics.ids.length, 'Duplicate IDs');
  assert.equal(await page.evaluate(() => window.qaGpsCalls), 0, 'City page must not request GPS');
  return { label, ...metrics };
}
async function checkContactClick(page, link, eventName) {
  await link.evaluate((element) => element.addEventListener('click', (event) => event.preventDefault(), { once: true }));
  await link.click();
  const event = await page.evaluate(() => window.dataLayer.at(-1));
  assert.equal(event.event, eventName);
  assert.deepEqual(Object.keys(event).sort(), ['event', 'location']);
}
async function checkControls(page, touch = false) {
  const coverage = page.getByRole('button', { name: /^View (more|fewer) areas$/ });
  const panel = page.locator(`[id="${await coverage.getAttribute('aria-controls')}"]`);
  assert.equal(await coverage.getAttribute('aria-expanded'), 'false');
  assert.equal(await panel.isVisible(), false);
  if (touch) { await coverage.scrollIntoViewIfNeeded(); await coverage.tap(); }
  else { await coverage.focus(); await page.keyboard.press('Enter'); }
  assert.equal(await coverage.getAttribute('aria-expanded'), 'true');
  assert.equal(await panel.locator('li').count(), city.coverage.areas.length - city.coverage.initialCount);
  await page.screenshot({ path: resolve(artifacts, `master-coverage-${touch ? 'touch' : 'keyboard'}.png`) });
  if (touch) await coverage.tap(); else await page.keyboard.press('Space');
  assert.equal(await panel.isVisible(), false);
  for (const faq of city.faqs) {
    const button = page.getByRole('button', { name: faq.question, exact: true });
    const answer = page.locator(`[id="${await button.getAttribute('aria-controls')}"]`);
    assert.equal(await answer.isVisible(), false);
    await button.focus();
    await page.keyboard.press('Enter');
    assert.equal(await button.getAttribute('aria-expanded'), 'true');
    assert.equal(await answer.isVisible(), true);
    await page.keyboard.press('Space');
    assert.equal(await answer.isVisible(), false);
  }
  results.interactions.push(touch ? 'Coverage touch expansion/collapse' : 'Coverage and all FAQ controls: Enter/Space, expanded states, hidden panels');
}

try {
  for (const [width, height] of [[1440, 900], [1180, 750], [768, 1024], [390, 844], [320, 844]]) {
    const page = await newPage({ width, height });
    assert.equal((await visit(page, '/')).status(), 200);
    const homeHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const homeCsp = await page.evaluate(() => window.qaCsp);
    assert.deepEqual(await page.locator('a[href*="wa.me"]').evaluateAll((links) => links.map((link) => new URL(link.href).searchParams.get('text'))),
      Array(await page.locator('a[href*="wa.me"]').count()).fill('Hi Teleport Recovery, I need vehicle recovery.\n\nPickup:\n\nDestination:\n\nVehicle / reg:\n\nWhat happened:'));
    await page.screenshot({ path: resolve(artifacts, `master-home-${width}.png`) });
    const snapshot = await page.evaluate(() => ({
      main: document.querySelector('main').innerHTML, header: document.querySelector('header').innerHTML,
      footer: (() => { const footer = document.querySelector('footer').cloneNode(true); footer.querySelectorAll('[data-privacy-settings]').forEach((button) => button.remove()); return footer.innerHTML; })(), title: document.title,
      description: document.querySelector('meta[name="description"]').content,
      canonical: document.querySelector('link[rel="canonical"]').href,
    }));
    const baseline = homeBaseline?.find((item) => item.width === width);
    if (baseline) for (const key of Object.keys(snapshot)) assert.equal(normalizeDom(snapshot[key]), normalizeDom(baseline[key]), `Homepage changed: ${width} ${key}`);
    results.homepage.push({ width, comparedToHistoricalBaseline: Boolean(baseline), genericWhatsAppPreserved: true });

    assert.equal((await visit(page, path)).status(), 200);
    assert.equal(await page.title(), city.metaTitle);
    assert.equal(await page.locator('meta[name="description"]').getAttribute('content'), city.metaDescription);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://teleportrecovery.co.uk' + path);
    assert.equal(await page.locator('h1').innerText(), city.heading);
    assert.equal(await page.locator('script[src*="googletagmanager.com/gtag/js"]').count(), 1);
    for (const href of await page.locator('a[href*="wa.me"]').evaluateAll((links) => links.map((link) => link.href))) {
      const url = new URL(href);
      assert.equal(url.origin + url.pathname, 'https://wa.me/447827079669');
      assert.equal(url.searchParams.get('text'), city.whatsappMessage);
    }
    assert.equal(await page.locator('main a[href*="wa.me"]', { hasText: 'WhatsApp for a Quote' }).count(), 2);
    const metrics = await inspectLayout(page, `${width}x${height}`);
    assert.ok(metrics.height < homeHeight, 'City page should be shorter than the nationwide homepage');
    const phone = await page.locator('main a[href^="tel:"]').first().boundingBox();
    const sticky = await page.locator('.mobile-conversion-bar').boundingBox();
    assert.ok(phone.y + phone.height < (width < 1024 ? sticky.y : height), 'Hero call must be visible above sticky bar');
    assert.deepEqual(homeCsp, [], 'Homepage CSP failure');
    assert.deepEqual(await page.evaluate(() => window.qaCsp), [], 'City CSP failure');
    await page.screenshot({ path: resolve(artifacts, `master-city-${width}.png`) });
    await page.screenshot({ path: resolve(artifacts, `master-city-full-${width}.png`), fullPage: true });
    await checkContactClick(page, page.locator('main a[href^="tel:"]').first(), 'call_click');
    await checkContactClick(page, page.locator('main a[href*="wa.me"]').first(), 'whatsapp_click');
    if (width === 390) {
      await checkControls(page);
      for (const section of ['#location-services-heading', '#location-process-heading', '#location-guarantee-heading', '#location-faq-heading']) {
        await page.locator(section).scrollIntoViewIfNeeded();
        await page.screenshot({ path: resolve(artifacts, `master${section.slice(1)}-${width}.png`) });
      }
    }
    results.viewports.push({ ...metrics, homepageHeight: homeHeight, callVisible: true });
    if (width === 1440) results.existingTrackingIssues = homeCsp;
    await page.context().close();
  }

  const page = await newPage({ width: 390, height: 844 });
  for (const route of ['/', path, `${path}/`, `${path}/index.html`, `${path}?gclid=local-test-only`, '/terms', '/guarantee', '/privacy', '/recovery/bedford', '/recovery/milton-keynes', '/recovery/northampton', `${path}/extra`]) {
    const response = await visit(page, route);
    const expected = /bedford|milton-keynes|northampton|\/extra/.test(route) ? 404 : 200;
    assert.equal(response.status(), expected, route);
    if (route.startsWith(path) && expected === 200) {
      assert.equal(await page.locator('h1').innerText(), city.heading);
      assert.equal((await page.reload({ waitUntil: 'networkidle' })).status(), 200);
    }
    results.routes.push({ route, status: response.status() });
  }
  await visit(page, path);
  await page.getByRole('link', { name: 'Read eligibility, exclusions and refund details' }).click();
  await page.waitForURL('**/guarantee');
  await page.goBack({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('h1').innerText(), city.heading);
  await page.goForward({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('h1').innerText(), 'Money-Back Guarantee');
  results.interactions.push('Guarantee navigation and browser back/forward');

  await visit(page, path);
  await page.evaluate(() => { document.body.tabIndex = -1; document.body.focus(); document.body.removeAttribute('tabindex'); });
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.textContent), 'Skip to content');
  await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'main-content');
  // Inspect every focus stop in both directions, without triggering calls or sending messages.
  for (const direction of ['Tab', 'Shift+Tab']) {
    const visited = new Set();
    for (let index = 0; index < 60; index++) {
      await page.bringToFront();
      await page.keyboard.press(direction);
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const focus = await page.evaluate(() => {
        const element = document.activeElement;
        if (element === document.body || !document.hasFocus()) return null;
        const rect = element.getBoundingClientRect();
        const points = [...element.getClientRects()].flatMap((line) => [0.2, 0.5, 0.8].map((part) => [line.x + line.width * part, line.y + line.height / 2]));
        return { key: element.outerHTML, text: element.textContent, visible: rect.width > 0 && rect.height > 0,
          unobscured: points.some(([x, y]) => x >= 0 && x < innerWidth && y >= 0 && y < innerHeight && element.contains(document.elementFromPoint(x, y))),
          focusRing: getComputedStyle(element).boxShadow !== 'none' };
      });
      if (!focus || visited.has(focus.key)) break;
      visited.add(focus.key);
      assert.ok(focus.visible && focus.unobscured, `Obscured keyboard focus: ${focus.text}`);
      assert.ok(focus.focusRing || focus.text === 'Skip to content', `Missing focus ring: ${focus.text}`);
    }
    assert.ok(visited.size > 10);
    results.interactions.push(`${direction}: ${visited.size} visible, unobscured focus stops`);
  }
  await page.getByRole('button', { name: 'Toggle navigation' }).count().then(async (count) => {
    // Header control names are preserved; find by its expanded state if labelled differently.
    const menu = count ? page.getByRole('button', { name: 'Toggle navigation' }) : page.locator('header button[aria-expanded]');
    await menu.click();
    assert.equal(await menu.getAttribute('aria-expanded'), 'true');
    await page.keyboard.press('Escape');
    assert.equal(await menu.getAttribute('aria-expanded'), 'false');
  });
  results.interactions.push('Existing mobile menu opens and closes with Escape');

  for (const variant of ['text200', 'text-spacing', 'reflow320']) {
    await page.setViewportSize({ width: variant === 'reflow320' ? 320 : 390, height: 844 });
    await visit(page, path);
    if (variant === 'text200') await page.addStyleTag({ content: 'html { font-size: 200%; }' });
    if (variant === 'text-spacing') await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }' });
    await page.getByRole('button', { name: 'View more areas', exact: true }).click();
    await page.getByRole('button', { name: city.faqs.at(-1).question }).click();
    results.viewports.push(await inspectLayout(page, variant));
    await page.screenshot({ path: resolve(artifacts, `master-${variant}.png`), fullPage: true });
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await visit(page, path);
  let posts = 0;
  await page.route('**/__forms/callback.html', async (route) => {
    posts++;
    assert.equal(route.request().method(), 'POST');
    await route.fulfill({ status: posts === 1 ? 503 : 200, contentType: 'text/plain', body: posts === 1 ? 'QA failure' : 'QA accepted' });
  });
  await page.getByRole('button', { name: 'Request Callback', exact: true }).click();
  assert.equal(posts, 0, 'Invalid empty form must not submit');
  await page.getByLabel('Your name', { exact: true }).fill('Local QA');
  await page.getByLabel('Phone number', { exact: true }).fill('01234 900 700');
  await page.getByLabel('Your location').fill('Intercepted locally');
  await page.getByRole('button', { name: 'Request Callback', exact: true }).click();
  await page.getByRole('alert').waitFor();
  assert.equal(await page.getByText('Callback requested', { exact: true }).count(), 0);
  await page.getByRole('button', { name: 'Request Callback', exact: true }).click();
  await page.getByText('Callback requested', { exact: true }).waitFor();
  assert.equal(posts, 2);
  assert.equal(await page.evaluate(() => window.dataLayer.filter((item) => item.event === 'callback_submit').length), 1);
  assert.equal(await page.evaluate(() => window.qaGpsCalls), 0);
  results.interactions.push('Shared callback: native required-field validation, failure/retry, one confirmed-success UI event; all submissions intercepted locally');
  await page.context().close();

  const touchPage = await newPage({ width: 390, height: 844 }, { hasTouch: true, isMobile: true });
  await visit(touchPage, path);
  await checkControls(touchPage, true);
  await touchPage.context().close();

  assert.deepEqual(results.pageErrors, []);
  assert.deepEqual(results.consoleErrors, []);
  console.log(JSON.stringify({ viewports: results.viewports.length, routes: results.routes.length, homepageComparisons: results.homepage,
    interactions: results.interactions, existingTrackingIssues: results.existingTrackingIssues }, null, 2));
} finally {
  await writeFile(resolve(artifacts, 'master-verification.json'), JSON.stringify(results, null, 2));
  await browser.close();
}
