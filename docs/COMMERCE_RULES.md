# Commerce rules

Read this document before changing important commerce workflows. Catalog, inventory, cart, order, cancellation and optional-module checkout rules are implemented. Real provider webhooks, refunds and returns remain later work.

- Inventory belongs to variants; stock cannot become negative. Checkout and stock adjustments use transactions and appropriate database locks.
- Meaningful stock changes record delta, reason, reference, actor, and timestamp.
- Money uses integer minor units plus currency. Never float arithmetic or a hardcoded currency symbol. Formatting respects each currency's fraction digits, including VND.
- Every product has at least one variant. SKU, price, and inventory belong to the variant. Product options are generic, not fashion-specific.
- Checkout uses current server-authoritative prices and recalculates all totals. Cart price changes must be communicable to the customer.
- Order items snapshot product name, variant description, SKU, unit price, quantity, discounts, and relevant tax. Orders snapshot checkout/customer information.
- Product/customer deletion must not erase business records or invalidate order history. Relationships must be nullable/restricted where appropriate.
- Fulfillment and payment states are separate, explicitly defined state machines.
- `CancelOrder` is the single customer/admin cancellation action. Transactions/locking ensure inventory is restored exactly once.
- Payment callbacks are idempotent. Duplicate callbacks must not duplicate payments or mutate orders incorrectly.
- Guest checkout is first-class when enabled; disabled guest checkout must be enforced server-side.
- Reviews require ownership of a purchased item in a completed/fulfilled order and an explicit duplicate-review policy.
- Authorization must prevent customers from reading/modifying others' orders and non-admins from modifying admin resources.
- Disabling optional modules must not break core commerce. First-party migrations run regardless of feature enablement.

## Current catalog decisions

- Simple products have exactly one default variant; option-based products have unique valid combinations. Options are generic and bounded, not required fashion fields.
- All variants of a product share its creation currency. Store currency changes apply to new products only; existing prices are not relabelled or converted.
- Prices accept nonnegative exact decimal strings with currency-supported precision, stored as integer minor units up to Number.MAX_SAFE_INTEGER. VND rejects fractional input.
- Updates retain submitted variant IDs belonging to the product; omitted variants are retired rather than deleted. Their SKUs remain reserved. Inventory builds on these identities; remaining stock must reach zero through a recorded movement before a variant is retired.
- Published products are public only with an active variant and an active category (or no category). Draft/archived products are unavailable through direct public URLs too.
- Images retain relative keys, nonblank alt text and order; exactly one image is primary when images exist. No absolute environment URLs are stored.

## Current inventory decisions

- New and migrated variants start at zero; the application never guesses opening balances. Demo seeding does not invent or reset stock.
- Stock is an integer from 0 to 2,147,483,647, enforced in PostgreSQL and the action. Quantity changes must be whole, nonzero and within the signed supported range.
- AdjustInventory locks the variant before reading its balance. Stock and movement (including resulting balance) commit or roll back together. A supplied transaction remains the caller’s responsibility.
- Initial stock is positive and allowed only before the first movement. Restock/return/cancellation are positive; sale is negative; manual adjustment/correction are signed. PlaceOrder and CancelOrder supply order idempotency/authorization. Payment settlement never writes inventory.
- Only owner/staff can read/adjust inventory. Manual endpoints allow initial_stock, manual_adjustment, restock and correction; actor comes from the session, never submitted input.
- Movement history has no mutation endpoint. Variant deletion is restricted; deleting an actor nulls the actor relationship while retaining the movement.
- Retired variants permit cancellation restoration and negative corrections only; manual positive additions remain blocked. Out of stock means stock at or below zero. Low stock means active stock greater than zero and at or below the merchant threshold. Dashboard counts and the inventory filter use that same split.
- Public availability is informational; checkout rechecks stock under locks. Multi-variant transactions must lock IDs consistently to avoid deadlocks.

Record any intended change here, alongside the action and meaningful regression protection.

## Current cart decisions

- Both anonymous and authenticated visitors use the same browser session cart. Its lifetime follows the two-hour session; it is not an account-synchronized cart.
- A line identifies one variant. Adding again accumulates its quantity; updating replaces it. Quantities are integers from 1 to 99, with at most 12 different variants. Remove/clear are explicit and idempotent.
- Add/update require current publication, active category/variant and sufficient stock for the resulting line quantity. Cart changes do not reserve or deduct stock, and create no inventory movements. Future checkout must recheck and lock stock.
- Each cart has one currency. A different-currency addition is rejected until the cart is cleared; existing product currencies never get relabelled after store-currency changes.
- Every read calculates current unit prices and totals on the server. The original added price remains solely for change notices; quantity edits do not silently acknowledge a price change. Removing/re-adding starts a new price baseline.
- Line multiplication and subtotal accumulation use BigInt, converted only within the safe integer range. Overflowing mutations are rejected. Later merchant price increases show an amount warning without a rounded subtotal. Zero-priced items are valid.
- Missing/retired/unpublished/hidden-category lines remain removable. Current private product text/media/price is withheld. Reduced stock is shown as a quantity issue. Any unavailable/insufficient/overflowing line suppresses the subtotal rather than showing a misleading partial total.
- Session references and original-price observations are not checkout authority. Cookie sessions cannot serialize simultaneous cart edits across tabs; the last response wins. This limitation does not grant stock or freeze prices.

## Current order decisions

- Checkout requires guest_checkout for guests or customer_accounts for account checkout. Existing admins can always administer even when both are disabled. These preferences never skip migrations.
- The server stores a checkout review of each variant, quantity and price. A changed price requires another review even when offsetting price changes leave the same total. Availability and currency are checked again under locks.
- A unique session-owned checkout key and transactional advisory lock make retries return the same order without duplicate stock deductions. A new reviewed cart gets a fresh key after completion. Retrying the previous completed key does not clear a newly populated cart.
- The transaction locks products in ascending ID order, then categories, then variants in ascending ID order. Every order item and sale movement commits with the order or none do.
- Totals are item subtotal minus coupon discount plus shipping. Item discount/tax remains zero. Payment starts unpaid; COD collection and fake settlement never invent fulfillment progress.
- Items preserve product name, variant description, SKU, unit price, quantity, discount and tax. Customer contact/address/note, currency and order prefix/number are snapshots. Later catalog/account/settings changes cannot reconstruct or rewrite them.
- Customer/product/variant references are nullable with SET NULL. Order items restrict order deletion. Catalog deletion is still not exposed; inventory history may independently restrict variant deletion.
- Fulfillment: pending → processing → shipped → completed; processing may complete directly for pickup/local fulfillment. Pending/processing may cancel. No backwards transitions. Payment starts unpaid and is unaffected by fulfillment changes.
- Customers/guests may cancel only their pending unpaid order. Admins may cancel pending/processing unpaid orders. Paid, shipped or completed orders need a future refund/return workflow.
- CancelOrder locks the order, returns an already-cancelled order unchanged, restores each variant once and marks cancelled in the same transaction. A variant retired after sale still receives its historical restoration; admins may remove its restored balance with a recorded negative correction.
- Guest access uses the most recent guest order in the encrypted two-hour session. A public UUID alone never authorizes access. No guest email lookup or emailed receipt exists yet. Accounts can access only their own orders. Private cart/checkout/order responses are no-store.
- Addresses are customer-scoped, at most 20 per account. Editing/deleting a saved address never changes an order snapshot. Guest orders are not automatically attached to later registrations.

## Optional-module decisions

- New optional modules default disabled. Their schema is unconditional. Disabled features reject new mutations but preserve core order history.
- Total = item subtotal − order-level coupon discount + shipping. Item discount/tax remains zero; the coupon discount is an order snapshot, never falsely allocated to individual lines. Coupon discounts are capped at item subtotal and cannot discount shipping. Percentage uses integer basis points and floors to minor units.
- Coupons require matching currency, minimum subtotal, active UTC dates and remaining usage. Checkout locks a coupon and records one redemption per order; retries do not consume another use. Cancellation does not release usage, preventing repeated discounted ordering.
- Shipping uses server rates, currency and explicit destination country codes. Empty rate zones mean all countries; pickup is free; free thresholds use pre-discount item subtotal. Rate/name/amount changes require a new checkout review.
- Payment selection and coupon/shipping choices live in the session after validation. Frontend totals remain comparison-only. The application adapter creates payment/redemption in the same order transaction; failures roll everything back.
- Reviewing checkout clears choices for unavailable modules and replaces the prior charge review with current totals. Disabling a module after review still rejects submission until another review; do not silently normalize charges while placing an order.
- COD is unpaid until owner/staff explicitly records collected cash for processing/shipped/completed orders. Fake settlement is development/test only. No real-provider callback or refund endpoint exists.
- Settlement locks order then payment, verifies amount/currency/reference, authorizes the actor and accepts each event once. Cancelled orders cannot become paid; paid orders cannot use stock-restoring cancellation. Payment changes never advance fulfillment.
- Reviews require a completed order owned by the current customer containing the product. One editable review per customer/product; guest orders are not automatically attached. Reviews display escaped text, not HTML.
- Wishlist is account-scoped, at most 100 products, idempotent per product. Public visibility is reapplied when reading it.
