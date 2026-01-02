import type { MiddlewareConfig } from "../middleware-config";
import type { FeedbackMiddleware } from "../types";

// Define an interface for the Toast dependency for better type safety.
export interface ToastService {
  success: (message: string, options?: { duration?: number }) => void;
  error: (
    message: string,
    options?: {
      duration?: number;
      action?: { label: string; onClick: () => void };
    }
  ) => void;
  warning: (
    message: string,
    options?: { duration?: number; description?: string }
  ) => void;
  info: (message: string, options?: { duration?: number }) => void;
}


/**
 * Creates a middleware that shows toast notifications for specific feedback events.
 * @param config The configuration for the toast middleware.
 * @param toast An object implementing the ToastService interface.
 * @returns A feedback middleware function.
 */
export const createToastMiddleware =
  (
    config: MiddlewareConfig["toast"],
    toast: ToastService
  ): FeedbackMiddleware =>
  (state, action) => {
    if (!config.enabled) return;

    if (
      action.type === "NOTE_COMPLETED" &&
      action.accuracy >= config.minAccuracyForSuccess
    ) {
      toast.success(
        `Great! ${action.note} played with ${action.accuracy}% accuracy`,
        {
          duration: config.duration,
        }
      );
    }

    if (action.type === "ERROR") {
      switch (action.severity) {
        case "critical":
          toast.error(action.userMessage, {
            duration: 0, // Persistent
            action: action.recoverAction
              ? {
                  label:
                    action.recoverAction.charAt(0).toUpperCase() +
                    action.recoverAction.slice(1),
                  onClick: () => {
                    console.log(`Recovery action: ${action.recoverAction}`);
                  },
                }
              : undefined,
          });
          break;
        case "warning":
          toast.warning(action.userMessage, {
            duration: 5000,
            description: action.suggestion,
          });
          break;
        case "info":
          toast.info(action.userMessage, {
            duration: 3000,
          });
          break;
      }
    }
  };
