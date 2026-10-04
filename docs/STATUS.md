# Status

Updated: 2026-10-04. **Core commerce and optional modules are implemented; production foundations exist. Review and launch work remain.** The original plan includes deferred work beyond these milestones; see ROADMAP.

## What exists and works

- Laravel v1 stays on `main` at the pushed `larastore-v1-final` tag (`3cad9fd`). HoneyChic work is on `rewrite/honeychic-v2`. The existing remote redirects to `Sanguin3G/HoneyChic`; that repository move predated this push. No repository rename was performed during this review.
- AdonisJS 7, Vue 3, Inertia SSR, PostgreSQL, Tailwind 4, Phosphor, VineJS and Japa. One monolith. No Redis, search engine, or AI provider.
- Accounts, store settings, catalog, inventory, session cart, guest/account checkout, historical orders and shared cancellation remain as in Phases 2–8.
- The header language control is a globe button with an English / Tiếng Việt menu. It keeps the existing locale session and saved preference.
- Optional modules, off until the owner enables them: wishlist, reviews, coupons, shipping, cash on delivery, and a development-only fake payment. Stripe, VNPay and the assistant are not installed.
- Reviews and wishlist stay unavailable when customer accounts are off. A review needs one completed purchase of that product. One review per customer and product, and it can be edited.
- Checkout can add a shipping rate, coupon and payment method inside the order transaction. Orders store the discount, shipping name and coupon code. Core Orders does not import those modules.
- Cash on delivery stays unpaid until staff record collection after processing starts. Fake settlement cannot run in production. Repeating a payment event does not pay twice. A cancelled order cannot be paid, and a paid order cannot restore stock.
- Public pages have titles, descriptions, canonical URLs and social metadata. Product pages include structured data. Indexing and the sitemap stay off unless `NODE_ENV=production` and `SEO_INDEXABLE=true`.
- Production Dockerfile, Compose example, health checks, CSP and deployment/backup notes are in place. Mail is documented but not sent yet.

## Verification

- Container typecheck, lint and **77 Japa tests** pass, including stale-selection recovery and HTTP review submission. Checks use an isolated database; no merchant data is used.
- New coverage includes coupon races, payment versus cancellation, review eligibility, wishlist bounds, and accounts-off module configuration.
- Playwright on Microsoft Edge verified the production image: guest shipping/coupon/COD checkout and cancellation, account checkout, wishlist, admin cash collection/retry, completed-purchase review submission, EN/VI, mobile layout, CSP, indexing/sitemaps and production fake-payment rejection. Browser fixtures used a separate test database. Existing storefront screenshots remain in `docs/screenshots/`.
- Host checks on the Windows-mounted tree are too slow to trust; the passing suite ran inside Docker against PostgreSQL. The production image build also completed. Its production install still reports 20 high-severity audit findings.
- Reviewed 22 Markdown files and checked their local links. Removed empty Laravel/Filament directories; ignored local PHP runtime artifacts remain excluded from the application image. No unused Vue component was identified in the reference scan. This is not an exhaustive proof that all code is necessary.

## Still open

No transactional mail, password recovery, guest-receipt email, refunds, returns, unpaid-order expiry, uploads or S3. Guest receipts still live only in the current session. Admin can rename customers, not change their email or role.

Checkout review clears selections for unavailable modules and recalculates the displayed charges. Submission still rejects stale choices under transactional capability checks. The review HTTP adapter passes only rating/body to persistence. A leftover static robots file was removed so the dynamic indexing policy takes effect.

Full merchant branding settings, store profiles/setup, imports/exports and other deferred items remain in ROADMAP.

The braces advisory `GHSA-vfj7-8cjw-p6xm` still has no patched release. Do not call the dependency tree clean. See [SECURITY](SECURITY.md).

No hosted staging deploy or restore drill on a real host yet. Local production images are not a backup test. The rewrite stays on its dedicated branch; `main` and the v1 tag are untouched.
