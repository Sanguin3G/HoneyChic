# Changelog

## Unreleased

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
