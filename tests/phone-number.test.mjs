import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { transformSync } from 'esbuild';

const moduleUrl = (source) => `data:text/javascript;base64,${Buffer.from(transformSync(source, { loader: 'ts', format: 'esm' }).code).toString('base64')}`;
const businessUrl = moduleUrl(readFileSync('src/config/business.ts', 'utf8'));
const phone = await import(moduleUrl(readFileSync('src/lib/phoneNumber.ts', 'utf8').replace("from '../config/business'", `from '${businessUrl}'`)));

test('forwarding state is shared, observable, stable and resets to the genuine fallback', () => {
  phone.resetPhoneNumber();
  assert.deepEqual(phone.getPhoneNumber(), { display: '01234 900 700', href: 'tel:+441234900700' });
  let changes = 0;
  const unsubscribe = phone.subscribePhoneNumber(() => changes++);
  phone.applyGooglePhoneNumber('07700 900123', '447700900123');
  const snapshot = phone.getPhoneNumber();
  assert.deepEqual(snapshot, { display: '07700 900123', href: 'tel:+447700900123' });
  phone.applyGooglePhoneNumber('07700 900123', '+447700900123');
  assert.equal(phone.getPhoneNumber(), snapshot, 'Identical values keep a stable React snapshot');
  assert.equal(changes, 1);
  phone.resetPhoneNumber();
  assert.equal(changes, 2);
  assert.equal(phone.getPhoneNumber(), phone.getFallbackPhoneNumber());
  unsubscribe();
});

test('invalid, missing, mismatched and executable callback values always fail safely', () => {
  for (const [display, number] of [[null, null], ['07700 900123', undefined], ['07700 900123', '+447700900124'],
    ['07700 900123', 'javascript:alert(1)'], ['07700 900123', '+447700900123;ext=1'],
    ['<b>07700 900123</b>', '+447700900123'], ['123', '123'], ['', ''], ['++447700900123', '+447700900123']]) {
    phone.applyGooglePhoneNumber('07700 900123', '+447700900123');
    phone.applyGooglePhoneNumber(display, number);
    assert.equal(phone.getPhoneNumber(), phone.getFallbackPhoneNumber());
  }
});

test('every React telephone anchor uses CallLink; visible business-number nodes use PhoneNumber', () => {
  function inspect(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = `${directory}/${entry.name}`;
      if (entry.isDirectory()) inspect(path);
      else if (entry.name.endsWith('.tsx') && entry.name !== 'CallLink.tsx') {
        const source = readFileSync(path, 'utf8');
        assert.doesNotMatch(source, /href=\{businessConfig.phoneHref\}|href=["']tel:/, path);
        assert.doesNotMatch(source, />\s*\{businessConfig.phoneDisplay\}/, path);
        assert.doesNotMatch(source, /\$<PhoneNumber/, 'Component markup must never enter an accessible-label string');
      }
    }
  }
  inspect('src');
});
