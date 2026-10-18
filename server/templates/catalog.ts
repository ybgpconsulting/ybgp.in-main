import { pool } from '../db/pool.js';

export const WEBSITE_TEMPLATES = [
  {
    name: 'Modern Business',
    slug: 'modern-business',
    description: 'A bold split-screen hero, confident typography and clear contact actions for professional businesses.',
  },
  {
    name: 'Food / Bakery',
    slug: 'food-bakery',
    description: 'A full-bleed food-photo hero, warm menu styling and prominent ordering actions for cafes and food businesses.',
  },
  {
    name: 'Salon & Wellness',
    slug: 'salon-studio',
    description: 'A centered editorial layout, soft blush palette and sculpted portrait frame for salons and wellness studios.',
  },
  {
    name: 'Jewellery Boutique',
    slug: 'jewellery-boutique',
    description: 'A cinematic, full-width dark hero with gold accents and an editorial gallery for jewellery and premium boutiques.',
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
