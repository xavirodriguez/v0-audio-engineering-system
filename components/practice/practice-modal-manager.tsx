"use client"

import { ModalManager } from "@/components/practice/modal-manager"
import { usePracticeState } from "@/hooks/use-practice-state"
import { useRecording } from "@/hooks/use-recording"
import { useAdaptiveExercises } from "@/hooks/use-adaptive-exercises"

/**
 * Manages the display of modals for the practice screen, such as the
 * recording player and exercise selector.
 */
export function PracticeModalManager() {
  const practiceState = usePracticeState()
  const { currentRecording, deleteRecording } = useRecording()
  const { recommendations, selectExercise } = useAdaptiveExercises()

  const handleSelectExercise = (exerciseId: string) => {
    const exercise = recommendations.find((r) => r.exercise.id === exerciseId)?.exercise
    if (exercise) {
      selectExercise(exercise)
    }
    practiceState.setShowExercises(false)
  }

  return (
    <ModalManager
      showRecording={practiceState.showRecording}
      showExercises={practiceState.showExercises}
      currentRecording={currentRecording}
      recommendations={recommendations}
      onCloseRecording={() => practiceState.setShowRecording(false)}
      onCloseExercises={() => practiceState.setShowExercises(false)}
      onDeleteRecording={(id) => {
        deleteRecording(id)
        practiceState.setShowRecording(false)
      }}
      onSelectExercise={handleSelectExercise}
    />
  )
}
