import assert from 'node:assert/strict';
import { test } from 'node:test';
import { inferPrimaryAction, resolveBusinessContact, resolvePrimaryActionUrl } from './cta.js';

test('primary actions derive contact links from the business profile', () => {
  const contact = { whatsapp: '+91 98765 43210', phone: '+91 12345 67890', email: 'owner@example.test' };
  assert.equal(resolvePrimaryActionUrl('whatsapp', contact), 'https://wa.me/919876543210');
  assert.equal(resolvePrimaryActionUrl('call', contact), 'tel:+911234567890');
  assert.equal(resolvePrimaryActionUrl('email', contact), 'mailto:owner@example.test');
  assert.equal(resolvePrimaryActionUrl('whatsapp', { whatsapp: null }), null);
  assert.equal(resolvePrimaryActionUrl('email', { email: 'not-an-email' }), null);
});

test('primary action inference preserves existing custom CTA settings', () => {
  assert.equal(inferPrimaryAction({ cta_url: 'https://booking.example.test' }, {}), 'custom');
  assert.equal(inferPrimaryAction({ cta_url: 'tel:+919876543210' }, { phone: '+911111111111' }), 'call');
  assert.equal(inferPrimaryAction({ cta_url: 'mailto:owner@example.test' }, { email: 'owner@example.test' }), 'email');
  assert.equal(inferPrimaryAction({ cta_url: 'https://wa.me/919876543210' }, { whatsapp: '+919876543210' }), 'whatsapp');
  assert.equal(inferPrimaryAction({}, { whatsapp: '+919876543210', phone: '+911234567890' }), 'whatsapp');
  assert.equal(inferPrimaryAction({}, { phone: '+911234567890', email: 'owner@example.test' }), 'call');
  assert.equal(inferPrimaryAction({}, { email: 'owner@example.test' }), 'email');
});

test('custom action URLs reject unsafe protocols, credentials and malformed values', () => {
  assert.equal(resolvePrimaryActionUrl('custom', {}, 'https://booking.example.test/path'), 'https://booking.example.test/path');
  assert.equal(resolvePrimaryActionUrl('custom', {}, '/booking'), '/booking');
  assert.equal(resolvePrimaryActionUrl('custom', {}, 'tel:+919876543210'), 'tel:+919876543210');
  assert.equal(resolvePrimaryActionUrl('custom', {}, 'mailto:owner@example.test'), 'mailto:owner@example.test');
  for (const value of ['javascript:alert(1)', '//booking.example.test', '/%2e%2e/private', 'https://user:pass@example.test', 'https://', 'https:\\\\example.test']) {
    assert.equal(resolvePrimaryActionUrl('custom', {}, value), null, value);
  }
});

test('legacy contact settings are fallbacks only when canonical profile fields are empty', () => {
  assert.deepEqual(resolveBusinessContact({ phone: null, whatsapp: '', email: 'profile@example.test' }, {
    call_phone: '+919999999999',
    whatsapp: '+918888888888',
    contact_email: 'legacy@example.test',
  }), {
    phone: '+919999999999',
    whatsapp: '+918888888888',
    email: 'profile@example.test',
  });
});