"use client"

import { Card } from "@/components/ui/card"
import type { PerformanceFeedback } from "@/lib/domains/learning/performance-feedback"
import type { NotePerformance } from "@/lib/domains/music/note-performance.value-object"

interface DebugPanelProps {
  state: {
    currentState: string;
    currentPerformance: NotePerformance | null;
    feedback: PerformanceFeedback;
  }
}

/**
 * A debug panel that displays the state of the tuner.
 * @param {DebugPanelProps} props - The props for the component.
 * @returns {JSX.Element | null} - The rendered debug panel component.
 */
export function DebugPanel({ state }: DebugPanelProps) {
  if (process.env.NODE_ENV !== "development") return null

  const { currentState, currentPerformance, feedback } = state;

  return (
    <Card className="fixed bottom-4 right-4 bg-black/90 text-white p-4 font-mono text-xs z-50 border-accent w-64">
      <div className="space-y-1">
        <div className="text-accent font-bold mb-2">DEBUG PANEL</div>
        <div>
          <span className="text-muted-foreground">Status:</span> {currentState}
        </div>
        <div className="h-px bg-muted-foreground/20 my-1"></div>
        {currentPerformance ? (
          <>
            <div>
              <span className="text-muted-foreground">Played Freq:</span>{" "}
              {currentPerformance.playedNote.frequency.toFixed(2)} Hz
            </div>
            <div>
              <span className="text-muted-foreground">Played Note:</span>{" "}
              {currentPerformance.playedNote.getFullName()}
            </div>
            <div>
              <span className="text-muted-foreground">Target Note:</span>{" "}
              {currentPerformance.targetNote.getFullName()}
            </div>
            <div>
              <span className="text-muted-foreground">Cents:</span>{" "}
              {currentPerformance.centDeviation.toFixed(1)}¢
            </div>
            <div>
              <span className="text-muted-foreground">Tuning:</span>{" "}
              {currentPerformance.quality.tuning}
            </div>
            <div>
              <span className="text-muted-foreground">Steadiness:</span>{" "}
              {currentPerformance.quality.steadiness}
            </div>
          </>
        ) : (
          <div>
            <span className="text-muted-foreground">No performance data</span>
          </div>
        )}
        <div className="h-px bg-muted-foreground/20 my-1"></div>
        <div>
          <span className="text-muted-foreground">Feedback:</span>{" "}
          {feedback.signals[0]?.type ?? "none"}
        </div>
      </div>
    </Card>
  )
}
