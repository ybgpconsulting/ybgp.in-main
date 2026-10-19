export interface TenantPageMetadata {
  name: string;
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  canonicalUrl: string;
  imageUrl: string;
}

const escapeHtml = (value: string): string => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

export const renderTenantHtml = (template: string, metadata: TenantPageMetadata): string => {
  let html = template
    .replace(/<title>.*?<\/title>/is, () => `<title>${escapeHtml(metadata.title)}</title>`)
    .replace(/<meta\s+name="description"[^>]*>/i, () => `<meta name="description" content="${escapeHtml(metadata.description)}" />`)
    .replace(/<meta\s+name="robots"[^>]*>/i, '<meta name="robots" content="index, follow" />')
    .replace(/<meta\s+name="author"[^>]*>/i, () => `<meta name="author" content="${escapeHtml(metadata.name)}" />`)
    .replace(/<meta\s+property="og:site_name"[^>]*>/i, () => `<meta property="og:site_name" content="${escapeHtml(metadata.name)}" />`)
    .replace(/<meta\s+property="og:title"[^>]*>/i, () => `<meta property="og:title" content="${escapeHtml(metadata.ogTitle)}" />`)
    .replace(/<meta\s+property="og:description"[^>]*>/i, () => `<meta property="og:description" content="${escapeHtml(metadata.ogDescription)}" />`)
    .replace(/<meta\s+property="og:url"[^>]*>/i, () => `<meta property="og:url" content="${escapeHtml(metadata.canonicalUrl)}" />`)
    .replace(/<meta\s+property="og:image"[^>]*>/i, () => `<meta property="og:image" content="${escapeHtml(metadata.imageUrl)}" />`)
    .replace(/<meta\s+property="og:image:alt"[^>]*>/i, () => `<meta property="og:image:alt" content="${escapeHtml(metadata.name)}" />`)
    .replace(/<meta\s+name="twitter:site"[^>]*>/i, '')
    .replace(/<meta\s+name="twitter:creator"[^>]*>/i, '')
    .replace(/<meta\s+name="twitter:title"[^>]*>/i, () => `<meta name="twitter:title" content="${escapeHtml(metadata.ogTitle)}" />`)
    .replace(/<meta\s+name="twitter:description"[^>]*>/i, () => `<meta name="twitter:description" content="${escapeHtml(metadata.ogDescription)}" />`)
    .replace(/<meta\s+name="twitter:url"[^>]*>/i, () => `<meta name="twitter:url" content="${escapeHtml(metadata.canonicalUrl)}" />`)
    .replace(/<meta\s+name="twitter:image"[^>]*>/i, () => `<meta name="twitter:image" content="${escapeHtml(metadata.imageUrl)}" />`)
    .replace(/<link\s+rel="canonical"[^>]*>/i, () => `<link rel="canonical" href="${escapeHtml(metadata.canonicalUrl)}" />`)
    .replace(/<link\s+rel="alternate"\s+href="[^"]*"\s+hreflang="en-in"\s*\/?>/i, '');

  const schema = JSON.stringify([
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${metadata.canonicalUrl}#webpage`,
      name: metadata.title,
      description: metadata.description,
      url: metadata.canonicalUrl,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'YBGP Websites', item: new URL('/websites/', metadata.canonicalUrl).href },
        { '@type': 'ListItem', position: 2, name: metadata.name, item: metadata.canonicalUrl },
      ],
    },
  ]).replace(/</g, () => '\\u003c');
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, '');
  html = html.replace('</head>', () => `<script type="application/ld+json">${schema}</script>\n  </head>`);
  const initialContent = `<main aria-label="${escapeHtml(metadata.name)}" style="max-width:72rem;margin:8rem auto 3rem;padding:1.5rem"><h1>${escapeHtml(metadata.name)}</h1><p>${escapeHtml(metadata.description)}</p><a href="/websites/">Browse websites</a></main>`;
  return html.replace(/<div id="root">[\s\S]*?<\/div>/i, () => `<div id="root">${initialContent}</div>`);
};
