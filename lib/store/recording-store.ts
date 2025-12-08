import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Recording } from "@/lib/types/recording"

interface RecordingStore {
  recordings: Recording[]
  isRecording: boolean
  currentRecording: Recording | null

  // Actions
  addRecording: (recording: Recording) => void
  deleteRecording: (id: string) => void
  setCurrentRecording: (recording: Recording | null) => void
  setIsRecording: (isRecording: boolean) => void
  clearRecordings: () => void
}

/**
 * A store for managing recordings.
 */
export const useRecordingStore = create<RecordingStore>()(
  persist(
    (set) => ({
      recordings: [],
      isRecording: false,
      currentRecording: null,

      /**
       * Adds a recording.
       * @param {Recording} recording - The recording to add.
       */
      addRecording: (recording) =>
        set((state) => ({
          recordings: [recording, ...state.recordings],
          currentRecording: recording,
        })),

      /**
       * Deletes a recording.
       * @param {string} id - The ID of the recording to delete.
       */
      deleteRecording: (id) =>
        set((state) => ({
          recordings: state.recordings.filter((r) => r.id !== id),
          currentRecording: state.currentRecording?.id === id ? null : state.currentRecording,
        })),

      /**
       * Sets the current recording.
       * @param {Recording | null} recording - The recording to set.
       */
      setCurrentRecording: (recording) => set({ currentRecording: recording }),

      /**
       * Sets whether the user is recording.
       * @param {boolean} isRecording - Whether the user is recording.
       */
      setIsRecording: (isRecording) => set({ isRecording }),

      /**
       * Clears all recordings.
       */
      clearRecordings: () => set({ recordings: [], currentRecording: null }),
    }),
    {
      name: "recording-storage",
      partialize: (state) => ({
        recordings: state.recordings.map((r) => ({
          ...r,
          audioBlob: undefined,
          audioUrl: undefined,
        })),
      }),
    },
  ),
)
