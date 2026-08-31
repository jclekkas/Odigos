# Somos Early Learning — website redesign prototype

A high-fidelity, deployable prototype of what Somos Early Learning's website
could be as it grows from a single preschool into a multi-location bilingual
Montessori brand.

It is a working site, not a wireframe: 12 prerendered pages, real content, real
navigation, a working tour-request flow, per-page SEO metadata and JSON-LD, and
an accessibility pass that clears axe-core at WCAG 2.1/2.2 AA.

## Running it

```bash
npm install
npm run dev        # local development
npm run build      # production build into dist/
npm run preview    # serve the built site
npm run check      # typecheck
```

`npm run build` does three things in order: generates the placeholder
photography, builds the client bundle, then renders every route to static HTML
(plus `sitemap.xml`, `robots.txt` and a real `404.html`).

## Deploying to Netlify

**Drag and drop.** Unzip `somos-prototype-netlify-drop.zip` and drop the folder
onto <https://app.netlify.com/drop>. It is the built site, ready to serve.

**From Git.** `netlify.toml` is already configured — build command
`npm run build`, publish directory `dist`, Node 20. No environment variables are
needed.

Every route is prerendered to its own HTML file, so there is no SPA catch-all
redirect; unmatched paths fall through to `404.html` with a real 404 status.

After the first deploy, set `origin` in `src/data/site.ts` to the live hostname —
it drives canonical URLs, Open Graph URLs, the sitemap and the JSON-LD `@id`s.

## Structure

```
src/
  components/   Header, Footer, Photo, Button, cards, TourForm, FAQAccordion, …
  pages/        one file per route
  data/         locations, programs, copy, and the photography manifest
  lib/          SEO, JSON-LD, photo resolution
scripts/
  generate-placeholders.mjs   art-directed placeholder photography
  prerender.mjs               static HTML per route + sitemap + robots
```

### Adding a third school

Append one object to `locations` in `src/data/locations.ts`. That alone gives
you a location card on the homepage and the locations index, a full location
page at `/locations/<slug>`, footer and mobile-menu entries, an option in the
tour form, a sitemap entry and `Preschool` JSON-LD. Add the matching photo slots
to `src/data/media.manifest.json` and run `npm run photos`.

### Replacing the photography

See `public/photos/README.md`. Every image is one entry in
`src/data/media.manifest.json`; point its `file` at a real photo and rewrite its
`alt`. No component changes.

## What is deliberately not real

- **The tour form submits nothing.** Validation and the success state are real;
  no data is transmitted or stored. Wire it to a form backend before launch.
- **The EN/ES toggle is visual only.** Selecting ES announces that the Spanish
  site is coming rather than leaving a dead control.
- **Maps and Google reviews are designed placeholders**, so the prototype loads
  nothing from third parties. Both have correctly proportioned space reserved.
- **The founder's story on `/about` is intentionally empty**, with a brief for
  what Somos needs to supply. No biography was invented.
- **The photography is generated placeholder art**, not photographs of children.

## Content rules followed

Programs, locations, phone numbers and addresses come from what Somos states
publicly. Nothing was invented: no tuition figures, accreditations, awards,
student counts, staff credentials, licence numbers or enrolment guarantees. No
claim is made that children become fluent in Spanish. Testimonials are
paraphrased themes attributed to "Somos Parent" and must be replaced with
verified reviews before launch.

## Accessibility

Targets WCAG 2.2 AA. axe-core reports zero violations across all 12 routes at
1440px and 390px, including the open mobile menu. Keyboard operation, visible
focus, semantic headings (one `h1` per page), labelled form fields, text-based
error messages, 44px+ touch targets and `prefers-reduced-motion` support are all
in place. Content is present in the HTML for visitors without JavaScript.

## Stack

React 18, TypeScript, Vite 5, Tailwind CSS 3, React Router 6. Fonts (Fraunces
and Figtree) are self-hosted via `@fontsource-variable`, so the site loads no
third-party resources at runtime.
