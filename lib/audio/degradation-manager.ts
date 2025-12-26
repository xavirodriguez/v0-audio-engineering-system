import { CircuitBreaker, PitchDetectionStrategy } from "./degradation-strategy";
import { AppError } from "../errors/app-errors";

/**
 * Gestiona la estrategia de detección de tono y su degradación controlada.
 */
export class DegradationManager {
  private currentStrategy: PitchDetectionStrategy;
  private wasmCircuitBreaker: CircuitBreaker;

  constructor() {
    this.currentStrategy = PitchDetectionStrategy.WASM_ACCELERATED;
    this.wasmCircuitBreaker = new CircuitBreaker({
      failureThreshold: 3, // 3 fallos consecutivos abren el circuito
      openStateTimeoutMs: 10000, // 10 segundos antes de intentar de nuevo
    });
  }

  /**
   * Devuelve la estrategia de detección de tono actual.
   */
  getStrategy(): PitchDetectionStrategy {
    // Si el circuit breaker de WASM está abierto, no intentes usarlo.
    if (this.currentStrategy === PitchDetectionStrategy.WASM_ACCELERATED && !this.wasmCircuitBreaker.canExecute()) {
        console.warn("[DegradationManager] WASM circuit breaker is open. Degrading to JS_FALLBACK.");
        this.currentStrategy = PitchDetectionStrategy.JS_FALLBACK;
    }
    return this.currentStrategy;
  }

  /**
   * Registra un fallo en la ejecución de la estrategia actual.
   */
  handleFailure(error: AppError | Error): void {
    if (this.currentStrategy === PitchDetectionStrategy.WASM_ACCELERATED) {
      this.wasmCircuitBreaker.recordFailure();
      // Si el circuit breaker se acaba de abrir, degrada la estrategia.
      if (!this.wasmCircuitBreaker.canExecute()) {
        this.degradeStrategy();
      }
    } else {
        // If another strategy fails, degrade immediately.
        this.degradeStrategy();
    }
  }

  /**
   * Registra un éxito en la ejecución de la estrategia actual.
   */
  handleSuccess(): void {
    if (this.currentStrategy === PitchDetectionStrategy.WASM_ACCELERATED) {
      this.wasmCircuitBreaker.recordSuccess();
    }
  }

  /**
   * Cambia a una estrategia inferior en la jerarquía.
   */
  private degradeStrategy(): void {
    switch (this.currentStrategy) {
      case PitchDetectionStrategy.WASM_ACCELERATED:
        this.currentStrategy = PitchDetectionStrategy.JS_FALLBACK;
        console.log("[DegradationManager] Degrading to JS_FALLBACK strategy.");
        break;
      case PitchDetectionStrategy.JS_FALLBACK:
        this.currentStrategy = PitchDetectionStrategy.DEGRADED_LIGHTWEIGHT;
        console.log("[DegradationManager] Degrading to DEGRADED_LIGHTWEIGHT strategy.");
        break;
      case PitchDetectionStrategy.DEGRADED_LIGHTWEIGHT:
        this.currentStrategy = PitchDetectionStrategy.MUTED;
        console.warn("[DegradationManager] All pitch detection strategies failed. Muting feature.");
        break;
      case PitchDetectionStrategy.MUTED:
        // No se puede degradar más.
        break;
    }
  }
}
