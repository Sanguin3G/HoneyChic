# Security review

Reviewed 2026-10-04.

## Protections and boundaries

Framework scrypt/session auth, Vine validation, Bouncer owner/staff boundaries, CSRF on every mutation, parameterized SQL, scoped account/guest orders, safe integer amounts and transactional stock remain in place. Registration cannot select roles. Public shared props omit credentials/internal store settings. Product image uploads are limited to staff and owner, check the file bytes, and store a generated key rather than the client filename. SVG uploads are rejected. No real payment webhook exists.

Production CSP follows [Shield documentation](https://docs.adonisjs.com/guides/security/securing-ssr-applications): self/nonce scripts, self images/fonts/connections, no objects/frames, same-origin forms. When `DRIVE_DISK=s3`, the `S3_PUBLIC_URL` origin is added to `img-src`. Inline styles remain permitted for Vue controls. Structured data escapes less-than characters before raw script insertion. Merchant text/reviews otherwise use escaped Vue interpolation.

Fake settlement is blocked by both central capability configuration and the provider in production. COD requires administration and eligible fulfillment status. Payment settlement locks the order before payment, validates amount/currency/reference and never updates inventory or fulfillment. Paid/cancelled races serialize on the order lock. Future real callbacks must authenticate provider signatures before calling settlement; never expose the internal action as an unsigned public webhook.

## Dependency finding

Re-checked 2026-10-04 with `npm audit --omit=dev` after adding mail and Drive: 23 high findings and no critical findings.

Twenty-two are [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), braces through 3.0.3, reached through fast-glob and `@adonisjs/assembler`, including `@adonisjs/mail` and `@adonisjs/drive`. The advisory lists no patched release. `npm audit fix --force` would install `@adonisjs/assembler@5.9.6`, which downgrades the Adonis 7 stack. No override is applied. The application does not accept user-supplied glob/brace patterns. Catalog search is bounded text used in parameterized PostgreSQL queries. This reduces the direct application attack surface; it does not establish that every framework path is unreachable. `@aws-sdk/client-s3` did not add a separate finding.

`@adonisjs/mail` 10.4.0 depends on nodemailer 9.1.1 (`^9.0.3`). npm audit reports that package as high because of [GHSA-6vj9-mwq6-2f5v](https://github.com/advisories/GHSA-6vj9-mwq6-2f5v), [GHSA-8vvx-rff5-p5rq](https://github.com/advisories/GHSA-8vvx-rff5-p5rq), [GHSA-g57g-f23g-4646](https://github.com/advisories/GHSA-g57g-f23g-4646), [GHSA-v53p-9fqp-m79j](https://github.com/advisories/GHSA-v53p-9fqp-m79j), and [GHSA-prgh-xp8r-p3m5](https://github.com/advisories/GHSA-prgh-xp8r-p3m5). The fixes npm offers are in nodemailer 10.0.9 or later, outside the range this mail release declares. No override is applied. HoneyChic passes single validated addresses to the mailer. It does not accept nested recipient structures or raw SMTP envelopes from visitors. That limits the practical exposure; it does not prove every nodemailer parser path is unreachable.

Track both upstream patches and rerun `npm audit --omit=dev` before public launch. Do not describe the dependency tree as clean.

## Remaining launch work

Password reset tokens are random, stored as scrypt hashes, expire after one hour, and are single-use. A new request invalidates older unused tokens. An unknown email receives the same response and no mail. Guest order recovery links are random, stored as scrypt hashes, expire after 7 days, and stay valid until expiry. The public order id, email, or order number is not a recovery credential. Reset and recovery secrets are not written to logs. Mail is sent after the order transaction commits; a delivery failure does not undo the order.

Choose/configure HTTPS proxy trust and a host, verify database TLS/backups on that host, perform a restore drill, and resolve or explicitly assess the upstream dependency risk before a real merchant launch. Cookie sessions lack central revocation. The guest session still expires after two hours; the emailed recovery link is the later way back in. Email verification, refunds/returns, and unpaid-order expiry are not implemented.

No secrets belong in Git, screenshots or logs. No external error tracker or observability infrastructure is required.
