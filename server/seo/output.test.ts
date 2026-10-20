import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

const outputDirectory = path.resolve(process.cwd(), 'dist');

const readPage = async (routePath: string): Promise<string> => {
  const pagePath = routePath === '/'
    ? path.join(outputDirectory, 'index.html')
    : path.join(outputDirectory, ...routePath.replace(/^\/|\/$/g, '').split('/'), 'index.html');
  return readFile(pagePath, 'utf8');
};

const getMetaContent = (html: string, selector: RegExp): string => {
  const match = selector.exec(html);
  assert.ok(match?.[1], `Expected metadata matching ${selector}`);
  return match[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
};

const walkHtmlFiles = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory() && entry.name !== 'assets' && entry.name !== 'demo-sites') {
      return walkHtmlFiles(entryPath);
    }
    return entry.isFile() && entry.name === 'index.html' ? [entryPath] : [];
  }));
  return nested.flat();
};

test('sitemap lists only unique canonical indexable pages with matching metadata', async () => {
  const sitemap = await readFile(path.join(outputDirectory, 'sitemap.xml'), 'utf8');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.ok(urls.length > 0);
  assert.match(sitemap, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.match(sitemap, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
  assert.match(sitemap, /<\/urlset>\s*$/);
  assert.doesNotMatch(sitemap, /<lastmod>|<changefreq>|<priority>/);
  assert.equal(new Set(urls).size, urls.length, 'Sitemap URLs must be unique');

  const titles = new Set<string>();
  const descriptions = new Set<string>();
  for (const url of urls) {
    const parsedUrl = new URL(url);
    assert.ok(['https:', 'http:'].includes(parsedUrl.protocol));
    assert.equal(parsedUrl.search, '');
    assert.equal(parsedUrl.hash, '');
    assert.equal(parsedUrl.hostname, new URL(urls[0]).hostname);
    assert.equal(parsedUrl.pathname === '/' || parsedUrl.pathname.endsWith('/'), true);

    const html = await readPage(parsedUrl.pathname);
    const title = /<title>(.*?)<\/title>/is.exec(html)?.[1];
    const description = getMetaContent(html, /<meta\s+name="description"\s+content="([^"]*)"/i);
    const canonical = getMetaContent(html, /<link\s+rel="canonical"\s+href="([^"]*)"/i);
    const robots = getMetaContent(html, /<meta\s+name="robots"\s+content="([^"]*)"/i);
    assert.ok(title?.trim(), `Missing title for ${url}`);
    assert.ok(description.trim().length > 40, `Missing useful description for ${url}`);
    assert.equal(canonical, url, `Canonical must match sitemap URL ${url}`);
    assert.match(robots, /^index,\s*follow/i, `Sitemap page must be indexable: ${url}`);
    assert.match(html, /<h1(?:\s|>)/i, `Initial HTML must contain an H1: ${url}`);
    assert.equal(titles.has(title!), false, `Title is duplicated: ${title}`);
    assert.equal(descriptions.has(description), false, `Description is duplicated: ${url}`);
    titles.add(title!);
    descriptions.add(description);

    const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
    assert.ok(schemas.length > 0, `Missing structured data for ${url}`);
    for (const schema of schemas) assert.doesNotThrow(() => JSON.parse(schema[1]));
  }

  assert.ok(urls.includes(`${new URL(urls[0]).origin}/business-website/`));
  assert.equal(urls.includes(`${new URL(urls[0]).origin}/websites/`), false);
  assert.doesNotMatch(sitemap, /\/websites\/(?:admin|dashboard|demo-|[^/]+\/)/);
});

test('private dashboards, demos and thin location templates are excluded from indexing', async () => {
  const paths = [
    '/websites/admin/',
    '/websites/dashboard/',
    '/websites/demo-modern/',
    '/websites/demo-bakery/',
    '/websites/demo-salon/',
    '/websites/demo-jewellery/',
    '/websites/demo-clinic/',
    '/websites/demo-astrology/',
    '/websites/demo-travel/',
    '/website-development-company-gurugram/',
    '/digital-marketing-agency-ghaziabad/',
    '/work/gandhinagar-wholesale/',
    '/work/zewargali/',
  ];
  const sitemap = await readFile(path.join(outputDirectory, 'sitemap.xml'), 'utf8');

  for (const routePath of paths) {
    const html = await readPage(routePath);
    assert.match(html, /<meta\s+name="robots"\s+content="noindex,\s*(?:nofollow|follow)"/i, routePath);
    assert.equal(sitemap.includes(routePath), false, `Private or noindex route is in sitemap: ${routePath}`);
  }

  const dashboard = await readPage('/websites/admin/');
  assert.doesNotMatch(dashboard, /rel="canonical"/i);
  assert.doesNotMatch(dashboard, /application\/ld\+json/i);
});

test('robots, canonical redirects, and important metadata assets are valid', async () => {
  const robots = await readFile(path.join(outputDirectory, 'robots.txt'), 'utf8');
  const sitemap = await readFile(path.join(outputDirectory, 'sitemap.xml'), 'utf8');
  const htaccess = await readFile(path.join(outputDirectory, '.htaccess'), 'utf8');
  const home = await readPage('/');
  const siteOrigin = new URL(
    getMetaContent(home, /<link\s+rel="canonical"\s+href="([^"]*)"/i)
  ).origin;

  assert.match(robots, /^User-agent: \*\nAllow: \//);
  assert.match(robots, new RegExp(`Sitemap: ${siteOrigin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/sitemap\\.xml`));
  const host = new URL(siteOrigin).host.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  assert.match(htaccess, new RegExp(`RewriteRule \\^ https://${host}%\\{REQUEST_URI\\} \\[R=301,L,NE\\]`));
  assert.match(htaccess, /RewriteRule \^websites\/\[a-z0-9\]\[a-z0-9-\]\{1,179\}\/dashboard\/\?\$ index\.html \[L,NC\]/);
  assert.doesNotMatch(htaccess, /RewriteRule \^websites\(\?:\/\.\*\)/);
  assert.match(htaccess, /ErrorDocument 404 \/404\.html/);
  assert.match(sitemap, new RegExp(siteOrigin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

  for (const asset of ['og-image.svg', 'logo.svg', 'favicon.svg', 'favicon.png']) {
    await access(path.join(outputDirectory, asset));
  }

  const htmlFiles = await walkHtmlFiles(outputDirectory);
  assert.ok(htmlFiles.length > 15, 'Expected generated static route documents');
});

test('404 document is excluded from indexing', async () => {
  const html = await readFile(path.join(outputDirectory, '404.html'), 'utf8');
  assert.match(html, /<meta\s+name="robots"\s+content="noindex"/i);
});
