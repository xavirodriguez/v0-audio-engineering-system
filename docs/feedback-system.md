# Feedback System Architecture

This document outlines the architecture of the decoupled feedback system based on a Reducer and Middleware pattern.

## Core Concepts

The system is designed to handle user feedback (toasts, analytics, haptics, etc.) in a predictable, testable, and extensible way without creating direct coupling between the audio processing pipeline and the UI components that display feedback.

It follows these core principles:

1.  **State Management Separation**:
    *   **Zustand (`usePitchDetectionStore`)**: Manages high-frequency, real-time state (60+ Hz) used for immediate UI rendering (e.g., tuning meters).
    *   **Reducer (`feedbackReducer`)**: Manages low-frequency, discrete events (< 1 Hz) and historical data (e.g., completed notes, progress). This is ideal for logging, analytics, and summary views.

2.  **Pure Reducer**: The `feedbackReducer` is a pure function. It takes the current state and an action and returns a new state without any side effects. This makes it 100% predictable and easy to unit test.

3.  **Decoupled Side Effects via Middleware**: All side effects (API calls, toasts, vibrations) are handled by a pipeline of middlewares. Each middleware is a function that receives the new state and the dispatched action, decides if it needs to act, and then performs its side effect.

## Data Flow

The data flows in a unidirectional pattern:

1.  **Event Source** (`usePitchProcessor`, `usePitchStateMachine`): An event occurs in the audio pipeline (e.g., a pitch is detected, a note is completed).
2.  **Dispatch**: The source hook dispatches a strongly-typed action to the `useFeedbackState` hook.
3.  **Reducer**: The `feedbackReducer` inside the hook receives the action, processes it, and returns a new, updated state.
4.  **Middleware Pipeline**: After the state is updated, the action and the *new* state are passed sequentially to all registered middlewares.
5.  **Side Effects**: Middlewares that care about the action perform their side effects (e.g., `toastMiddleware` shows a toast, `analyticsMiddleware` sends a tracking event).
6.  **UI Update**: UI components consuming the `useFeedbackState` hook re-render with the new state.

## How to Add a New Middleware

Adding a new type of feedback is simple and does not require modifying existing code.

**Step 1: Create the Middleware File**

Create a new file in `/lib/feedback/middlewares/`, for example, `confetti-middleware.ts`. The middleware should be a function that matches the `FeedbackMiddleware` type.

```typescript
// /lib/feedback/middlewares/confetti-middleware.ts
import type { FeedbackMiddleware } from "../types";
import { showConfetti } from "@/lib/ui/confetti"; // Assume this exists

export const createConfettiMiddleware = (config: any): FeedbackMiddleware => (state, action) => {
  if (!config.enabled) return;

  // Trigger confetti only on high-accuracy notes
  if (action.type === "NOTE_COMPLETED" && action.accuracy >= 98) {
    showConfetti();
  }
};
```

**Step 2: Add Configuration**

Add a configuration section for your new middleware in `/lib/feedback/middleware-config.ts`.

```typescript
// /lib/feedback/middleware-config.ts
export interface MiddlewareConfig {
  // ... other configs
  confetti: {
    enabled: boolean;
    strength: "high" | "low";
  };
}

export const DEFAULT_MIDDLEWARE_CONFIG: MiddlewareConfig = {
  // ... other configs
  confetti: {
    enabled: true,
    strength: "high",
  },
};
```

**Step 3: Register the Middleware**

Add your new middleware to the pipeline in the `useFeedbackState` hook.

```typescript
// /hooks/logic/use-feedback-state.ts
import { createConfettiMiddleware } from "@/lib/feedback/middlewares/confetti-middleware";

export function useFeedbackState() {
  // ...
  const middlewares = useMemo<FeedbackMiddleware[]>(
    () => [
      // ... other middlewares
      createConfettiMiddleware(DEFAULT_MIDDLEWARE_CONFIG.confetti),
    ],
    []
  );
  // ...
}
```

That's it. The new feedback is now fully integrated into the system.
