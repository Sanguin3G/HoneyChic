# Development

## WSL Debian

Use Linux Node 24, npm 11+, Docker Engine/Compose and Git. A WSL-native checkout is faster than `/mnt/d`; do not mix Windows npm with Linux dependencies.

```bash
cp .env.example .env
docker compose up -d
npm install
node ace generate:key
node ace migration:run
node ace db:seed
node ace owner:create
npm run dev
```

App: http://localhost:3333. Mailpit UI: http://localhost:8025. The app sends through `SMTP_HOST` and `SMTP_PORT` (127.0.0.1:1025 in the example). Set the store contact email or `MAIL_FROM_ADDRESS`; otherwise order and reset mail is skipped. PostgreSQL: 127.0.0.1:5432. Set a free `DB_PORT` if needed.

`owner:create` securely prompts for name, email and a password of at least 12 characters. It creates only the initial owner, serializes concurrent bootstrap attempts and refuses if an owner already exists. No credentials are seeded. Log in at `/login`; owners manage settings at `/admin/settings`, staff access `/admin`, customers use `/account`.

`STORE_*` environment values initialize the store row once. Later edits come from the owner settings screen. Re-running the seeder preserves existing settings. Registration is customer-only and requires enabled accounts/registration. Disabling accounts does not lock out owner/staff.

## Local reset

This destroys the local Compose database volume; development only:

```bash
docker compose down -v
docker compose up -d --wait
node ace migration:fresh --seed
node ace owner:create
docker compose exec postgres createdb -U honeychic honeychic_test
```

Production uses `migration:run --force`, never fresh/reset.

## Checks

Create the isolated test database once (skip if it exists):

```bash
docker compose exec postgres createdb -U honeychic honeychic_test
npm run typecheck
npm run lint
npm run build
npm test
```

`.env.test` uses `honeychic_test` and the memory throttle. The application selects the framework memory session store only while testing, as required by its Japa session helpers. Tests refuse any database name without `_test`. External shell environment takes precedence: remove conflicting DB_DATABASE overrides. Japa migrates/seeds the isolated database and rolls back mutations between tests. CI creates its own test database.

Use targeted tests/checks while iterating; all checks before milestones. Tests protect auth, authorization, persisted configuration, capability/locale behavior and catalog pricing/variant/publication integrity and inventory balances/locking/history, plus compact foundation smoke checks. No component/CSS test suite.

## This checkout

The ignored `.honeychic-tools` folder is temporary execution tooling, not an application requirement. The private `.legacy-backup/laravel-v1` archive preserves the original Laravel source ZIP, complete v1 Git bundle, SQLite database, environment and pre-rewrite Git history. Its manifest records SHA-256 checksums. It is ignored by Git and excluded from Docker builds; keep it private and copy it to your normal backup storage.

Linux Node is currently available through:

```bash
export PATH="$PWD/.honeychic-tools/node/bin:$PATH"
```

Replace it with your normal Linux Node 24 installation when convenient. Typecheck runs codegen first so Inertia types exist on a fresh checkout.

## Catalog development

Run node ace migration:run and node ace db:seed after updating this slice. Development seeding adds four mixed-category examples only when their slugs are absent. It never resets merchant data or seeds credentials. Placeholder product photos are stored locally in public/media/catalog; sources and licenses are in docs/MEDIA.md. Staff can upload a replacement image or keep one of those relative keys.

Browse /products. Owners/staff edit /admin/products and /admin/categories. Products start as drafts; simple products require one default variant. Add generic option values and explicitly define sellable combinations. Prices use decimal text in the displayed currency (whole values for VND). Store currency changes apply only to new products.

Product images accept a JPEG, PNG, WebP, or AVIF upload up to 5 MB, or an existing relative key. Uploads are stored as `uploads/<uuid>.<ext>` through Drive. SVG uploads are rejected; existing catalog keys remain valid. The default disk is local `public/media`, served at `/media`. Set `DRIVE_DISK=s3` only when the S3 variables in `.env.example` point at a real bucket. Logo and favicon use that same upload path and are removed only when no product image or brand field still references the key. An upload that is never saved can remain on disk; there is no sweeper.

## Inventory development

Run node ace migration:run, then open /admin/inventory as owner/staff. New and migrated variants start at zero; development seeds do not stock them automatically. Use initial stock before the first movement, restock to add quantities, or a signed manual adjustment/correction. Every change records its balance and history. Catalog edits cannot retire stocked variants.

Focused inventory checks: node ace test --files=inventory.spec.ts --files=inventory_http.spec.ts --files=inventory_concurrency.spec.ts. The concurrency test uses separate connections and committed fixtures in the isolated test database, cleaning them afterward; it deliberately does not use a global transaction.

## Compact storefront smoke

Browse home to catalog/product; check category/search/available filtering, pagination and EN/VI switching. Select product options and image thumbnails. At mobile width check navigation, filters, Escape/focus restoration and comfortable targets. No component test infrastructure is needed for presentation-only changes. An isolated, ignored Playwright installation can run a compact smoke with installed Microsoft Edge (channel msedge); this is not a new application dependency.

## Cart verification

Run targeted cart checks with node ace test --files=cart.spec.ts --files=cart_http.spec.ts. Browse product → choose variant → add → update/remove, then switch EN/VI and reload. Use an isolated honeychic_test database for mutation/browser fixtures, never merchant data. Check one real-cookie flow and the 12-line cap when changing session storage.

## Checkout/admin verification

Run node ace test --files=orders.spec.ts --files=order_concurrency.spec.ts --files=admin_commerce.spec.ts while iterating. Before a milestone use typecheck, lint, build and the complete suite. The checkout concurrency test uses committed independent connections and removes only its own isolated test fixtures.

Browse guest checkout → private receipt → cancellation, and account checkout using a saved address → order history. Admin smoke: order filter/detail/status, customer name/history, existing product editor, inventory and owner module settings. Use Playwright with Microsoft Edge for desktop/mobile. Always isolate browser mutations in honeychic_test and clean fixtures before another Japa run.

Migration 1780800000000 adds unconditional order/address tables and defaults guest checkout on. Existing database users must run node ace migration:run. Disable guest checkout in /admin/modules or store settings when required. A cart spanning different creation currencies is rejected; no currency conversion exists.

## Optional modules and production preview

Run node ace migration:run for the new unconditional module schema. Modules begin disabled; configure /admin/modules and /admin/module-configuration as owner. Rates/coupons use integer minor units; percentage coupons use basis points and UTC dates. No new dependency install or infrastructure is required.

Targeted checks: node ace test --files=modules.spec.ts --files=module_checkout.spec.ts --files=module_concurrency.spec.ts --files=seo.spec.ts. Keep DB_DATABASE on honeychic_test. The fake gateway works only in development/test; a production preview must use COD. Playwright browser checks use Microsoft Edge (`channel: 'msedge'`). Keep WSL active while Edge accesses Docker.

Production uses .env.production.example and compose.production.yaml; see DEPLOYMENT for safe release/backup commands. SMTP is the built-in delivery channel; there is no SMS integration.

## Delivery extensions

SMTP is the only built-in channel. Configure it in config/mail.ts with SMTP_* variables; sender selection lives in app/core/support/mail_sender.ts. Order mail runs after commit in DeliverOrderMail, and password-reset delivery runs asynchronously in RequestPasswordReset. Keep EN/VI templates and checkout-locale snapshots when adding a mail transport.

SMS needs a separate explicit provider integration, validated phone data and delivery configuration. No SMS_* variable currently enables SMS. Future delivery adapters must not change order transactions, log recovery secrets or expose provider failures as account-existence responses.

## Laravel v1 recovery

The unchanged `larastore-v1-final` tag points to `3cad9fdb3745e89dd7445844051c710753df3ee0`. For a separate source checkout:

```bash
git clone .legacy-backup/laravel-v1/laravel-v1.bundle ../HoneyChic-Laravel-v1
git -C ../HoneyChic-Laravel-v1 checkout larastore-v1-final
```

The archived SQLite database passed integrity checking. Its four categories, twelve products (including exact seeded stock deductions), three demo customers, four demo orders and seven review bodies match the v1 seeder. The remaining account is the seeded administrator. These demo identities, passwords, reviews and unpaid historical orders were not imported into the current store. The original database remains recoverable in the private archive.

The old environment used the log mailer, had no configured S3 bucket/credentials, and contained Laravel-specific application/database/session settings. None were suitable to replace the working Adonis environment. In particular, its encryption key and bcrypt accounts are incompatible with current scrypt authentication; archived Gmail credentials were not activated. The active `.env` was preserved unchanged. Original legacy database/environment files and unused PHP runtime artifacts were removed only after backup verification.
