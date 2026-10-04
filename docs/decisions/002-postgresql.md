# 002 — PostgreSQL

**Decision:** Use PostgreSQL locally, in CI, and in production through Lucid.

**Why:** Transactions, row locking, relational constraints, and built-in search support practical commerce correctness.

**Alternatives rejected:** SQLite-only development would miss PostgreSQL behavior. External search and Redis are unnecessary for the current scope.
