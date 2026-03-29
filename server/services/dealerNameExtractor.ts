const MAKE_PATTERN =
  /Toyota|Honda|Ford|Chevrolet|Chevy|Nissan|Hyundai|Kia|Ram|Dodge|Jeep|Subaru|Mazda|Volkswagen|VW|BMW|Mercedes|Audi|Lexus|Cadillac|Buick|GMC|Chrysler|Volvo|Tesla|Rivian|Lucid|Genesis|Infiniti|Acura|Lincoln|Mitsubishi|MINI|Porsche|Land Rover|Jaguar|Maserati/i;

/**
 * Attempts to extract a pre-LLM dealer name from dealer text using a heuristic
 * regex. Returns null if no match or the match is too short to be reliable.
 */
export function extractDealerName(dealerText: string): string | null {
  const atMatch = dealerText.match(
    new RegExp(`(?:from|at|with|visit(?:ing)?)\\s+([A-Z][a-zA-Z0-9 &'-]{3,40}?)\\s*(?:${MAKE_PATTERN.source})`, "i"),
  );
  if (!atMatch?.[0]) return null;
  const fullMatch = atMatch[0];
  const makeMatch = fullMatch.match(MAKE_PATTERN);
  if (!makeMatch) return null;
  const makeIdx = fullMatch.indexOf(makeMatch[0]);
  const prefixClean = fullMatch
    .slice(0, makeIdx + makeMatch[0].length)
    .replace(/^(?:from|at|with|visit(?:ing)?)\s+/i, "")
    .trim();
  return prefixClean.length >= 4 ? prefixClean : null;
}
