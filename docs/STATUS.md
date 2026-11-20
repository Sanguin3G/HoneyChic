# Status

Updated: 2026-11-20. Core commerce, manual refunds/returns, and the optional modules are implemented. Merchant launch setup is not.

## Implemented

Accounts, owner/staff admin, store settings, catalog and variants, recorded inventory, a session cart, guest and account checkout, historical orders, manual refunds (`RecordRefund`), and product returns (`RecordReturn`). Stock, integer money, snapshots, and checkout locking follow [COMMERCE_RULES](COMMERCE_RULES.md).

English and Vietnamese interface text. Merchant content is not translated. Wishlist, reviews, coupons, shipping, and cash on delivery default off. The fake gateway is development and test only. Stripe, VNPay, and an assistant are not installed. Store profiles on /admin/modules apply Simple seller, Standard store, or Catalog only. Custom records the name and leaves the flags unchanged. Saving diverging account/checkout flags on /admin/settings also marks a preset custom. An optional setup wizard at /admin/setup uses those same actions.

Order mail is sent after the order commits. Password reset and guest recovery use hashed, expiring links. Uploads accept JPEG, PNG, WebP, and AVIF up to 5 MB. Local media or S3-compatible storage is selected with `DRIVE_DISK`.

## Still open

No unpaid-order expiry or CSV product import. Unpaid-order expiry rules are written in COMMERCE_RULES and are not built. Order CSV download is on the admin orders page. A new customer confirms their email when SMTP can send mail. No mail queue. Guest sessions last two hours. Cookie sessions cannot be revoked from one place. Container-local uploads disappear without a volume. Production `npm audit --omit=dev` still reports high findings in framework dependencies. See [SECURITY](SECURITY.md).

Checked in this checkout on 2026-11-20. Typecheck (`tsc`, `vue-tsc`), ESLint, `npm run build` (client + SSR + TypeScript), EN/VI translation key parity, and `node ace migration:run` (applying `1781400000000_create_order_refunds_and_returns`) passed. In the Japa suite against `honeychic_test`, 97 of 98 tests passed (including the new settings-profile, refund, and return tests); the first HTTP test (`customer order history is scoped and another account cannot view or cancel the order`) timed out at 1m while Vite SSR started cold, with no assertion failures. Microsoft Edge retook `docs/screenshots/setup.png` and `docs/screenshots/setup-vi.png` against the production server build in English and Vietnamese, and the demo shop stayed Demo Supply, VND, prefix HC, profile custom, owner locale en, zero customers, and order HC-000001 pending and unpaid.
