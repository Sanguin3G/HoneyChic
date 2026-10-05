# Deployment

## Generic container release

Use Node 24 and PostgreSQL 17. The multi-stage Dockerfile builds browser/server/SSR assets and installs production dependencies only. It runs as node, with one web process; SSR runs in that process.

Copy .env.production.example to a private .env.production, fill credentials and generate a separate APP_KEY with node ace generate:key --show. APP_URL must be the public HTTP(S) origin without a path, credentials or query. Do not reuse the build placeholder or local key.

Required: APP_KEY, APP_URL, NODE_ENV, HOST, PORT, LOG_LEVEL, SESSION_DRIVER=cookie, LIMITER_STORE=database, DB_HOST/PORT/USER/PASSWORD/DATABASE, STORE_NAME/DEFAULT_LOCALE/CURRENCY/TIMEZONE. DB_SSL=true uses verified TLS for a hosted database. `DRIVE_DISK` defaults to `fs`. No AI or payment-provider credentials are required. S3 variables are required only when `DRIVE_DISK=s3`.

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

`owner:create` uses interactive prompts and needs a TTY. Do not pipe the name or password; a closed stdin fails the command. Keep `docker compose run` attached for that step.

Managed container platforms may use the same image/environment with hosted PostgreSQL; omit the Compose database. Run migrations once as a release job, not in every replica's startup command. Never use migration:fresh, reset or down -v in production. Take a backup before data-affecting releases; prefer additive changes and forward fixes. Optional-module migrations are unconditional.

Keep SEO_INDEXABLE=false for staging. Enable it only on the public production origin after launch review. Robots/sitemaps and SSR metadata honor that flag; filtered/paginated catalogs stay noindex. Private pages remain noindex and no-store.

## Process, sessions and security

/health is liveness; /health/ready checks PostgreSQL, returns 503 on failure and exposes no environment values. Docker has a liveness healthcheck. Use readiness in platform routing checks.

No queue worker/scheduler exists. Do not deploy one. Secure/HttpOnly/SameSite=Lax cookies expire after two hours. Cookie sessions have no central revocation. Behind a TLS-terminating proxy, set `TRUSTED_PROXIES` to the proxy address(es) or CIDRs (comma-separated); unset trusts none. Never trust every forwarded header.

Shield enforces CSRF, frame denial, nosniff, HSTS and production CSP. Scripts are restricted to self/nonce; style attributes remain allowed for Vue controls. Checkout and authentication have database-backed throttling. Fake payments are always blocked in production. COD settlement requires authorized staff/owner and an eligible order; it never invents a provider webhook.

Structured logs redact request bodies and credentials. Do not add full payload logging. See SECURITY.md for the dependency finding and remaining launch risks.

## Mail and storage strategy

Order confirmation, shipped, and cancellation mail go out after the order transaction commits. Password reset and guest recovery links are sent the same way. Delivery is skipped when `SMTP_HOST` is empty or no sender address is configured. A mail failure does not undo a committed order. Mailpit is the local SMTP catcher, not a production server. There is no queue, so a crash after commit and before SMTP accepts the message can drop that email.

Product records store relative media keys. Staff uploads accept JPEG, PNG, WebP, and AVIF up to 5 MB and are stored as `uploads/<uuid>.<ext>`. SVG uploads are rejected. Seeded `catalog/` illustrations stay in the image. The default `fs` disk writes to `public/media` inside the container; that disk disappears with the container and is not hosted-production storage. Set `DRIVE_DISK=s3` with an S3-compatible bucket and `S3_PUBLIC_URL` before accepting merchant uploads on a host. The bucket policy must allow public reads because ACL updates are disabled. Never store deployment-specific absolute URLs in records. Do not mount an empty volume over the bundled `catalog/` files. Back up the bucket, or a persistent volume if you deliberately keep `fs`, on the same schedule as the database.

## Backups and restoration

Use managed database backups/PITR or scheduled PostgreSQL 17 pg_dump -Fc to encrypted, access-controlled storage. Set retention to the merchant's recovery objective; keep copies away from the application host. Do not put database passwords on command lines or commit backup files.

For the VPS example, dump through the PostgreSQL container using its existing environment:

```bash
docker compose --env-file .env.production -f compose.production.yaml exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > honeychic.backup
```

Restore into a new isolated database first using pg_restore --no-owner --no-acl. Verify schema/migration versions, order totals, inventory balances/movements and payment/coupon references before switching traffic. Do not blindly restore over a live merchant database. Preserve APP_KEY for session continuity or deliberately expire sessions after a recovery.

Bundled `catalog/` media can be recovered from the release image. Merchant `uploads/` keys need the same bucket or volume restored to match the database. Schedule periodic restore drills and record recovery time. A clean container boot is not a backup test. The default `fs` disk inside the application container is ephemeral: a dump restores database keys, not files that lived only on that container filesystem.

On 2026-10-05 a local production-container drill used an isolated Compose project, a throwaway database, and loopback port 3340. `/health` and `/health/ready` returned 200. An owner signed in, published a product, set opening stock, enabled coupons and cash on delivery, and a guest placed a COD order with a fixed coupon. Inventory then had initial stock, a sale, and a restock. `pg_dump -Fc` restored into a second database on the same PostgreSQL. Snapshots matched for users, store settings, products, variant stock, inventory movements, the order and item, the pending COD payment, and the coupon redemption. A second application container booted against the restored database; the storefront showed the product, owner login worked, and the admin order showed the guest, coupon, and COD payment. That drill is not a hosted backup test. No hosting provider or public deployment has been selected.
