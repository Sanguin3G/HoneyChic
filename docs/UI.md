# UI direction

Navy and warm orange, visible borders, short radii, and tactile controls. Tokens are in `inertia/app/design/tokens.css`. Do not introduce glassmorphism, purple gradients, or generic SaaS cards.

Controls are about 6–8px radius. Panels are 8–12px. Mobile controls are at least 44px tall. Honor reduced motion. Focus is visible. Storefront navigation on a dark bar uses a white focus outline.

Primitives are Button, Panel, Input, Textarea, Notice, and Dialog. Add another only when a real screen needs it. Status labels reuse the bordered stock-label treatment.

Interface copy exists in English and Vietnamese. Merchant product text stays as entered. Store branding is separate from the HoneyChic attribution. Optional brand colors replace only the primary and accent tokens, and a primary color must keep 4.5:1 contrast with white text.

## Screens

The storefront header is one row on desktop: brand, search, shop links, account. Below 800px, search stays on a second row and the account links stay in the labelled menu. Do not replace that menu with a swipe drawer.

Catalog filters sit on the left on desktop. On mobile they use the native dialog, with Apply and Reset. Product options stay native selects. The hero image is the priority image. Catalog and hero photos crop with `object-fit: cover`. The product gallery stays `contain`.

Cart and checkout show the name, SKU, price, and warnings. They do not repeat the full product description. Empty carts and empty admin metrics say what to do next.

Admin navigation is persistent on desktop and collapses on mobile. Account navigation is a short list with a current marker. Missing pages and server errors use the same panel and a link home.
