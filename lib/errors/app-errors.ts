/**
 * Clase base para todos los errores de la aplicación.
 * Proporciona contexto rico para debugging y UI.
 */
export abstract class AppError extends Error {
  /**
   * Código único del error para i18n y tracking.
   */
  abstract readonly code: string

  /**
   * Severidad del error para logging y alertas.
   */
  abstract readonly severity: "low" | "medium" | "high" | "critical"

  /**
   * Mensaje amigable para mostrar al usuario.
   */
  abstract readonly userMessage: string

  /**
   * Contexto adicional para debugging.
   */
  readonly context: Record<string, unknown>

  /**
   * Timestamp del error.
   */
  readonly timestamp: Date

  /**
   * Si el error es recuperable con retry.
   */
  abstract readonly isRetryable: boolean

  constructor(
    message: string,
    context: Record<string, unknown> = {},
    options?: ErrorOptions
  ) {
    super(message, options)
    this.name = this.constructor.name
    this.context = context
    this.timestamp = new Date()

    // Mantener stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

/**
 * Error al inicializar recursos de audio.
 */
export class AudioInitializationError extends AppError {
  readonly code = "AUDIO_INIT_ERROR"
  readonly severity = "high"
  readonly isRetryable = true

  get userMessage(): string {
    const reason = this.context.reason as string | undefined

    switch (reason) {
      case "permission_denied":
        return "Necesitamos acceso al micrófono. Por favor, permite el acceso en la configuración de tu navegador."

      case "device_not_found":
        return "No se encontró ningún micrófono. Conecta un micrófono e intenta de nuevo."

      case "device_busy":
        return "El micrófono está siendo usado por otra aplicación. Ciérrala e intenta de nuevo."

      default:
        return "No pudimos inicializar el audio. Verifica tu micrófono e intenta de nuevo."
    }
  }

  constructor(reason: string, context: Record<string, unknown> = {}) {
    super(
      `Audio initialization failed: ${reason}`,
      { reason, ...context }
    )
  }
}

/**
 * Error al grabar audio.
 */
export class RecordingError extends AppError {
  readonly code = "RECORDING_ERROR"
  readonly severity = "medium"
  readonly isRetryable = true

  get userMessage(): string {
    return "Hubo un problema al grabar. Por favor, intenta de nuevo."
  }

  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, context)
  }
}

/**
 * Error de inicialización.
 */
export class InitializationError extends AppError {
  readonly code = "INITIALIZATION_ERROR"
  readonly severity = "high"
  readonly isRetryable = true

  get userMessage(): string {
    return "Hubo un problema al inicializar la aplicación. Por favor, intenta de nuevo."
  }

  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, context)
  }
}

/**
 * Error de calibración.
 */
export class CalibrationError extends AppError {
  readonly code = "CALIBRATION_ERROR"
  readonly severity = "medium"
  readonly isRetryable = true

  get userMessage(): string {
    return "La calibración falló. Asegúrate de estar en un lugar tranquilo e intenta de nuevo."
  }

  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, context)
  }
}

/**
 * Error de red al llamar API.
 */
export class NetworkError extends AppError {
  readonly code = "NETWORK_ERROR"
  readonly severity = "medium"
  readonly isRetryable = true

  get userMessage(): string {
    return "Problema de conexión. Verifica tu internet e intenta de nuevo."
  }

  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, context)
  }
}

/**
 * Error de validación de datos.
 */
export class ValidationError extends AppError {
  readonly code = "VALIDATION_ERROR"
  readonly severity = "low"
  readonly isRetryable = false

  get userMessage(): string {
    const field = this.context.field as string
    return `El campo ${field} no es válido. Por favor, corrígelo.`
  }

  constructor(field: string, message: string) {
    super(message, { field })
  }
}
