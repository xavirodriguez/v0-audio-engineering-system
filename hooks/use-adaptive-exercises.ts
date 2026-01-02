import { useEffect, useState } from "react"
import { ExerciseInitializer } from "@/lib/services/exercise-initializer"
import { useExerciseStore } from "@/lib/store/exercise-store"
import { InitializationError } from "@/lib/errors/app-errors"

export interface UseAdaptiveExercisesOptions {
  autoInitialize?: boolean
  onInitError?: (error: Error) => void
}

export function useAdaptiveExercises(options: UseAdaptiveExercisesOptions = {}) {
  const { autoInitialize = false, onInitError } = options
  const store = useExerciseStore()
  const [initError, setInitError] = useState<Error | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)

  useEffect(() => {
    if (!autoInitialize) return

    const abortController = new AbortController()
    const initializer = new ExerciseInitializer(store)

    async function init() {
      setIsInitializing(true)
      setInitError(null)

      try {
        await initializer.initialize(abortController.signal)
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        setInitError(err)
        onInitError?.(err)
      } finally {
        setIsInitializing(false)
      }
    }

    init()

    // ✅ Cleanup: cancelar si el componente se desmonta
    return () => {
      abortController.abort()
    }
  }, [store, autoInitialize, onInitError])

  // API explícita para inicialización manual
  const initializeManually = async () => {
    const initializer = new ExerciseInitializer(store)
    setIsInitializing(true)
    setInitError(null)

    try {
      await initializer.initialize()
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      setInitError(err)
      throw err
    } finally {
      setIsInitializing(false)
    }
  }

  return {
    // Estado
    profile: store.profile,
    currentExercise: store.currentExercise,
    recommendations: store.recommendations,
    isLoading: store.isLoading || isInitializing,
    initError,

    // Acciones
    initialize: initializeManually,
    setPracticeContext: store.setPracticeContext,
    setPracticeGoal: store.setPracticeGoal,
    completeSession: store.completeSession,
    selectExercise: store.selectExercise,
    generateCustomExercise: store.generateCustomExercise,
  }
}
