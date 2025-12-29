import type { FeedbackState } from "./types";

/**
 * The initial state for the feedback reducer.
 * This is the state the system starts in before any events have occurred.
 */
export const initialFeedbackState: FeedbackState = {
  notes: [],
  progress: {
    completed: 0,
    total: 0,
  },
  tuningHistory: [],
  errors: [],
  lastTuningUpdate: null,
};
