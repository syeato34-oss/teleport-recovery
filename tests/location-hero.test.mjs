import test from 'node:test';
import assert from 'node:assert/strict';
import { configModule } from '../scripts/config-module.mjs';

const { locationPages, getLocationEta } = await import(configModule('src/config/locations.ts'));
const page = locationPages[0];

test('location hero has the approved concise copy and one cohesive highlighted heading', () => {
  assert.equal(page.city, 'Birmingham');
  assert.equal(page.label, 'Vehicle & Breakdown Recovery');
  assert.equal(page.heading, 'BROKEN DOWN IN BIRMINGHAM? GET RECOVERY NOW.');
  assert.equal(page.headingHighlight, 'GET RECOVERY NOW.');
  assert.ok(page.heading.endsWith(page.headingHighlight));
  assert.equal(page.summary, 'Need vehicle recovery in Birmingham? Call now for availability, a clear quote and an estimated arrival time.');
  assert.deepEqual(page.trust, ['No membership needed', 'Price before booking']);
});

test('owner-requested 30-minute ETA is enabled with a short availability qualification', () => {
  assert.equal(page.eta.minutes, 30);
  assert.equal(page.eta.enabled, true);
  assert.equal(page.eta.qualification, 'Subject to availability');
  assert.deepEqual(getLocationEta(page), page.eta);
  assert.equal(getLocationEta({ ...page, eta: { ...page.eta, enabled: false } }), undefined);
  assert.equal(getLocationEta({ ...page, eta: undefined }), undefined);
});

test('optional ETA duration and qualification come from configuration and invalid estimates stay hidden', () => {
  const eta = { enabled: true, minutes: 40, qualification: 'Subject to confirmed operator availability' };
  assert.deepEqual(getLocationEta({ ...page, eta }), eta);
  assert.equal(getLocationEta({ ...page, eta: { ...eta, enabled: false } }), undefined);
  for (const minutes of [0, -1, 2.5, NaN, Infinity]) assert.equal(getLocationEta({ ...page, eta: { ...eta, minutes } }), undefined);
  assert.equal(getLocationEta({ ...page, eta: { ...eta, qualification: '  ' } }), undefined);
});
