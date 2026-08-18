# LaraStore

LaraStore is my second Laravel practice project: a deliberately small but polished e-commerce store built while I learn the TALL stack (Tailwind CSS, Alpine.js, Laravel, and Livewire).

It started as my rough first Laravel store. At this stage of my programming journey, the priority is not pretending it is production commerce; it is making the fundamentals work cleanly: a useful catalogue, a dependable cart, a realistic SQLite seed, a complete checkout loop, customer order history, and a small admin control room.

## What is here

- A responsive storefront with featured products, categories, search, sorting, stock filters, product details, reviews, and lightweight inline SVG icons.
- A session cart with quantity controls, stock validation, subtotal calculations, and a simple cash-on-delivery checkout.
- Transactional order creation with product and customer snapshots, stock adjustment, order status history, cancellation, and customer reviews.
- Livewire account pages for orders and profile settings.
- Livewire admin pages for products, categories, orders, customers, review moderation, and chatbot settings.
- A deterministic SQLite seed with an admin, sample customers, 12 products with fitting photography, realistic orders, stock movement, and seven approved reviews.
- A bottom-right shop assistant with local FAQ answers, rate limits, prompt-injection boundaries, and an optional OpenAI-compatible LLM fallback.
- CI that installs PHP and Node dependencies, builds Vite assets, migrates SQLite, and runs the feature suite.

## Screenshots

These are real browser captures from the local seeded application.

![LaraStore storefront](docs/screenshots/home.png)

![Product collection with filters](docs/screenshots/collection.png)

![Session cart and order summary](docs/screenshots/cart.png)

## Stack

- Laravel 12 and PHP 8.4+
- Livewire 3 for reactive pages and forms
- Tailwind CSS 4, Vite, and Alpine.js via Livewire's browser bundle
- SQLite for a portable practice database
- PHPUnit feature tests

## Run it locally

```bash
git clone https://github.com/Sanguine3/LaraStore.git
cd LaraStore

composer install
npm install
cp .env.example .env
php artisan key:generate
php -r "file_exists('database/database.sqlite') || touch('database/database.sqlite');"
php artisan migrate:fresh --seed
npm run build
php artisan serve
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000).

The seeded accounts are for local learning only:

| Account | Email | Password |
| --- | --- | --- |
| Admin | `admin@example.com` | `adminPassword123` |
| Customer | `maya@example.com` | `password` |

Change or remove these credentials before using the project anywhere public.

### Optional LLM chatbot

The assistant works without an API key using LaraStore's local FAQ responses. To enable the optional LLM fallback, sign in as the seeded admin, open `/admin/chatbot`, and enter an OpenAI-compatible API key, model, and base URL. The key is encrypted in SQLite, is never displayed after saving, and is only used server-side. You can also customize the system instruction there; application safety rules remain enforced.

The `.env.example` also contains an optional developer-only configuration path using `CHATBOT_LLM_API_KEY`. Leave it empty if you want FAQ-only mode.

## Development and checks

Run the backend and Vite watcher in separate terminals:

```bash
php artisan serve
npm run dev
```

Run the checks before committing:

```bash
php artisan test
npm run build
```

Tests use SQLite and the repository's seeded local database is intentionally separate from the test database. The project also works with the default Laravel mail log and queue/cache drivers for local practice.

## Honest limits

This is a learning project, not a production store. It has no payment gateway, shipping provider, image-upload pipeline, guest checkout, tax engine, coupon system, or deployment configuration. Product photography is loaded from remote image URLs, so an offline deployment should replace those URLs with local assets. The optional LLM assistant is deliberately bounded and cannot perform account or order actions. These omissions are deliberate: the useful e-commerce fundamentals are implemented first, and the code remains small enough to understand.

## Project report

See [docs/PROJECT_REPORT.md](docs/PROJECT_REPORT.md) for the rebuild notes, verification evidence, design decisions, and current limitations.

## License

This personal learning project is released under the MIT License.
