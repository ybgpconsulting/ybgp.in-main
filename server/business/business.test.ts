import '../db/testDatabaseGuard.js';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { after, before, test } from 'node:test';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import type { RowDataPacket } from 'mysql2';
import app from '../app.js';
import { ADMIN_SESSION_COOKIE_NAME, OWNER_SESSION_COOKIE_NAME } from '../auth/session.js';
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
  const response = await request(email === 'admin@ybgp.local'
    ? '/api/auth/admin/login'
    : '/api/auth/business/login', {
    method: 'POST',
    body: { email, password },
  });
  assert.equal(response.status, 200);
  const setCookie = response.headers.get('set-cookie') ?? '';
  const cookieName = email === 'admin@ybgp.local' ? ADMIN_SESSION_COOKIE_NAME : OWNER_SESSION_COOKIE_NAME;
  const cookie = setCookie.match(new RegExp(`${cookieName}=[a-f\\d]{64}`))?.[0] ?? '';
  assert.ok(cookie.startsWith(`${cookieName}=`));
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
  assert.deepEqual(
    body.templates.map((template) => template.slug).sort(),
    ['modern-business', 'food-bakery', 'salon-studio', 'jewellery-boutique'].sort()
  );
});

test('server serves the built frontend and preserves API 404 responses', async () => {
  const [homeResponse, websiteResponse, modernDemoResponse, assetResponse, missingApiResponse] = await Promise.all([
    request('/'),
    request('/websites/demo-bakery'),
    request('/websites/demo-modern'),
    request('/favicon.svg'),
    request('/api/route-that-does-not-exist'),
  ]);

  assert.equal(homeResponse.status, 200);
  assert.match(homeResponse.headers.get('content-type') ?? '', /text\/html/);
  assert.match(await homeResponse.text(), /<div id="root"><\/div>/);

  assert.equal(websiteResponse.status, 200);
  assert.match(websiteResponse.headers.get('content-type') ?? '', /text\/html/);
  assert.match(await websiteResponse.text(), /assets\/index-[^"]+\.js/);

  assert.equal(modernDemoResponse.status, 200);
  assert.match(modernDemoResponse.headers.get('content-type') ?? '', /text\/html/);

  assert.equal(assetResponse.status, 200);
  assert.match(assetResponse.headers.get('content-type') ?? '', /image\/svg\+xml/);

  assert.equal(missingApiResponse.status, 404);
  assert.match(missingApiResponse.headers.get('content-type') ?? '', /application\/json/);
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

test('expired subscriptions pause tenant API, HTML and sitemap while owner/admin remain available', async () => {
  const adminCookie = (await login('admin@ybgp.local', demoPassword)).cookie;
  const ownerEmail = `expired-tenant-${Date.now()}@example.test`;
  const slug = `expired-tenant-${Date.now()}`;
  createdEmails.push(ownerEmail);
  createdSlugs.push(slug);
  const expiredDate = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const startDate = `${Number(expiredDate.slice(0, 4)) - 1}${expiredDate.slice(4)}`;

  const createResponse = await request('/api/admin/businesses', {
    method: 'POST',
    cookie: adminCookie,
    body: {
      name: 'Expired Subscription Test Tenant',
      slug,
      category: 'Test',
      template_slug: 'modern-business',
      owner_name: 'Expired Test Owner',
      owner_email: ownerEmail,
      owner_password: 'StrongPass!123',
      published: true,
      start_date: startDate,
      expiry_date: expiredDate,
      subscription_active: true,
    },
  });
  assert.equal(createResponse.status, 201);

  const [publicApi, websiteHtml, sitemap] = await Promise.all([
    request(`/api/public/websites/${slug}`),
    request(`/websites/${slug}`),
    request('/sitemap.xml'),
  ]);
  assert.equal(publicApi.status, 404);
  assert.equal(websiteHtml.status, 404);
  assert.doesNotMatch(await sitemap.text(), new RegExp(`/websites/${slug}/`));

  const [[business]] = await pool.execute<Array<RowDataPacket & { id: string }>>(
    'SELECT id FROM businesses WHERE slug = ? LIMIT 1',
    [slug]
  );
  assert.ok(business);
  await pool.execute(
    'UPDATE subscriptions SET status = "EXPIRED", expiry_date = DATE_ADD(UTC_DATE(), INTERVAL 10 DAY) WHERE business_id = ?',
    [business.id]
  );
  const explicitlyExpired = await request(`/api/public/websites/${slug}`);
  assert.equal(explicitlyExpired.status, 404);
});

test('reserved demo slugs resolve database tenants before the demo fallback', async () => {
  const reservedSlugs = ['demo-bakery', 'demo-salon', 'demo-jewellery'];
  const [existingRows] = await pool.execute<Array<RowDataPacket & { slug: string }>>(
    `SELECT slug FROM businesses WHERE slug IN (${reservedSlugs.map(() => '?').join(', ')})`,
    reservedSlugs
  );
  const existingSlugs = new Set(existingRows.map((row) => row.slug));
  const slug = reservedSlugs.find((reservedSlug) => !existingSlugs.has(reservedSlug));
  assert.ok(slug, 'Test requires at least one reserved demo slug to be unused');

  const adminCookie = (await login('admin@ybgp.local', demoPassword)).cookie;
  const ownerEmail = `reserved-demo-${Date.now()}@example.test`;
  createdEmails.push(ownerEmail);
  createdSlugs.push(slug);

  const createResponse = await request('/api/admin/businesses', {
    method: 'POST',
    cookie: adminCookie,
    body: {
      name: 'Database-backed Demo Bakery Tenant',
      slug,
      category: 'Bakery',
      description: 'Tenant content must take precedence over the curated demo.',
      template_slug: 'food-bakery',
      owner_name: 'Reserved Demo Owner',
      owner_email: ownerEmail,
      owner_password: 'StrongPass!123',
      published: true,
      status: 'ACTIVE',
    },
  });
  assert.equal(createResponse.status, 201);

  const tenantResponse = await request(`/api/public/websites/${slug}`);
  assert.equal(tenantResponse.status, 200);
  const tenant = await tenantResponse.json() as {
    business: { name: string; slug: string; description: string };
  };
  assert.equal(tenant.business.slug, slug);
  assert.equal(tenant.business.name, 'Database-backed Demo Bakery Tenant');
  assert.equal(tenant.business.description, 'Tenant content must take precedence over the curated demo.');

  await pool.execute('DELETE FROM businesses WHERE slug = ?', [slug]);

  const missingTenantResponse = await request(`/api/public/websites/${slug}`);
  assert.equal(missingTenantResponse.status, 404);
});

test('admin can create a business and duplicate slug is rejected', async () => {
  const adminCookie = (await login('admin@ybgp.local', demoPassword)).cookie;
  const ownerEmail = `phase4-${Date.now()}@example.test`;
  const slug = `phase4-${Date.now()}`;
  createdEmails.push(ownerEmail);
  createdSlugs.push(slug);

  const missingPasswordResponse = await request('/api/admin/businesses', {
    method: 'POST',
    cookie: adminCookie,
    body: {
      name: 'Missing Password Business',
      slug: `${slug}-missing-password`,
      category: 'Services',
      template_slug: 'modern-business',
      owner_name: 'Missing Password Owner',
      owner_email: `missing-password-${ownerEmail}`,
    },
  });
  assert.equal(missingPasswordResponse.status, 400);

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

test('owners can atomically update only their own profile, contact, location and social links', async () => {
  const adminCookie = (await login('admin@ybgp.local', demoPassword)).cookie;
  const timestamp = Date.now();
  const tenants = [
    { name: 'Contact A', slug: `contact-a-${timestamp}`, email: `contact-a-${timestamp}@example.test` },
    { name: 'Contact B', slug: `contact-b-${timestamp}`, email: `contact-b-${timestamp}@example.test` },
  ];
  const businessIds: string[] = [];

  for (const tenant of tenants) {
    createdEmails.push(tenant.email);
    createdSlugs.push(tenant.slug);
    const response = await request('/api/admin/businesses', {
      method: 'POST',
      cookie: adminCookie,
      body: {
        name: tenant.name,
        slug: tenant.slug,
        category: 'Services',
        template_slug: 'modern-business',
        owner_name: tenant.name,
        owner_email: tenant.email,
        owner_password: 'StrongPass!123',
        published: true,
      },
    });
    assert.equal(response.status, 201);
    const body = await response.json() as { business?: { id: string } };
    assert.ok(body.business?.id);
    businessIds.push(body.business.id);
  }

  const ownerA = (await login(tenants[0].email, 'StrongPass!123')).cookie;
  const ownerB = (await login(tenants[1].email, 'StrongPass!123')).cookie;
  const forgedBusinessId = Number(businessIds[1]);
  assert.ok(Number.isSafeInteger(forgedBusinessId));
  const updateResponse = await request('/api/business/me', {
    method: 'PATCH',
    cookie: ownerA,
    body: {
      business_id: forgedBusinessId,
      name: 'Contact A Updated',
      category: 'Services',
      description: 'Updated owner profile',
      email: tenants[0].email,
      address: '42 Sample Road',
      city: 'Pune',
      pincode: '411001',
      google_maps_url: 'https://maps.google.com/?q=42+Sample+Road',
      phone: '+919876543210',
      whatsapp: '+919876543210',
      instagram_url: 'https://instagram.com/contact-a',
      facebook_url: '',
      youtube_url: 'https://youtube.com/@contact-a',
      linkedin_url: 'https://linkedin.com/company/contact-a',
      google_business_url: '',
      other_social_url: 'https://example.test/contact-a',
      tiktok_url: 'https://tiktok.com/@contact-a',
      x_url: 'https://x.com/contact-a',
      pinterest_url: 'https://pinterest.com/contact-a',
    },
  });
  assert.equal(updateResponse.status, 200);

  const [publicAResponse, publicBResponse] = await Promise.all([
    request(`/api/public/websites/${tenants[0].slug}`),
    request(`/api/public/websites/${tenants[1].slug}`),
  ]);
  assert.equal(publicAResponse.status, 200);
  assert.equal(publicBResponse.status, 200);
  const publicA = await publicAResponse.json() as {
    business: { address: string; google_maps_url: string; phone: string; whatsapp: string; instagram_url: string; facebook_url: string | null };
    settings: Record<string, string>;
  };
  const publicB = await publicBResponse.json() as {
    business: { address: string | null; google_maps_url: string | null; instagram_url: string | null };
    settings: Record<string, string>;
  };

  assert.equal(publicA.business.address, '42 Sample Road');
  assert.equal(publicA.business.google_maps_url, 'https://maps.google.com/?q=42+Sample+Road');
  assert.equal(publicA.business.phone, '+919876543210');
  assert.equal(publicA.business.whatsapp, '+919876543210');
  assert.equal(publicA.business.instagram_url, 'https://instagram.com/contact-a');
  assert.equal(publicA.business.facebook_url, null);
  assert.equal(publicA.settings.city, 'Pune');
  assert.equal(publicA.settings.pincode, '411001');
  assert.equal(publicA.settings.contact_address, '42 Sample Road');
  assert.equal(publicA.settings.call_phone, '+919876543210');
  assert.equal(publicA.settings.whatsapp, '+919876543210');
  assert.equal(publicA.settings.youtube_url, 'https://youtube.com/@contact-a');
  assert.equal(publicA.settings.linkedin_url, 'https://linkedin.com/company/contact-a');
  assert.equal(publicA.settings.other_social_url, 'https://example.test/contact-a');
  assert.equal(publicA.settings.tiktok_url, 'https://tiktok.com/@contact-a');
  assert.equal(publicA.settings.x_url, 'https://x.com/contact-a');
  assert.equal(publicA.settings.pinterest_url, 'https://pinterest.com/contact-a');
  assert.equal(publicB.business.address, null);
  assert.equal(publicB.business.google_maps_url, null);
  assert.equal(publicB.business.instagram_url, null);
  assert.equal(publicB.settings.city, undefined);

  const adminUpdateResponse = await request(`/api/admin/businesses/${businessIds[1]}`, {
    method: 'PATCH',
    cookie: adminCookie,
    body: {
      address: '9 Business B Street',
      city: 'Mumbai',
      pincode: '400001',
      google_maps_url: 'https://maps.google.com/?q=9+Business+B+Street',
      phone: '+919876543211',
      whatsapp: '+919876543211',
      instagram_url: 'https://instagram.com/contact-b',
      linkedin_url: 'https://linkedin.com/company/contact-b',
      tiktok_url: 'https://tiktok.com/@contact-b',
      x_url: 'https://x.com/contact-b',
      pinterest_url: 'https://pinterest.com/contact-b',
    },
  });
  assert.equal(adminUpdateResponse.status, 200);
  const adminListResponse = await request('/api/admin/businesses', { cookie: adminCookie });
  assert.equal(adminListResponse.status, 200);
  const adminList = await adminListResponse.json() as { businesses: Array<{ id: string; city: string; linkedin_url: string; tiktok_url: string; x_url: string; pinterest_url: string }> };
  const adminBusinessB = adminList.businesses.find((business) => business.id === businessIds[1]);
  assert.equal(adminBusinessB?.city, 'Mumbai');
  assert.equal(adminBusinessB?.linkedin_url, 'https://linkedin.com/company/contact-b');
  assert.equal(adminBusinessB?.tiktok_url, 'https://tiktok.com/@contact-b');
  assert.equal(adminBusinessB?.x_url, 'https://x.com/contact-b');
  assert.equal(adminBusinessB?.pinterest_url, 'https://pinterest.com/contact-b');

  const updatedPublicBResponse = await request(`/api/public/websites/${tenants[1].slug}`);
  const updatedPublicB = await updatedPublicBResponse.json() as {
    business: { address: string; google_maps_url: string; instagram_url: string };
    settings: Record<string, string>;
  };
  assert.equal(updatedPublicB.business.address, '9 Business B Street');
  assert.equal(updatedPublicB.business.google_maps_url, 'https://maps.google.com/?q=9+Business+B+Street');
  assert.equal(updatedPublicB.settings.contact_address, '9 Business B Street');
  assert.equal(updatedPublicB.settings.call_phone, '+919876543211');
  assert.equal(updatedPublicB.settings.whatsapp, '+919876543211');
  assert.equal(updatedPublicB.business.instagram_url, 'https://instagram.com/contact-b');
  assert.equal(updatedPublicB.settings.city, 'Mumbai');
  assert.equal(updatedPublicB.settings.linkedin_url, 'https://linkedin.com/company/contact-b');
  assert.equal(updatedPublicB.settings.tiktok_url, 'https://tiktok.com/@contact-b');
  assert.equal(updatedPublicB.settings.x_url, 'https://x.com/contact-b');
  assert.equal(updatedPublicB.settings.pinterest_url, 'https://pinterest.com/contact-b');

  const ownerBUpdate = await request('/api/business/me', {
    method: 'PATCH',
    cookie: ownerB,
    body: {
      name: 'Contact B',
      category: 'Services',
      address: 'Business B Address',
      city: '',
      pincode: '',
      google_maps_url: '',
      phone: '',
      whatsapp: '',
      instagram_url: '',
      facebook_url: '',
      youtube_url: '',
      linkedin_url: '',
      google_business_url: '',
      other_social_url: '',
      tiktok_url: '',
      x_url: '',
      pinterest_url: '',
    },
  });
  assert.equal(ownerBUpdate.status, 200);

  const invalidUrlResponse = await request('/api/business/me', {
    method: 'PATCH',
    cookie: ownerA,
    body: {
      name: 'Contact A Updated',
      category: 'Services',
      address: '',
      city: '',
      pincode: '',
      google_maps_url: '',
      phone: '',
      whatsapp: '',
      instagram_url: 'javascript:alert(1)',
      facebook_url: '',
      youtube_url: '',
      linkedin_url: '',
      google_business_url: '',
      other_social_url: '',
      tiktok_url: '',
      x_url: '',
      pinterest_url: '',
    },
  });
  assert.equal(invalidUrlResponse.status, 400);

  const triggerName = `test_fail_business_settings_${timestamp}`;
  await pool.query(
    `CREATE TRIGGER ${triggerName} BEFORE INSERT ON business_settings FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'forced transaction failure'`
  );
  try {
    const failedSave = await request('/api/business/me', {
      method: 'PATCH',
      cookie: ownerA,
      body: {
        name: 'Must Roll Back',
        category: 'Services',
        city: 'Should not persist',
      },
    });
    assert.equal(failedSave.status, 500);
    const failedSaveBody = await failedSave.json() as { error?: string };
    assert.equal(failedSaveBody.error, 'Unable to save your business profile. Please try again.');

    const ownerSnapshotResponse = await request('/api/business/me', { cookie: ownerA });
    assert.equal(ownerSnapshotResponse.status, 200);
    const ownerSnapshot = await ownerSnapshotResponse.json() as {
      business: { name: string };
      settings: Record<string, string>;
    };
    assert.equal(ownerSnapshot.business.name, 'Contact A Updated');
    assert.equal(ownerSnapshot.settings.city, 'Pune');
  } finally {
    await pool.query(`DROP TRIGGER IF EXISTS ${triggerName}`);
  }
});
