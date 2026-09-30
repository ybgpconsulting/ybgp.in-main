import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs/promises';
import path from 'path';
import { defineConfig } from 'vite';

import {
  ROUTE_METADATA,
  ROUTE_SLUGS,
  SECTION_ROUTES,
  SERVICE_PAGES,
} from './src/data/servicePages';

const SITE_URL = 'https://www.ybgp.in/';
const ORGANIZATION_ID = `${SITE_URL}#organization`;

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const buildRouteJsonLd = (slug: string, url: string, description: string) => {
  const servicePage = SERVICE_PAGES.find((page) => page.slug === slug);
  const isWebsiteOffer = slug === 'business-website';
  const sectionPage = SECTION_ROUTES[slug as keyof typeof SECTION_ROUTES];
  const pageName = servicePage?.name ?? (isWebsiteOffer ? 'Business Website Design and Development' : sectionPage ? ROUTE_METADATA[slug as keyof typeof ROUTE_METADATA].title : 'YBGP');
  const graph = [{
    '@context': 'https://schema.org',
    '@type': ['Organization', 'ProfessionalService'],
    '@id': ORGANIZATION_ID,
    name: 'YBGP - Your Business Growth Partner',
    alternateName: 'YBGP',
    url: SITE_URL,
    logo: `${SITE_URL}logo.svg`,
    telephone: '+919953270270',
    email: 'info@ybgp.in',
    founder: {
      '@type': 'Person',
      name: 'Shubhanshu Jain',
      jobTitle: 'Business Growth Consultant'
    },
    areaServed: ['Noida', 'Delhi NCR', 'India'],
    sameAs: [
      'https://www.instagram.com/ybgp.consulting',
      'https://www.linkedin.com/company/ybgp-consulting'
    ]
  }];

  if (servicePage || isWebsiteOffer) {
    graph.push({
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${url}#service`,
      name: pageName,
      serviceType: pageName,
      description,
      url,
      provider: { '@id': ORGANIZATION_ID },
      areaServed: ['Noida', 'Delhi NCR', 'India'],
      ...(isWebsiteOffer ? {
        offers: {
          '@type': 'Offer',
          priceCurrency: 'INR',
          price: '4999',
          url,
          availability: 'https://schema.org/InStock'
        }
      } : {})
    });
  } else {
    graph.push({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      name: pageName,
      description,
      url,
      isPartOf: { '@id': SITE_URL },
      about: { '@id': ORGANIZATION_ID }
    });
  }

  graph.push({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: pageName, item: url }
    ]
  });

  return JSON.stringify(graph).replace(/</g, '\\u003c');
};

const generateSeoRouteEntrypoints = () => ({
  name: 'generate-seo-route-entrypoints',
  async writeBundle(options: { dir?: string }) {
    const outputDirectory = options.dir ?? path.resolve(__dirname, 'dist');
    const indexPath = path.join(outputDirectory, 'index.html');
    await fs.access(indexPath);

    const buildHtmlForRoute = (html: string, slug: string) => {
      const routeMeta = ROUTE_METADATA[slug as keyof typeof ROUTE_METADATA] ?? ROUTE_METADATA.home;
      const url = slug === 'home' ? 'https://www.ybgp.in/' : `https://www.ybgp.in/${slug}/`;
      const title = escapeHtml(routeMeta.title);
      const description = escapeHtml(routeMeta.description);
      const routeJsonLd = slug === 'home'
        ? null
        : buildRouteJsonLd(slug, url, routeMeta.description);

      const routeHtml = html
        .replace(/<title>.*?<\/title>/is, `<title>${title}</title>`)
        .replace(/<meta\s+name="description"[^>]*>/i, `<meta name="description" content="${description}" />`)
        .replace(/<meta\s+property="og:title"[^>]*>/i, `<meta property="og:title" content="${title}" />`)
        .replace(/<meta\s+property="og:description"[^>]*>/i, `<meta property="og:description" content="${description}" />`)
        .replace(/<meta\s+property="og:url"[^>]*>/i, `<meta property="og:url" content="${url}" />`)
        .replace(/<meta\s+name="twitter:title"[^>]*>/i, `<meta name="twitter:title" content="${title}" />`)
        .replace(/<meta\s+name="twitter:description"[^>]*>/i, `<meta name="twitter:description" content="${description}" />`)
        .replace(/<meta\s+name="twitter:url"[^>]*>/i, `<meta name="twitter:url" content="${url}" />`)
        .replace(/<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${url}" />`);

      return routeJsonLd
        ? routeHtml
          .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, '')
          .replace('</head>', `<script type="application/ld+json">${routeJsonLd}</script>\n  </head>`)
        : routeHtml;
    };

    const baseIndex = await fs.readFile(indexPath, 'utf8');
    const homeHtml = buildHtmlForRoute(baseIndex, 'home');
    await fs.writeFile(indexPath, homeHtml);

    const publishedRoutePattern = ROUTE_SLUGS
      .filter((slug) => slug !== 'home')
      .join('|');
    const htaccessPath = path.join(outputDirectory, '.htaccess');
    const htaccess = await fs.readFile(htaccessPath, 'utf8');
    const htaccessLines = htaccess.split(/\r?\n/);
    const routeRuleIndex = htaccessLines.findIndex((line) =>
      line.startsWith('RewriteRule ^(?:') && line.endsWith(' index.html [L]')
    );
    if (routeRuleIndex === -1) {
      throw new Error('Could not update the published-route rule in .htaccess');
    }
    htaccessLines[routeRuleIndex] = `RewriteRule ^(?:${publishedRoutePattern})/?$ index.html [L]`;
    const updatedHtaccess = htaccessLines.join('\n');
    await fs.writeFile(htaccessPath, updatedHtaccess);

    await Promise.all(
      ROUTE_SLUGS.filter((slug) => slug !== 'home').map(async (slug) => {
        const routeDirectory = path.join(outputDirectory, slug);
        await fs.mkdir(routeDirectory, { recursive: true });
        const routeHtml = buildHtmlForRoute(baseIndex, slug);
        await fs.writeFile(path.join(routeDirectory, 'index.html'), routeHtml);
      })
    );

    const lastModified = new Date().toISOString().slice(0, 10);
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://www.ybgp.in/</loc>\n    <lastmod>${lastModified}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n${ROUTE_SLUGS.filter((slug) => slug !== 'home').map((slug) => `  <url>\n    <loc>https://www.ybgp.in/${slug}/</loc>\n    <lastmod>${lastModified}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>`).join('\n')}\n</urlset>\n`;
    await fs.writeFile(path.join(outputDirectory, 'sitemap.xml'), sitemapXml);
  },
});

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), generateSeoRouteEntrypoints()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      target: 'es2020',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('motion')) return 'motion-vendor';
              if (id.includes('lucide-react')) return 'icon-vendor';
              if (id.includes('react')) return 'react-vendor';
              return 'vendor';
            }
          },
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
