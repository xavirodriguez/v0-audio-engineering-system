import type { MiddlewareConfig } from "../middleware-config";
import type { FeedbackMiddleware } from "../types";

/**
 * A helper function to trigger a visual flash on a UI element as a fallback
 * for haptic feedback. This is a side effect that directly interacts with the DOM.
 */
function triggerVisualFlash() {
  // In a real app, this selector would target your tuning indicator component.
  const indicator = document.querySelector(".tuning-indicator");
  if (indicator) {
    indicator.classList.add("flash-success");
    setTimeout(() => indicator.classList.remove("flash-success"), 200);
  } else {
    console.log("Visual flash fallback: Tuning indicator not found.");
  }
}

/**
 * Creates a middleware that provides haptic feedback for tuning updates.
 * It attempts to use the `navigator.vibrate` API and falls back to a
 * visual cue if the API is not supported or fails.
 *
 * @param config The configuration for the haptic middleware.
 * @returns A feedback middleware function.
 */
export const createHapticMiddleware =
  (
    config: MiddlewareConfig["haptic"]
  ): FeedbackMiddleware =>
  (state, action) => {
    if (!config.enabled) return;
    if (action.type !== "TUNING_UPDATE") return;

    const isInTune =
      Math.abs(action.cents) < config.tuningThreshold;
    if (!isInTune) return;

    // Feature detect and execute haptic feedback
    if ("vibrate" in navigator) {
      try {
        // A short, subtle vibration
        const intensityMap = {
            light: 50,
            medium: 100,
            heavy: 150
        }
        navigator.vibrate(intensityMap[config.intensity] || 50);
      } catch (error) {
        console.debug("Haptic feedback failed, falling back.", error);
        triggerVisualFlash();
      }
    } else {
      // Fallback for browsers without vibration API support (e.g., iOS Safari)
      triggerVisualFlash();
    }
  };
