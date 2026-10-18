import { Router } from 'express';
import type { RowDataPacket } from 'mysql2';
import { pool } from '../db/pool.js';
import { hashPassword } from '../auth/password.js';
import { requireRoleAuth } from '../auth/middleware.js';
import { isValidSubscriptionPeriod } from './dates.js';

const router = Router();

router.use(requireRoleAuth('SUPER_ADMIN'));

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
  google_maps_url: string | null;
  city: string | null;
  pincode: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  youtube_url: string | null;
  linkedin_url: string | null;
  google_business_url: string | null;
  other_social_url: string | null;
  tiktok_url: string | null;
  x_url: string | null;
  pinterest_url: string | null;
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

const reservedSlugs = new Set([
  'admin',
  'dashboard',
  'demo-bakery',
  'demo-salon',
  'demo-jewellery',
]);

const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isValidOptionalHttpUrl = (value: string): boolean => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
};
const isValidOptionalPhone = (value: string): boolean => {
  if (!value) return true;
  const digits = value.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
};
const isPositiveInteger = (value: string): boolean => /^[1-9]\d{0,19}$/.test(value);
const addOneYear = (value: string): string => {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCFullYear(date.getUTCFullYear() + 1);
  return date.toISOString().slice(0, 10);
};

const findTemplate = async (value: string | number | undefined): Promise<{ id: string; name: string; slug: string } | null> => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const lookupBySlug = typeof value === 'string' && !/^[0-9]+$/.test(value);
  const [rows] = await pool.execute<TemplateRow[]>(
    lookupBySlug
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
      b.google_maps_url,
      (SELECT setting_value FROM business_settings WHERE business_id = b.id AND setting_key = 'city') AS city,
      (SELECT setting_value FROM business_settings WHERE business_id = b.id AND setting_key = 'pincode') AS pincode,
      b.instagram_url,
      b.facebook_url,
      (SELECT setting_value FROM business_settings WHERE business_id = b.id AND setting_key = 'youtube_url') AS youtube_url,
      (SELECT setting_value FROM business_settings WHERE business_id = b.id AND setting_key = 'linkedin_url') AS linkedin_url,
      (SELECT setting_value FROM business_settings WHERE business_id = b.id AND setting_key = 'google_business_url') AS google_business_url,
      (SELECT setting_value FROM business_settings WHERE business_id = b.id AND setting_key = 'other_social_url') AS other_social_url,
      (SELECT setting_value FROM business_settings WHERE business_id = b.id AND setting_key = 'tiktok_url') AS tiktok_url,
      (SELECT setting_value FROM business_settings WHERE business_id = b.id AND setting_key = 'x_url') AS x_url,
      (SELECT setting_value FROM business_settings WHERE business_id = b.id AND setting_key = 'pinterest_url') AS pinterest_url,
      b.status,
      b.template_id,
      b.created_at,
      b.updated_at,
      t.name AS template_name,
      s.plan,
      CASE WHEN s.status = 'EXPIRED' OR s.expiry_date < UTC_DATE()
        THEN 'EXPIRED' ELSE s.status END AS subscription_status,
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
      b.google_maps_url,
      (SELECT setting_value FROM business_settings WHERE business_id = b.id AND setting_key = 'city') AS city,
      (SELECT setting_value FROM business_settings WHERE business_id = b.id AND setting_key = 'pincode') AS pincode,
      b.instagram_url,
      b.facebook_url,
      (SELECT setting_value FROM business_settings WHERE business_id = b.id AND setting_key = 'youtube_url') AS youtube_url,
      (SELECT setting_value FROM business_settings WHERE business_id = b.id AND setting_key = 'linkedin_url') AS linkedin_url,
      (SELECT setting_value FROM business_settings WHERE business_id = b.id AND setting_key = 'google_business_url') AS google_business_url,
      (SELECT setting_value FROM business_settings WHERE business_id = b.id AND setting_key = 'other_social_url') AS other_social_url,
      (SELECT setting_value FROM business_settings WHERE business_id = b.id AND setting_key = 'tiktok_url') AS tiktok_url,
      (SELECT setting_value FROM business_settings WHERE business_id = b.id AND setting_key = 'x_url') AS x_url,
      (SELECT setting_value FROM business_settings WHERE business_id = b.id AND setting_key = 'pinterest_url') AS pinterest_url,
      b.status,
      b.template_id,
      b.created_at,
      b.updated_at,
      t.name AS template_name,
      s.plan,
      CASE WHEN s.status = 'EXPIRED' OR s.expiry_date < UTC_DATE()
        THEN 'EXPIRED' ELSE s.status END AS subscription_status,
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
  const linkedin = typeof body.linkedin_url === 'string' ? body.linkedin_url.trim() : '';
  const googleBusiness = typeof body.google_business_url === 'string' ? body.google_business_url.trim() : '';
  const otherSocial = typeof body.other_social_url === 'string' ? body.other_social_url.trim() : '';
  const tiktok = typeof body.tiktok_url === 'string' ? body.tiktok_url.trim() : '';
  const x = typeof body.x_url === 'string' ? body.x_url.trim() : '';
  const pinterest = typeof body.pinterest_url === 'string' ? body.pinterest_url.trim() : '';
  const googleMaps = typeof body.google_maps_url === 'string' ? body.google_maps_url.trim() : '';
  const youtube = typeof body.youtube_url === 'string' ? body.youtube_url.trim() : '';
  const city = typeof body.city === 'string' ? body.city.trim() : '';
  const pincode = typeof body.pincode === 'string' ? body.pincode.trim() : '';
  const ownerPhone = typeof body.owner_phone === 'string' ? body.owner_phone.trim() : '';
  const ownerName = typeof body.owner_name === 'string' ? body.owner_name.trim() : (typeof body.ownerName === 'string' ? body.ownerName.trim() : '');
  const ownerEmail = typeof body.owner_email === 'string' ? body.owner_email.trim().toLowerCase() : (typeof body.ownerEmail === 'string' ? body.ownerEmail.trim().toLowerCase() : '');
  const ownerPassword = typeof body.owner_password === 'string' ? body.owner_password : (typeof body.ownerPassword === 'string' ? body.ownerPassword : '');
  const rawSlug = typeof body.slug === 'string' ? body.slug : normalizeSlug(name);
  const slug = normalizeSlug(rawSlug);
  const plan = typeof body.plan === 'string' && body.plan.trim() ? body.plan.trim() : 'YBGP Websites';
  const businessStatus: 'ACTIVE' | 'INACTIVE' = body.published === false
    ? 'INACTIVE'
    : parseBusinessStatus(body.published === true ? 'ACTIVE' : body.status);
  const amount = Number(body.amount ?? 1999);
  const startDate = typeof body.start_date === 'string' ? body.start_date : new Date().toISOString().slice(0, 10);
  const expiryDate = typeof body.expiry_date === 'string' ? body.expiry_date : addOneYear(startDate);

  if (!name || !category || !ownerName || !ownerEmail || !isValidEmail(ownerEmail) || ownerPassword.length < 8) {
    response.status(400).json({ error: 'Business name, category, owner name, valid owner email, and an owner password of at least 8 characters are required' });
    return;
  }

  if (slug.length < 2) {
    response.status(400).json({ error: 'Slug must be at least 2 characters' });
    return;
  }
  if (reservedSlugs.has(slug)) {
    response.status(400).json({ error: `Slug "${slug}" is reserved. Please choose a different slug.` });
    return;
  }
  if (pincode && !/^\d{4,10}$/.test(pincode)) {
    response.status(400).json({ error: 'Pincode must contain 4 to 10 digits' });
    return;
  }
  if (!isValidOptionalPhone(phone) || !isValidOptionalPhone(whatsapp)) {
    response.status(400).json({ error: 'Phone and WhatsApp numbers must contain 7 to 15 digits' });
    return;
  }
  if (![googleMaps, instagram, facebook, youtube, linkedin, googleBusiness, otherSocial, tiktok, x, pinterest].every(isValidOptionalHttpUrl)) {
    response.status(400).json({ error: 'Location and social links must be valid http or https URLs' });
    return;
  }
  if (!Number.isFinite(amount) || amount < 0 || !isValidSubscriptionPeriod(startDate, expiryDate)) {
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
      [name, slug, category, description || null, phone || null, whatsapp || null, businessEmail || ownerEmail, address || null, instagram || null, facebook || null, googleMaps || null, template.id, businessStatus]
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
      linkedin_url: linkedin,
      other_social_url: otherSocial,
      tiktok_url: tiktok,
      x_url: x,
      pinterest_url: pinterest,
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
  for (const field of ['start_date', 'expiry_date'] as const) {
    if (body[field] !== undefined && typeof body[field] !== 'string') {
      response.status(400).json({ error: `Invalid ${field.replace('_', ' ')}` });
      return;
    }
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
  let requestedSlug: string | null = null;
  if (typeof body.slug === 'string') {
    const slug = normalizeSlug(body.slug);
    if (slug.length >= 2) {
      if (reservedSlugs.has(slug)) {
        response.status(400).json({ error: `Slug "${slug}" is reserved. Please choose a different slug.` });
        return;
      }
      requestedSlug = slug;
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

  const socialUrlFields = ['google_maps_url', 'instagram_url', 'facebook_url', 'youtube_url', 'linkedin_url', 'google_business_url', 'other_social_url', 'tiktok_url', 'x_url', 'pinterest_url'] as const;
  for (const field of socialUrlFields) {
    if (typeof body[field] === 'string' && !isValidOptionalHttpUrl(body[field].trim())) {
      response.status(400).json({ error: `${field.replaceAll('_', ' ')} must be a valid http or https URL` });
      return;
    }
  }
  if (typeof body.pincode === 'string' && body.pincode.trim() && !/^\d{4,10}$/.test(body.pincode.trim())) {
    response.status(400).json({ error: 'Pincode must contain 4 to 10 digits' });
    return;
  }
  for (const field of ['phone', 'whatsapp'] as const) {
    if (typeof body[field] === 'string' && !isValidOptionalPhone(body[field].trim())) {
      response.status(400).json({ error: `${field === 'phone' ? 'Phone' : 'WhatsApp'} number must contain 7 to 15 digits` });
      return;
    }
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const hasSubscriptionUpdate =
      typeof body.plan === 'string' && Boolean(body.plan.trim()) ||
      typeof body.amount === 'number' ||
      typeof body.start_date === 'string' ||
      typeof body.expiry_date === 'string' ||
      body.subscription_status === 'ACTIVE' ||
      body.subscription_status === 'EXPIRED';
    let currentSubscriptionDates: { start_date: string; expiry_date: string } | undefined;
    if (hasSubscriptionUpdate) {
      const [subscriptionRows] = await connection.execute<Array<RowDataPacket & {
        start_date: string;
        expiry_date: string;
      }>>(
        `SELECT DATE_FORMAT(start_date, '%Y-%m-%d') AS start_date,
          DATE_FORMAT(expiry_date, '%Y-%m-%d') AS expiry_date
         FROM subscriptions
         WHERE business_id = ?
         FOR UPDATE`,
        [id]
      );
      currentSubscriptionDates = subscriptionRows[0];
      if (!currentSubscriptionDates) {
        await connection.rollback();
        response.status(404).json({ error: 'Subscription not found' });
        return;
      }
      const startDate = typeof body.start_date === 'string'
        ? body.start_date
        : currentSubscriptionDates.start_date;
      const expiryDate = typeof body.expiry_date === 'string'
        ? body.expiry_date
        : currentSubscriptionDates.expiry_date;
      if (!isValidSubscriptionPeriod(startDate, expiryDate)) {
        await connection.rollback();
        response.status(400).json({ error: 'Subscription dates must be valid and expiry must be on or after the start date' });
        return;
      }
    }
    if (requestedSlug) {
      const [existing] = await connection.execute<RowDataPacket[]>(
        'SELECT id FROM businesses WHERE slug = ? AND id != ? LIMIT 1',
        [requestedSlug, id]
      );
      if (existing[0]) {
        await connection.rollback();
        response.status(409).json({ error: `Slug "${requestedSlug}" is already in use. Please choose a different slug.` });
        return;
      }
    }
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
    for (const field of ['start_date', 'expiry_date'] as const) {
      const date = body[field];
      if (typeof date === 'string') {
        subscriptionUpdates.push(`${field} = ?`);
        subscriptionValues.push(date);
      }
    }
    if (body.subscription_status === 'ACTIVE' || body.subscription_status === 'EXPIRED') {
      subscriptionUpdates.push('status = ?');
      subscriptionValues.push(body.subscription_status);
    }
    const businessSettingFields = ['address', 'phone', 'whatsapp', 'city', 'pincode', 'youtube_url', 'linkedin_url', 'google_business_url', 'other_social_url', 'tiktok_url', 'x_url', 'pinterest_url'];
    if (updates.length === 0 && subscriptionUpdates.length === 0 && !businessSettingFields.some((field) => typeof body[field] === 'string')) {
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
    if (typeof body.address === 'string') settingsToSave.push(['contact_address', body.address.trim() || null]);
    if (typeof body.phone === 'string') settingsToSave.push(['call_phone', body.phone.trim() || null]);
    if (typeof body.whatsapp === 'string') settingsToSave.push(['whatsapp', body.whatsapp.trim() || null]);
    for (const field of ['city', 'pincode', 'youtube_url', 'linkedin_url', 'google_business_url', 'other_social_url', 'tiktok_url', 'x_url', 'pinterest_url'] as const) {
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
