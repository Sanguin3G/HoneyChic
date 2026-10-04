# UI direction

HoneyChic uses navy and warm orange, strong contrast, visible borders, restrained depth, subtle gradients, and tactile controls. Inspiration comes from clear desktop software hierarchy, not a literal Windows XP recreation.

Tokens live in `inertia/app/design/tokens.css`: surfaces, borders, brand colors, text, success/warning/danger/focus. Elevations, controls, and motion are separate small stylesheets.

Controls use about 6–8px radii; panels 8–12px. Hover, pressed, selected, disabled, and focus states must be deliberate. Mobile controls remain at least 44px high. Respect reduced motion.

Storefront: top navigation and comfortable density. Catalog: left desktop filters, mobile drawer. Customer account: contextual sidebar. Admin: persistent/collapsible left navigation, compact panels, toolbars/tables, clear status and keyboard access.

Pages primarily compose feature components. Start with strong reusable primitives; add the rest when real workflows require them. No giant dashboard files, generic SaaS cards, excessive rounded panels/whitespace, purple gradients, glassmorphism, or AI-first interfaces.

Use semantic HTML, labels, proper buttons, alt text, visible focus, keyboard access, and accessible dialogs. Storefront remains conventional on mobile.

All interface text exists in both English and Vietnamese. Merchant product content remains exactly as entered. Store branding is distinct from HoneyChic platform attribution.

Current primitives are Button, Panel, Input, Textarea, Notice and Dialog. Add other primitives only when real workflows require them.

Phase 2 adds labelled input/error/notice primitives, account forms, a small account sidebar, and admin settings/capability tables. Desktop admin navigation remains persistent; mobile uses a compact navigation grid with comfortable targets. UI and validation dictionaries exist in both languages. No fake dashboard metrics are shown.

Catalog has cohesive option/variant/image editors and compact admin tables. Image controls edit metadata only; uploads are not implemented. Storefront components compose desktop filters/mobile drawers. Prices follow the product currency and locale; merchant text remains unchanged.

Phase 4 adds compact inventory tables, text-labelled stock states, signed adjustments and paginated movement history. Owner/staff see balances; public product/catalog pages show availability only. Low-stock and out-of-stock states remain distinct. History timestamps use the merchant timezone. Stock controls stay separate from catalog pricing/options so catalog edits cannot reset balances.

## Phase 5 storefront

Merchant home uses actual categories/products and merchant identity. Desktop catalog has left filters; mobile uses a native modal drawer with shared draft state and explicit Apply/Reset. Header search and locale switching preserve useful catalog context. Mobile navigation uses a labelled disclosure.

Product pages compose image thumbnails and generic options. Selection always resolves to an offered variant and announces its price/availability. Public balances remain private. No fake discounts, ratings, delivery promises or inactive cart/wishlist buttons are shown. Public indexing requires the explicit production SEO setting.

## Phase 6 cart

The top navigation has a cart count, including mobile. Product pages have labelled quantity/add controls tied to the selected variant; sold-out variants disable addition. The cart composes variant rows with current/original prices, stock warnings, quantity controls, remove/clear and a subtotal panel. Mobile stacks the rows and summary without tiny controls.

Unavailable lines remain removable, and invalid carts omit a subtotal. The interface states that stock is not reserved. Valid carts lead to checkout. All controls/notices exist in EN/VI.

Checkout composes customer/contact/address fields with a current-price review and explicit unpaid-order terms. Order detail uses historical line data and separate fulfillment/payment indicators. Native confirmation protects cancellation/status changes. Admin uses compact metric panels, strong tables and toolbars; mobile navigation collapses with an accessible toggle. Totals remain grouped by currency and labelled as placed order value. All labels/errors have EN/VI keys.

Mobile checkout repeats the current total beside its submit button. Admin grid tracks use minmax(0,1fr); wide tables scroll within their panels rather than widening the page.

## Phase 9/10 additions

Locale selection uses a globe button and dropdown menu of language names, with a selected check, outside-click closing, Escape focus restoration and arrow-key movement. Product reviews/wishlist and checkout shipping/coupon/payment controls appear only when capabilities allow them. Checkout requires an explicit authoritative total review after option selection. Admin configures rates/coupons through the same tactile Vue primitives. Payment controls state when cash is being recorded or a non-charging development simulation is used. SEO metadata never changes merchant content.
