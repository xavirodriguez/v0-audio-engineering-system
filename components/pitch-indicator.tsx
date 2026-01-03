"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { MusicalNote } from "@/lib/domains"
import { NotePerformance } from "@/lib/domains/music/note-performance.value-object"
import { CheckCircle } from "lucide-react"

interface PitchIndicatorProps {
  performance: NotePerformance | null;
  targetNote: MusicalNote | null;
}

/**
 * A component that displays a pitch indicator.
 * @param {PitchIndicatorProps} props - The props for the component.
 * @returns {JSX.Element} - The rendered pitch indicator component.
 */
export function PitchIndicator({ performance, targetNote }: PitchIndicatorProps) {
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (
      performance &&
      targetNote &&
      performance.quality.tuning === 'in-tune' &&
      performance.quality.steadiness === 'stable'
    ) {
      setShowSuccess(true)
      const timer = setTimeout(() => setShowSuccess(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [performance, targetNote])

  if (!performance || !targetNote) {
    return (
      <div className="p-6 border-t border-border bg-card/50 text-center">
        Waiting for input...
      </div>
    )
  }

  const notePerformance = performance

  const colorMap = {
    'in-tune': 'bg-emerald-500',
    sharp: 'bg-yellow-500',
    flat: 'bg-blue-500',
  }

  const getPitchIndicatorPosition = () => {
    const clampedCents = Math.max(
      -50,
      Math.min(50, notePerformance.playedNote.centsDeviation)
    )
    return (clampedCents / 50) * 50
  }

  return (
    <div className="p-6 border-t border-border bg-card/50 relative">
      {/* AÑADIR: Overlay de éxito */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute inset-0 bg-emerald-500/20 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg"
        >
          <div className="flex flex-col items-center gap-4">
            <CheckCircle className="w-20 h-20 text-emerald-500 animate-bounce" />
            <p className="text-2xl font-bold text-emerald-500">¡Perfecto!</p>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        <div className="text-center">
          <div className="text-sm font-medium text-muted-foreground mb-2">
            Indicador de Afinación
          </div>
          <div className="relative h-16 bg-muted rounded-xl overflow-hidden shadow-inner">
            <div className="absolute inset-y-0 left-1/2 w-1/4 -translate-x-1/2 bg-emerald-500/10" />
            <div className="absolute inset-y-0 left-1/2 w-1 bg-foreground/20 -translate-x-1/2" />
            <motion.div
              className={`absolute inset-y-0 w-3 rounded-full transition-colors duration-100 ${
                colorMap[notePerformance.quality.tuning]
              }`}
              animate={{
                left: `calc(50% + ${getPitchIndicatorPosition()}%)`,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{
                transform: "translateX(-50%)",
                boxShadow: "0 0 20px currentColor",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-between px-4 text-xs text-muted-foreground font-mono">
              <span>-50¢</span>
              <span>-25¢</span>
              <span className="font-bold">0¢</span>
              <span>+25¢</span>
              <span>+50¢</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border bg-background/50 p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-1">
                {targetNote?.getFullName() || "--"}
              </div>
              <div className="text-xs text-muted-foreground">Nota Objetivo</div>
            </div>
          </Card>
          <Card className="border-border bg-background/50 p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-1">
                {notePerformance.playedNote.getFullName()}
              </div>
              <div className="text-xs text-muted-foreground">Playing</div>
            </div>
          </Card>
          <Card className="border-border bg-background/50 p-4">
            <div className="text-center">
              <div
                className={`text-3xl font-bold mb-1 ${
                  notePerformance.quality.tuning === "in-tune"
                    ? "text-emerald-600"
                    : "text-yellow-600"
                }`}
              >
                {notePerformance.playedNote.centsDeviation > 0 ? "+" : ""}
                {notePerformance.playedNote.centsDeviation.toFixed(1)}¢
              </div>
              <div className="text-xs text-muted-foreground">Tuning</div>
            </div>
          </Card>
          <Card className="border-border bg-background/50 p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-1">
                {notePerformance.quality.steadiness === "stable"
                  ? "Stable"
                  : "Detecting..."}
              </div>
              <div className="text-xs text-muted-foreground">Steadiness</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
