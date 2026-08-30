# Image slots — shot list

There is no photography in this build. Every image slot is a CSS-gradient placeholder with a grain
overlay, labelled with its purpose and the pixel dimensions it needs. They are meant to look like a
considered design decision, not a missing asset.

This list doubles as the shot list to hand a photographer.

## How the placeholders work

Each slot is a `<div class="ph">` with two attributes:

- `data-ph` — the label drawn across the centre of the slot, e.g. `HERO · 2400×1600 · exterior, dusk`
- `aria-label` — what a screen reader announces, since these carry `role="img"`

When real photography arrives, replace each `<div class="ph" …>` with an `<img>` carrying the same
aspect ratio and a real `alt` attribute. The `.ph` class and `assets/img/grain.svg` can then be
deleted from the stylesheet.

`.ph--dark` is a darker variant used behind overlaid white text — currently only the property hero.

---

## Homepage — `index.html`

| Slot | Dimensions | Ratio | The shot |
| --- | --- | --- | --- |
| `DEV 01` | 2400 × 1350 | 16:9 | The lead development, three-quarter exterior in late afternoon light. Wide enough to read the whole massing and the landscape it sits in. This is the single most important image on the site. |
| `DEV 02` | 1600 × 2000 | 4:5 | Second development, portrait. A tighter vertical crop — an entry sequence, a glazed corner, or the house seen between planting. |
| `DEV 03` | 1600 × 2000 | 4:5 | Third development, portrait. Should differ in mood from DEV 02: if that one is close and shaded, make this one open and bright. |

## Property page — `property.html`

| Slot | Dimensions | Ratio | The shot |
| --- | --- | --- | --- |
| `HERO` | 2400 × 1600 | 3:2 | The house at dusk with interior lights on, shot slightly below eye level so the roof plane reads. Needs a quiet lower-left area — the project name is overlaid there in white. |
| `GAL 01` | 2400 × 1200 | 2:1 | Exterior, south elevation, straight on. The architectural record shot: level horizon, verticals true. |
| `GAL 02` | 1800 × 1350 | 4:3 | The main living space looking out toward the canyon, exposed for the view rather than the room, so the glazing does not blow out. |
| `GAL 03` | 1800 × 1350 | 4:3 | Kitchen detail. Material and joinery close-up rather than the whole room — stone edge, cabinet reveal, hardware. |
| `GAL 04` | 2400 × 1200 | 2:1 | The courtyard at dusk. Wide, low, warm. This is the emotional image of the set. |
| `GAL 05` | 1800 × 1350 | 4:3 | Stair and top light, shot upward into the daylight. |
| `GAL 06` | 1800 × 1350 | 4:3 | Principal bedroom, morning light, made but not styled to death. |

## Share image

| Slot | Dimensions | Ratio | Notes |
| --- | --- | --- | --- |
| `assets/img/og-share.svg` | 1200 × 630 | 1.91:1 | Placeholder Open Graph and Twitter card image, currently an SVG line drawing. **Replace with a real 1200 × 630 JPG or PNG before any live deployment** — several platforms will not render an SVG card. Referenced from the `og:image` and `twitter:image` tags in both pages. |

---

## Direction for the whole set

Warm California modern: canyon light, limestone, glass, bronze, dark wood. Shoot for the architecture,
not for the styling — few props, no staged lifestyle, no people unless the scale genuinely needs them.
Late afternoon and dusk over midday. Keep verticals true throughout; a tilted vertical is the fastest
way to make a house look like a listing rather than a building.

Deliver at 2× the dimensions above so the slots hold up on high-density displays, sRGB, quality 80
JPEG or WebP. Total image weight should stay under roughly 250KB per image after compression.
