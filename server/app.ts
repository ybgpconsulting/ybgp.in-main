import express from 'express';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { RowDataPacket } from 'mysql2';
import { pool } from './db/pool.js';
import { env } from './config/env.js';
import authRouter from './auth/routes.js';
import adminRouter from './admin/routes.js';
import businessRouter from './business/routes.js';
import publicRouter from './public/routes.js';
import templatesRouter from './templates/routes.js';
import { renderTenantHtml } from './seo/html.js';

const app = express();
const frontendDirectory = resolve(process.cwd(), 'dist');
const showcaseSlugs = new Set(['demo-bakery', 'demo-salon', 'demo-jewellery']);

interface TenantSeoRow extends RowDataPacket {
  name: string;
  category: string;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
}

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/business', businessRouter);
app.use('/api/public', publicRouter);
app.use('/api/templates', templatesRouter);

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', service: 'ybgp-websites-api' });
});

app.get('/api/health/db', async (_request, response) => {
  try {
    await pool.query('SELECT 1');
    response.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Database health check failed');
    response.status(503).json({ status: 'error', database: 'unavailable' });
  }
});

app.get('/websites/:slug/dashboard', (request, response, next) => {
  const slug = request.params.slug;
  if (slug === 'admin' || slug === 'dashboard' || !/^[a-z0-9][a-z0-9-]{1,179}$/i.test(slug)) {
    response.status(404).sendFile(resolve(frontendDirectory, '404.html'));
    return;
  }
  response.sendFile(resolve(frontendDirectory, 'index.html'), (error) => {
    if (error) next(error);
  });
});

app.get('/websites/:slug', async (request, response, next) => {
  const slug = request.params.slug;
  if (slug === 'admin' || slug === 'dashboard') {
    next();
    return;
  }
  if (!/^[a-z0-9][a-z0-9-]{1,179}$/i.test(slug)) {
    response.status(404).sendFile(resolve(frontendDirectory, '404.html'));
    return;
  }

  try {
    const [rows] = await pool.execute<TenantSeoRow[]>(
      `SELECT b.name, b.category, b.description,
        (SELECT setting_value FROM business_settings WHERE business_id = b.id AND setting_key = 'seo_title' LIMIT 1) AS seo_title,
        (SELECT setting_value FROM business_settings WHERE business_id = b.id AND setting_key = 'seo_description' LIMIT 1) AS seo_description,
        (SELECT setting_value FROM business_settings WHERE business_id = b.id AND setting_key = 'og_image' LIMIT 1) AS og_image
       FROM businesses b
       WHERE b.slug = ? AND b.status = 'ACTIVE'
         AND EXISTS (
           SELECT 1 FROM subscriptions s
           WHERE s.business_id = b.id
             AND s.status = 'ACTIVE'
             AND s.expiry_date >= UTC_DATE()
         )
       LIMIT 1`,
      [slug]
    );
    const tenant = rows[0];
    if (!tenant) {
      if (showcaseSlugs.has(slug)) {
        next();
        return;
      }
      response.status(404).sendFile(resolve(frontendDirectory, '404.html'));
      return;
    }

    const description = tenant.seo_description?.trim() ||
      tenant.description?.trim() ||
      `Visit ${tenant.name} for ${tenant.category.toLowerCase()} offerings and contact information.`;
    const canonicalUrl = new URL(`websites/${slug}/`, env.siteUrl).href;
    const defaultImage = new URL('og-image.svg', env.siteUrl).href;
    let imageUrl = defaultImage;
    if (tenant.og_image?.trim()) {
      try {
        const candidate = new URL(tenant.og_image.trim(), env.siteUrl);
        if (['https:', 'http:'].includes(candidate.protocol) && !candidate.username && !candidate.password) {
          imageUrl = candidate.href;
        }
      } catch {
        imageUrl = defaultImage;
      }
    }

    const template = await readFile(resolve(frontendDirectory, 'index.html'), 'utf8');
    response.type('html').send(renderTenantHtml(template, {
      name: tenant.name,
      title: tenant.seo_title?.trim() || `${tenant.name} | ${tenant.category}`,
      description,
      canonicalUrl,
      imageUrl,
    }));
  } catch (error) {
    if (showcaseSlugs.has(slug)) {
      next();
      return;
    }
    next(error);
  }
});

app.get('/sitemap.xml', async (_request, response, next) => {
  try {
    const [rows] = await pool.execute<Array<RowDataPacket & { slug: string }>>(
      `SELECT b.slug FROM businesses b
       INNER JOIN subscriptions s ON s.business_id = b.id
       WHERE b.status = 'ACTIVE'
         AND s.status = 'ACTIVE'
         AND s.expiry_date >= UTC_DATE()
       ORDER BY b.slug`
    );
    const sitemapPath = resolve(frontendDirectory, 'sitemap.xml');
    const sitemap = await readFile(sitemapPath, 'utf8');
    const tenantEntries = rows
      .filter((row) => /^[a-z0-9][a-z0-9-]{1,179}$/i.test(row.slug))
      .map((row) => {
        const url = new URL(`websites/${row.slug}/`, env.siteUrl).href
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        return `  <url><loc>${url}</loc></url>`;
      });
    response.type('application/xml').send(
      sitemap.replace('</urlset>', `${tenantEntries.length ? `\n${tenantEntries.join('\n')}\n` : ''}</urlset>`)
    );
  } catch (error) {
    next(error);
  }
});

app.use(express.static(frontendDirectory));

app.use((request, response, next) => {
  if (request.path.startsWith('/api/')) {
    response.status(404).json({ error: 'Not found' });
    return;
  }
  response.status(404).sendFile(resolve(frontendDirectory, '404.html'), (error) => {
    if (error) next(error);
  });
});

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  if (error instanceof SyntaxError) {
    response.status(400).json({ error: 'Invalid JSON request body' });
    return;
  }
  console.error('Unhandled API error');
  response.status(500).json({ error: 'Internal server error' });
});

export default app;
