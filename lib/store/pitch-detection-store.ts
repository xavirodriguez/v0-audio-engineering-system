import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { GlobalTunerState, PitchEvent } from "@/lib/types/pitch-detection"
import { generatePracticeSequence } from "@/lib/audio/note-utils"

interface PitchDetectionStore extends GlobalTunerState {
  // Actions
  setState: (state: Partial<GlobalTunerState>) => void
  updatePitchEvent: (event: PitchEvent) => void
  resetState: () => void
  advanceToNextNote: () => void
  setNotes: (notes: Array<{ name: string; midi: number; frequency: number; duration: number }>) => void
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
}

export const usePitchDetectionStore = create<PitchDetectionStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setState: (newState) => set((state) => ({ ...state, ...newState })),

      updatePitchEvent: (event) =>
        set((state) => ({
          currentPitch: event.pitchHz,
          currentConfidence: event.confidence,
          currentRms: event.rms,
          pitchHistory: [...state.pitchHistory.slice(-99), event],
        })),

      advanceToNextNote: () =>
        set((state) => {
          const nextIndex = state.currentNoteIndex + 1
          if (nextIndex >= state.notes.length) {
            return {
              status: "IDLE",
              accuracy: 100,
            }
          }

          const nextNote = state.notes[nextIndex]
          return {
            currentNoteIndex: nextIndex,
            targetNoteMidi: nextNote.midi,
            targetFreqHz: nextNote.frequency,
            consecutiveStableFrames: 0,
            holdStart: 0,
            accuracy: Math.round((nextIndex / state.notes.length) * 100),
          }
        }),

      setNotes: (notes) =>
        set({
          notes,
          currentNoteIndex: 0,
          targetNoteMidi: notes[0]?.midi || 69,
          targetFreqHz: notes[0]?.frequency || 440,
        }),

      resetState: () => set(initialState),
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
