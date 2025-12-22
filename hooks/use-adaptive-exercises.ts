import { useEffect, useState } from "react"
import { ExerciseInitializer } from "@/lib/services/exercise-initializer"
import type { IExerciseStore } from "@/lib/interfaces/exercise-store.interface"
import { InitializationError } from "@/lib/errors/app-errors"

export interface UseAdaptiveExercisesOptions {
  store: IExerciseStore
  autoInitialize?: boolean // Control explícito
  onInitError?: (error: Error) => void
}

export function useAdaptiveExercises(options: UseAdaptiveExercisesOptions) {
  const { store, autoInitialize = false, onInitError } = options
  const [initError, setInitError] = useState<Error | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)

  // Inicialización controlada
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
