export const SEO_TITLE_MAX_LENGTH = 180;
export const SEO_DESCRIPTION_MAX_LENGTH = 500;
// Keep social-card copy concise while SEO fields retain their broader limits.
export const OG_TITLE_MAX_LENGTH = 120;
export const OG_DESCRIPTION_MAX_LENGTH = 300;

const hasSafePathSegments = (pathname: string): boolean => {
  try {
    return pathname.split('/').every((segment) => {
      let decoded = segment;
      for (let attempt = 0; attempt < 8; attempt += 1) {
        const next = decodeURIComponent(decoded);
        if (next === decoded) break;
        decoded = next;
      }
      if (/%[0-9a-f]{2}/i.test(decoded)) return false;
      return decoded !== '.' && decoded !== '..' && !decoded.includes('/') && !decoded.includes('\\');
    });
  } catch {
    return false;
  }
};

export const isValidOptionalImageUrl = (value: string): boolean => {
  if (!value) return true;
  if (/[\u0000-\u001f\u007f\\]/.test(value) || value.startsWith('//')) return false;

  if (/^[a-z][a-z\d+.-]*:/i.test(value)) {
    if (!/^https?:\/\//i.test(value)) return false;
    try {
      const url = new URL(value);
      const rawPath = /^https?:\/\/[^/?#]*(\/[^?#]*)?/i.exec(value)?.[1] ?? '/';
      return ['http:', 'https:'].includes(url.protocol) &&
        Boolean(url.hostname) &&
        !url.username &&
        !url.password &&
        hasSafePathSegments(rawPath);
    } catch {
      return false;
    }
  }

  const path = value.split(/[?#]/, 1)[0];
  const relativePath = path.startsWith('/') ? path.slice(1) : path;
  if (!relativePath.startsWith('uploads/')) return false;
  if (!/\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(relativePath)) return false;
  if (!hasSafePathSegments(relativePath)) return false;

  try {
    const url = new URL(value.startsWith('/') ? value : `/${value}`, 'https://tenant.invalid/');
    return url.origin === 'https://tenant.invalid';
  } catch {
    return false;
  }
};

export const resolveTenantImageUrl = (
  value: string,
  canonicalUrl: string,
  fallbackImage: string
): string => {
  const image = value.trim();
  if (!image || !isValidOptionalImageUrl(image)) return fallbackImage;
  try {
    const rootedImage = /^[a-z][a-z\d+.-]*:/i.test(image) || image.startsWith('/')
      ? image
      : `/${image}`;
    return new URL(rootedImage, canonicalUrl).href;
  } catch {
    return fallbackImage;
  }
};
