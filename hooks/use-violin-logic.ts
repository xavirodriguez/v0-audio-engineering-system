import { useState, useEffect } from "react"
import { VIOLIN_TUNING, FRET_COUNT, MIDI_NOTE_NAMES, VIOLIN_STRING_NAMES } from "@/lib/violin-constants"

/**
 * Represents an active note on the violin fretboard.
 */
export interface ActiveNote {
  string: (typeof VIOLIN_STRING_NAMES)[number]
  fret: number
  noteName: string
}

/**
 * A custom hook to handle the logic of converting a pitch frequency
 * to a position on the violin fretboard.
 *
 * @param {number} currentPitch - The current pitch frequency in Hz.
 * @returns {ActiveNote | null} - The active note on the fretboard, or null if no note is detected.
 */
export const useViolinLogic = (currentPitch: number): ActiveNote | null => {
  const [activeNote, setActiveNote] = useState<ActiveNote | null>(null)

  useEffect(() => {
    if (currentPitch === 0) {
      setActiveNote(null)
      return
    }

    let closestNote: ActiveNote | null = null
    let smallestCentsDifference = Infinity

    for (const string of VIOLIN_TUNING) {
      for (let fret = 0; fret <= FRET_COUNT; fret++) {
        const notePitch = string.openFrequency * Math.pow(2, fret / 12)
        const centsDifference = 1200 * Math.log2(currentPitch / notePitch)
        const absCentsDifference = Math.abs(centsDifference)

        if (absCentsDifference < smallestCentsDifference) {
          smallestCentsDifference = absCentsDifference
          const noteMidi = string.midiBase + fret
          const noteName = MIDI_NOTE_NAMES[noteMidi % 12]

          closestNote = {
            string: string.name,
            fret: fret,
            noteName: noteName,
          }
        }
      }
    }

    // A tolerance of 35 cents to avoid showing a note when the pitch is too far off.
    if (closestNote && smallestCentsDifference < 35) {
      setActiveNote(closestNote)
    } else {
      setActiveNote(null)
    }
  }, [currentPitch])

  return activeNote
}
