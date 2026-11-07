# Roadmap

## Now

HoneyChic is a base a shop sets up for itself. Core commerce, the optional modules, mail, uploads, branding, store profiles, and the production container are in place. Laravel v1 stays at the `larastore-v1-final` tag.

- Keep the owner's setup path short: environment file, migrations, owner creation, then the admin. Hosting, SMTP, and object storage stay the owner's choice.
- Keep the docs and the README screenshots matched to the running shop.
- When a screen changes, check it in a real browser: contrast, focus, and Vietnamese text length.

## Next

- Another mail channel or SMS when the owner names a provider. SMTP is built in. A new customer confirms their email when that mail can be sent.
- Revisit the `braces` and `nodemailer` advisories when a patched release exists inside the declared Adonis ranges. Do not run `npm audit fix --force`.

## Later

- CSV product import and export after the product model stabilizes. Order CSV download is already on the admin orders page.
- Stripe/VNPay when a real provider is selected: signed, idempotent callbacks, explicit payment states and targeted tests. Carrier integrations only after simple shipping proves insufficient.
- Refunds, returns and unpaid-order expiry follow the rules in COMMERCE_RULES. They are not built.
- Further account review/address/wishlist improvements as merchant workflows require them, richer staff permissions only for demonstrated workflows, and audit history for inventory, order status, refunds and publication.
- Collected revenue stays inside the current admin. The overview already shows non-cancelled order value, its average, top products by the saved line name and value, and low stock. Do not call those figures collected revenue.
- Queues for mail, image cleanup, and imports, and scheduled processes only when concrete workloads require them. Document why each process exists.
- Merchant-authored localized product content if needed; never automatic product translation. More UI primitives and compact browser flows as actual screens justify them.
- Optional assistant only on explicit request, disabled by default. Redis, external search, plugin infrastructure and external error tracking require demonstrated needs.
