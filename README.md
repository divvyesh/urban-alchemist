# Urban Alchemist

Static storefront for Urban Alchemist, 2219 N Clybourn Ave, Unit A, Lincoln Park, Chicago.

The landing page now leads with online delivery, ordinary merchandise, real merchant product photography and clear Quickvee shopping links. The educational journal and local guides keep their existing routes.

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

The landing page quotes one Google **store review**, attributed to Vince Casambre and linked to its original source. The source was checked October 22, 2026. It is not presented as a review of any individual product; no product ratings, aggregate scores, fictional reviews, delivery-time guarantees or unsupported health claims are published.

Research and release evidence is retained outside the repository under `../output/feeling-shop-20261022/`. Quickvee merchant categories have not been changed.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Delivery landing page, six product features, seven feeling links, store-review excerpt, ordering steps, FAQ and local-store details. |
| `delivery.css` | Landing-page layout, product cards, mobile shopping bar and responsive styling. |
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
