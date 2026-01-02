// Reemplazar con tipos específicos
export interface Exercise {
  id: string
  type: string
  difficulty: string
  // ... otros campos
}

export interface UserProfile {
  id: string
  name: string
  // ... otros campos
}

export interface SessionData {
  id: string
  timestamp: number
  // ... otros campos
}

export interface CustomExerciseParams {
  type: string
  difficulty: string
  // ... otros campos
}