# Vercel Hobby deployment

This project now has a shared Express app for local development and Vercel Functions. Local development still starts the Express listener and Vite middleware; the Vercel API entry imports the generated `serverless/vercelHandler.mjs` bundle. `pnpm build` bundles local server modules into that ESM file while keeping npm packages external, avoiding extensionless local imports at runtime. The shared app does not start a listener or register jobs when used by the function.

## Hosting limits to account for

- Vercel Hobby is intended for personal, non-commercial projects. Confirm the app qualifies before using Hobby in production.
- Hobby Cron is daily with coarse timing, so it cannot preserve the app's existing every-minute reminder checks. The included Cloudflare Worker scheduler runs once per minute on Cloudflare's free Workers plan. It is a separate scheduler service, not an Express backend.
- Vercel Functions have a 4.5 MB request/response payload limit. Existing avatar limits fit, but some lesson material, assignment image, and OCR inputs can exceed it. Those larger files need a browser-to-storage upload flow and storage CORS support to retain their full current limits. They will otherwise receive a platform 413 before Express runs.
- Scheduled calls run in UTC. Application reminder timestamps are absolute dates, so the due check is timezone-independent. Daily/weekly personal recurrence currently advances by fixed 24/168-hour intervals; the schema stores no user timezone, so it does not promise the same local wall-clock time across daylight-saving changes.
- A one-minute schedule is best effort, not a real-time guarantee. Delayed personal reminders remain due and are picked up on a later tick. A school lesson alert is only relevant in its existing five-minute window and can be missed during a longer outage.

## Vercel project settings

Use the repository root as the project root and set:

- Framework preset: Vite
- Build command: `pnpm build`
- Output directory: `dist/public`
- Install command: `pnpm install --frozen-lockfile`
- Node.js function region: Tokyo (`hnd1`), close to the TiDB cluster region

The checked-in `vercel.json` sets the function duration/region and keeps the SPA fallback. A wildcard rewrite routes `/api/*` to the fixed `/api/handler` function and forwards the original API path in `__vercel_path`; the handler restores that path before calling Express. This is necessary because plain Vercel `api/` functions do not use Next.js `[...path]` catch-all semantics. Vercel serves the built frontend assets from `dist/public`.

## Vercel environment variables

Add production (and preview, if preview deployments should use isolated credentials) variables in Vercel Project Settings. Never paste secrets into source control or use `VITE_` for server-only credentials.

Required for core app behavior:

- `DATABASE_URL`: rotated TiDB connection URL whose database path is `talat_app`, with TLS enabled. Do not point this at `fortune500`.
- `JWT_SECRET`: a new random secret of at least 32 bytes.
- `OWNER_OPEN_ID`: platform owner identity used by existing role assignment.
- `VITE_APP_ID`: OAuth application ID used by the existing server SDK.
- `OAUTH_SERVER_URL`: existing OAuth service base URL.
- `CRON_SECRET`: random value of at least 32 characters; set the same value in the Cloudflare Worker as a secret.

Required to retain integrations that are enabled in the app:

- `BUILT_IN_FORGE_API_URL` and `BUILT_IN_FORGE_API_KEY`: server-only Manus/Forge integration used by storage, LLM, maps, and other proxy APIs. Confirm these credentials and the service remain available from Vercel before relying on those features.
- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `VAPID_SUBJECT`: browser push delivery.
- `VITE_ANALYTICS_ENDPOINT`, `VITE_ANALYTICS_WEBSITE_ID`, `VITE_APP_TITLE`, and `VITE_APP_LOGO`: optional public build-time settings, if desired.

`VITE_FRONTEND_FORGE_API_KEY` is read by the browser map loader and will be visible in the JavaScript bundle. Treat it only as a deliberately public, restricted browser key; if it is a server credential, rotate it and move map loading behind a server-safe integration before deployment. All `VITE_` values are public.

Set the OAuth provider's allowed callback URL to:

```text
https://<your-vercel-domain>/api/oauth/callback
```

## TiDB migrations

The existing code caches a MySQL2 pool at module scope and caps each warm function instance at two TLS connections for serverless reuse. The Drizzle schema and 32 checked-in migrations are unchanged by this deployment work.

Because the database password was previously exposed, rotate it first, update local `.env` and Vercel, and use a database user scoped to `talat_app`. Then confirm the URL's database name without printing the credential and run only the checked-in migrations:

```powershell
pnpm exec drizzle-kit migrate
```

Do not run this with a `fortune500` URL. Do not use `pnpm db:push` for this step because that script also generates a migration.

## Free minute scheduler

The Cloudflare Worker in `scheduler/` sends authenticated POST requests to both scheduled endpoints once per minute. Its calls use the server-only `CRON_SECRET`. The endpoints retain legacy Heartbeat-token authorization, and secret-authorized calls bypass the old task-UID schedule lookup. Existing database compare-and-swap claims continue preventing duplicate deliveries when ticks overlap.

1. Create a free Cloudflare account/Worker and deploy `scheduler/cloudflare-worker.js` with `scheduler/wrangler.toml` (or use the Cloudflare dashboard's Worker editor and configure the same `* * * * *` Cron Trigger).
2. Set Worker variable `APP_BASE_URL` to the production Vercel origin, for example `https://<your-vercel-domain>`.
3. Set Worker secret `CRON_SECRET` to the exact value configured in Vercel. Do not commit it.
4. Confirm the Worker has one cron trigger (`* * * * *`) and review its event logs for HTTP failures.
5. Disable any obsolete Manus Heartbeat jobs for this deployment after confirming the Vercel Worker is active. Do not remove the legacy authorization code; it still supports the existing local/long-lived deployment.

Cloudflare Free allows five Cron Triggers per account, 100,000 Worker requests/day, and one-minute cron expressions. This Worker uses one trigger and makes two requests per minute (2,880/day). Cloudflare schedules in UTC and does not promise exact delivery time.

## Deploy and verify

From the repository root:

```powershell
pnpm check
pnpm test
pnpm build
```

Then deploy the Vercel project from its dashboard or CLI. Verify the deployed routes:

- `GET https://<your-vercel-domain>/api/health` returns JSON `{ "ok": true }`.
- `GET https://<your-vercel-domain>/api/trpc/auth.me?input=%7B%22json%22%3Anull%7D` returns a tRPC JSON envelope, not `index.html`.
- Test teacher registration/login and cookie persistence with a staging account after migrations are applied.
- Verify reminder delivery from the Cloudflare Worker event log and a staging account. Avoid manually invoking production reminder endpoints because they may send real push notifications.

No production deployment or migration is performed by this repository change. Vercel credentials, the rotated TiDB password, and the Cloudflare account must be configured in their respective dashboards.
