import crypto from "node:crypto";
import { insertAuditLog } from "./storage";
import type { AuditEventType, AuditOutcome } from "./storage";

export function sha256Hex(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function getRequestIp(req: any): string {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.trim()) return xff.split(",")[0].trim();
  return req.ip || req.socket?.remoteAddress || "unknown";
}

export function hashRequestContext(req: any) {
  const ip = getRequestIp(req);
  const ua = typeof req.headers["user-agent"] === "string"
    ? req.headers["user-agent"] : "unknown";
  return { ipHash: sha256Hex(ip), userAgentHash: sha256Hex(ua) };
}

export function redactAuditMeta(meta: Record<string, unknown>): Record<string, unknown> {
  const clone = { ...meta };
  for (const key of ["rawText", "submittedText", "text", "fileText", "email", "phone", "address", "name"]) {
    delete clone[key];
  }
  return clone;
}

export async function writeAuditEvent(
  req: any,
  eventType: AuditEventType,
  outcome: AuditOutcome,
  meta: Record<string, unknown>,
) {
  try {
    const { ipHash, userAgentHash } = hashRequestContext(req);
    await insertAuditLog({
      eventType,
      ipHash,
      userAgentHash,
      outcome,
      meta: redactAuditMeta(meta),
    });
  } catch (err) {
    console.error("audit_log write failed", err);
  }
}
