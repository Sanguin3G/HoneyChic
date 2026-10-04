# 003 — Modular monolith

**Decision:** One application with core domains and optional modules. Optional modules depend on core; never the reverse.

**Why:** Clear ownership without distributed deployment/transaction complexity. Create folders when real code needs them.

**Alternatives rejected:** Microservices, generic repository layers, CQRS frameworks, and a universal plugin engine add complexity without a demonstrated problem.
