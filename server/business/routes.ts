import { Router } from 'express';
import type { RowDataPacket } from 'mysql2';
import { pool } from '../db/pool.js';
import { requireRoleAuth } from '../auth/middleware.js';
import { SEO_SETTING_KEYS, validateSeoSettings } from '../seo/settings.js';
import { isPrimaryAction, resolveBusinessContact, resolvePrimaryActionUrl } from './cta.js';
import { isValidWorkingHoursValue } from './hours.js';
import { isValidBusinessImageUrl } from './images.js';

const router = Router();

router.use(requireRoleAuth('BUSINESS_OWNER'));

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
  instagram_url: string | null;
  facebook_url: string | null;
  google_maps_url: string | null;
  business_hours: string | null;
  template_id: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
  template_name: string | null;
  template_slug: string | null;
  plan: string | null;
  subscription_status: 'ACTIVE' | 'EXPIRED' | null;
  expiry_date: string | null;
}

interface CategoryRow extends RowDataPacket {
  id: string;
  business_id: string;
  name: string;
  sort_order: number;
  status: 'ACTIVE' | 'INACTIVE';
}

interface ProductRow extends RowDataPacket {
  id: string;
  business_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: string | null;
  image: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  sort_order: number;
}

interface GalleryRow extends RowDataPacket {
  id: string;
  business_id: string;
  image: string;
  title: string;
  sort_order: number;
  status: 'ACTIVE' | 'INACTIVE';
}

interface SettingRow extends RowDataPacket {
  setting_key: string;
  setting_value: string | null;
}

interface EnquiryRow extends RowDataPacket {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  message: string;
  status: 'NEW' | 'CONTACTED' | 'CLOSED';
  created_at: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const validBusinessId = (value: string | undefined): boolean => typeof value === 'string' && /^[1-9]\d{0,19}$/.test(value);
const validSortOrder = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 2_147_483_647;

const ownedRecordExists = async (
  table: 'products' | 'categories' | 'gallery' | 'enquiries',
  businessId: string,
  recordId: string
): Promise<boolean> => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id FROM ${table} WHERE business_id = ? AND id = ? LIMIT 1`,
    [businessId, recordId]
  );
  return Boolean(rows[0]);
};

const resolveOwnedBusinessId = async (userId: string): Promise<string | null> => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT business_id FROM business_users WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
    [userId]
  );

  return rows[0] ? String(rows[0].business_id) : null;
};

const getBusiness = async (businessId: string): Promise<BusinessRow | null> => {
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
      b.instagram_url,
      b.facebook_url,
      b.google_maps_url,
      b.business_hours,
      b.template_id,
      b.status,
      b.created_at,
      b.updated_at,
      t.name AS template_name,
      t.slug AS template_slug,
      s.plan,
      CASE WHEN s.status = 'EXPIRED' OR s.expiry_date < UTC_DATE()
        THEN 'EXPIRED' ELSE s.status END AS subscription_status,
      s.expiry_date
     FROM businesses b
     LEFT JOIN templates t ON t.id = b.template_id
     LEFT JOIN subscriptions s ON s.business_id = b.id
     WHERE b.id = ?
     LIMIT 1`,
    [businessId]
  );

  return rows[0] ?? null;
};

const getSettingsMap = async (businessId: string): Promise<Record<string, string>> => {
  const [rows] = await pool.execute<SettingRow[]>(
    'SELECT setting_key, setting_value FROM business_settings WHERE business_id = ?',
    [businessId]
  );

  return Object.fromEntries(rows.map((row) => [row.setting_key, row.setting_value ?? '']));
};

router.get('/me', async (request, response) => {
  const businessId = await resolveOwnedBusinessId(request.user!.id);
  if (!businessId) {
    response.status(404).json({ error: 'No business found for this owner' });
    return;
  }

  const business = await getBusiness(businessId);
  if (!business) {
    response.status(404).json({ error: 'Business not found' });
    return;
  }

  const settings = await getSettingsMap(businessId);
  response.json({
    business: { ...business, ...resolveBusinessContact(business, settings) },
    settings,
    publicUrl: `/websites/${business.slug}`,
  });
});

router.patch('/me', async (request, response) => {
  const businessId = await resolveOwnedBusinessId(request.user!.id);
  if (!businessId) {
    response.status(404).json({ error: 'No business found for this owner' });
    return;
  }

  const body = request.body;
  if (!isRecord(body)) {
    response.status(400).json({ error: 'Business payload is required' });
    return;
  }

  const businessFields = [
    'name',
    'category',
    'description',
    'phone',
    'whatsapp',
    'email',
    'address',
    'instagram_url',
    'facebook_url',
    'google_maps_url',
    'business_hours',
  ] as const;
  const settingFields = [
    'city',
    'pincode',
    'youtube_url',
    'linkedin_url',
    'google_business_url',
    'other_social_url',
    'tiktok_url',
    'x_url',
    'pinterest_url',
    'hero_title',
    'hero_eyebrow',
    'about_title',
    'about_eyebrow',
    'about_description',
    'about_points',
    'about_image',
    'highlights_title',
    'highlights_eyebrow',
    'final_cta_title',
    'final_cta_description',
    'final_cta_button',
  ] as const;
  const stringFields = [...businessFields, ...settingFields];
  const values = new Map<string, string>();

  for (const field of stringFields) {
    if (body[field] === undefined) continue;
    if (typeof body[field] !== 'string') {
      response.status(400).json({ error: `${field.replaceAll('_', ' ')} must be text` });
      return;
    }
    values.set(field, body[field].trim());
  }

  const fieldLimits: Record<string, number> = {
    name: 180, category: 120, description: 3000, phone: 32, whatsapp: 32, email: 254,
    address: 500, business_hours: 500, city: 100, pincode: 10, google_maps_url: 2048,
    instagram_url: 2048, facebook_url: 2048, youtube_url: 2048,
    linkedin_url: 2048, google_business_url: 2048, other_social_url: 2048,
    tiktok_url: 2048, x_url: 2048, pinterest_url: 2048,
    hero_title: 300, hero_eyebrow: 150,
    about_title: 300, about_eyebrow: 150, about_description: 4000, about_points: 3000, about_image: 2048,
    highlights_title: 300, highlights_eyebrow: 150,
    final_cta_title: 300, final_cta_description: 1500, final_cta_button: 100,
  };
  for (const [field, value] of values) {
    const limit = fieldLimits[field];
    if (limit && value.length > limit) {
      response.status(400).json({ error: `${field.replaceAll('_', ' ')} must be ${limit} characters or fewer` });
      return;
    }
  }
  const email = values.get('email') ?? '';
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    response.status(400).json({ error: 'Business email must be a valid email address' });
    return;
  }

  if (values.has('name') && !values.get('name')) {
    response.status(400).json({ error: 'Business name cannot be empty' });
    return;
  }
  if (values.has('category') && !values.get('category')) {
    response.status(400).json({ error: 'Category cannot be empty' });
    return;
  }
  if (values.has('pincode') && values.get('pincode') && !/^\d{4,10}$/.test(values.get('pincode')!)) {
    response.status(400).json({ error: 'Pincode must contain 4 to 10 digits' });
    return;
  }

  for (const field of ['phone', 'whatsapp'] as const) {
    const value = values.get(field) ?? '';
    const digits = value.replace(/\D/g, '');
    if (value && (digits.length < 7 || digits.length > 15)) {
      response.status(400).json({ error: `${field === 'phone' ? 'Phone' : 'WhatsApp'} number must contain 7 to 15 digits` });
      return;
    }
  }

  for (const field of ['google_maps_url', 'instagram_url', 'facebook_url', 'youtube_url', 'linkedin_url', 'google_business_url', 'other_social_url', 'tiktok_url', 'x_url', 'pinterest_url'] as const) {
    const value = values.get(field) ?? '';
    if (!value) continue;
    try {
      const url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password) {
        throw new Error('invalid URL');
      }
    } catch {
      response.status(400).json({ error: `${field.replaceAll('_', ' ')} must be a valid http or https URL` });
      return;
    }
  }

  if (values.size === 0) {
    response.status(400).json({ error: 'No valid fields to update' });
    return;
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const columns: Record<typeof businessFields[number], string> = {
      name: 'name',
      category: 'category',
      description: 'description',
      phone: 'phone',
      whatsapp: 'whatsapp',
      email: 'email',
      address: 'address',
      instagram_url: 'instagram_url',
      facebook_url: 'facebook_url',
      google_maps_url: 'google_maps_url',
      business_hours: 'business_hours',
    };
    const businessUpdates = businessFields.filter((field) => values.has(field));
    if (businessUpdates.length > 0) {
      await connection.execute(
        `UPDATE businesses SET ${businessUpdates.map((field) => `${columns[field]} = ?`).join(', ')} WHERE id = ?`,
        [...businessUpdates.map((field) => {
          const value = values.get(field)!;
          return field === 'email' ? value.toLowerCase() || null : value || null;
        }), businessId]
      );
    }

    const templateInput = typeof body.template_id === 'string' || typeof body.template_id === 'number'
      ? String(body.template_id)
      : typeof body.template_slug === 'string'
        ? body.template_slug.trim()
        : null;

    if (templateInput) {
      const [templateRows] = await connection.execute<RowDataPacket[]>(
        'SELECT id FROM templates WHERE slug = ? OR id = ? LIMIT 1',
        [templateInput, templateInput]
      );
      if (templateRows[0]) {
        await connection.execute(
          'UPDATE businesses SET template_id = ? WHERE id = ?',
          [templateRows[0].id, businessId]
        );
      }
    }

    const settings: Array<[string, string | null]> = [
      ...(values.has('address') ? [['contact_address', values.get('address') || null] as [string, string | null]] : []),
      ...(values.has('phone') ? [['call_phone', values.get('phone') || null] as [string, string | null]] : []),
      ...(values.has('whatsapp') ? [['whatsapp', values.get('whatsapp') || null] as [string, string | null]] : []),
      ...(values.has('email') ? [['contact_email', values.get('email') || null] as [string, string | null]] : []),
      ...settingFields.filter((field) => values.has(field)).map((field) => [field, values.get(field) || null] as [string, string | null]),
    ];
    for (const [key, value] of settings) {
      await connection.execute(
        'INSERT INTO business_settings (business_id, setting_key, setting_value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
        [businessId, key, value]
      );
    }

    await connection.commit();
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error('Owner business profile transaction rollback failed', rollbackError);
    }
    console.error('Owner business profile save failed', error);
    response.status(500).json({ error: 'Unable to save your business profile. Please try again.' });
    return;
  } finally {
    connection.release();
  }

  response.json({ success: true });
});

router.get('/products', async (request, response) => {
  const businessId = await resolveOwnedBusinessId(request.user!.id);
  if (!businessId) {
    response.status(404).json({ error: 'No business found for this owner' });
    return;
  }

  const [rows] = await pool.execute<ProductRow[]>(
    `SELECT id, business_id, category_id, name, slug, description, price, image, status, sort_order
     FROM products
     WHERE business_id = ?
     ORDER BY sort_order ASC, id ASC`,
    [businessId]
  );

  response.json({ products: rows });
});

router.post('/products', async (request, response) => {
  const businessId = await resolveOwnedBusinessId(request.user!.id);
  if (!businessId) {
    response.status(404).json({ error: 'No business found for this owner' });
    return;
  }

  const body = request.body;
  if (!isRecord(body) || typeof body.name !== 'string' || !body.name.trim()) {
    response.status(400).json({ error: 'Product name is required' });
    return;
  }
  if (body.name.trim().length > 180 || (typeof body.description === 'string' && body.description.length > 3000)) {
    response.status(400).json({ error: 'Product name must be 180 characters or fewer and description 3,000 or fewer' });
    return;
  }

  const slug = (typeof body.slug === 'string' ? body.slug : body.name).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'product';
  const price = typeof body.price === 'number' || typeof body.price === 'string' ? Number(body.price) : null;
  if (price !== null && (!Number.isFinite(price) || price < 0)) {
    response.status(400).json({ error: 'Price must be a valid non-negative amount' });
    return;
  }
  const image = typeof body.image === 'string' ? body.image.trim() : '';
  if (image.length > 2048 || (image && !isValidBusinessImageUrl(image))) {
    response.status(400).json({ error: 'Product image must be a valid HTTP(S) URL or safe local image path' });
    return;
  }
  if (body.sort_order !== undefined && !validSortOrder(body.sort_order)) {
    response.status(400).json({ error: 'Display order must be a non-negative whole number' });
    return;
  }
  const categoryId: string | number | null = typeof body.category_id === 'string' || typeof body.category_id === 'number'
    ? body.category_id
    : null;
  if (categoryId !== null) {
    const normalizedCategoryId = String(categoryId);
    if (!validBusinessId(normalizedCategoryId)) {
      response.status(400).json({ error: 'Invalid category' });
      return;
    }
    const [categoryRows] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM categories WHERE id = ? AND business_id = ? LIMIT 1',
      [normalizedCategoryId, businessId]
    );
    if (!categoryRows[0]) {
      response.status(400).json({ error: 'Category does not belong to this business' });
      return;
    }
  }
  const values: Array<string | number | null> = [
    businessId,
    categoryId,
    body.name.trim(),
    slug,
    typeof body.description === 'string' ? body.description.trim() || null : null,
    price,
    image || null,
    body.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
    typeof body.sort_order === 'number' ? body.sort_order : 0,
  ];

  const [result] = await pool.execute(
    `INSERT INTO products (business_id, category_id, name, slug, description, price, image, status, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    values
  );

  response.status(201).json({ product: { id: (result as { insertId: number }).insertId, name: body.name.trim(), slug }, success: true });
});

router.patch('/products/:id', async (request, response) => {
  const businessId = await resolveOwnedBusinessId(request.user!.id);
  if (!businessId) {
    response.status(404).json({ error: 'No business found for this owner' });
    return;
  }

  const { id } = request.params;
  if (!validBusinessId(id)) {
    response.status(404).json({ error: 'Product not found' });
    return;
  }
  if (!await ownedRecordExists('products', businessId, id)) {
    response.status(404).json({ error: 'Product not found' });
    return;
  }

  const body = request.body;
  if (!isRecord(body)) {
    response.status(400).json({ error: 'Product payload is required' });
    return;
  }
  if (typeof body.name === 'string' && body.name.trim().length > 180) {
    response.status(400).json({ error: 'Product name must be 180 characters or fewer' });
    return;
  }
  if (typeof body.description === 'string' && body.description.length > 3000) {
    response.status(400).json({ error: 'Product description must be 3,000 characters or fewer' });
    return;
  }

  const updates: Array<string> = [];
  const values: Array<string | number | null> = [];

  if (typeof body.name === 'string' && body.name.trim()) {
    updates.push('name = ?'); values.push(body.name.trim());
  }
  if (typeof body.description === 'string') {
    updates.push('description = ?'); values.push(body.description.trim() || null);
  }
  if (typeof body.price !== 'undefined') {
    const price = typeof body.price === 'number' || typeof body.price === 'string' ? Number(body.price) : null;
    if (price !== null && (!Number.isFinite(price) || price < 0)) {
      response.status(400).json({ error: 'Price must be a valid non-negative amount' });
      return;
    }
    updates.push('price = ?'); values.push(Number.isFinite(price) ? price : null);
  }
  if (typeof body.status === 'string') {
    updates.push('status = ?'); values.push(body.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE');
  }
  if (typeof body.category_id !== 'undefined') {
    const categoryId = body.category_id === null || body.category_id === '' ? null : String(body.category_id);
    if (categoryId !== null && !validBusinessId(categoryId)) {
      response.status(400).json({ error: 'Invalid category' });
      return;
    }
    if (categoryId !== null) {
      const [categoryRows] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM categories WHERE id = ? AND business_id = ? LIMIT 1',
        [categoryId, businessId]
      );
      if (!categoryRows[0]) {
        response.status(400).json({ error: 'Category does not belong to this business' });
        return;
      }
    }
    updates.push('category_id = ?'); values.push(categoryId);
  }
  if (typeof body.slug === 'string' && body.slug.trim()) {
    const slug = body.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (!slug) {
      response.status(400).json({ error: 'Invalid product slug' });
      return;
    }
    updates.push('slug = ?'); values.push(slug);
  }
  if (body.sort_order !== undefined && !validSortOrder(body.sort_order)) {
    response.status(400).json({ error: 'Display order must be a non-negative whole number' });
    return;
  }
  if (typeof body.sort_order === 'number') {
    updates.push('sort_order = ?'); values.push(body.sort_order);
  }
  if (typeof body.image === 'string') {
    const image = body.image.trim();
    if (image.length > 2048 || (image && !isValidBusinessImageUrl(image))) {
      response.status(400).json({ error: 'Product image must be a valid HTTP(S) URL or safe local image path' });
      return;
    }
    updates.push('image = ?'); values.push(image || null);
  }

  if (updates.length === 0) {
    response.status(400).json({ error: 'No valid fields to update' });
    return;
  }

  values.push(businessId);
  values.push(id);
  await pool.execute(`UPDATE products SET ${updates.join(', ')} WHERE business_id = ? AND id = ?`, values);
  response.json({ success: true });
});

router.delete('/products/:id', async (request, response) => {
  const businessId = await resolveOwnedBusinessId(request.user!.id);
  if (!businessId) {
    response.status(404).json({ error: 'No business found for this owner' });
    return;
  }

  const { id } = request.params;
  if (!validBusinessId(id)) {
    response.status(404).json({ error: 'Product not found' });
    return;
  }
  if (!await ownedRecordExists('products', businessId, id)) {
    response.status(404).json({ error: 'Product not found' });
    return;
  }

  await pool.execute('DELETE FROM products WHERE business_id = ? AND id = ?', [businessId, id]);
  response.json({ success: true });
});

router.get('/categories', async (request, response) => {
  const businessId = await resolveOwnedBusinessId(request.user!.id);
  if (!businessId) {
    response.status(404).json({ error: 'No business found for this owner' });
    return;
  }

  const [rows] = await pool.execute<CategoryRow[]>(
    'SELECT id, business_id, name, sort_order, status FROM categories WHERE business_id = ? ORDER BY sort_order ASC, id ASC',
    [businessId]
  );

  response.json({ categories: rows });
});

router.post('/categories', async (request, response) => {
  const businessId = await resolveOwnedBusinessId(request.user!.id);
  if (!businessId) {
    response.status(404).json({ error: 'No business found for this owner' });
    return;
  }

  const body = request.body;
  if (!isRecord(body) || typeof body.name !== 'string' || !body.name.trim()) {
    response.status(400).json({ error: 'Category name is required' });
    return;
  }
  if (body.name.trim().length > 120) {
    response.status(400).json({ error: 'Category name must be 120 characters or fewer' });
    return;
  }
  if (body.sort_order !== undefined && !validSortOrder(body.sort_order)) {
    response.status(400).json({ error: 'Display order must be a non-negative whole number' });
    return;
  }

  const values: Array<string | number | null> = [
    businessId,
    body.name.trim(),
    typeof body.sort_order === 'number' ? body.sort_order : 0,
    body.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
  ];

  const [result] = await pool.execute(
    'INSERT INTO categories (business_id, name, sort_order, status) VALUES (?, ?, ?, ?)',
    values
  );

  response.status(201).json({ category: { id: (result as { insertId: number }).insertId, name: body.name.trim() }, success: true });
});

router.patch('/categories/:id', async (request, response) => {
  const businessId = await resolveOwnedBusinessId(request.user!.id);
  if (!businessId) {
    response.status(404).json({ error: 'No business found for this owner' });
    return;
  }

  const { id } = request.params;
  if (!validBusinessId(id)) {
    response.status(404).json({ error: 'Category not found' });
    return;
  }
  if (!await ownedRecordExists('categories', businessId, id)) {
    response.status(404).json({ error: 'Category not found' });
    return;
  }

  const body = request.body;
  if (!isRecord(body)) {
    response.status(400).json({ error: 'Category payload is required' });
    return;
  }
  if (typeof body.name === 'string' && body.name.trim().length > 120) {
    response.status(400).json({ error: 'Category name must be 120 characters or fewer' });
    return;
  }
  if (body.sort_order !== undefined && !validSortOrder(body.sort_order)) {
    response.status(400).json({ error: 'Display order must be a non-negative whole number' });
    return;
  }

  const updates: Array<string> = [];
  const values: Array<string | number | null> = [];

  if (typeof body.name === 'string' && body.name.trim()) {
    updates.push('name = ?'); values.push(body.name.trim());
  }
  if (typeof body.status === 'string') {
    updates.push('status = ?'); values.push(body.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE');
  }
  if (typeof body.sort_order === 'number') {
    updates.push('sort_order = ?'); values.push(body.sort_order);
  }

  if (updates.length === 0) {
    response.status(400).json({ error: 'No valid fields to update' });
    return;
  }

  values.push(businessId); values.push(id);
  await pool.execute(`UPDATE categories SET ${updates.join(', ')} WHERE business_id = ? AND id = ?`, values);
  response.json({ success: true });
});

router.delete('/categories/:id', async (request, response) => {
  const businessId = await resolveOwnedBusinessId(request.user!.id);
  if (!businessId) {
    response.status(404).json({ error: 'No business found for this owner' });
    return;
  }

  const { id } = request.params;
  if (!validBusinessId(id)) {
    response.status(404).json({ error: 'Category not found' });
    return;
  }
  if (!await ownedRecordExists('categories', businessId, id)) {
    response.status(404).json({ error: 'Category not found' });
    return;
  }

  const [productRows] = await pool.execute<RowDataPacket[]>(
    'SELECT id FROM products WHERE business_id = ? AND category_id = ? LIMIT 1',
    [businessId, id]
  );
  if (productRows[0]) {
    response.status(409).json({ error: 'Move or remove products in this category before deleting it' });
    return;
  }

  await pool.execute('DELETE FROM categories WHERE business_id = ? AND id = ?', [businessId, id]);
  response.json({ success: true });
});

router.get('/gallery', async (request, response) => {
  const businessId = await resolveOwnedBusinessId(request.user!.id);
  if (!businessId) {
    response.status(404).json({ error: 'No business found for this owner' });
    return;
  }

  const [rows] = await pool.execute<GalleryRow[]>(
    'SELECT id, business_id, image, title, sort_order, status FROM gallery WHERE business_id = ? ORDER BY sort_order ASC, id ASC',
    [businessId]
  );

  response.json({ gallery: rows });
});

router.post('/gallery', async (request, response) => {
  const businessId = await resolveOwnedBusinessId(request.user!.id);
  if (!businessId) {
    response.status(404).json({ error: 'No business found for this owner' });
    return;
  }

  const body = request.body;
  if (!isRecord(body) || typeof body.image !== 'string' || !body.image.trim() || typeof body.title !== 'string' || !body.title.trim()) {
    response.status(400).json({ error: 'Image URL and title are required' });
    return;
  }
  if (body.title.trim().length > 180 || body.image.trim().length > 2048 || !isValidBusinessImageUrl(body.image.trim())) {
    response.status(400).json({ error: 'Use a valid HTTP(S) image URL or safe local path and keep image text to 180 characters or fewer' });
    return;
  }
  if (body.sort_order !== undefined && !validSortOrder(body.sort_order)) {
    response.status(400).json({ error: 'Display order must be a non-negative whole number' });
    return;
  }

  const values: Array<string | number | null> = [
    businessId,
    body.image.trim(),
    body.title.trim(),
    typeof body.sort_order === 'number' ? body.sort_order : 0,
    body.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
  ];

  const [result] = await pool.execute(
    'INSERT INTO gallery (business_id, image, title, sort_order, status) VALUES (?, ?, ?, ?, ?)',
    values
  );

  response.status(201).json({ gallery: { id: (result as { insertId: number }).insertId, image: body.image.trim(), title: body.title.trim() }, success: true });
});

router.patch('/gallery/:id', async (request, response) => {
  const businessId = await resolveOwnedBusinessId(request.user!.id);
  if (!businessId) {
    response.status(404).json({ error: 'No business found for this owner' });
    return;
  }

  const { id } = request.params;
  if (!validBusinessId(id)) {
    response.status(404).json({ error: 'Gallery item not found' });
    return;
  }
  if (!await ownedRecordExists('gallery', businessId, id)) {
    response.status(404).json({ error: 'Gallery item not found' });
    return;
  }

  const body = request.body;
  if (!isRecord(body)) {
    response.status(400).json({ error: 'Gallery payload is required' });
    return;
  }
  if (typeof body.title === 'string' && body.title.trim().length > 180) {
    response.status(400).json({ error: 'Image title must be 180 characters or fewer' });
    return;
  }
  if (typeof body.image === 'string' && (!body.image.trim() || body.image.trim().length > 2048 || !isValidBusinessImageUrl(body.image.trim()))) {
    response.status(400).json({ error: 'Use a valid HTTP(S) image URL or safe local path' });
    return;
  }
  if (body.sort_order !== undefined && !validSortOrder(body.sort_order)) {
    response.status(400).json({ error: 'Display order must be a non-negative whole number' });
    return;
  }

  const updates: Array<string> = [];
  const values: Array<string | number | null> = [];

  if (typeof body.title === 'string' && body.title.trim()) {
    updates.push('title = ?'); values.push(body.title.trim());
  }
  if (typeof body.image === 'string') {
    updates.push('image = ?'); values.push(body.image.trim() || null);
  }
  if (typeof body.status === 'string') {
    updates.push('status = ?'); values.push(body.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE');
  }
  if (typeof body.sort_order === 'number') {
    updates.push('sort_order = ?'); values.push(body.sort_order);
  }

  if (updates.length === 0) {
    response.status(400).json({ error: 'No valid fields to update' });
    return;
  }

  values.push(businessId); values.push(id);
  await pool.execute(`UPDATE gallery SET ${updates.join(', ')} WHERE business_id = ? AND id = ?`, values);
  response.json({ success: true });
});

router.delete('/gallery/:id', async (request, response) => {
  const businessId = await resolveOwnedBusinessId(request.user!.id);
  if (!businessId) {
    response.status(404).json({ error: 'No business found for this owner' });
    return;
  }

  const { id } = request.params;
  if (!validBusinessId(id)) {
    response.status(404).json({ error: 'Gallery item not found' });
    return;
  }
  if (!await ownedRecordExists('gallery', businessId, id)) {
    response.status(404).json({ error: 'Gallery item not found' });
    return;
  }

  await pool.execute('DELETE FROM gallery WHERE business_id = ? AND id = ?', [businessId, id]);
  response.json({ success: true });
});

router.get('/enquiries', async (request, response) => {
  const businessId = await resolveOwnedBusinessId(request.user!.id);
  if (!businessId) {
    response.status(404).json({ error: 'No business found for this owner' });
    return;
  }

  const [rows] = await pool.execute<EnquiryRow[]>(
    `SELECT id, business_id, name, phone, message, status, created_at
     FROM enquiries
     WHERE business_id = ?
     ORDER BY created_at DESC`,
    [businessId]
  );

  response.json({ enquiries: rows });
});

router.patch('/enquiries/:id', async (request, response) => {
  const businessId = await resolveOwnedBusinessId(request.user!.id);
  if (!businessId) {
    response.status(404).json({ error: 'No business found for this owner' });
    return;
  }

  const { id } = request.params;
  if (!validBusinessId(id)) {
    response.status(404).json({ error: 'Enquiry not found' });
    return;
  }
  if (!await ownedRecordExists('enquiries', businessId, id)) {
    response.status(404).json({ error: 'Enquiry not found' });
    return;
  }

  const body = request.body;
  if (!isRecord(body) || typeof body.status !== 'string') {
    response.status(400).json({ error: 'Status is required' });
    return;
  }

  const status = body.status === 'CONTACTED' ? 'CONTACTED' : body.status === 'CLOSED' ? 'CLOSED' : 'NEW';
  await pool.execute('UPDATE enquiries SET status = ? WHERE business_id = ? AND id = ?', [status, businessId, id]);
  response.json({ success: true, status });
});

router.get('/settings', async (request, response) => {
  const businessId = await resolveOwnedBusinessId(request.user!.id);
  if (!businessId) {
    response.status(404).json({ error: 'No business found for this owner' });
    return;
  }

  response.json({ settings: await getSettingsMap(businessId) });
});

router.patch('/settings', async (request, response) => {
  const businessId = await resolveOwnedBusinessId(request.user!.id);
  if (!businessId) {
    response.status(404).json({ error: 'No business found for this owner' });
    return;
  }

  const body = request.body;
  if (!isRecord(body)) {
    response.status(400).json({ error: 'Settings payload is required' });
    return;
  }

  const seoSettings = validateSeoSettings(body);
  if (seoSettings.error) {
    response.status(400).json({ error: seoSettings.error });
    return;
  }
  if (body.primary_action !== undefined && !isPrimaryAction(body.primary_action)) {
    response.status(400).json({ error: 'Primary action must be WhatsApp, call, email, or custom' });
    return;
  }
  if (body.cta_text !== undefined && (typeof body.cta_text !== 'string' || body.cta_text.length > 60)) {
    response.status(400).json({ error: 'Button text must be 60 characters or fewer' });
    return;
  }
  if (typeof body.cta_url === 'string' && body.cta_url.length > 2048) {
    response.status(400).json({ error: 'Custom link must be 2,048 characters or fewer' });
    return;
  }
  if (body.working_hours !== undefined && (typeof body.working_hours !== 'string' || !isValidWorkingHoursValue(body.working_hours))) {
    response.status(400).json({ error: 'Working hours must be a valid weekly schedule or legacy text up to 500 characters' });
    return;
  }
  if (body.primary_action !== undefined && !isPrimaryAction(body.primary_action)) {
    response.status(400).json({ error: 'Primary action must be WhatsApp, call, email, or custom' });
    return;
  }
  if (body.cta_text !== undefined && (typeof body.cta_text !== 'string' || body.cta_text.length > 60)) {
    response.status(400).json({ error: 'Button text must be 60 characters or fewer' });
    return;
  }
  if (body.working_hours !== undefined && (typeof body.working_hours !== 'string' || !isValidWorkingHoursValue(body.working_hours))) {
    response.status(400).json({ error: 'Working hours must be a valid weekly schedule or legacy text up to 500 characters' });
    return;
  }
  if (body.cta_url !== undefined && body.cta_url !== '' &&
    (typeof body.cta_url !== 'string' || !resolvePrimaryActionUrl('custom', {}, body.cta_url))) {
    response.status(400).json({ error: 'Custom link must be a valid HTTP(S), phone, email, or safe site-relative URL' });
    return;
  }
  if (body.primary_action === 'custom' &&
    (typeof body.cta_url !== 'string' || !resolvePrimaryActionUrl('custom', {}, body.cta_url))) {
    response.status(400).json({ error: 'Custom action requires a valid HTTP(S), phone, email, or safe site-relative URL' });
    return;
  }
  const seoKeys = new Set<string>(SEO_SETTING_KEYS);
  const entries: Array<[string, string | null]> = Object.entries(body)
    .filter(([key, value]) => key !== 'business_id' && !seoKeys.has(key) && value !== undefined)
    .map(([key, value]) => [key, typeof value === 'string' ? value : JSON.stringify(value)]);
  entries.push(...Object.entries(seoSettings.values) as Array<[string, string | null]>);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    for (const [key, value] of entries) {
      await connection.execute(
        'INSERT INTO business_settings (business_id, setting_key, setting_value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
        [businessId, key, value]
      );
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  response.json({ success: true, settings: await getSettingsMap(businessId) });
});

export default router;
