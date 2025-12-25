import { useRef, useEffect, useCallback } from 'react';

type RetryCallback = () => void;

/**
 * Hook to manage retry logic with safe timer cleanup.
 */
export function useRetryLogic() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Cancels any scheduled retry.
   */
  const cancelRetry = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /**
   * Schedules a callback to be executed after a delay.
   * @param callback The function to execute.
   * @param delay The delay in milliseconds.
   */
  const scheduleRetry = useCallback((callback: RetryCallback, delay: number) => {
    // Cancel any existing timer before scheduling a new one
    cancelRetry();
    timerRef.current = setTimeout(() => {
      callback();
      timerRef.current = null;
    }, delay);
  }, [cancelRetry]);

  // Cleanup effect to cancel the timer when the component unmounts
  useEffect(() => {
    return () => {
      cancelRetry();
    };
  }, [cancelRetry]);

  return { scheduleRetry, cancelRetry };
}
