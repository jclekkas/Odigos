# Luxury development site — concept prototype

**This is an unsolicited concept prototype. No client commissioned it, and it represents no real
company.** It was built as a portfolio piece and as a demonstration of what a luxury home development
and investment site can look like when it is designed rather than assembled from a template.

**Every figure on these pages is a placeholder.** Anything shown in square brackets —
`[YEAR FOUNDED]`, `[HOMES DELIVERED]`, `[SQ FT]`, `[EMAIL]`, `[DRE / LICENCE NUMBER]` and the rest —
is a token awaiting a real value. There are no invented years in business, homes delivered, dollar
volumes, awards, testimonials, team biographies or client names anywhere in the build, and none may be
added without the person supplying them.

**The contact form does not submit anywhere.** It has no action and no backend. Submitting it is
intercepted in JavaScript, and an inline confirmation replaces the form. Nothing is sent, stored or
emailed.

**The investor section is not an offer.** It contains no projected returns, no IRR, no cash-on-cash
figures, no minimums and no solicitation language, and it carries a standing informational footnote.
It invites a conversation and nothing more.

---

## Running it

Open `index.html` in a browser. That is the whole procedure.

There is no build step, no bundler, no `package.json` and no server. The files work from the
filesystem, and they work with the network disconnected — the two Google Fonts families fall back to
Georgia and the system UI stack, and nothing renders blank.

## What is here

```
index.html            homepage
property.html         single development page
animation-test.html   standalone harness for the construction sequence — keep it
assets/css/site.css   the only stylesheet
assets/js/brand.js    the BRAND object
assets/js/site.js     replay, sticky header, scroll reveals, menu, lightbox, form
assets/img/grain.svg  the grain overlay used by the image placeholders
assets/img/og-share.svg  placeholder share image
BRAND.md              how to swap the company name and palette
IMAGES.md             the shot list, with dimensions
```

## What is real, what is placeholder, what is not wired

**Real, in the sense that it works:** the construction animation, the scroll reveals, the sticky
header, the mobile menu, the gallery lightbox (click, Escape, click-outside, arrow keys), the hover
states, the responsive layout, the focus states, the metadata and the JSON-LD.

**Placeholder:**

- Every bracket token, as above.
- The brand. `STONE & CANYON` is a fictional name chosen for the portfolio version. See BRAND.md.
- All photography. There is none. Every image slot is a CSS-gradient placeholder labelled with the
  shot it wants and the pixel dimensions it needs. IMAGES.md is the matching shot list.
- The three developments — Sycamore Reach, Canyon Ridge and The Bluff House — are fictional projects
  at real Southern California place names. They describe no actual property.
- `https://example.com` in the canonical and Open Graph URLs. Replace with the real origin.

**Not wired:**

- The contact form, as above.
- All three development cards link to the same `property.html`. That is deliberate — one property page
  proves the pattern — but it means "Canyon Ridge" and "The Bluff House" both open Sycamore Reach.
- "View all developments" and "All developments" also point at `property.html`; there is no index page.
- The "Next development" band at the foot of the property page links back to `property.html` itself.
- The footer has no social links and no newsletter. Both are out of scope.

## The construction animation

A 5.2-second sequence taking a house from empty lot to finished residence: site and survey stakes,
footings and slab, framing and rafters, wall and roof planes, glazing, then planting and interior
light. It is one inline `<svg>` driven entirely by CSS `@keyframes` and `animation-delay`. There is no
animation library and no JavaScript timeline. Only `stroke-dashoffset`, `opacity` and `transform` are
animated.

It plays once on load and holds the finished frame. The **Replay** control bottom-right of the hero
restarts it.

How the degraded states work: the animation is scoped to `.constr.is-armed`, a class only JavaScript
adds. The static state of the drawing *is* the finished house. So with scripting disabled the drawing
simply renders complete, and replay is a class remove / reflow / re-add. Under
`prefers-reduced-motion: reduce` the animation is suppressed and the Replay control is hidden. The
held frame and the no-JS frame are equivalent — verified by comparing computed `opacity`,
`fill-opacity`, `stroke-opacity` and `stroke-dashoffset` across every element in both states.

Below 900px the drawing drops its right-hand return, half its studs, three rafters and two shrubs
(`.m-drop`) and plays the same timeline as a simpler front elevation.

`animation-test.html` is the harness the sequence was built in. It has a scrubber, built on the Web
Animations API, that freezes the sequence at any point. That scrubber exists only in the harness; it
is not part of the site.

## Deliberate departures from the brief

- **Bronze was darkened.** The brief's `#8A6A46` gives 4.40:1 on the bone background, short of WCAG AA
  for normal text. The accent token ships as `#7A5A38`, which is 5.53:1. The original value survives as
  `--brand-bronze-soft` and is used only for line work in the drawings, never for text. Dark sections
  use `--brand-bronze-lift` (`#C79A5F`, 7.04:1 on ink). Clay is never applied to text — it fails AA on
  bone — so `--brand-clay-deep` exists for the cases that need it.
- **The hero display size is capped at 78px rather than ~96px.** At 96px the headline needs roughly 650px
  of measure, which cannot coexist with an open right third on a 1440px screen; the drawing and the type
  would collide. 78px keeps the headline genuinely large and the composition clear.
- **The default brand is fictional, not TATZ.** The brief names TATZ as the shipped default. Shipping a
  real company's name — plus an invented legal name for it — on an unsolicited prototype conflicts with
  the rule that nothing in the build may claim to be real. The portfolio-neutral brand is the default;
  BRAND.md documents the one-block change that turns it into the TATZ pitch.
- **The mobile menu is a `<details>` element** rather than a JavaScript overlay, so it still opens with
  scripting disabled. JavaScript only adds Escape-to-close and the scroll lock.

## Browser notes

Requires support for CSS custom properties, `clamp()`, `aspect-ratio`, `transform-box: view-box` and
`IntersectionObserver` — all of which have been baseline for years. Without `IntersectionObserver` the
reveal content is shown immediately rather than hidden.
