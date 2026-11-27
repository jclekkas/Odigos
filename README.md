# Odigos

Privacy-first dealer quote analyzer for U.S. car buyers.

Paste a dealer text, email, or quote. Odigos returns a GO / NO-GO verdict, the red flags it can support from the quote, and a draft reply you can send back. The hosted site at [odigosauto.com](https://odigosauto.com) is free and is the main way to use it. Self-hosting is optional.

Odigos is not a dealer and does not sell your quote as a lead. See [docs/INDEPENDENCE.md](docs/INDEPENDENCE.md).

## Features

These are what the current code does:

- **Paste, upload, or link.** Text, a screenshot, a photo, a PDF, or a public URL that can be turned into text.
- **GO / NO-GO verdict.** GREEN, YELLOW, or RED, with GO, NO-GO, or NEED-MORE-INFO.
- **Red flags.** Missing out-the-door price, payment-only quotes, market adjustments, expensive add-ons, and vague fees.
- **Doc fees over a state cap.** Where `data/state_fees.json` records a cap, a higher doc fee is a NO-GO. The statute string from that file is shown with the result.
- **Missing-info checklist and a draft reply.** Questions the quote did not answer, and text you can copy to the dealer.
- **State context.** Sales-tax rate, trade-in tax credit, and the typical doc-fee range from the state file are given to the model as context. They do not by themselves change the verdict color.
- **Lease checks.** When the quote looks like a lease, the rules look at money factor, residual, mileage, and acquisition fee.
- **State fee guides.** Public pages explain doc fees and out-the-door pricing. The comparison tables read the same rule file as the analyzer.

The full analysis on the hosted site is free. No account and no payment.

Figures marked `needs_source` in the state file were not confirmed against a statute for this release. Read [data/README.md](data/README.md) before you rely on a cap.

## Privacy

Submitted text is sent to the model server you configure. On the hosted site, that is the operator's provider. Names, emails, phone numbers, and similar patterns are redacted before anything is stored, and that redaction is best-effort. With no database configured, analyses stay in memory for the life of the process. See the in-app privacy page for the hosted site's retention rules.

Analytics, error tracking, email alerts, Stripe, and cloud backups stay off unless their environment variables are set.

## Self-hosting

You bring your own model key. If `OPENAI_API_KEY` is unset, analysis does not run. The repository does not contain a fallback key.

### Docker

```bash
cp .env.example .env
# set OPENAI_API_KEY, and OPENAI_BASE_URL / OPENAI_MODEL for Ollama or LM Studio
docker compose up --build
```

Open `http://localhost:5000`. Postgres is not required. To store data, start the optional database and point `DATABASE_URL` at it:

```bash
docker compose --profile with-db up --build
```

Use `DATABASE_URL=postgresql://odigos:odigos@db:5432/odigos` in that mode. The `db` hostname works on the compose network.

### Local setup

Requirements: Node.js 20.

```bash
npm ci
cp .env.example .env
npm run dev
```

The dev server listens on port 5000. Quote analysis needs `OPENAI_API_KEY`. A database is optional.

### Model server

Any server that implements the OpenAI Chat Completions API works.

| Setup | `OPENAI_BASE_URL` | `OPENAI_MODEL` |
| --- | --- | --- |
| OpenAI | leave unset | `gpt-4o` (the default) |
| Ollama | `http://127.0.0.1:11434/v1` | the model you pulled, such as `llama3.1` |
| LM Studio | `http://127.0.0.1:1234/v1` | the model loaded in LM Studio |

`OPENAI_API_KEY` still has to be non-blank for local servers that ignore the key. Use any placeholder the server accepts.

Older `AI_INTEGRATIONS_OPENAI_*` variable names still work when the matching `OPENAI_*` variable is blank. They exist so the hosted deployment keeps running. Prefer the `OPENAI_*` names.

On a custom base URL the app does not fall back to `gpt-4o-mini` unless you set `OPENAI_FALLBACK_MODEL`.

### Email a copy of the analysis

The results page can mail the verdict to an address the visitor types. That path is not an open relay. `/api/analyze` signs the verdict, and `/api/email-preview` sends only the text inside that signature.

`EMAIL_TOKEN_SECRET` is the HMAC key. If it is unset or blank, the server uses `SESSION_SECRET`. `ALERT_SMTP_URL` is the mail transport. The form is shown only when both are set: a signing secret, and `ALERT_SMTP_URL` as a non-blank URL (whitespace counts as unset). If either is missing, `/api/analyze` does not issue an `emailToken` and the form stays hidden. A direct `POST /api/email-preview` still returns 503 — `SMTP_NOT_CONFIGURED` when the secret is set but SMTP is not, and `EMAIL_NOT_CONFIGURED` when no signing secret is set. The repository does not contain a fallback key. Setting `ALERT_SMTP_URL` and a signing secret makes the form appear again with no code change.

Docker Compose passes `EMAIL_TOKEN_SECRET`, `SESSION_SECRET`, and `ALERT_SMTP_URL` through from `.env`. A self-hosted server is reached at `http://localhost:5000`, including when `NODE_ENV=production`. `GET /api/health` stays unauthenticated and returns `status` for that process and for Docker or CI probes. On the hosted site, where `VERCEL` is set, a localhost browser origin is not accepted.

## Development

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm test` | Unit, API, and component tests |
| `npm run check` | Typecheck |
| `npm run lint` | ESLint |
| `npm run build` | Production client and server bundle |
| `npm start` | Run the production bundle |
| `npm run test:e2e` | Playwright. Needs a running server and browser |

`npx tsx scripts/export-state-fees-csv.ts` rewrites `data/state_fees.csv` after a JSON edit.

How the verdict is chosen: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). State-fee corrections need a page that states the number. The review steps are in [data/README.md](data/README.md).

Community expectations are in [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). A short note on helping the project is in [docs/SUPPORT.md](docs/SUPPORT.md).

## License

[MIT](LICENSE). Copyright 2025-2026 jclekkas.
