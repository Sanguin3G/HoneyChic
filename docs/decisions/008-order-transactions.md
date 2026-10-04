# 008 — Transactional orders and private guest receipts

## Decision

Use PostgreSQL transactions, ordered row locks and a unique checkout key plus transaction advisory lock for order submission. Store order/customer/item snapshots. One CancelOrder action owns inventory restoration. Guest access requires the most recent guest-order ID in the encrypted session; a URL alone grants no access.

## Why

Stock, snapshots and movements must commit together. Retried requests must not sell twice. Framework session ownership gives a small guest flow without inventing accounts or a token service.

## Alternatives rejected

Frontend totals, separate stock commits and reconstructing history from live records violate commerce invariants. Public UUID-only receipts expose customer details. Email recovery, cart synchronization and payment/refund flows are deferred until their workflows exist.
