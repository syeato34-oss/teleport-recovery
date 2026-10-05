import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { transformSync } from 'esbuild';

async function loadTypescript(path) {
  const result = transformSync(readFileSync(path, 'utf8'), { loader: 'ts', format: 'esm', target: 'es2020' });
  return import(`data:text/javascript;base64,${Buffer.from(result.code).toString('base64')}`);
}
const callback = await loadTypescript('src/lib/callback.ts');
const { trackEvent } = await loadTypescript('src/lib/tracking.ts');
const { businessConfig } = await loadTypescript('src/config/business.ts');
function enquiry() {
  const form = new FormData();
  form.set('name', ' QA visitor ');
  form.set('phone', ' +44 1234 900700 ');
  form.set('details', 'A & B = recovery');
  return form;
}

test('phone validation accepts international formatting and rejects malformed values', () => {
  for (const phone of ['01234 900 700', '+44 (1234) 900-700', '020 7946 0123']) assert.ok(callback.isCallbackPhoneValid(phone));
  for (const phone of ['', 'abcdefg', '123456', '+44+1234 900700', '1234567890123456']) assert.equal(callback.isCallbackPhoneValid(phone), false);
});

test('callback sends the detected form and URL-encodes fields', async () => {
  await callback.submitCallback(enquiry(), async (url, options) => {
    assert.equal(url, callback.CALLBACK_ENDPOINT);
    assert.equal(options.method, 'POST');
    assert.equal(options.headers['Content-Type'], 'application/x-www-form-urlencoded');
    const fields = new URLSearchParams(options.body);
    assert.equal(fields.get('form-name'), callback.CALLBACK_FORM_NAME);
    assert.equal(fields.get('name'), 'QA visitor');
    assert.equal(fields.get('details'), 'A & B = recovery');
    assert.deepEqual([...fields.keys()].sort(), ['bot-field', 'details', 'form-name', 'location', 'name', 'phone'].sort());
    assert.ok(options.signal instanceof AbortSignal);
    return new Response('', { status: 200 });
  });
});

test('callback does not claim success for failed, offline or unprocessed responses', async () => {
  for (const response of [
    new Response('Not found', { status: 404 }),
    new Response('Unavailable', { status: 500 }),
    new Response('<html data-callback-unprocessed="true">'),
    new Response('<div id="root"></div>'),
    new Response('<script type="module" src="/src/main.tsx"></script>'),
    new Response('<script src="/assets/index-abc.js"></script>'),
  ]) await assert.rejects(callback.submitCallback(enquiry(), async () => response));
  await assert.rejects(callback.submitCallback(enquiry(), async () => { throw new TypeError('Offline'); }));
});

test('honeypot prevents a false accepted response and no request is sent', async () => {
  const form = enquiry();
  form.set('bot-field', 'spam');
  let sent = false;
  await assert.rejects(callback.submitCallback(form, async () => { sent = true; return new Response(''); }));
  assert.equal(sent, false);
});

test('form detection blueprint stays aligned with the submission contract', () => {
  const html = readFileSync('index.html', 'utf8');
  assert.match(html, new RegExp(`name="${callback.CALLBACK_FORM_NAME}"`));
  assert.match(html, /data-netlify="true"/);
  assert.match(html, /data-netlify-honeypot="bot-field"/);
  for (const field of ['form-name', 'name', 'phone', 'location', 'details', 'bot-field']) assert.ok(html.includes(`name="${field}"`));
});

test('tracking is optional, contains no customer details and cannot block an action', () => {
  delete globalThis.window;
  assert.doesNotThrow(() => trackEvent('call_click', { location: 'hero' }));
  globalThis.window = {};
  assert.doesNotThrow(() => trackEvent('call_click'));
  const items = [];
  globalThis.window = { dataLayer: items };
  trackEvent('callback_submit', { location: 'contact' });
  assert.deepEqual(items, [{ event: 'callback_submit', location: 'contact' }]);
  globalThis.window = { dataLayer: { push() { throw new Error('Analytics unavailable'); } } };
  assert.doesNotThrow(() => trackEvent('call_click'));
  delete globalThis.window;
});

test('public phone, ETA and known legal routes are centrally configured', () => {
  assert.equal(businessConfig.phoneHref, `tel:${businessConfig.phoneTel}`);
  assert.equal(businessConfig.averageEtaMinutes, 45);
  const config = readFileSync('netlify.toml', 'utf8');
  for (const path of [businessConfig.termsUrl, businessConfig.guaranteeUrl, businessConfig.privacyUrl]) {
    assert.ok(config.includes(`from = "${path}"`));
    assert.ok(config.includes(`to = "${path}/index.html"`));
  }
  assert.ok(!config.includes('to = "/index.html"'), 'A catch-all success rewrite would hide real 404s');
  assert.ok(!config.includes('from = "/__forms/'), 'Callback POST must not pass through redirects');
});
