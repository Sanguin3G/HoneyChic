# Roadmap

## Now

`main` carries the HoneyChic rewrite; Laravel v1 is archived at the `larastore-v1-final` tag and release. Core commerce, the first-party optional modules, mail, uploads, merchant branding and production container foundations exist. HoneyChic is a base a shop sets up for itself, so the work now is making that setup easy and honest, not hosting it.

- Keep the owner's setup path short: environment file, migrations, owner creation, then the admin. Hosting, mail or SMS delivery and object storage stay the owner's choice behind environment configuration.
- Keep documentation consistent with actual behavior and the README illustrated with real screenshots.
- Do a human UI pass in a real browser (contrast, focus states, Vietnamese text length) whenever screens change.

## Next

- Store profiles (Simple seller / Standard store / Catalog only / Custom) that initialize settings and capabilities, then a setup wizard over the same implementation. Not a prerequisite for development.
- A documented extension point for additional mail or SMS channels, added when an owner has a concrete provider. SMTP is the only built-in channel.
- Email verification, if an owner needs it.
- Revisit dependency advisories when the upstream `braces` and `nodemailer` fixes land inside the declared Adonis ranges.

## Later

- CSV product import/export and order export after the product model stabilizes.
- Stripe/VNPay when a real provider is selected: signed, idempotent callbacks, explicit payment states and targeted tests. Carrier integrations only after simple shipping proves insufficient.
- Refunds, returns and unpaid-order expiry; document their inventory/payment semantics before implementation.
- Further account review/address/wishlist improvements as merchant workflows require them, richer staff permissions only for demonstrated workflows, and audit history for inventory, order status, refunds and publication.
- Improve useful analytics (collected revenue, average order value, top products and low stock) without a separate analytics platform.
- Queues for mail, image cleanup, and imports, and scheduled processes only when concrete workloads require them. Document why each process exists.
- Merchant-authored localized product content if needed; never automatic product translation. More UI primitives and compact browser flows as actual screens justify them.
- Optional assistant only on explicit request, disabled by default. Redis, external search, plugin infrastructure and external error tracking require demonstrated needs.
