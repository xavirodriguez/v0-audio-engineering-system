export interface Exercise {
  id: string
  type: string
  difficulty: string
  name: string
  description: string
  notes: Array<{
    midi: number
    frequency: number
    name: string
    duration: number
    startTime: number
  }>
  tempo: number
  timeSignature: string
  focusAreas: string[]
  estimatedDuration: number
  pedagogicalSource?: string
}

export interface UserProfile {
  id: string
  name: string
  level: 'beginner' | 'intermediate' | 'advanced'
  strengths: string[]
  weaknesses: string[]
  practiceHistory: SessionData[]
  totalPracticeTime: number
  averageAccuracy: number
  improvementRate: number
  toneQualityScore: number
}

export interface SessionData {
  id: string
  timestamp: number
  duration: number
  exerciseId: string
  exerciseType: string
  metrics: {
    accuracy: number
    stability: number
    responseTime: number
    consistency: number
    intonationError: number
    toneQuality: number
    spectralCentroid: number
    attackTime: number
    timestamp: number
  }
  notes: Array<{
    noteMidi: number
    noteName: string
    targetFrequency: number
    attempts: number
    successRate: number
    averageDeviation: number
    averageResponseTime: number
    holdStability: number
  }>
  completed: boolean
  context: 'warm-up' | 'deep-study' | 'review'
  goal: string
  selfRating: 1 | 2 | 3 | 4 | 5
}

export interface CustomExerciseParams {
  type: string
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  key?: 'major' | 'minor'
  position?: 1 | 2 | 3
  tempo?: number
  focusAreas?: string[]
}
