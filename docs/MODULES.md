# Modules

Core domains are Catalog, Cart, Orders, Inventory, Customers and Store configuration. Modules depend on core; core imports no modules.

The central capability snapshot distinguishes installed (code exists), enabled (merchant preference), configured (runtime prerequisites) and available (all three). First-party schema always migrates, even when disabled.

| Capability | Behavior |
| --- | --- |
| customer_accounts | Account sessions and account checkout |
| guest_checkout | Anonymous checkout |
| wishlist | Up to 100 saved published products per account |
| reviews | One editable review per account/product, requiring a completed purchase |
| coupons | Fixed/percentage discounts with currency, minimum, UTC dates and usage limits |
| shipping | Pickup, flat fees, country-code zones and free thresholds |
| payments.cod | Admin records collected cash after processing begins |
| payments.fake | Development/test settlement only; never configured in production |
| payments.stripe / payments.vnpay | Not installed |
| assistant | Not installed; remains disabled |

All new optional modules default disabled. Owner changes preferences in /admin/modules and configures rates/coupons in /admin/module-configuration. Staff may inspect configuration but cannot change it. Account disablement never locks out administrators.

Shipping/coupon configuration is evaluated for the actual cart, destination and currency. Configured does not promise that a rate/coupon qualifies for every cart. These first-party modules need no external credentials. Reviews/wishlist also require available customer accounts.

The HTTP application adapter CheckoutModules participates in PlaceOrder's transaction. It calculates charges, consumes a locked coupon and creates a payment record. Orders owns safe totals and historical charge snapshots; it imports no module/provider classes. Module failure rolls back the whole checkout.

Disabled modules hide new interactions and reject mutations. Existing order snapshots/payment records remain readable. Existing paid-event retries are harmless even after disablement. Refunds, real provider callbacks, carrier APIs, moderation and AI are separate future work.

Checkout review clears saved selections for unavailable modules, invalidates the previous charge review and displays freshly calculated totals. Option updates also discard unavailable hidden choices. Order submission keeps strict transactional checks: disablement after review requires another review and never silently changes an order's charges.
