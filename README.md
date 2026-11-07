# HoneyChic

Configurable commerce for independent sellers and small shops. Built with **AdonisJS 7, Vue 3, Inertia SSR and PostgreSQL**.

HoneyChic is a self-hosted base for a shop: the owner chooses hosting, PostgreSQL, SMTP and media storage, then manages their own store name, currency and catalog. English and Vietnamese are supported throughout the interface. SMTP is built in; SMS is a future integration.

![HoneyChic storefront using the configurable Demo Supply store identity](docs/screenshots/home.png)

## What works today

Generic products and variants, recorded inventory movements, search, session cart, guest/account checkout, historical orders and a custom Vue admin. Reviews, wishlist, coupons, shipping and cash on delivery are optional. Store profiles on `/admin/modules` apply Simple seller, Standard store, or Catalog only. Custom keeps the current flags. A fake payment gateway is available in development only. An optional setup wizard is at `/admin/setup`. The admin orders page can download a CSV of the current filter. A new customer confirms their email when SMTP is configured.

**Merchant setup required:** production container foundations exist, but merchant launch work remains. Order mail, password reset, guest order recovery, and local image uploads are implemented. Hosted object storage is not provisioned. See [current status](docs/STATUS.md) and the [roadmap](docs/ROADMAP.md) before deploying.

<details>
<summary>More screenshots: products, administration and Vietnamese on mobile</summary>

### Product variants

![Product page with generic variant selection and currency-aware pricing](docs/screenshots/product.png)

### Administration

![Custom Vue admin with order metrics and persistent navigation](docs/screenshots/admin.png)

### Vietnamese on mobile

<img src="docs/screenshots/mobile-vi.png" width="390" alt="Vietnamese storefront in Microsoft Edge at a mobile width" />

### English / Tiếng Việt

The header globe opens the language menu. Merchant product content stays exactly as entered.

![Globe dropdown showing English and Vietnamese choices](docs/screenshots/language.png)

</details>

## Set up the shop

Sign in as the owner and open Setup at `/admin/setup`. Staff do not see this page.

Pick a profile, then confirm the shop name, currency, default language, timezone, and order prefix. Save. You can open Setup again later. Products and existing orders stay as they are. A currency change applies to new products only.

Simple seller turns on accounts and guest checkout. Standard store also turns on reviews, wishlist, coupons, and shipping. Catalog only turns checkout off. Custom changes no switches. Cash on delivery stays off.

The globe switches the interface between English and Tiếng Việt and stays on this page. Product text stays as entered. The default language in the form is the shop's language for new visitors, separate from the globe.

![Setup page for the Demo Supply shop in English](docs/screenshots/setup.png)

![Same setup page in Vietnamese](docs/screenshots/setup-vi.png)

## Run locally

Inside WSL Debian, with Linux Node 24, npm 11+ and Docker:

```bash
cp .env.example .env
docker compose up -d --wait
npm install
node ace generate:key
node ace migration:run
node ace db:seed
node ace owner:create
npm run dev
```

[Storefront](http://localhost:3333) · [Admin](http://localhost:3333/admin) · [Mailpit](http://localhost:8025)

The seeder adds a mixed demo catalog and no passwords. Demo products start at zero stock. After `owner:create`, add stock from `/admin/inventory`.

## Project notes

| Guide | Contents |
| --- | --- |
| [Status](docs/STATUS.md) / [Roadmap](docs/ROADMAP.md) | Implemented behavior, known gaps and planned work |
| [Development](docs/DEVELOPMENT.md) | Local setup, isolated tests and verification commands |
| [Architecture](docs/ARCHITECTURE.md) / [Modules](docs/MODULES.md) | Domain boundaries and optional capabilities |
| [Commerce rules](docs/COMMERCE_RULES.md) / [Database](docs/DATABASE.md) | Money, stock, snapshots, transactions and schema |
| [Deployment](docs/DEPLOYMENT.md) / [Security](docs/SECURITY.md) | Containers, migrations, backups and launch risks |
| [UI](docs/UI.md) | Navy/orange visual language and accessible interactions |

Demo photos are stored locally; see [photo sources and license](docs/MEDIA.md). Screenshots show the development demo shop in Microsoft Edge.

Laravel v1 is preserved at the unchanged `larastore-v1-final` tag. This checkout also has a private recovery archive; see [Laravel v1](docs/DEVELOPMENT.md#laravel-v1). The current application is on `main`.

License: MIT, as declared in `package.json`.
