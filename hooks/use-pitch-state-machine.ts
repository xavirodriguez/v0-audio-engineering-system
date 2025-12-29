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

const NOTE_TRANSITION_BUFFER_MS = 300;
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
      })

      // Estado: IDLE - no hacer nada
      if (status === "IDLE") return

      // Estado: CALIBRATING - delegar a useCalibration
      if (status === "CALIBRATING") return

      // Estado: PITCH_DETECTING o PITCH_STABLE
      if (
        status === "PITCH_DETECTING" ||
        status === "PITCH_STABLE"
      ) {
        // No signal
        if (rms < rmsThreshold) {
          if (status === "PITCH_STABLE") {
            // If we were stable, the signal was lost. Reset.
            pitchHistoryRef.current = [];
            noteStartTimeRef.current = null;
            dispatchFeedback({
                type: "ERROR",
                severity: "warning",
                category: "pitch-unstable",
                userMessage: "Signal lost",
                suggestion: "Try playing a bit louder or move closer to the microphone."
            })
          }
          setState({
            consecutiveStableFrames: 0,
            holdStart: 0,
            status: "PITCH_DETECTING",
          });
          return;
        }

        // Check if in tune
        const isInTune =
          Math.abs(cents) < toleranceCents &&
          confidence > PITCH_CONFIDENCE_MIN;

        if (isInTune) {
          // Start tracking note hold if this is the first stable frame
          if (noteStartTimeRef.current === null) {
            noteStartTimeRef.current = adjustedTimestamp;
          }
          pitchHistoryRef.current.push({ frequency: pitchHz, confidence, timestamp });

          const newConsecutiveFrames = consecutiveStableFrames + 1;
          const newHoldStart = holdStart || adjustedTimestamp;
          const holdDuration = (adjustedTimestamp - newHoldStart) * 1000;

          // Note held long enough -> advance to the next note
          if (holdDuration >= minHoldMs + NOTE_TRANSITION_BUFFER_MS) {
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
            return;
          }

          // Actualizar estado estable
          setState({
            status: "PITCH_STABLE",
            consecutiveStableFrames: newConsecutiveFrames,
            holdStart: newHoldStart,
          })
        } else {
          // Lost tuning
          if (status === "PITCH_STABLE") {
            // If we were stable, this is a degradation. Reset.
             pitchHistoryRef.current = [];
             noteStartTimeRef.current = null;
          }
          setState({
            status: "PITCH_DETECTING",
            consecutiveStableFrames: 0,
            holdStart: 0,
          });
        }
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
