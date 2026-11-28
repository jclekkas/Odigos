/**
 * The synthetic decision for the submission currently on this page.
 * Mutation callbacks, retries, and telemetry read this object.
 * They do not re-read the form, and they cannot flip the flag.
 */

import {
  freezeSyntheticSubmission,
  type FrozenSyntheticSubmission,
} from "@shared/syntheticSubmission";

let latched: FrozenSyntheticSubmission | null = null;

export function holdSyntheticSubmission(
  held: FrozenSyntheticSubmission | null,
  incoming: {
    synthetic?: boolean | string | null;
    dealerText?: string | null;
    competingQuoteText?: string | null;
  },
): FrozenSyntheticSubmission {
  if (held) return held;
  const frozen = freezeSyntheticSubmission(incoming);
  latched = frozen;
  return frozen;
}

export function latchedSyntheticSubmission(): FrozenSyntheticSubmission | null {
  return latched;
}

export function syntheticTelemetrySuppressed(): boolean {
  return latched?.synthetic === true;
}

/** Test helper. Production code replaces the latch by submitting again. */
export function resetSyntheticLatchForTests(): void {
  latched = null;
}
