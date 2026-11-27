# Changelog

## Unreleased

- Redesigned storefront and admin: ink, warm paper and honey replace navy and orange; light toolbar header, titled windows, framed hero photo, photo category tiles, buy box, source-list admin sidebar, iOS-style switches, receipt-style order views. Tailwind removed in favor of plain CSS tokens.
- Added unpaid-order expiry: owner-set lifetime, `ExpireUnpaidOrders` through `CancelOrder`, in-process timer (`ORDER_EXPIRY_MINUTES`) and `node ace orders:expire`.
- Added CSV product export and import (new products only, all-or-nothing, initial stock recorded).
- Added first-run owner setup at `/welcome` with a setup code from the server log or `node ace owner:code`; the store row is created on first request.
- Added a payment provider registry so a new gateway is one class and one entry.
- Production compose migrates on start and keeps uploads on a volume.
- Merged Features and module configuration into one page; Setup moved under Store settings.
- Simplified code: flattened single-file domain folders, one admin route guard, global validation messages.
- Consolidated docs into README, Architecture, Commerce rules, Operations, UI and Roadmap.
- Fixed Setup Wizard footer link separators, synced `storeProfile` when account/checkout flags diverge on `/admin/settings`, wrapped `SetupController.store` in a single transaction, and added active shipping-rate guidance on Setup, Modules, and Checkout.
- Formatted money and percentage previews/listings in `/admin/module-configuration` (`ShippingRates` and `CouponSettings`).
- Added manual refunds (`RecordRefund`) and product returns (`RecordReturn`) with migration, domain actions, idempotent per-order references, retired-variant return restoration, bilingual EN/VI copy, and admin order forms.
- Added store profiles, an optional setup page, order CSV download, and overview average and top products from non-cancelled snapshots.
- A new customer confirms email with one hashed link when SMTP can send. Existing accounts, the owner, and staff are not asked.
- Fixed comma-separated trusted proxy configuration and covered explicit trust boundaries.
- Restored field validation messages after Inertia form redirects.
- Enforced readable merchant primary colors; improved focus contrast on dark storefront navigation.
- Protected asynchronous password reset against waiting on SMTP.
- Replaced new demo illustrations with locally served, licensed photos and refreshed Edge screenshots.
- Removed obsolete Laravel runtime files and stale setup/provider documentation.

- Reviewed rewrite completion claims and restored deferred work to the Now/Next/Later roadmap.
- Reorganized the README with an overview, collapsible screenshot gallery and documentation index.
- Corrected stale admin/design/UI documentation and recorded the checkout module-disablement gap.
- Fixed checkout recovery after module disablement, review HTTP payload mapping and static robots shadowing; verified production checkout/admin/module flows in Microsoft Edge.
- Removed unused bilingual foundation-preview dictionaries and empty Laravel directories.

## 0.10.0

- Globe language dropdown, optional wishlist/reviews/coupons/shipping/COD and development-only fake payments.
- Atomic optional checkout participation, historical charge snapshots and idempotent settlement.
- Production SEO/CSP/throttling, production environment/Compose and deployment/backup/security guidance.

## 0.8.0 — Commerce admin

- Custom Vue/Inertia order search/status controls, customer profiles/history and dashboard.
- Owner-only checkout/account capabilities; unavailable modules remain unavailable.
- Collapsible mobile admin navigation and bilingual forms.

## 0.7.0 — Checkout and orders

- Guest/account checkout, saved addresses, integer server totals and per-line price review.
- Atomic ordered stock locks, sale movements and historical order/customer snapshots.
- Retry-safe submission keys, private session-scoped guest receipts and customer order history.
- Shared atomic cancellation with one inventory restoration; fulfillment and payment remain separate.
- Focused concurrency, historical truth, rollback and authorization tests.

## 0.6.0 — Session cart

- Guest/account session carts with add, quantity update, remove and clear.
- Variant-aware lines, current server prices, original-price notices and availability checks without reserving stock.
- Single-currency totals with integer overflow protection and bounded cookie payloads.
- EN/VI cart forms, responsive summary and header count; targeted commerce/session tests.

## 0.5.0 — Storefront

- Merchant home and responsive navy/orange navigation with bilingual search.
- Desktop catalog filters, mobile modal drawer and stock-availability filter.
- Product gallery and generic variant selection with authoritative display prices.
- Locale switching preserves approved local catalog query parameters.

## 0.4.0 — Inventory

- Variant-owned nonnegative stock and recorded movements with delta, resulting balance, reason, reference, actor and timestamp.
- AdjustInventory locks the variant and commits stock/history together, including caller-transaction support.
- Bilingual owner/staff adjustment screens, movement history and configurable low-stock filters.
- Public availability indicators without exposing exact stock counts.
- Catalog edits preserve balances and refuse to retire variants with remaining stock.
- Targeted inventory integrity, authorization and independent-connection concurrency tests.

## 0.3.0 — Catalog

- Generic categories, products, default/option-based variants, SKU and publication state.
- Exact integer pricing with currency-aware decimal input and display.
- Atomic catalog actions, retained variant identities and reserved retired SKUs.
- Ordered multi-image metadata and development-only mixed demo products with local illustrations.
- Parameterized PostgreSQL search, bilingual public product/catalog pages and staff catalog editors.
- Targeted catalog integrity/authorization tests and updated engineering docs.

## 0.2.0 — Accounts and store configuration

- Session login/logout and optional customer registration, with hashed passwords and PostgreSQL-backed auth throttling.
- Owner/staff/customer roles, Bouncer abilities, owner-only store settings and secure initial-owner command.
- Explicit persisted store settings with idempotent initialization; merchant identity remains separate from HoneyChic.
- Persisted user language preference, bilingual account/settings/validation/error screens and safe locale redirects.
- Central installed/enabled/configured/available capabilities; account disablement enforced on existing sessions.
- Responsive account/admin shells and input/notice primitives.
- Isolated PostgreSQL tests, CI database separation and updated development/deployment documentation.

## 0.1.0 — Foundation

- Preserved Laravel v1 with the pushed larastore-v1-final tag; started rewrite/honeychic-v2.
- Fresh AdonisJS 7/Vue/Inertia SSR foundation with PostgreSQL, Tailwind 4 and Phosphor.
- EN/VI locale/session support, translated preview/error pages and navy/orange design tokens.
- PostgreSQL/Mailpit Compose, health/readiness endpoints, non-root Dockerfile and foundation CI.
- Concise engineering docs and architectural decisions.
