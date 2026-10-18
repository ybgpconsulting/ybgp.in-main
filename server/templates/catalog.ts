import { pool } from '../db/pool.js';

export const WEBSITE_TEMPLATES = [
  {
    name: 'Modern Business',
    slug: 'modern-business',
    description: 'A clean, flexible layout for local, professional and service businesses.',
  },
  {
    name: 'Food / Bakery',
    slug: 'food-bakery',
    description: 'A warm, product-led layout for bakeries, cafes and food businesses.',
  },
  {
    name: 'Salon & Wellness',
    slug: 'salon-studio',
    description: 'A calm, editorial layout for salons, spas and wellness studios.',
  },
  {
    name: 'Jewellery Boutique',
    slug: 'jewellery-boutique',
    description: 'A refined, dark editorial layout for jewellery and premium boutiques.',
  },
] as const;

export const ensureWebsiteTemplateCatalog = async (): Promise<void> => {
  const placeholders = WEBSITE_TEMPLATES.map(() => '(?, ?, ?, NULL, \'ACTIVE\')').join(', ');
  const values = WEBSITE_TEMPLATES.flatMap(({ name, slug, description }) => [name, slug, description]);

  await pool.execute(
    `INSERT INTO templates (name, slug, description, preview_image, status)
     VALUES ${placeholders}
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       description = VALUES(description),
       status = 'ACTIVE'`,
    values
  );
};
