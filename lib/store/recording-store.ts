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

export const useRecordingStore = create<RecordingStore>()(
  persist(
    (set) => ({
      recordings: [],
      isRecording: false,
      currentRecording: null,

      addRecording: (recording) =>
        set((state) => ({
          recordings: [recording, ...state.recordings],
          currentRecording: recording,
        })),

      deleteRecording: (id) =>
        set((state) => ({
          recordings: state.recordings.filter((r) => r.id !== id),
          currentRecording: state.currentRecording?.id === id ? null : state.currentRecording,
        })),

      setCurrentRecording: (recording) => set({ currentRecording: recording }),

      setIsRecording: (isRecording) => set({ isRecording }),

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
