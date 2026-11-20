# Contributing

Odigos is a privacy-first dealer quote analyzer for U.S. car buyers. The hosted site at [odigosauto.com](https://odigosauto.com) is the main way people use it. Self-hosting and code contributions are welcome.

## Before you open a pull request

- Run `npm test` and `npm run check`.
- Keep quote analysis working when optional services are unset. Do not add a key, analytics vendor, or payment requirement that self-hosters cannot turn off.
- Do not commit `.env` files or live credentials.
- The MIT license in `LICENSE` covers contributions.

## State fee corrections

Caps and tax rates live in [`data/state_fees.json`](data/state_fees.json). A change needs a statute, regulation, DMV, revenue department, or state attorney-general page that states the value. The review steps are in [`data/README.md`](data/README.md). Use the state dataset correction issue template when you have a source but not a patch yet.

Do not add a citation you have not opened. If you cannot find a primary source, leave `"source_status": "needs_source"`.

## Bug reports

Include the state, the dealer text with personal details removed, and what you expected the verdict to be. Do not paste a quote that still contains a name, phone number, email address, or street address.

## Conduct

This project uses the [Contributor Covenant](CODE_OF_CONDUCT.md).
