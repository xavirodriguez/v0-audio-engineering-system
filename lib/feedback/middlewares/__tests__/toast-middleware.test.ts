import { describe, it, expect, vi, beforeEach } from "vitest";
import { createToastMiddleware, type ToastService } from "../toast-middleware";
import { DEFAULT_MIDDLEWARE_CONFIG } from "../../middleware-config";
import type { FeedbackAction, FeedbackState } from "../../types";

// Create a mock ToastService that we can inject.
const mockToastService: ToastService = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
};

describe("createToastMiddleware", () => {
  const config = DEFAULT_MIDDLEWARE_CONFIG.toast;
  // Pass the mock service when creating the middleware instance.
  const toastMiddleware = createToastMiddleware(config, mockToastService);
  const state = {} as FeedbackState;

  // Clear mock history before each test.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not show toast if disabled", () => {
    const disabledMiddleware = createToastMiddleware({ ...config, enabled: false }, mockToastService);
    const action: FeedbackAction = {
      type: "NOTE_COMPLETED",
      note: "A4",
      accuracy: 95,
      duration: 500,
      timestamp: 1,
    };
    disabledMiddleware(state, action, vi.fn());
    expect(mockToastService.success).not.toHaveBeenCalled();
  });

  it("should show success toast for a high-accuracy note", () => {
    const action: FeedbackAction = {
      type: "NOTE_COMPLETED",
      note: "B4",
      accuracy: 98,
      duration: 600,
      timestamp: 2,
    };
    toastMiddleware(state, action, vi.fn());
    expect(mockToastService.success).toHaveBeenCalledWith(
      "Great! B4 played with 98% accuracy",
      { duration: config.duration }
    );
  });

  it("should not show success toast for a low-accuracy note", () => {
    const action: FeedbackAction = {
      type: "NOTE_COMPLETED",
      note: "C5",
      accuracy: 85,
      duration: 550,
      timestamp: 3,
    };
    toastMiddleware(state, action, vi.fn());
    expect(mockToastService.success).not.toHaveBeenCalled();
  });

  it("should show an error toast for a critical error", () => {
    const action: FeedbackAction = {
        type: "ERROR",
        severity: "critical",
        category: "audio-initialization",
        error: new Error("test"),
        userMessage: "Audio failed"
    };
    toastMiddleware(state, action, vi.fn());
    expect(mockToastService.error).toHaveBeenCalledWith("Audio failed", expect.any(Object));
  });
});