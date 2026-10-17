import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { transformSync } from 'esbuild';

function moduleUrl(source) {
  const { code } = transformSync(source, { loader: 'ts', format: 'esm', target: 'es2020' });
  return `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
}
// Resolve the real config import in memory, without a filesystem bundle or fixtures.
const businessUrl = moduleUrl(readFileSync('src/config/business.ts', 'utf8'));
const source = readFileSync('src/config/locations.ts', 'utf8').replace("from './business'", `from '${businessUrl}'`);
const { locationPages, getLocationPage, getLocationPath } = await import(moduleUrl(source));
const { buildWhatsAppMessageUrl, buildWhatsAppRecoveryUrl, getWhatsAppDestination } = await import(moduleUrl(readFileSync('src/lib/whatsapp.ts', 'utf8')));
const { businessConfig } = await import(businessUrl);

test('only Birmingham is published; future city names do not implicitly create pages', () => {
  assert.deepEqual(locationPages.map(getLocationPath), ['/recovery/birmingham']);
  assert.equal(getLocationPage('/recovery/bedford'), undefined);
  assert.equal(getLocationPage('/recovery/milton-keynes'), undefined);
  assert.equal(getLocationPage('/recovery/northampton'), undefined);
  assert.equal(new Set(locationPages.map(getLocationPath)).size, locationPages.length);
});

test('Birmingham has the approved SEO, service priority and qualified coverage content', () => {
  const page = locationPages[0];
  assert.equal(page.metaTitle, 'Emergency Car Recovery Birmingham | Teleport Recovery');
  assert.equal(page.metaDescription, 'Need car or breakdown recovery in Birmingham? Contact Teleport Recovery for an upfront quote, availability and an estimated arrival time. Scheduled transport also available.');
  assert.deepEqual(page.services.map((service) => service.id), ['emergency', 'transport', 'auction']);
  assert.equal(page.coverage.areas.length, 22);
  assert.equal(new Set(page.coverage.areas).size, 22);
  assert.ok(page.coverage.initialCount > 0 && page.coverage.initialCount < page.coverage.areas.length);
  assert.ok(page.faqs.length >= 4);
  assert.ok(page.faqs.some((faq) => faq.link?.href === businessConfig.guaranteeUrl));
  assert.doesNotMatch(JSON.stringify(page), /45.min|30.min|owned fleet|our Birmingham depot/i);
});

test('city WhatsApp prefill is exact, uses the public destination and preserves the generic draft', () => {
  const expected = 'Hi Teleport Recovery, I need vehicle recovery in Birmingham.\n\nPickup postcode:\nDestination:\nVehicle:\nIs it urgent?:\n\nCould I please get a quote and estimated arrival time?';
  const destination = getWhatsAppDestination(businessConfig.whatsappHref);
  const cityUrl = new URL(buildWhatsAppMessageUrl(destination, locationPages[0].whatsappMessage));
  assert.equal(cityUrl.searchParams.get('text'), expected);
  assert.equal(cityUrl.origin + cityUrl.pathname, destination);
  assert.equal(new URL(buildWhatsAppRecoveryUrl(destination)).searchParams.get('text'), 'Hi Teleport Recovery, I need vehicle recovery.\n\nPickup:\n\nDestination:\n\nVehicle / reg:\n\nWhat happened:');
  const nextMessage = 'A city-specific draft: pickup A&B, + access?\nDestination: café';
  assert.equal(new URL(buildWhatsAppMessageUrl(destination, nextMessage)).searchParams.get('text'), nextMessage);
});

test('direct, trailing-slash and index-file city paths resolve to the same page', () => {
  for (const path of ['/recovery/birmingham', '/recovery/birmingham/', '/recovery/birmingham/index.html']) {
    assert.equal(getLocationPage(path), locationPages[0]);
  }
  const adVisit = new URL('https://teleportrecovery.co.uk/recovery/birmingham?gclid=local-routing-test');
  assert.equal(getLocationPage(adVisit.pathname), locationPages[0]);
});

test('city lookup does not capture homepage, legal routes, unknown cities or nested paths', () => {
  for (const path of ['/', '/terms', '/guarantee', '/privacy', '/recovery', '/recovery/unknown',
    '/recovery/birmingham/extra', '/other/birmingham', '/recovery/Birmingham', '/recovery/__proto__']) {
    assert.equal(getLocationPage(path), undefined, path);
  }
});

test('published cities have unique safe paths and city-specific search metadata', () => {
  for (const page of locationPages) {
    assert.match(page.slug, /^[a-z]+(?:-[a-z]+)*$/);
    assert.ok(page.metaTitle.includes(page.city));
    assert.ok(page.metaDescription.includes(page.city));
    assert.ok(page.heading.includes(page.city));
    assert.ok(page.introduction.includes(page.city));
    assert.ok(page.details.length > 0);
  }
});

test('each published city has an explicit Netlify HTML rewrite and canonical index redirect', () => {
  const config = readFileSync('netlify.toml', 'utf8');
  const redirects = [...config.matchAll(/\[\[redirects\]\]([\s\S]*?)(?=\[\[|$)/g)].map(([, block]) => ({
    from: block.match(/from\s*=\s*"([^"]+)"/)?.[1],
    to: block.match(/to\s*=\s*"([^"]+)"/)?.[1],
    status: Number(block.match(/status\s*=\s*(\d+)/)?.[1]),
    force: /force\s*=\s*true/.test(block),
  }));
  for (const page of locationPages) {
    const path = getLocationPath(page);
    assert.deepEqual(redirects.find((rule) => rule.from === path), {
      from: path, to: `${path}/index.html`, status: 200, force: true,
    });
    assert.deepEqual(redirects.find((rule) => rule.from === `${path}/index.html`), {
      from: `${path}/index.html`, to: path, status: 301, force: true,
    });
  }
  assert.deepEqual(redirects.filter((rule) => rule.from?.startsWith('/recovery/') && rule.status === 200)
    .map((rule) => rule.from).sort(), locationPages.map(getLocationPath).sort());
  assert.ok(!redirects.some((rule) => rule.from === '/*' && rule.status === 200));
});
