# Database

PostgreSQL 17 is the local/CI database. Lucid uses PostgreSQL with no SQLite fallback. Compose persists postgres_data and binds infrastructure ports to loopback. Configure verified TLS when required in production.

## Current schema

- users: normalized unique email, hashed password, name, owner/staff/customer role and nullable en/vi preference. `requires_email_verification` defaults false. `email_verified_at` is set only after a new customer confirms.
- password_reset_tokens and email_verification_tokens: user link, scrypt secret hash, expiry and used-at. Reset lasts one hour. Confirmation lasts 24 hours and is sent only when SMTP can send.
- order_recovery_tokens: hashed guest-order links that last 7 days.
- store_settings: singleton business/contact information, logo and favicon keys, https social links, optional primary/accent colors, currency, locale, timezone, order prefix, stock threshold, account/registration/guest-checkout and optional-module flags, and `store_profile` (`simple_seller`, `standard_store`, `catalog_only`, or `custom`). Brand files use the same generated upload keys as product images.
- rate_limits: authentication throttle state.
- categories: unique slug, merchant name/description and active state. Categories are flat.
- products: nullable category, unique slug, merchant text and draft/published/archived state. A generated simple-language tsvector has a GIN index.
- product_variants: product identity, globally unique SKU, safe integer price_minor, currency, option-description/combination snapshots, active state and nonnegative integer stock.
- product_options/product_option_values: ordered generic definitions and values; the variant/value pivot records chosen values.
- inventory_movements: variant, signed delta, resulting stock, constrained reason, optional reference/actor, note and timestamp. Variant deletion is restricted; actor deletion sets null.
- orders: unique public UUID/submission key/number, nullable customer, fulfillment/payment status, safe integer total/currency and customer/contact/address snapshots.
- order_items: restrictive order link, nullable catalog links and historical name/options/SKU/price/quantity/discount/tax.
- customer_addresses: customer-scoped editable address book; order snapshots are independent.
- product_images: relative storage key, alt text, sort order and primary state. Generated uploads use an `uploads/<uuid>.<ext>` key. Seeded illustrations use `catalog/`. The file is not part of the database transaction.

Checks constrain roles, locales, singleton identity, nonnegative safe money, currency format and publication states. Unique indexes protect SKU, option names/values, active variant combinations one primary image and a single initial-stock movement. Actions enforce at least one variant, coherent selections and exactly one primary image when images exist.

Product/category relationships restrict deletion. No catalog delete endpoint exists; products can be archived and omitted variants are retired, preserving identity and reserved SKU. Option definitions and image metadata are reconciled within a product transaction. Orders use immutable snapshots rather than live catalog reconstruction.

## Seeds

node ace db:seed initializes store settings without overwriting merchant changes or creating credentials. In development only, it also inserts four mixed-category demo products with local photos. Re-running seeds skips existing product slugs. Catalog seeding explicitly initializes store settings first, so a fresh database does not depend on alphabetical seed order.

Demo amounts are illustrative in the configured currency, not converted exchange rates. Existing products retain their creation currency. New/migrated variants start at zero stock; seeding does not create stock movements or reset balances.

## Migrations and tests

The inventory migration adds zero stock without changing catalog identities/prices. Rolling it back drops inventory balances and history: back up and prefer forward fixes in production.

First-party migrations are unconditional. On a new empty database, `node ace migration:fresh --seed` rebuilds it. Do not run that against this checkout's `honeychic` database: it deletes the owner and order HC-000001. Production uses `node ace migration:run --force` and never fresh or reset.

Create the separate local test database once:

```bash
docker compose exec postgres createdb -U honeychic honeychic_test
```

.env.test selects it. Japa refuses names without the _test suffix, migrates/seeds, rolls back functional mutations and tears down only this isolated database. Development demo seeding is excluded from tests/production. Recreate the test database after deleting the Compose volume.

Inventory, orders and future payments must follow [commerce invariants](COMMERCE_RULES.md).

## Optional module schema

The optional-module migration adds typed enablement flags, order discount/shipping/name/code snapshots, wishlists, reviews, shipping_rates, coupons, coupon_redemptions, payments and payment_events. Unique constraints protect wishlist/review duplicates, checkout redemption, one payment per order and callback references. Coupon/payment business records restrict destructive deletion; wishlist/reviews cascade with their account/product. Shipping/coupon currency and amounts are constrained. Configuration changes do not rewrite old order snapshots. Migration down discards module history; production must use backups and forward fixes.
