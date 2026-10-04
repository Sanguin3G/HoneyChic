# HoneyChic

Configurable commerce for independent sellers and small shops. Built with **AdonisJS 7, Vue 3, Inertia SSR and PostgreSQL**.

HoneyChic is the platform; merchants use their own store name, currency and catalog. English and Vietnamese are supported throughout the interface.

![HoneyChic storefront using the configurable Demo Supply store identity](docs/screenshots/home.png)

## What works today

Generic products and variants, recorded inventory movements, search, session cart, guest/account checkout, historical orders and a custom Vue admin. Reviews, wishlist, coupons, shipping and cash on delivery are optional. A fake payment gateway is available in development only.

**Rewrite in progress:** production container foundations exist, but merchant launch work remains. Transactional mail, password recovery and merchant uploads are not implemented. See [current status](docs/STATUS.md) and the [roadmap](docs/ROADMAP.md) before deploying.

<details>
<summary>More screenshots: product page and language menu</summary>

### Product variants

![Product page with generic variant selection and currency-aware pricing](docs/screenshots/product.png)

### English / Tiếng Việt

The header globe opens the language menu. Merchant product content stays exactly as entered.

![Globe dropdown showing English and Vietnamese choices](docs/screenshots/language.png)

</details>

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

Laravel v1 is the `larastore-v1-final` tag. This work is on `rewrite/honeychic-v2`.

License: MIT, as declared in `package.json`.
