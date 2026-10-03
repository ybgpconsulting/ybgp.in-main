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
