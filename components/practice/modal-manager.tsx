"use client"

import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { RecordingPlayer } from "@/components/recording-player"
import { ExerciseSelector } from "@/components/exercise-selector"
import type { Recording } from "@/lib/types/recording"
import type { AdaptiveRecommendation } from "@/lib/types/exercise-system"

export interface ModalManagerProps {
  showRecording: boolean
  showExercises: boolean
  currentRecording: Recording | null
  recommendations: AdaptiveRecommendation[]
  onCloseRecording: () => void
  onCloseExercises: () => void
  onDeleteRecording: (id: string) => void
  onSelectExercise: (exerciseId: string) => void
}

export function ModalManager({
  showRecording,
  showExercises,
  currentRecording,
  recommendations,
  onCloseRecording,
  onCloseExercises,
  onDeleteRecording,
  onSelectExercise,
}: ModalManagerProps) {
  return (
    <AnimatePresence>
      {showRecording && currentRecording && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onCloseRecording}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl"
          >
            <RecordingPlayer recording={currentRecording} onDelete={onDeleteRecording} />
          </motion.div>
        </motion.div>
      )}

      {showExercises && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onCloseExercises}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl"
          >
            <ExerciseSelector recommendations={recommendations} onSelectExercise={onSelectExercise} />
            <Button variant="outline" className="mt-4 w-full bg-transparent" onClick={onCloseExercises}>
              Cerrar
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
