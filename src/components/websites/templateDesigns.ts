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

export const getWebsiteTemplateDesign = (slug: string): WebsiteTemplateDesign =>
  templateDesigns[slug] ?? 'modern';

export const getWebsiteTemplateDemoSlug = (slug: string): string =>
  templateDemoSlugs[slug] ?? 'demo-modern';
