/**
 * @fileoverview Defines the types and enums for the real-time feedback event system.
 * This ensures type safety and consistency across the gamification features.
 */

/**
 * Enum for the different types of feedback events that can be emitted.
 * Each event corresponds to a specific user action or performance metric.
 */
export enum FeedbackEventType {
  // Pitch and Accuracy Events
  PITCH_ACCURATE = "pitch:accurate",
  PITCH_SHARP = "pitch:sharp",
  PITCH_FLAT = "pitch:flat",
  PITCH_STABLE = "pitch:stable",

  // Streak and Milestone Events
  STREAK_INCREMENTED = "streak:incremented",
  STREAK_BROKEN = "streak:broken",
  STREAK_MILESTONE = "streak:milestone",

  // Exercise and Session Events
  EXERCISE_COMPLETED = "exercise:completed",
  IMPROVEMENT_DETECTED = "exercise:improvement_detected",
  SESSION_STARTED = "session:started",
  SESSION_ENDED = "session:ended",
}

/**
 * A generic interface for the payload of a feedback event.
 * @template T - The specific data type for the event's value.
 */
export interface FeedbackEventPayload<T = any> {
  type: FeedbackEventType;
  value?: T;
  timestamp: number;
  message: string;
}

/**
 * Specific payload for when a streak milestone is reached.
 */
export interface StreakMilestonePayload {
  count: number; // The milestone number (e.g., 10, 20, 50)
}

/**
 * A map defining the payload type for each event type.
 * This is used for type inference and ensuring that event listeners
 * receive the correct data structure.
 */
export type FeedbackEventPayloadMap = {
  [FeedbackEventType.PITCH_ACCURATE]: { note: string };
  [FeedbackEventType.PITCH_SHARP]: { deviation: number };
  [FeedbackEventType.PITCH_FLAT]: { deviation: number };
  [FeedbackEventType.PITCH_STABLE]: { duration: number };
  [FeedbackEventType.STREAK_INCREMENTED]: { count: number };
  [FeedbackEventType.STREAK_BROKEN]: { lastCount: number };
  [FeedbackEventType.STREAK_MILESTONE]: StreakMilestonePayload;
  [FeedbackEventType.EXERCISE_COMPLETED]: { score: number };
  [FeedbackEventType.IMPROVEMENT_DETECTED]: { metric: string; improvement: number };
  [FeedbackEventType.SESSION_STARTED]: undefined;
  [FeedbackEventType.SESSION_ENDED]: { duration: number };
};

/**
 * The type for a listener function that handles feedback events.
 * It uses a mapped type to ensure the payload matches the event type.
 * @template E - The specific FeedbackEventType this listener subscribes to.
 */
export type FeedbackEventListener<E extends FeedbackEventType> = (
  payload: FeedbackEventPayload<FeedbackEventPayloadMap[E]>
) => void;
