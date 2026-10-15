import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs/promises';
import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import { normalizeSiteUrl } from './server/config/site';
import { PROJECTS } from './src/data/projects';
import {
  INDEXABLE_SEO_ROUTES,
  PRIVATE_SEO_ROUTES,
  SEO_ROUTES,
  getSeoRoute,
} from './src/data/seo';
import { ROUTE_SLUGS, SERVICE_PAGES } from './src/data/servicePages';

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildRouteJsonLd = (slug: string, siteUrl: string) => {
  const route = getSeoRoute(slug);
  const url = new URL(route.canonicalPath.slice(1), siteUrl).href;
  const organizationId = `${siteUrl}#organization`;
  const service = SERVICE_PAGES.find((page) => page.slug === slug);
  const project = PROJECTS.find((item) => `work/${item.slug}` === slug);
  const isWebsiteOffer = slug === 'business-website';
  const graph: Record<string, unknown>[] = [];

  if (service || isWebsiteOffer) {
    graph.push({
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${url}#service`,
      name: route.heading,
      serviceType: route.heading,
      description: route.description,
      url,
      provider: { '@id': organizationId },
      areaServed: ['Noida', 'Delhi NCR', 'India'],
      ...(isWebsiteOffer ? {
        offers: {
          '@type': 'Offer',
          priceCurrency: 'INR',
          price: '1999',
          url,
          availability: 'https://schema.org/InStock',
        },
      } : {}),
    });
  } else if (project) {
    graph.push({
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      '@id': `${url}#project`,
      name: project.name,
      description: project.description,
      url,
      genre: project.category,
      about: project.industry,
      creator: { '@id': organizationId },
      image: project.image ? new URL(project.image, siteUrl).href : undefined,
    });
  } else {
    graph.push({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      name: route.heading,
      description: route.description,
      url,
      isPartOf: { '@id': `${siteUrl}#website` },
      about: { '@id': organizationId },
    });
  }

  graph.push({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: route.heading, item: url },
    ],
  });

  return JSON.stringify(graph).replace(/</g, '\\u003c');
};

const buildRouteHtml = (baseHtml: string, slug: string, siteUrl: string): string => {
  const route = getSeoRoute(slug);
  const canonicalUrl = new URL(route.canonicalPath.slice(1), siteUrl).href;
  let html = baseHtml
    .replace(/__SITE_URL__/g, siteUrl)
    .replace(/<title>.*?<\/title>/is, `<title>${escapeHtml(route.title)}</title>`)
    .replace(/<meta\s+name="description"[^>]*>/i, `<meta name="description" content="${escapeHtml(route.description)}" />`)
    .replace(/<meta\s+name="robots"[^>]*>/i, `<meta name="robots" content="${route.indexable ? 'index, follow' : 'noindex, follow'}" />`)
    .replace(/<meta\s+property="og:title"[^>]*>/i, `<meta property="og:title" content="${escapeHtml(route.title)}" />`)
    .replace(/<meta\s+property="og:description"[^>]*>/i, `<meta property="og:description" content="${escapeHtml(route.description)}" />`)
    .replace(/<meta\s+property="og:url"[^>]*>/i, `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`)
    .replace(/<meta\s+name="twitter:title"[^>]*>/i, `<meta name="twitter:title" content="${escapeHtml(route.title)}" />`)
    .replace(/<meta\s+name="twitter:description"[^>]*>/i, `<meta name="twitter:description" content="${escapeHtml(route.description)}" />`)
    .replace(/<meta\s+name="twitter:url"[^>]*>/i, `<meta name="twitter:url" content="${escapeHtml(canonicalUrl)}" />`)
    .replace(/<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`)
    .replace(/<link\s+rel="alternate"\s+href="[^"]*"\s+hreflang="en-in"\s*\/?>/i, '');

  if (slug !== 'home') {
    html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, '');
    if (route.indexable) {
      html = html.replace('</head>', `<script type="application/ld+json">${buildRouteJsonLd(slug, siteUrl)}</script>\n  </head>`);
    }
  }

  const rootMarkup = route.indexable
    ? `<main aria-label="${escapeHtml(route.heading)}" style="max-width:72rem;margin:8rem auto 3rem;padding:1.5rem"><h1>${escapeHtml(route.heading)}</h1><p>${escapeHtml(route.content)}</p><nav aria-label="Primary"><a href="/">Home</a> · <a href="/services/">Services</a> · <a href="/work/">Work</a> · <a href="/contact/">Contact</a></nav></main>`
    : '';
  return html.replace(/<div id="root">[\s\S]*?<\/div>/i, `<div id="root">${rootMarkup}</div>`);
};

const buildPrivateHtml = (
  baseHtml: string,
  route: typeof PRIVATE_SEO_ROUTES[number],
  siteUrl: string
): string => {
  const routeHtml = buildRouteHtml(baseHtml, 'home', siteUrl)
    .replace(/<title>.*?<\/title>/is, `<title>${escapeHtml(route.title)}</title>`)
    .replace(/<meta\s+name="robots"[^>]*>/i, '<meta name="robots" content="noindex, nofollow" />')
    .replace(/<meta\s+name="description"[^>]*>/i, '')
    .replace(/<meta\s+property="og:title"[^>]*>/i, '')
    .replace(/<meta\s+property="og:description"[^>]*>/i, '')
    .replace(/<meta\s+property="og:url"[^>]*>/i, '')
    .replace(/<meta\s+name="twitter:title"[^>]*>/i, '')
    .replace(/<meta\s+name="twitter:description"[^>]*>/i, '')
    .replace(/<meta\s+name="twitter:url"[^>]*>/i, '')
    .replace(/<link\s+rel="canonical"[^>]*>/i, '')
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, '');
  const isDashboard = route.path.endsWith('/admin') || route.path.endsWith('/dashboard');
  const heading = isDashboard
    ? ''
    : `<main><h1>${escapeHtml(route.title.replace(' | YBGP', ''))}</h1><p>Website design example by YBGP. This demonstration is not a customer website.</p></main>`;
  return routeHtml.replace(/<div id="root">[\s\S]*?<\/div>/i, `<div id="root">${heading}</div>`);
};

const replaceCanonicalApacheRules = (content: string, siteUrl: string): string => {
  const host = new URL(siteUrl).host;
  const apexHost = host.replace(/^www\./i, '');
  const acceptedHosts = host.toLowerCase() === apexHost.toLowerCase()
    ? `^${escapeRegex(host)}(?::[0-9]+)?$`
    : `^(?:${escapeRegex(apexHost)}|${escapeRegex(host)})(?::[0-9]+)?$`;
  const canonicalBlock = [
    '# Canonicalize only the production domain; leave staging hostnames independent.',
    `RewriteCond %{HTTP_HOST} ${acceptedHosts} [NC]`,
    'RewriteCond %{HTTPS} !=on [OR]',
    `RewriteCond %{HTTP_HOST} !^${escapeRegex(host)}(?::443)?$ [NC]`,
    `RewriteRule ^ https://${host}%{REQUEST_URI} [R=301,L,NE]`,
  ].join('\n');

  return content.replace(
    /# Canonicalize only the production domain; leave staging hostnames independent\.[\s\S]*?RewriteRule \^ https:\/\/[^%\r\n]+%\{REQUEST_URI\} \[R=301,L,NE\]/,
    canonicalBlock
  );
};

const generateSeoRouteEntrypoints = (siteUrl: string) => ({
  name: 'generate-seo-route-entrypoints',
  transformIndexHtml(html: string) {
    return html.replace(/__SITE_URL__/g, siteUrl);
  },
  async writeBundle(options: { dir?: string }, bundle: Record<string, unknown>) {
    if (!Object.prototype.hasOwnProperty.call(bundle, 'index.html')) return;

    const outputDirectory = options.dir ?? path.resolve(process.cwd(), 'dist');
    const indexPath = path.join(outputDirectory, 'index.html');
    await fs.access(indexPath);
    const baseHtml = await fs.readFile(indexPath, 'utf8');

    await Promise.all(SEO_ROUTES
      .filter((route) => route.slug !== 'home')
      .map(async (route) => {
        const directory = path.join(outputDirectory, ...route.slug.split('/'));
        await fs.mkdir(directory, { recursive: true });
        await fs.writeFile(path.join(directory, 'index.html'), buildRouteHtml(baseHtml, route.slug, siteUrl));
      }));

    await Promise.all(PRIVATE_SEO_ROUTES.map(async (route) => {
      const directory = path.join(outputDirectory, ...route.path.split('/'));
      await fs.mkdir(directory, { recursive: true });
      await fs.writeFile(path.join(directory, 'index.html'), buildPrivateHtml(baseHtml, route, siteUrl));
    }));

    const htaccessPath = path.join(outputDirectory, '.htaccess');
    const htaccessLines = (await fs.readFile(htaccessPath, 'utf8')).split(/\r?\n/);
    const routePattern = ROUTE_SLUGS
      .filter((slug) => slug !== 'home')
      .map((slug) => slug.split('/').map(escapeRegex).join('/'))
      .join('|');
    const routeRuleIndex = htaccessLines.findIndex((line) =>
      line.startsWith('RewriteRule ^(?:') && line.endsWith(' index.html [L]')
    );
    if (routeRuleIndex === -1) throw new Error('Could not update published routes in .htaccess');
    htaccessLines[routeRuleIndex] = `RewriteRule ^(?:${routePattern})/?$ index.html [L]`;
    const htaccess = replaceCanonicalApacheRules(htaccessLines.join('\n'), siteUrl);
    if (!htaccess.includes(`https://${new URL(siteUrl).host}%{REQUEST_URI}`)) {
      throw new Error('Could not update the canonical host redirect in .htaccess');
    }
    await fs.writeFile(htaccessPath, htaccess);

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${INDEXABLE_SEO_ROUTES.map((route) => {
      const url = new URL(route.canonicalPath.slice(1), siteUrl).href;
      return `  <url><loc>${escapeHtml(url)}</loc></url>`;
    }).join('\n')}\n</urlset>\n`;
    await fs.writeFile(path.join(outputDirectory, 'sitemap.xml'), sitemapXml);
    await fs.writeFile(
      path.join(outputDirectory, 'robots.txt'),
      `User-agent: *\nAllow: /\nDisallow: /404.html\n\nSitemap: ${new URL('sitemap.xml', siteUrl).href}\n`
    );
  },
});

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), '');
  const siteUrl = normalizeSiteUrl(environment.VITE_SITE_URL);

  return {
    define: {
      __SITE_URL__: JSON.stringify(siteUrl),
    },
    plugins: [react(), tailwindcss(), generateSeoRouteEntrypoints(siteUrl)],
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
      proxy: {
        '/api': {
          target: `http://127.0.0.1:${process.env.API_PORT ?? '3001'}`,
          changeOrigin: false,
        },
      },
    },
  };
});
