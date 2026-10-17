import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { transformSync } from 'esbuild';

const { code } = transformSync(readFileSync('src/config/locations.ts', 'utf8'), { loader: 'ts', format: 'esm' });
const { locationPages, getLocationEta } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const page = locationPages[0];

test('location hero has the approved concise copy and one cohesive highlighted heading', () => {
  assert.equal(page.city, 'Birmingham');
  assert.equal(page.label, 'Vehicle & Breakdown Recovery');
  assert.equal(page.heading, 'Broken Down in Birmingham? Get Recovery Now.');
  assert.equal(page.headingHighlight, 'Get Recovery Now.');
  assert.ok(page.heading.endsWith(page.headingHighlight));
  assert.equal(page.summary, "Need vehicle recovery? Call for a quote and estimated arrival time. We'll confirm availability and the price before booking.");
  assert.deepEqual(page.trust, ['No membership required', 'Price before booking']);
});

test('30-minute ETA is unpublished and cannot be enabled without confirmed operational evidence', () => {
  assert.equal(page.eta.minutes, 30);
  assert.equal(page.eta.enabled, false);
  assert.equal(page.eta.operationalEvidenceConfirmed, false);
  assert.equal(getLocationEta(page), undefined);
  assert.equal(getLocationEta({ ...page, eta: { ...page.eta, enabled: true } }), undefined);
  assert.equal(getLocationEta({ ...page, eta: { ...page.eta, operationalEvidenceConfirmed: true } }), undefined);
  assert.equal(getLocationEta({ ...page, eta: undefined }), undefined);
});

test('optional ETA duration and qualification come from configuration and invalid estimates stay hidden', () => {
  const eta = { enabled: true, operationalEvidenceConfirmed: true, minutes: 40, qualification: 'Subject to confirmed operator availability' };
  assert.deepEqual(getLocationEta({ ...page, eta }), eta);
  assert.equal(getLocationEta({ ...page, eta: { ...eta, enabled: false } }), undefined);
  for (const minutes of [0, -1, 2.5, NaN, Infinity]) assert.equal(getLocationEta({ ...page, eta: { ...eta, minutes } }), undefined);
  assert.equal(getLocationEta({ ...page, eta: { ...eta, qualification: '  ' } }), undefined);
});
