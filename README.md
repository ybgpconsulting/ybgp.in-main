# YBGP Website

YBGP is a Vite and React website for Your Business Growth Partner, a business consulting practice serving entrepreneurs, startups, and growing businesses in Noida and Delhi NCR.

## Local development

Requires Node.js 18 or newer.

```bash
npm install
npm run dev
```

The development site runs at `http://localhost:3000`.

## Production build

```bash
npm run lint
npm run build
```

The deployable static site is generated in `dist/`.

## Hostinger deployment

Upload the contents of `dist/` to Hostinger's `public_html` directory. Keep hidden files, including `dist/.htaccess`. The Apache configuration serves the clean service routes, preserves real assets, enforces the canonical HTTPS `www` host, and uses `404.html` for unknown paths.

No server-side runtime or environment variables are required. The site does not use an external API.

## Works admin on Cloudflare

The `/admin/` screen publishes new projects to the `/work/` page through a Cloudflare Worker and D1. The admin write API verifies the Cloudflare Access JWT signature, issuer, audience and expiry; protect both `/admin*` and `/api/admin/*` with a Cloudflare Access application and allow only the intended editors. Public project reads use `/api/works`.

Before deploying to Cloudflare:

1. Create a D1 database named `ybgp-works`, then replace `REPLACE_WITH_D1_DATABASE_ID` in `wrangler.jsonc` with its ID.
2. Configure `ACCESS_TEAM_DOMAIN` with your Cloudflare Access team domain and `ACCESS_AUD` with the Access application's audience tag.
3. Create the Access application and policies for `/admin*` and `/api/admin/*`; do not expose those paths without an allow-list policy.
4. Apply the schema with `npx wrangler d1 migrations apply ybgp-works --remote`.
5. Deploy with `npm run deploy`.

The static Hostinger deployment remains available for the original hard-coded portfolio, but its admin form cannot publish shared entries without the Cloudflare Worker and D1 setup.

## Analytics and conversion tracking

Tracking is opt-in at build time. Add the real IDs from Google Analytics and Google Ads to a local `.env` file or the hosting build environment:

```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_GOOGLE_ADS_ID=AW-XXXXXXXXXX
VITE_GOOGLE_ADS_WHATSAPP_LABEL=whatsapp-conversion-label
VITE_GOOGLE_ADS_PHONE_LABEL=phone-conversion-label
VITE_GOOGLE_ADS_LEAD_LABEL=lead-conversion-label
```

The site records GA4 events for WhatsApp clicks, phone clicks and Google Form clicks. On `/business-website/`, it also sends landing-page-specific event names. Google Ads conversion events are sent only when the matching conversion label is configured.
