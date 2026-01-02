import { create } from "zustand"
import { persist } from "zustand/middleware"
import { getExerciseGenerator } from "@/lib/ai/exercise-factory"
import type { IExerciseStore } from "@/lib/interfaces/exercise-store.interface"

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

/**
 * A store for managing exercises.
 */
export const useExerciseStore = create<IExerciseStore>()(
  persist(
    (set, get) => ({
      profile: null,
      currentExercise: null,
      recommendations: [],
      isLoading: true,
      practiceContext: "deep-study",
      practiceGoal: "",
      currentNoteIndex: 0,
      isPracticing: false,
      exerciseStatus: "not-started",

      /**
       * Sets the student profile.
       * @param {StudentProfile} profile - The student profile.
       */
      setProfile: (profile) => {
        const generator = getExerciseGenerator()
        const recs = generator.generateRecommendations(profile)
        set({ profile, recommendations: recs })
      },

      /**
       * Sets the current exercise.
       * @param {Exercise | null} exercise - The exercise to set.
       */
      setCurrentExercise: (exercise) => set({ currentExercise: exercise }),

      /**
       * Sets the recommendations.
       * @param {AdaptiveRecommendation[]} recommendations - The recommendations to set.
       */
      setRecommendations: (recommendations) => set({ recommendations }),

      /**
       * Sets the practice context.
       * @param {"warm-up" | "deep-study" | "review"} context - The practice context.
       */
      setPracticeContext: (context) => set({ practiceContext: context }),

      /**
       * Sets the practice goal.
       * @param {string} goal - The practice goal.
       */
      setPracticeGoal: (goal) => set({ practiceGoal: goal }),

      /**
       * Selects an exercise.
       * @param {Exercise} exercise - The exercise to select.
       */
      selectExercise: (exercise) =>
        set({
          currentExercise: exercise,
          currentNoteIndex: 0,
          isPracticing: false,
          exerciseStatus: "not-started",
        }),

      /**
       * Generates a custom exercise.
       * @param {string} type - The type of the exercise.
       * @param {string} difficulty - The difficulty of the exercise.
       * @returns {Exercise | null} - The generated exercise.
       */
      generateCustomExercise: (type: ExerciseType, difficulty: DifficultyLevel) => {
        const generator = getExerciseGenerator()
        let exercise: Exercise | null = null

        switch (type) {
          case "open-strings":
            exercise = generator.generateOpenStringsExercise(difficulty)
            break
          case "scales":
            exercise = generator.generateScaleExercise(difficulty, "major")
            break
          case "intervals":
            exercise = generator.generateIntervalsExercise(difficulty)
            break
          case "intonation-drill":
            exercise = generator.generateIntonationDrill(69, difficulty)
            break
        }

        if (exercise) {
          set({ currentExercise: exercise })
        }

        return exercise
      },

      /**
       * Initializes the profile.
       */
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

      /**
       * Starts the exercise.
       */
      startExercise: () => {
        const { currentExercise } = get()
        if (currentExercise && currentExercise.notes.length > 0) {
          set({
            isPracticing: true,
            exerciseStatus: "in-progress",
            currentNoteIndex: 0,
          })
        }
      },

      /**
       * Advances to the next note.
       */
      advanceToNextNote: () => {
        const { currentNoteIndex, currentExercise } = get()
        if (currentExercise) {
          if (currentNoteIndex < currentExercise.notes.length - 1) {
            set({ currentNoteIndex: currentNoteIndex + 1 })
          } else {
            set({ isPracticing: false, exerciseStatus: "completed" })
          }
        }
      },

      /**
       * Resets the exercise.
       */
      resetExercise: () => {
        set({
          currentNoteIndex: 0,
          isPracticing: false,
          exerciseStatus: "not-started",
        })
      },
      completeSession: (performance) => {
        set((state) => {
          if (!state.profile || !state.currentExercise) return {}

          const newHistoryEntry: PracticeEntry = {
            exerciseId: state.currentExercise.id,
            date: new Date().toISOString(),
            accuracy: performance.accuracy,
            feedback: performance.feedback,
            duration: 0, // This should be calculated
          }

          const updatedProfile: StudentProfile = {
            ...state.profile,
            practiceHistory: [
              ...state.profile.practiceHistory,
              newHistoryEntry,
            ],
          }

          return {
            profile: updatedProfile,
            isPracticing: false,
            exerciseStatus: "completed",
          }
        })
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
