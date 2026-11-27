# Roadmap

## Now

Working today: catalog with variants and recorded stock; session cart; guest and account checkout; order history with snapshots; cancellation, manual refunds and returns; unpaid-order expiry; reviews, wishlist, coupons, shipping and cash on delivery as switchable features; order mail, password reset, email confirmation and guest order links; local or S3 uploads; CSV product import/export and order CSV; store branding; first-run owner setup in the browser; English and Vietnamese.

Known limits: mail has no queue; cookie sessions cannot be revoked centrally; guest sessions last two hours; no real payment gateway is installed.

## Next

- A real payment provider (Stripe or VNPay) when a shop picks one: signed, idempotent callbacks and provider refunds through the existing checks.
- CSV import that can update existing products without touching stock balances.
- Audit history for order status, refunds and catalog publication.

## Later

- SMS or another mail channel once a provider is chosen.
- Merchant-written translations of product text (never automatic).
- Richer staff permissions, carrier integrations and a mail queue, each only when a shop needs them.
