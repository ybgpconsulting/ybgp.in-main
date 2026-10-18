import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getWebsiteTemplateDemoSlug, getWebsiteTemplateDesign } from './templateDesigns.js';
import { getDemoWebsite } from './demoWebsites.js';

test('each active business template uses a distinct storefront design', () => {
  const designs = [
    getWebsiteTemplateDesign('modern-business'),
    getWebsiteTemplateDesign('food-bakery'),
    getWebsiteTemplateDesign('salon-studio'),
    getWebsiteTemplateDesign('jewellery-boutique'),
  ];

  assert.deepEqual(new Set(designs), new Set(['modern', 'food', 'salon', 'jewellery']));
});

test('unknown template slugs safely fall back to the modern storefront', () => {
  assert.equal(getWebsiteTemplateDesign('future-template'), 'modern');
});

test('each active template preview uses a demo storefront with the matching template', () => {
  const templateSlugs = ['modern-business', 'food-bakery', 'salon-studio', 'jewellery-boutique'];

  for (const templateSlug of templateSlugs) {
    const demo = getDemoWebsite(getWebsiteTemplateDemoSlug(templateSlug));
    assert.ok(demo);
    assert.equal(demo.template.slug, templateSlug);
  }
});
