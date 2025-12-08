"use client"

import { useEffect } from "react"
import { useExerciseStore } from "@/lib/store/exercise-store"

/**
 * A hook that provides access to the adaptive exercises store.
 * @returns {object} - The adaptive exercises store.
 */
export function useAdaptiveExercises() {
  const store = useExerciseStore()

  useEffect(() => {
    store.initializeProfile()
  }, [])

  return {
    profile: store.profile,
    currentExercise: store.currentExercise,
    recommendations: store.recommendations,
    isLoading: store.isLoading,
    practiceContext: store.practiceContext,
    practiceGoal: store.practiceGoal,
    setPracticeContext: store.setPracticeContext,
    setPracticeGoal: store.setPracticeGoal,
    completeSession: store.completeSession,
    selectExercise: store.selectExercise,
    generateCustomExercise: store.generateCustomExercise,
  }
}
