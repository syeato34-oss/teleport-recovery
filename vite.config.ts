import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { createHash } from 'node:crypto';
import { fileURLToPath, URL } from 'node:url';
import { businessConfig } from './src/config/business';

const socialImage =
  'https://images.pexels.com/photos/17429097/pexels-photo-17429097.jpeg?auto=compress&cs=tinysrgb&w=1200';

const organization = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: businessConfig.tradingName,
  url: businessConfig.websiteUrl,
  telephone: businessConfig.phoneTel,
  logo: `${businessConfig.websiteUrl}/brand/tpr-mark.svg`,
}).replace(/</g, '\\u003c');

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    };
    return entities[character];
  });
}

type PageMetadata = { path: string; title: string; description: string; noindex?: boolean };

const homeMetadata: PageMetadata = {
  path: '/',
  title: businessConfig.metaTitle,
  description: businessConfig.metaDescription,
};

const legalMetadata: PageMetadata[] = [
  {
    path: businessConfig.termsUrl,
    title: `Terms & Conditions | ${businessConfig.tradingName}`,
    description: `Read the terms for your recovery booking, quotes, payments and recovery services managed by ${businessConfig.tradingName}.`,
  },
  {
    path: businessConfig.guaranteeUrl,
    title: `Money-Back Guarantee | ${businessConfig.tradingName}`,
    description: `Read when ${businessConfig.tradingName} will refund the amount paid if it is unable to provide the agreed recovery service, including conditions and your statutory rights.`,
  },
  {
    path: businessConfig.privacyUrl,
    title: `Privacy Policy | ${businessConfig.tradingName}`,
    description: `How ${businessConfig.tradingName} uses information provided for recovery enquiries, callback requests and bookings, and how to contact us about your privacy.`,
  },
];

const notFoundMetadata: PageMetadata = {
  path: '/404.html',
  title: `Page Not Found | ${businessConfig.tradingName}`,
  description: `This page could not be found. Return to ${businessConfig.tradingName} or call for help with your recovery request.`,
  noindex: true,
};

function metadataBlock(page: PageMetadata, preview: boolean) {
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);
  const canonical = escapeHtml(new URL(page.path, businessConfig.websiteUrl).href);
  return `<!-- site-metadata:start -->
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="robots" content="${page.noindex || preview ? 'noindex, nofollow' : 'index, follow'}" />
    ${page.noindex ? '' : `<link rel="canonical" href="${canonical}" />`}
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="en_GB" />
    <meta property="og:site_name" content="${escapeHtml(businessConfig.tradingName)}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${escapeHtml(socialImage)}" />
    <meta property="og:image:alt" content="Recovery truck loading a vehicle on the roadside" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${escapeHtml(socialImage)}" />
    <meta name="twitter:image:alt" content="Recovery truck loading a vehicle on the roadside" />
    <script type="application/ld+json">${organization}</script>
    <!-- site-metadata:end -->`;
}

/** Build actual HTML entry points so direct legal links have metadata before JavaScript. */
function productionPages(): Plugin {
  // Netlify deploy previews and branch deployments must not compete with production in search.
  const preview = ['deploy-preview', 'branch-deploy'].includes(process.env.CONTEXT ?? '');
  return {
    name: 'teleport-production-pages',
    enforce: 'post',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html
          .replace('<!-- business-metadata -->', metadataBlock(homeMetadata, preview))
          .replace('<!-- business-noscript -->', `<p>Call <a href="${businessConfig.phoneHref}">${escapeHtml(businessConfig.phoneDisplay)}</a> for recovery assistance.</p>`);
      },
    },
    generateBundle(_options, bundle) {
      const index = bundle['index.html'];
      if (!index || index.type !== 'asset' || typeof index.source !== 'string') {
        this.error('The production index.html was not generated; legal entry points cannot be built.');
      }
      const template = index.source;
      for (const page of [...legalMetadata, notFoundMetadata]) {
        const html = template.replace(
          /<!-- site-metadata:start -->[\s\S]*?<!-- site-metadata:end -->/,
          metadataBlock(page, preview),
        );
        this.emitFile({
          type: 'asset',
          fileName: page.noindex ? '404.html' : `${page.path.slice(1)}/index.html`,
          source: html,
        });
      }

      // This exact static URL is intentionally free of redirects. A response with this
      // marker is unprocessed HTML, not confirmation of a Netlify Forms submission.
      this.emitFile({
        type: 'asset',
        fileName: '__forms/callback.html',
        source: `<!doctype html>
<html lang="en-GB" data-callback-unprocessed="true">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>Callback Unavailable | ${escapeHtml(businessConfig.tradingName)}</title></head>
<body><main><h1>Callback submission unavailable</h1><p>This page does not confirm a callback request. Please call <a href="${businessConfig.phoneHref}">${escapeHtml(businessConfig.phoneDisplay)}</a> for recovery assistance.</p><p><a href="/">Return to ${escapeHtml(businessConfig.tradingName)}</a></p></main></body>
</html>`,
      });

      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: preview
          ? 'User-agent: *\nDisallow: /\n'
          : `User-agent: *\nAllow: /\nDisallow: /__forms/\n\nSitemap: ${businessConfig.websiteUrl}/sitemap.xml\n`,
      });
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[homeMetadata, ...legalMetadata].map((page) => `  <url><loc>${escapeHtml(new URL(page.path, businessConfig.websiteUrl).href)}</loc></url>`).join('\n')}\n</urlset>\n`,
      });

      // The JSON-LD is the sole inline script; hash it without weakening script-src.
      const jsonLdHash = createHash('sha256').update(organization).digest('base64');
      const csp = [
        "default-src 'self'",
        `script-src 'self' 'sha256-${jsonLdHash}'`,
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https://images.pexels.com",
        "connect-src 'self'",
        "form-action 'self'",
        "object-src 'none'",
        "frame-src 'none'",
        "base-uri 'self'",
        "frame-ancestors 'none'",
        'upgrade-insecure-requests',
      ].join('; ');
      this.emitFile({
        type: 'asset',
        fileName: '_headers',
        source: `/*\n  Content-Security-Policy: ${csp}\n${preview ? '  X-Robots-Tag: noindex, nofollow\n' : ''}\n/__forms/*\n  X-Robots-Tag: noindex, nofollow\n  Cache-Control: no-store\n`,
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), productionPages()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
