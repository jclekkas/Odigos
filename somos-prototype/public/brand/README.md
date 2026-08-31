# Brand assets

The site reads its logo from files in this folder. Nothing about the logo is
drawn in code, so swapping in the official artwork is a file replacement with
no component changes.

| File                          | Used for                                              |
| ----------------------------- | ----------------------------------------------------- |
| `somos-logo.svg`              | the full circular badge — header and footer            |
| `somos-mark.svg`              | the heart alone, for sizes where the arced text is unreadable |
| `../favicon.svg`              | browser tab icon (a copy of the mark)                  |

## Replacing them

**The files here now are a stand-in, not the official artwork.** They were
drawn to match the supplied logo's colours, structure and wordmarks so the
prototype is complete, but they are not Somos's file.

To swap in the real thing:

1. Get the logo from Somos as **SVG** (or `.ai` / `.eps` / `.pdf` to convert).
   A PNG works but will soften on retina screens; if PNG is all that exists,
   export at 1200px square and change the file extensions in
   `src/components/Logo.tsx`.
2. Overwrite `somos-logo.svg` with the full badge, keeping a square viewBox
   with the artwork centred and a little breathing room at the edges.
3. Overwrite `somos-mark.svg` with the heart on its own, cropped tight.
4. Copy the mark to `public/favicon.svg`.

If the SVG contains live text (rather than outlined text), either outline the
type before exporting or embed the font in the file — an SVG loaded through
`<img>` cannot use fonts from the page.

## Colours

The palette in `tailwind.config.ts` is sampled from the supplied artwork. If
the official brand values differ, correct these seven and the whole site
follows:

| Role                     | Hex       | Token       |
| ------------------------ | --------- | ----------- |
| Wordmark green (primary) | `#16A360` | `grass-500` |
| "Early Learning" blue    | `#1C74BB` | `sky-500`   |
| Lightbulb yellow         | `#FFC81F` | `sun-400`   |
| Apple red                | `#E23B4E` | `coral-500` |
| Star pink                | `#E5449B` | `berry-400` |
| Star purple              | `#8A47A8` | `grape-500` |
| Palette teal             | `#2FB6A8` | `teal-400`  |

## Placement rules

The badge is drawn for a white ground. On any colour, use
`<LogoBadge plate />`, which sets it on a white coin. The header and footer
both sit on cream, so they use it directly.
