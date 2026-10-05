# Status

Updated: 2026-10-05. **Core commerce and optional modules are implemented. Merchant setup and launch review remain.** See [ROADMAP](ROADMAP.md) for deferred work.

## Implemented

- Remote main carries the AdonisJS 7, Vue 3, Inertia SSR, PostgreSQL, Tailwind 4 and Phosphor application. Laravel v1 remains at the larastore-v1-final tag (3cad9fd) and release. The existing remote redirects to Sanguin3G/HoneyChic; it was not renamed during this work.
- HoneyChic is a self-hosted base for an independent seller or store. The owner chooses hosting, SMTP, media storage, proxy trust and backups. No hosted deployment is provisioned. SMTP is the only built-in delivery channel; SMS is not implemented.
- Accounts, owner/staff administration, store settings, generic catalog/variants, recorded inventory, session cart, guest/account checkout, historical orders and shared cancellation work. Stock, integer money, snapshots, ordered locks and checkout atomicity follow [COMMERCE_RULES](COMMERCE_RULES.md).
- EN/VI interface text and persisted locale selection are available throughout. Merchant content is not translated. The globe language menu supports keyboard movement and Escape focus restoration.
- Optional wishlist, reviews, coupons, shipping and COD default off. Reviews require a completed purchase; wishlist/reviews require accounts. The fake gateway is development/test only. Stripe, VNPay and an AI assistant are not installed.
- Checkout module participation commits order, stock, coupon redemption and payment records together. Settlement locks the order first and is idempotent. Paid orders cannot restore stock through cancellation.
- Public metadata, product structured data and sitemaps exist. Indexing requires production and SEO_INDEXABLE=true. CSP, health/readiness, auth throttling and production Docker/Compose examples are in place.
- Confirmation, shipped and cancellation mail runs after order commit. Password reset uses hashed, single-use one-hour tokens; requests do not await SMTP. Guest recovery links are hashed and valid for seven days. Missing sender/SMTP configuration skips delivery.
- Owner/staff image uploads accept JPEG, PNG, WebP and AVIF up to 5 MB. Drive supports local media or owner-configured S3-compatible storage. Generated uploads are removed after commit only when no product or brand field references them; SVG uploads are rejected.
- Merchant identity supports logo, favicon, public contact, https social links and optional colors. Inertia shares validation errors after rejected form submissions. Primary colors must provide at least 4.5:1 contrast with white text. Dark storefront navigation uses a white focus outline.
- New development seeds use local placeholder photos with documented [sources and license](MEDIA.md). Old catalog SVG keys remain available for existing references. Seeds never overwrite merchant changes or invent stock.

## Verification

- On 2026-10-05, Linux Node 24 inside Docker passed typecheck, lint, production build and **88 Japa tests** against isolated honeychic_test. New regression checks cover blocked SMTP delivery, unreadable primary colors and comma-separated IPv4/IPv6/CIDR proxy trust.
- Playwright using Microsoft Edge tested the production image on loopback port 3337 with a separate honeychic_finish_test database. Guest add/cart/checkout/receipt/cancellation, customer account pages, admin catalog/inventory/orders/settings/modules, EN/VI desktop/mobile, language controls and the mobile filter dialog passed. The final scan reported no page-width overflow, broken loaded images or browser console errors. Captures were visually inspected; README screenshots use demo fixtures.
- Earlier production verification covered shipping/coupon/COD, account checkout, wishlist, completed-purchase reviews, cash collection retries, CSP/indexing, production fake-payment rejection, image upload/removal and branding. A local pg_dump restore into a second database was checked on 2026-10-05; each owner must repeat the restore drill on their chosen host.
- Obsolete untracked Laravel dependencies, caches, logs and build output were removed after confirming no current runtime references. Removed 468 obsolete temporary tooling entries; retained current dependencies, Node/browser tooling and verification evidence. Tracked source contains no Laravel PHP application files. The original source, complete v1 history, SQLite database and environment are preserved in the ignored private `.legacy-backup/laravel-v1` archive with verified checksums; the original tag is unchanged. Legacy data matched seeded fixtures, so no demo accounts, orders or balances were merged into the current store. See [recovery notes](DEVELOPMENT.md#laravel-v1-recovery).

## Remaining limits

- No email verification, refunds, returns, unpaid-order expiry, setup wizard or CSV import/export. These remain planned rather than implied complete.
- Guest sessions expire after two hours; emailed recovery links provide later access. Cookie sessions have no central revocation. Administration can rename customers, not change their email or role.
- No mail queue exists. A process crash can drop delivery after commit; it does not undo an order. Removing SMTP latency reduces reset timing leakage, but token persistence still adds database work for existing accounts, so identical response timing is not guaranteed.
- Container-local media needs a persistent volume. No S3 bucket is provisioned, and unsaved uploads may remain on disk.
- Production dependency audit still reports **23 high findings**, no critical findings, with no overrides or framework downgrade. See [SECURITY](SECURITY.md).
- Proxy list parsing is tested, but HTTPS proxy trust, database TLS, backups and restore must still be exercised on the owner's real host. No public deployment was made.
