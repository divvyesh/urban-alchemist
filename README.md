# Urban Alchemist

Static storefront for Urban Alchemist, 2219 N Clybourn Ave, Unit A, Lincoln Park, Chicago.

The landing page combines the original brand experience with all delivery additions. The original opening sequence stays intact: sunset hero, ticker, storefront image and introduction. Delivery modules follow that opening and use scoped wrappers. The hero retains its original headline and imagery, with delivery and product-browsing actions alongside directions and phone. The storefront illustration below also includes a delivery action alongside its original directions and phone buttons. The educational journal and local guides keep their existing routes.

## Preserved website and delivery additions

All 12 original sections remain: sunset hero/WebGL, storefront illustration, introduction, Worth the Walk band, seven illustrated Shumi shelves, jar wall, Snack Passport, 14-question original FAQ, six audience doors, discovery links, three-review carousel and full Visit/QR section. The original ticker, decorative effects, navigation, footer, shelf disclosures and review controls remain.

All eight delivery sections also remain: delivery hero, featured-product carousel, compact category links, product descriptions/store-review feature, ordering steps, five delivery FAQs, local-store card and closing shopping CTA. The announcement, benefits band and sticky mobile shopping action remain. Together the page has 20 sections and 19 FAQ questions. Original anchors keep their IDs; delivery modules use distinct IDs to prevent collisions.

Existing copy that implied universal stock, batch testing, product legality, opening days or discounts was made specific to current information without removing its section or question. Older Bowie/Ryan store-review excerpts retain their documented October 5 provenance; Vince’s source was rechecked October 22.

## Shopping flow

- Header, hero and closing delivery actions open the merchant’s ordinary Snacks collection on Quickvee with `orderMethod=delivery`.
- Every product photo and its adjacent action open the exact matching Quickvee product listing in a new tab.
- Visitors choose the exact variant and quantity, then use Quickvee’s Add to cart. Address eligibility, stock, prices, ordering hours, fees, payment and fulfillment remain on Quickvee.
- There is no automatic cart mutation, embedded checkout, fabricated cart permalink or unsupported variant-selection parameter.
- Feeling links open the local product browser. Its All products view deduplicates the matcha flavor card and its parent listing.

## Content and evidence

The current catalog has 27 records representing 26 verified ordinary-merchandise product groups. Every record has a primary category. The seven populated categories are Clarity, Stamina, Seasonal, Curious, Sweet Tooth, Refresh and Self Love. Navigation omits empty categories, and retired shelf queries fall back to a populated shelf.

The six featured products are Lay’s Exotics, Doritos Exotics, Exotics Drinks, Pocky, Barebells protein bars and Buldak. They are labeled **Featured picks**, without sales-ranking claims. Transcripts support leading with snacks, drinks, Lay’s and Doritos; no SKU sales history was supplied.

Twenty-four merchant listing photos were captured from the public Quickvee Snacks collection on October 22, 2026. Local filenames include the exact parent product ID and date. They show representative options; visitors review the actual selected flavor, package and price on Quickvee. The matcha-specific card deliberately does not inherit a different drink’s parent photo. Missing or failed images preserve the text and shopping link.

The delivery feature quotes a Google **store review**, attributed to Vince Casambre and linked to its original source, checked October 22, 2026. The original three-excerpt store-review carousel also remains with its historical provenance note. These are not presented as reviews of individual products; no product ratings, aggregate scores, fictional reviews, delivery-time guarantees or unsupported health claims are published.

Research and release evidence is retained outside the repository under `../output/feeling-shop-20261022/`. Quickvee merchant categories have not been changed.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | All original brand sections plus six product features, seven compact category links, delivery instructions, review excerpt and shopping actions. |
| `delivery.css` | Scoped delivery layouts, product cards, mobile shopping bar and responsive styling. |
| `restore.css` | Integration of original sections with delivery modules, combined navigation, secondary delivery headline and mobile spacing. |
| `delivery.js` | Native horizontal product carousel, 4.5-second advance, manual navigation and motion controls. |
| `shop-catalog.js` | Ordinary product categories, exact destinations, photo metadata and source references. |
| `shop.html`, `shop.js`, `shop.css` | Product browser with linked photos, category counts, safe destinations and availability guidance. |
| `app.js` | Age gate, progressive interactions and focus-aware anchor navigation. |
| `styles.css`, `journal.css` | Shared brand styles and journal/local-guide layouts. |
| `assets/products/` | Authentic, dated Quickvee merchant product photographs. |
| `blog/` | Existing educational articles. |

## Accessibility and fallback

The carousel uses native horizontal scrolling with no cloned or inactive shopping links. Automatic movement pauses when hovered, focused, off screen, hidden, dragged or explicitly paused. Reduced-motion preferences start the carousel paused. Controls and manual announcements remain available, and products are browseable without JavaScript.

All shopping links are ordinary anchors using `target="_blank"` and `rel="noopener noreferrer"`. The Skip to products link moves focus to its target. Product-photo alt text describes the listing, while a nearby note explains that photos are representative. A session-based 21+ gate remains in place.

## Hosting

The repository is linked through GitHub to the existing `urban-alchemist` Vercel project and `https://www.ualincolnpark.com`. There is no build step. `vercel.json` enables clean URLs; query strings must survive `/shop.html` → `/shop` redirects. New or changed image files must use versioned names because assets are cached immutably.

Before release, verify the intended Vercel project, account, commit and production target, then check the canonical live site. An HTTP200 or Ready deployment alone does not prove the external cart/payment/delivery flow.
