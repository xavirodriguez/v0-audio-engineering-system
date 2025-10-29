export interface PerformanceMetrics {
  accuracy: number // 0-100
  stability: number // 0-100, qué tan estable mantiene el pitch
  responseTime: number // ms, tiempo para alcanzar la nota correcta
  consistency: number // 0-100, consistencia entre intentos
  intonationError: number // cents promedio de desviación
  toneQuality: number // 0-100, calidad del sonido
  spectralCentroid: number // Hz, brillo del tono
  attackTime: number // ms, limpieza del inicio
  timestamp: number
}

export interface StudentProfile {
  id: string
  level: "beginner" | "intermediate" | "advanced"
  strengths: string[] // Áreas donde el estudiante destaca
  weaknesses: string[] // Áreas que necesitan mejora
  practiceHistory: PracticeSession[]
  totalPracticeTime: number // minutos
  averageAccuracy: number
  improvementRate: number // % de mejora por semana
  toneQualityScore: number // 0-100
}

export interface PracticeSession {
  id: string
  timestamp: number
  duration: number // segundos
  exerciseId: string
  exerciseType: ExerciseType
  metrics: PerformanceMetrics
  notes: NotePerformance[]
  completed: boolean
  context: "warm-up" | "deep-study" | "review"
  goal: string // Ej. "Lograr 95% de precisión en la escala de Sol Mayor"
  selfRating: 1 | 2 | 3 | 4 | 5
}

export interface NotePerformance {
  noteMidi: number
  noteName: string
  targetFrequency: number
  attempts: number
  successRate: number
  averageDeviation: number // cents
  averageResponseTime: number // ms
  holdStability: number // 0-100
}

export type ExerciseType =
  | "open-strings"
  | "scales"
  | "intervals"
  | "arpeggios"
  | "sight-reading"
  | "intonation-drill"
  | "rhythm-patterns"
  | "bowing-drill"

export type DifficultyLevel = "easy" | "medium" | "hard" | "expert"

export interface Exercise {
  id: string
  type: ExerciseType
  difficulty: DifficultyLevel
  name: string
  description: string
  notes: ExerciseNote[]
  tempo: number // BPM
  timeSignature: string
  focusAreas: string[] // "intonation", "rhythm", "tone", etc.
  estimatedDuration: number // segundos
  pedagogicalSource?: string // Ej. "Sevcik Op. 1, No. 5"
}

export interface ExerciseNote {
  midi: number
  frequency: number
  name: string
  duration: number // ms
  startTime: number // ms desde el inicio
  dynamic?: "pp" | "p" | "mp" | "mf" | "f" | "ff"
  articulation?: "legato" | "staccato" | "marcato" | "tenuto"
  bowing?: {
    direction: "up" | "down" | "retake"
    contactPoint: "sul-ponticello" | "ordinario" | "sul-tasto"
    portion: "whole" | "half" | "quarter" // Distribución del arco
    dynamic: "p" | "mf" | "f"
  }
  fingering?: 0 | 1 | 2 | 3 | 4 // 0 para cuerda abierta
  position?: 1 | 2 | 3 | 4 | 5
  isShift?: boolean // Indica si la nota requiere un cambio de posición
  rhythmPattern?: string // Ej. "triplet", "dotted", "syncopated"
}

export interface AdaptiveRecommendation {
  exercise: Exercise
  reason: string
  priority: number // 1-10
  estimatedImprovement: number // % esperado de mejora
  focusAreas: string[]
}
