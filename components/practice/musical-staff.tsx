"use client"

import { ScoreView } from "@/components/score-view"
import { SheetMusicRenderer } from "@/components/sheet-music-renderer"
import { usePitchDetectionState } from "@/hooks/use-pitch-detection-state"
import { usePracticeState } from "@/hooks/use-practice-state"
import { useAdaptiveExercises } from "@/hooks/use-adaptive-exercises"

/**
 * Renders the musical staff, conditionally displaying either an animated
 * score view or a static sheet music renderer based on the current
 * practice mode.
 */
export function MusicalStaff() {
  const { viewMode, practiceMode } = usePracticeState()
  const { notes, currentNoteIndex, status, accuracy } = usePitchDetectionState()
  const { currentExercise } = useAdaptiveExercises()

  const isPlaying = status === "PITCH_DETECTING" || status === "PITCH_STABLE"

  if (viewMode === "animated") {
    return (
      <ScoreView
        notes={notes}
        currentNoteIndex={currentNoteIndex}
        isPlaying={isPlaying}
        practiceMode={practiceMode}
        status={status}
        accuracy={accuracy}
      />
    )
  }

  if (currentExercise) {
    return (
      <div className="p-6">
        <SheetMusicRenderer
          exercise={currentExercise}
          currentNoteIndex={currentNoteIndex}
        />
      </div>
    )
  }

  return (
    <div className="h-[400px] flex items-center justify-center text-muted-foreground">
      <p>Select an exercise to see the sheet music</p>
    </div>
  )
}
