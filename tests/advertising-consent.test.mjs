import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { transformSync } from 'esbuild';

const moduleUrl = (source) => `data:text/javascript;base64,${Buffer.from(transformSync(source, { loader: 'ts', format: 'esm' }).code).toString('base64')}`;
const businessUrl = moduleUrl(readFileSync('src/config/business.ts', 'utf8'));
const source = readFileSync('src/lib/advertisingConsent.ts', 'utf8').replace("from '../config/business'", `from '${businessUrl}'`);
let sequence = 0;
async function environment(t, initial, readOnly = false) {
  const values = new Map(initial ? [['teleport-advertising-consent', JSON.stringify(initial)]] : []);
  const scripts = [], cookies = [], events = new Map();
  let reloads = 0;
  const originalTimer = globalThis.setTimeout, originalClear = globalThis.clearTimeout;
  globalThis.setTimeout = () => 1;
  globalThis.clearTimeout = () => {};
  globalThis.window = {
    localStorage: { getItem: (key) => values.get(key) ?? null,
      setItem(key, value) { if (readOnly) throw new Error('Storage unavailable'); values.set(key, value); },
      removeItem(key) { if (readOnly) throw new Error('Storage unavailable'); values.delete(key); } },
    location: { hostname: 'teleportrecovery.co.uk', reload() { reloads++; } },
    addEventListener(name, listener) { events.set(name, listener); },
  };
  globalThis.document = { head: { appendChild(script) { scripts.push(script); } }, createElement: () => ({}),
    get cookie() { return '_gcl_aw=ad; gwcc=call; essential=keep'; }, set cookie(value) { cookies.push(value); } };
  t.after(() => { delete globalThis.window; delete globalThis.document; globalThis.setTimeout = originalTimer; globalThis.clearTimeout = originalClear; });
  const consent = await import(moduleUrl(source) + `#${sequence++}`);
  return { consent, values, scripts, cookies, events, reloads: () => reloads };
}
const saved = (choice, updatedAt = Date.now()) => ({ version: 1, choice, updatedAt });

test('fresh and rejected visitors never load or initialise Google advertising', async (t) => {
  const env = await environment(t);
  env.consent.startAdvertisingConsent();
  assert.equal(env.consent.getAdvertisingChoice(), null);
  assert.equal(env.scripts.length, 0);
  assert.equal(window.dataLayer, undefined);
  assert.ok(env.consent.saveAdvertisingChoice('rejected'));
  assert.equal(env.scripts.length, 0);
  assert.equal(window.gtag, undefined);
  assert.equal(JSON.parse(env.values.get(env.consent.CONSENT_STORAGE_KEY)).choice, 'rejected');
});

test('acceptance orders consent v2 before the preserved configs and loads one tag only', async (t) => {
  const { consent, scripts } = await environment(t);
  consent.startAdvertisingConsent(); consent.startAdvertisingConsent();
  consent.saveAdvertisingChoice('accepted'); consent.saveAdvertisingChoice('accepted');
  assert.equal(scripts.length, 1);
  assert.equal(scripts[0].src, 'https://www.googletagmanager.com/gtag/js?id=AW-18493914811');
  const commands = window.dataLayer.map((command) => Array.from(command));
  assert.deepEqual(commands[0], ['consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' }]);
  assert.deepEqual(commands[1], ['consent', 'update', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'denied', analytics_storage: 'denied' }]);
  assert.deepEqual(commands.filter(([name]) => name === 'config').map((command) => command[1]), [consent.GOOGLE_ADS_ID, consent.WEBSITE_CALL_ID]);
  assert.equal(commands.at(-1)[2].phone_conversion_number, '01234 900 700');
  assert.ok(!commands.some(([name]) => name === 'event'), 'No fabricated conversion event');
});

test('withdrawal persists rejection, denies signals, clears only Ads cookies and unloads via reload', async (t) => {
  const { consent, cookies, reloads, scripts } = await environment(t, saved('accepted'));
  consent.startAdvertisingConsent();
  assert.equal(scripts.length, 1);
  consent.saveAdvertisingChoice('rejected');
  assert.equal(consent.getAdvertisingChoice(), 'rejected');
  assert.equal(reloads(), 1);
  assert.ok(cookies.some((cookie) => cookie.startsWith('_gcl_aw=;')));
  assert.ok(cookies.some((cookie) => cookie.startsWith('gwcc=;')));
  assert.ok(!cookies.some((cookie) => cookie.startsWith('essential=')));
  assert.deepEqual(Array.from(window.dataLayer.at(-1)).slice(0, 2), ['consent', 'update']);
  assert.equal(Array.from(window.dataLayer.at(-1))[2].ad_storage, 'denied');
});

test('expired, invalid, unknown-version and future-dated choices fail closed', async (t) => {
  const { consent, scripts } = await environment(t, saved('accepted', Date.now() - 181 * 86400000));
  for (const value of ['{', 'null', '{}', JSON.stringify(saved('unknown')), JSON.stringify({ ...saved('accepted'), version: 2 }), JSON.stringify(saved('accepted', Date.now() + 86400000))]) {
    assert.equal(consent.parseConsent(value), null);
  }
  assert.equal(consent.parseConsent(JSON.stringify(saved('accepted', 100)), 100 + consent.CONSENT_LIFETIME_MS), null);
  consent.startAdvertisingConsent();
  assert.equal(consent.getAdvertisingChoice(), null);
  assert.equal(scripts.length, 0);
});

test('storage failure cannot enable or restore advertising acceptance', async (t) => {
  const { consent, scripts } = await environment(t, saved('accepted'), true);
  consent.startAdvertisingConsent();
  assert.equal(consent.getAdvertisingChoice(), null);
  assert.equal(consent.saveAdvertisingChoice('accepted'), false);
  assert.equal(scripts.length, 0);
  assert.doesNotThrow(() => consent.saveAdvertisingChoice('rejected'));
  assert.equal(consent.getAdvertisingChoice(), 'rejected');
});

test('cross-tab withdrawal and back-forward restoration apply the current stored preference', async (t) => {
  const { consent, values, events, reloads } = await environment(t, saved('accepted'));
  consent.startAdvertisingConsent();
  values.set(consent.CONSENT_STORAGE_KEY, JSON.stringify(saved('rejected')));
  events.get('storage')({ key: consent.CONSENT_STORAGE_KEY });
  assert.equal(consent.getAdvertisingChoice(), 'rejected');
  assert.equal(reloads(), 1);
  events.get('pageshow')();
  assert.equal(consent.getAdvertisingChoice(), 'rejected');
});

test('static HTML has no eager Google tag and CSP does not weaken script execution', () => {
  assert.doesNotMatch(readFileSync('index.html', 'utf8'), /googletagmanager|gtag\(/);
  const config = readFileSync('vite.config.ts', 'utf8');
  const scriptPolicy = config.match(/`script-src[^`]+`/)[0];
  assert.doesNotMatch(scriptPolicy, /unsafe-inline|unsafe-eval|\*/);
  assert.match(scriptPolicy, /www\.gstatic\.com\/wcm\//);
  assert.match(scriptPolicy, /www\.googletagmanager\.com/);
});
