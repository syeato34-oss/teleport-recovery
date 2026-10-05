// Local production QA only. This replays relevant static routing/headers, not Netlify Forms.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const root = resolve('dist');
const headersFile = await readFile(resolve(root, '_headers'), 'utf8');
const csp = headersFile.match(/^\s+Content-Security-Policy:\s*(.+)$/m)?.[1];
if (!csp) throw new Error('Build the site before running production QA.');
const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain' };

createServer(async (request, response) => {
  response.setHeader('Content-Security-Policy', csp);
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self), payment=()');
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Local QA does not accept callback submissions.');
    return;
  }
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    let target = resolve(root, `.${pathname}`);
    if (target !== root && !target.startsWith(root + sep)) {
      response.writeHead(400);
      response.end();
      return;
    }
    let status = 200;
    try {
      if ((await stat(target)).isDirectory()) target = resolve(target, 'index.html');
      await stat(target);
    } catch {
      target = resolve(root, '404.html');
      status = 404;
    }
    const content = await readFile(target);
    response.writeHead(status, { 'Content-Type': `${types[extname(target)] ?? 'application/octet-stream'}; charset=utf-8` });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch {
    response.writeHead(500);
    response.end();
  }
}).listen(4173, '127.0.0.1', () => console.log('Production QA: http://127.0.0.1:4173 (Forms are not connected)'));
