# Architecture

One AdonisJS 7 process serves Vue 3 pages through Inertia with server-side rendering. Lucid talks to PostgreSQL 17. Sessions use cookies and scrypt passwords; Shield adds CSRF and the production CSP. There is no Redis, queue or search service.

A request runs: router → session → store context → Bouncer → locale → controller → Vine validator → one specific action. Controllers stay thin and never own a workflow. There is no generic repository around Lucid.

## Where code lives

| Path                                  | Holds                                                                                                                                         |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/http`                            | Controllers, middleware, and `checkout_modules.ts`, the adapter that lets optional modules join checkout                                      |
| `app/core`                            | Store settings, capabilities, shared support (locale, CSV, media, SEO)                                                                        |
| `app/domains/<domain>`                | Catalog, Cart, Orders, Inventory, Customers. Small domains are flat files; `actions/`, `models/`, `queries/` appear once a domain has several |
| `app/modules/<module>`                | Reviews, Wishlist, Coupons, Shipping, Payments. Modules may import domains; domains never import modules                                      |
| `inertia/app`                         | Layouts, design primitives (`Hc*`), tokens and shared CSS                                                                                     |
| `inertia/features`, `inertia/modules` | Screen components. `inertia/pages` stay thin                                                                                                  |
| `shared/money.ts`                     | Integer minor-unit money, used by server and browser                                                                                          |
| `resources/lang/{en,vi}`              | All interface copy. Both languages are required                                                                                               |

Admin routes sit in one group guarded by `auth` and `admin` middleware (owner or staff). Owner-only screens also authorize `manageStore`. Validation messages follow the request locale globally (`start/validator.ts`).

## Optional features

Each capability is **installed** (code exists), **enabled** (owner preference), **configured** (prerequisites met) and **available** (all three). New modules default off. Their schema always migrates. Disabling a module hides new interactions and rejects new mutations; past orders stay readable.

| Capability                         | Behavior                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------ |
| customer_accounts / guest_checkout | Account checkout and anonymous checkout                                  |
| reviews                            | One editable review per customer and product, after a completed purchase |
| wishlist                           | Up to 100 published products per account                                 |
| coupons                            | Fixed or percentage, currency, minimum, UTC dates, usage limit           |
| shipping                           | Pickup and flat rates by country, free-above threshold                   |
| payments.cod                       | Owner or staff records collected cash once processing starts             |
| payments.fake                      | Development and tests only; never in production                          |

Store profiles (Simple seller, Standard store, Catalog only, Custom) are presets over those switches. The owner manages everything on **Features & checkout** (`/admin/modules`); staff can read it.

`CheckoutModules` joins `PlaceOrder`'s transaction: it quotes shipping, locks and redeems a coupon and creates the payment record. Orders own totals and snapshots and import no module code. Any module failure rolls the whole checkout back.

## Make it your own

- **Payment provider.** Add a class in `app/modules/payments/providers/` implementing `PaymentProvider`, register it in `providers/index.ts`, add a capability flag and EN/VI copy. A real gateway must verify the provider's signature before calling `SettlePayment`, which stays idempotent per event reference.
- **Storage.** `DRIVE_DISK=fs` (local volume) or `s3` (any S3-compatible bucket).
- **Mail.** Any SMTP server through `SMTP_*`. Mail is skipped when unset.
- **Brand.** Logo, favicon, primary and accent colors in Store settings. Every gradient and tint derives from those two colors.
- **Catalog.** CSV import/export on the Products screen; see [Commerce rules](COMMERCE_RULES.md#csv-import).

## Data

PostgreSQL only. Money is integer minor units (within the safe integer range) with a currency; stock is a non-negative integer on the variant; every stock change is an `inventory_movements` row. Orders and items store snapshots and keep nullable links to catalog and customers, so deleting either never rewrites history. Checks guard roles, locales, the singleton store row, money ranges and publication states. Unique indexes guard SKUs, option values, active variant combinations, one primary image, one initial-stock movement, one review per customer and product, one payment per order and each payment event reference.

The store row is created from `STORE_*` on the first request, so a fresh install needs no seeding. `node ace db:seed` adds a demo catalog in development only and never overwrites merchant data.

## Decisions

- AdonisJS over a collection of libraries: routing, validation, sessions and ORM that fit together.
- PostgreSQL everywhere, including tests: one dialect, real locks.
- A modular monolith: optional modules depend on core, never the reverse.
- Inertia + Vue with SSR for both storefront and admin, so one set of primitives serves both.
- Order-first locking for checkout, cancellation and payment; see [Commerce rules](COMMERCE_RULES.md).
- No Tailwind: the design is a small token set and plain CSS, which is easier for merchants to rebrand.
