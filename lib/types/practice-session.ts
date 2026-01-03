import type { NotePerformance } from "@/lib/domains/music/note-performance.value-object"

export interface PracticeSessionState {
  currentPerformance: NotePerformance | null
}
