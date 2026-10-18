import { canonicalPaths, aliases } from './generated-routes.js';

/** Known routes only. POST endpoints and unknown URLs retain their original behaviour. */
export default function canonicalPages(request) {
  if (!['GET', 'HEAD'].includes(request.method)) return;
  const url = new URL(request.url);
  const normalized = url.pathname.replace(/\/index\.html$/, '').replace(/\/+$/, '') || '/';
  const canonical = Object.hasOwn(aliases, normalized) ? aliases[normalized] : canonicalPaths.includes(normalized) ? normalized : undefined;
  if (!canonical || url.pathname === canonical) return;
  url.pathname = canonical;
  return Response.redirect(url.href, 301);
}
