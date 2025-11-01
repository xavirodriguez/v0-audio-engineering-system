import { Note, Interval, Scale, Chord } from "tonal"

export function midiToFrequency(midi: number): number {
  const freq = Note.freq(Note.fromMidi(midi))
  return freq || 440
}

export function frequencyToMidi(frequency: number): number {
  const note = Note.fromFreq(frequency)
  const midiNum = Note.midi(note)
  return midiNum || 69
}

export function frequencyToCents(frequency: number, targetFrequency: number): number {
  if (frequency === 0 || targetFrequency === 0) return 0
  return 1200 * Math.log2(frequency / targetFrequency)
}

export function midiToNoteName(midi: number): string {
  return Note.fromMidi(midi) || "A4"
}

export function calculateJustIntonation(rootNote: string, intervalName: string): number {
  try {
    const targetNote = Note.transpose(rootNote, intervalName)
    const freq = Note.freq(targetNote)
    return freq || 440
  } catch {
    return 440
  }
}

export function generateScale(tonic: string, scaleType = "major"): string[] {
  const scale = Scale.get(`${tonic} ${scaleType}`)
  return scale.notes
}

export function analyzeInterval(note1: string, note2: string): string {
  return Interval.distance(note1, note2)
}

export function analyzeChord(notes: string[]): string {
  const chord = Chord.detect(notes)
  return chord[0] || "Unknown"
}

// Notas comunes del violín (cuerdas abiertas y primeras posiciones)
export const VIOLIN_NOTES = [
  { midi: 55, name: "G3", frequency: midiToFrequency(55) }, // Cuerda G
  { midi: 62, name: "D4", frequency: midiToFrequency(62) }, // Cuerda D
  { midi: 69, name: "A4", frequency: midiToFrequency(69) }, // Cuerda A
  { midi: 76, name: "E5", frequency: midiToFrequency(76) }, // Cuerda E
]

// Generar una secuencia simple de práctica
export function generatePracticeSequence(): Array<{
  midi: number
  frequency: number
  name: string
  duration: number
  startTime: number
}> {
  const sequence = [
    { midi: 69, duration: 2000 }, // A4 - 2 segundos
    { midi: 71, duration: 2000 }, // B4
    { midi: 73, duration: 2000 }, // C#5
    { midi: 74, duration: 2000 }, // D5
    { midi: 76, duration: 2000 }, // E5
  ]

  let cumulativeTime = 0
  return sequence.map((note) => {
    const result = {
      midi: note.midi,
      frequency: midiToFrequency(note.midi),
      name: midiToNoteName(note.midi),
      duration: note.duration,
      startTime: cumulativeTime,
    }
    cumulativeTime += note.duration
    return result
  })
}
