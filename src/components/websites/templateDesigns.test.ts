import assert from 'node:assert/strict';
import { test } from 'node:test';
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
