import { describe, it, expect, beforeEach } from "vitest"
import { useExerciseStore } from "@/lib/store/exercise-store"
import { resetFactories } from "@/lib/ai/exercise-factory"
import { PerformanceFeedback } from "@/lib/domains"

describe("ExerciseStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    useExerciseStore.setState({
      profile: null,
      currentExercise: null,
      recommendations: [],
      isLoading: true,
      practiceContext: "deep-study",
      practiceGoal: "",
    })
    resetFactories()
  })

  it("should initialize profile with recommendations", () => {
    const { initializeProfile } = useExerciseStore.getState()

    initializeProfile()

    const { profile, recommendations, isLoading } = useExerciseStore.getState()

    expect(profile).not.toBeNull()
    expect(recommendations.length).toBeGreaterThan(0)
    expect(isLoading).toBe(false)
  })

  it("should generate custom exercise", () => {
    const { generateCustomExercise } = useExerciseStore.getState()

    const exercise = generateCustomExercise("scales", "medium")
    const { currentExercise } = useExerciseStore.getState()

    expect(exercise).not.toBeNull()
    expect(exercise?.type).toBe("scales")
    expect(currentExercise).toEqual(exercise)
  })

  it("should complete session and update profile", () => {
    const { initializeProfile, completeSession } = useExerciseStore.getState()

    initializeProfile()

    const initialProfile = useExerciseStore.getState().profile

    const sessionMetrics = {
      accuracy: 85,
      averageDeviation: 5,
      currentStreak: 3,
      maxStreak: 5,
      notesCompleted: 8,
      notesTotal: 10,
    };

    completeSession({
      exerciseId: "test-exercise",
      startTime: Date.now() - 60000,
      endTime: Date.now(),
      metrics: sessionMetrics,
      selfRating: 4,
    })

    const updatedProfile = useExerciseStore.getState().profile

    expect(updatedProfile).not.toBeNull()
    expect(updatedProfile?.practiceHistory.length).toBeGreaterThan(initialProfile?.practiceHistory.length || 0)
    expect(updatedProfile?.averageAccuracy).not.toBe(initialProfile?.averageAccuracy)
  })
})
