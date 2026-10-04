# Status

Updated: 2026-10-05. **Core commerce and optional modules are implemented; production foundations exist. Review and launch work remain.** The original plan includes deferred work beyond these milestones; see ROADMAP.

## What exists and works

- Laravel v1 stays on `main` at the pushed `larastore-v1-final` tag (`3cad9fd`). The rewrite remains at `rewrite/honeychic-v2`. Stabilization continues on `stabilize/honeychic-mvp` and is not merged. The existing remote redirects to `Sanguin3G/HoneyChic`; that repository move predated this push. No repository rename was performed during this review.
- AdonisJS 7, Vue 3, Inertia SSR, PostgreSQL, Tailwind 4, Phosphor, VineJS and Japa. One monolith. No Redis, search engine, or AI provider.
- Accounts, store settings, catalog, inventory, session cart, guest/account checkout, historical orders and shared cancellation are in place. Low stock counts active variants with stock greater than zero and at or below the merchant threshold. Zero stock is out of stock, on both the dashboard and the inventory filter.
- The header language control is a globe button with an English / Tiếng Việt menu. It keeps the existing locale session and saved preference.
- Optional modules, off until the owner enables them: wishlist, reviews, coupons, shipping, cash on delivery, and a development-only fake payment. Stripe, VNPay and the assistant are not installed.
- Reviews and wishlist stay unavailable when customer accounts are off. A review needs one completed purchase of that product. One review per customer and product, and it can be edited.
- Checkout can add a shipping rate, coupon and payment method inside the order transaction. Orders store the discount, shipping name and coupon code. Core Orders does not import those modules.
- Cash on delivery stays unpaid until staff record collection after processing starts. Fake settlement cannot run in production. Repeating a payment event does not pay twice. A cancelled order cannot be paid, and a paid order cannot restore stock.
- Public pages have titles, descriptions, canonical URLs and social metadata. Product pages include structured data. Indexing and the sitemap stay off unless `NODE_ENV=production` and `SEO_INDEXABLE=true`.
- Production Dockerfile, Compose example, health checks, CSP and deployment/backup notes are in place. The root license is MIT. CI runs for `rewrite/honeychic-v2`, `stabilize/honeychic-mvp` and `main`.
- Order confirmation, shipped, and cancellation mail is sent after the order transaction commits. A mail failure is reported on the order and does not undo the order or stock. Guest emails include a hashed 7-day recovery link that can be opened again until it expires. Password reset uses a hashed one-hour token that cannot be reused. Mailpit is the development SMTP target. Delivery is skipped until `SMTP_HOST` and a sender address are set.
- Staff and owners can upload JPEG, PNG, WebP, and AVIF product images up to 5 MB. Files are stored by a generated `uploads/<uuid>` key on the Drive disk. The default disk is local `public/media`. S3-compatible settings are available and unused until `DRIVE_DISK=s3`. Replacing an image deletes the previous upload only after the product row commits, and only when no image still references it. Seeded `catalog/` files are kept. SVG uploads are rejected.
- The owner can set the store logo, favicon, description, public contact, https social links, and optional primary and accent colors. Null colors keep the default navy and orange tokens. Logo and favicon use the same disk and are deleted only after save, and only when no product image or brand field still references them. The storefront shows that public identity. Order prefix, stock threshold, and account flags stay off the public store props.

## Verification

- On 2026-10-04 the clean tree passed container migrations, typecheck, lint, production build and **77 Japa tests**. After the low-stock correction, the commerce-admin and inventory suites passed (12 tests). Storefront and admin were then opened in English and Vietnamese, at desktop and mobile widths. No concrete layout or interaction defect was changed. A refused Vite HMR socket on port 24678 came from the unpublished preview container port, not from the pages. Checks use an isolated database; no merchant data is used.
- New coverage includes coupon races, payment versus cancellation, review eligibility, wishlist bounds, and accounts-off module configuration.
- Playwright on Microsoft Edge verified the production image: guest shipping/coupon/COD checkout and cancellation, account checkout, wishlist, admin cash collection/retry, completed-purchase review submission, EN/VI, mobile layout, CSP, indexing/sitemaps and production fake-payment rejection. Browser fixtures used a separate test database. Existing storefront screenshots remain in `docs/screenshots/`.
- Host checks on the Windows-mounted tree are too slow to trust; the passing suite ran inside Docker against PostgreSQL. After order mail, typecheck, lint, and the full suite passed: **81 tests**. After image uploads, typecheck, lint, and the full suite passed again: **84 tests**. Edge opened an admin product, uploaded a PNG, saved it, loaded the file from `/media`, then removed it and confirmed the file was gone. After branding, typecheck, lint, and the full suite passed: **86 tests**. Edge signed in as the preview owner, uploaded a logo, saved contact, an https link, and a primary color, then confirmed the header image, footer, and color on desktop and mobile. Removing the logo restored the default icon and the uploaded file returned 404. `npm audit --omit=dev` reports 23 high findings after Drive: 22 from the braces chain, now also reached through `@adonisjs/mail` and `@adonisjs/drive`, and nodemailer 9.1.1. The suggested braces fix would downgrade Adonis. The nodemailer fixes are outside the mail package's declared range. No override is applied. The AWS SDK added no separate advisory.
- Reviewed 22 Markdown files and checked their local links. Removed empty Laravel/Filament directories; ignored local PHP runtime artifacts remain excluded from the application image. No unused Vue component was identified in the reference scan. This is not an exhaustive proof that all code is necessary.

## Still open

No email verification, refunds, returns, or unpaid-order expiry. Guest orders still leave the browser session after two hours; the emailed recovery link is the way back. Admin can rename customers, not change their email or role. There is no queue: a process crash after commit and before SMTP accepts the message can drop that email. The order itself remains. Local image uploads work; a container's `fs` disk is ephemeral, and no S3 bucket is provisioned. An upload that is never saved can remain on disk.

Checkout review clears selections for unavailable modules and recalculates the displayed charges. Submission still rejects stale choices under transactional capability checks. The review HTTP adapter passes only rating/body to persistence. A leftover static robots file was removed so the dynamic indexing policy takes effect.

Store profiles, a setup wizard, imports/exports, and other deferred items remain in ROADMAP. Checkout and module switches already live in settings.

The braces advisory `GHSA-vfj7-8cjw-p6xm` still has no patched release. Drive joins that chain. Nodemailer 9.1.1, pulled in by mail, has separate high advisories whose fixes are not in the declared 9.x range. Do not call the dependency tree clean. See [SECURITY](SECURITY.md).

No hosted staging deploy or restore drill on a real host yet. Local production images are not a backup test. The rewrite stays on its dedicated branch; `main` and the v1 tag are untouched.
