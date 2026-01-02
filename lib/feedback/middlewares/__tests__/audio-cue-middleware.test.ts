import { describe, it, expect, vi, beforeEach } from "vitest";
import { createAudioCueMiddleware } from "../audio-cue-middleware";
import { DEFAULT_MIDDLEWARE_CONFIG } from "../../middleware-config";
import type { FeedbackAction, FeedbackState } from "../../types";

// Mock the Web Audio API
const mockAudioContext = {
  createOscillator: vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    type: "sine",
    frequency: { setValueAtTime: vi.fn() },
  })),
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn()
    },
  })),
  destination: {},
  currentTime: 0,
};

// @ts-expect-error - Mocking global AudioContext for testing
global.AudioContext = vi.fn(() => mockAudioContext);


describe("createAudioCueMiddleware", () => {
  const config = { ...DEFAULT_MIDDLEWARE_CONFIG.audioCue, enabled: true };
  const audioCueMiddleware = createAudioCueMiddleware(config);
  const state = {} as FeedbackState;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not play sound if disabled", () => {
    const disabledMiddleware = createAudioCueMiddleware({ ...config, enabled: false });
    const action: FeedbackAction = { type: "NOTE_COMPLETED", note: "A4", accuracy: 95, duration: 500, timestamp: 1 };
    disabledMiddleware(state, action, vi.fn());
    expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
  });

  it("should play success sound for a high-accuracy note", () => {
    const action: FeedbackAction = { type: "NOTE_COMPLETED", note: "B4", accuracy: 98, duration: 600, timestamp: 2 };
    audioCueMiddleware(state, action, vi.fn());
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
  });

  it("should play error sound for a critical error", () => {
    const action: FeedbackAction = { type: "ERROR", severity: "critical", category: "audio-initialization", error: new Error("test"), userMessage: "test" };
    audioCueMiddleware(state, action, vi.fn());
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
  });

  it("should not play sound for an info-level error", () => {
     const action: FeedbackAction = { type: "ERROR", severity: "info", category: "calibration-needed", userMessage: "test" };
     audioCueMiddleware(state, action, vi.fn());
     expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
  })
});