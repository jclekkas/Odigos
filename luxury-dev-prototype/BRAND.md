# Swapping the brand

Everything brand-variable lives in exactly two places. A full re-skin of both pages is a two-minute
job and touches no markup.

---

## 1. The name — `assets/js/brand.js`

```js
var BRAND = {
  name:        "STONE & CANYON",
  nameFull:    "Stone & Canyon Development",
  tagline:     "Luxury home development and investment",
  location:    "Orange County, California",
  email:       "[EMAIL]",
  phone:       "[PHONE]",
  established: "[YEAR FOUNDED]"
};
```

On load, `brand.js` fills every element carrying `data-brand="name"`, `data-brand="email"` and so on.

**The HTML ships with the same strings written inline as the default**, so the pages are never blank
if JavaScript fails or is disabled. `brand.js` only ever overwrites. That means a full swap has two
halves:

1. Edit the `BRAND` object. This is what actually drives the live pages.
2. Find and replace the same strings in `index.html` and `property.html` so the no-JavaScript
   fallback matches. The strings to replace are `STONE &amp; CANYON` (the wordmark, four places per
   page) and `Stone &amp; Canyon Development` (the full name). They also appear in each page's
   `<title>`, `<meta>` description, Open Graph tags and JSON-LD block, none of which `brand.js`
   touches.

Leave `[EMAIL]`, `[PHONE]` and `[YEAR FOUNDED]` as brackets until someone supplies real values. They
are meant to be visible as placeholders.

### To turn this into the TATZ pitch

Set the two name fields and nothing else:

```js
name:     "TATZ",
nameFull: "TATZ",
```

Then run the find-and-replace in step 2 above. Do **not** invent a longer legal entity name — use
whatever the company actually calls itself, or leave `nameFull` equal to `name`.

While the prototype is unsolicited, keep the README's opening statement intact wherever the build is
shown, so it is never mistaken for the company's own site or for work they commissioned.

---

## 2. The palette — top of `assets/css/site.css`

Five tokens carry the identity:

```css
--brand-bone:   #F4F1EA;   /* primary background */
--brand-ink:    #14171A;   /* text, dark sections */
--brand-bronze: #7A5A38;   /* accent, rules, line work */
--brand-clay:   #A8613F;   /* secondary accent, sparingly */
--brand-mist:   #DEDAD1;   /* hairlines, dividers */
```

Changing those five re-skins both pages, the construction drawing and the site plan. The drawings pull
their strokes and fills from the same tokens, so they follow the palette automatically — there are no
hard-coded colours in the SVG markup.

A handful of derived tokens sit directly below the five and normally need no editing: the plane tones
used by the drawings, the glass and interior-glow colours, the sage used for planting, and the muted
text greys.

### If you change the bronze, check the contrast

`--brand-bronze` is used for small uppercase text on the bone background. It must clear **4.5:1**
against `--brand-bone`. The brief's original `#8A6A46` measures 4.40:1 and fails, which is why the
shipped value is `#7A5A38` at 5.53:1.

Three companion tokens exist for the cases the main bronze cannot cover:

| Token | Value | Purpose |
| --- | --- | --- |
| `--brand-bronze-soft` | `#8A6A46` | line work in the drawings only — never text |
| `--brand-bronze-lift` | `#C79A5F` | bronze on dark sections; 7.04:1 on ink |
| `--brand-clay-deep` | `#8B4E30` | clay for text; plain `--brand-clay` fails AA on bone |

Keep that division when you change the palette: if the new accent fails against the background, darken
the text token and leave the drawing token bright.

---

## 3. Type — same block

```css
--font-display: "Instrument Serif", Georgia, "Times New Roman", serif;
--font-body:    "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
```

Two families, three weights, one Google Fonts request. If you swap them, keep the local fallbacks —
they are what stops the pages from breaking with the network off. The `<link>` in each page's `<head>`
needs updating to match.

The type scale sits immediately below (`--fs-hero` through `--fs-eyebrow`). Note that `--fs-hero` is
capped at 78px on purpose; see the README for why.
