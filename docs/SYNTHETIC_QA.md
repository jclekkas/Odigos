# Synthetic QA submissions

Odigos uses fake quotes to test the analyzer. Those quotes must not become customer data.

A submission is synthetic when either of these is true on the request that arrived:

- the field `synthetic` is true, or
- the dealer text or a second quote contains the marker `ODIGOS_SYNTHETIC_QA`

That answer is decided once, when the request starts. The rest of the analysis cannot change it. A later step cannot turn a test quote into a real one. The model’s reply cannot turn a real quote into a test, or a test into a real quote.

## What is not saved

For a synthetic submission, Odigos does not write:

- the quote database (`dealer_submissions`)
- the warehouse tables that feed stats
- the main analysis events (score, state, validation)
- the audit row for that analysis
- file-upload and URL-import events
- the extra API and model-call counters for that request
- browser analytics and the site’s own tracking for that submission (including upload and link-import failures)

The response is still returned to the tester. Nothing about the quote is added to the product’s history.

## What is still saved

Security logs stay on, including for a synthetic caller. They exist to spot abuse. They do not store the quote.

| Log | Why it stays |
| --- | --- |
| Audit event `rate_limit_breach` | Someone is sending too many requests. Rate limiting has to remember that even if the request was a test quote. |
| Metrics event `rate_limit_breach` | Same abuse signal, if a counter is recorded for it. |

No other audit or analytics event is a security exception.
