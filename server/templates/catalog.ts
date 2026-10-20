import { pool } from '../db/pool.js';

export const WEBSITE_TEMPLATES = [
  {
    name: 'Modern Business',
    slug: 'modern-business',
    description: 'A bold split-screen hero, confident typography and clear contact actions for professional services and corporate firms.',
  },
  {
    name: 'Food & Bakery',
    slug: 'food-bakery',
    description: 'A full-bleed food-photo hero, warm menu styling and prominent ordering actions for cafes, bakeries, and dining destinations.',
  },
  {
    name: 'Salon & Wellness',
    slug: 'salon-studio',
    description: 'A centered editorial layout, soft blush palette and sculpted portrait frame for salons, spas, and wellness studios.',
  },
  {
    name: 'Jewellery Boutique',
    slug: 'jewellery-boutique',
    description: 'A cinematic, obsidian dark hero with gold accents and an editorial gallery for jewellery, luxury boutiques, and couture.',
  },
  {
    name: 'Clinic & Healthcare',
    slug: 'clinic-healthcare',
    description: 'A calm medical palette, doctor credential cards, clinical department highlights, and quick appointment booking for clinics and doctors.',
  },
  {
    name: 'Astrology & Spiritual',
    slug: 'astrology-horoscope',
    description: 'A celestial midnight-indigo atmosphere with planetary gold accents, Kundli guidance cards, and direct WhatsApp consultation for Vedic astrologers.',
  },
  {
    name: 'Tours & Travel',
    slug: 'tour-travel',
    description: 'A wanderlust panoramic hero with trip itinerary cards, transport tags, and quick WhatsApp travel quotes for holiday agencies and tour operators.',
  },
] as const;

export const inferTemplateSlugFromCategory = (categoryOrName?: string | null): string => {
  const s = (categoryOrName || '').toLowerCase();

  // Healthcare & Clinics
  if (
    s.includes('clinic') ||
    s.includes('doctor') ||
    s.includes('dental') ||
    s.includes('dentist') ||
    s.includes('ayurved') ||
    s.includes('homeopath') ||
    s.includes('physio') ||
    s.includes('medical') ||
    s.includes('health') ||
    s.includes('hospital') ||
    s.includes('pediatric') ||
    s.includes('ortho') ||
    s.includes('pharma') ||
    s.includes('pathology')
  ) {
    return 'clinic-healthcare';
  }

  // Astrology & Spiritual
  if (
    s.includes('astrolog') ||
    s.includes('horoscope') ||
    s.includes('jyotish') ||
    s.includes('kundli') ||
    s.includes('kundali') ||
    s.includes('vastu') ||
    s.includes('tarot') ||
    s.includes('numerolog') ||
    s.includes('spiritual') ||
    s.includes('pandit') ||
    s.includes('pooja') ||
    s.includes('puja')
  ) {
    return 'astrology-horoscope';
  }

  // Tours & Travel
  if (
    s.includes('tour') ||
    s.includes('travel') ||
    s.includes('trip') ||
    s.includes('holiday') ||
    s.includes('vacation') ||
    s.includes('taxi') ||
    s.includes('cab') ||
    s.includes('hotel') ||
    s.includes('resort') ||
    s.includes('homestay') ||
    s.includes('car rental') ||
    s.includes('safari')
  ) {
    return 'tour-travel';
  }

  // Food & Dining
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

  // Beauty & Personal Care
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

  // Jewellery & Luxury
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
