import { Note, Interval, Scale, Chord } from "tonal"

/**
 * Converts a MIDI number to a frequency.
 * @param {number} midi - The MIDI number.
 * @returns {number} - The frequency in Hz.
 */
export function midiToFrequency(midi: number): number {
  const freq = Note.freq(Note.fromMidi(midi))
  return freq || 440
}

/**
 * Converts a frequency to a MIDI number.
 * @param {number} frequency - The frequency in Hz.
 * @returns {number} - The MIDI number.
 */
export function frequencyToMidi(frequency: number): number {
  const note = Note.fromFreq(frequency)
  const midiNum = Note.midi(note)
  return midiNum || 69
}

/**
 * Converts a frequency to cents.
 * @param {number} frequency - The frequency in Hz.
 * @param {number} targetFrequency - The target frequency in Hz.
 * @returns {number} - The cents.
 */
export function frequencyToCents(frequency: number, targetFrequency: number): number {
  if (frequency === 0 || targetFrequency === 0) return 0
  return 1200 * Math.log2(frequency / targetFrequency)
}

/**
 * Converts a MIDI number to a note name.
 * @param {number} midi - The MIDI number.
 * @returns {string} - The note name.
 */
export function midiToNoteName(midi: number): string {
  return Note.fromMidi(midi) || "A4"
}

/**
 * Calculates the just intonation of a note.
 * @param {string} rootNote - The root note.
 * @param {string} intervalName - The interval name.
 * @returns {number} - The frequency in Hz.
 */
export function calculateJustIntonation(rootNote: string, intervalName: string): number {
  try {
    const targetNote = Note.transpose(rootNote, intervalName)
    const freq = Note.freq(targetNote)
    return freq || 440
  } catch {
    return 440
  }
}

/**
 * Generates a scale.
 * @param {string} tonic - The tonic of the scale.
 * @param {string} [scaleType="major"] - The type of the scale.
 * @returns {string[]} - The notes of the scale.
 */
export function generateScale(tonic: string, scaleType = "major"): string[] {
  const scale = Scale.get(`${tonic} ${scaleType}`)
  return scale.notes
}

/**
 * Analyzes an interval.
 * @param {string} note1 - The first note.
 * @param {string} note2 - The second note.
 * @returns {string} - The interval.
 */
export function analyzeInterval(note1: string, note2: string): string {
  return Interval.distance(note1, note2)
}

/**
 * Analyzes a chord.
 * @param {string[]} notes - The notes of the chord.
 * @returns {string} - The chord.
 */
export function analyzeChord(notes: string[]): string {
  const chord = Chord.detect(notes)
  return chord[0] || "Unknown"
}

/**
 * The common notes of a violin.
 */
export const VIOLIN_NOTES = [
  { midi: 55, name: "G3", frequency: midiToFrequency(55) }, // Cuerda G
  { midi: 62, name: "D4", frequency: midiToFrequency(62) }, // Cuerda D
  { midi: 69, name: "A4", frequency: midiToFrequency(69) }, // Cuerda A
  { midi: 76, name: "E5", frequency: midiToFrequency(76) }, // Cuerda E
]

import { ViolinExerciseSchema } from "@/lib/validation/schemas";

/**
 * Generates a simple practice sequence.
 * @returns {Array<{midi: number, frequency: number, name: string, duration: number, startTime: number}>} - The practice sequence.
 */
export function generatePracticeSequence(): Array<{
  midi: number
  frequency: number
  name: string
  duration: number
  startTime: number
}> {
  // A G Major scale, which is a common and valid exercise for violin
  const sequence = [
    { midi: 67, duration: 1000 }, // G4
    { midi: 69, duration: 1000 }, // A4
    { midi: 71, duration: 1000 }, // B4
    { midi: 72, duration: 1000 }, // C5
    { midi: 74, duration: 1000 }, // D5
    { midi: 76, duration: 1000 }, // E5
    { midi: 78, duration: 1000 }, // F#5
    { midi: 79, duration: 1000 }, // G5
  ];


  let cumulativeTime = 0;
  const unvalidatedSequence = sequence.map((note) => {
    const result = {
      midi: note.midi,
      frequency: midiToFrequency(note.midi),
      name: midiToNoteName(note.midi),
      duration: note.duration,
      startTime: cumulativeTime,
    };
    cumulativeTime += note.duration;
    return result;
  });

  try {
    return ViolinExerciseSchema.parse(unvalidatedSequence);
  } catch (error) {
    console.error("Generated practice sequence is invalid:", error);
    // Return a default, valid sequence as a fallback
    return [
      {
        midi: 69,
        frequency: 440,
        name: "A4",
        duration: 1000,
        startTime: 0,
      }
    ];
  }
}
