# Security review

Reviewed 2026-10-04.

## Protections and boundaries

Framework scrypt/session auth, Vine validation, Bouncer owner/staff boundaries, CSRF on every mutation, parameterized SQL, scoped account/guest orders, safe integer amounts and transactional stock remain in place. Registration cannot select roles. Public shared props omit credentials/internal store settings. No upload endpoint or real payment webhook exists.

Production CSP follows [Shield documentation](https://docs.adonisjs.com/guides/security/securing-ssr-applications): self/nonce scripts, self images/fonts/connections, no objects/frames, same-origin forms. Inline styles remain permitted for Vue controls. Structured data escapes less-than characters before raw script insertion. Merchant text/reviews otherwise use escaped Vue interpolation.

Fake settlement is blocked by both central capability configuration and the provider in production. COD requires administration and eligible fulfillment status. Payment settlement locks the order before payment, validates amount/currency/reference and never updates inventory or fulfillment. Paid/cancelled races serialize on the order lock. Future real callbacks must authenticate provider signatures before calling settlement; never expose the internal action as an unsigned public webhook.

## Dependency finding

Re-checked 2026-10-04 with `npm audit --omit=dev`: 20 high findings and no critical findings. All of them are [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), braces through 3.0.3, reached through fast-glob and `@adonisjs/assembler`. The advisory lists no patched release. `npm audit fix --force` would install `@adonisjs/assembler@5.9.6`, which downgrades the Adonis 7 stack. No override is applied.

The application does not accept user-supplied glob/brace patterns. Catalog search is bounded text used in parameterized PostgreSQL queries. This reduces the direct application attack surface; it does not establish that every framework path is unreachable. Track the upstream patch and rerun npm audit --omit=dev before public launch. Do not describe the dependency tree as clean.

## Remaining launch work

Choose/configure HTTPS proxy trust and a host, verify database TLS/backups on that host, perform a restore drill, resolve or explicitly assess the upstream dependency risk, and add transactional mail/password recovery/verification before a real merchant launch. Cookie sessions lack central revocation; guest receipts expire with the latest-order session. Refunds/returns and unpaid-order expiry are not implemented.

No secrets belong in Git, screenshots or logs. No external error tracker or observability infrastructure is required.
