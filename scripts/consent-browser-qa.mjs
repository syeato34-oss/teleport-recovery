// Production CSP + real Google-library checks; no Ads click, call or conversion is made.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const origin = process.env.QA_URL ?? 'http://127.0.0.1:4173';
const output = resolve(process.env.QA_OUTPUT ?? 'qa-artifacts/consent');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: process.env.QA_BROWSER ?? 'msedge', headless: true });
const key = 'teleport-advertising-consent';
const results = { origin, at: new Date().toISOString(), pages: [], accessibility: [], csp: [], pageErrors: [], consoleErrors: [], requests: [], scriptResponses: [] };
const advertisingHosts = ['www.googletagmanager.com', 'www.googleadservices.com', 'www.google.com', 'www.google.co.uk', 'www.google.com.pk', 'www.gstatic.com', 'googleads.g.doubleclick.net', 'ad.doubleclick.net', 'pagead2.googlesyndication.com'];
const isAdvertising = (url) => advertisingHosts.includes(new URL(url).hostname);

async function createPage(viewport = { width: 390, height: 844 }, extra = {}) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce', ...extra });
  await context.addInitScript(() => {
    window.qaCsp = [];
    document.addEventListener('securitypolicyviolation', (event) => window.qaCsp.push({ directive: event.violatedDirective, blocked: event.blockedURI }));
  });
  const page = await context.newPage();
  const traffic = [];
  page.on('request', (request) => {
    if (isAdvertising(request.url())) {
      const url = new URL(request.url());
      traffic.push(url.origin + url.pathname);
      results.requests.push({ origin: url.origin, path: url.pathname });
    }
  });
  page.on('response', (response) => {
    if (isAdvertising(response.url()) && response.request().resourceType() === 'script') results.scriptResponses.push({ url: response.url(), status: response.status() });
  });
  page.on('pageerror', (error) => results.pageErrors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') results.consoleErrors.push(message.text()); });
  return { page, traffic };
}
async function visit(page, route) {
  assert.equal((await page.goto(origin + route, { waitUntil: 'networkidle' })).status(), 200);
}
async function noAdvertising(page, traffic) {
  assert.equal(traffic.length, 0, 'Advertising network request while consent is absent/denied');
  assert.equal(await page.locator('script[src*="googletagmanager.com/gtag/js"]').count(), 0);
  assert.equal(await page.evaluate(() => typeof window.gtag), 'undefined');
  assert.equal(await page.evaluate(() => window.dataLayer?.length ?? 0), 0, 'No pre-consent event buffering');
}
async function checkCoreLinks(page, route) {
  const phone = page.locator('main a[href^="tel:"]').first();
  const whatsapp = page.locator('main a[href*="wa.me"]').first();
  assert.equal(await page.locator('main .whatsapp-location-button').first().isEnabled(), true);
  assert.equal(await page.locator('.mobile-conversion-bar .whatsapp-location-button').isEnabled(), true);
  assert.equal(await phone.getAttribute('href'), 'tel:+441234900700');
  const hasManualQuote = await whatsapp.count() > 0;
  if (hasManualQuote) {
    const wa = new URL(await whatsapp.getAttribute('href'));
    assert.equal(wa.origin + wa.pathname, 'https://wa.me/447827079669');
    assert.equal(wa.searchParams.get('text').includes('in Birmingham'), route.includes('birmingham'));
  }
  for (const link of hasManualQuote ? [phone, whatsapp] : [phone]) {
    await link.evaluate((element) => element.addEventListener('click', (event) => event.preventDefault(), { once: true }));
    await link.click();
  }
  assert.equal(await page.locator('#callback form:not([inert])').count(), 1);
}
async function collectCsp(page) { results.csp.push(...await page.evaluate(() => window.qaCsp)); }
async function assertLayout(page) {
  const layout = await page.evaluate(() => {
    const notice = document.querySelector('.consent-panel').getBoundingClientRect();
    const sticky = document.querySelector('.mobile-conversion-bar').getBoundingClientRect();
    const phone = document.querySelector('main a[href^="tel:"]').getBoundingClientRect();
    return { width: innerWidth, scrollWidth: document.documentElement.scrollWidth, noticeBottom: notice.bottom,
      noticeTop: notice.top, stickyTop: sticky.top, phoneBottom: phone.bottom,
      buttons: [...document.querySelectorAll('.consent-panel button')].map((button) => {
        const rect = button.getBoundingClientRect(); return { width: rect.width, height: rect.height, background: getComputedStyle(button).backgroundColor };
      }) };
  });
  assert.ok(layout.scrollWidth <= layout.width);
  assert.ok(layout.noticeBottom <= layout.stickyTop + 1, 'Consent must not cover mobile call/WhatsApp bar');
  assert.ok(layout.phoneBottom <= layout.noticeTop + 1, 'Hero call must remain above the consent notice');
  assert.ok(layout.buttons.every((button) => button.width >= 44 && button.height >= 44));
  assert.equal(layout.buttons[0].background, layout.buttons[1].background, 'Accept/Reject must have equal prominence');
  return layout;
}

try {
  for (const route of ['/', '/recovery/birmingham']) {
    const { page, traffic } = await createPage();
    await visit(page, route);
    await noAdvertising(page, traffic);
    await assertLayout(page);
    await checkCoreLinks(page, route);
    await noAdvertising(page, traffic);
    await page.screenshot({ path: resolve(output, `${route === '/' ? 'home' : 'birmingham'}-fresh.png`) });
    await page.getByRole('button', { name: 'Reject advertising', exact: true }).click();
    assert.equal(await page.locator('.consent-panel').count(), 0);
    assert.equal(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).choice, key), 'rejected');
    // Rejection must not prevent a customer-requested callback or generate a tracking event.
    await page.route('**/__forms/callback.html', (route) => route.fulfill({ status: 200, contentType: 'text/plain', body: 'Local QA acceptance; never submitted to Netlify.' }));
    await page.getByLabel('Your name', { exact: true }).fill('Local consent QA');
    await page.getByLabel('Phone number', { exact: true }).fill('01234 900 700');
    await page.getByRole('button', { name: 'Request Callback', exact: true }).click();
    await page.getByText('Callback requested', { exact: true }).waitFor();
    await noAdvertising(page, traffic);
    await page.unroute('**/__forms/callback.html');
    await visit(page, route);
    await noAdvertising(page, traffic);
    await page.locator('footer').getByRole('button', { name: 'Advertising privacy settings' }).click();
    assert.equal(await page.evaluate(() => document.activeElement.id), 'advertising-consent-title');
    await page.getByRole('button', { name: 'Accept advertising', exact: true }).click();
    await page.waitForFunction(() => typeof window.google_trackConversion === 'function' || [...document.scripts].some((script) => /call-tracking\/call-tracking/.test(script.src)), { timeout: 15000 });
    await page.waitForTimeout(2000);
    assert.equal(await page.locator('#teleport-google-ads').count(), 1);
    assert.equal(traffic.filter((url) => url.includes('/gtag/js')).length, 1);
    const commands = await page.evaluate(() => window.dataLayer.filter((item) => typeof item?.[0] === 'string').map((item) => Array.from(item)));
    assert.deepEqual(commands[0], ['consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' }]);
    assert.equal(commands[1][0], 'consent');
    assert.deepEqual(commands[1][2], { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'denied', analytics_storage: 'denied' });
    assert.equal(commands.filter(([command, id]) => command === 'config' && id === 'AW-18493914811').length, 1);
    assert.equal(commands.filter(([command, id]) => command === 'config' && id === 'AW-18493914811/BRTACI7HpZUdELv9yvJE').length, 1);
    assert.ok(!commands.some(([command, event]) => command === 'event' && event === 'conversion'));
    await collectCsp(page);
    await page.locator('footer').getByRole('button', { name: 'Advertising privacy settings' }).click();
    await page.getByRole('button', { name: 'Accept advertising', exact: true }).click();
    assert.equal(traffic.filter((url) => url.includes('/gtag/js')).length, 1, 'Repeated accept duplicated Google tag');
    // An accepted real Google library can keep requests open; readiness is DOM/tag based.
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('#teleport-google-ads').waitFor({ state: 'attached' });
    assert.equal(await page.locator('#teleport-google-ads').count(), 1, 'Stored acceptance should restore exactly one tag');
    await page.waitForTimeout(2000);
    await checkCoreLinks(page, route);
    await collectCsp(page);
    await page.locator('footer').getByRole('button', { name: 'Advertising privacy settings' }).click();
    await Promise.all([page.waitForEvent('domcontentloaded'), page.getByRole('button', { name: 'Reject advertising', exact: true }).click()]);
    await page.waitForLoadState('networkidle');
    const afterReload = traffic.length;
    await checkCoreLinks(page, route);
    await page.waitForTimeout(1000);
    assert.equal(traffic.length, afterReload, 'New advertising requests after withdrawal reload');
    assert.equal(await page.locator('#teleport-google-ads').count(), 0);
    assert.equal(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).choice, key), 'rejected');
    const cookies = await page.context().cookies(origin);
    assert.ok(!cookies.some((cookie) => /^(?:_gcl_|gwcc$)/.test(cookie.name)));
    traffic.length = 0;
    await visit(page, route === '/' ? '/recovery/birmingham' : '/');
    await noAdvertising(page, traffic);
    await collectCsp(page);
    results.pages.push({ route, fresh: true, rejected: true, acceptedRealLibrary: true, persisted: true, withdrawn: true, coreLinks: true });
    await page.context().close();
  }

  for (const [width, height] of [[320, 844], [768, 1024]]) {
    const { page, traffic } = await createPage({ width, height }, { hasTouch: true, isMobile: true });
    await visit(page, '/recovery/birmingham');
    await assertLayout(page);
    await page.getByRole('button', { name: 'Reject advertising', exact: true }).tap();
    await noAdvertising(page, traffic);
    await page.locator('footer').getByRole('button', { name: 'Advertising privacy settings' }).tap();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.consent-panel').count(), 0);
    assert.equal(await page.evaluate(() => document.activeElement.hasAttribute('data-privacy-settings')), true);
    results.accessibility.push({ width, touchReject: true, escapeReturnsFocus: true });
    await page.context().close();
  }

  const { page, traffic } = await createPage({ width: 390, height: 844 });
  await visit(page, '/recovery/birmingham');
  await page.addStyleTag({ content: 'html { font-size: 200%; }' });
  await page.getByRole('button', { name: 'Reject advertising', exact: true }).focus();
  await page.keyboard.press('Enter');
  await noAdvertising(page, traffic);
  await page.locator('footer').getByRole('button', { name: 'Advertising privacy settings' }).click();
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.getByRole('button', { name: 'Reject advertising', exact: true }).focus();
  const visible = await page.getByRole('button', { name: 'Reject advertising', exact: true }).evaluate((button) => {
    const rect = button.getBoundingClientRect(); return button.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
  });
  assert.ok(visible, 'Text-scaled consent button is obscured');
  assert.ok(await page.locator('.consent-panel button').evaluateAll((buttons) => buttons.every((button) => {
    const bounds = button.getBoundingClientRect();
    const text = document.createRange(); text.selectNodeContents(button);
    return [...text.getClientRects()].every((line) => line.left >= bounds.left && line.right <= bounds.right);
  })), 'Enlarged consent labels must fit inside their buttons');
  await page.screenshot({ path: resolve(output, 'text200-settings.png') });
  results.accessibility.push({ text200: true, keyboardReject: true, noOverflow: true });
  await page.context().close();
  assert.deepEqual(results.csp, []);
  assert.deepEqual(results.pageErrors, []);
  assert.deepEqual(results.consoleErrors, []);
  assert.ok(results.scriptResponses.some((response) => response.url.includes('/gtag/js') && response.status === 200));
  assert.ok(results.scriptResponses.some((response) => response.url.includes('/call-tracking/') && response.status === 200));
  results.result = 'passed';
  console.log(JSON.stringify({ result: results.result, pages: results.pages, accessibility: results.accessibility, csp: results.csp, scriptResponses: results.scriptResponses }, null, 2));
} catch (error) {
  results.result = 'failed'; results.error = error.stack; throw error;
} finally {
  await writeFile(resolve(output, 'verification.json'), JSON.stringify(results, null, 2));
  await browser.close();
}
