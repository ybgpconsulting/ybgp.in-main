import { Router } from 'express';
import type { RowDataPacket } from 'mysql2';
import { pool } from '../db/pool.js';

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

const isValidSlug = (value: string): boolean => /^[a-z0-9][a-z0-9-]{1,79}$/i.test(value);

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
  business_hours: row.business_hours ? JSON.parse(row.business_hours) : null,
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
     WHERE business_id = ?`,
    [business.id]
  );

  const settings = Object.fromEntries(
    settingRows.map((row) => [row.setting_key, row.setting_value])
  );

  const seo = {
    title: settings.seo_title || `${business.name} | ${business.category}`,
    description: settings.seo_description || business.description || `Visit ${business.name} for ${business.category.toLowerCase()} offerings and contact information.`,
    canonicalUrl: `https://www.ybgp.in/websites/${business.slug}`,
    ogTitle: settings.og_title || business.name,
    ogDescription: settings.og_description || business.description || business.category,
    ogImage: settings.og_image || '',
  };

  response.json({
    business: normalizeBusiness(business),
    template: {
      id: business.template_id,
      name: business.template_name,
      slug: business.template_slug,
    },
    settings,
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
    seo,
    subscription: {
      plan: business.plan,
      amount: business.amount,
      status: business.subscription_status,
      expiry_date: business.expiry_date,
    },
  });
});

export default router;
