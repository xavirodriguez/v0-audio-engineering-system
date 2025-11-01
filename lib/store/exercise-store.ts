import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { StudentProfile, Exercise, AdaptiveRecommendation, PracticeSession } from "@/lib/types/exercise-system"
import { getExerciseGenerator, getPerformanceAnalyzer } from "@/lib/ai/exercise-factory"

interface ExerciseStore {
  profile: StudentProfile | null
  currentExercise: Exercise | null
  recommendations: AdaptiveRecommendation[]
  isLoading: boolean
  practiceContext: "warm-up" | "deep-study" | "review"
  practiceGoal: string

  // Actions
  setProfile: (profile: StudentProfile) => void
  setCurrentExercise: (exercise: Exercise | null) => void
  setRecommendations: (recommendations: AdaptiveRecommendation[]) => void
  setPracticeContext: (context: "warm-up" | "deep-study" | "review") => void
  setPracticeGoal: (goal: string) => void
  completeSession: (session: PracticeSession) => void
  selectExercise: (exercise: Exercise) => void
  generateCustomExercise: (type: string, difficulty: string) => Exercise | null
  initializeProfile: () => void
}

const defaultProfile: StudentProfile = {
  id: "default-user",
  name: "Estudiante",
  level: "beginner",
  strengths: [],
  weaknesses: [],
  practiceHistory: [],
  preferences: {
    focusAreas: [],
    sessionDuration: 30,
  },
  totalPracticeTime: 0,
  averageAccuracy: 0,
  improvementRate: 0,
  toneQualityScore: 75,
}

export const useExerciseStore = create<ExerciseStore>()(
  persist(
    (set, get) => ({
      profile: null,
      currentExercise: null,
      recommendations: [],
      isLoading: true,
      practiceContext: "deep-study",
      practiceGoal: "",

      setProfile: (profile) => {
        const generator = getExerciseGenerator()
        const recs = generator.generateRecommendations(profile)
        set({ profile, recommendations: recs })
      },

      setCurrentExercise: (exercise) => set({ currentExercise: exercise }),

      setRecommendations: (recommendations) => set({ recommendations }),

      setPracticeContext: (context) => set({ practiceContext: context }),

      setPracticeGoal: (goal) => set({ practiceGoal: goal }),

      completeSession: (session) => {
        const { profile, practiceContext, practiceGoal } = get()
        if (!profile) return

        const enhancedSession: PracticeSession = {
          ...session,
          context: practiceContext,
          goal: practiceGoal || "Práctica general",
          selfRating: session.selfRating || 3,
        }

        const analyzer = getPerformanceAnalyzer()
        const updatedProfile = analyzer.updateProfile(profile, enhancedSession)

        const generator = getExerciseGenerator()
        const newRecs = generator.generateRecommendations(updatedProfile)

        set({
          profile: updatedProfile,
          recommendations: newRecs,
        })
      },

      selectExercise: (exercise) => set({ currentExercise: exercise }),

      generateCustomExercise: (type, difficulty) => {
        const generator = getExerciseGenerator()
        let exercise: Exercise | null = null

        switch (type) {
          case "open-strings":
            exercise = generator.generateOpenStringsExercise(difficulty as any)
            break
          case "scales":
            exercise = generator.generateScaleExercise(difficulty as any, "major")
            break
          case "intervals":
            exercise = generator.generateIntervalsExercise(difficulty as any)
            break
          case "intonation-drill":
            exercise = generator.generateIntonationDrill(69, difficulty as any)
            break
        }

        if (exercise) {
          set({ currentExercise: exercise })
        }

        return exercise
      },

      initializeProfile: () => {
        const { profile } = get()
        if (!profile) {
          const newProfile = { ...defaultProfile }
          const generator = getExerciseGenerator()
          const recs = generator.generateRecommendations(newProfile)
          set({
            profile: newProfile,
            recommendations: recs,
            isLoading: false,
          })
        } else {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: "exercise-storage",
      partialize: (state) => ({
        profile: state.profile,
        practiceContext: state.practiceContext,
        practiceGoal: state.practiceGoal,
      }),
    },
  ),
)
