
import { Exercise } from "@/lib/db/db-schema"
import { UserProfile } from "@/lib/db/db-schema"
import { SessionData } from "@/lib/db/db-schema"
import { CustomExerciseParams } from "@/lib/db/db-schema"
/**
 * Interfaz que define el contrato para un store de ejercicios.
 * Cualquier implementación debe cumplir este contrato.
 */
export interface IExerciseStore {
  profile: UserProfile | null
  currentExercise: Exercise | null
  recommendations: Exercise[]
  isLoading: boolean
  practiceContext: string
  practiceGoal: string

  initializeProfile: () => Promise<void>
  setPracticeContext: (context: string) => void
  setPracticeGoal: (goal: string) => void
  completeSession: (data: SessionData) => void
  selectExercise: (id: string) => void
  generateCustomExercise: (params: CustomExerciseParams) => Promise<Exercise>
}

/**
 * Tipo para las dependencias del hook
 */
export interface UseAdaptiveExercisesDeps {
  store: IExerciseStore
}
