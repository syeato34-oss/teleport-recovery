// No phone/WhatsApp handoff or live form submission. Forwarding fixtures are fictional.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build } from 'esbuild';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const origin = process.env.QA_URL ?? 'http://127.0.0.1:4173';
const live = new URL(origin).hostname === 'teleportrecovery.co.uk';
const output = resolve(process.env.QA_ARTIFACT_DIR ?? 'qa-artifacts/launch-audit');
await mkdir(output, { recursive: true });
const results = { origin, at: new Date().toISOString(), result: 'running', mode: live ? 'Live fallback/contact UI, Google isolated' : 'Local production + simulated Google callback', pages: [], callbacks: [], navigation: [], errors: [] };
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const fallback = 'tel:+441234900700', fictional = 'tel:+447700900123';

async function consentedFunctionalContext(context) {
  await context.route('https://www.googletagmanager.com/gtag/js**', (route) => route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* Network-isolated Google fixture, no advertising traffic. */' }));
  await context.addInitScript(() => {
    if (!localStorage.getItem('teleport-advertising-consent')) localStorage.setItem('teleport-advertising-consent', JSON.stringify({ version: 1, choice: 'accepted', updatedAt: Date.now() }));
  });
}

async function inventory(page) {
  return page.locator('a[href^="tel:"]').evaluateAll((links) => links.map((a) => ({
    region: a.closest('header,footer,section,.mobile-conversion-bar')?.getAttribute('id') || a.closest('header,footer,section,.mobile-conversion-bar')?.tagName,
    text: a.textContent.trim().replace(/\s+/g, ' '), aria: a.getAttribute('aria-label'), href: a.getAttribute('href'),
    visible: !!(a.getBoundingClientRect().width && a.getBoundingClientRect().height),
  })));
}
async function assertPhones(page, href) {
  const phones = await inventory(page);
  assert.ok(phones.length > 0);
  assert.ok(phones.every((a) => a.href === href), JSON.stringify(phones));
  const old = href === fallback ? '07700 900123' : '01234 900 700';
  assert.ok(phones.every((a) => !a.text.includes(old) && !a.aria?.includes(old)), 'Stale display or accessible name');
  assert.ok(phones.every((a) => !a.aria?.includes('PhoneNumber')), 'Accessible names must contain text, never component markup');
  return phones;
}
async function googleCallback(page, formatted = '07700 900123', number = '+447700900123') {
  await page.evaluate(({ formatted, number }) => {
    const config = window.dataLayer.find((item) => item[0] === 'config' && item[1] === 'AW-18493914811/BRTACI7HpZUdELv9yvJE')[2];
    if (typeof config.phone_conversion_callback !== 'function') throw Error('Missing React forwarding callback');
    config.phone_conversion_callback(formatted, number);
  }, { formatted, number });
  await page.waitForFunction((href) => [...document.querySelectorAll('a[href^="tel:"]')].every((a) => a.getAttribute('href') === href), number === '+447700900123' ? fictional : fallback);
}
async function openFAQs(page) {
  for (const button of await page.locator('main button[aria-expanded="false"][aria-controls*="faq"]').all()) await button.click();
}

try {
  for (const route of ['/', '/recovery/birmingham', '/terms', '/guarantee', '/privacy', '/not-a-real-page']) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    await consentedFunctionalContext(context);
    const page = await context.newPage();
    page.on('pageerror', (error) => results.errors.push(error.message));
    const response = await page.goto(origin + route, { waitUntil: 'networkidle' });
    assert.equal(response.status(), route === '/not-a-real-page' ? 404 : 200);
    await openFAQs(page);
    const phones = await assertPhones(page, fallback);
    const wa = await page.locator('a[href*="wa.me"]').evaluateAll((links) => links.map((a) => ({ text: a.textContent.trim().replace(/\s+/g, ' '), href: a.getAttribute('href'), region: a.closest('header,footer,section,.mobile-conversion-bar')?.id || a.closest('header,footer,section,.mobile-conversion-bar')?.tagName })));
    for (const link of wa) {
      const url = new URL(link.href);
      assert.equal(url.origin + url.pathname, 'https://wa.me/447827079669');
      const message = url.searchParams.get('text');
      if (message) assert.equal(message.includes('in Birmingham'), route.includes('birmingham'));
    }
    const config = await page.evaluate(() => window.dataLayer.filter((item) => item[0] === 'config').map((item) => ({ id: item[1], phone: item[2]?.phone_conversion_number, callback: typeof item[2]?.phone_conversion_callback })));
    const entry = { route, config, status: response.status(), title: await page.title(), canonical: await page.locator('link[rel="canonical"]').count() ? await page.locator('link[rel="canonical"]').getAttribute('href') : null, phones, whatsapp: wa };
    if (!live) {
      await googleCallback(page);
      entry.simulatedForwarding = await assertPhones(page, fictional);
      // Header navigation / accordion changes cause React renders without document reload.
      const menu = page.locator('header button[aria-expanded]');
      await menu.click(); await page.keyboard.press('Escape');
      await assertPhones(page, fictional);
      await googleCallback(page, '07700 900123', 'bad-value');
      await assertPhones(page, fallback);
      await googleCallback(page);
    }
    if (route === '/' || route.includes('birmingham')) {
      let posts = 0;
      await page.route('**/__forms/callback.html', async (request) => {
        posts++;
        assert.equal(request.request().method(), 'POST');
        await request.fulfill({ status: posts === 1 ? 503 : 200, contentType: 'text/plain', body: 'Intercepted launch QA only' });
      });
      const submit = page.getByRole('button', { name: 'Request Callback', exact: true });
      await submit.click(); assert.equal(posts, 0);
      await page.getByLabel('Your name', { exact: true }).fill('Intercepted QA');
      await page.getByLabel('Phone number', { exact: true }).fill('bad');
      await submit.click(); assert.equal(posts, 0);
      await page.getByLabel('Phone number', { exact: true }).fill('07700 900123');
      await submit.click(); await page.getByRole('alert').waitFor();
      entry.callbackFailurePhones = await assertPhones(page, live ? fallback : fictional);
      assert.equal(await page.getByText('Callback requested', { exact: true }).count(), 0);
      await submit.click(); await page.getByText('Callback requested', { exact: true }).waitFor();
      entry.callbackSuccessPhones = await assertPhones(page, live ? fallback : fictional);
      assert.equal(posts, 2);
      const events = await page.evaluate(() => window.dataLayer.filter((item) => item.event === 'callback_submit'));
      assert.equal(events.length, 1);
      assert.deepEqual(Object.keys(events[0]).sort(), ['event', 'location']);
      results.callbacks.push({ route, validation: 'empty/invalid blocked', failure: '503: honest alert', success: 'mock 200: one callback_submit', liveReceipt: 'UNVERIFIED: intercepted, no enquiry sent' });
    }
    assert.equal(await page.locator('script[src*="googletagmanager.com/gtag/js"]').count(), 1);
    assert.equal(await page.evaluate(() => window.dataLayer.filter((item) => item[0] === 'event' && item[1] === 'conversion').length), 0);
    if (!live) {
      // This invokes the real withdrawal path; a fresh document must show the fallback.
      await page.getByRole('button', { name: 'Advertising privacy settings', exact: true }).first().click();
      await Promise.all([page.waitForEvent('domcontentloaded'), page.getByRole('button', { name: 'Reject advertising', exact: true }).click()]);
      await assertPhones(page, fallback);
    }
    results.pages.push(entry);
    await context.close();
  }

  if (!live) {
    // Test a React route rerender in one JS realm. Production links use document navigation;
    // this harness does not add a SPA router or claim pushState alone renders a production route.
    const harness = await build({ stdin: { contents: `import React from 'react'; import {createRoot} from 'react-dom/client'; import App from './src/App'; const root=createRoot(document.getElementById('root')); window.qaRenderRoute=(path)=>{history.pushState({},'',path);root.render(<App/>)};window.qaRenderRoute('/');`, resolveDir: process.cwd(), loader: 'tsx' }, bundle: true, write: false, format: 'iife', alias: { '@': resolve('src') }, jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' } });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await consentedFunctionalContext(context);
    await context.route('**/qa-react-harness', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<div id="root"></div><script src="/qa-react-harness.js"></script>' }));
    await context.route('**/qa-react-harness.js', (route) => route.fulfill({ status: 200, contentType: 'application/javascript', body: harness.outputFiles[0].text }));
    const page = await context.newPage();
    await page.goto(origin + '/qa-react-harness', { waitUntil: 'networkidle' });
    await googleCallback(page);
    const marker = await page.evaluate(() => { window.qaRealmMarker = Math.random(); return window.qaRealmMarker; });
    for (const path of ['/recovery/birmingham', '/', '/privacy', '/recovery/birmingham']) {
      await page.evaluate((path) => window.qaRenderRoute(path), path);
      await page.waitForFunction((path) => location.pathname === path && (path !== '/recovery/birmingham' || document.querySelector('h1')?.textContent.includes('BROKEN DOWN IN BIRMINGHAM')), path);
      await assertPhones(page, fictional);
      assert.equal(await page.evaluate(() => window.qaRealmMarker), marker);
    }
    results.navigation.push('Simulated React route rerenders in one JS realm preserve shared forwarding state across page mounts');
    await context.close();
  }

  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await consentedFunctionalContext(context);
  const page = await context.newPage();
  await page.goto(origin + '/recovery/birmingham', { waitUntil: 'networkidle' });
  if (!live) await googleCallback(page);
  await page.locator('header a[href="/#top"]').first().click();
  await page.waitForURL(origin + '/#top');
  await assertPhones(page, fallback); // new document, Google has not supplied a number in this mock
  if (!live) await googleCallback(page);
  await page.goBack({ waitUntil: 'networkidle' });
  assert.ok((await page.locator('h1').innerText()).includes('BROKEN DOWN IN BIRMINGHAM'));
  const restoredHref = (await inventory(page))[0].href;
  await assertPhones(page, restoredHref); // BFCache preserves valid state; a new document starts safely.
  if (!live) await googleCallback(page);
  await page.goForward({ waitUntil: 'networkidle' });
  await assertPhones(page, (await inventory(page))[0].href);
  results.navigation.push('Actual header home navigation and browser back/forward: route/content and phone display/href stay consistent');
  await context.close();
  assert.deepEqual(results.errors, []);
  results.result = 'passed';
  console.log(JSON.stringify({ origin, pages: results.pages.length, callbacks: results.callbacks, navigation: results.navigation, errors: results.errors }, null, 2));
} catch (error) {
  results.result = 'failed'; results.error = error.stack; throw error;
} finally {
  await writeFile(resolve(output, live ? 'live-contact-browser.json' : 'local-contact-browser.json'), JSON.stringify(results, null, 2));
  await browser.close();
}
