# Roadmap

## Now

Review and stabilize the rewrite on `stabilize/honeychic-mvp`, based on `rewrite/honeychic-v2`. Core commerce and first-party optional modules exist; production foundations exist. This does not mean the entire rewrite plan is finished or the application is ready for a merchant launch.

| Original phases | Current position | Work to close out |
| --- | --- | --- |
| 0–1: preservation and foundation | v1 preserved; Adonis/Vue/Inertia SSR foundation exists | Keep main/tag intact; verify clean-checkout commands and CI |
| 2: accounts and store configuration | Accounts, typed settings, branding, and capabilities exist | Document account recovery limits; store profiles and a setup wizard remain deferred |
| 3–4: catalog and inventory | Generic variants, media metadata, search, recorded stock, and merchant image uploads exist | Preserve targeted integrity/concurrency checks; point uploads at durable storage before a hosted launch |
| 5–6: storefront and cart | Responsive storefront, EN/VI and session cart exist | Review accessibility, interaction states and reusable controls as screens require them |
| 7–8: checkout and admin | Transactional orders, snapshots, cancellation and Vue admin exist | Verify real browser checkout/admin flows and session edge cases |
| 9: optional modules | Reviews, wishlist, coupons, shipping, COD and fake payment exist; recovery and Edge checkout flows verified | Keep capability/transaction regressions protected; real providers remain deferred |
| 10: production hardening | Docker, health/readiness, SEO, security and deployment guidance exist | Revalidate current checks, assess dependency advisories, exercise backups and staging |

Keep documentation consistent with actual behavior and the README illustrated with real screenshots. Keep reviewed commits on the rewrite branch before considering an MVP merge; no automatic merge to main. Revisit unused code as features evolve without deleting local credentials or runtime data.

## Next

- Launch preparation still needs a chosen host. Transactional confirmation, shipped, and cancellation mail, password reset, and guest recovery links are in place. Email verification remains optional and is not implemented.
- Choose a hosting provider, configure HTTPS/proxy trust and database TLS, deploy staging, and verify production migrations and readiness. Exercise an isolated PostgreSQL restore and record recovery steps, including the merchant upload bucket or volume.
- Logo, favicon, description, public contact, social links, and optional primary/accent colors are stored with the existing settings. Checkout and module switches stay where they are. Store profiles and a setup wizard remain deferred.
- Add Simple seller / Standard store / Catalog only / Custom presets that initialize settings/capabilities, then a setup wizard over the same implementation. Do not make it a prerequisite for development.
- Point `DRIVE_DISK` at durable S3-compatible storage before hosted merchant uploads. The local disk is ephemeral in a container. Relative keys stay in the database.

## Later

- CSV product import/export and order export after the product model stabilizes.
- Stripe/VNPay when a real provider is selected: signed, idempotent callbacks, explicit payment states and targeted tests. Carrier integrations only after simple shipping proves insufficient.
- Refunds, returns and unpaid-order expiry; document their inventory/payment semantics before implementation.
- Further account review/address/wishlist improvements as merchant workflows require them, richer staff permissions only for demonstrated workflows, and audit history for inventory, order status, refunds and publication.
- Improve useful analytics (collected revenue, average order value, top products and low stock) without a separate analytics platform.
- Queues for mail, image cleanup, and imports, and scheduled processes only when concrete workloads require them. S3-compatible media settings already exist and stay unused until a host is chosen. Document why each process exists.
- Merchant-authored localized product content if needed; never automatic product translation. More UI primitives and compact browser flows as actual screens justify them.
- Optional assistant only on explicit request, disabled by default. Redis, external search, plugin infrastructure and external error tracking require demonstrated needs.
