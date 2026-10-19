import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isValidOptionalImageUrl, resolveTenantSeo, validateSeoSettings } from './settings.js';
import { OG_DESCRIPTION_MAX_LENGTH, OG_TITLE_MAX_LENGTH } from './shared.js';

test('SEO settings enforce the documented title and description limits', () => {
  assert.equal(validateSeoSettings({
    seo_title: 't'.repeat(180),
    seo_description: 'd'.repeat(500),
    og_title: 'o'.repeat(OG_TITLE_MAX_LENGTH),
    og_description: 'g'.repeat(OG_DESCRIPTION_MAX_LENGTH),
  }).error, undefined);
  assert.match(validateSeoSettings({ seo_title: 't'.repeat(181) }).error ?? '', /180/);
  assert.match(validateSeoSettings({ seo_description: 'd'.repeat(501) }).error ?? '', /500/);
  assert.match(validateSeoSettings({ og_title: 'o'.repeat(OG_TITLE_MAX_LENGTH + 1) }).error ?? '', new RegExp(`Open Graph title.*${OG_TITLE_MAX_LENGTH}`));
  assert.match(validateSeoSettings({ og_description: 'g'.repeat(OG_DESCRIPTION_MAX_LENGTH + 1) }).error ?? '', new RegExp(`Open Graph description.*${OG_DESCRIPTION_MAX_LENGTH}`));
});

test('SEO settings preserve omitted values and normalize explicit empty values to clears', () => {
  assert.deepEqual(validateSeoSettings({}).values, {});
  assert.deepEqual(validateSeoSettings({ og_title: 'Custom share title' }).values, {
    og_title: 'Custom share title',
  });
  assert.deepEqual(validateSeoSettings({
    seo_title: '',
    seo_description: '   ',
    og_title: '',
    og_description: ' ',
    og_image: '',
  }).values, {
    seo_title: null,
    seo_description: null,
    og_title: null,
    og_description: null,
    og_image: null,
  });
});

test('Open Graph image accepts http(s) URLs and supported upload paths only', () => {
  for (const valid of [
    'https://cdn.example.test/image.jpg',
    'http://cdn.example.test/image.jpg',
    'https://cdn.example.test/image',
    '/uploads/businesses/example/gallery/image.webp',
    'uploads/businesses/example/share.svg?version=2',
  ]) assert.equal(isValidOptionalImageUrl(valid), true, valid);

  for (const invalid of [
    'javascript:alert(1)',
    '//other.example/image.jpg',
    'https://',
    'http:example.test/image.jpg',
    'https://user:pass@example.test/image.jpg',
    'https://example.test/uploads/%2e%2e/private.jpg',
    'https://example.test/uploads/%252e%252e/private.jpg',
    'https://example.test/image\\share.jpg',
    '../image.jpg',
    '/uploads/%2e%2e/private.jpg',
    '/private/image.jpg',
    'private/image.jpg',
    'uploads/image.exe',
    'uploads/example%2fshare.jpg',
    'https:\\\\example.test\\image.jpg',
  ]) assert.equal(isValidOptionalImageUrl(invalid), false, invalid);
  assert.match(validateSeoSettings({ og_image: 'data:image/svg+xml,unsafe' }).error ?? '', /image/);
});

test('tenant SEO defaults derive from business details and use a tenant canonical URL', () => {
  const metadata = resolveTenantSeo({
    name: 'Aroma & Crumb',
    category: 'Bakery',
    description: 'Fresh cakes and pastries.',
    slug: 'aroma-and-crumb',
    settings: {},
  }, 'https://www.ybgp.in/');

  assert.equal(metadata.title, 'Aroma & Crumb | Bakery');
  assert.equal(metadata.description, 'Fresh cakes and pastries.');
  assert.equal(metadata.ogTitle, metadata.title);
  assert.equal(metadata.ogDescription, metadata.description);
  assert.equal(metadata.canonicalUrl, 'https://www.ybgp.in/websites/aroma-and-crumb/');
  assert.equal(metadata.imageUrl, 'https://www.ybgp.in/og-image.svg');
});

test('tenant SEO uses custom social metadata and resolves supported images at the public origin', () => {
  const metadata = resolveTenantSeo({
    name: 'Example Shop',
    category: 'Retail',
    description: null,
    slug: 'example-shop',
    settings: {
      seo_title: 'Search title',
      seo_description: 'Search description',
      og_title: 'Sharing title',
      og_description: 'Sharing description',
      og_image: 'uploads/share.jpg',
    },
  }, 'https://www.ybgp.in/');

  assert.equal(metadata.title, 'Search title');
  assert.equal(metadata.description, 'Search description');
  assert.equal(metadata.ogTitle, 'Sharing title');
  assert.equal(metadata.ogDescription, 'Sharing description');
  assert.equal(metadata.imageUrl, 'https://www.ybgp.in/uploads/share.jpg');
});

test('malformed legacy image values safely fall back and clearing restores the default image', () => {
  const invalid = resolveTenantSeo({
    name: 'Example Shop',
    category: 'Retail',
    description: null,
    slug: 'example-shop',
    settings: { og_image: 'https://' },
  }, 'https://www.ybgp.in/');
  const cleared = resolveTenantSeo({
    name: 'Example Shop',
    category: 'Retail',
    description: null,
    slug: 'example-shop',
    settings: { og_image: null },
  }, 'https://www.ybgp.in/');
  assert.equal(invalid.imageUrl, 'https://www.ybgp.in/og-image.svg');
  assert.equal(cleared.imageUrl, 'https://www.ybgp.in/og-image.svg');
});
