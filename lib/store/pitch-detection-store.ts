import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { GlobalTunerState, PitchEvent } from "@/lib/types/pitch-detection"
import { generatePracticeSequence } from "@/lib/audio/note-utils"
import { calculateNextPracticeState } from "@/lib/domain/practice-rules";

interface PitchDetectionStore extends GlobalTunerState {
  // Actions
  updatePitchEvent: (event: PitchEvent) => void;
  resetState: () => void;
  advanceToNextNote: () => void;
  setNotes: (notes: Array<{ name: string; midi: number; frequency: number; duration: number }>) => void;
  startDetection: () => void;
  stopDetection: () => void;
  setTargetNote: (midi: number) => void;
  transitionStatus: (newStatus: 'PITCH_STABLE' | 'LISTENING' | 'RETRYING') => void;
}

const initialState: GlobalTunerState = {
  status: "IDLE",
  currentNoteIndex: 0,
  targetNoteMidi: 69,
  targetFreqHz: 440,
  accompanimentStartTime: 0,
  toleranceCents: 50,
  minHoldMs: 1000,
  rmsThreshold: 0.03,
  pitchHistory: [],
  consecutiveStableFrames: 0,
  holdStart: 0,
  totalLatencyOffsetMs: 0,
  isWorkletSupported: false,
  currentPitch: 0,
  currentCents: 0,
  currentConfidence: 0,
  currentRms: 0,
  accuracy: 0,
  notes: generatePracticeSequence(),
  transitionTimestamps: [],
}

/**
 * A store for managing pitch detection.
 */
export const usePitchDetectionStore = create<PitchDetectionStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * Updates the pitch event.
       * @param {PitchEvent} event - The pitch event.
       */
      updatePitchEvent: (event) => {
        const { status, consecutiveStableFrames } = get();
        const STABLE_FRAMES_THRESHOLD = 3;

        let newStableFrames = consecutiveStableFrames;

        if (event.confidence > 0.6) {
          newStableFrames++;
          if (status === 'LISTENING' && newStableFrames >= STABLE_FRAMES_THRESHOLD) {
            get().transitionStatus('PITCH_STABLE');
          }
        } else {
          newStableFrames = 0;
          if (status === 'PITCH_STABLE') {
            get().transitionStatus('LISTENING');
          }
        }

        set((state) => ({
          currentPitch: event.pitchHz,
          currentConfidence: event.confidence,
          currentRms: event.rms,
          pitchHistory: [...state.pitchHistory.slice(-99), event],
          consecutiveStableFrames: newStableFrames,
        }));
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
          targetFreqHz: notes[0]?.frequency || 440,
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
            targetFreqHz: note.frequency,
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
