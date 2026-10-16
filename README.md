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

## Authentication API

After running the migrations and development seed, start the Express API with `npm run server:dev`. Authentication uses the `ybgp_session` HTTP-only cookie and server-side MySQL sessions with a seven-day lifetime. The API provides `POST /api/auth/login`, `GET /api/auth/me`, and `POST /api/auth/logout`. A signed-in super admin can change their email and password from the admin dashboard's **Change login** action; the request verifies the current password, requires a password of at least 12 characters, and revokes all existing sessions. In non-production environments, `/api/auth/test/*` routes are enabled only to exercise role and business ownership authorization; they are not product APIs.

Run the authentication integration tests against the migrated and seeded local test database with `npm run test:auth`. The tests use the local demo accounts documented above and roll back direct database security probes.

Run the database-independent date validation tests with `npm run test:unit`.

Database integration tests refuse to run unless `DB_HOST` is loopback and `DB_NAME` is exactly `ybgp_websites_test`. Configure a dedicated local test database in `.env`, then run migrations and the development seed against that database before running `npm run test:auth` or `npx tsx --test server/business/business.test.ts`. Never point integration tests at a production database.

## YBGP Websites V1 management layer

The product flow adds a tenant-safe management layer to the existing corporate site without overwriting the existing YBGP content routes. Public-facing business pages live under `/websites/:slug`, the super-admin dashboard sits at `/websites/admin`, and the business-owner dashboard sits at `/websites/dashboard`.

The backend exposes template and tenant data through `/api/templates`, `/api/admin/businesses`, `/api/business/*`, and `/api/public/websites/:slug`. The data model keeps each tenant isolated by `business_id` and relies on the existing shared MySQL pool and authorization middleware. The admin workspace supports tenant creation, publishing, activation, and subscription management; the owner workspace supports profile, product/service, category, gallery, enquiry, settings, and SEO management. Gallery images use URL/path values; file uploads are not implemented. The existing showcase demos remain available when no tenant exists at their reserved demo slug, while a database-backed tenant at that slug takes precedence.

The React frontend is built into `dist/`. On a Node.js + MySQL host, the Express server serves the built frontend and assets alongside the management APIs, so the website and `/api/*` endpoints can share one origin. Build the frontend and server before starting the Node process.

## Production build

```bash
npm run lint
npm run build
```

The frontend build is generated in `dist/`. Build the API separately with `npm run server:build`; the Node server entrypoint is `npm run server:start`.

For a Node-hosted deployment, `npm install` automatically runs `npm run build:hostinger` after installing dependencies, generating both `dist/` and `build/server/index.js`; Hostinger does not need a separate build command. Start the app with `npm start`. The project npm config includes development dependencies because Vite and TypeScript are needed during this install-time build, even when the host sets `NODE_ENV=production`. Set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` in the host's environment. The server listens on Hostinger's assigned `PORT` when present, or falls back to `API_PORT` (default `3001`) for local use.

## Hostinger deployment

For a static-only Hostinger deployment, upload the contents of `dist/` to `public_html`. Keep hidden files, including `dist/.htaccess`. The Apache configuration serves the clean service routes, preserves real assets, enforces the canonical HTTPS `www` host, and uses `404.html` for unknown paths. A static-only deployment does not run the Express API; use Hostinger's Node.js application hosting for database-backed websites and API functionality.

Static-only deployment does not require a server runtime or database environment variables. Node-hosted deployment requires the Express runtime and the database environment variables listed above.

Set `VITE_SITE_URL` to the production origin at build time when it differs from `https://www.ybgp.in/`. The production build generates route-specific HTML metadata, canonical URLs, `robots.txt`, `sitemap.xml`, and Hostinger rewrite rules from this value. Node hosting also adds active business websites to the sitemap at request time.

## SEO launch checklist and 30-day roadmap

Before launch:

- Confirm the primary HTTPS hostname and `VITE_SITE_URL`; check that HTTP, apex, and `www` variants resolve to the intended canonical host.
- Upload the current production build and verify representative service, work, admin, demo, unknown-route, and sitemap responses.
- Verify the production domain in Google Search Console and Bing Webmaster Tools, then submit `/sitemap.xml`.
- Inspect the homepage, primary service pages, and a published tenant page in Search Console after they are publicly reachable.
- Confirm GA4 and any configured Google Ads conversion IDs in the hosting environment, then test consent and lead-event behavior on the live site.
- Review contact details, service descriptions, project permissions, tenant publication status, and page-specific titles/descriptions for accuracy.

First 30 days:

1. **Days 1–7:** Check Search Console indexing and sitemap processing; fix discovered crawl, canonical, mobile, or server errors.
2. **Days 8–14:** Review impressions and search queries for the homepage and core service pages; improve their copy and internal links based on actual user intent.
3. **Days 15–21:** Expand project pages only with verified client details, approved images, and accurate outcomes; keep thin or sample pages excluded from indexing.
4. **Days 22–30:** Review organic leads and landing-page conversion events, compare page performance, and prioritize the next improvements from measured data.

The sitemap intentionally excludes the `/websites/` alias, private dashboards, demo templates, and low-differentiation location/sample pages. Reconsider exclusions only after reviewing real Search Console data and improving the affected pages with accurate, useful content.

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
