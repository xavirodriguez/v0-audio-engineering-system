"use client"

import { Button } from "@/components/ui/button"
import { Play, Pause, SkipBack, SkipForward, Download } from "lucide-react"

export interface PracticeControlsProps {
  isPlaying: boolean
  isInitialized: boolean
  latency: number
  hasRecording: boolean
  onStartStop: () => void
  onViewRecording: () => void
}

/**
 * A component that displays the controls for the practice session.
 * @param {PracticeControlsProps} props - The props for the component.
 * @returns {JSX.Element} - The rendered practice controls component.
 */
export function PracticeControls({
  isPlaying,
  isInitialized,
  latency,
  hasRecording,
  onStartStop,
  onViewRecording,
}: PracticeControlsProps) {
  return (
    <footer className="border-t border-border bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" disabled>
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button size="lg" className="w-32 h-12 text-lg font-semibold" onClick={onStartStop}>
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  {isInitialized ? "Comenzar" : "Iniciar"}
                </>
              )}
            </Button>

            <Button variant="outline" size="icon" disabled>
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-4">
            {latency > 0 && (
              <div className="text-xs text-muted-foreground font-mono">Latencia: {Math.round(latency)}ms</div>
            )}

            {hasRecording && (
              <Button variant="outline" size="sm" onClick={onViewRecording}>
                <Download className="w-4 h-4 mr-2" />
                Ver Grabación
              </Button>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
