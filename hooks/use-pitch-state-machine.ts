"use client";

import { useCallback, useRef, useEffect } from "react";
import { usePitchDetectionStore } from "@/lib/store/pitch-detection-store";
import { frequencyToCents } from "@/lib/audio/note-utils";
import type { PitchEvent } from "@/lib/types/pitch-detection";
import { useFeedbackState } from "./logic/use-feedback-state";
import {
  calculateNoteAccuracy,
  type PitchDataPoint,
} from "@/lib/audio/calculate-note-accuracy";
import { decidePracticeAction, type PracticeContext } from "@/lib/domain/practice-rules";

const PITCH_CONFIDENCE_MIN = 0.6;

/**
 * A hook that provides a state machine for pitch detection.
 * @returns {{handlePitchEvent: (event: PitchEvent) => void}} - The pitch state machine.
 */
export function usePitchStateMachine() {
  // Use granular selectors for state values and actions
  const {
    status,
    notes,
    currentNoteIndex,
    totalLatencyOffsetMs,
    rmsThreshold,
    toleranceCents,
    minHoldMs,
    consecutiveStableFrames,
    holdStart,
    setState,
    advanceToNextNote
  } = usePitchDetectionStore(state => ({
    status: state.status,
    notes: state.notes,
    currentNoteIndex: state.currentNoteIndex,
    totalLatencyOffsetMs: state.totalLatencyOffsetMs,
    rmsThreshold: state.rmsThreshold,
    toleranceCents: state.toleranceCents,
    minHoldMs: state.minHoldMs,
    consecutiveStableFrames: state.consecutiveStableFrames,
    holdStart: state.holdStart,
    setState: state.setState,
    advanceToNextNote: state.advanceToNextNote
  }));

  const { dispatch: dispatchFeedback } = useFeedbackState();

  // Refs to manage the history for accuracy calculation
  const pitchHistoryRef = useRef<PitchDataPoint[]>([]);
  const noteStartTimeRef = useRef<number | null>(null);

  // Effect to dispatch progress updates when the note index changes
  useEffect(() => {
    if (notes.length > 0) {
      dispatchFeedback({
        type: "PROGRESS_UPDATE",
        completed: currentNoteIndex,
        total: notes.length,
      });
    }
  }, [currentNoteIndex, notes, dispatchFeedback]);

  const handlePitchEvent = useCallback(
    (event: PitchEvent) => {
      const { pitchHz, confidence, rms, timestamp } = event;

      const adjustedTimestamp = timestamp - totalLatencyOffsetMs / 1000;
      const currentNote = notes[currentNoteIndex];
      // If there's no note, we can't do anything.
      if (!currentNote) return;

      const cents = frequencyToCents(pitchHz, currentNote.frequency);

      // Actualizar métricas actuales
      setState({
        currentPitch: pitchHz,
        currentCents: cents,
        currentConfidence: confidence,
        currentRms: rms,
      });

      const context: PracticeContext = {
        status,
        currentNote: {
          frequency: currentNote.frequency,
          midi: currentNote.midi,
          name: currentNote.name,
        },
        observation: {
          frequency: pitchHz,
          confidence: confidence,
          rms: rms,
          cents: cents,
        },
        thresholds: {
          rmsThreshold,
          toleranceCents,
          minConfidence: PITCH_CONFIDENCE_MIN,
        },
        timing: {
          consecutiveStableFrames,
          holdDurationMs: (holdStart > 0) ? (adjustedTimestamp - holdStart) * 1000 : 0,
          minHoldMs,
        },
      };

      const decision = decidePracticeAction(context);

      switch (decision.type) {
        case 'IGNORE':
          return;

        case 'REJECT':
          if (status === 'PITCH_STABLE') {
            // If we were stable, this is a degradation. Reset.
            pitchHistoryRef.current = [];
            noteStartTimeRef.current = null;
            if (decision.reason === 'VOLUME_TOO_LOW') {
               dispatchFeedback({
                  type: "ERROR",
                  severity: "warning",
                  category: "pitch-unstable",
                  userMessage: "Signal lost",
                  suggestion: "Try playing a bit louder or move closer to the microphone."
               });
            }
          }
          setState({
            status: "PITCH_DETECTING",
            consecutiveStableFrames: 0,
            holdStart: 0,
          });
          break;

        case 'ACCEPT':
          // Start tracking note hold if this is the first stable frame
          if (noteStartTimeRef.current === null) {
            noteStartTimeRef.current = adjustedTimestamp;
          }
          pitchHistoryRef.current.push({ frequency: pitchHz, confidence, timestamp });

          setState({
            status: "PITCH_STABLE",
            consecutiveStableFrames: consecutiveStableFrames + 1,
            holdStart: holdStart || adjustedTimestamp,
          });
          break;

        case 'ADVANCE_NOTE':
          const holdDuration = (adjustedTimestamp - (holdStart || adjustedTimestamp)) * 1000;
          const accuracy = calculateNoteAccuracy(
            pitchHistoryRef.current,
            currentNote.frequency,
            holdDuration
          );

          dispatchFeedback({
            type: "NOTE_COMPLETED",
            note: currentNote.name,
            accuracy: accuracy,
            duration: holdDuration,
            timestamp: Date.now(),
          });

          // Reset for the next note
          pitchHistoryRef.current = [];
          noteStartTimeRef.current = null;
          advanceToNextNote();
          break;
      }
    },
    [
      status,
      notes,
      currentNoteIndex,
      totalLatencyOffsetMs,
      rmsThreshold,
      toleranceCents,
      minHoldMs,
      consecutiveStableFrames,
      holdStart,
      setState,
      advanceToNextNote,
      dispatchFeedback,
    ]
  );

  return {
    handlePitchEvent,
  }
}
