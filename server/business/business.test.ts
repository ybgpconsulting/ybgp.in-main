import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { after, before, test } from 'node:test';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import app from '../app.js';
import { SESSION_COOKIE_NAME } from '../auth/session.js';
import { pool } from '../db/pool.js';

const demoPassword = 'Ybgp-Dev-Only-6cV9-Qm2X!Local';
const createdEmails: string[] = [];
const createdSlugs: string[] = [];
let server: Server;
let baseUrl: string;

const request = (
  path: string,
  options: { method?: string; cookie?: string; body?: unknown; headers?: Record<string, string> } = {}
): Promise<Response> => fetch(`${baseUrl}${path}`, {
  method: options.method ?? 'GET',
  headers: {
    ...(options.cookie ? { cookie: options.cookie } : {}),
    ...(options.body !== undefined ? { 'content-type': 'application/json' } : {}),
    ...options.headers,
  },
  ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
});

const login = async (email: string, password: string): Promise<{ cookie: string }> => {
  const response = await request('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  assert.equal(response.status, 200);
  const setCookie = response.headers.get('set-cookie') ?? '';
  const cookie = setCookie.split(';', 1)[0] ?? '';
  assert.ok(cookie.startsWith(`${SESSION_COOKIE_NAME}=`));
  return { cookie };
};

before(async () => {
  server = createServer(app);
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await Promise.all(
    createdEmails.map(async (email) => {
      await pool.execute('DELETE FROM users WHERE email = ?', [email]);
    })
  );
  await Promise.all(
    createdSlugs.map(async (slug) => {
      await pool.execute('DELETE FROM businesses WHERE slug = ?', [slug]);
    })
  );
  await new Promise<void>((resolve, reject) => { server.close((error) => error ? reject(error) : resolve()); });
  await pool.end();
});

test('templates API lists active templates', async () => {
  const response = await request('/api/templates');
  assert.equal(response.status, 200);
  const body = await response.json() as { templates?: Array<{ slug: string }> };
  assert.ok(Array.isArray(body.templates));
  assert.ok(body.templates.some((template) => template.slug === 'modern-business'));
  assert.ok(body.templates.some((template) => template.slug === 'food-bakery'));
});

test('public website API resolves seeded business data', async () => {
  const response = await request('/api/public/websites/aroma-and-crumb');
  assert.equal(response.status, 200);
  const body = await response.json() as {
    business?: { slug: string; name: string };
    categories?: Array<{ name: string }>;
    products?: Array<{ name: string }>;
  };

  assert.equal(body.business?.slug, 'aroma-and-crumb');
  assert.equal(body.business?.name, 'Aroma & Crumb');
  assert.ok(Array.isArray(body.categories));
  assert.ok(Array.isArray(body.products));
});

test('admin can create a business and duplicate slug is rejected', async () => {
  const adminCookie = (await login('admin@ybgp.local', demoPassword)).cookie;
  const ownerEmail = `phase4-${Date.now()}@example.test`;
  const slug = `phase4-${Date.now()}`;
  createdEmails.push(ownerEmail);
  createdSlugs.push(slug);

  const createResponse = await request('/api/admin/businesses', {
    method: 'POST',
    cookie: adminCookie,
    body: {
      name: 'Phase 4 Demo Bakery',
      slug,
      category: 'Bakery & Catering',
      template_slug: 'food-bakery',
      owner_name: 'Phase 4 Owner',
      owner_email: ownerEmail,
      owner_password: 'StrongPass!123',
      published: true,
      status: 'ACTIVE',
    },
  });

  assert.equal(createResponse.status, 201);
  const createdBody = await createResponse.json() as { business?: { slug: string; owner?: { email: string } } };
  assert.equal(createdBody.business?.slug, slug);
  assert.equal(createdBody.business?.owner?.email, ownerEmail);

  const duplicateResponse = await request('/api/admin/businesses', {
    method: 'POST',
    cookie: adminCookie,
    body: {
      name: 'Duplicate Bakery',
      slug,
      category: 'Bakery & Catering',
      template_slug: 'food-bakery',
      owner_name: 'Another Owner',
      owner_email: `duplicate-${Date.now()}@example.test`,
      owner_password: 'AnotherStrongPass!123',
      published: false,
      status: 'INACTIVE',
    },
  });

  assert.equal(duplicateResponse.status, 409);
  const duplicateBody = await duplicateResponse.json() as { error?: string };
  assert.match(duplicateBody.error ?? '', /already in use|different slug/i);
});

test('admin can create a draft website that remains unpublished', async () => {
  const adminCookie = (await login('admin@ybgp.local', demoPassword)).cookie;
  const ownerEmail = `phase4-draft-${Date.now()}@example.test`;
  const slug = `phase4-draft-${Date.now()}`;
  createdEmails.push(ownerEmail);
  createdSlugs.push(slug);

  const createResponse = await request('/api/admin/businesses', {
    method: 'POST',
    cookie: adminCookie,
    body: {
      name: 'Phase 4 Draft Website',
      slug,
      category: 'Services',
      template_slug: 'modern-business',
      owner_name: 'Draft Owner',
      owner_email: ownerEmail,
      owner_password: 'StrongPass!123',
      published: false,
    },
  });

  assert.equal(createResponse.status, 201);
  const body = await createResponse.json() as { business?: { status: string } };
  assert.equal(body.business?.status, 'INACTIVE');

  const publicResponse = await request(`/api/public/websites/${slug}`);
  assert.equal(publicResponse.status, 404);
});
