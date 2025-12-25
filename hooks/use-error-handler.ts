import { useEffect } from "react";
import { errorManager } from "@/lib/errors/error-manager";
import { useToast } from "./use-toast";
import type { AppError } from "@/lib/errors/app-errors";
import { useRetryLogic } from "./use-retry-logic";
import { getErrorStrategy } from "@/lib/errors/error-strategies";
import { usePitchDetectionStore } from "@/lib/store/pitch-detection-store";
import { Button } from "@/components/ui/button";

/**
 * Hook to handle application-wide errors and display them to the user.
 */
export function useErrorHandler() {
  const { toast } = useToast();
  const { scheduleRetry, cancelRetry } = useRetryLogic();
  const { transitionStatus, startDetection } = usePitchDetectionStore();

  const retryAction = () => {
    cancelRetry(); // Stop any pending retries
    transitionStatus("IDLE"); // Reset state
    startDetection(); // Attempt to start again
  };

  useEffect(() => {
    const unsubscribe = errorManager.onAny((error: AppError) => {
      const strategy = getErrorStrategy(error);

      if (strategy?.action === 'RETRY') {
        transitionStatus("RETRYING");
        scheduleRetry(retryAction, strategy.delay);

        toast({
          title: "Hubo un problema",
          description: `Reintentando en ${strategy.delay / 1000}s...`,
          variant: "default",
        });
      } else {
        // For non-retryable errors or those requiring user action
        toast({
          title: error.name,
          description: error.userMessage,
          variant:
            error.severity === "critical" || error.severity === "high"
              ? "destructive"
              : "default",
          action: error.isRetryable ? (
            <Button onClick={retryAction}>Reintentar</Button>
          ) : undefined,
        });
      }
    });

    return () => {
      unsubscribe();
      cancelRetry(); // Clean up timers on unmount
    };
  }, [toast, scheduleRetry, cancelRetry, transitionStatus, startDetection]);
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
