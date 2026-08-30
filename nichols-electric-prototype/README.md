# Nichols Electric LLC — website prototype

A speculative redesign concept for **Nichols Electric LLC**, Luray, Virginia.
Static, responsive, no build step, no backend. Drop the zip into Netlify and it runs.

> **This is not the company's live or authorized website.** A disclaimer bar sits at
> the top of every page and in the footer, and search engines are blocked via
> `robots.txt` plus a `noindex` header.

---

## Deploy

**Netlify Drop (fastest):** go to <https://app.netlify.com/drop> and drag in
`nichols-electric-prototype.zip`. The zip has `index.html` at its root, which is what
Netlify Drop expects.

**Git deploy:** point Netlify at this folder. `netlify.toml` sets `publish = "."`
with no build command.

**Locally:**

```bash
cd nichols-electric-prototype
python3 -m http.server 8080     # then open http://localhost:8080
```

---

## What to change before showing it to the client

Everything owner-specific lives in **one file**: `assets/js/config.js`.

### 1. Phone number

The current site publishes more than one number, so the prototype shows the token
`[PRIMARY PHONE]` and points every Call button at the contact section. Once the owner
confirms the customer-facing number, flip three values and every phone reference plus
every `tel:` one-tap dial goes live:

```js
phone: {
  confirmed: true,
  display: '(540) 743-5028',
  tel: '+15407435028'
}
```

### 2. Photography

All images are **clearly labeled placeholders** — abstract tiles with a "Placeholder"
badge. Nothing pretends to be a photo of Nichols' work, and no stock photography or
AI-generated people are used anywhere.

To drop in real project photos:

1. Put the files in `assets/img/` (JPG or WebP, roughly 1600px on the long edge).
2. Update the `gallery` array in `assets/js/config.js` — `src`, `caption`, `w`, `h`,
   and set `placeholder: false` to remove the badge. `tall: true` makes an image span
   an extra row in the grid.
3. Replace `assets/img/hero.svg` and `assets/img/feature-project.svg` (referenced
   directly in `index.html`), and delete their `<span class="media-flag">` badges.

Caption rule from the brief: only label an image when the project type is visually
certain. Otherwise leave it as "Recent Project."

---

## Structure

```
index.html              homepage — all eleven sections
404.html                branded not-found page
netlify.toml            publish dir, security + cache headers, noindex
robots.txt              blocks indexing of the prototype
assets/css/styles.css   full stylesheet, design tokens at the top
assets/js/config.js     phone + gallery — the only file an owner needs to edit
assets/js/main.js       menu, lightbox, form validation, reveal animations
assets/img/             placeholder imagery (SVG, generated locally)
ASSUMPTIONS.md          what must be confirmed before this could go live
```

Homepage sections, in order: header · hero · trust strip · services · "built for bigger
projects" · project gallery · why Nichols · who we help · service area · estimate form ·
footer. Navigation links are in-page anchors, so there are no broken links.

## Future page architecture

The homepage sections map one-to-one onto the deeper pages this could grow into:
`/electrical-services`, `/new-construction`, `/remodels`, `/generators`,
`/commercial-electrical`, `/projects`, `/contact`. Each would reuse the same section
components and the same estimate form with the service type preselected — the mechanism
is already in place (`data-service` on a link presets the form's dropdown). Location
pages should only be created for towns the business actually serves, which is an open
question (see `ASSUMPTIONS.md`).

## Design notes

- Warm off-white paper (`#F6F3EE`), charcoal ink, deep navy structure, one workwear
  accent (`#C2570F`). Squared corners, hairline rules, no gradients or lightning bolts.
- Type: Archivo (headings) + Inter (body), loaded from Google Fonts with a system-font
  fallback stack.
- Mobile: sticky bottom Call / Get Estimate bar, 44px+ tap targets everywhere, 16px
  form inputs (no iOS zoom), no horizontal overflow at 390px.
- Accessibility: skip link, semantic landmarks and heading order, labeled form fields
  with inline errors, keyboard-operable menu and lightbox (Esc / arrows / focus
  trapping), visible focus rings, `prefers-reduced-motion` respected.
- Performance: no framework, no bundler, ~30KB of CSS+JS, SVG imagery, lazy-loaded
  below-the-fold images.
