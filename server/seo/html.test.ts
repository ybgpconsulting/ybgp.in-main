import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderTenantHtml } from './html.js';

const template = `<!doctype html><html><head><title>Generic title</title>
<meta name="description" content="Generic description" />
<meta name="robots" content="index, follow" />
<meta property="og:title" content="Generic title" />
<meta property="og:description" content="Generic description" />
<meta property="og:url" content="https://www.ybgp.in/" />
<meta property="og:image" content="https://www.ybgp.in/og-image.svg" />
<meta name="twitter:title" content="Generic title" />
<meta name="twitter:description" content="Generic description" />
<meta name="twitter:url" content="https://www.ybgp.in/" />
<meta name="twitter:image" content="https://www.ybgp.in/og-image.svg" />
<link rel="canonical" href="https://www.ybgp.in/" />
<script type="application/ld+json">{"@type":"Organization"}</script></head>
<body><div id="root"><main>Generic content</main></div></body></html>`;

test('tenant HTML has unique, escaped initial metadata and meaningful content', () => {
  const html = renderTenantHtml(template, {
    name: 'A&B <Bakery>',
    title: 'A&B Bakery | Bakery',
    description: 'Fresh cakes & pastries.',
    canonicalUrl: 'https://www.ybgp.in/websites/a-b-bakery/',
    imageUrl: 'https://www.ybgp.in/og-image.svg',
  });

  assert.match(html, /<title>A&amp;B Bakery \| Bakery<\/title>/);
  assert.match(html, /content="Fresh cakes &amp; pastries\."/);
  assert.match(html, /name="robots" content="index, follow"/);
  assert.match(html, /rel="canonical" href="https:\/\/www\.ybgp\.in\/websites\/a-b-bakery\/"/);
  assert.match(html, /<h1>A&amp;B &lt;Bakery&gt;<\/h1>/);
  assert.equal((html.match(/application\/ld\+json/g) ?? []).length, 1);
  assert.doesNotMatch(html, /Generic content|Generic title/);
});
