# LaraStore

LaraStore is my first small Laravel e-commerce project. It is intentionally simple: a Blade and Alpine.js storefront with a session cart, checkout flow, customer orders, and a small admin area for managing products, categories, users, and order status.

The current code reflects an early stage of my programming journey. The goal is a working learning project with the original rough visual style kept intact.

## Features

- Public product browsing with search, category filtering, sorting, and pagination
- Authenticated customer dashboard, cart, checkout, and order history
- Session-based cart with stock checks
- Admin product, category, user, and order management
- Order status changes with stock adjustment
- Blade, Alpine.js, Tailwind CSS, Vite, and Grid.js
- PHPUnit feature tests

## Requirements

- PHP 8.4+
- Composer
- Node.js 18+
- SQLite (the default setup) or another Laravel-supported database

## Local setup

~~~
git clone https://github.com/Sanguine3/LaraStore.git
cd LaraStore

composer install
npm install

cp .env.example .env
php artisan key:generate
php artisan migrate --seed
npm run build
php artisan serve
~~~

Open [http://127.0.0.1:8000](http://127.0.0.1:8000).

The seeded admin account is:

- Email: admin@example.com
- Password: adminPassword123

Change or remove that account before using the project anywhere public.

## Development

Run the backend and Vite watcher in separate terminals:

~~~
php artisan serve
npm run dev
~~~

Or use the Composer helper:

~~~
composer run dev
~~~

## Checks

~~~
php artisan test
npm run build
~~~

PHPUnit uses an in-memory SQLite database, so tests do not require a running MySQL server.

## Project notes

This repository is a learning project, not a production-ready store. Payments are represented by the current payment-method field, email confirmation uses Laravel's configured mailer, and product images are stored as URLs. The design is intentionally left close to the original project while the core flows are kept dependable.

## License

This project is for personal learning and is released under the MIT License.