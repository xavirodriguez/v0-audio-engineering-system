import { IExerciseStore } from "@/lib/interfaces/exercise-store.interface";
import { InitializationError } from "@/lib/errors/app-errors";

/**
 * Servicio para inicializar el perfil de ejercicios.
 * Lógica pura sin efectos secundarios.
 */
export class ExerciseInitializer {
  constructor(private store: IExerciseStore) {}

  /**
   * Inicializa el perfil del usuario.
   *
   * @param signal - AbortSignal para cancelar la operación
   * @throws {InitializationError} Si la inicialización falla
   */
  async initialize(signal?: AbortSignal): Promise<void> {
    if (this.store.profile) {
      // Ya inicializado
      return
    }

    try {
      // Verificar si fue cancelado
      if (signal?.aborted) {
        throw new InitializationError("Inicialización cancelada")
      }

      await this.store.initializeProfile()

      // Verificar nuevamente después de async
      if (signal?.aborted) {
        throw new InitializationError("Inicialización cancelada")
      }

    } catch (error) {
      if (error instanceof InitializationError) {
        throw error
      }
      throw new InitializationError(
        "Error al inicializar perfil",
        { cause: error }
      )
    }
  }
}
