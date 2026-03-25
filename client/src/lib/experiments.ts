import { useEffect, useRef, useState } from "react";
import { capture } from "@/lib/analytics";
import { getSessionId } from "@/lib/tracking";

export interface Experiment {
  id: string;
  variants: [string, string];
  trafficSplit: number;
}

export const EXPERIMENTS: Experiment[] = [
  {
    id: "hero_headline",
    variants: ["control", "urgency"],
    trafficSplit: 0.5,
  },
  {
    id: "unlock_cta",
    variants: ["control", "value"],
    trafficSplit: 0.5,
  },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function getAssignmentKey(experimentId: string): string {
  return `odigos_exp_${experimentId}`;
}

export function assignVariant(experiment: Experiment): string {
  const storageKey = getAssignmentKey(experiment.id);

  try {
    const stored = localStorage.getItem(storageKey);
    if (stored && experiment.variants.includes(stored)) {
      return stored;
    }
  } catch {
  }

  const sessionId = getSessionId();
  const seed = hashString(`${sessionId}:${experiment.id}`);
  const bucket = (seed % 1000) / 1000;
  const variant = bucket < experiment.trafficSplit
    ? experiment.variants[0]
    : experiment.variants[1];

  try {
    localStorage.setItem(storageKey, variant);
  } catch {
  }

  return variant;
}

function getAllActiveAssignments(): Record<string, string> {
  const assignments: Record<string, string> = {};
  for (const exp of EXPERIMENTS) {
    try {
      const key = getAssignmentKey(exp.id);
      const stored = localStorage.getItem(key);
      if (stored) {
        assignments[exp.id] = stored;
      }
    } catch {
    }
  }
  return assignments;
}

async function trackAssignment(experimentId: string, variant: string): Promise<void> {
  try {
    capture("experiment_assigned", { experiment_id: experimentId, variant });
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "experiment_assigned",
        metadata: {
          experimentId,
          variant,
          sessionId: getSessionId(),
        },
      }),
    });
  } catch {
  }
}

export async function trackConversion(conversionType: string): Promise<void> {
  try {
    const assignments = getAllActiveAssignments();
    capture("experiment_converted", {
      conversion_type: conversionType,
      experiments: assignments,
    });
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "experiment_converted",
        metadata: {
          conversionType,
          experiments: assignments,
          sessionId: getSessionId(),
        },
      }),
    });
  } catch {
  }
}

export function useExperiment(experimentId: string): string | null {
  const experiment = EXPERIMENTS.find((e) => e.id === experimentId);
  const [variant, setVariant] = useState<string | null>(null);
  const tracked = useRef(false);

  useEffect(() => {
    if (!experiment) return;

    const storageKey = getAssignmentKey(experimentId);
    let isNew = false;

    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored || !experiment.variants.includes(stored)) {
        isNew = true;
      }
    } catch {
      isNew = true;
    }

    const assigned = assignVariant(experiment);
    setVariant(assigned);

    if (isNew && !tracked.current) {
      tracked.current = true;
      trackAssignment(experimentId, assigned);
    }
  }, [experimentId, experiment]);

  return variant;
}
