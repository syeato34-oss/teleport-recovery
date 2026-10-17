/**
 * Netlify redirect rules cannot distinguish trailing slashes. Keep the existing
 * slash-free canonical without enabling Pretty URLs on the callback POST endpoint.
 * @param {Request} request
 */
export default function canonicalBirmingham(request) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return;
  const url = new URL(request.url);
  if (!['/recovery/birmingham/', '/birmingham', '/birmingham/'].includes(url.pathname)) return;
  url.pathname = '/recovery/birmingham';
  // Changing only pathname preserves the original query, including Ads attribution.
  return Response.redirect(url.href, 301);
}
