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

export const errorHandler = {
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

  warn: (message: string, context: string, data?: Record<string, unknown>) => {
    console.warn(`[${new Date().toISOString()}] [WARN] ${context}:`, message, data)
  },

  info: (message: string, context: string, data?: Record<string, unknown>) => {
    console.log(`[${new Date().toISOString()}] [INFO] ${context}:`, message, data)
  },
}
