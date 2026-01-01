"use client"

import { Card } from "@/components/ui/card"
import { NotePerformance, PerformanceFeedback } from "@/lib/domains"

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
        <div className="h-[1px] bg-muted-foreground/20 my-1"></div>
        {currentPerformance ? (
          <>
            <div>
              <span className="text-muted-foreground">Played Freq:</span> {currentPerformance.playedNote.frequency.toFixed(2)} Hz
            </div>
            <div>
              <span className="text-muted-foreground">Played Note:</span> {currentPerformance.playedNote.nameWithOctave}
            </div>
            <div>
              <span className="text-muted-foreground">Target Note:</span> {currentPerformance.targetNote.nameWithOctave}
            </div>
            <div>
              <span className="text-muted-foreground">Cents:</span> {currentPerformance.cents.toFixed(1)}¢
            </div>
             <div>
              <span className="text-muted-foreground">Tuning:</span> {currentPerformance.quality.tuning}
            </div>
             <div>
              <span className="text-muted-foreground">Steadiness:</span> {currentPerformance.quality.steadiness}
            </div>
          </>
        ) : (
          <div>
            <span className="text-muted-foreground">No performance data</span>
          </div>
        )}
        <div className="h-[1px] bg-muted-foreground/20 my-1"></div>
        <div>
            <span className="text-muted-foreground">Feedback:</span> {feedback.message}
        </div>
      </div>
    </Card>
  )
}
