import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderTenantHtml } from './html.js';

const template = `<!doctype html><html><head><title>Generic title</title>
<meta name="description" content="Generic description" />
<meta name="robots" content="index, follow" />
<meta name="author" content="YBGP" />
<meta property="og:site_name" content="Your Business Growth Partner" />
<meta property="og:title" content="Generic title" />
<meta property="og:description" content="Generic description" />
<meta property="og:url" content="https://www.ybgp.in/" />
<meta property="og:image" content="https://www.ybgp.in/og-image.svg" />
<meta property="og:image:alt" content="YBGP" />
<meta name="twitter:site" content="@ybgp.consulting" />
<meta name="twitter:creator" content="@ybgp.consulting" />
<meta name="twitter:title" content="Generic title" />
<meta name="twitter:description" content="Generic description" />
<meta name="twitter:url" content="https://www.ybgp.in/" />
<meta name="twitter:image" content="https://www.ybgp.in/og-image.svg" />
<link rel="canonical" href="https://www.ybgp.in/" />
<script type="application/ld+json">{"@type":"Organization","url":"https://www.ybgp.in/"}</script></head>
<body><div id="root"><main>Generic content</main></div></body></html>`;

test('tenant HTML has unique, escaped initial metadata and meaningful content', () => {
  const html = renderTenantHtml(template, {
    name: 'A&B <Bakery>',
    title: 'A&B Bakery | Bakery',
    description: 'Fresh cakes & pastries.',
    ogTitle: 'A&B Bakery Social',
    ogDescription: 'Fresh cakes for sharing.',
    canonicalUrl: 'https://www.ybgp.in/websites/a-b-bakery/',
    imageUrl: 'https://www.ybgp.in/uploads/bakery.jpg',
  });

  assert.match(html, /<title>A&amp;B Bakery \| Bakery<\/title>/);
  assert.match(html, /content="Fresh cakes &amp; pastries\."/);
  assert.match(html, /name="robots" content="index, follow"/);
  assert.match(html, /property="og:title" content="A&amp;B Bakery Social"/);
  assert.match(html, /property="og:description" content="Fresh cakes for sharing\."/);
  assert.match(html, /property="og:url" content="https:\/\/www\.ybgp\.in\/websites\/a-b-bakery\/"/);
  assert.match(html, /property="og:site_name" content="A&amp;B &lt;Bakery&gt;"/);
  assert.match(html, /property="og:image" content="https:\/\/www\.ybgp\.in\/uploads\/bakery\.jpg"/);
  assert.match(html, /name="twitter:title" content="A&amp;B Bakery Social"/);
  assert.match(html, /name="twitter:description" content="Fresh cakes for sharing\."/);
  assert.match(html, /name="twitter:url" content="https:\/\/www\.ybgp\.in\/websites\/a-b-bakery\/"/);
  assert.match(html, /name="twitter:image" content="https:\/\/www\.ybgp\.in\/uploads\/bakery\.jpg"/);
  assert.match(html, /rel="canonical" href="https:\/\/www\.ybgp\.in\/websites\/a-b-bakery\/"/);
  assert.match(html, /<h1>A&amp;B &lt;Bakery&gt;<\/h1>/);
  assert.equal((html.match(/application\/ld\+json/g) ?? []).length, 1);
  assert.equal((html.match(/<link rel="canonical"/g) ?? []).length, 1);
  assert.equal((html.match(/property="og:title"/g) ?? []).length, 1);
  assert.equal((html.match(/name="twitter:title"/g) ?? []).length, 1);
  assert.match(html, /websites\/a-b-bakery\/#webpage/);
  assert.doesNotMatch(html, /Generic content|Generic title|@type":"Organization"|@ybgp\.consulting/);
});

test('replacement-token text in tenant SEO values stays literal in HTML and JSON-LD', () => {
  const title = "Title $& $' $` <value>";
  const description = "Description $& $' $` <value>";
  const name = "Shop $& $' $` <value>";
  const canonicalUrl = "https://www.ybgp.in/websites/shop/?marker=$&-$'-$`";
  const escapedCanonicalUrl = canonicalUrl.replace(/&/g, '&amp;').replace(/'/g, '&#39;');
  const html = renderTenantHtml(template, {
    name,
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    canonicalUrl,
    imageUrl: "https://cdn.example.test/share.jpg?marker=$&-$'-$`",
  });

  assert.ok(html.includes(`<title>Title $&amp; $&#39; $\` &lt;value&gt;</title>`));
  assert.ok(html.includes(`name="description" content="Description $&amp; $&#39; $\` &lt;value&gt;"`));
  assert.ok(html.includes(`property="og:title" content="Title $&amp; $&#39; $\` &lt;value&gt;"`));
  assert.ok(html.includes(`property="og:description" content="Description $&amp; $&#39; $\` &lt;value&gt;"`));
  assert.ok(html.includes(`property="og:url" content="${escapedCanonicalUrl}"`));
  assert.ok(html.includes(`property="og:image" content="https://cdn.example.test/share.jpg?marker=$&amp;-$&#39;-$\`"`));
  assert.ok(html.includes(`name="twitter:title" content="Title $&amp; $&#39; $\` &lt;value&gt;"`));
  assert.ok(html.includes(`name="twitter:description" content="Description $&amp; $&#39; $\` &lt;value&gt;"`));
  assert.ok(html.includes(`name="twitter:url" content="${escapedCanonicalUrl}"`));
  assert.ok(html.includes(`rel="canonical" href="${escapedCanonicalUrl}"`));
  assert.ok(html.includes(`<h1>Shop $&amp; $&#39; $\` &lt;value&gt;</h1>`));
  assert.equal((html.match(/<link rel="canonical"/g) ?? []).length, 1);
  assert.equal((html.match(/property="og:title"/g) ?? []).length, 1);
  assert.equal((html.match(/name="twitter:title"/g) ?? []).length, 1);

  const schemaText = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)?.[1];
  assert.ok(schemaText);
  const schema = JSON.parse(schemaText) as Array<{ name?: string; description?: string; url?: string }>;
  assert.equal(schema[0].name, title);
  assert.equal(schema[0].description, description);
  assert.equal(schema[0].url, canonicalUrl);
  const breadcrumbs = schema[1] as {
    itemListElement: Array<{ name: string }>;
  };
  assert.equal(breadcrumbs.itemListElement[0].name, 'YBGP Websites');
});
