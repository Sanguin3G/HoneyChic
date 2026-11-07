# Architecture

One AdonisJS 7 process serves Vue 3 through Inertia. Vite builds the browser assets and the SSR bundle. Lucid uses PostgreSQL. Sign-in uses the session guard and scrypt. Shield handles CSRF and the production content security policy.

A request goes through the router, session, store context, Bouncer, and locale, then a controller, a Vine validator, and one specific action. Controllers do not own the workflow. There is no generic repository around Lucid.

## Where code lives

- `app/http` adapts HTTP.
- `app/core` holds store settings, capabilities, and shared support.
- `app/domains` holds Catalog, Cart, Orders, Inventory, and Customers. Domains do not import modules.
- `app/modules` holds Reviews, Coupons, Payments, Shipping, and Wishlist. They may use domains. Assistant, Stripe, and VNPay are not installed.
- `inertia/app` holds layouts and primitives. `inertia/features` and `inertia/modules` hold the screens. Pages stay thin.
- `shared/money` formats integer minor units. Prices are never floating point.

Who may change modules, when a capability is available, and how locale is chosen are in [MODULES](MODULES.md). Copy lives in `resources/lang/en` and `resources/lang/vi`.

## Runtime

Development runs on the host. Docker supplies PostgreSQL and Mailpit. Production is one Node container plus PostgreSQL. There is no Redis, queue, scheduler, or search service. `/health` skips the database. `/health/ready` checks it. Tests use `honeychic_test` and an in-memory session store.

Stock, money, checkout, and cancellation rules are in [COMMERCE_RULES](COMMERCE_RULES.md).
