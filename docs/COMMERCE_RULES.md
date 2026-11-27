# Commerce rules

Read before changing catalog, inventory, cart, checkout, orders, payments or modules. Change a rule here together with the action and a test that protects it.

## Invariants

- Money is integer minor units plus a currency, within the safe integer range. No floats, no hardcoded symbols. Formatting follows each currency's digits (VND has none).
- Stock lives on the variant and is never negative (0 … 2,147,483,647, enforced by PostgreSQL and the action).
- Every stock change goes through `AdjustInventory` and records delta, resulting balance, reason, reference, actor and time.
- Checkout uses server prices and recalculates every total. Browser totals are for comparison only.
- Orders snapshot items (name, options, SKU, unit price, quantity, discount, tax), customer contact, address, note, currency, number and locale. Later catalog, account or settings changes never rewrite them.
- Deleting a product, variant or customer never breaks order history: links are nullable or restricted.
- Checkout, cancellation and payment settlement are atomic.
- Cancellation restores stock exactly once.
- Payment callbacks are idempotent per event reference.
- Fulfillment and payment are separate state machines.
- Guest checkout, when disabled, is enforced on the server.
- Customers only reach their own orders; only owner and staff reach admin.

## Catalog

- Every product has at least one variant; a simple product has exactly one default variant. Options are generic (at most 3, 30 values each), combinations unique.
- SKU, price and stock belong to the variant. All variants share the currency the product was created in. Changing the store currency affects new products only.
- Prices are exact decimal strings within the currency's digits, stored as minor units.
- Saving a product keeps submitted variant IDs and retires omitted ones (never deletes). Retired SKUs stay reserved. A variant with stock cannot be retired; bring it to zero with a recorded movement first.
- Public means published, with an active variant and an active category (or none). Drafts and archived products are hidden, direct URLs included.
- Images keep relative keys, alt text and order; exactly one is primary when any exist. Uploads use `uploads/<uuid>` keys; an old upload is deleted only after the transaction commits and only when nothing references it. Seeded `catalog/` files are never deleted.

### CSV import

- Columns: `name, slug, status, category, description, sku, options, price, stock`. Rows sharing a slug form one product; `options` reads `Size: M / Color: Red`.
- Import only creates products. An existing slug is skipped, never updated. A taken SKU is an error.
- Every row is validated first; any error imports nothing. Products, categories and stock are created in one transaction.
- Stock is recorded as each new variant's `initial_stock` movement, with the importing user as actor. At most 1,000 rows per file.

## Inventory

- New variants start at zero. Seeding never invents stock.
- `AdjustInventory` locks the variant before reading it; stock and movement commit together. A caller may pass its transaction.
- `initial_stock` is positive and only before the first movement. Restock, return and cancellation are positive; sale is negative; manual adjustment and correction are signed.
- Retired variants accept cancellation and return restorations and negative corrections only.
- Out of stock is ≤ 0. Low stock is > 0 and ≤ the store threshold. Dashboard and inventory filters use the same split.
- Movement history has no edit endpoint. Only owner and staff read or adjust inventory; the actor comes from the session.

## Cart

- One session cart for guests and accounts, lasting the two-hour session. A line is one variant; quantity 1–99, at most 12 lines, one currency per cart.
- Adding or updating checks publication and stock but reserves nothing.
- Every read recalculates prices on the server. A changed price shows a notice; quantity edits do not silently accept it.
- Line math uses BigInt; overflow is rejected. Any unavailable, short or overflowing line hides the subtotal instead of showing a partial one.

## Checkout and orders

- Checkout needs `guest_checkout` for guests or `customer_accounts` for accounts. Admins can always administer.
- The server stores a checkout review of variants, quantities and prices. Any price change, even one that keeps the total, needs another review.
- A session-owned checkout key plus an advisory lock make retries return the same order without deducting stock twice.
- Lock order: products ascending, then categories, then variants ascending. Items and sale movements commit with the order or not at all.
- Total = item subtotal − coupon discount + shipping. Item discount and tax stay zero.
- Fulfillment: pending → processing → shipped → completed; processing may complete directly. Only pending and processing may cancel. No backwards moves.
- Customers and guests cancel only their own pending unpaid order; admins may cancel pending or processing unpaid orders. Paid, shipped, completed or returned orders use refunds and returns instead.
- `CancelOrder` locks the order, returns an already-cancelled order unchanged, then restores each variant (by ascending variant ID) and marks it cancelled in one transaction. A variant retired after the sale still gets its units back.
- Order mail goes out after commit in the order's locale. A mail failure never rolls back an order.
- Guests reach their order through the two-hour session or a hashed recovery link (7 days). A UUID, email or number alone grants nothing.

## Optional modules

- Coupons need matching currency, minimum subtotal, active UTC dates and remaining uses. Checkout locks the coupon and records one redemption per order; cancellation does not return the use. Discounts never exceed the item subtotal or touch shipping; percentages floor to minor units.
- Shipping uses server rates by destination country (empty = everywhere). Pickup is free; free-above uses the pre-discount subtotal. Rate changes need a new review.
- Reviewing checkout drops choices for unavailable modules. Disabling a module after review rejects submission until another review.
- COD stays unpaid until owner or staff records cash on a processing, shipped or completed order. Fake settlement is development and test only.
- `SettlePayment` locks order then payment, checks amount, currency and reference, authorizes the actor and accepts each event once. Cancelled orders cannot be paid; paid orders cannot use stock-restoring cancellation. Payments never move fulfillment or stock.

## Refunds, returns and expiry

- **Refund** records repayment only: no stock, no fulfillment change. Only paid, uncancelled orders; amount from 1 minor unit to what remains. The order becomes `refunded` when refunds reach the total. Each merchant reference is accepted once per order. Owner or staff only. Manual refunds call no provider.
- **Return** records stock only: returned quantity never exceeds sold minus already returned; stock comes back through one `return` movement in the same transaction; the same request never moves stock twice. Variants lock in cancellation order.
- **Unpaid expiry**: the owner sets a lifetime in hours (blank = never). `ExpireUnpaidOrders` cancels pending unpaid orders older than that through `CancelOrder`, so stock returns once; orders paid, processed or returned meanwhile are skipped under the lock. Cancellation mail follows each commit. It runs in the web process every `ORDER_EXPIRY_MINUTES` (default 15, 0 = off) or by `node ace orders:expire`. Cash-on-delivery orders still pending are included; move them to processing to keep them.
