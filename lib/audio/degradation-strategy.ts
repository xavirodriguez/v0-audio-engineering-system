/**
 * Define los niveles jerárquicos de operación para la detección de tono.
 * Cada nivel representa un compromiso diferente entre rendimiento y precisión.
 */
export enum PitchDetectionStrategy {
  /** Nivel 0: Acelerado por WASM. Máxima precisión y rendimiento. */
  WASM_ACCELERATED,
  /** Nivel 1: Fallback a JS. Implementación completa en JS, más intensiva en CPU. */
  JS_FALLBACK,
  /** Nivel 2: Modo degradado. Algoritmo JS ligero, menor precisión pero bajo consumo. */
  DEGRADED_LIGHTWEIGHT,
  /** Nivel 3: Silenciado. La detección de tono está desactivada para prevenir fallos. */
  MUTED,
}

/**
 * Define el estado del Circuit Breaker.
 */
export enum CircuitBreakerState {
  /** El circuito funciona normalmente. */
  CLOSED,
  /** El circuito está abierto; las llamadas fallan inmediatamente. */
  OPEN,
  /** El circuito permite una llamada de prueba para ver si el sistema se ha recuperado. */
  HALF_OPEN,
}

export interface CircuitBreakerOptions {
  /** Número de fallos consecutivos para abrir el circuito. */
  failureThreshold: number;
  /** Tiempo en ms que el circuito permanece abierto antes de pasar a HALF_OPEN. */
  openStateTimeoutMs: number;
}

/**
 * Implementa un patrón Circuit Breaker para gestionar la transición entre
 * estrategias de degradación y prevenir fallos en cascada.
 */
export class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount = 0;
  private lastFailureTime: number | null = null;
  private options: CircuitBreakerOptions;

  constructor(options: CircuitBreakerOptions) {
    this.options = options;
  }

  /**
   * Registra un fallo en el circuito.
   */
  recordFailure(): void {
    this.failureCount++;
    if (this.failureCount >= this.options.failureThreshold) {
      this.state = CircuitBreakerState.OPEN;
      this.lastFailureTime = Date.now();
      console.warn(`[CircuitBreaker] Circuit opened due to ${this.failureCount} failures.`);
    }
  }

  /**
   * Registra un éxito, reseteando el contador de fallos.
   */
  recordSuccess(): void {
    if (this.state === CircuitBreakerState.HALF_OPEN) {
        console.log("[CircuitBreaker] Circuit closed after successful probe.");
    }
    this.failureCount = 0;
    this.state = CircuitBreakerState.CLOSED;
  }

  /**
   * Determina si la acción protegida por el circuito puede ejecutarse.
   */
  canExecute(): boolean {
    if (this.state === CircuitBreakerState.CLOSED) {
      return true;
    }

    if (this.state === CircuitBreakerState.OPEN && this.lastFailureTime) {
      const timeSinceFailure = Date.now() - this.lastFailureTime;
      if (timeSinceFailure > this.options.openStateTimeoutMs) {
        this.state = CircuitBreakerState.HALF_OPEN;
        console.log("[CircuitBreaker] Circuit is now HALF_OPEN. Allowing probe.");
        return true;
      }
      return false;
    }

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      return true; // Allow one probe attempt.
    }

    return false; // Should not happen in a valid state transition.
  }
}
