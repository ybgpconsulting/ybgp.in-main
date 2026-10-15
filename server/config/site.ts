export const DEFAULT_SITE_URL = 'https://www.ybgp.in/';

export const normalizeSiteUrl = (value?: string): string => {
  let url: URL;
  try {
    url = new URL(value?.trim() || DEFAULT_SITE_URL);
  } catch {
    throw new Error('VITE_SITE_URL must be a valid absolute HTTP or HTTPS URL');
  }

  if (
    !['https:', 'http:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    (url.pathname !== '/' && url.pathname !== '') ||
    url.search ||
    url.hash
  ) {
    throw new Error('VITE_SITE_URL must be an HTTP or HTTPS origin without credentials, path, query, or fragment');
  }

  return `${url.origin}/`;
};
