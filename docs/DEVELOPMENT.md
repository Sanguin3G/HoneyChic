# Development

Use Linux Node 24, npm 11+, and Docker Compose inside WSL Debian. Do not run `npm install` with Windows Node in this checkout. Native packages are built for Linux.

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

The app is http://localhost:3333. Mailpit is http://localhost:8025. PostgreSQL is 127.0.0.1:5432. The example SMTP server is 127.0.0.1:1025. Mail is skipped when `SMTP_HOST` or the sender address is empty.

`owner:create` asks for a name, email, and a password of at least 12 characters. It creates only the first owner. Nothing seeds a password. The owner then opens `/admin/setup`. The README shows that page.

`STORE_*` fills the store row once. Later edits come from `/admin/settings`. Running the seeder again keeps existing settings.

## Reset and checks

`docker compose down -v` deletes the local database. On a new empty database, `node ace migration:fresh --seed` rebuilds it, then `node ace owner:create` makes the first owner. Do not run either against this checkout's `honeychic` database. It already has the owner and order HC-000001. Production never uses `migration:fresh`.

```bash
docker compose up -d --wait
docker compose exec postgres createdb -U honeychic honeychic_test
npm run typecheck
npm run lint
npm run build
npm test
```

`.env.test` points at `honeychic_test`. The test boot refuses any other database name. Japa migrates that database and rolls changes back between tests.

Browser checks use installed Microsoft Edge. Behavior rules are in [COMMERCE_RULES](COMMERCE_RULES.md). Visual rules are in [UI](UI.md).

## Laravel v1

`larastore-v1-final` is commit `3cad9fdb3745e89dd7445844051c710753df3ee0`. The ignored `.legacy-backup/laravel-v1` folder keeps the old source bundle, SQLite database, and environment. Those accounts and orders were not imported. The old key and bcrypt passwords do not work with the current scrypt auth.
