import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// pass.ts reads `window.localStorage` via a safeStorage() helper.
// We stub a minimal in-memory window/localStorage for the unit project
// (which runs in node without jsdom).
class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string): string | null {
    return this.data.has(key) ? this.data.get(key)! : null;
  }
  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
  removeItem(key: string): void {
    this.data.delete(key);
  }
  clear(): void {
    this.data.clear();
  }
  get length(): number {
    return this.data.size;
  }
  key(): string | null {
    return null;
  }
}

let memoryStorage: MemoryStorage;

beforeEach(async () => {
  memoryStorage = new MemoryStorage();
  vi.stubGlobal("window", { localStorage: memoryStorage });
  // Reset module so pass.ts re-evaluates safeStorage() against the fresh stub
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

async function loadPass() {
  return await import("../../client/src/lib/pass.js");
}

const STORAGE_KEY = "odigos_pass";
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

describe("pass.ts — getActivePass", () => {
  it("returns null when storage is empty", async () => {
    const { getActivePass } = await loadPass();
    expect(getActivePass()).toBeNull();
  });

  it("returns null and removes the key when expiresAt < now", async () => {
    const expired = {
      productKey: "weekend_warrior",
      purchasedAt: Date.now() - 10 * HOUR_MS,
      expiresAt: Date.now() - 1000,
    };
    memoryStorage.setItem(STORAGE_KEY, JSON.stringify(expired));

    const { getActivePass } = await loadPass();
    expect(getActivePass()).toBeNull();
    expect(memoryStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("returns null and removes the key when JSON is malformed", async () => {
    memoryStorage.setItem(STORAGE_KEY, "{not json");

    const { getActivePass } = await loadPass();
    expect(getActivePass()).toBeNull();
    expect(memoryStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("migrates legacy paid_deal_clarity into a 30-day Car Buyer's Pass", async () => {
    memoryStorage.setItem("paid_deal_clarity", "true");

    const { getActivePass } = await loadPass();
    const before = Date.now();
    const pass = getActivePass();
    const after = Date.now();

    expect(pass).not.toBeNull();
    expect(pass!.productKey).toBe("car_buyers_pass");
    expect(pass!.source).toBe("legacy_migration");

    const expectedExpiryMin = before + 30 * DAY_MS;
    const expectedExpiryMax = after + 30 * DAY_MS;
    expect(pass!.expiresAt).toBeGreaterThanOrEqual(expectedExpiryMin);
    expect(pass!.expiresAt).toBeLessThanOrEqual(expectedExpiryMax);

    // Legacy key was deleted (single source of truth)
    expect(memoryStorage.getItem("paid_deal_clarity")).toBeNull();
    // New key was written
    expect(memoryStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it("migrates legacy paid_negotiation_pack the same way", async () => {
    memoryStorage.setItem("paid_negotiation_pack", "true");

    const { getActivePass } = await loadPass();
    const pass = getActivePass();

    expect(pass).not.toBeNull();
    expect(pass!.productKey).toBe("car_buyers_pass");
    expect(pass!.source).toBe("legacy_migration");
    expect(memoryStorage.getItem("paid_negotiation_pack")).toBeNull();
  });

  it("does NOT re-migrate on subsequent calls (idempotency)", async () => {
    memoryStorage.setItem("paid_deal_clarity", "true");

    const { getActivePass } = await loadPass();
    const pass1 = getActivePass();
    const pass2 = getActivePass();

    expect(pass1).not.toBeNull();
    expect(pass2).not.toBeNull();
    // Same purchasedAt → same migration record (not regenerated)
    expect(pass2!.purchasedAt).toBe(pass1!.purchasedAt);
    expect(pass2!.expiresAt).toBe(pass1!.expiresAt);
  });
});

describe("pass.ts — savePass", () => {
  it("savePass('weekend_warrior') sets expiresAt ≈ now + 72h", async () => {
    const { savePass } = await loadPass();
    const before = Date.now();
    const pass = savePass("weekend_warrior");
    const after = Date.now();

    expect(pass.productKey).toBe("weekend_warrior");
    expect(pass.expiresAt - before).toBeGreaterThanOrEqual(72 * HOUR_MS);
    expect(pass.expiresAt - after).toBeLessThanOrEqual(72 * HOUR_MS);
  });

  it("savePass('car_buyers_pass') sets expiresAt ≈ now + 14 days", async () => {
    const { savePass } = await loadPass();
    const before = Date.now();
    const pass = savePass("car_buyers_pass");
    const after = Date.now();

    expect(pass.productKey).toBe("car_buyers_pass");
    expect(pass.expiresAt - before).toBeGreaterThanOrEqual(14 * DAY_MS);
    expect(pass.expiresAt - after).toBeLessThanOrEqual(14 * DAY_MS);
  });

  it("savePass overwrites an existing pass (upgrade path)", async () => {
    const { savePass, getActivePass } = await loadPass();
    savePass("weekend_warrior");
    const upgraded = savePass("car_buyers_pass");

    expect(upgraded.productKey).toBe("car_buyers_pass");
    const stored = getActivePass();
    expect(stored?.productKey).toBe("car_buyers_pass");
    // 14 days is much longer than 72 hours
    expect(upgraded.expiresAt - Date.now()).toBeGreaterThan(13 * DAY_MS);
  });

  it("savePass clears legacy keys", async () => {
    memoryStorage.setItem("paid_deal_clarity", "true");
    memoryStorage.setItem("odigos_unlock_tier", "49");

    const { savePass } = await loadPass();
    savePass("car_buyers_pass");

    expect(memoryStorage.getItem("paid_deal_clarity")).toBeNull();
    expect(memoryStorage.getItem("odigos_unlock_tier")).toBeNull();
  });
});

describe("pass.ts — formatRemaining", () => {
  it("formats >24h as days + hours", async () => {
    const { formatRemaining } = await loadPass();
    const result = formatRemaining({
      productKey: "car_buyers_pass",
      purchasedAt: Date.now(),
      expiresAt: Date.now() + 13 * DAY_MS + 23 * HOUR_MS,
    });
    expect(result).toMatch(/^13d 2[23]h left$/);
  });

  it("formats <24h as hours + minutes", async () => {
    const { formatRemaining } = await loadPass();
    const result = formatRemaining({
      productKey: "weekend_warrior",
      purchasedAt: Date.now(),
      expiresAt: Date.now() + 2 * HOUR_MS + 15 * 60 * 1000,
    });
    expect(result).toMatch(/^2h 1[45]m left$/);
  });

  it("formats <1h as minutes", async () => {
    const { formatRemaining } = await loadPass();
    const result = formatRemaining({
      productKey: "weekend_warrior",
      purchasedAt: Date.now(),
      expiresAt: Date.now() + 3 * 60 * 1000,
    });
    expect(result).toMatch(/^[23]m left$/);
  });

  it("returns 'Expired' when expiresAt is in the past", async () => {
    const { formatRemaining } = await loadPass();
    const result = formatRemaining({
      productKey: "weekend_warrior",
      purchasedAt: Date.now() - 100 * HOUR_MS,
      expiresAt: Date.now() - 1000,
    });
    expect(result).toBe("Expired");
  });
});
