# 004 — Vue and Inertia SSR

**Decision:** Vue 3 pages use Inertia and server-side rendering within AdonisJS.

**Why:** One route/application architecture supports both storefront and admin. SSR supplies initial public HTML without an independent API/frontend deployment.

**Alternatives rejected:** Nuxt or a separate SPA/API would duplicate routing/infrastructure. A second admin frontend stack creates avoidable maintenance.
