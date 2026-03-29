import { z } from "zod";
import { analysisResponseSchema } from "@shared/schema";
import type { StateFeeData } from "../stateFeeLookup";
import { checkDocFeeCap } from "../ruleEngine";

type LlmResult = z.infer<typeof analysisResponseSchema>;
type DocFeeCapResult = NonNullable<ReturnType<typeof checkDocFeeCap>>;

/**
 * Mutates llmResult in-place to prepend doc-fee-cap violation warnings to
 * summary, reasoning, and suggestedReply when a state cap has been breached.
 */
export function injectDocFeeCapWarnings(
  llmResult: LlmResult,
  result: DocFeeCapResult,
  stateData: StateFeeData,
): void {
  const { capAmount, chargedAmount, overage } = result;
  const stateName = stateData.name;
  const capViolationPrefix = `ALERT: Doc fee of $${chargedAmount} exceeds ${stateName}'s legal cap of $${capAmount} by $${overage}.`;

  let statuteCitation = "";
  if (stateData.specialNotes) {
    const match = stateData.specialNotes.match(
      /([A-Z]{2,3}[\s.]+[\d.]+[\w.]*|§\s*[\d.]+[\w.]*|\b(?:Section|Sec\.|RS|RCW|ORS|MCL|CGS|GS|A\.?C\.?A\.?|C\.?R\.?S\.?|NRS|HSA|MCA)\s+[\d.-]+\w*)/i,
    );
    if (match) statuteCitation = ` (${match[0].trim()})`;
  }

  if (!llmResult.summary.includes(String(capAmount))) {
    llmResult.summary = `${capViolationPrefix} ${llmResult.summary}`;
  }
  if (!llmResult.reasoning.includes(String(overage))) {
    llmResult.reasoning =
      `Doc fee cap violation: ${stateName} cap is $${capAmount}${statuteCitation}. Charged: $${chargedAmount}. Overage: $${overage}. This is a hard NO-GO regardless of other deal terms. ` +
      llmResult.reasoning;
  }
  if (!llmResult.suggestedReply.includes(String(capAmount)) && !llmResult.suggestedReply.includes(String(overage))) {
    const replyStatuteNote = statuteCitation ? ` per state law${statuteCitation}` : " to comply with state law";
    llmResult.suggestedReply =
      `I noticed the documentation fee of $${chargedAmount} exceeds the ${stateName} state cap of $${capAmount} by $${overage}. Please adjust the doc fee${replyStatuteNote}. ` +
      llmResult.suggestedReply;
  }
}
