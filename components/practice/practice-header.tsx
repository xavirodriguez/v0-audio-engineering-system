"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Settings, Volume2, RotateCcw, Music, Circle } from "lucide-react"
import { motion } from "framer-motion"
import { usePitchDetection } from "@/hooks/use-pitch-detection"
import { useRecording } from "@/hooks/use-recording"

export interface PracticeHeaderProps {
  exerciseName?: string
  viewMode: "animated" | "sheet-music"
  showSettings: boolean
  onViewModeToggle: () => void
  onExercisesClick: () => void
  onCalibrateClick: () => void
  onSettingsToggle: () => void
}

/**
 * A component that displays the header for the practice session.
 * @param {PracticeHeaderProps} props - The props for the component.
 * @returns {JSX.Element} - The rendered practice header component.
 */
export const PracticeHeader = memo(function PracticeHeader({
  exerciseName,
  viewMode,
  showSettings,
  onViewModeToggle,
  onExercisesClick,
  onCalibrateClick,
  onSettingsToggle,
}: PracticeHeaderProps) {
  const { currentState } = usePitchDetection()
  const { isRecording } = useRecording()

  const getStatusText = () => {
    switch (currentState) {
      case "IDLE":
        return "Listo para comenzar"
      case "CALIBRATING":
        return "Calibrando sistema..."
      case "PITCH_DETECTING":
        return "Escuchando tu interpretación"
      case "PITCH_STABLE":
        return "¡Perfecto! Mantén la nota"
      case "ERROR":
        return "Error en el sistema"
      default:
        return ""
    }
  }

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="font-serif text-2xl font-bold text-foreground">{exerciseName || "Práctica Libre"}</h1>
            <p className="text-sm text-muted-foreground mt-1">{getStatusText()}</p>
          </div>

          <div className="flex items-center gap-2">
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 text-red-600 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-950/30"
              >
                <Circle className="w-3 h-3 fill-current animate-pulse" />
                <span className="text-sm font-medium">Grabando</span>
              </motion.div>
            )}

            <Button variant="outline" size="sm" onClick={onViewModeToggle}>
              <Music className="w-4 h-4 mr-2" />
              {viewMode === "animated" ? "Partitura" : "Animado"}
            </Button>

            <Button variant="outline" size="sm" onClick={onExercisesClick}>
              Ejercicios
            </Button>

            <Button variant="outline" size="icon" onClick={onCalibrateClick} disabled={currentState === "CALIBRATING"} aria-label="Calibrar">
              <RotateCcw className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={onSettingsToggle}
              className={showSettings ? "bg-accent" : ""}
            >
              <Settings className="w-4 h-4" />
            </Button>

            <Button variant="outline" size="icon">
              <Volume2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
})
