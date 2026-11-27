# HoneyChic engineering instructions

HoneyChic is a general-purpose commerce learning project for independent sellers and small to medium stores. Merchant identity is separate from platform identity. AI assists development; it is not the product.

Before meaningful work: inspect branch/status, read [ROADMAP](docs/ROADMAP.md), [ARCHITECTURE](docs/ARCHITECTURE.md), and relevant docs. Read [COMMERCE_RULES](docs/COMMERCE_RULES.md) before touching commerce; read [UI](docs/UI.md) before visual changes. Make a concise plan, then implement a bounded, runnable slice.

## Architecture

AdonisJS 7 + Lucid/PostgreSQL, Vue 3 + Inertia SSR, TypeScript, plain CSS with design tokens (no Tailwind), Phosphor, VineJS, Japa. npm. One monolith; no Nuxt or Filament.

- HTTP adapters: `app/http/controllers`, `app/http/middleware`.
- Core configuration/support: `app/core`.
- Business code grows into `app/domains/<domain>` as needed. Keep small domains flat; add `actions/`, `models/` or `queries/` only once a domain has several of them.
- Optional code grows into `app/modules/<module>`. Modules depend on core domains; never the reverse.
- Frontend shell/design: `inertia/app`; features/modules in feature folders; thin pages in `inertia/pages`.
- Do not create empty architecture folders.
- Admin routes are guarded as a group (`auth` + `admin`); owner-only actions still authorize `manageStore`. Request validation messages are global; do not pass a messages provider per call.

## Rules

- Commit with plain messages; do not add AI attribution trailers or Co-Authored-By lines.
- Do not introduce infrastructure without demonstrated need.
- Do not create giant generic service classes or repositories around Lucid. Prefer specific actions.
- Do not put core business workflows in controllers.
- Do not silently change commerce invariants: stock nonnegative; integer money; server totals; historical snapshots; atomic checkout; cancellation restores once; payment callbacks idempotent; order history survives deletion.
- Stock changes use AdjustInventory; catalog edits must preserve balances and cannot retire stocked variants. Checkout locks products and variants in ascending ID order; cancellation locks order then variant IDs. Cancellation may restore a retired variant; only negative corrections may then adjust its retired balance.
- Do not make core domains depend on optional modules.
- Do not hardcode user-facing EN-only strings. Both `en` and `vi` translations are required.
- Do not automatically translate merchant content.
- Do not add AI functionality unless explicitly requested.
- Do not generate excessive tests. Protect costly regressions, not coverage percentages.
- Do not rewrite `main`, remove the v1 tag, rename the remote repository, commit secrets, or run destructive production resets.

## Commands and verification

WSL Linux Node 24/npm 11+: `docker compose up -d`, `npm install`, `node ace migration:run`, `node ace db:seed`, `npm run dev`, then create the owner at `/welcome` (or `node ace owner:create`). Use a separate `DB_DATABASE` for throwaway previews.

Before tests, create honeychic_test; test boot refuses database names without _test. Never override tests to use merchant data. Registration cannot select roles. Owner/staff manage catalog; owner alone manages store settings; capability disablement must not lock out administration.

Use the smallest relevant checks while iterating. `npm run typecheck`, `npm run lint`, `npm run build`, `npm test` before meaningful milestones. Test commerce correctness/authorization when implemented; no test for every getter, component, or CSS edit.

HTTP tests check authorization, the locale of an error, and that a rejected request left the row unchanged. Domain tests own money, stock, and rollback. Do not raise the 30s functional suite timeout to hide a cold Vite start.

Screenshots in `docs/screenshots` must match the current UI and the demo catalog. Retake them in Edge when the storefront or admin layout changes, using a separate preview database; never reset the dev database to take them.

Follow [UI](docs/UI.md): ink/paper/honey tokens, a modern base with sparing nostalgic accents (soft gel buttons, titled windows), depth without flat Material or retro gloss, visible focus, semantic HTML, comfortable mobile targets. Storefront top navigation; catalog filters on desktop/drawer on mobile; admin persistent sidebar.

Docs are README, ARCHITECTURE, COMMERCE_RULES, OPERATIONS, UI, ROADMAP and MEDIA. Update the relevant one with meaningful changes; ROADMAP has exactly Now/Next/Later and its Now section is the current status. Say each fact once. Keep docs short and truthful.

Optional-module checkout work must preserve the transaction participant and order-first payment/cancellation locking. Read docs/ARCHITECTURE.md (optional features) and docs/OPERATIONS.md (security, deployment) when modifying module enablement or deployment. New payment methods register in `app/modules/payments/providers/index.ts`. Unpaid-order expiry always goes through CancelOrder. Fake payments must never be enabled by production runtime configuration.
