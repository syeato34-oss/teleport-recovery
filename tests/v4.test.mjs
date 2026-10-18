import test from 'node:test';
import assert from 'node:assert/strict';
import { configModule } from '../scripts/config-module.mjs';
import canonicalPages from '../netlify/edge-functions/canonical-pages.js';
const { areas, regions, getArea, getAreaPath } = await import(configModule('src/config/areas.ts'));
const { siteRoutes, routeAliases, getSiteRoute, structuredData } = await import(configModule('src/config/routes.ts'));
const { validateContent } = await import(configModule('src/config/validateContent.ts'));
const { buildWhatsAppLocationUrl } = await import(configModule('src/lib/whatsapp.ts'));
const destination = 'https://wa.me/447827079669';

test('national inventory separates registry entries, authored pages and directory-only destinations', () => {
  assert.deepEqual(validateContent(), { registeredAreas: 133, authoredAreaPages: 12, directoryOnlyAreas: 121, regions: 11, servicePages: 8, cityServicePages: 2, advicePages: 5, canonicalPages: 45 });
  for (const area of areas) {
    const path = getAreaPath(area).split('#')[0];
    assert.ok(getSiteRoute(path), path);
    assert.equal(area.serviceability, 'dispatch-check');
    if (area.indexing === 'draft') assert.equal(getSiteRoute(`/areas/${area.id}`), undefined);
  }
  assert.equal(getAreaPath(getArea('birmingham')), '/recovery/birmingham');
  assert.equal(regions.some((region) => region.country === 'Northern Ireland'), false);
});

test('content validation rejects duplicate, misclassified, unsupported and incomplete entries', () => {
  const mutate = (changes) => areas.map((area, index) => index === 0 ? { ...area, ...changes } : area);
  for (const changes of [{ id: areas[1].id }, { region: 'scotland' }, { roads: ['unknown'] }, { nearby: ['missing'] }, { sources: [] }, { serviceability: 'verified-anchor' }, { indexing: 'indexable', pickup: undefined }]) {
    assert.throws(() => validateContent(mutate(changes)), /Content validation failed/);
  }
});

test('reviewed road references are explicitly paired with their city, not array positions', () => {
  assert.deepEqual(getArea('birmingham').roads, ['M6', 'M42', 'M5']);
  assert.deepEqual(getArea('milton-keynes').roads, ['M1', 'A5', 'A421']);
  assert.deepEqual(getArea('manchester').roads, ['M60', 'M62']);
  assert.deepEqual(getArea('cardiff').roads, []);
  assert.ok(!getArea('birmingham').roads.includes('M60'));
});

test('aliases have one-hop permanent redirects that preserve every advertising query byte', () => {
  for (const [alias, canonical] of Object.entries(routeAliases)) for (const suffix of ['', '/', '/index.html']) {
    const query = '?gclid=a%2Bb&gbraid=b&wbraid=c&utm_term=car+recovery&key=one&key=two';
    const response = canonicalPages(new Request('https://teleportrecovery.co.uk' + alias + suffix + query));
    assert.equal(response.status, 301);
    assert.equal(response.headers.get('location'), 'https://teleportrecovery.co.uk' + canonical + query);
    assert.equal(canonicalPages(new Request(response.headers.get('location'))), undefined);
  }
});

test('schema describes the coordinator and real breadcrumbs without invented depots or reviews', () => {
  for (const route of siteRoutes) {
    const schema = JSON.parse(structuredData(route));
    assert.equal(schema['@context'], 'https://schema.org');
    assert.ok(schema['@graph'].some((item) => item['@type'] === 'Organization' && item.telephone === '+441234900700'));
    assert.doesNotMatch(JSON.stringify(schema), /LocalBusiness|aggregateRating|reviewRating|streetAddress/);
    const crumbs = schema['@graph'].find((item) => item['@type'] === 'BreadcrumbList');
    if (crumbs) crumbs.itemListElement.forEach((item, index) => {
      assert.equal(item.position, index + 1);
      assert.ok(siteRoutes.some((page) => 'https://teleportrecovery.co.uk' + page.path === item.item));
    });
  }
});

test('location sharing drafts encode a valid pickup and preserve manual review and city context', () => {
  const message = new URL(buildWhatsAppLocationUrl(destination, { latitude: 52.123456, longitude: -0.56789 }, 'Milton Keynes')).searchParams.get('text');
  assert.match(message, /in Milton Keynes/);
  assert.match(message, /Pickup location:\nhttps:\/\/www.google.com\/maps\/search\//);
  assert.match(message, /query=52.123456%2C-0.56789/);
  assert.match(message, /Destination:\n\nVehicle:\n\nWhat happened:/);
  for (const pickup of [undefined, { latitude: NaN, longitude: 0 }]) {
    const url = new URL(buildWhatsAppLocationUrl(destination, pickup));
    const draft = url.searchParams.get('text');
    assert.equal(url.origin + url.pathname, destination);
    assert.match(draft, /Pickup location or postcode:/);
    assert.match(draft, /WhatsApp's Location option/);
    assert.ok(!draft.includes('google.com'));
    assert.deepEqual([...url.searchParams.keys()], ['text']);
  }
});
