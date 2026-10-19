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

export const getWebsiteTemplateDesign = (slug: string): WebsiteTemplateDesign => {
  if (templateDesigns[slug]) return templateDesigns[slug];
  const s = (slug || '').toLowerCase();
  if (s.includes('bake') || s.includes('food') || s.includes('cafe')) return 'food';
  if (s.includes('salon') || s.includes('wellness') || s.includes('beauty')) return 'salon';
  if (s.includes('jewel')) return 'jewellery';
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
