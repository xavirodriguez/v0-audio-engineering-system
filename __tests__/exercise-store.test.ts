import { describe, it, expect, beforeEach } from "vitest"
import { useExerciseStore } from "@/lib/store/exercise-store"
import { resetFactories } from "@/lib/ai/exercise-factory"

describe("ExerciseStore", () => {
  beforeEach(() => {
    // Reset store state
    useExerciseStore.setState({
      profile: null,
      currentExercise: null,
      recommendations: [],
      isLoading: true,
      practiceContext: "deep-study",
      practiceGoal: "",
    })

    // Reset singletons
    resetFactories()
  })

  it("should initialize profile with recommendations", () => {
    const { initializeProfile, profile, recommendations } = useExerciseStore.getState()

    initializeProfile()

    expect(profile).not.toBeNull()
    expect(recommendations.length).toBeGreaterThan(0)
    expect(useExerciseStore.getState().isLoading).toBe(false)
  })

  it("should generate custom exercise", () => {
    const { generateCustomExercise, currentExercise } = useExerciseStore.getState()

    const exercise = generateCustomExercise("scales", "medium")

    expect(exercise).not.toBeNull()
    expect(exercise?.type).toBe("scales")
    expect(currentExercise).toBe(exercise)
  })

  it("should complete session and update profile", () => {
    const { initializeProfile, completeSession, profile } = useExerciseStore.getState()

    initializeProfile()

    const initialProfile = useExerciseStore.getState().profile

    completeSession({
      exerciseId: "test-exercise",
      startTime: Date.now() - 60000,
      endTime: Date.now(),
      accuracy: 85,
      notesPlayed: 10,
      notesCorrect: 8,
      averageCents: 5,
      toneQuality: 80,
      context: "deep-study",
      goal: "Test goal",
      selfRating: 4,
    })

    const updatedProfile = useExerciseStore.getState().profile

    expect(updatedProfile).not.toBeNull()
    expect(updatedProfile?.practiceHistory.length).toBeGreaterThan(initialProfile?.practiceHistory.length || 0)
  })
})
