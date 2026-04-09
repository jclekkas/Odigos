/**
 * Pass entitlement (client-side, localStorage-backed).
 *
 * Replaces the old `paid_deal_clarity = "true"` flag with a structured
 * time-windowed pass. Two products:
 *   - Weekend Warrior Pass: $29 / 72 hours unlimited scans
 *   - Car Buyer's Pass:     $49 / 14 days unlimited scans
 *
 * Both passes unlock identical features. Differentiation is purely the
 * shopping window. Enforcement is intentionally client-side — see the plan
 * file for the rationale.
 */

export type PassProductKey = "weekend_warrior" | "car_buyers_pass";

export interface PassProductInfo {
  label: string;
  shortLabel: string;
  priceCents: number;
  priceLabel: string;
  durationHours: number;
  durationLabel: string;
  tagline: string;
}

export const PASS_PRODUCTS: Record<PassProductKey, PassProductInfo> = {
  weekend_warrior: {
    label: "Weekend Warrior Pass",
    shortLabel: "Weekend",
    priceCents: 2900,
    priceLabel: "$29",
    durationHours: 72,
    durationLabel: "72 hours",
    tagline: "Only for 2–3 dealer quotes. Ideal if you're ready to decide this weekend.",
  },
  car_buyers_pass: {
    label: "Car Buyer's Pass",
    shortLabel: "Car Buyer",
    priceCents: 4900,
    priceLabel: "$49",
    durationHours: 14 * 24,
    durationLabel: "14 days",
    tagline: "Most buyers compare 4–6 quotes before deciding. Covers your entire car shopping process.",
  },
};

export interface ActivePass {
  productKey: PassProductKey;
  purchasedAt: number;
  expiresAt: number;
  source?: "purchase" | "legacy_migration";
}

const STORAGE_KEY = "odigos_pass";
const LEGACY_KEYS = [
  "paid_deal_clarity",
  "paid_negotiation_pack",
  "odigos_unlock_tier",
  "odigos_premium_unlocked",
];
const LEGACY_GRACE_DAYS = 30;

function isPassProductKey(value: unknown): value is PassProductKey {
  return value === "weekend_warrior" || value === "car_buyers_pass";
}

function safeStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Read the active pass from localStorage. Handles:
 *  - Validating the stored shape
 *  - Auto-clearing expired passes
 *  - Migrating legacy `paid_deal_clarity` (and friends) on first read into a
 *    Car Buyer's Pass with a 30-day grace window
 */
export function getActivePass(): ActivePass | null {
  const storage = safeStorage();
  if (!storage) return null;

  // 1) Try the new key
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ActivePass>;
      if (
        parsed &&
        isPassProductKey(parsed.productKey) &&
        typeof parsed.expiresAt === "number" &&
        typeof parsed.purchasedAt === "number"
      ) {
        if (parsed.expiresAt > Date.now()) {
          return {
            productKey: parsed.productKey,
            purchasedAt: parsed.purchasedAt,
            expiresAt: parsed.expiresAt,
            source: parsed.source,
          };
        }
        // Expired — clean up and fall through
        storage.removeItem(STORAGE_KEY);
      } else {
        // Malformed — clean up and fall through to legacy migration
        storage.removeItem(STORAGE_KEY);
      }
    }
  } catch {
    // JSON parse error — clear and fall through
    try { storage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }

  // 2) Migrate legacy keys (one-time) into a 30-day Car Buyer's Pass
  try {
    const hasLegacy = LEGACY_KEYS.some((k) => {
      const v = storage.getItem(k);
      return v === "true" || v === "49" || v === "79";
    });
    if (!hasLegacy) return null;

    const now = Date.now();
    const migrated: ActivePass = {
      productKey: "car_buyers_pass",
      purchasedAt: now,
      expiresAt: now + LEGACY_GRACE_DAYS * 24 * 60 * 60 * 1000,
      source: "legacy_migration",
    };
    storage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    LEGACY_KEYS.forEach((k) => {
      try { storage.removeItem(k); } catch { /* ignore */ }
    });
    return migrated;
  } catch {
    return null;
  }
}

/**
 * Save a freshly-purchased pass. Overwrites any existing pass — buying a
 * Car Buyer's Pass while a Weekend Warrior is active naturally upgrades you.
 */
export function savePass(productKey: PassProductKey): ActivePass {
  const storage = safeStorage();
  const now = Date.now();
  const product = PASS_PRODUCTS[productKey];
  const pass: ActivePass = {
    productKey,
    purchasedAt: now,
    expiresAt: now + product.durationHours * 60 * 60 * 1000,
    source: "purchase",
  };
  if (storage) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(pass));
      LEGACY_KEYS.forEach((k) => {
        try { storage.removeItem(k); } catch { /* ignore */ }
      });
    } catch {
      // ignore storage failures
    }
  }
  return pass;
}

export function clearPass(): void {
  const storage = safeStorage();
  if (!storage) return;
  try { storage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

/**
 * Format the remaining pass duration for display.
 *   "13d 23h left" / "2h 15m left" / "3m left" / "Expired"
 */
export function formatRemaining(pass: ActivePass): string {
  const ms = pass.expiresAt - Date.now();
  if (ms <= 0) return "Expired";
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const mins = Math.floor((ms % 3_600_000) / 60_000);
  if (days >= 1) return `${days}d ${hours}h left`;
  if (hours >= 1) return `${hours}h ${mins}m left`;
  return `${Math.max(mins, 1)}m left`;
}
