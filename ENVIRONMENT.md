# QuoteRivet Hosted Environment

## Railway API Service

Root: `backend`

Required variables:

- `PRODUCT_ENV=production`
- `PRODUCT_DATABASE_URL=<railway-postgres-url>`
- `PRODUCT_ALLOWED_ORIGINS=https://<railway-web-domain-or-custom-domain>`
- `INKPASS_AUTH_MODE=inkpass`
- `INKPASS_URL=https://<inkpass-url>`
- `INKPASS_USERINFO_URL=https://<inkpass-userinfo-url>`
- `INKPASS_CLIENT_SLUG=quote-intake-demo`
- `PRODUCT_INKPASS_SERVICE_API_KEY=<secret>`
- `POSTHOG_PROJECT_TOKEN=<posthog-project-token>`
- `POSTHOG_HOST=https://us.i.posthog.com`
- `PRODUCT_BUILD_ID=<factory-build-id>`
- `PRODUCT_RELEASE_SHA=<git-commit-sha>`


For incubation and traction, enable Railway Serverless in the service settings
and set `PRODUCT_FACTORY_RAILWAY_SERVERLESS_CONFIRMED=true` for deployment
preflight. For shared Postgres, run `backend/migrations/000_isolation.sql` with
an admin connection, use the isolated runtime role in `PRODUCT_DATABASE_URL`,
and set `PRODUCT_FACTORY_DATABASE_ISOLATION_CONFIRMED=true`.

## Vercel Static Web Project

Root: `frontend`

Required variables:

- `NEXT_PUBLIC_PRODUCT_API_URL=https://<railway-api-domain>`
- `NEXT_PUBLIC_SITE_URL=https://<product-domain>`
- `NEXT_PUBLIC_INKPASS_CLIENT_SLUG=quote-intake-demo`
- `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=<posthog-project-token>`
- `NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com`
- `PRODUCT_BUILD_ID=<factory-build-id>`
- `PRODUCT_RELEASE_SHA=<git-commit-sha>`

## Production Evidence Required

- Railway API deployment URL with `/health` returning JSON.
- Railway API deployment URL with `/ready` passing every compiled production system requirement.
- Vercel deployment URL loading the generated static export.
- Unauthenticated `/state` returns 401.
- `/auth/local-session` is disabled in production.
- Browser login uses `/auth/inkpass/login`, which proxies to InkPass client-scoped login.
- Authenticated `/state` validates a bearer token through server-side InkPass userinfo.
- Authenticated workflow completion persists to hosted Postgres.
- Usage event and sandbox billing event are stored.
- `/telemetry/verify` accepts a `factory_connection_verified` event in PostHog using the service-key identity.
