import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { transformSync } from 'esbuild';

const result = transformSync(readFileSync('src/lib/whatsapp.ts', 'utf8'), { loader: 'ts', format: 'esm', target: 'es2020' });
const { getWhatsAppDestination, getPickupLocation, buildWhatsAppRecoveryUrl } = await import(
  `data:text/javascript;base64,${Buffer.from(result.code).toString('base64')}`
);

// Isolated fixture only. No test contacts WhatsApp or sends a message.
const destination = 'https://wa.me/447700900123';

test('WhatsApp destination accepts official phone links and rejects missing or misleading URLs', () => {
  assert.equal(getWhatsAppDestination(destination), destination);
  assert.equal(getWhatsAppDestination(`${destination}/?text=old-draft`), destination);
  assert.equal(getWhatsAppDestination('https://api.whatsapp.com/send?phone=447700900123&text=old'), destination);
  for (const value of [null, '', 'https://wa.me/', 'http://wa.me/447700900123', 'https://wa.me.evil.test/447700900123',
    'https://wa.me@evil.test/447700900123', 'https://user@wa.me/447700900123', 'https://wa.me/07700900123',
    'https://wa.me/+447700900123', 'https://wa.me/447700900123/extra', 'https://wa.me/1234567890123456',
    'https://api.whatsapp.com/send?phone=447700900123&phone=447700900124', 'javascript:alert(1)']) {
    assert.equal(getWhatsAppDestination(value), null, String(value));
  }
});

test('successful location produces an encoded reviewable recovery draft with a valid Maps link', () => {
  const url = new URL(buildWhatsAppRecoveryUrl(destination, { latitude: 52.123456, longitude: -0.56789 }));
  assert.equal(url.origin + url.pathname, destination);
  const message = url.searchParams.get('text');
  assert.ok(message.startsWith('Hi Teleport Recovery, I need vehicle recovery.\n\nPickup:\n'));
  assert.ok(message.endsWith('\n\nDestination:\n\nVehicle:\n\nWhat happened:'));
  const maps = new URL(message.split('\n')[3]);
  assert.equal(maps.origin + maps.pathname, 'https://www.google.com/maps/search/');
  assert.equal(maps.searchParams.get('api'), '1');
  assert.equal(maps.searchParams.get('query'), '52.123456,-0.56789');
  assert.deepEqual([...url.searchParams.keys()], ['text']);
});

test('missing or invalid coordinates still prepare a useful manual-location message', () => {
  for (const location of [null, { latitude: NaN, longitude: 0 }, { latitude: 91, longitude: 0 }, { latitude: 0, longitude: -181 }]) {
    const message = new URL(buildWhatsAppRecoveryUrl(destination, location)).searchParams.get('text');
    assert.ok(message.includes('Pickup:\nPlease send your current location in WhatsApp.'));
    assert.ok(!message.includes('google.com'));
    assert.ok(message.includes('Destination:\n\nVehicle:\n\nWhat happened:'));
  }
});

test('location makes one fresh bounded request and keeps only the coordinate pair', async () => {
  let calls = 0;
  const location = await getPickupLocation({
    getCurrentPosition(success, _error, options) {
      calls += 1;
      assert.deepEqual(options, { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 });
      success({ coords: { latitude: 52.1, longitude: -0.5, accuracy: 20, altitude: 40 }, timestamp: Date.now() });
    },
  });
  assert.equal(calls, 1);
  assert.deepEqual(location, { latitude: 52.1, longitude: -0.5 });
});

test('unsupported, denied, unavailable, timeout, thrown and invalid location results all fall back', async () => {
  assert.equal(await getPickupLocation(), null);
  for (const code of [1, 2, 3]) {
    assert.equal(await getPickupLocation({ getCurrentPosition(_success, error) { error({ code }); } }), null);
  }
  assert.equal(await getPickupLocation({ getCurrentPosition() { throw new Error('Unavailable'); } }), null);
  assert.equal(await getPickupLocation({ getCurrentPosition(success) { success({ coords: { latitude: Infinity, longitude: 0, accuracy: 20 } }); } }), null);
});

test('coarse desktop estimates and invalid accuracy fall back instead of presenting a misleading pickup pin', async () => {
  for (const accuracy of [500.1, 100000, Infinity, NaN, -1, undefined]) {
    const location = await getPickupLocation({
      getCurrentPosition(success) { success({ coords: { latitude: 52.1, longitude: -0.5, accuracy } }); },
    });
    assert.equal(location, null);
  }
  const location = await getPickupLocation({
    getCurrentPosition(success) { success({ coords: { latitude: 52.1, longitude: -0.5, accuracy: 500 } }); },
  });
  assert.deepEqual(location, { latitude: 52.1, longitude: -0.5 });
});

test('a permission prompt cannot exceed the hard deadline and late location results are ignored', async (context) => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  let onSuccess;
  const pending = getPickupLocation({ getCurrentPosition(success) { onSuccess = success; } });
  context.mock.timers.tick(8000);
  assert.equal(await pending, null);
  onSuccess({ coords: { latitude: 52.1, longitude: -0.5, accuracy: 20 } });
  assert.equal(await pending, null);
});

test('production and local QA allow same-origin location while other unused permissions stay denied', () => {
  for (const path of ['netlify.toml', 'scripts/serve-production.mjs']) {
    assert.ok(readFileSync(path, 'utf8').includes('camera=(), microphone=(), geolocation=(self), payment=()'));
  }
});
