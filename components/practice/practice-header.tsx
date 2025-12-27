"use client"

import { Button } from "@/components/ui/button"
import { Settings, Volume2, RotateCcw, Music, Circle } from "lucide-react"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"

export interface PracticeHeaderProps {
  exerciseName?: string
  status: string
  isRecording: boolean
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
export function PracticeHeader({
  exerciseName,
  status,
  isRecording,
  viewMode,
  showSettings,
  onViewModeToggle,
  onExercisesClick,
  onCalibrateClick,
  onSettingsToggle,
}: PracticeHeaderProps) {
  const t = useTranslations("practice")

  const getStatusText = () => {
    switch (status) {
      case "IDLE":
        return t("status.ready")
      case "CALIBRATING":
        return t("status.calibrating")
      case "PITCH_DETECTING":
        return t("status.detecting")
      case "PITCH_STABLE":
        return t("status.stable")
      case "ERROR":
        return t("status.error")
      default:
        return ""
    }
  }

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="font-serif text-2xl font-bold text-foreground">{exerciseName || t("title")}</h1>
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
                <span className="text-sm font-medium">{t("recording")}</span>
              </motion.div>
            )}

            <Button variant="outline" size="sm" onClick={onViewModeToggle}>
              <Music className="w-4 h-4 mr-2" />
              {viewMode === "animated" ? "Partitura" : "Animado"}
            </Button>

            <Button variant="outline" size="sm" onClick={onExercisesClick}>
              {t("exercises")}
            </Button>

            <Button variant="outline" size="sm" onClick={onCalibrateClick} disabled={status === "CALIBRATING"}>
              <RotateCcw className="w-4 h-4 mr-2" />
              {t("calibrate")}
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
}
