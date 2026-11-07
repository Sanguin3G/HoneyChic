# Security review

Dependency audit 2026-10-05. Email confirmation and the refund notes were added 2026-11-07. The audit was not rerun.

## Protections and boundaries

Framework scrypt/session auth, Vine validation, Bouncer owner/staff boundaries, CSRF on every mutation, parameterized SQL, scoped account/guest orders, safe integer amounts and transactional stock remain in place. Registration cannot select roles. Public shared props omit credentials/internal store settings. Product image uploads are limited to staff and owner, check the file bytes, and store a generated key rather than the client filename. SVG uploads are rejected. No real payment webhook exists.

Production CSP follows [Shield documentation](https://docs.adonisjs.com/guides/security/securing-ssr-applications): self/nonce scripts, self images/fonts/connections, no objects/frames, same-origin forms. When `DRIVE_DISK=s3`, the `S3_PUBLIC_URL` origin is added to `img-src`. Inline styles remain permitted for Vue controls. Structured data escapes less-than characters before raw script insertion. Merchant text/reviews otherwise use escaped Vue interpolation.

Fake settlement is blocked by both central capability configuration and the provider in production. COD requires administration and eligible fulfillment status. Payment settlement locks the order before payment, validates amount/currency/reference and never updates inventory or fulfillment. Paid/cancelled races serialize on the order lock. Future real callbacks must authenticate provider signatures before calling settlement; never expose the internal action as an unsigned public webhook.

## Dependencies

Checked 2026-10-05 with `npm audit --omit=dev`: 23 high findings, no critical findings. Do not run `npm audit fix --force`. It downgrades Adonis 7. Rerun the audit before a public launch.

Twenty-two findings are braces through `@adonisjs/assembler` ([GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)). No patched release sits inside the current range. The app does not accept visitor glob patterns.

`@adonisjs/mail` 10.4.0 depends on nodemailer 9.1.1. The fixed release is 10.0.9 or later, outside this mail package. Mail receives one validated address. Apply that fix only when a patched release exists inside the declared Adonis range.

## Remaining launch work

Password reset tokens are random, stored as scrypt hashes, last one hour, and work once. An unknown email gets the same response and no mail. Guest recovery links are hashed, last 7 days, and are not the public order id or email. Secrets are not logged. Mail goes out after the order commits. A delivery failure does not undo the order. Response timing is not constant.

`TRUSTED_PROXIES` is a comma-separated list. Blank trusts nobody. Cookie sessions cannot be revoked from one place and expire after two hours. A new customer confirms their email only when SMTP can send mail. Existing accounts, the owner, and staff are not asked. Refunds and unpaid-order expiry are specified and not implemented. Confirm proxy trust, database TLS, and a restore on the real host before launch.

No secrets belong in Git, screenshots, or logs.
