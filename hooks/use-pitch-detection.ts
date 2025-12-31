
import { useState, useRef } from "react";
import {
  PitchSample,
  PitchToMusicAdapter,
  MusicToLearningAdapter,
  MusicalNote,
  MusicalObservation,
  PerformanceFeedback,
} from '@/lib/domains';
import { usePitchDetectionStore } from "@/lib/store/pitch-detection-store";
import { useAudioContext } from "./use-audio-context";
import { usePitchProcessor } from "./use-pitch-processor";
import { errorManager } from "@/lib/errors/error-manager";
import {
  AudioInitializationError,
  BufferOverflowError,
} from "@/lib/errors/app-errors";

interface PitchDetectionOptions {
  addPitchPoint?: (pitch: { frequency: number; confidence: number; rms: number }) => void;
  targetNote?: MusicalNote;
}

export function usePitchDetection({ addPitchPoint, targetNote }: PitchDetectionOptions = {}) {
  const {
    status,
    error,
    currentPerformance,
    updatePitchEvent,
    startDetection: startStoreDetection,
    stopDetection: stopStoreDetection,
    resetState,
  } = usePitchDetectionStore();

  const [feedback, setFeedback] = useState<PerformanceFeedback>(PerformanceFeedback.empty());

  const musicAdapter = useRef(new PitchToMusicAdapter({
    minConfidence: 0.9,
    minRms: 0.01,
    stabilityThreshold: 5
  })).current;

  const learningAdapter = useRef(new MusicToLearningAdapter({
    inTuneTolerance: 10,
    streakMilestones: [3, 5, 10, 20, 50]
  })).current;

  const { audioContext, analyser, initialize: initAudio } = useAudioContext();

  usePitchProcessor({
    analyser,
    sampleRate: audioContext?.sampleRate || 48000,
    isActive: status === 'LISTENING',
    onPitchDetected: (event) => {
      updatePitchEvent(event);
      addPitchPoint?.({ frequency: event.pitchHz, confidence: event.confidence, rms: event.rms });
    },
    onError: (err) => {
      const error = new BufferOverflowError({
        nativeError: err instanceof Error ? err : new Error(String(err)),
      });
      errorManager.report(error);
    },
  });

  return {
    currentState: status,
    error,
    currentPerformance,
    feedback,
    currentNote: currentPerformance?.playedNote || null,
    isStable: currentPerformance?.quality.steadiness === 'stable' || false,
    accuracy: feedback.metrics.accuracy,
    streak: feedback.metrics.currentStreak,
    isDetecting: status === 'LISTENING',
    initialize: initAudio,
    startDetection: startStoreDetection,
    stopDetection: stopStoreDetection,
    reset: () => {
      resetState();
      musicAdapter.reset();
      learningAdapter.reset();
    },
  };
}
