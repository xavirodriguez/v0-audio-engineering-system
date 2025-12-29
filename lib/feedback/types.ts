import type { AppError } from "@/lib/errors/error-manager";

// Step 1: Define the shape of the state

/**
 * Represents a single completed note with its associated metrics.
 */
export interface CompletedNote {
  note: string;
  accuracy: number;
  duration: number; // in milliseconds
  timestamp: number;
}

/**
 * Represents the user's progress through a practice session.
 */
export interface SessionProgress {
  completed: number;
  total: number;
}

/**
 * A snapshot of the tuning at a specific moment in time.
 * Useful for historical analysis or plotting a tuning graph.
 */
export interface TuningSnapshot {
  cents: number;
  status: "sharp" | "flat" | "in-tune";
  timestamp: number;
}

/**
 * The core state for the feedback system. It accumulates data
 * from discrete events rather than high-frequency real-time updates.
 */
export interface FeedbackState {
  notes: CompletedNote[];
  progress: SessionProgress;
  tuningHistory: TuningSnapshot[];
  errors: AppError[];
  lastTuningUpdate: {
    cents: number;
    status: "sharp" | "flat" | "in-tune";
  } | null;
}

// Step 2: Define the actions using a discriminated union

export type FeedbackAction =
  | {
      type: "TUNING_UPDATE";
      cents: number;
      timestamp: number;
    }
  | {
      type: "NOTE_COMPLETED";
      note: string;
      accuracy: number;
      duration: number;
      timestamp: number;
    }
  | {
      type: "PROGRESS_UPDATE";
      completed: number;
      total: number;
    }
  | {
      type: "RESET";
    }
  | FeedbackError; // From Step 3

// Step 3: Define the categorized error types for the ERROR action

export type FeedbackError =
  // Critical errors from the audio pipeline
  | {
      type: "ERROR";
      severity: "critical";
      category: "audio-initialization";
      error: Error; // The original error object
      userMessage: string;
      recoverAction?: "retry" | "reload";
    }
  | {
      type: "ERROR";
      severity: "critical";
      category: "microphone-failure";
      error: Error;
      userMessage: string;
      recoverAction?: "retry" | "request-permission";
    }
  // Recoverable, user-facing warnings
  | {
      type: "ERROR";
      severity: "warning";
      category: "note-not-recognized";
      userMessage: string;
      suggestion?: string;
    }
  | {
      type: "ERROR";
      severity: "warning";
      category: "pitch-unstable";
      userMessage: string;
      suggestion?: string;
    }
  // Informational messages that are not strictly errors
  | {
      type: "ERROR";
      severity: "info";
      category: "calibration-needed";
      userMessage: string;
    };


// Step 4: Define the Middleware type

/**
 * A function that intercepts actions and can dispatch its own actions
 * or produce side effects (like toasts, analytics, etc.).
 * @param state The current state from the reducer.
 * @param action The action that was just dispatched.
 */
export type FeedbackMiddleware = (
  state: FeedbackState,
  action: FeedbackAction,
  dispatch: React.Dispatch<FeedbackAction>
) => void;
