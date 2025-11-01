"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { motion, AnimatePresence } from "framer-motion"

export interface SettingsPanelProps {
  visible: boolean
  sensitivity: number[]
  tempo: number[]
  volume: number[]
  practiceMode: "step-by-step" | "continuous"
  onSensitivityChange: (value: number[]) => void
  onTempoChange: (value: number[]) => void
  onVolumeChange: (value: number[]) => void
  onPracticeModeChange: (mode: "step-by-step" | "continuous") => void
}

export function SettingsPanel({
  visible,
  sensitivity,
  tempo,
  volume,
  practiceMode,
  onSensitivityChange,
  onTempoChange,
  onVolumeChange,
  onPracticeModeChange,
}: SettingsPanelProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-b border-border bg-card/50 backdrop-blur-sm overflow-hidden"
        >
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Sensibilidad de Pitch</label>
                <Slider
                  value={sensitivity}
                  onValueChange={onSensitivityChange}
                  min={1}
                  max={10}
                  step={1}
                  className="mb-2"
                />
                <p className="text-xs text-muted-foreground">Nivel: {sensitivity[0]}/10</p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Tempo</label>
                <Slider value={tempo} onValueChange={onTempoChange} min={60} max={180} step={5} className="mb-2" />
                <p className="text-xs text-muted-foreground">{tempo[0]} BPM</p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Volumen</label>
                <Slider value={volume} onValueChange={onVolumeChange} min={0} max={100} step={1} className="mb-2" />
                <p className="text-xs text-muted-foreground">{volume[0]}%</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <label className="text-sm font-medium text-foreground">Modo de Práctica:</label>
              <div className="flex gap-2">
                <Button
                  variant={practiceMode === "step-by-step" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPracticeModeChange("step-by-step")}
                >
                  Paso a Paso
                </Button>
                <Button
                  variant={practiceMode === "continuous" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPracticeModeChange("continuous")}
                >
                  Continuo
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
