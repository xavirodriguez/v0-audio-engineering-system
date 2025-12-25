
import { useCallback } from "react";
import { usePitchDetectionStore } from "@/lib/store/pitch-detection-store";
import { useAudioContext } from "./use-audio-context";
import { usePitchProcessor } from "./use-pitch-processor";
import { frequencyToCents } from "@/lib/audio/note-utils";
import { errorManager } from "@/lib/errors/error-manager";
import {
  AppError,
  AudioInitializationError,
  BufferOverflowError,
} from "@/lib/errors/app-errors";

export function usePitchDetection() {
  // ✅ Centralized state from Zustand store
  const {
    status,
    currentPitch,
    currentCents,
    targetFreqHz,
    error,
    startDetection: startStoreDetection,
    stopDetection: stopStoreDetection,
    updatePitchEvent,
    resetState,
  } = usePitchDetectionStore();

  // Audio context management
  const { audioContext, analyser, initialize: initAudio, cleanup } = useAudioContext();

  // Pitch processing, driven by store state
  usePitchProcessor({
    analyser,
    sampleRate: audioContext?.sampleRate || 48000,
    isActive: status === 'LISTENING',
    onPitchDetected: (event) => {
      const cents = frequencyToCents(event.pitchHz, targetFreqHz);
      updatePitchEvent({ ...event, cents });
    },
    onError: (err) => {
      const error = new BufferOverflowError({
        nativeError: err instanceof Error ? err : new Error(String(err)),
      });
      errorManager.report(error);
    },
  });

  // Public API
  const initialize = useCallback(async () => {
    try {
      await initAudio();
    } catch (err) {
      // Coerce to a known error type
      const reason = err instanceof Error ? err.message : "unknown";
      const error = new AudioInitializationError(reason, {
        nativeError: err,
      });
      errorManager.report(error);
    }
  }, [initAudio]);

  return {
    // State
    currentState: status,
    currentPitch,
    currentCents,
    error,

    // Capabilities
    isDetecting: status === 'LISTENING',

    // Actions
    initialize,
    startDetection: startStoreDetection,
    stopDetection: stopStoreDetection,
    reset: resetState,
  };
}
