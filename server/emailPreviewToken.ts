/**
 * Signed carrier for the "email me my analysis" feature.
 *
 * POST /api/email-preview used to accept the recipient address *and* the email
 * body straight from the request. Nothing proved the body came from a real
 * analysis, so anyone could ask the server to send arbitrary text to an
 * arbitrary address from alerts@odigosauto.com — a working phishing relay
 * wearing the site's own domain.
 *
 * The fix: /api/analyze signs the emailable fields and hands the client an
 * opaque token. The email route reads its content *out of the token* and
 * ignores any body the caller supplies, so the only text that can ever be
 * mailed is text this server produced.
 *
 * The token is deliberately not a session or an entitlement — it proves
 * provenance of the content, nothing about who is asking.
 */
import crypto from "node:crypto";
import { z } from "zod";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export const emailablePayloadSchema = z.object({
  goNoGo: z.string().max(40),
  verdictLabel: z.string().max(200),
  confidenceLevel: z.string().max(40),
  missingInfo: z
    .array(z.object({ field: z.string().max(120), question: z.string().max(400) }))
    .optional(),
  detectedFields: z.record(z.unknown()).optional(),
  summary: z.string().max(2000).optional(),
});

export type EmailablePayload = z.infer<typeof emailablePayloadSchema>;

/**
 * Signing key. EMAIL_TOKEN_SECRET is preferred; SESSION_SECRET is accepted so
 * an existing deployment that already sets one doesn't need a second variable.
 *
 * There is no fallback default on purpose. A hardcoded key would be public in
 * the repo and forgeable by anyone, which is the exact hole being closed, so
 * with neither variable set the email feature reports itself unconfigured and
 * declines to send.
 */
function getSigningSecret(): string | null {
  const secret = process.env.EMAIL_TOKEN_SECRET || process.env.SESSION_SECRET;
  return secret && secret.length > 0 ? secret : null;
}

export function isEmailTokenConfigured(): boolean {
  return getSigningSecret() !== null;
}

function base64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64url(value: string): Buffer {
  return Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

function hmac(secret: string, encoded: string): string {
  return base64url(crypto.createHmac("sha256", secret).update(encoded).digest());
}

/**
 * Wrap the emailable fields in a signed, time-limited token.
 *
 * Returns null when no signing secret is configured, or when the analysis
 * payload doesn't carry the fields the email needs — callers treat a null as
 * "this result can't be emailed" rather than as an error.
 */
export function signEmailPayload(input: unknown): string | null {
  const secret = getSigningSecret();
  if (!secret) return null;

  const parsed = emailablePayloadSchema.safeParse(input);
  if (!parsed.success) return null;

  const payload: EmailablePayload = {
    ...parsed.data,
    missingInfo: parsed.data.missingInfo?.slice(0, 3),
  };

  const body = JSON.stringify({ p: payload, exp: Date.now() + TOKEN_TTL_MS });
  const encoded = base64url(Buffer.from(body, "utf8"));
  return `${encoded}.${hmac(secret, encoded)}`;
}

/**
 * Recover the payload from a token, or null if the token is missing, malformed,
 * expired, or not signed by this server.
 */
export function verifyEmailToken(token: unknown): EmailablePayload | null {
  const secret = getSigningSecret();
  if (!secret || typeof token !== "string") return null;

  const split = token.lastIndexOf(".");
  if (split <= 0) return null;

  const encoded = token.slice(0, split);
  const provided = token.slice(split + 1);
  const expected = hmac(secret, encoded);

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(fromBase64url(encoded).toString("utf8"));
  } catch {
    return null;
  }

  const envelope = z
    .object({ p: emailablePayloadSchema, exp: z.number() })
    .safeParse(parsed);
  if (!envelope.success) return null;
  if (envelope.data.exp < Date.now()) return null;

  return envelope.data.p;
}
