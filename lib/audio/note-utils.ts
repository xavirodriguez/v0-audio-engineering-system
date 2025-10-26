export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

export function frequencyToMidi(frequency: number): number {
  return 69 + 12 * Math.log2(frequency / 440)
}

export function frequencyToCents(frequency: number, targetFrequency: number): number {
  if (frequency === 0 || targetFrequency === 0) return 0
  return 1200 * Math.log2(frequency / targetFrequency)
}

export function midiToNoteName(midi: number): string {
  const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
  const octave = Math.floor(midi / 12) - 1
  const noteName = noteNames[midi % 12]
  return `${noteName}${octave}`
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
