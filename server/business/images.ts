import { isValidOptionalImageUrl } from '../seo/shared.js';

export const isValidBusinessImageUrl = (value: string): boolean => {
  if (!value) return true;
  if (isValidOptionalImageUrl(value)) return true;
  if (!value.startsWith('/') || value.startsWith('//') || /[\u0000-\u001f\u007f\\]/.test(value)) return false;

  const rawPath = value.split(/[?#]/, 1)[0];
  if (!/\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(rawPath)) return false;
  try {
    for (const segment of rawPath.split('/')) {
      let decoded = segment;
      for (let attempt = 0; attempt < 8; attempt += 1) {
        const next = decodeURIComponent(decoded);
        if (next === decoded) break;
        decoded = next;
      }
      if (/%[0-9a-f]{2}/i.test(decoded) || decoded === '.' || decoded === '..' || /[/\\]/.test(decoded)) return false;
    }
    return new URL(value, 'https://tenant.invalid').origin === 'https://tenant.invalid';
  } catch {
    return false;
  }
};

export const resolveBusinessImageUrl = (value: string | null | undefined): string => {
  const image = value?.trim() ?? '';
  if (!image || !isValidBusinessImageUrl(image)) return '';
  if (/^https?:\/\//i.test(image)) {
    try { return new URL(image).href; } catch { return ''; }
  }
  return image.startsWith('/') ? image : `/${image}`;
};