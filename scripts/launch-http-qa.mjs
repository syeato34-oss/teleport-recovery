// Public GETs only: query fixtures test transport, never Ads eligibility or conversion.
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const origin = 'https://teleportrecovery.co.uk';
const routes = ['/', '/recovery/birmingham', '/recovery/birmingham/', '/birmingham', '/birmingham/', '/terms', '/guarantee', '/privacy'];
const inputs = [...routes.map((path) => origin + path),
  'https://www.teleportrecovery.co.uk/recovery/birmingham', 'https://www.teleportrecovery.co.uk/recovery/birmingham/',
  'http://teleportrecovery.co.uk/recovery/birmingham', 'http://www.teleportrecovery.co.uk/recovery/birmingham/'];
const query = '?gclid=transport-test-only&gbraid=braid-test-only&wbraid=web-test-only&utm_source=google&utm_medium=cpc&utm_campaign=Birmingham&note=a%2Bb&key=one&key=two';
inputs.push(...inputs.filter((url) => url.includes('birmingham')).map((url) => url + query));

async function inspect(input) {
  const chain = [];
  let url = input;
  for (let index = 0; index < 6; index++) {
    const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(20000) });
    const html = await response.text();
    const location = response.headers.get('location');
    chain.push({ url, status: response.status, location,
      canonical: html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? null,
      title: html.match(/<title>([^<]+)<\/title>/)?.[1] ?? null,
      asset: html.match(/src="([^\"]*\/assets\/index-[^\"]+\.js)"/)?.[1] ?? null,
      csp: response.headers.get('content-security-policy') });
    if (!location || response.status < 300 || response.status >= 400) break;
    url = new URL(location, url).href;
  }
  return { input, chain, queryPreserved: new URL(input).search === new URL(chain.at(-1).url).search };
}

const result = { at: new Date().toISOString(), urls: await Promise.all(inputs.map(inspect)), discovery: [] };
for (const path of ['/robots.txt', '/sitemap.xml', '/__forms/callback.html']) {
  const response = await fetch(origin + path, { signal: AbortSignal.timeout(20000) });
  result.discovery.push({ path, status: response.status, body: await response.text() });
}
await mkdir(resolve('qa-artifacts/launch-audit'), { recursive: true });
await writeFile(resolve('qa-artifacts/launch-audit/live-urls.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result.urls.map(({ input, chain, queryPreserved }) => ({ input, statuses: chain.map((item) => item.status), finalUrl: chain.at(-1).url, queryPreserved })), null, 2));
