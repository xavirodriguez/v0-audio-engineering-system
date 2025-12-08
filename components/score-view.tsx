"use client"

import { motion } from "framer-motion"
import type { PracticeNote } from "@/lib/types/pitch-detection"

interface ScoreViewProps {
  notes: PracticeNote[]
  currentNoteIndex: number
  isPlaying: boolean
  practiceMode: "step-by-step" | "continuous"
  status: string
  accuracy: number
}

/**
 * A component that displays a score view.
 * @param {ScoreViewProps} props - The props for the component.
 * @returns {JSX.Element} - The rendered score view component.
 */
export function ScoreView({ notes, currentNoteIndex, isPlaying, practiceMode, status, accuracy }: ScoreViewProps) {
  return (
    <div className="relative h-[400px] bg-gradient-to-b from-muted/30 to-muted/10 overflow-hidden">
      {/* Center detection line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-accent shadow-lg shadow-accent/50 z-20 -translate-x-1/2" />

      {/* Horizontal reference line */}
      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border/30 -translate-y-1/2" />

      {/* Animated notes timeline */}
      <div className="absolute inset-0 flex items-center">
        <motion.div
          className="flex items-center gap-16 px-8"
          animate={{
            x: isPlaying && practiceMode === "continuous" ? [0, -800] : 0,
          }}
          transition={{
            duration: 8,
            repeat: isPlaying && practiceMode === "continuous" ? Number.POSITIVE_INFINITY : 0,
            ease: "linear",
          }}
        >
          {notes.map((note, index) => {
            const isCurrent = index === currentNoteIndex
            const isPast = index < currentNoteIndex
            const isFuture = index > currentNoteIndex

            return (
              <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: isCurrent ? 1.3 : 1,
                  opacity: isPast ? 0.3 : 1,
                  y: isCurrent ? -10 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-3 relative"
              >
                {/* Note circle */}
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-xl shadow-lg transition-all duration-300 ${
                    isPast
                      ? "bg-emerald-500/20 text-emerald-600 border-2 border-emerald-500/50"
                      : isCurrent
                        ? "bg-accent text-accent-foreground border-4 border-accent shadow-accent/50"
                        : "bg-muted text-muted-foreground border-2 border-border"
                  }`}
                >
                  {note.name}
                </div>

                {/* Frequency label */}
                <div className="text-xs text-muted-foreground font-mono">{Math.round(note.frequency)} Hz</div>

                {/* Current note indicator */}
                {isCurrent && status === "PITCH_STABLE" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-8 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full"
                  >
                    ¡Mantén!
                  </motion.div>
                )}

                {/* Connection line to next note */}
                {index < notes.length - 1 && (
                  <div className="absolute left-full top-1/2 w-16 h-0.5 bg-border/50 -translate-y-1/2" />
                )}
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* Progress indicator */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Progreso</span>
          <span className="text-sm font-bold text-accent">{accuracy}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-accent to-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${accuracy}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  )
}
