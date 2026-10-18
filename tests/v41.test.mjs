import test from 'node:test';
import assert from 'node:assert/strict';
import { configModule } from '../scripts/config-module.mjs';
const { homepageHero, cityHero } = await import(configModule('src/config/heroes.ts'));
const { locationPages, getLocationPath, getLocationEta } = await import(configModule('src/config/locations.ts'));
const { recoveryGuides, getRecoveryGuide, getGuidePath } = await import(configModule('src/config/advice.ts'));
const { siteRoutes, getSiteRoute, structuredData } = await import(configModule('src/config/routes.ts'));

test('V4.1 hero copy is exact and city relevance uses the shared pattern without changing canonicals', () => {
  assert.equal(homepageHero.eyebrow, '24/7 NATIONWIDE RECOVERY');
  assert.equal(homepageHero.heading, 'BROKEN DOWN? GET RECOVERY NOW.');
  assert.equal(homepageHero.summary, 'Stranded? Call now for availability, a clear quote and an estimated arrival time. Or send your exact pickup location via WhatsApp.');
  for (const page of locationPages) {
    assert.equal(page.eyebrow, `24/7 ${page.city.toUpperCase()} RECOVERY`);
    assert.equal(page.heading, `BROKEN DOWN IN ${page.city.toUpperCase()}? GET RECOVERY NOW.`);
    assert.deepEqual(page.trust, ['No membership needed', 'Price before booking']);
    assert.ok(page.summary.includes(`vehicle recovery in ${page.city}`));
    assert.deepEqual(cityHero(page.city).heading, page.heading);
    assert.equal(getSiteRoute(getLocationPath(page)).key, page.slug);
    if (page.city !== 'Birmingham') assert.equal(getLocationEta(page), undefined);
  }
  assert.equal(getLocationPath(locationPages[0]), '/recovery/birmingham');
  assert.equal(getLocationEta(locationPages[0]).minutes, 30);
});

test('new guides have distinct substantive content, valid sources and a deliberate service pathway', () => {
  assert.equal(recoveryGuides.length, 5);
  const paragraphs = recoveryGuides.flatMap((guide) => guide.sections.map((section) => section.text));
  assert.equal(new Set(paragraphs).size, paragraphs.length);
  for (const guide of recoveryGuides) {
    assert.ok(guide.sections.length >= 3 && guide.sections.every((section) => section.text.length > 150));
    assert.ok(guide.checklist.length >= 4 && guide.sources.length > 0);
    for (const source of guide.sources) assert.equal(new URL(source.href).protocol, 'https:');
    assert.equal(getRecoveryGuide(guide.id), guide);
    assert.equal(getSiteRoute(getGuidePath(guide)).kind, 'guide');
    assert.ok(guide.services.every((id) => getSiteRoute(`/services/${id}`)?.kind === 'service'));
    assert.ok(guide.related.every((id) => getRecoveryGuide(id) && id !== guide.id));
  }
});

test('advice pages are indexable canonical articles, not new claims of specialist service capability', () => {
  assert.equal(siteRoutes.filter((route) => route.kind === 'guide').length, 5);
  assert.equal(siteRoutes.filter((route) => route.kind === 'service').length, 8);
  for (const guide of recoveryGuides) {
    const route = getSiteRoute(getGuidePath(guide));
    assert.equal(route.indexable, true);
    const graph = JSON.parse(structuredData(route))['@graph'];
    const article = graph.find((item) => item['@type'] === 'Article');
    assert.equal(article.headline, guide.title);
    assert.equal(article.dateModified, guide.reviewed);
    assert.equal(article.url, `https://teleportrecovery.co.uk${getGuidePath(guide)}`);
    assert.ok(!graph.some((item) => item['@type'] === 'Service'));
  }
});

test('specific recovery questions are consolidated, with no speculative city-service matrix', () => {
  assert.ok(getRecoveryGuide('stuck-in-park-locked-wheels'));
  assert.equal(getSiteRoute('/advice/locked-wheel-recovery'), undefined);
  assert.equal(getSiteRoute('/services/electric-car-recovery'), undefined);
  assert.equal(getSiteRoute('/recovery/birmingham/van-recovery'), undefined);
  assert.equal(getSiteRoute('/areas/bletchley'), undefined);
  assert.equal(getSiteRoute('/areas/newport-pagnell'), undefined);
});
