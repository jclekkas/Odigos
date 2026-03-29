import { getMetricsSummary, getTechnicalSummary, getPaymentCountLastNHours } from "./metrics";

const REPLIT_DB_URL = process.env.REPLIT_DB_URL;

async function kvGet(key: string): Promise<string | null> {
  if (!REPLIT_DB_URL) return null;
  try {
    const res = await fetch(`${REPLIT_DB_URL}/${encodeURIComponent(key)}`);
    if (res.status === 404) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function kvSet(key: string, value: string): Promise<void> {
  if (!REPLIT_DB_URL) return;
  try {
    await fetch(REPLIT_DB_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    });
  } catch (error) {
    console.error("[alerts] KV set failed:", error);
  }
}

const ALERTS_STATE_KEY = "odigos_alerts_state_v1";

let _inMemoryState: AlertsState | null = null;

export type Comparator = "lt" | "gt" | "eq";

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  metric: string;
  comparator: Comparator;
  threshold: number;
  cooldownMs: number;
}

export interface AlertFiredRecord {
  ruleId: string;
  firedAt: string;
  value: number;
}

export interface AlertStatus {
  ruleId: string;
  name: string;
  description: string;
  metric: string;
  comparator: Comparator;
  threshold: number;
  currentValue: number | null;
  tripped: boolean;
  lastFiredAt: string | null;
}

interface AlertsState {
  lastFiredAt: Record<string, string>;
  recentFired: AlertFiredRecord[];
}

function envFloat(key: string, fallback: number): number {
  const v = process.env[key];
  if (v === undefined || v === "") return fallback;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
}

function envInt(key: string, fallback: number): number {
  const v = process.env[key];
  if (v === undefined || v === "") return fallback;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

function buildDefaultRules(): AlertRule[] {
  const rules: AlertRule[] = [
    {
      id: "submission_to_checkout_conversion",
      name: "Low Submission-to-Checkout Conversion",
      description: `Fires when the submission-to-checkout conversion rate falls below the configured threshold`,
      metric: "submissionToCheckoutRate",
      comparator: "lt",
      threshold: envFloat("ALERT_CONVERSION_THRESHOLD", 10),
      cooldownMs: envInt("ALERT_CONVERSION_COOLDOWN_MIN", 30) * 60 * 1000,
    },
    {
      id: "api_error_rate_high",
      name: "High API Error Rate",
      description: `Fires when the overall API error rate exceeds the configured threshold`,
      metric: "overallErrorRate",
      comparator: "gt",
      threshold: envFloat("ALERT_ERROR_RATE_THRESHOLD", 5),
      cooldownMs: envInt("ALERT_ERROR_RATE_COOLDOWN_MIN", 30) * 60 * 1000,
    },
    {
      id: "no_payments_24h",
      name: "No Payments in Lookback Window",
      description: `Fires when there have been zero payments in the last ${envInt("ALERT_NO_PAYMENTS_LOOKBACK_HOURS", 24)} hours (configurable via ALERT_NO_PAYMENTS_LOOKBACK_HOURS)`,
      metric: "paymentsLast24h",
      comparator: "eq",
      threshold: 0,
      cooldownMs: envInt("ALERT_NO_PAYMENTS_COOLDOWN_MIN", 240) * 60 * 1000,
    },
  ];

  const extraJson = process.env.ALERT_EXTRA_RULES;
  if (extraJson) {
    try {
      const extra: AlertRule[] = JSON.parse(extraJson);
      if (Array.isArray(extra)) {
        for (const r of extra) {
          if (r.id && r.metric && r.comparator && r.threshold !== undefined) {
            rules.push(r);
          }
        }
      }
    } catch (err) {
      console.error("[alerts] Failed to parse ALERT_EXTRA_RULES:", err);
    }
  }

  return rules;
}

let _cachedRules: AlertRule[] | null = null;

function getActiveRules(): AlertRule[] {
  if (!_cachedRules) {
    _cachedRules = buildDefaultRules();
    console.log(`[alerts] Loaded ${_cachedRules.length} alert rules`);
  }
  return _cachedRules;
}

async function loadAlertsState(): Promise<AlertsState> {
  if (!REPLIT_DB_URL) {
    if (!_inMemoryState) _inMemoryState = { lastFiredAt: {}, recentFired: [] };
    return _inMemoryState;
  }
  try {
    const data = await kvGet(ALERTS_STATE_KEY);
    if (data) {
      const parsed: AlertsState = JSON.parse(data);
      _inMemoryState = parsed;
      return parsed;
    }
  } catch {
  }
  if (_inMemoryState) return _inMemoryState;
  return { lastFiredAt: {}, recentFired: [] };
}

async function saveAlertsState(state: AlertsState): Promise<void> {
  const trimmed = state.recentFired.slice(-100);
  const next: AlertsState = { ...state, recentFired: trimmed };
  _inMemoryState = next;
  if (!REPLIT_DB_URL) return;
  await kvSet(ALERTS_STATE_KEY, JSON.stringify(next));
}

async function resolveMetricValue(metric: string): Promise<number | null> {
  try {
    if (metric === "submissionToCheckoutRate") {
      const summary = await getMetricsSummary();
      if (summary.totalSubmissions === 0) return null;
      return (summary.totalCheckouts / summary.totalSubmissions) * 100;
    }

    if (metric === "overallErrorRate") {
      const tech = await getTechnicalSummary();
      return tech.overallErrorRate;
    }

    if (metric === "paymentsLast24h") {
      const lookbackHours = envInt("ALERT_NO_PAYMENTS_LOOKBACK_HOURS", 24);
      return await getPaymentCountLastNHours(lookbackHours);
    }
  } catch (err) {
    console.error(`[alerts] Failed to resolve metric "${metric}":`, err);
  }
  return null;
}

function evaluate(value: number, comparator: Comparator, threshold: number): boolean {
  if (comparator === "lt") return value < threshold;
  if (comparator === "gt") return value > threshold;
  if (comparator === "eq") return value === threshold;
  return false;
}

async function sendWebhookAlert(rule: AlertRule, value: number): Promise<void> {
  const webhookUrl = process.env.ALERT_WEBHOOK_URL;
  if (!webhookUrl) return;

  const comparatorLabel = rule.comparator === "lt" ? "below" : rule.comparator === "gt" ? "above" : "equal to";
  const text = `*ALERT: ${rule.name}*\n${rule.description}\nCurrent value: *${value.toFixed(2)}* (threshold: ${comparatorLabel} ${rule.threshold})\nTime: ${new Date().toISOString()}`;

  const payload = {
    text,
    username: "Odigos Alerts",
  };

  try {
    const resp = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      console.error(`[alerts] Webhook delivery failed (${resp.status}): ${await resp.text()}`);
    } else {
      console.log(`[alerts] Webhook sent for rule "${rule.id}"`);
    }
  } catch (err) {
    console.error(`[alerts] Webhook fetch error:`, err);
  }
}

async function sendEmailAlert(rule: AlertRule, value: number): Promise<void> {
  const smtpUrl = process.env.ALERT_SMTP_URL;
  const emailTo = process.env.ALERT_EMAIL_TO;
  if (!smtpUrl || !emailTo) return;

  try {
    const nodemailer = await import("nodemailer");
    const transport = nodemailer.default.createTransport(smtpUrl);
    const comparatorLabel = rule.comparator === "lt" ? "below" : rule.comparator === "gt" ? "above" : "equal to";
    await transport.sendMail({
      from: process.env.ALERT_EMAIL_FROM || "alerts@odigosauto.com",
      to: emailTo,
      subject: `[Odigos Alert] ${rule.name}`,
      text: `Alert: ${rule.name}\n\n${rule.description}\n\nCurrent value: ${value.toFixed(2)}\nThreshold: ${comparatorLabel} ${rule.threshold}\nTime: ${new Date().toISOString()}`,
    });
    console.log(`[alerts] Email sent for rule "${rule.id}" to ${emailTo}`);
  } catch (err) {
    console.error(`[alerts] Email delivery error:`, err);
  }
}

async function sendAlert(rule: AlertRule, value: number): Promise<void> {
  await Promise.allSettled([sendWebhookAlert(rule, value), sendEmailAlert(rule, value)]);
}

export async function createSmtpTransport(): Promise<import("nodemailer").Transporter | null> {
  const smtpUrl = process.env.ALERT_SMTP_URL;
  if (!smtpUrl) return null;
  const nodemailer = await import("nodemailer");
  return nodemailer.default.createTransport(smtpUrl);
}

export async function checkAlerts(): Promise<void> {
  console.log("[alerts] Running scheduled alert check...");
  const state = await loadAlertsState();
  const now = Date.now();
  let stateChanged = false;

  for (const rule of getActiveRules()) {
    const value = await resolveMetricValue(rule.metric);

    if (value === null) {
      console.log(`[alerts] Skipping rule "${rule.id}" — metric unavailable`);
      continue;
    }

    const tripped = evaluate(value, rule.comparator, rule.threshold);

    if (tripped) {
      const lastFired = state.lastFiredAt[rule.id];
      const cooldownOk = !lastFired || now - new Date(lastFired).getTime() >= rule.cooldownMs;

      if (cooldownOk) {
        console.log(`[alerts] Rule "${rule.id}" tripped (value=${value}, threshold=${rule.threshold}) — sending alert`);
        await sendAlert(rule, value);

        state.lastFiredAt[rule.id] = new Date().toISOString();
        state.recentFired.push({ ruleId: rule.id, firedAt: new Date().toISOString(), value });
        stateChanged = true;
      } else {
        console.log(`[alerts] Rule "${rule.id}" tripped but still in cooldown — skipping`);
      }
    } else {
      console.log(`[alerts] Rule "${rule.id}" OK (value=${value.toFixed(2)})`);
    }
  }

  if (stateChanged) {
    await saveAlertsState(state);
  }
}

export async function getAlertsStatus(): Promise<{
  rules: AlertStatus[];
  recentFired: AlertFiredRecord[];
  webhookConfigured: boolean;
  smtpConfigured: boolean;
  webhookUrlMasked: string | null;
}> {
  const state = await loadAlertsState();

  const metricValues: Record<string, number | null> = {};
  await Promise.allSettled(
    getActiveRules().map(async (rule) => {
      metricValues[rule.metric] = await resolveMetricValue(rule.metric);
    })
  );

  const rules: AlertStatus[] = getActiveRules().map((rule) => {
    const currentValue = metricValues[rule.metric] ?? null;
    const tripped = currentValue !== null ? evaluate(currentValue, rule.comparator, rule.threshold) : false;
    return {
      ruleId: rule.id,
      name: rule.name,
      description: rule.description,
      metric: rule.metric,
      comparator: rule.comparator,
      threshold: rule.threshold,
      currentValue,
      tripped,
      lastFiredAt: state.lastFiredAt[rule.id] ?? null,
    };
  });

  const webhookUrl = process.env.ALERT_WEBHOOK_URL ?? null;
  let webhookUrlMasked: string | null = null;
  if (webhookUrl) {
    try {
      const u = new URL(webhookUrl);
      webhookUrlMasked = `${u.protocol}//${u.hostname}/***`;
    } catch {
      webhookUrlMasked = "***configured***";
    }
  }

  return {
    rules,
    recentFired: state.recentFired.slice(-20).reverse(),
    webhookConfigured: !!webhookUrl,
    smtpConfigured: !!(process.env.ALERT_SMTP_URL && process.env.ALERT_EMAIL_TO),
    webhookUrlMasked,
  };
}

export function startAlertScheduler(intervalMs?: number): void {
  const resolvedMs = intervalMs ?? envInt("ALERT_CHECK_INTERVAL_MIN", 30) * 60 * 1000;
  console.log(`[alerts] Scheduler started — checking every ${resolvedMs / 60000} minutes`);
  setInterval(() => {
    checkAlerts().catch((err) => console.error("[alerts] checkAlerts error:", err));
  }, resolvedMs);
}
