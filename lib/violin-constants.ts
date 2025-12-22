/**
 * Represents a single string on the violin.
 */
export interface ViolinString {
  name: "G" | "D" | "A" | "E"
  openFrequency: number
  midiBase: number
}

/**
 * The standard tuning for a violin, ordered from lowest to highest pitch.
 * Each string includes its name, open string frequency in Hz, and base MIDI note number.
 * G3 = 55, D4 = 62, A4 = 69, E5 = 76
 */
export const VIOLIN_TUNING: readonly ViolinString[] = [
  { name: "G", openFrequency: 196.0, midiBase: 55 },
  { name: "D", openFrequency: 293.66, midiBase: 62 },
  { name: "A", openFrequency: 440.0, midiBase: 69 },
  { name: "E", openFrequency: 659.25, midiBase: 76 },
]

/**
 * The names of the violin strings.
 */
export const VIOLIN_STRING_NAMES = ["G", "D", "A", "E"] as const

/**
 * The total number of frets (semitones) to display on the fretboard.
 * 15 frets is a common range for beginner to intermediate players.
 */
export const FRET_COUNT = 15

/**
 * A map of note names for displaying labels, indexed by the remainder of the MIDI note number divided by 12.
 */
export const MIDI_NOTE_NAMES = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
]
