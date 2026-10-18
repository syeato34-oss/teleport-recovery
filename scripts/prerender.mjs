import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

process.env.NODE_ENV = 'production';
await mkdir('dist-ssr', { recursive: true });
await build({ entryPoints: ['src/entry-server.tsx'], outfile: 'dist-ssr/prerender.mjs', platform: 'node', format: 'esm', bundle: true,
  packages: 'external', alias: { '@': resolve('src') }, jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' } });
const { siteRoutes, routeAliases, render } = await import(pathToFileURL(resolve('dist-ssr/prerender.mjs')).href);
for (const route of [...siteRoutes, { path: '/404.html' }]) {
  const file = route.path === '/' ? 'dist/index.html' : route.path === '/404.html' ? 'dist/404.html' : `dist${route.path}/index.html`;
  const html = await readFile(file, 'utf8');
  if (!html.includes('<div id="root"></div>')) throw Error(`Missing render root: ${file}`);
  await writeFile(file, html.replace('<div id="root"></div>', `<div id="root">${render(route.path)}</div>`));
}
const redirects = siteRoutes.filter((route) => route.path !== '/').flatMap((route) => [
  `${route.path}/index.html ${route.path} 301!`, `${route.path} ${route.path}/index.html 200!`,
]);
await writeFile('dist/_redirects', redirects.join('\n') + '\n');
await writeFile('netlify/edge-functions/generated-routes.js', `// Generated from src/config/routes.ts by the production build.\nexport const canonicalPaths = ${JSON.stringify(siteRoutes.map((route) => route.path))};\nexport const aliases = ${JSON.stringify(routeAliases)};\n`);
await writeFile('dist/route-manifest.json', JSON.stringify(siteRoutes.map(({ path, kind, indexable }) => ({ path, kind, indexable })), null, 2));
console.log(`Prerendered ${siteRoutes.length} canonical pages and a real 404; generated exact Netlify routes.`);
