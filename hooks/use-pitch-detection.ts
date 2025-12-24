
import { useCallback, useMemo } from "react";
import { usePitchDetectionStore } from "@/lib/store/pitch-detection-store";
import { useAudioContext } from "./use-audio-context";
import { usePitchProcessor } from "./use-pitch-processor";
import { frequencyToCents } from "@/lib/audio/note-utils";
import { PitchEvent } from "@/lib/types/pitch-detection";

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
  const { audioContext, analyser, initialize: initAudio } = useAudioContext();

  // Memoize the event handler to prevent re-creating it on every render
  const onPitchDetected = useCallback((event: PitchEvent) => {
    const cents = frequencyToCents(event.pitchHz, targetFreqHz);
    updatePitchEvent({ ...event, cents });
  }, [targetFreqHz, updatePitchEvent]);

  // Memoize the processor config to prevent re-running the processor's effects unnecessarily
  const processorConfig = useMemo(() => ({
    analyser,
    sampleRate: audioContext?.sampleRate ?? 48000,
    isActive: status === 'LISTENING',
  }), [analyser, audioContext?.sampleRate, status]);

  // Pitch processing, driven by store state
  usePitchProcessor({
    ...processorConfig,
    onPitchDetected,
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
