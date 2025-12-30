"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { MusicalObservation, MusicalNote } from "@/lib/domains"

interface PitchIndicatorProps {
  observation: MusicalObservation | null;
  targetNote: MusicalNote | null;
}

/**
 * A component that displays a pitch indicator.
 * @param {PitchIndicatorProps} props - The props for the component.
 * @returns {JSX.Element} - The rendered pitch indicator component.
 */
export function PitchIndicator({ observation, targetNote }: PitchIndicatorProps) {
  if (!observation) {
    return (
      <div className="p-6 border-t border-border bg-card/50 text-center">
        Waiting for input...
      </div>
    );
  }

  const { note } = observation;
  const tuningStatus = note.getTuningStatus(10); // Domain logic!

  const colorMap = {
    'in-tune': 'bg-emerald-500',
    'sharp': 'bg-yellow-500',
    'flat': 'bg-blue-500'
  };

  const getPitchIndicatorPosition = () => {
    const clampedCents = Math.max(-50, Math.min(50, note.centsDeviation));
    return (clampedCents / 50) * 50;
  };

  return (
    <div className="p-6 border-t border-border bg-card/50">
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-sm font-medium text-muted-foreground mb-2">Indicador de Afinación</div>
          <div className="relative h-16 bg-muted rounded-xl overflow-hidden shadow-inner">
            <div className="absolute inset-y-0 left-1/2 w-1/4 -translate-x-1/2 bg-emerald-500/10" />
            <div className="absolute inset-y-0 left-1/2 w-1 bg-foreground/20 -translate-x-1/2" />
            <motion.div
              className={`absolute inset-y-0 w-3 rounded-full transition-colors duration-100 ${colorMap[tuningStatus]}`}
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
              <div className="text-3xl font-bold text-foreground mb-1">{targetNote?.getFullName() || "--"}</div>
              <div className="text-xs text-muted-foreground">Nota Objetivo</div>
            </div>
          </Card>
          <Card className="border-border bg-background/50 p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-1">
                {note.getFullName()}
              </div>
              <div className="text-xs text-muted-foreground">Detectado</div>
            </div>
          </Card>
          <Card className="border-border bg-background/50 p-4">
            <div className="text-center">
              <div
                className={`text-3xl font-bold mb-1 ${
                  tuningStatus === 'in-tune'
                    ? "text-emerald-600"
                    : "text-yellow-600"
                }`}
              >
                {note.centsDeviation > 0 ? "+" : ""}
                {note.centsDeviation.toFixed(1)}¢
              </div>
              <div className="text-xs text-muted-foreground">Desviación</div>
            </div>
          </Card>
          <Card className="border-border bg-background/50 p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-1">{observation.isReliable() ? 'Stable' : 'Detecting...'}</div>
              <div className="text-xs text-muted-foreground">Estabilidad</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
