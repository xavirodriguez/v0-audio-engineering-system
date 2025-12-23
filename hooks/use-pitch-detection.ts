
import { useCallback } from "react";
import { usePitchDetectionStore } from "@/lib/store/pitch-detection-store";
import { useAudioContext } from "./use-audio-context";
import { usePitchProcessor } from "./use-pitch-processor";
import { frequencyToCents } from "@/lib/audio/note-utils";

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
    onError: (error) => {
      // Handle or propagate error
    },
  });

  // Public API
  const initialize = useCallback(async () => {
    try {
      await initAudio();
    } catch (error) {
      // Handle or propagate error
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
