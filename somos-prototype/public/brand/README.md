# Brand assets

The logo currently rendered on the site is a **recreation**, drawn as SVG in
`src/components/Logo.tsx` from the artwork Somos supplied as a raster image.
It matches the mark's colours, structure and wordmark, but it is not the
official file.

Before launch, replace it with the original vector:

1. Ask Somos for the logo as `.svg` (or `.ai`/`.eps` to convert). A PNG will
   not scale cleanly on retina screens or in the favicon.
2. Save it here as `somos-logo.svg` (full circular badge) and
   `somos-mark.svg` (heart only, for the header).
3. Swap the drawn `LogoMark` / `LogoBadge` components for `<img>` tags
   pointing at those files, and regenerate `public/favicon.svg` from the mark.

The brand colours sampled from the supplied artwork are already in
`tailwind.config.ts`:

| Role                        | Hex       | Token       |
| --------------------------- | --------- | ----------- |
| Wordmark green (primary)    | `#16A360` | `grass-500` |
| "Early Learning" blue       | `#1C74BB` | `sky-500`   |
| Lightbulb yellow            | `#FFC81F` | `sun-400`   |
| Apple red                   | `#E23B4E` | `coral-500` |
| Star pink                   | `#E5449B` | `berry-400` |
| Star purple                 | `#8A47A8` | `grape-500` |
| Palette teal                | `#2FB6A8` | `teal-400`  |

If the official palette differs from these samples, correct the hex values in
`tailwind.config.ts` — everything else on the site derives from them.
