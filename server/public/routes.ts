import { Router } from 'express';
import type { RowDataPacket } from 'mysql2';
import { pool } from '../db/pool.js';
import { env } from '../config/env.js';
import { resolveTenantSeo } from '../seo/settings.js';
import { inferPrimaryAction, resolveBusinessContact, resolvePrimaryActionUrl } from '../business/cta.js';

const router = Router();

interface BusinessRow extends RowDataPacket {
  id: string;
  name: string;
  slug: string;
  category: string;
  logo: string | null;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  google_maps_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  business_hours: string | null;
  template_id: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
  template_name: string;
  template_slug: string;
  subscription_status: 'ACTIVE' | 'EXPIRED' | null;
  expiry_date: string | null;
  amount: string | null;
  plan: string | null;
}

interface CategoryRow extends RowDataPacket {
  id: string;
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
  image: string;
  title: string;
  sort_order: number;
  status: 'ACTIVE' | 'INACTIVE';
}

interface SettingRow extends RowDataPacket {
  setting_key: string;
  setting_value: string | null;
}

const PUBLIC_SETTING_KEYS = [
  'whatsapp',
  'call_phone',
  'contact_email',
  'contact_address',
  'city',
  'pincode',
  'cta_text',
  'cta_url',
  'cta_url',
  'youtube_url',
  'linkedin_url',
  'tiktok_url',
  'x_url',
  'pinterest_url',
  'google_business_url',
  'other_social_url',
  'working_hours',
  'primary_action',
] as const;

const isValidSlug = (value: string): boolean => /^[a-z0-9][a-z0-9-]{1,179}$/i.test(value);

const safeParseJson = (value: unknown) => {
  if (!value) return null;
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return null;
};

const normalizeBusiness = (row: BusinessRow) => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  category: row.category,
  description: row.description,
  logo: row.logo,
  phone: row.phone,
  whatsapp: row.whatsapp,
  email: row.email,
  address: row.address,
  google_maps_url: row.google_maps_url,
  instagram_url: row.instagram_url,
  facebook_url: row.facebook_url,
  business_hours: safeParseJson(row.business_hours),
  status: row.status,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

router.get('/websites/:slug', async (request, response) => {
  const slug = request.params.slug?.trim();
  if (!slug || !isValidSlug(slug)) {
    response.status(404).json({ error: 'Website not found' });
    return;
  }

  const [businessRows] = await pool.execute<BusinessRow[]>(
    `SELECT b.*,
      t.name AS template_name,
      t.slug AS template_slug,
      s.plan,
      s.amount,
      s.status AS subscription_status,
      s.expiry_date
     FROM businesses b
     INNER JOIN templates t ON t.id = b.template_id
     LEFT JOIN subscriptions s ON s.business_id = b.id
     WHERE b.slug = ? AND b.status = 'ACTIVE'
       AND s.status = 'ACTIVE' AND s.expiry_date >= UTC_DATE()
     LIMIT 1`,
    [slug]
  );

  const business = businessRows[0];
  if (!business) {
    response.status(404).json({ error: 'Website not found' });
    return;
  }

  const [categoryRows] = await pool.execute<CategoryRow[]>(
    `SELECT id, name, sort_order, status
     FROM categories
     WHERE business_id = ? AND status = 'ACTIVE'
     ORDER BY sort_order ASC, id ASC`,
    [business.id]
  );

  const [productRows] = await pool.execute<ProductRow[]>(
    `SELECT id, business_id, category_id, name, slug, description, price, image, status, sort_order
     FROM products
     WHERE business_id = ? AND status = 'ACTIVE'
     ORDER BY sort_order ASC, id ASC`,
    [business.id]
  );

  const [galleryRows] = await pool.execute<GalleryRow[]>(
    `SELECT id, image, title, sort_order, status
     FROM gallery
     WHERE business_id = ? AND status = 'ACTIVE'
     ORDER BY sort_order ASC, id ASC`,
    [business.id]
  );

  const [settingRows] = await pool.execute<SettingRow[]>(
    `SELECT setting_key, setting_value
     FROM business_settings
     WHERE business_id = ? AND setting_key IN (${PUBLIC_SETTING_KEYS.map(() => '?').join(', ')})`,
    [business.id, ...PUBLIC_SETTING_KEYS]
  );

  const settings = Object.fromEntries(
    settingRows.map((row) => [row.setting_key, row.setting_value])
  );

  const seo = resolveTenantSeo({
    name: business.name,
    category: business.category,
    description: business.description,
    slug: business.slug,
    settings: {
      seo_title: settings.seo_title,
      seo_description: settings.seo_description,
      og_title: settings.og_title,
      og_description: settings.og_description,
      og_image: settings.og_image,
    },
  }, env.siteUrl);
  const contact = resolveBusinessContact(business, settings);
  const primaryAction = inferPrimaryAction(settings, contact);
  const primaryActionUrl = resolvePrimaryActionUrl(primaryAction, contact, settings.cta_url ?? '');

  response.json({
    business: { ...normalizeBusiness(business), ...contact },
    template: {
      id: business.template_id,
      name: business.template_name,
      slug: business.template_slug,
    },
    settings,
    primaryAction: {
      type: primaryAction,
      text: settings.cta_text?.trim() || (primaryAction === 'whatsapp' ? 'WhatsApp' : primaryAction === 'call' ? 'Call' : primaryAction === 'email' ? 'Email' : 'Contact us'),
      url: primaryActionUrl,
    },
    categories: categoryRows.map((item) => ({
      id: item.id,
      name: item.name,
      sort_order: item.sort_order,
      status: item.status,
    })),
    products: productRows.map((item) => ({
      id: item.id,
      category_id: item.category_id,
      name: item.name,
      slug: item.slug,
      description: item.description,
      price: item.price,
      image: item.image,
      status: item.status,
      sort_order: item.sort_order,
    })),
    gallery: galleryRows.map((item) => ({
      id: item.id,
      image: item.image,
      title: item.title,
      sort_order: item.sort_order,
      status: item.status,
    })),
    seo: {
      title: seo.title,
      description: seo.description,
      canonicalUrl: seo.canonicalUrl,
      ogTitle: seo.ogTitle,
      ogDescription: seo.ogDescription,
      ogImage: seo.imageUrl,
    },
  });
});

export default router;
