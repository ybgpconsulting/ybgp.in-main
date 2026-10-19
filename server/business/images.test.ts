import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isValidBusinessImageUrl, resolveBusinessImageUrl } from './images.js';

test('business images allow safe public paths and HTTP(S) URLs', () => {
  for (const value of [
    'https://cdn.example.test/catalog/item.jpg',
    'http://cdn.example.test/gallery/item.webp',
    '/uploads/businesses/example/share.jpg',
    '/demo-sites/bakery/gallery/photo.webp',
  ]) assert.equal(isValidBusinessImageUrl(value), true, value);
  assert.equal(resolveBusinessImageUrl('uploads/businesses/example/share.jpg'), '/uploads/businesses/example/share.jpg');
  assert.equal(resolveBusinessImageUrl('/demo-sites/bakery/gallery/photo.webp'), '/demo-sites/bakery/gallery/photo.webp');
});

test('business images reject unsafe URL forms and local path traversal', () => {
  for (const value of [
    'javascript:alert(1)',
    'https://user:pass@example.test/image.jpg',
    'https://',
    '//cdn.example.test/image.jpg',
    '/uploads/%2e%2e/private.jpg',
    '/assets/%252e%252e/private.jpg',
    '/assets/image\\photo.jpg',
    '/assets/not-an-image.txt',
  ]) assert.equal(isValidBusinessImageUrl(value), false, value);
  assert.equal(resolveBusinessImageUrl('javascript:alert(1)'), '');
});