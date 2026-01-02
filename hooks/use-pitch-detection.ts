
import { useState, useRef, useEffect } from "react"
import {
  PitchToMusicAdapter,
  MusicToLearningAdapter,
  MusicalNote,
  PerformanceFeedback,
} from "@/lib/domains"
import { usePitchDetectionStore } from "@/lib/store/pitch-detection-store"
import { useAudioContext } from "./use-audio-context"
import { usePitchProcessor } from "./use-pitch-processor"
import { errorManager } from "@/lib/errors/error-manager"
import { BufferOverflowError } from "@/lib/errors/app-errors"
import {
  decidePracticeAction,
  type PracticeContext,
} from "@/lib/domain/practice-rules"
import { useExerciseStore } from "@/lib/store/exercise-store"
import { DEFAULT_PITCH_DETECTION_CONFIG } from "@/lib/config/pitch-detection.config"

interface PitchDetectionOptions {
  addPitchPoint?: (pitch: {
    frequency: number
    confidence: number
    rms: number
  }) => void
  targetNote?: MusicalNote
  onNoteCompleted?: () => void
}

export function usePitchDetection({
  addPitchPoint,
  targetNote,
  onNoteCompleted,
}: PitchDetectionOptions = {}) {
  const {
    status,
    error,
    currentPerformance,
    updatePitchEvent,
    startDetection: startStoreDetection,
    stopDetection: stopStoreDetection,
    resetState,
  } = usePitchDetectionStore()
  const { isPracticing } = useExerciseStore()

  const [feedback, setFeedback] = useState<PerformanceFeedback>(
    PerformanceFeedback.empty(),
  )

  const musicAdapter = useRef(
    new PitchToMusicAdapter({
      minConfidence: 0.9,
      minRms: 0.01,
      stabilityThreshold: 5,
    }),
  ).current

  const learningAdapter = useRef(
    new MusicToLearningAdapter({
      inTuneTolerance: 10,
      streakMilestones: [3, 5, 10, 20, 50],
    }),
  ).current

  const stableSinceRef = useRef<number | null>(null)

  useEffect(() => {
    // Reset hold timer when target note changes
    stableSinceRef.current = null
  }, [targetNote])

  const { audioContext, analyser, initialize: initAudio } = useAudioContext()

  usePitchProcessor({
    analyser,
    sampleRate: audioContext?.sampleRate || 48000,
    isActive: status === "LISTENING",
    onPitchDetected: (event) => {
      updatePitchEvent(event)
      addPitchPoint?.({
        frequency: event.pitchHz,
        confidence: event.confidence,
        rms: event.rms,
      })

      if (!isPracticing || !targetNote || !currentPerformance) {
        return
      }

      const isStable =
        currentPerformance.quality.steadiness === "stable" &&
        Math.abs(currentPerformance.centDeviation) < 25 &&
        event.confidence > 0.6 &&
        event.rms > 0.01

      if (isStable) {
        if (stableSinceRef.current === null) {
          stableSinceRef.current = Date.now()
        }
      } else {
        stableSinceRef.current = null
      }

      const holdDurationMs = stableSinceRef.current
        ? Date.now() - stableSinceRef.current
        : 0

      const context: PracticeContext = {
        status: "PITCH_STABLE",
        currentNote: {
          frequency: targetNote.frequency,
          midi: targetNote.midi,
          name: targetNote.name,
        },
        observation: {
          frequency: event.pitchHz,
          confidence: event.confidence,
          rms: event.rms,
          cents: currentPerformance.centDeviation,
        },
        thresholds: {
          rmsThreshold: 0.01,
          toleranceCents: 25,
          minConfidence: 0.6,
        },
        timing: {
          consecutiveStableFrames: 0, // Not tracked, using duration instead
          holdDurationMs,
          minHoldMs: DEFAULT_PITCH_DETECTION_CONFIG.minHoldMs,
        },
      }

      const decision = decidePracticeAction(context)

      if (decision.type === "ADVANCE_NOTE") {
        onNoteCompleted?.()
        stableSinceRef.current = null
      }
    },
    onError: (err) => {
      const error = new BufferOverflowError({
        nativeError: err instanceof Error ? err : new Error(String(err)),
      })
      errorManager.report(error)
    },
  })

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
