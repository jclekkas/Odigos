# Mamma Lena Trattoria Napoletana — website prototype

A single-page, mobile-first sales prototype. Plain HTML, CSS and JavaScript —
no build step, no backend, no dependencies.

## Deploying to Netlify

**Drag-and-drop (fastest):** go to <https://app.netlify.com/drop> and drop
`mamma-lena-prototype.zip` onto the page. It publishes in a few seconds and you
get a `*.netlify.app` URL you can text to yourself and open on a phone.

The zip has `index.html` at its root, which is what Netlify Drop expects.

**Viewing locally:** open `index.html` directly, or run
`python3 -m http.server 8000` in this folder and visit <http://localhost:8000>.

## What's in here

```
index.html            the whole page
assets/css/styles.css single stylesheet, mobile-first
assets/js/main.js     nav, scroll reveals, sticky CTA, prototype modal
assets/img/*.svg      placeholder art (see below)
netlify.toml          publish config + cache headers
```

## Verified facts used on the page

Everything factual came from published sources:

- Address: 13507 Clopper Road, Germantown, MD 20874 (Seneca Park Plaza)
- Phone: (301) 916-0002
- Hours: Tue–Sat 12–9, Sun 12–8, closed Monday
- Opened 2013; reservation-only dine-in
- Family: Lena Borrello (kitchen), Carlo Varriale, Giovanni and Carmine Varriale
- The family moved to Washington in 1994 when Carlo took a post at the Italian Embassy;
  Lena cooked in Italy, including at Assunta Madre in Rome
- Washington Post review by Tom Sietsema, 22 May 2025 — "An Italian gem in Germantown,
  Maryland"; the Post's own summary line, quoted on the page, is
  "bountiful portions of expertly made pastas and more"
- Tripadvisor: #5 of 99 restaurants in Germantown · Yelp: 400+ reviews

## What is a placeholder — replace before this goes public

Marked in the HTML with `PLACEHOLDER` comments, and visibly tagged on the page.

1. **Guest quotes** (`#reviews`) — two of the three quotes are written for layout
   only and carry a visible "Placeholder quote" tag. Swap in real, permissioned
   quotes from Yelp / Google / Tripadvisor. The Washington Post quote is real.
2. **Menu items** (`#menu`) — a mix of confirmed dishes (tagliatelle al ragù,
   fiocchi di pera, ravioli d'aragosta, antipasto della casa, bruschetta,
   tiramisù) and representative ones. Prices are deliberately omitted rather
   than invented. Confirm the list and add prices with the kitchen.
3. **Photography** — every image is an art-directed placeholder plate, labelled
   with the shot it stands in for. See below.

## Swapping in real photography

The image slots are the single biggest upgrade to this prototype. Each
placeholder sits at a real path — drop a real photo in at the same filename
(any format; update the `src` extension in `index.html`) and the layout is
unchanged.

| File | Shot | Crop |
|---|---|---|
| `hero.svg` | Dining room, or a hero dish, warm and lit | landscape, 3:2 |
| `dish-tagliatelle.svg` | Tagliatelle al ragù | portrait, 4:5 |
| `dish-fiocchi.svg` | Fiocchi di pera | portrait, 4:5 |
| `dish-ravioli.svg` | Ravioli d'aragosta | portrait, 4:5 |
| `dish-tiramisu.svg` | Tiramisù | portrait, 4:5 |
| `family.svg` | Lena and the family, in the room | portrait, 3:4 |
| `dining-room.svg` | The room, occupied and warm | landscape, 16:10 |
| `reserve.svg` | A set table, close and candlelit | landscape, 16:9 |

Shoot in the evening with the room lights on. Close crops on the food beat wide
table shots every time.

## Prototype behaviour

- **Reserve** buttons open a modal explaining that the finished site would carry
  a live booking flow, and offer the phone number. Real bookings are out of
  scope here by design.
- **View Full Menu** does the same for a full menu page.
- Nav links scroll within the page. Directions open Google Maps.
