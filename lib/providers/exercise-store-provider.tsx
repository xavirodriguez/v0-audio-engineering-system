
import { createContext, useContext, ReactNode } from "react"
import { useExerciseStore } from "@/lib/store/exercise-store"
import type { IExerciseStore } from "@/lib/interfaces/exercise-store.interface"

const ExerciseStoreContext = createContext<IExerciseStore | null>(null)

/**
 * Provider que inyecta el store de ejercicios en el árbol de componentes.
 */
export function ExerciseStoreProvider({ children }: { children: ReactNode }) {
  const store = useExerciseStore()

  return (
    <ExerciseStoreContext.Provider value={store}>
      {children}
    </ExerciseStoreContext.Provider>
  )
}

/**
 * Hook para obtener el store desde el contexto.
 * Lanza error si se usa fuera del Provider.
 */
export function useExerciseStoreContext(): IExerciseStore {
  const context = useContext(ExerciseStoreContext)

  if (!context) {
    throw new Error(
      "useExerciseStoreContext debe usarse dentro de ExerciseStoreProvider"
    )
  }

  return context
}
