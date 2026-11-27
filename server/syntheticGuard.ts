/**
 * Synthetic QA submissions must not be written to dealer_submissions,
 * core.listings, analytics, or the aggregate stats those tables feed.
 */
export {
  isSyntheticSubmission,
  shouldEmitSubmissionAnalytics,
  isSyntheticTrackingPayload,
} from "../shared/syntheticSubmission.js";
