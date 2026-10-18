// Run against a CONTEXT=deploy-preview or CONTEXT=branch-deploy build.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const manifest = JSON.parse(await readFile('dist/route-manifest.json', 'utf8'));
assert.match(await readFile('dist/robots.txt', 'utf8'), /Disallow: \/\n/);
assert.match(await readFile('dist/_headers', 'utf8'), /X-Robots-Tag: noindex, nofollow/);
for (const { path } of manifest) {
  const html = await readFile(path === '/' ? 'dist/index.html' : `dist${path}/index.html`, 'utf8');
  assert.match(html, /<meta name="robots" content="noindex, nofollow"/);
  assert.match(html, /<h1\b/);
  assert.ok(html.includes(`href="https://teleportrecovery.co.uk${path}"`));
}
console.log(`Preview isolation passed: ${manifest.length} rendered pages have noindex, plus robots disallow and X-Robots-Tag.`);
