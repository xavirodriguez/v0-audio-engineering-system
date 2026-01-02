import type {
  StudentProfile,
  Exercise,
  AdaptiveRecommendation,
  ExerciseType,
  DifficultyLevel,
} from "@/lib/types/exercise-system"

/**
 * Interface for the exercise store.
 */
export interface IExerciseStore {
  profile: StudentProfile | null
  currentExercise: Exercise | null
  recommendations: AdaptiveRecommendation[]
  isLoading: boolean
  practiceContext: "warm-up" | "deep-study" | "review"
  practiceGoal: string
  currentNoteIndex: number
  isPracticing: boolean
  exerciseStatus: "not-started" | "in-progress" | "completed"

  // Actions
  setProfile: (profile: StudentProfile) => void
  setCurrentExercise: (exercise: Exercise | null) => void
  setRecommendations: (recommendations: AdaptiveRecommendation[]) => void
  setPracticeContext: (context: "warm-up" | "deep-study" | "review") => void
  setPracticeGoal: (goal: string) => void
  selectExercise: (exercise: Exercise) => void
  generateCustomExercise: (
    type: ExerciseType,
    difficulty: DifficultyLevel,
  ) => Exercise | null
  initializeProfile: () => void
  startExercise: () => void
  advanceToNextNote: () => void
  resetExercise: () => void
  completeSession: (performance: { accuracy: number; feedback: string }) => void
}
