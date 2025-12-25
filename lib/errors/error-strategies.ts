import type { AppError } from "./app-errors";

/**
 * Defines the recovery strategy for a given error.
 */
export type RetryStrategy = {
  /** The delay in milliseconds before retrying. */
  delay: number;
  /** The type of action to take. */
  action: 'RETRY' | 'USER_ACTION';
};

/**
 * A map of error codes to their corresponding retry strategies.
 */
export const errorStrategies: Record<string, RetryStrategy> = {
  'BUFFER_OVERFLOW_ERROR': {
    delay: 0, // Immediate retry
    action: 'RETRY',
  },
  'RECORDING_ERROR': {
    delay: 3000, // Retry after 3 seconds
    action: 'RETRY',
  },
  'AUDIO_INIT_ERROR': {
    delay: 3000, // Default retry for recoverable audio init errors
    action: 'RETRY',
  },
};

/**
 * Gets the retry strategy for a given application error.
 * @param error The error instance.
 * @returns The retry strategy if the error is retryable and a strategy is defined, otherwise null.
 */
export function getErrorStrategy(error: AppError): RetryStrategy | null {
  if (!error.isRetryable) {
    return null;
  }
  return errorStrategies[error.code] || null;
}
