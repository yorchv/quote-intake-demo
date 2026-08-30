import fs from 'node:fs';
import path from 'node:path';

const defaults = {
  "buildId": "build_quote_intake_demo_2ef739047aad",
  "clientSlug": "quote-intake-demo",
  "canonicalUrl": "",
  "sitemapPages": [
    {
      "route": "/",
      "lastmod": "2026-08-29"
    },
    {
      "route": "/estimate-request-intake",
      "lastmod": "2026-08-29"
    },
    {
      "route": "/quote-ready-checklist",
      "lastmod": "2026-08-29"
    },
    {
      "route": "/site-visit-handoff",
      "lastmod": "2026-08-29"
    },
    {
      "route": "/works-with-your-tools",
      "lastmod": "2026-08-29"
    }
  ],
  "robotsRules": "User-agent: *\nAllow: /\nDisallow: /activity\nDisallow: /api\nDisallow: /assignments\nDisallow: /exceptions\nDisallow: /login\nDisallow: /owner\nDisallow: /request\nDisallow: /requests/\nDisallow: /settings\nDisallow: /site-visits/\n\nUser-agent: OAI-SearchBot\nAllow: /\nDisallow: /activity\nDisallow: /api\nDisallow: /assignments\nDisallow: /exceptions\nDisallow: /login\nDisallow: /owner\nDisallow: /request\nDisallow: /requests/\nDisallow: /settings\nDisallow: /site-visits/\n\nUser-agent: GPTBot\nDisallow: /\n"
};
const publicDir = path.resolve('public');
fs.mkdirSync(publicDir, { recursive: true });

const providerHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || '';
const siteUrl = String(process.env.NEXT_PUBLIC_SITE_URL || defaults.canonicalUrl || (providerHost ? `https://${providerHost}` : 'http://localhost:3000')).replace(/[/]$/, '');
const runtime = {
  productApiUrl: process.env.NEXT_PUBLIC_PRODUCT_API_URL || '',
  inkpassClientSlug: process.env.NEXT_PUBLIC_INKPASS_CLIENT_SLUG || defaults.clientSlug,
  posthogProjectToken: process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN || process.env.POSTHOG_PROJECT_TOKEN || '',
  posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST || process.env.POSTHOG_HOST || 'https://us.i.posthog.com',
  productBuildId: process.env.PRODUCT_BUILD_ID || defaults.buildId,
  productReleaseSha: process.env.PRODUCT_RELEASE_SHA || process.env.VERCEL_GIT_COMMIT_SHA || '',
  productEnv: process.env.PRODUCT_ENV || process.env.VERCEL_ENV || 'development',
};
const configLines = [
  `window.__PRODUCT_API_URL__ = ${JSON.stringify(runtime.productApiUrl)};`,
  `window.__INKPASS_CLIENT_SLUG__ = ${JSON.stringify(runtime.inkpassClientSlug)};`,
  `window.__POSTHOG_PROJECT_TOKEN__ = ${JSON.stringify(runtime.posthogProjectToken)};`,
  `window.__POSTHOG_HOST__ = ${JSON.stringify(runtime.posthogHost)};`,
  `window.__PRODUCT_BUILD_ID__ = ${JSON.stringify(runtime.productBuildId)};`,
  `window.__PRODUCT_RELEASE_SHA__ = ${JSON.stringify(runtime.productReleaseSha)};`,
  `window.__PRODUCT_ENV__ = ${JSON.stringify(runtime.productEnv)};`,
];
fs.writeFileSync(path.join(publicDir, 'product-api-config.js'), `${configLines.join('\n')}\n`);

const escapeXml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character]);
const urls = defaults.sitemapPages.map((page) => {
  const route = page.route === '/' ? '/' : String(page.route).replace(/[/]+$/, '');
  const lastmod = page.lastmod ? `<lastmod>${escapeXml(page.lastmod)}</lastmod>` : '';
  return `  <url><loc>${escapeXml(`${siteUrl}${route}`)}</loc>${lastmod}</url>`;
}).join('\n');
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
fs.writeFileSync(path.join(publicDir, 'robots.txt'), `${defaults.robotsRules}Sitemap: ${siteUrl}/sitemap.xml\n`);
