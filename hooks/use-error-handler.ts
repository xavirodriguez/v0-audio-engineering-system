import { useEffect } from "react"
import { errorManager } from "@/lib/errors/error-manager"
import { useToast } from "./use-toast"
import type { AppError } from "@/lib/errors/app-errors"

/**
 * Hook para mostrar errores al usuario automáticamente.
 */
export function useErrorHandler() {
  const { toast } = useToast()

  useEffect(() => {
    // Handler global que muestra toasts
    const unsubscribe = errorManager.onAny((error: AppError) => {
      toast({
        title: error.name,
        description: error.userMessage,
        variant: error.severity === "critical" || error.severity === "high"
          ? "destructive"
          : "default",
        action: error.isRetryable ? (
          <button onClick={() => window.location.reload()}>
            Reintentar
          </button>
        ) : undefined,
      })
    })

    return unsubscribe
  }, [toast])
}

/**
 * Hook para manejar errores específicos.
 */
export function useErrorListener(
  errorCode: string,
  handler: (error: AppError) => void
) {
  useEffect(() => {
    return errorManager.on(errorCode, handler)
  }, [errorCode, handler])
}
