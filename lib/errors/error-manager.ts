import type { AppError } from "./app-errors"
import { AudioInitializationError } from "./app-errors"

type ErrorHandler = (error: AppError) => void

/**
 * Sistema centralizado para manejo de errores.
 */
class ErrorManager {
  private handlers: Map<string, ErrorHandler[]> = new Map()
  private globalHandlers: ErrorHandler[] = []

  /**
   * Registra un handler para un código de error específico.
   */
  on(errorCode: string, handler: ErrorHandler): () => void {
    if (!this.handlers.has(errorCode)) {
      this.handlers.set(errorCode, [])
    }
    this.handlers.get(errorCode)!.push(handler)

    // Retorna función para desregistrar
    return () => {
      const handlers = this.handlers.get(errorCode)
      if (handlers) {
        const index = handlers.indexOf(handler)
        if (index > -1) handlers.splice(index, 1)
      }
    }
  }

  /**
   * Registra un handler global para todos los errores.
   */
  onAny(handler: ErrorHandler): () => void {
    this.globalHandlers.push(handler)

    return () => {
      const index = this.globalHandlers.indexOf(handler)
      if (index > -1) this.globalHandlers.splice(index, 1)
    }
  }

  /**
   * Maneja un error, invocando los handlers apropiados.
   */
  handle(error: unknown): void {
    // Convertir a AppError si no lo es
    const appError = this.normalizeError(error)

    // Log según severidad
    this.log(appError)

    // Invocar handlers específicos
    const specificHandlers = this.handlers.get(appError.code) || []
    specificHandlers.forEach(handler => handler(appError))

    // Invocar handlers globales
    this.globalHandlers.forEach(handler => handler(appError))
  }

  /**
   * Convierte cualquier error en AppError.
   */
  private normalizeError(error: unknown): AppError {
    if (error instanceof AppError) {
      return error
    }

    // Convertir DOMException (permisos, etc)
    if (error instanceof DOMException) {
      return new AudioInitializationError(
        error.name === "NotAllowedError" ? "permission_denied" :
        error.name === "NotFoundError" ? "device_not_found" :
        error.name === "AbortError" ? "device_busy" :
        "unknown",
        { originalError: error }
      )
    }

    // Error genérico
    const message = error instanceof Error ? error.message : String(error)
    return new (class extends AppError {
      readonly code = "UNKNOWN_ERROR"
      readonly severity = "high"
      readonly isRetryable = false
      get userMessage() { return "Ocurrió un error inesperado." }
    })(message, { originalError: error })
  }

  /**
   * Log según severidad.
   */
  private log(error: AppError): void {
    const logData = {
      code: error.code,
      message: error.message,
      context: error.context,
      timestamp: error.timestamp,
      stack: error.stack,
    }

    switch (error.severity) {
      case "critical":
        console.error("🔥 CRITICAL ERROR:", logData)
        // Enviar a servicio de monitoreo (Sentry, etc)
        break

      case "high":
        console.error("❌ ERROR:", logData)
        break

      case "medium":
        console.warn("⚠️ WARNING:", logData)
        break

      case "low":
        console.info("ℹ️ INFO:", logData)
        break
    }
  }
}

export const errorManager = new ErrorManager()
