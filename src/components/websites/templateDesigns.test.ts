import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getWebsiteTemplateDemoSlug, templateDemoSlugs } from './templateDesigns.js';
import { getWebsiteTemplateDesign } from './templateDesigns.js';

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

test('every active template maps to its own showcase route', () => {
  const demoSlugs = Object.values(templateDemoSlugs);

  assert.deepEqual(demoSlugs, ['demo-modern', 'demo-bakery', 'demo-salon', 'demo-jewellery']);
  assert.equal(new Set(demoSlugs).size, demoSlugs.length);
  assert.equal(getWebsiteTemplateDemoSlug('future-template'), 'demo-modern');
});
