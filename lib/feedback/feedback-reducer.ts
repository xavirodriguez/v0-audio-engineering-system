import { initialFeedbackState } from "./initial-state";
import type { FeedbackAction, FeedbackState } from "./types";

/**
 * Determines the tuning status based on cents deviation.
 * @param cents The deviation from the target pitch in cents.
 * @returns The tuning status: 'sharp', 'flat', or 'in-tune'.
 */
function getTuningStatus(cents: number): "sharp" | "flat" | "in-tune" {
  if (cents > 5) return "sharp";
  if (cents < -5) return "flat";
  return "in-tune";
}

/**
 * A pure function that handles state transitions for the feedback system
 * based on dispatched actions.
 *
 * @param state The current feedback state.
 * @param action The action to process.
 * @returns The new feedback state.
 */
export function feedbackReducer(
  state: FeedbackState,
  action: FeedbackAction
): FeedbackState {
  switch (action.type) {
    case "TUNING_UPDATE": {
      const status = getTuningStatus(action.cents);
      const newSnapshot = {
        cents: action.cents,
        status,
        timestamp: action.timestamp,
      };

      // To avoid bloating history, we could implement sampling here,
      // but for now, we'll record every snapshot.
      const tuningHistory = [...state.tuningHistory, newSnapshot];

      return {
        ...state,
        tuningHistory,
        lastTuningUpdate: {
          cents: action.cents,
          status,
        },
      };
    }

    case "NOTE_COMPLETED": {
      const newNote = {
        note: action.note,
        accuracy: action.accuracy,
        duration: action.duration,
        timestamp: action.timestamp,
      };
      return {
        ...state,
        notes: [...state.notes, newNote],
      };
    }

    case "PROGRESS_UPDATE": {
      return {
        ...state,
        progress: {
          completed: action.completed,
          total: action.total,
        },
      };
    }

    case "ERROR": {
      // Avoid adding duplicate errors
      if (state.errors.some(e => e.userMessage === action.userMessage)) {
        return state;
      }
      return {
        ...state,
        errors: [...state.errors, action],
      };
    }

    case "RESET": {
      return initialFeedbackState;
    }

    default: {
      // This ensures that if a new action type is added to FeedbackAction,
      // TypeScript will warn us if we haven't handled it here.
      const _exhaustiveCheck: never = action;
      return state;
    }
  }
}
