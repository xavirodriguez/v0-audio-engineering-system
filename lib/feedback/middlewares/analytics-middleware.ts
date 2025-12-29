import type { MiddlewareConfig } from "../middleware-config";
import type { FeedbackMiddleware } from "../types";

// Define an interface for the Analytics dependency.
export interface AnalyticsService {
  track: (eventName: string, properties: Record<string, any>) => void;
}

/**
 * Creates a middleware that tracks feedback events to an analytics service.
 * @param config The configuration for the analytics middleware.
 * @param analytics An object implementing the AnalyticsService interface.
 * @returns A feedback middleware function.
 */
export const createAnalyticsMiddleware =
  (
    config: MiddlewareConfig["analytics"],
    analytics: AnalyticsService
  ): FeedbackMiddleware =>
  (state, action) => {
    if (!config.enabled) return;

    // Use sampling if configured
    if (Math.random() > config.sampleRate) {
      return;
    }

    switch (action.type) {
      case "NOTE_COMPLETED": {
        analytics.track("note_completed", {
          note: action.note,
          accuracy: action.accuracy,
          duration: action.duration,
        });
        break;
      }
      case "ERROR": {
        analytics.track("error_occurred", {
          severity: action.severity,
          category: action.category,
          message: action.userMessage,
        });
        break;
      }
      case "PROGRESS_UPDATE": {
        // Track milestone progress (e.g., every 25%)
        const progressPercent = (action.completed / action.total) * 100;
        if (progressPercent > 0 && progressPercent % 25 === 0) {
          analytics.track("progress_milestone", {
            completed: action.completed,
            total: action.total,
            percent: progressPercent,
          });
        }
        break;
      }
    }
  };
