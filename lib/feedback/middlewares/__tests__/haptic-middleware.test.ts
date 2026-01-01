import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHapticMiddleware } from "../haptic-middleware";
import { DEFAULT_MIDDLEWARE_CONFIG } from "../../middleware-config";
import type { FeedbackAction, FeedbackState } from "../../types";

describe("createHapticMiddleware", () => {
  const config = DEFAULT_MIDDLEWARE_CONFIG.haptic;
  const hapticMiddleware = createHapticMiddleware(config);
  const state = {} as FeedbackState;

  // Mock global objects before each test
  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-expect-error - We are mocking the navigator.vibrate for testing purposes.
    navigator.vibrate = vi.fn();
    document.querySelector = vi.fn().mockReturnValue({
        classList: {
            add: vi.fn(),
            remove: vi.fn()
        }
    });
  });

  it("should not trigger if disabled", () => {
    const disabledMiddleware = createHapticMiddleware({ ...config, enabled: false });
    const action: FeedbackAction = { type: "TUNING_UPDATE", cents: 1, timestamp: 1 };
    disabledMiddleware(state, action, vi.fn());
    expect(navigator.vibrate).not.toHaveBeenCalled();
  });

  it("should trigger vibration when tuning is within threshold", () => {
    const action: FeedbackAction = { type: "TUNING_UPDATE", cents: 1.5, timestamp: 2 };
    hapticMiddleware(state, action, vi.fn());
    expect(navigator.vibrate).toHaveBeenCalledWith(50);
  });

  it("should not trigger vibration when tuning is outside threshold", () => {
    const action: FeedbackAction = { type: "TUNING_UPDATE", cents: -10, timestamp: 3 };
    hapticMiddleware(state, action, vi.fn());
    expect(navigator.vibrate).not.toHaveBeenCalled();
  });

  it("should trigger visual flash fallback if vibration is not supported", () => {
    // Temporarily remove navigator.vibrate for this test
    // @ts-expect-error - We are mocking the navigator.vibrate for testing purposes.
    delete navigator.vibrate;
    const action: FeedbackAction = { type: "TUNING_UPDATE", cents: 0, timestamp: 4 };
    hapticMiddleware(state, action, vi.fn());
    expect(document.querySelector).toHaveBeenCalledWith(".tuning-indicator");
  });
});