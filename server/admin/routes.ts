import { Router } from 'express';
import type { RowDataPacket } from 'mysql2';
import { pool } from '../db/pool.js';
import { hashPassword } from '../auth/password.js';
import { requireAuth, requireRole } from '../auth/middleware.js';

const router = Router();

router.use(requireAuth, requireRole('SUPER_ADMIN'));

interface TemplateRow extends RowDataPacket {
  id: string;
  slug: string;
  name: string;
}

interface BusinessRow extends RowDataPacket {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  template_id: string;
  created_at: string;
  updated_at: string;
  template_name: string | null;
  plan: string | null;
  subscription_status: 'ACTIVE' | 'EXPIRED' | null;
  amount: string | null;
  start_date: string | null;
  expiry_date: string | null;
  owner_name: string | null;
  owner_email: string | null;
  enquiry_count: number;
}

interface UserRow extends RowDataPacket {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'BUSINESS_OWNER';
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeSlug = (value: string): string => value
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 180) || 'business';

const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isPositiveInteger = (value: string): boolean => /^[1-9]\d{0,19}$/.test(value);
const isValidDate = (value: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
const addOneYear = (value: string): string => {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCFullYear(date.getUTCFullYear() + 1);
  return date.toISOString().slice(0, 10);
};

const findTemplate = async (value: string | number | undefined): Promise<{ id: string; name: string; slug: string } | null> => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const [rows] = await pool.execute<TemplateRow[]>(
    value === 'modern-business' || value === 'food-bakery' || typeof value === 'string' && !/^[0-9]+$/.test(value)
      ? 'SELECT id, name, slug FROM templates WHERE slug = ? LIMIT 1'
      : 'SELECT id, name, slug FROM templates WHERE id = ? LIMIT 1',
    [value]
  );

  const row = rows[0];
  return row ? { id: row.id, name: row.name, slug: row.slug } : null;
};

const parseBusinessStatus = (value: unknown): 'ACTIVE' | 'INACTIVE' => {
  if (value === 'INACTIVE') return 'INACTIVE';
  return 'ACTIVE';
};

router.get('/businesses', async (_request, response) => {
  const [rows] = await pool.execute<BusinessRow[]>(
    `SELECT b.id,
      b.name,
      b.slug,
      b.category,
      b.description,
      b.phone,
      b.whatsapp,
      b.email,
      b.address,
      b.status,
      b.template_id,
      b.created_at,
      b.updated_at,
      t.name AS template_name,
      s.plan,
      s.status AS subscription_status,
      s.amount,
      s.start_date,
      s.expiry_date,
      u.name AS owner_name,
      u.email AS owner_email,
      (SELECT COUNT(*) FROM enquiries e WHERE e.business_id = b.id) AS enquiry_count
     FROM businesses b
     LEFT JOIN templates t ON t.id = b.template_id
     LEFT JOIN subscriptions s ON s.business_id = b.id
     LEFT JOIN business_users bu ON bu.business_id = b.id AND bu.role = 'BUSINESS_OWNER'
     LEFT JOIN users u ON u.id = bu.user_id
     ORDER BY b.created_at DESC`
  );

  response.json({ businesses: rows });
});

router.get('/businesses/:id', async (request, response) => {
  const { id } = request.params;
  if (!isPositiveInteger(id)) {
    response.status(404).json({ error: 'Business not found' });
    return;
  }

  const [rows] = await pool.execute<BusinessRow[]>(
    `SELECT b.id,
      b.name,
      b.slug,
      b.category,
      b.description,
      b.phone,
      b.whatsapp,
      b.email,
      b.address,
      b.status,
      b.template_id,
      b.created_at,
      b.updated_at,
      t.name AS template_name,
      s.plan,
      s.status AS subscription_status,
      s.amount,
      s.start_date,
      s.expiry_date,
      u.name AS owner_name,
      u.email AS owner_email,
      (SELECT COUNT(*) FROM enquiries e WHERE e.business_id = b.id) AS enquiry_count
     FROM businesses b
     LEFT JOIN templates t ON t.id = b.template_id
     LEFT JOIN subscriptions s ON s.business_id = b.id
     LEFT JOIN business_users bu ON bu.business_id = b.id AND bu.role = 'BUSINESS_OWNER'
     LEFT JOIN users u ON u.id = bu.user_id
     WHERE b.id = ?
     LIMIT 1`,
    [id]
  );

  const business = rows[0];
  if (!business) {
    response.status(404).json({ error: 'Business not found' });
    return;
  }

  response.json({ business });
});

router.post('/businesses', async (request, response) => {
  const body = request.body;
  if (!isRecord(body)) {
    response.status(400).json({ error: 'Business payload is required' });
    return;
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const category = typeof body.category === 'string' ? body.category.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const businessEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const whatsapp = typeof body.whatsapp === 'string' ? body.whatsapp.trim() : '';
  const address = typeof body.address === 'string' ? body.address.trim() : '';
  const instagram = typeof body.instagram_url === 'string' ? body.instagram_url.trim() : '';
  const facebook = typeof body.facebook_url === 'string' ? body.facebook_url.trim() : '';
  const googleBusiness = typeof body.google_business_url === 'string' ? body.google_business_url.trim() : '';
  const youtube = typeof body.youtube_url === 'string' ? body.youtube_url.trim() : '';
  const city = typeof body.city === 'string' ? body.city.trim() : '';
  const pincode = typeof body.pincode === 'string' ? body.pincode.trim() : '';
  const ownerPhone = typeof body.owner_phone === 'string' ? body.owner_phone.trim() : '';
  const ownerName = typeof body.owner_name === 'string' ? body.owner_name.trim() : (typeof body.ownerName === 'string' ? body.ownerName.trim() : '');
  const ownerEmail = typeof body.owner_email === 'string' ? body.owner_email.trim().toLowerCase() : (typeof body.ownerEmail === 'string' ? body.ownerEmail.trim().toLowerCase() : '');
  const ownerPassword = typeof body.owner_password === 'string' ? body.owner_password : (typeof body.ownerPassword === 'string' ? body.ownerPassword : 'Ybgp-Websites-Owner-2026');
  const rawSlug = typeof body.slug === 'string' ? body.slug : normalizeSlug(name);
  const slug = normalizeSlug(rawSlug);
  const plan = typeof body.plan === 'string' && body.plan.trim() ? body.plan.trim() : 'YBGP Websites';
  const businessStatus: 'ACTIVE' | 'INACTIVE' = body.published === false
    ? 'INACTIVE'
    : parseBusinessStatus(body.published === true ? 'ACTIVE' : body.status);
  const amount = Number(body.amount ?? 999);
  const startDate = typeof body.start_date === 'string' ? body.start_date : new Date().toISOString().slice(0, 10);
  const expiryDate = typeof body.expiry_date === 'string' ? body.expiry_date : addOneYear(startDate);

  if (!name || !category || !ownerName || !ownerEmail || !isValidEmail(ownerEmail)) {
    response.status(400).json({ error: 'Business name, category, owner name, and valid owner email are required' });
    return;
  }

  if (slug.length < 2) {
    response.status(400).json({ error: 'Slug must be at least 2 characters' });
    return;
  }
  if (!Number.isFinite(amount) || amount < 0 || !isValidDate(startDate) || !isValidDate(expiryDate) || expiryDate < startDate) {
    response.status(400).json({ error: 'Subscription amount and dates are invalid' });
    return;
  }

  const template = await findTemplate(typeof body.template_id === 'string' || typeof body.template_id === 'number'
    ? body.template_id
    : typeof body.template_slug === 'string'
      ? body.template_slug
      : typeof body.template === 'string'
        ? body.template
        : undefined);

  if (!template) {
    response.status(400).json({ error: 'A valid template is required' });
    return;
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existingBusiness] = await connection.execute<RowDataPacket[]>(
      'SELECT id FROM businesses WHERE slug = ? LIMIT 1',
      [slug]
    );

    if (existingBusiness[0]) {
      response.status(409).json({ error: `Slug "${slug}" is already in use. Please choose a different slug.` });
      await connection.rollback();
      return;
    }

    const [existingUsers] = await connection.execute<UserRow[]>(
      'SELECT id, name, email, role FROM users WHERE email = ? LIMIT 1',
      [ownerEmail]
    );

    const ownerRecord = existingUsers[0];
    const userId = ownerRecord
      ? ownerRecord.id
      : await (async () => {
          const [result] = await connection.execute(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, "BUSINESS_OWNER")',
            [ownerName, ownerEmail, await hashPassword(ownerPassword)]
          );
          return Number((result as { insertId: number }).insertId);
        })();

    if (!ownerRecord) {
      await connection.execute(
        'UPDATE users SET name = ?, role = "BUSINESS_OWNER" WHERE id = ?',
        [ownerName, userId]
      );
    }

    const [businessInsert] = await connection.execute(
      `INSERT INTO businesses (name, slug, category, description, phone, whatsapp, email, address, instagram_url, facebook_url, google_maps_url, template_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, slug, category, description || null, phone || null, whatsapp || null, businessEmail || ownerEmail, address || null, instagram || null, facebook || null, null, template.id, businessStatus]
    );

    const businessId = Number((businessInsert as { insertId: number }).insertId);

    await connection.execute(
      'INSERT INTO business_users (business_id, user_id, role) VALUES (?, ?, "BUSINESS_OWNER") ON DUPLICATE KEY UPDATE role = VALUES(role)',
      [businessId, userId]
    );

    await connection.execute(
      `INSERT INTO subscriptions (business_id, plan, amount, start_date, expiry_date, status)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE plan = VALUES(plan), amount = VALUES(amount), start_date = VALUES(start_date), expiry_date = VALUES(expiry_date), status = VALUES(status)`,
      [businessId, plan, amount, startDate, expiryDate, body.subscription_active === false ? 'EXPIRED' : 'ACTIVE']
    );

    const settings = Object.entries({
      website_visibility: body.published === true || body.status === 'ACTIVE' ? 'public' : 'draft',
      city,
      pincode,
      owner_phone: ownerPhone,
      youtube_url: youtube,
      google_business_url: googleBusiness,
    }).filter(([, value]) => value);
    for (const [key, value] of settings) {
      await connection.execute(
        'INSERT INTO business_settings (business_id, setting_key, setting_value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
        [businessId, key, value]
      );
    }

    await connection.commit();
    response.status(201).json({
      business: {
        id: String(businessId),
        name,
        slug,
        category,
        description,
        status: businessStatus,
        template: template,
        owner: { id: String(userId), name: ownerName, email: ownerEmail },
      },
      publicUrl: `/websites/${slug}`,
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

router.patch('/businesses/:id', async (request, response) => {
  const { id } = request.params;
  if (!isPositiveInteger(id)) {
    response.status(404).json({ error: 'Business not found' });
    return;
  }

  const body = request.body;
  if (!isRecord(body)) {
    response.status(400).json({ error: 'No changes supplied' });
    return;
  }

  const updates: string[] = [];
  const values: Array<string | number | null> = [];
  if (typeof body.amount !== 'undefined' && (typeof body.amount !== 'number' || !Number.isFinite(body.amount) || body.amount < 0)) {
    response.status(400).json({ error: 'Subscription amount must be a non-negative number' });
    return;
  }

  if (typeof body.name === 'string') {
    updates.push('name = ?');
    values.push(body.name.trim());
  }
  if (typeof body.category === 'string') {
    updates.push('category = ?');
    values.push(body.category.trim());
  }
  if (typeof body.description === 'string') {
    updates.push('description = ?');
    values.push(body.description.trim() || null);
  }
  if (typeof body.phone === 'string') {
    updates.push('phone = ?');
    values.push(body.phone.trim() || null);
  }
  if (typeof body.whatsapp === 'string') {
    updates.push('whatsapp = ?');
    values.push(body.whatsapp.trim() || null);
  }
  if (typeof body.email === 'string') {
    updates.push('email = ?');
    values.push(body.email.trim().toLowerCase() || null);
  }
  if (typeof body.address === 'string') {
    updates.push('address = ?');
    values.push(body.address.trim() || null);
  }
  if (typeof body.slug === 'string') {
    const slug = normalizeSlug(body.slug);
    if (slug.length >= 2) {
      updates.push('slug = ?');
      values.push(slug);
    }
  }
  if (typeof body.status === 'string') {
    updates.push('status = ?');
    values.push(parseBusinessStatus(body.status));
  }
  if (typeof body.instagram_url === 'string') {
    updates.push('instagram_url = ?');
    values.push(body.instagram_url.trim() || null);
  }
  if (typeof body.facebook_url === 'string') {
    updates.push('facebook_url = ?');
    values.push(body.facebook_url.trim() || null);
  }
  if (typeof body.google_maps_url === 'string') {
    updates.push('google_maps_url = ?');
    values.push(body.google_maps_url.trim() || null);
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    if (updates.length > 0) {
      await connection.execute(
        `UPDATE businesses SET ${updates.join(', ')} WHERE id = ?`,
        [...values, id]
      );
    }

    const subscriptionUpdates: string[] = [];
    const subscriptionValues: Array<string | number> = [];
    if (typeof body.plan === 'string' && body.plan.trim()) {
      subscriptionUpdates.push('plan = ?');
      subscriptionValues.push(body.plan.trim());
    }
    if (typeof body.amount === 'number') {
      subscriptionUpdates.push('amount = ?');
      subscriptionValues.push(body.amount);
    }
    if (typeof body.start_date === 'string' && typeof body.expiry_date === 'string' && body.expiry_date < body.start_date) {
      await connection.rollback();
      response.status(400).json({ error: 'Expiry date must be on or after the subscription start date' });
      return;
    }
    for (const field of ['start_date', 'expiry_date'] as const) {
      const date = body[field];
      if (typeof date === 'string') {
        if (!isValidDate(date)) {
          await connection.rollback();
          response.status(400).json({ error: `Invalid ${field.replace('_', ' ')}` });
          return;
        }
        subscriptionUpdates.push(`${field} = ?`);
        subscriptionValues.push(date);
      }
    }
    if (body.subscription_status === 'ACTIVE' || body.subscription_status === 'EXPIRED') {
      subscriptionUpdates.push('status = ?');
      subscriptionValues.push(body.subscription_status);
    }
    if (updates.length === 0 && subscriptionUpdates.length === 0 && !['city', 'pincode', 'youtube_url', 'google_business_url'].some((field) => typeof body[field] === 'string')) {
      await connection.rollback();
      response.status(400).json({ error: 'No valid fields to update' });
      return;
    }
    if (subscriptionUpdates.length > 0) {
      await connection.execute(
        `UPDATE subscriptions SET ${subscriptionUpdates.join(', ')} WHERE business_id = ?`,
        [...subscriptionValues, id]
      );
    }

    const settingsToSave: Array<[string, string | null]> = [];
    if (typeof body.status === 'string') {
      settingsToSave.push(['website_visibility', parseBusinessStatus(body.status) === 'ACTIVE' ? 'public' : 'draft']);
    }
    for (const field of ['city', 'pincode', 'youtube_url', 'google_business_url'] as const) {
      if (typeof body[field] === 'string') settingsToSave.push([field, body[field].trim() || null]);
    }
    for (const [key, value] of settingsToSave) {
      await connection.execute(
        'INSERT INTO business_settings (business_id, setting_key, setting_value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
        [id, key, value]
      );
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  response.json({ success: true });
});

export default router;
