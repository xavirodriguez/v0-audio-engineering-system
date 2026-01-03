import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { PitchEvent } from "@/lib/types/pitch-detection"
import { generatePracticeSequence } from "@/lib/audio/note-utils"
import { calculateNextPracticeState } from "@/lib/domain/practice-rules"
import { MusicalNote } from "@/lib/domains/music/musical-note"
import {
  NotePerformance,
  PerformanceQuality,
} from "@/lib/domains/music/note-performance.value-object"
import type { PracticeSessionState } from "@/lib/types/practice-session"

interface PitchDetectionStore extends PracticeSessionState {
  status: "IDLE" | "LISTENING" | "PITCH_STABLE" | "RETRYING"
  updatePitchEvent: (event: PitchEvent) => void
  resetState: () => void;
  advanceToNextNote: () => void;
  setNotes: (notes: Array<{ name: string; midi: number; frequency: number; duration: number }>) => void;
  startDetection: () => void;
  stopDetection: () => void;
  setTargetNote: (midi: number) => void;
  transitionStatus: (newStatus: 'PITCH_STABLE' | 'LISTENING' | 'RETRYING') => void;
}

const initialState: PracticeSessionState = {
  currentPerformance: null,
  // exerciseProgress: new ExerciseProgress(),
  // studentFeedback: new PedagogicalFeedback(), // This will be added in a future step
};

/**
 * A store for managing pitch detection.
 */
export const usePitchDetectionStore = create<PitchDetectionStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      status: "IDLE",
      currentNoteIndex: 0,
      targetNoteMidi: 69,
      accompanimentStartTime: 0,
      toleranceCents: 50,
      minHoldMs: 1000,
      rmsThreshold: 0.03,
      pitchHistory: [],
      consecutiveStableFrames: 0,
      holdStart: 0,
      totalLatencyOffsetMs: 0,
      isWorkletSupported: false,
      accuracy: 0,
      notes: generatePracticeSequence(),
      transitionTimestamps: [],

      /**
       * Updates the pitch event.
       * @param {PitchEvent} event - The pitch event.
       */
      updatePitchEvent: (event) => {
        const { targetNoteMidi } = get();
        const targetNote = MusicalNote.fromMidi(targetNoteMidi);
        const playedNote = MusicalNote.fromFrequency(event.pitchHz);

        const tuningStatus = playedNote.getTuningStatus(10);
        const steadiness = event.confidence > 0.6 ? 'stable' : 'wavering';
        const quality = new PerformanceQuality(tuningStatus, steadiness, 'adequate');

        const currentPerformance = new NotePerformance(playedNote, targetNote, quality);

        set({ currentPerformance });
      },

      /**
       * Advances to the next note.
       */
      advanceToNextNote: () =>
        set((state) => {
          const { newState } = calculateNextPracticeState({
            currentNoteIndex: state.currentNoteIndex,
            notes: state.notes,
          });
          return newState;
        }),

      /**
       * Sets the notes.
       * @param {Array<{ name: string; midi: number; frequency: number; duration: number }>} notes - The notes to set.
       */
      setNotes: (notes) =>
        set({
          notes,
          currentNoteIndex: 0,
          targetNoteMidi: notes[0]?.midi || 69,
        }),

      /**
       * Resets the state.
       */
      resetState: () => set(initialState),

      /**
       * Starts pitch detection.
       */
      startDetection: () => set({ status: "LISTENING" }),

      /**
       * Stops pitch detection.
       */
      stopDetection: () => set({ status: "IDLE" }),

      /**
       * Sets the target note.
       * @param {number} midi - The MIDI number of the target note.
       */
      setTargetNote: (midi) => set((state) => {
        const note = state.notes.find((n) => n.midi === midi);
        if (note) {
          return {
            targetNoteMidi: note.midi,
          };
        }
        return {};
      }),

      transitionStatus: (newStatus) => {
        set((state) => {
          // Basic FSM validation
          const transitions = {
            IDLE: ["LISTENING", "RETRYING"],
            LISTENING: ["PITCH_STABLE", "RETRYING", "IDLE"],
            PITCH_STABLE: ["LISTENING", "RETRYING", "IDLE"],
            RETRYING: ["LISTENING", "IDLE"],
          };

          const currentStatus = state.status;
          const allowedTransitions = transitions[currentStatus] || [];

          if (!allowedTransitions.includes(newStatus)) {
            console.warn(
              `[FSM] Invalid transition from ${currentStatus} to ${newStatus}. Ignoring.`
            );
            return state;
          }

          // Thrashing detection
          const now = performance.now();
          const newTimestamps = [...state.transitionTimestamps, now].filter(
            (ts) => now - ts < 1000
          );

          if (newTimestamps.length > 10) { // Stricter threshold
            console.error(
              `[FSM Thrashing] ${newTimestamps.length} transitions in 1s. ` +
              `Transition ${currentStatus} -> ${newStatus} is likely unstable.`,
              {
                pitchHistory: state.pitchHistory.slice(-10),
              }
            );
            // Optionally, force a safe state
            return { ...state, status: "IDLE" };
          }

          return { ...state, status: newStatus, transitionTimestamps: newTimestamps };
        });
      },
    }),
    {
      name: "pitch-detection-storage",
      partialize: (state) => ({
        toleranceCents: state.toleranceCents,
        minHoldMs: state.minHoldMs,
        rmsThreshold: state.rmsThreshold,
      }),
    },
  ),
)
