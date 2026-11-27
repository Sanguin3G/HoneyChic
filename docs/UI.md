# UI

Modern layout with a few nostalgic touches from classic desktop software. The middle ground: dimensional and tactile, never flat Material and never a retro reskin.

## Look

- **Palette:** ink (`--brand-primary`), warm paper surfaces, honey (`--brand-accent`) for highlights, selection and badges. Tokens live in `inertia/app/design/tokens.css`. Merchant colors replace ink and honey; all gradients derive from them. Do not reintroduce navy-and-orange, or a yellow pill "Add to cart".
- **Type:** system UI font for text, a serif (Palatino family) for headings, prices and store names.
- **Depth:** panels have a hairline border and a soft shadow; buttons have a smooth gel gradient and press down on click; cards lift and glow honey on hover. No hard gloss lines, pinstripes or heavy bevels.
- **Signature extras (use sparingly):** titled windows (`HcPanel` with `title`), the framed photo with an engraved nameplate on the home page, iOS-style switches for on/off settings, a source-list sidebar in admin.
- **Radii:** controls 8px, panels 14px, pills for buttons and search.

## Behavior

- Visible focus ring on everything; mobile targets at least 44px; honor reduced motion.
- Motion is short and purposeful: hover lift, image zoom, cart badge bump, drawer and menu slide-ins.
- Status uses `StatusMark` (a pill with a lit dot). Notices use `HcNotice`.
- Primitives: `HcButton` (primary, quiet, honey, danger; small), `HcPanel`, `HcInput`, `HcTextarea`, `HcNotice`, `HcDialog`. Add one only when a real screen needs it.

## Screens

- **Storefront:** translucent sticky toolbar (brand, pill search, icon-over-label items). Below 800px search takes a second row and account links sit in the labelled menu. Catalog filters are an inspector panel on desktop and a drawer on mobile. Product page: framed gallery left, buy box right.
- **Admin:** source list on the left grouped into Sales, Catalog, Store; page title row with actions above the content; tables are zebra list views. On/off settings use grouped switches.
- Interface copy exists in English and Vietnamese. Merchant text stays as entered. Empty states say what to do next.
