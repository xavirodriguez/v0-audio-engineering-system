import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createAnalyticsMiddleware,
  type AnalyticsService,
} from "../analytics-middleware";
import { DEFAULT_MIDDLEWARE_CONFIG } from "../../middleware-config";
import type { FeedbackAction, FeedbackState } from "../../types";

// Create a mock AnalyticsService.
const mockAnalyticsService: AnalyticsService = {
  track: vi.fn(),
};

describe("createAnalyticsMiddleware", () => {
  const config = DEFAULT_MIDDLEWARE_CONFIG.analytics;
  const analyticsMiddleware = createAnalyticsMiddleware(
    config,
    mockAnalyticsService
  );
  const state = {} as FeedbackState;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not track event if disabled", () => {
    const disabledMiddleware = createAnalyticsMiddleware(
      { ...config, enabled: false },
      mockAnalyticsService
    );
    const action: FeedbackAction = {
      type: "NOTE_COMPLETED",
      note: "A4",
      accuracy: 95,
      duration: 500,
      timestamp: 1,
    };
    disabledMiddleware(state, action, vi.fn());
    expect(mockAnalyticsService.track).not.toHaveBeenCalled();
  });

  it("should track NOTE_COMPLETED event", () => {
    const action: FeedbackAction = {
      type: "NOTE_COMPLETED",
      note: "B4",
      accuracy: 98,
      duration: 600,
      timestamp: 2,
    };
    analyticsMiddleware(state, action, vi.fn());
    expect(mockAnalyticsService.track).toHaveBeenCalledWith("note_completed", {
      note: "B4",
      accuracy: 98,
      duration: 600,
    });
  });

  it("should track ERROR event", () => {
    const action: FeedbackAction = {
        type: "ERROR",
        severity: "warning",
        category: "pitch-unstable",
        userMessage: "Pitch is unstable"
    };
    analyticsMiddleware(state, action, vi.fn());
    expect(mockAnalyticsService.track).toHaveBeenCalledWith("error_occurred", {
        severity: "warning",
        category: "pitch-unstable",
        message: "Pitch is unstable"
    })
  })
});