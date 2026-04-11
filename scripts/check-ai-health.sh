#!/usr/bin/env bash
#
# check-ai-health.sh — verify the /api/analyze AI pipeline is configured
# and reachable on a given deployment.
#
# Usage:
#   scripts/check-ai-health.sh <base-url>
#   scripts/check-ai-health.sh https://odigosauto.com
#   scripts/check-ai-health.sh http://localhost:5000
#
# Exits 0 if the deployment reports ai.configured == true, 1 otherwise.
# Prints the resolved primary/fallback model names and a one-shot /api/analyze
# probe with whatever error code comes back so you can diagnose without
# opening Sentry.

set -euo pipefail

BASE_URL="${1:-}"
if [[ -z "$BASE_URL" ]]; then
  echo "Usage: $0 <base-url>" >&2
  echo "  e.g. $0 https://odigosauto.com" >&2
  exit 2
fi

# Strip any trailing slash so URL joining is clean.
BASE_URL="${BASE_URL%/}"

if ! command -v jq >/dev/null 2>&1; then
  echo "error: jq is required (brew install jq / apt-get install jq)" >&2
  exit 2
fi

echo "==> GET ${BASE_URL}/api/health"
HEALTH_JSON="$(curl -fsS --max-time 10 "${BASE_URL}/api/health")" || {
  echo "error: /api/health is unreachable at ${BASE_URL}" >&2
  exit 1
}

echo "$HEALTH_JSON" | jq '{ status, initialized, ai }'

AI_CONFIGURED="$(echo "$HEALTH_JSON" | jq -r '.ai.configured')"
AI_MODEL="$(echo "$HEALTH_JSON" | jq -r '.ai.model // "unknown"')"
AI_FALLBACK="$(echo "$HEALTH_JSON" | jq -r '.ai.fallbackModel // "unknown"')"

if [[ "$AI_CONFIGURED" != "true" ]]; then
  cat <<EOF >&2

✗ ai.configured is false — the deployment has no OpenAI API key set.

  Fix: set AI_INTEGRATIONS_OPENAI_API_KEY (or OPENAI_API_KEY) on the
  Vercel project and redeploy:

    vercel env add AI_INTEGRATIONS_OPENAI_API_KEY production
    vercel --prod

EOF
  exit 1
fi

echo ""
echo "✓ ai.configured = true"
echo "  primary  model: ${AI_MODEL}"
echo "  fallback model: ${AI_FALLBACK}"
echo ""

# Optional: probe the analyze endpoint with a minimal payload. This will
# actually invoke the AI — skip with NO_PROBE=1 if you don't want to burn
# tokens or cannot hit the endpoint (rate limit, auth wall, etc.).
if [[ "${NO_PROBE:-0}" == "1" ]]; then
  echo "NO_PROBE=1 — skipping /api/analyze probe."
  exit 0
fi

echo "==> POST ${BASE_URL}/api/analyze (minimal probe)"
PROBE_BODY='{"dealerText":"Health check probe: OTD $25,000, APR 5.9%, 60 months. TX dealer."}'

# Capture both status and body so we can show a useful diagnostic on failure.
HTTP_RESPONSE="$(curl -sS --max-time 40 \
  -o /tmp/odigos-probe-body.$$ \
  -w '%{http_code}' \
  -H 'content-type: application/json' \
  -d "$PROBE_BODY" \
  "${BASE_URL}/api/analyze" || true)"
PROBE_STATUS="$HTTP_RESPONSE"
PROBE_BODY_OUT="$(cat /tmp/odigos-probe-body.$$ 2>/dev/null || echo '{}')"
rm -f /tmp/odigos-probe-body.$$

echo "  status: ${PROBE_STATUS}"
echo "  body:   $(echo "$PROBE_BODY_OUT" | jq -c '{ error, code, debugCode, requestId, retryAfter, message }' 2>/dev/null || echo "$PROBE_BODY_OUT")"

case "$PROBE_STATUS" in
  200)
    echo ""
    echo "✓ /api/analyze returned 200 — the full pipeline is healthy."
    exit 0
    ;;
  402)
    echo ""
    echo "✗ 402 insufficient_quota — OpenAI billing is out of credit. Top up the account." >&2
    exit 1
    ;;
  429)
    echo ""
    echo "✗ 429 rate limit — transient. Wait for retryAfter and re-run." >&2
    exit 1
    ;;
  502)
    ERR_CODE="$(echo "$PROBE_BODY_OUT" | jq -r '.code // .debugCode // "unknown"')"
    echo ""
    echo "✗ 502 — AI provider error. code=${ERR_CODE}" >&2
    echo "  Look up the requestId in OpenAI's dashboard for details." >&2
    exit 1
    ;;
  503)
    echo ""
    echo "✗ 503 — service temporarily unavailable (circuit breaker or config). Re-run in 30s." >&2
    exit 1
    ;;
  504)
    echo ""
    echo "✗ 504 — AI service timeout. Re-run; if persistent, check OpenAI status page." >&2
    exit 1
    ;;
  *)
    echo ""
    echo "✗ Unexpected status ${PROBE_STATUS}" >&2
    exit 1
    ;;
esac
