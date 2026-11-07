# Status

Updated: 2026-11-07. Core commerce and the optional modules are implemented. Merchant launch setup is not.

## Implemented

Accounts, owner/staff admin, store settings, catalog and variants, recorded inventory, a session cart, guest and account checkout, and historical orders. Stock, integer money, snapshots, and checkout locking follow [COMMERCE_RULES](COMMERCE_RULES.md).

English and Vietnamese interface text. Merchant content is not translated. Wishlist, reviews, coupons, shipping, and cash on delivery default off. The fake gateway is development and test only. Stripe, VNPay, and an assistant are not installed. Store profiles on /admin/modules apply Simple seller, Standard store, or Catalog only. Custom records the name and leaves the flags unchanged. An optional setup wizard at /admin/setup uses those same actions.

Order mail is sent after the order commits. Password reset and guest recovery use hashed, expiring links. Uploads accept JPEG, PNG, WebP, and AVIF up to 5 MB. Local media or S3-compatible storage is selected with `DRIVE_DISK`.

## Still open

No refunds, returns, unpaid-order expiry, or CSV product import. Those refund, return, and expiry rules are written in COMMERCE_RULES and are not built. Order CSV download is on the admin orders page. A new customer confirms their email when SMTP can send mail. No mail queue. Guest sessions last two hours. Cookie sessions cannot be revoked from one place. Container-local uploads disappear without a volume. Production `npm audit --omit=dev` still reports high findings in framework dependencies. See [SECURITY](SECURITY.md).

Checked in this checkout on 2026-11-07. Typecheck passed. Profile, setup, cart, catalog, inventory, order CSV, overview, and email-confirmation HTTP checks passed against `honeychic_test`. The first HTTP test in a cold Japa process timed out while Vite started. No assertion failed. The full suite and the production build were not rerun. Edge showed setup, the overview, and the orders CSV in English and Vietnamese. The demo shop stayed Demo Supply, VND, prefix HC, profile custom, owner locale en, zero customers, and order HC-000001 pending and unpaid.
