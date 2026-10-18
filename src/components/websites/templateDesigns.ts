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

export const getWebsiteTemplateDesign = (slug: string): WebsiteTemplateDesign =>
  templateDesigns[slug] ?? 'modern';
