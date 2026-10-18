import { transformSync } from 'esbuild';
import { readFileSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
const cache = new Map();
export function configModule(file) {
  const path = resolve(file);
  if (cache.has(path)) return cache.get(path);
  const { code } = transformSync(readFileSync(path, 'utf8'), { loader: 'ts', format: 'esm' });
  const linked = code.replace(/from "(\.[^"]+)"/g, (_, relative) => {
    const target = resolve(dirname(path), relative);
    return `from "${configModule(extname(target) ? target : target + '.ts')}"`;
  });
  const url = `data:text/javascript;base64,${Buffer.from(linked).toString('base64')}`;
  cache.set(path, url);
  return url;
}
