# Urban Alchemist — Landing Page (v2)

One page for **Urban Alchemist**, 2219 N Clybourn Ave, Lincoln Park, Chicago.

## The idea
Hussain's own line, taken literally: *"most people might not even know what that product is — but they know what they want to feel."* So the page is sorted by feeling. Six shelves, each one showing exactly what's on it and what it's for, with Shumi introducing each.

## Structure
1. **Hero** — the real logo, "Start with a feeling", directions + phone
2. **The storefront** — the photograph, uncropped, with the address written over it
3. **Shumi's intro** — sits below the storefront, hands off to the shelves
4. **Start with a feeling** — Clarity · Stamina · Calm · Seasonal · Ritual · Curious. Each: product categories, how it helps, a line from Shumi
5. **The Four Keys** — Lion's Mane, Cordyceps, Reishi, Chaga
6. **The Sensory Bar** — lids off, smell first
7. **The Snack Passport** — sorted by country
8. **Ask the Alchemist** — the eight questions people actually ask
9. **The five doors** — neighbourhood, corridor, students, service, rewards
10. **Visit** — address, QR, map
11. **Footer** — full compliance block

## Files
| | |
|---|---|
| `index.html` | The page. All content ships in the initial HTML so it stays crawlable behind the age gate. |
| `styles.css` | Heavy Fraunces display + Jost. Warm ivory ground, forest, brass. |
| `gl.js` | Hand-rolled WebGL, no libraries — a drifting spore field and a slowly turning brass armillary built from the logo mark. |
| `app.js` | Reveals, the Four Keys tabs, and the 21+ gate. |
| `assets/` | The logo (background removed, cleaned), the storefront photo, and Shumi in seven poses. |

## Compliance
No cart, no menu, no prices, no online ordering. Every CTA is directions or phone.
- 21+ gate injected after content, so the page stays indexable
- No disease or treatment claims — traditional-use framing only
- FDA disclaimer verbatim in the footer, full body size, highest contrast in the block
- States plainly that this is **not** a licensed dispensary and does not sell psilocybin
- "Mushroom" always qualified — *functional*, *culinary*, or named by species
- No cannabis leaf iconography anywhere
- Shumi never appears beside a price, a claim, or a hemp product

**Not legal advice.** Illinois hemp law changes 12 Nov 2026. Have counsel review before and after.

## Two things to change before launch
1. **Hours** — currently "call ahead for today's hours". Search `index.html` for `call ahead`.
2. **Canonical URL** — add one once the domain is live.

## Run it
```bash
python3 -m http.server 8899
```
No build step, no dependencies.
