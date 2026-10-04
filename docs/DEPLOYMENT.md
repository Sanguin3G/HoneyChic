# Deployment

## Generic container release

Use Node 24 and PostgreSQL 17. The multi-stage Dockerfile builds browser/server/SSR assets and installs production dependencies only. It runs as node, with one web process; SSR runs in that process.

Copy .env.production.example to a private .env.production, fill credentials and generate a separate APP_KEY with node ace generate:key --show. APP_URL must be the public HTTP(S) origin without a path, credentials or query. Do not reuse the build placeholder or local key.

Required: APP_KEY, APP_URL, NODE_ENV, HOST, PORT, LOG_LEVEL, SESSION_DRIVER=cookie, LIMITER_STORE=database, DB_HOST/PORT/USER/PASSWORD/DATABASE, STORE_NAME/DEFAULT_LOCALE/CURRENCY/TIMEZONE. DB_SSL=true uses verified TLS for a hosted database. No AI/payment-provider/object-storage credentials are required.

For a VPS, compose.production.yaml supplies a private PostgreSQL service and a loopback-only application port. Place HTTPS termination in front. The production project/volume are separate from development.

```bash
docker compose --env-file .env.production -f compose.production.yaml build
docker compose --env-file .env.production -f compose.production.yaml up -d postgres
docker compose --env-file .env.production -f compose.production.yaml run --rm app node ace migration:run --force
# First installation only: preserves settings, seeds no demo catalog/credentials.
docker compose --env-file .env.production -f compose.production.yaml run --rm app node ace db:seed
docker compose --env-file .env.production -f compose.production.yaml run --rm app node ace owner:create
docker compose --env-file .env.production -f compose.production.yaml up -d app
```

Managed container platforms may use the same image/environment with hosted PostgreSQL; omit the Compose database. Run migrations once as a release job, not in every replica's startup command. Never use migration:fresh, reset or down -v in production. Take a backup before data-affecting releases; prefer additive changes and forward fixes. Optional-module migrations are unconditional.

Keep SEO_INDEXABLE=false for staging. Enable it only on the public production origin after launch review. Robots/sitemaps and SSR metadata honor that flag; filtered/paginated catalogs stay noindex. Private pages remain noindex and no-store.

## Process, sessions and security

/health is liveness; /health/ready checks PostgreSQL, returns 503 on failure and exposes no environment values. Docker has a liveness healthcheck. Use readiness in platform routing checks.

No queue worker/scheduler exists. Do not deploy one. Secure/HttpOnly/SameSite=Lax cookies expire after two hours. Cookie sessions have no central revocation. Configure trusted proxy addresses for the chosen provider rather than trusting every forwarded header.

Shield enforces CSRF, frame denial, nosniff, HSTS and production CSP. Scripts are restricted to self/nonce; style attributes remain allowed for Vue controls. Checkout and authentication have database-backed throttling. Fake payments are always blocked in production. COD settlement requires authorized staff/owner and an eligible order; it never invents a provider webhook.

Structured logs redact request bodies and credentials. Do not add full payload logging. See SECURITY.md for the dependency finding and remaining launch risks.

## Mail and storage strategy

Mailpit is local infrastructure only; SMTP variables are currently reserved, not consumed. Order confirmation/shipped mail and password recovery/verification are not implemented. Before a merchant launch, add framework SMTP delivery after committed business events, verified sender credentials and retry handling. A mail failure must not undo a committed order or produce a duplicate checkout. Do not promise emailed guest receipts today.

Product records store relative media keys; current assets are bundled local files. There is no upload endpoint. For merchant uploads, add validated type/size limits, safe generated keys and a persistent volume; object storage can later map the same keys through an S3-compatible adapter. Never store deployment-specific absolute URLs in records. Do not mount an empty volume over bundled demo assets.

## Backups and restoration

Use managed database backups/PITR or scheduled PostgreSQL 17 pg_dump -Fc to encrypted, access-controlled storage. Set retention to the merchant's recovery objective; keep copies away from the application host. Do not put database passwords on command lines or commit backup files.

For the VPS example, dump through the PostgreSQL container using its existing environment:

```bash
docker compose --env-file .env.production -f compose.production.yaml exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > honeychic.backup
```

Restore into a new isolated database first using pg_restore --no-owner --no-acl. Verify schema/migration versions, order totals, inventory balances/movements and payment/coupon references before switching traffic. Do not blindly restore over a live merchant database. Preserve APP_KEY for session continuity or deliberately expire sessions after a recovery.

Bundled media can be recovered from the release image. Future uploads require volume/object-store backups/versioning and a media restore point compatible with database references. Schedule periodic restore drills and record recovery time. A clean container boot is not a backup test.

No hosting provider or public deployment has been selected. Local production-container verification is separate from a hosted staging launch.
