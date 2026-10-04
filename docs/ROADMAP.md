# Roadmap

## Now

Review and stabilize the rewrite on `stabilize/honeychic-mvp`, based on `rewrite/honeychic-v2`. Core commerce and first-party optional modules exist; production foundations exist. This does not mean the entire rewrite plan is finished or the application is ready for a merchant launch.

| Original phases | Current position | Work to close out |
| --- | --- | --- |
| 0–1: preservation and foundation | v1 preserved; Adonis/Vue/Inertia SSR foundation exists | Keep main/tag intact; verify clean-checkout commands and CI |
| 2: accounts and store configuration | Accounts, typed settings and capabilities exist | Complete merchant branding/contact settings; document account recovery limits |
| 3–4: catalog and inventory | Generic variants, media metadata, search and recorded stock exist | Preserve targeted integrity/concurrency checks; uploads are deferred |
| 5–6: storefront and cart | Responsive storefront, EN/VI and session cart exist | Review accessibility, interaction states and reusable controls as screens require them |
| 7–8: checkout and admin | Transactional orders, snapshots, cancellation and Vue admin exist | Verify real browser checkout/admin flows and session edge cases |
| 9: optional modules | Reviews, wishlist, coupons, shipping, COD and fake payment exist; recovery and Edge checkout flows verified | Keep capability/transaction regressions protected; real providers remain deferred |
| 10: production hardening | Docker, health/readiness, SEO, security and deployment guidance exist | Revalidate current checks, assess dependency advisories, exercise backups and staging |

Keep documentation consistent with actual behavior and the README illustrated with real screenshots. Keep reviewed commits on the rewrite branch before considering an MVP merge; no automatic merge to main. Revisit unused code as features evolve without deleting local credentials or runtime data.

## Next

- Launch preparation: transactional order/shipping mail, password recovery and verification where enabled, and emailed guest receipt recovery. Send notifications after committed commerce changes; a mail failure must not duplicate or undo an order.
- Choose a hosting provider, configure HTTPS/proxy trust and database TLS, deploy staging, and verify production migrations and readiness. Exercise an isolated PostgreSQL restore and record recovery steps; include uploaded media when uploads exist.
- Complete practical merchant settings: logo/favicon, description/contact/address, social links, theme colors and checkout options. Existing currency, locale, timezone, order prefix, stock threshold and capability settings remain typed.
- Add Simple seller / Standard store / Catalog only / Custom presets that initialize settings/capabilities, then a setup wizard over the same implementation. Do not make it a prerequisite for development.
- Add validated merchant image uploads when persistent storage is available. Keep relative media keys and document storage/backup behavior.

## Later

- CSV product import/export and order export after the product model stabilizes.
- Stripe/VNPay when a real provider is selected: signed, idempotent callbacks, explicit payment states and targeted tests. Carrier integrations only after simple shipping proves insufficient.
- Refunds, returns and unpaid-order expiry; document their inventory/payment semantics before implementation.
- Further account review/address/wishlist improvements as merchant workflows require them, richer staff permissions only for demonstrated workflows, and audit history for inventory, order status, refunds and publication.
- Improve useful analytics (collected revenue, average order value, top products and low stock) without a separate analytics platform.
- S3-compatible media storage, queues for mail/images/imports, and scheduled processes only when concrete workloads require them. Document why each process exists.
- Merchant-authored localized product content if needed; never automatic product translation. More UI primitives and compact browser flows as actual screens justify them.
- Optional assistant only on explicit request, disabled by default. Redis, external search, plugin infrastructure and external error tracking require demonstrated needs.
