/**
 * A custom error class for the application.
 */
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public severity: "low" | "medium" | "high",
    public context?: Record<string, unknown>,
  ) {
    super(message)
    this.name = "AppError"
  }
}

/**
 * An error handler.
 */
export const errorHandler = {
  /**
   * Captures an error.
   * @param {unknown} error - The error to capture.
   * @param {string} context - The context of the error.
   * @param {Record<string, unknown>} [additionalData] - Additional data to log.
   */
  capture: (error: unknown, context: string, additionalData?: Record<string, unknown>) => {
    const timestamp = new Date().toISOString()

    if (error instanceof AppError) {
      console.error(`[${timestamp}] [${error.severity.toUpperCase()}] ${context}:`, {
        code: error.code,
        message: error.message,
        context: error.context,
        ...additionalData,
      })

      // In production, send to telemetry service
      if (error.severity === "high") {
        // TODO: Send to error tracking service (Sentry, etc.)
      }
    } else if (error instanceof Error) {
      console.error(`[${timestamp}] [ERROR] ${context}:`, {
        message: error.message,
        stack: error.stack,
        ...additionalData,
      })
    } else {
      console.error(`[${timestamp}] [ERROR] ${context}:`, {
        error: String(error),
        ...additionalData,
      })
    }
  },

  /**
   * Logs a warning.
   * @param {string} message - The message to log.
   * @param {string} context - The context of the message.
   * @param {Record<string, unknown>} [data] - Additional data to log.
   */
  warn: (message: string, context: string, data?: Record<string, unknown>) => {
    console.warn(`[${new Date().toISOString()}] [WARN] ${context}:`, message, data)
  },

  /**
   * Logs an info message.
   * @param {string} message - The message to log.
   * @param {string} context - The context of the message.
   * @param {Record<string, unknown>} [data] - Additional data to log.
   */
  info: (message: string, context: string, data?: Record<string, unknown>) => {
    console.log(`[${new Date().toISOString()}] [INFO] ${context}:`, message, data)
  },
}
