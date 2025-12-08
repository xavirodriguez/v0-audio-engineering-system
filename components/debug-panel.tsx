"use client"

import { Card } from "@/components/ui/card"
import type { GlobalTunerState } from "@/lib/types/pitch-detection"

interface DebugPanelProps {
  state: GlobalTunerState
}

/**
 * A debug panel that displays the state of the tuner.
 * @param {DebugPanelProps} props - The props for the component.
 * @returns {JSX.Element | null} - The rendered debug panel component.
 */
export function DebugPanel({ state }: DebugPanelProps) {
  if (process.env.NODE_ENV !== "development") return null

  return (
    <Card className="fixed bottom-4 right-4 bg-black/90 text-white p-4 font-mono text-xs z-50 border-accent">
      <div className="space-y-1">
        <div className="text-accent font-bold mb-2">DEBUG PANEL</div>
        <div>
          <span className="text-muted-foreground">Status:</span> {state.status}
        </div>
        <div>
          <span className="text-muted-foreground">Pitch:</span> {state.currentPitch.toFixed(2)} Hz
        </div>
        <div>
          <span className="text-muted-foreground">Cents:</span> {state.currentCents.toFixed(1)}¢
        </div>
        <div>
          <span className="text-muted-foreground">RMS:</span> {state.currentRms.toFixed(4)}
        </div>
        <div>
          <span className="text-muted-foreground">Threshold:</span> {state.rmsThreshold.toFixed(4)}
        </div>
        <div>
          <span className="text-muted-foreground">Confidence:</span> {(state.currentConfidence * 100).toFixed(1)}%
        </div>
        <div>
          <span className="text-muted-foreground">Latency:</span> {Math.round(state.totalLatencyOffsetMs)}ms
        </div>
        <div>
          <span className="text-muted-foreground">Note:</span> {state.currentNoteIndex + 1}/{state.notes.length}
        </div>
        <div>
          <span className="text-muted-foreground">Stable Frames:</span> {state.consecutiveStableFrames}
        </div>
      </div>
    </Card>
  )
}
