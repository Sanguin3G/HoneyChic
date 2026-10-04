# Architecture

## Current application

One AdonisJS 7 application serves Vue 3 through Inertia. Vite builds browser assets and an SSR bundle; SSR runs in the web process. Lucid accesses PostgreSQL. Session authentication uses the framework's session guard and scrypt AuthFinder mixin. Shield protects state-changing requests.

Request flow: router → session/CSRF/auth initialization → persisted store context → Bouncer/locale context → controller → Vine validator → specific action/model → Inertia response.

Authentication controllers adapt framework login/logout operations. Customer creation lives in `domains/customers/actions/register_customer`. Settings validation and updates live in `core/store`. HTTP input never supplies a role or an arbitrary profile target.

## Boundaries

Core domains: Catalog, Cart, Orders, Inventory, Customers, Store configuration. Specific actions, queries, validators, data and models belong to their domain. Create folders as code appears; no generic repositories around Lucid.

Optional modules: Reviews, Coupons, Payments, Shipping, Wishlist, Assistant. Modules may depend on core domains. Core domains never depend on optional modules or provider SDKs. Enablement controls behavior, never migration history.

`core/capabilities` combines implementation facts with merchant preferences. Its installed/enabled/configured/available snapshot is shared with Vue and enforced on the server. Bouncer abilities centralize admin access (owner/staff) and settings management (owner only).

## Catalog slice

Catalog controllers validate and authorize; CreateProduct, UpdateProduct and SaveCategory own persistence. Product updates lock the product/variants and reconcile options, images and active variants atomically. Omitted variants are retired, retaining their identity and SKU. Catalog edits preserve inventory balances and reject retirement with remaining stock. Stock mutations remain in Inventory; checkout and cancellation live in Orders.

SearchCatalog applies publication/category visibility and parameterized PostgreSQL full-text/name/SKU search. Explicit data objects control public and editor props. The pure shared/money module uses BigInt decimal conversion and exact Intl formatting in both backend and frontend; stored safe integer minor units never use floating-point price arithmetic.

Local product media records relative keys; the current public/media mapping is explicit in product data. Upload handling and an S3-compatible storage mapping remain later work. Core catalog depends on no optional module.

## Inventory slice

AdjustInventory locks one variant, validates the signed quantity/reason and writes stock plus its movement in one transaction. It can join a caller transaction so checkout does not commit stock separately from an order. PlaceOrder locks products and variants in ascending ID order, consistent with catalog writers. CancelOrder locks the order then its variants in ascending ID order.

Inventory depends on Catalog variant identity and Customers actor identity; it has no optional-module dependency. The manual HTTP adapter derives actor from the authenticated session and permits only manual reasons. Movement reads use explicit data; no edit/delete endpoint is exposed. Public catalog props share availability only, while authorized inventory screens show balances/history.

## Store and locale

The singleton store-settings row uses explicit typed columns. Environment `STORE_*` values initialize it through an idempotent seeder; subsequent merchant edits come from PostgreSQL, not environment variables. Public shared props omit contact/internal settings.

Locale priority: explicit session selection → authenticated user preference → weighted supported Accept-Language → store default → English. Selection is persisted to the authenticated user and session. Redirect destinations are restricted to known local route shapes, including catalog/product editors.

Feature JSON dictionaries live under `resources/lang/en|vi`. Selected dictionaries are shared per request; SSR has no mutable global user/locale state. Merchant content is never translated automatically.

## Frontend

`inertia/app` contains layouts, navigation, design and shared support. `inertia/features/account|settings|catalog|inventory|storefront|cart|orders` contains cohesive form/capability components. `inertia/pages` composes storefront, account, admin and error pages.

Standard Inertia URL links are sufficient here; no generated route SDK is required. Storefront uses top navigation, account uses a small sidebar, admin uses persistent desktop navigation with collapsible mobile navigation. All share the same primitives.

## Infrastructure

Development runs directly in WSL; Docker supplies PostgreSQL and Mailpit. Production is one Node container plus PostgreSQL. Authentication throttling uses the existing PostgreSQL database; tests use memory. No Redis, object store, search service, queue worker, scheduler or AI provider is required.

Health liveness bypasses store/database loading; readiness queries PostgreSQL. Test boot refuses database names without the `_test` suffix. Functional mutations roll back between tests. Japa uses the framework memory session store; development/production use encrypted cookie sessions and receive a separate real-cookie smoke check.

## Storefront composition

Home composes merchant branding, active categories and publication-aware product previews. Catalog uses SearchCatalog for search, category and available-stock filtering. These availability reads do not reserve stock.

Feature components under inertia/features/storefront and catalog compose thin pages. Desktop filters and the native dialog drawer share draft state; applying commits URL filters and resets pagination. Locale switching preserves whitelisted local query parameters. Product options resolve to an offered variant; price and availability follow that variant. Gallery selection is local presentation state. Native dialog supplies modal focus, Escape and focus restoration.

The browser root watches shared locale props to synchronize document language, including same-URL POST redirects. SSR sets the initial language through the Edge layout.

## Cart slice

Cart depends on Catalog and reads variant stock; it has no optional-module dependency or inventory writes. ChangeCartQuantity owns quantity, visibility, currency, capacity and amount validation. HTTP controllers validate input and adapt the session; readCart resolves current models into explicit public data.

The encrypted two-hour cookie holds a currency and at most 12 compact [variant ID, quantity, original unit price] tuples. It stores no product text, media or totals. Every view reprices from PostgreSQL. The header count reads only bounded session state. No cart table or account cart merge exists. Login/logout keep the browser cart. Concurrent cookie-session writes use last-response-wins semantics; checkout must independently validate/lock authoritative records.

Frontend cart forms and rows live under inertia/features/cart; the thin cart page composes them. Product option selection supplies the server variant ID, never a price.

## Orders and administration

CheckoutController stores a session-owned submission token and bounded review of current unit prices/quantities. PlaceOrder serializes retries with a PostgreSQL transaction advisory lock and unique checkout key. It reads capabilities under a store lock, locks products/categories/variants, validates availability and every reviewed price, snapshots checkout/item data and records stock deductions in the same transaction. Client totals are comparison-only, never authority.

CancelOrder is shared by customer and admin adapters. Its locked state check and restorations commit together; ChangeOrderStatus owns allowed fulfillment transitions. Customer queries scope by account; guest receipts scope by the last guest order in the encrypted session. Explicit DTOs omit internal IDs/submission keys. Saved addresses remain separate customer data; checkout stores an independent copy.

Admin uses the same Vue architecture and existing catalog/inventory editors. Dashboard queries report order value per currency, not collected revenue. Staff read/manage orders and customer names; owner alone changes typed store/capability settings and module configuration. No role/password mutation lives in admin.

## Optional modules and launch foundations

Reviews, Wishlist, Coupons, Shipping and Payments live under app/modules with feature UI under inertia/modules. HTTP adapters compose them; domains import no module. CheckoutParticipation has only quote and created hooks within the existing transaction. Product/variant locks precede shipping reads/coupon locks; coupon redemption and payment creation roll back with stock/order. Payment settlement locks order then payment, matching cancellation.

Public metadata uses an environment-owned origin, never Host/request input. Product/Breadcrumb JSON-LD uses exact currency prices and escapes raw script delimiters. Sitemaps share catalog visibility and use bounded batches. Indexing requires production plus SEO_INDEXABLE. No mail worker, scheduler, upload endpoint or provider infrastructure was introduced.
