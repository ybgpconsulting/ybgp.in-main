import {
  isValidOptionalImageUrl,
  OG_DESCRIPTION_MAX_LENGTH,
  OG_TITLE_MAX_LENGTH,
  resolveTenantImageUrl,
  SEO_DESCRIPTION_MAX_LENGTH,
  SEO_TITLE_MAX_LENGTH,
} from './shared.js';

export const SEO_SETTING_KEYS = [
  'seo_title',
  'seo_description',
  'og_title',
  'og_description',
  'og_image',
] as const;

export type SeoSettingKey = typeof SEO_SETTING_KEYS[number];

export interface TenantSeoInput {
  name: string;
  category: string;
  description: string | null;
  slug: string;
  settings: Partial<Record<SeoSettingKey, string | null | undefined>>;
}

export interface TenantSeoMetadata {
  name: string;
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  canonicalUrl: string;
  imageUrl: string;
}

export { isValidOptionalImageUrl };

export const validateSeoSettings = (
  body: Record<string, unknown>
): { values: Partial<Record<SeoSettingKey, string | null>>; error?: string } => {
  const values: Partial<Record<SeoSettingKey, string | null>> = {};
  for (const key of SEO_SETTING_KEYS) {
    if (!Object.hasOwn(body, key)) continue;
    const value = body[key];
    if (typeof value !== 'string') {
      return { values, error: `${key.replaceAll('_', ' ')} must be a string` };
    }
    if ((key === 'seo_title' && value.length > SEO_TITLE_MAX_LENGTH) ||
      (key === 'og_title' && value.length > OG_TITLE_MAX_LENGTH)) {
      const label = key === 'seo_title' ? 'Meta title' : 'Open Graph title';
      const limit = key === 'seo_title' ? SEO_TITLE_MAX_LENGTH : OG_TITLE_MAX_LENGTH;
      return { values, error: `${label} must be at most ${limit} characters` };
    }
    if ((key === 'seo_description' && value.length > SEO_DESCRIPTION_MAX_LENGTH) ||
      (key === 'og_description' && value.length > OG_DESCRIPTION_MAX_LENGTH)) {
      const label = key === 'seo_description' ? 'Meta description' : 'Open Graph description';
      const limit = key === 'seo_description' ? SEO_DESCRIPTION_MAX_LENGTH : OG_DESCRIPTION_MAX_LENGTH;
      return { values, error: `${label} must be at most ${limit} characters` };
    }
    if (key === 'og_image' && !isValidOptionalImageUrl(value.trim())) {
      return { values, error: 'Open Graph image must be a valid http or https URL or image path under /uploads' };
    }
    values[key] = value.trim() || null;
  }
  return { values };
};

export const resolveTenantSeo = (
  tenant: TenantSeoInput,
  siteUrl: string
): TenantSeoMetadata => {
  const title = tenant.settings.seo_title?.trim() || `${tenant.name} | ${tenant.category}`;
  const description = tenant.settings.seo_description?.trim() ||
    tenant.description?.trim() ||
    `Visit ${tenant.name} for ${tenant.category.toLowerCase()} offerings and contact information.`;
  const canonicalUrl = new URL(`websites/${tenant.slug}/`, siteUrl).href;
  const fallbackImage = new URL('og-image.svg', siteUrl).href;
  const imageUrl = resolveTenantImageUrl(tenant.settings.og_image ?? '', canonicalUrl, fallbackImage);

  return {
    name: tenant.name,
    title,
    description,
    ogTitle: tenant.settings.og_title?.trim() || title,
    ogDescription: tenant.settings.og_description?.trim() || description,
    canonicalUrl,
    imageUrl,
  };
};
