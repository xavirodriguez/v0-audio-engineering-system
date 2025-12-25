"use client"

import { PitchIndicator } from "@/components/pitch-indicator"
import { Fretboard } from "@/components/practice/fretboard"
import { usePitchDetectionState } from "@/hooks/use-pitch-detection-state"

/**
 * Renders the tuner display, including the pitch indicator and fretboard.
 * This component is designed to be a self-contained unit that visualizes
 * the current pitch information from the pitch detection state.
 *
 * It includes an ARIA live region to announce pitch feedback to users
 * of assistive technologies.
 */
export function TunerDisplay() {
  const {
    notes,
    currentNoteIndex,
    currentPitch,
    currentCents,
    currentConfidence,
    currentRms,
    rmsThreshold
  } = usePitchDetectionState()

  const getPitchFeedback = () => {
    if (currentCents === null || currentNoteIndex === null) return ""
    const note = notes[currentNoteIndex]
    if (!note) return ""

    if (Math.abs(currentCents) < 10) return `${note.name}: In tune`
    if (currentCents > 10) return `${note.name}: Too high`
    return `${note.name}: Too low`
  }

  return (
    <div>
      <PitchIndicator
        currentNote={notes[currentNoteIndex]}
        currentPitch={currentPitch}
        currentCents={currentCents}
        currentConfidence={currentConfidence}
        currentRms={currentRms}
        rmsThreshold={rmsThreshold}
      />
      <div className="p-4 sm:p-6">
        <Fretboard currentPitch={currentPitch} />
      </div>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {getPitchFeedback()}
      </div>
    </div>
  )
}
