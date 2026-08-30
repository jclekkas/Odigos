# ASSUMPTIONS — Nichols Electric LLC prototype

This is an **unofficial speculative redesign prototype**. It is not an authorized
production website for Nichols Electric LLC.

Everything on the page came from publicly visible information about the business or
is generic, non-factual copy. Nothing about licensing, insurance, experience,
warranties, response times, guarantees or service radius has been invented. Where a
fact was needed and could not be verified, the prototype leaves a visible gap rather
than filling it.

## Research limitation to disclose

The environment used to build this prototype could not reach
`https://www.nichols-electricllc.com/` (outbound network access to that domain was
blocked). Site content and imagery therefore could **not** be read directly. The
prototype was built from the brief plus publicly listed business directory
information, and **all photography is a clearly labeled placeholder**. Before this
prototype is shown as a finished concept, the real site's copy, service list and
project photographs should be reviewed and pulled in.

## Used in the prototype

| Item | Value used | Source / status |
| --- | --- | --- |
| Business name | Nichols Electric LLC | Brief |
| Address | 1669 Valley Burg Road, Luray, VA 22835 | Brief (stated as verified) |
| Email | nicholselectric@centurylink.net | Brief; also printed on a company invoice |
| Phone | `[PRIMARY PHONE]` placeholder | **Not chosen** — see item 1 below |
| Logo | Extracted from a Nichols Electric invoice PDF | Authentic artwork — see item 21 below |
| Services | Repairs/troubleshooting, service upgrades, generators, remodels, custom homes & new construction, commercial & industrial | Brief, drawn from existing site capabilities |
| Photography | Labeled placeholders only | Real project photos not accessible |

## Owner verification checklist

Nothing below is answered in the prototype. Each one is a real gap.

1. **Which existing phone number is the primary customer-facing number?** Still open,
   and the evidence now points two ways:
   - **(540) 843-3882** — printed on a Nichols Electric customer invoice.
   - **(540) 743-5028** — listed in business directories.
   The current website publishes more than one number as well. The prototype therefore
   shows `[PRIMARY PHONE]` everywhere rather than picking one. Set the confirmed number
   once in `assets/js/config.js` and every phone reference plus one-tap dialing updates.
2. **Which phone number accepts text messages?** No SMS option is offered anywhere.
3. **Exact service territory / towns served?** The prototype says only "Based in
   Luray… contact us to confirm availability." No radius, county list or town list.
4. **Residential vs. commercial vs. industrial revenue mix?** Affects how much
   homepage weight commercial should carry. Currently residential-leaning with
   commercial clearly present.
5. **Do they actively want small service calls?** If not, the "Electrical Repairs &
   Troubleshooting" card and the Homeowners audience path should be de-emphasized.
6. **Which project types are most profitable or desirable?** Service card order and
   the "Built for bigger projects" section should follow the answer.
7. **Are they actively seeking new custom-home or builder relationships?** Determines
   whether a dedicated builders page is worth creating.
8. **Years in business?** Not stated anywhere on the prototype. A directory listing
   mentions "over 25 years," which is unverified and was intentionally left out.
9. **Electrician / contractor license information?** No license claim appears. Virginia
   contractor license class and number should be displayed once confirmed.
10. **Fully insured?** No insurance claim appears.
11. **Any warranties?** No warranty claim appears.
12. **Free estimates?** Not claimed. The CTA says "Request an Estimate," not "Free."
13. **Emergency service?** No 24/7 or emergency claim appears.
14. **Business hours?** No hours are published on the prototype.
15. **Owner / team names and bios?** No people are named. A short owner bio with a real
    photo would strengthen the "Why Nichols" section considerably.
16. **Which gallery photos correspond to which projects?** Captions are generic and
    conservative. Real captions need owner input.
17. **Permission to reuse current project photographs?** Required before any real photo
    is placed in this layout.
18. **Customer testimonials or reviews that may legally be reproduced?** No testimonials
    appear. A three-quote strip would slot in below "Why Nichols."
19. **Active Facebook or Instagram profiles?** No social icons appear, because no
    profile was confirmed as active and owner-controlled.
20. **Which email address should receive estimate requests?** The form is a mock and
    submits nowhere. A real endpoint (Netlify Forms, or an email handler) and a
    destination inbox are needed. `nicholselectric@centurylink.net` appears on the
    invoice, but it may not be where web leads should land.
21. **Is there a high-resolution or vector version of the logo?** The logo used here was
    lifted from the supplied invoice PDF, where it is embedded at only 121 × 109 pixels.
    It has been cleaned up, given a transparent background and a light variant for dark
    backgrounds, and it holds up at the sizes used (44px header mark, 172px footer
    lockup). An original vector file (AI/EPS/SVG) or a large PNG should be requested
    before any larger use — signage, print, or a full-width hero lockup.
22. **Which company name styling is correct?** The invoice reads "Nichols Electric, LLC"
    (with a comma); the site uses "Nichols Electric LLC" and the short form "Nichols
    Electric." Worth confirming which the owner prefers.

## Other decisions worth flagging

- **Copy tone.** The existing site's emotional language ("breathtaking reality," "your
  vision ignites our commitment") was replaced with concrete capability statements, per
  the brief.
- **"Personal Service."** This is the one positioning statement carried over from the
  existing site's own customer philosophy. Confirm the wording still reflects how the
  owner describes the business.
- **Search engines are blocked.** `robots.txt` and a `noindex` header/meta keep the
  prototype out of search results so it cannot compete with the live site. Remove them
  only if this ever becomes the authorized production site.
- **No backend.** The estimate form validates and shows a mock success state. Nothing is
  transmitted or stored.
- **Structured data.** The JSON-LD block intentionally omits `telephone` until the
  number is confirmed.
- **Invoice contents.** The sample invoice supplied for the logo also contained a
  customer's name, address and a job price. None of it appears in the prototype, and
  none of it should be used on a public site.
