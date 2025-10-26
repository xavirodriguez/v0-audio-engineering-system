"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { midiToNoteName } from "@/lib/audio/note-utils"
import type { PracticeNote } from "@/lib/types/pitch-detection"

interface PitchIndicatorProps {
  currentNote: PracticeNote
  currentPitch: number
  currentCents: number
  currentConfidence: number
  currentRms: number
  rmsThreshold: number
}

export function PitchIndicator({
  currentNote,
  currentPitch,
  currentCents,
  currentConfidence,
  currentRms,
  rmsThreshold,
}: PitchIndicatorProps) {
  const getPitchIndicatorColor = () => {
    if (currentRms < rmsThreshold) return "bg-muted"

    const absCents = Math.abs(currentCents)
    if (absCents < 10) return "bg-emerald-500"
    if (absCents < 25) return "bg-yellow-500"
    if (absCents < 50) return "bg-orange-500"
    return "bg-red-500"
  }

  const getPitchIndicatorPosition = () => {
    const clampedCents = Math.max(-50, Math.min(50, currentCents))
    return (clampedCents / 50) * 50
  }

  return (
    <div className="p-6 border-t border-border bg-card/50">
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-sm font-medium text-muted-foreground mb-2">Indicador de Afinación</div>
          <div className="relative h-16 bg-muted rounded-xl overflow-hidden shadow-inner">
            {/* Green zone (perfect pitch) */}
            <div className="absolute inset-y-0 left-1/2 w-1/4 -translate-x-1/2 bg-emerald-500/10" />

            {/* Center line */}
            <div className="absolute inset-y-0 left-1/2 w-1 bg-foreground/20 -translate-x-1/2" />

            {/* Pitch needle */}
            <motion.div
              className={`absolute inset-y-0 w-3 rounded-full transition-colors duration-100 ${getPitchIndicatorColor()}`}
              animate={{
                left: `calc(50% + ${getPitchIndicatorPosition()}%)`,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{
                transform: "translateX(-50%)",
                boxShadow: "0 0 20px currentColor",
              }}
            />

            {/* Scale markers */}
            <div className="absolute inset-0 flex items-center justify-between px-4 text-xs text-muted-foreground font-mono">
              <span>-50¢</span>
              <span>-25¢</span>
              <span className="font-bold">0¢</span>
              <span>+25¢</span>
              <span>+50¢</span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border bg-background/50 p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-1">{currentNote?.name || "--"}</div>
              <div className="text-xs text-muted-foreground">Nota Objetivo</div>
            </div>
          </Card>

          <Card className="border-border bg-background/50 p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-1">
                {currentPitch > 0 ? midiToNoteName(Math.round(69 + 12 * Math.log2(currentPitch / 440))) : "--"}
              </div>
              <div className="text-xs text-muted-foreground">Detectado</div>
            </div>
          </Card>

          <Card className="border-border bg-background/50 p-4">
            <div className="text-center">
              <div
                className={`text-3xl font-bold mb-1 ${
                  Math.abs(currentCents) < 10
                    ? "text-emerald-600"
                    : Math.abs(currentCents) < 25
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {currentCents > 0 ? "+" : ""}
                {Math.round(currentCents)}¢
              </div>
              <div className="text-xs text-muted-foreground">Desviación</div>
            </div>
          </Card>

          <Card className="border-border bg-background/50 p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-1">{Math.round(currentConfidence * 100)}%</div>
              <div className="text-xs text-muted-foreground">Confianza</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
