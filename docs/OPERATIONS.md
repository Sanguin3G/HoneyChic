# Operations

## Develop

Use Linux Node 24, npm 11+ and Docker inside WSL. Do not install with Windows Node: native packages are built for Linux.

```bash
cp .env.example .env
docker compose up -d --wait
npm install && node ace generate:key
node ace migration:run && node ace db:seed
npm run dev
```

App <http://localhost:3333>, Mailpit <http://localhost:8025>, PostgreSQL `127.0.0.1:5432`. Create the owner at `/welcome` (the setup code is on the page in development) or with `node ace owner:create`. `STORE_*` fills the store row once; later edits come from Store settings.

Never run `migration:fresh`, `migration:reset` or `docker compose down -v` against a database with real data. For a throwaway copy, point `DB_DATABASE` at another database.

## Check

```bash
docker compose exec postgres createdb -U honeychic honeychic_test   # once
npm run typecheck
npm run lint
npm run build
npm test
```

`.env.test` selects `honeychic_test`; the test boot refuses any name without `_test`. Japa migrates it and rolls back each test. Domain tests own money, stock and rollback; HTTP tests check authorization, the error's locale and that a rejected request changed nothing. Keep the 30 s functional timeout.

## Deploy

One Node container plus PostgreSQL 17. Hosting, HTTPS, SMTP and storage are the owner's choice.

1. Copy `.env.production.example` to a private `.env.production`. Generate a separate key with `node ace generate:key --show`. Set `APP_URL` to the public origin and `TRUSTED_PROXIES` to your proxy's address or CIDR (blank trusts none).
2. `docker compose --env-file .env.production -f compose.production.yaml up -d --build`
3. Read the setup code from `docker compose ... logs app` (or `... run --rm app node ace owner:code`) and create the owner at `https://your-shop/welcome`.

`compose.production.yaml` sets `MIGRATE_ON_START=true` (one container) and keeps uploads on the `uploads-production` volume. With several replicas, unset it and run `node ace migration:run --force` once per release. Prefer additive migrations and forward fixes.

| Variable                | Purpose                                                             |
| ----------------------- | ------------------------------------------------------------------- |
| `SMTP_*`, `MAIL_FROM_*` | Order, reset and confirmation mail. Empty `SMTP_HOST` skips mail    |
| `DRIVE_DISK`            | `fs` (volume) or `s3` with `S3_*` and a public-read bucket          |
| `ORDER_EXPIRY_MINUTES`  | How often unpaid-order expiry runs in-process (default 15, 0 = off) |
| `SEO_INDEXABLE`         | `true` only on the public production origin after launch review     |
| `MIGRATE_ON_START`      | Run migrations before the server starts                             |

`/health` is liveness; `/health/ready` checks the database. The image has a liveness healthcheck.

## Back up

Use managed backups with point-in-time recovery, or a scheduled `pg_dump -Fc` to encrypted storage away from the host:

```bash
docker compose --env-file .env.production -f compose.production.yaml exec -T postgres \
  sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > honeychic.backup
```

Back up merchant uploads (bucket or volume) on the same schedule. Restore into a new database with `pg_restore --no-owner --no-acl`, check order totals, stock and payments, then switch traffic. Keep `APP_KEY` to keep sessions valid.

## Security

- scrypt passwords, cookie sessions (Secure, HttpOnly, SameSite=Lax, two hours, no central revocation).
- CSRF on every mutation, frame denial, nosniff, HSTS, production CSP (self/nonce scripts; inline styles allowed for Vue).
- Vine validation everywhere; parameterized SQL; Bouncer owner/staff boundaries. Registration cannot choose a role.
- Login, reset, confirmation, first-run and checkout are rate limited.
- Uploads: JPEG, PNG, WebP, AVIF up to 5 MB, checked by content, stored under generated keys. SVG is rejected.
- Reset tokens (1 h), confirmation tokens (24 h) and guest recovery links (7 d) are stored hashed and expire.
- The first-run code is derived from `APP_KEY` and only works while no owner exists.
- Fake payments are blocked in production by both configuration and the provider. A real gateway must verify signatures before settlement; never expose `SettlePayment` as an unsigned webhook.
- Logs redact bodies and credentials. No secrets in Git, screenshots or logs.
- Run `npm audit --omit=dev` before launch. Do not use `npm audit fix --force`: it downgrades Adonis. Known findings sit in `@adonisjs/assembler` (braces, build-time only) and `@adonisjs/mail` (nodemailer); take patched releases inside the declared ranges.

Mail has no queue: a crash between commit and SMTP acceptance can drop that one email. Uploads on the container's own disk vanish on rebuild; keep the volume or use S3.

## Screenshots

README screenshots are Microsoft Edge captures of the demo catalog. Retake them when the storefront or admin layout changes. Never reset the merchant dev database for them; use a separate preview database (`DB_DATABASE=honeychic_preview`) with its own throwaway owner.
