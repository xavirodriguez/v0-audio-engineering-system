import type { Exercise } from "@/lib/types/exercise-system"

/**
 * Ejercicios clásicos de violín basados en el método Suzuki
 * y escalas fundamentales para principiantes.
 */
export const CLASSIC_VIOLIN_EXERCISES: Exercise[] = [
  {
    id: "scale-g-major",
    name: "Escala de Sol Mayor",
    description: "Escala de una octava en primera posición. Fundamental para desarrollar la afinación.",
    difficulty: "easy",
    category: "scales",
    tempo: 60, // Lento para principiantes
    timeSignature: "4/4",
    estimatedDuration: 120000, // 2 minutos
    notes: [
      { name: "G4", frequency: 392.0, midi: 67, noteName: "G", octave: 4, duration: 2000, fingering: 0, bowing: { direction: "down", type: "detache" } },
      { name: "A4", frequency: 440.0, midi: 69, noteName: "A", octave: 4, duration: 2000, fingering: 1, bowing: { direction: "up", type: "detache" } },
      { name: "B4", frequency: 493.88, midi: 71, noteName: "B", octave: 4, duration: 2000, fingering: 2, bowing: { direction: "down", type: "detache" } },
      { name: "C5", frequency: 523.25, midi: 72, noteName: "C", octave: 5, duration: 2000, fingering: 3, bowing: { direction: "up", type: "detache" } },
      { name: "D5", frequency: 587.33, midi: 74, noteName: "D", octave: 5, duration: 2000, fingering: 0, bowing: { direction: "down", type: "detache" } },
      { name: "E5", frequency: 659.25, midi: 76, noteName: "E", octave: 5, duration: 2000, fingering: 1, bowing: { direction: "up", type: "detache" } },
      { name: "F#5", frequency: 739.99, midi: 78, noteName: "F#", octave: 5, duration: 2000, fingering: 2, bowing: { direction: "down", type: "detache" } },
      { name: "G5", frequency: 783.99, midi: 79, noteName: "G", octave: 5, duration: 2000, fingering: 3, bowing: { direction: "up", type: "detache" } },
    ],
    focusAreas: ["intonation", "bow-control"],
    prerequisites: [],
  },
  {
    id: "scale-d-major",
    name: "Escala de Re Mayor",
    description: "Escala de una octava en primera posición. Excelente para la cuerda de Re.",
    difficulty: "easy",
    category: "scales",
    tempo: 60,
    timeSignature: "4/4",
    estimatedDuration: 120000,
    notes: [
      { name: "D4", frequency: 293.66, midi: 62, noteName: "D", octave: 4, duration: 2000, fingering: 0, bowing: { direction: "down", type: "detache" } },
      { name: "E4", frequency: 329.63, midi: 64, noteName: "E", octave: 4, duration: 2000, fingering: 1, bowing: { direction: "up", type: "detache" } },
      { name: "F#4", frequency: 369.99, midi: 66, noteName: "F#", octave: 4, duration: 2000, fingering: 2, bowing: { direction: "down", type: "detache" } },
      { name: "G4", frequency: 392.0, midi: 67, noteName: "G", octave: 4, duration: 2000, fingering: 3, bowing: { direction: "up", type: "detache" } },
      { name: "A4", frequency: 440.0, midi: 69, noteName: "A", octave: 4, duration: 2000, fingering: 0, bowing: { direction: "down", type: "detache" } },
      { name: "B4", frequency: 493.88, midi: 71, noteName: "B", octave: 4, duration: 2000, fingering: 1, bowing: { direction: "up", type: "detache" } },
      { name: "C#5", frequency: 554.37, midi: 73, noteName: "C#", octave: 5, duration: 2000, fingering: 2, bowing: { direction: "down", type: "detache" } },
      { name: "D5", frequency: 587.33, midi: 74, noteName: "D", octave: 5, duration: 2000, fingering: 3, bowing: { direction: "up", type: "detache" } },
    ],
    focusAreas: ["intonation", "finger-placement"],
    prerequisites: [],
  },
  {
    id: "scale-c-major",
    name: "Escala de Do Mayor",
    description: "Escala básica sin alteraciones. Perfecta para comenzar.",
    difficulty: "easy",
    category: "scales",
    tempo: 60,
    timeSignature: "4/4",
    estimatedDuration: 120000,
    notes: [
      { name: "C4", frequency: 261.63, midi: 60, noteName: "C", octave: 4, duration: 2000, fingering: 0, bowing: { direction: "down", type: "detache" } },
      { name: "D4", frequency: 293.66, midi: 62, noteName: "D", octave: 4, duration: 2000, fingering: 1, bowing: { direction: "up", type: "detache" } },
      { name: "E4", frequency: 329.63, midi: 64, noteName: "E", octave: 4, duration: 2000, fingering: 2, bowing: { direction: "down", type: "detache" } },
      { name: "F4", frequency: 349.23, midi: 65, noteName: "F", octave: 4, duration: 2000, fingering: 3, bowing: { direction: "up", type: "detache" } },
      { name: "G4", frequency: 392.0, midi: 67, noteName: "G", octave: 4, duration: 2000, fingering: 0, bowing: { direction: "down", type: "detache" } },
      { name: "A4", frequency: 440.0, midi: 69, noteName: "A", octave: 4, duration: 2000, fingering: 1, bowing: { direction: "up", type: "detache" } },
      { name: "B4", frequency: 493.88, midi: 71, noteName: "B", octave: 4, duration: 2000, fingering: 2, bowing: { direction: "down", type: "detache" } },
      { name: "C5", frequency: 523.25, midi: 72, noteName: "C", octave: 5, duration: 2000, fingering: 3, bowing: { direction: "up", type: "detache" } },
    ],
    focusAreas: ["intonation", "basic-technique"],
    prerequisites: [],
  },
  {
    id: "scale-a-major",
    name: "Escala de La Mayor",
    description: "Escala con tres sostenidos. Nivel intermedio.",
    difficulty: "medium",
    category: "scales",
    tempo: 72,
    timeSignature: "4/4",
    estimatedDuration: 100000,
    notes: [
      { name: "A3", frequency: 220.0, midi: 57, noteName: "A", octave: 3, duration: 1667, fingering: 0, bowing: { direction: "down", type: "detache" } },
      { name: "B3", frequency: 246.94, midi: 59, noteName: "B", octave: 3, duration: 1667, fingering: 1, bowing: { direction: "up", type: "detache" } },
      { name: "C#4", frequency: 277.18, midi: 61, noteName: "C#", octave: 4, duration: 1667, fingering: 2, bowing: { direction: "down", type: "detache" } },
      { name: "D4", frequency: 293.66, midi: 62, noteName: "D", octave: 4, duration: 1667, fingering: 3, bowing: { direction: "up", type: "detache" } },
      { name: "E4", frequency: 329.63, midi: 64, noteName: "E", octave: 4, duration: 1667, fingering: 0, bowing: { direction: "down", type: "detache" } },
      { name: "F#4", frequency: 369.99, midi: 66, noteName: "F#", octave: 4, duration: 1667, fingering: 1, bowing: { direction: "up", type: "detache" } },
      { name: "G#4", frequency: 415.30, midi: 68, noteName: "G#", octave: 4, duration: 1667, fingering: 2, bowing: { direction: "down", type: "detache" } },
      { name: "A4", frequency: 440.0, midi: 69, noteName: "A", octave: 4, duration: 1667, fingering: 3, bowing: { direction: "up", type: "detache" } },
    ],
    focusAreas: ["intonation", "sharps"],
    prerequisites: ["scale-g-major"],
  },
]

/**
 * Convierte ejercicios clásicos en recomendaciones adaptativas
 */
export function convertToRecommendations(
  exercises: Exercise[]
): Array<{
  exercise: Exercise
  reason: string
  estimatedImprovement: number
  focusAreas: string[]
}> {
  return exercises.map((exercise) => ({
    exercise,
    reason: `Ejercicio fundamental para desarrollar ${exercise.focusAreas.join(" y ")}`,
    estimatedImprovement: exercise.difficulty === "easy" ? 15 : exercise.difficulty === "medium" ? 25 : 35,
    focusAreas: exercise.focusAreas,
  }))
}
