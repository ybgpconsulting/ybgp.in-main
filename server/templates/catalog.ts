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

export const inferTemplateSlugFromCategory = (categoryOrName?: string | null): string => {
  const s = (categoryOrName || '').toLowerCase();
  if (
    s.includes('bake') ||
    s.includes('food') ||
    s.includes('cafe') ||
    s.includes('café') ||
    s.includes('restraunt') ||
    s.includes('restaurant') ||
    s.includes('sweet') ||
    s.includes('cake') ||
    s.includes('coffee') ||
    s.includes('snack') ||
    s.includes('kitchen') ||
    s.includes('dine') ||
    s.includes('catering') ||
    s.includes('pizza') ||
    s.includes('burger') ||
    s.includes('bar')
  ) {
    return 'food-bakery';
  }
  if (
    s.includes('salon') ||
    s.includes('wellness') ||
    s.includes('beauty') ||
    s.includes('spa') ||
    s.includes('hair') ||
    s.includes('skin') ||
    s.includes('nail') ||
    s.includes('parlour') ||
    s.includes('parlor') ||
    s.includes('barber') ||
    s.includes('makeup') ||
    s.includes('massage') ||
    s.includes('laser') ||
    s.includes('yoga') ||
    s.includes('meditation')
  ) {
    return 'salon-studio';
  }
  if (
    s.includes('jewel') ||
    s.includes('jewelry') ||
    s.includes('gold') ||
    s.includes('silver') ||
    s.includes('diamond') ||
    s.includes('gem') ||
    s.includes('ornament') ||
    s.includes('luxury boutique') ||
    s.includes('designer fashion') ||
    s.includes('apparel') ||
    s.includes('bridal wear') ||
    s.includes('lehenga') ||
    s.includes('couture')
  ) {
    return 'jewellery-boutique';
  }
  return 'modern-business';
};

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
