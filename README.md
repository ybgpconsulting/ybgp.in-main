# YBGP Website

YBGP is a Vite and React website for Your Business Growth Partner, a business consulting practice serving entrepreneurs, startups, and growing businesses in Noida and Delhi NCR.

## Local development

Requires Node.js 18 or newer and a MySQL server.

```bash
npm install
# Terminal 1: React/Vite frontend
npm run dev
# Terminal 2: Express API
npm run server:dev
```

The frontend runs at `http://localhost:3000` and proxies `/api` requests to the API at `http://localhost:3001`.

Copy `.env.example` to `.env` and set the local MySQL connection values before starting the API. Create the configured database in MySQL first. Never commit `.env` or production credentials.

Create the configured database and grant the configured MySQL user access to it. Then run:

```bash
npm run db:migrate
npm run db:seed
```

The migration creates the ten YBGP Websites V1 tables. It is safe to run again and does not create a migration-tracking table. The development seed is repeatable and resets the local demo records and seeded account passwords when rerun; it refuses to run with `NODE_ENV=production`.

Development-only seed accounts (never use these on a production system):

| Role | Email | Password |
| --- | --- | --- |
| Super admin | `admin@ybgp.local` | `Ybgp-Dev-Only-6cV9-Qm2X!Local` |
| Aroma & Crumb owner | `owner@aroma-crumb.demo.test` | `Ybgp-Dev-Only-6cV9-Qm2X!Local` |
| Maison Gloss owner | `owner@maison-gloss.demo.test` | `Ybgp-Dev-Only-6cV9-Qm2X!Local` |

These credentials are for local development only. The seed stores salted scrypt password hashes, never plaintext passwords.

`GET /api/health` checks API liveness. `GET /api/health/db` tests the MySQL connection and returns only a generic unavailable status on failure.

Database migrations and product endpoints beyond this phase are added in subsequent implementation phases.

## Authentication API

After running the migrations and development seed, start the Express API with `npm run server:dev`. Authentication uses the `ybgp_session` HTTP-only cookie and server-side MySQL sessions with a seven-day lifetime. The API provides `POST /api/auth/login`, `GET /api/auth/me`, and `POST /api/auth/logout`. In non-production environments, `/api/auth/test/*` routes are enabled only to exercise role and business ownership authorization; they are not product APIs.

Run the Phase 3 authentication integration tests against the migrated and seeded development database with `npm run test:auth`. The tests use the local demo accounts documented above and roll back direct database security probes.

## YBGP Websites V1 management layer

The product flow adds a tenant-safe management layer to the existing corporate site without overwriting the existing YBGP content routes. Public-facing business pages live under `/websites/:slug`, the super-admin dashboard sits at `/websites/admin`, and the business-owner dashboard sits at `/websites/dashboard`.

The backend exposes template and tenant data through `/api/templates`, `/api/admin/businesses`, `/api/business/*`, and `/api/public/websites/:slug`. The data model keeps each tenant isolated by `business_id` and relies on the existing shared MySQL pool and authorization middleware. The admin workspace supports tenant creation, publishing, activation, and subscription management; the owner workspace supports profile, product/service, category, gallery, enquiry, settings, and SEO management. Gallery images use URL/path values; file uploads are not implemented. The existing showcase demos remain available when no tenant exists at their reserved demo slug, while a database-backed tenant at that slug takes precedence.

The React frontend remains a static Cloudflare-friendly build. The management APIs, business dashboard, and public website rendering require a Node.js + MySQL host with the Express server running behind the same domain or a separate API host.

## Production build

```bash
npm run lint
npm run build
```

The existing frontend build is generated in `dist/`. Build the API separately with `npm run server:build`; the Node server entrypoint is `npm run server:start`. The current static deployment does not deploy or proxy the API, so production API hosting and same-origin routing must be configured on a Node-capable host before customer data is served.

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
