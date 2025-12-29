"use client";

import { useReducer, useCallback, useMemo, useRef, useEffect } from "react";
import { feedbackReducer } from "@/lib/feedback/feedback-reducer";
import { initialFeedbackState } from "@/lib/feedback/initial-state";
import type { FeedbackAction, FeedbackMiddleware } from "@/lib/feedback/types";
import { DEFAULT_MIDDLEWARE_CONFIG, MiddlewareConfig } from "@/lib/feedback/middleware-config";
import { createAnalyticsMiddleware, AnalyticsService } from "@/lib/feedback/middlewares/analytics-middleware";
import { createAudioCueMiddleware } from "@/lib/feedback/middlewares/audio-cue-middleware";
import { createHapticMiddleware } from "@/lib/feedback/middlewares/haptic-middleware";
import { createToastMiddleware, ToastService } from "@/lib/feedback/middlewares/toast-middleware";

// Default mock services for development and testing if none are provided.
const defaultToastService: ToastService = {
  success: (message, options) => console.log("TOAST SUCCESS:", message, options),
  error: (message, options) => console.error("TOAST ERROR:", message, options),
  warning: (message, options) => console.warn("TOAST WARNING:", message, options),
  info: (message, options) => console.info("TOAST INFO:", message, options),
};

const defaultAnalyticsService: AnalyticsService = {
  track: (eventName, properties) => console.log("ANALYTICS:", eventName, properties),
};

interface UseFeedbackStateProps {
    config?: MiddlewareConfig;
    toastService?: ToastService;
    analyticsService?: AnalyticsService;
}

/**
 * A hook to manage the feedback state using a reducer and a middleware pipeline.
 * It is corrected to avoid stale state in middlewares and allows injecting dependencies.
 *
 * @param {UseFeedbackStateProps} props - The configuration and service dependencies.
 * @returns An object containing the current `state` and the enhanced `dispatch` function.
 */
export function useFeedbackState({
  config = DEFAULT_MIDDLEWARE_CONFIG,
  toastService = defaultToastService,
  analyticsService = defaultAnalyticsService,
}: UseFeedbackStateProps = {}) {
  const [state, dispatch] = useReducer(feedbackReducer, initialFeedbackState);
  const stateRef = useRef(state);

  // Keep the ref updated with the latest state after every render.
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const middlewares = useMemo<FeedbackMiddleware[]>(() => [
    createToastMiddleware(config.toast, toastService),
    createAnalyticsMiddleware(config.analytics, analyticsService),
    createHapticMiddleware(config.haptic),
    createAudioCueMiddleware(config.audioCue),
  ], [config, toastService, analyticsService]);

  const dispatchWithMiddleware = useCallback(
    (action: FeedbackAction) => {
      // Get the new state by running the reducer with the most recent state from our ref.
      // This solves the stale state issue noted in the code review.
      const newState = feedbackReducer(stateRef.current, action);

      // Run middlewares with the correct new state.
      for (const middleware of middlewares) {
        // Pass the original, stable dispatch function so middlewares can dispatch new actions.
        middleware(newState, action, dispatch);
      }

      // Now, call the original dispatch to trigger the React state update and re-render.
      // While this means the reducer runs twice per action, it is a safe and correct
      // pattern for implementing reducer middleware in React hooks.
      dispatch(action);
    },
    [middlewares] // This callback is now stable as long as the config or services don't change.
  );

  return { state, dispatch: dispatchWithMiddleware };
}
