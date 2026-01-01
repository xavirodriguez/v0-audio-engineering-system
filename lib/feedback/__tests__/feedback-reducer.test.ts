import { describe, it, expect } from "vitest";
import { feedbackReducer } from "../feedback-reducer";
import { initialFeedbackState } from "../initial-state";
import type { FeedbackAction, FeedbackState } from "../types";

describe("feedbackReducer", () => {
  it("should return the initial state for an unknown action type", () => {
    const currentState = { ...initialFeedbackState, notes: [{ note: 'A4', accuracy: 100, duration: 500, timestamp: 1 }] };
    // @ts-expect-error - Testing an invalid action to ensure it falls through to the default case
    expect(feedbackReducer(currentState, { type: "UNKNOWN_ACTION" })).toEqual(
      currentState
    );
  });

  describe("TUNING_UPDATE action", () => {
    it("should add a new snapshot and update lastTuningUpdate for 'in-tune' status", () => {
      const action: FeedbackAction = {
        type: "TUNING_UPDATE",
        cents: 3,
        timestamp: 12345,
      };
      const newState = feedbackReducer(initialFeedbackState, action);
      expect(newState.tuningHistory).toHaveLength(1);
      expect(newState.tuningHistory[0]).toEqual({
        cents: 3,
        status: "in-tune",
        timestamp: 12345,
      });
      expect(newState.lastTuningUpdate).toEqual({
        cents: 3,
        status: "in-tune",
      });
    });

    it("should correctly identify 'sharp' status when cents > 5", () => {
      const action: FeedbackAction = {
        type: "TUNING_UPDATE",
        cents: 15,
        timestamp: 12345,
      };
      const newState = feedbackReducer(initialFeedbackState, action);
      expect(newState.lastTuningUpdate?.status).toBe("sharp");
    });

    it("should correctly identify 'flat' status when cents < -5", () => {
      const action: FeedbackAction = {
        type: "TUNING_UPDATE",
        cents: -20,
        timestamp: 12345,
      };
      const newState = feedbackReducer(initialFeedbackState, action);
      expect(newState.lastTuningUpdate?.status).toBe("flat");
    });
  });

  describe("NOTE_COMPLETED action", () => {
    it("should add a completed note to the notes array", () => {
      const action: FeedbackAction = {
        type: "NOTE_COMPLETED",
        note: "A4",
        accuracy: 95,
        duration: 500,
        timestamp: 123456,
      };
      const newState = feedbackReducer(initialFeedbackState, action);
      expect(newState.notes).toHaveLength(1);
      expect(newState.notes[0]).toEqual({
        note: "A4",
        accuracy: 95,
        duration: 500,
        timestamp: 123456,
      });
    });
  });

  describe("PROGRESS_UPDATE action", () => {
    it("should update the session progress", () => {
      const action: FeedbackAction = {
        type: "PROGRESS_UPDATE",
        completed: 5,
        total: 10,
      };
      const newState = feedbackReducer(initialFeedbackState, action);
      expect(newState.progress).toEqual({
        completed: 5,
        total: 10,
      });
    });
  });

  describe("ERROR action", () => {
    it("should add a new error to the errors array", () => {
      const errorAction: FeedbackAction = {
        type: "ERROR",
        severity: "critical",
        category: "microphone-failure",
        error: new Error("Mic not found"),
        userMessage: "Microphone not found.",
      };
      const newState = feedbackReducer(initialFeedbackState, errorAction);
      expect(newState.errors).toHaveLength(1);
      expect(newState.errors[0]).toEqual(errorAction);
    });

    it("should not add a duplicate error based on userMessage", () => {
      const errorAction: FeedbackAction = {
        type: "ERROR",
        severity: "critical",
        category: "microphone-failure",
        error: new Error("Mic not found"),
        userMessage: "Microphone not found.",
      };
      const stateWithError: FeedbackState = {
        ...initialFeedbackState,
        // @ts-expect-error - Testing reducer's ability to handle existing errors
        errors: [errorAction],
      };
      const newState = feedbackReducer(stateWithError, errorAction);
      expect(newState.errors).toHaveLength(1);
    });
  });

  describe("RESET action", () => {
    it("should reset the state to its initial value", () => {
      const currentState: FeedbackState = {
        notes: [
          { note: "A4", accuracy: 90, duration: 500, timestamp: 123 },
        ],
        progress: { completed: 1, total: 1 },
        tuningHistory: [
          { cents: 2, status: "in-tune", timestamp: 123 },
        ],
        errors: [],
        lastTuningUpdate: { cents: 2, status: "in-tune" },
      };
      const action: FeedbackAction = { type: "RESET" };
      const newState = feedbackReducer(currentState, action);
      expect(newState).toEqual(initialFeedbackState);
    });
  });
});