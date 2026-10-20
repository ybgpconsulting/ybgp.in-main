export type WebsiteTemplateDesign =
  | 'modern'
  | 'food'
  | 'salon'
  | 'jewellery';

const templateDesigns: Record<string, WebsiteTemplateDesign> = {
  'modern-business': 'modern',
  'food-bakery': 'food',
  'salon-studio': 'salon',
  'jewellery-boutique': 'jewellery',
};

export const templateDemoSlugs: Record<string, string> = {
  'modern-business': 'demo-modern',
  'food-bakery': 'demo-bakery',
  'salon-studio': 'demo-salon',
  'jewellery-boutique': 'demo-jewellery',
};

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

export const getWebsiteTemplateDesign = (slug?: string | null, category?: string | null): WebsiteTemplateDesign => {
  const s = (slug || '').toLowerCase();
  if (templateDesigns[s]) return templateDesigns[s];
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
