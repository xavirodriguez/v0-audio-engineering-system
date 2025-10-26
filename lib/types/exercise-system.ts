export interface PerformanceMetrics {
  accuracy: number // 0-100
  stability: number // 0-100, qué tan estable mantiene el pitch
  responseTime: number // ms, tiempo para alcanzar la nota correcta
  consistency: number // 0-100, consistencia entre intentos
  intonationError: number // cents promedio de desviación
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
}

export interface ExerciseNote {
  midi: number
  frequency: number
  name: string
  duration: number // ms
  startTime: number // ms desde el inicio
  dynamic?: "pp" | "p" | "mp" | "mf" | "f" | "ff"
  articulation?: "legato" | "staccato" | "marcato" | "tenuto"
}

export interface AdaptiveRecommendation {
  exercise: Exercise
  reason: string
  priority: number // 1-10
  estimatedImprovement: number // % esperado de mejora
  focusAreas: string[]
}
