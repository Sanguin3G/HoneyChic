# Optional checkout participation

## Decision

PlaceOrder accepts a small quote/created participant supplied by the HTTP application adapter. Shipping and coupon charges are safe integer snapshots; coupon redemption and payment creation run inside the order transaction. Core Orders imports no optional module.

## Why

Five concrete optional modules now exist. Coupon limits, stock, snapshots and payment records must commit together; doing module work before/after a separate order transaction permits partial writes and over-redemption. No generic plugin framework is needed.

## Alternatives rejected

Core-to-module imports violate dependency direction. Independent transactions break atomic checkout. A universal event/plugin pipeline adds complexity without a current need.
