export type WebsiteTemplateDesign =
  | 'modern'
  | 'food'
  | 'salon'
  | 'jewellery'
  | 'clinic'
  | 'astrology'
  | 'travel';

const templateDesigns: Record<string, WebsiteTemplateDesign> = {
  'modern-business': 'modern',
  'food-bakery': 'food',
  'salon-studio': 'salon',
  'jewellery-boutique': 'jewellery',
  'clinic-healthcare': 'clinic',
  'astrology-horoscope': 'astrology',
  'tour-travel': 'travel',
};

export const templateDemoSlugs: Record<string, string> = {
  'modern-business': 'demo-modern',
  'food-bakery': 'demo-bakery',
  'salon-studio': 'demo-salon',
  'jewellery-boutique': 'demo-jewellery',
  'clinic-healthcare': 'demo-clinic',
  'astrology-horoscope': 'demo-astrology',
  'tour-travel': 'demo-travel',
};

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

export const getWebsiteTemplateDesign = (slug?: string | null, category?: string | null): WebsiteTemplateDesign => {
  const s = (slug || '').toLowerCase();
  if (templateDesigns[s]) return templateDesigns[s];
  if (s.includes('clinic') || s.includes('health') || s.includes('doctor')) return 'clinic';
  if (s.includes('astrolog') || s.includes('horoscope') || s.includes('jyotish')) return 'astrology';
  if (s.includes('travel') || s.includes('tour') || s.includes('trip')) return 'travel';
  if (s.includes('bake') || s.includes('food') || s.includes('cafe') || s.includes('restraunt') || s.includes('restaurant')) return 'food';
  if (s.includes('salon') || s.includes('wellness') || s.includes('beauty') || s.includes('spa')) return 'salon';
  if (s.includes('jewel')) return 'jewellery';

  // Only if no recognized slug was provided, fall back to inferring from category
  if (!s && category) {
    const inferred = inferTemplateSlugFromCategory(category);
    if (templateDesigns[inferred]) {
      return templateDesigns[inferred];
    }
  }

  return 'modern';
};

export const getWebsiteTemplateDemoSlug = (slug: string): string => {
  if (templateDemoSlugs[slug]) return templateDemoSlugs[slug];
  const design = getWebsiteTemplateDesign(slug);
  switch (design) {
    case 'clinic':
      return 'demo-clinic';
    case 'astrology':
      return 'demo-astrology';
    case 'travel':
      return 'demo-travel';
    case 'food':
      return 'demo-bakery';
    case 'salon':
      return 'demo-salon';
    case 'jewellery':
      return 'demo-jewellery';
    default:
      return 'demo-modern';
  }
};

export const getWebsiteTemplatePreviewImage = (slug: string): string => {
  const design = getWebsiteTemplateDesign(slug);
  switch (design) {
    case 'clinic':
      return '/demo-sites/modern/meeting.jpg';
    case 'astrology':
      return '/demo-sites/jewellery/collection-1.jpg';
    case 'travel':
      return '/demo-sites/modern/team.jpg';
    case 'food':
      return '/demo-sites/bakery/hero.jpg';
    case 'salon':
      return '/demo-sites/salon/hero.jpg';
    case 'jewellery':
      return '/demo-sites/jewellery/hero.jpg';
    default:
      return '/demo-sites/modern/workspace.jpg';
  }
};
