import { describe, it, expect, beforeEach, vi } from "vitest";
import { DegradationManager } from "../degradation-manager";
import { PitchDetectionStrategy } from "../degradation-strategy";
import { AppError } from "../../errors/app-errors";

// Mock the AppError class
vi.mock('../../errors/app-errors', () => {
    return {
      AppError: class MockAppError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'AppError';
        }
      }
    };
  });


describe("DegradationManager", () => {
  let manager: DegradationManager;

  beforeEach(() => {
    manager = new DegradationManager();
    vi.useFakeTimers();
  });

  it("should start with WASM_ACCELERATED strategy", () => {
    expect(manager.getStrategy()).toBe(PitchDetectionStrategy.WASM_ACCELERATED);
  });

  it("should degrade to JS_FALLBACK after 3 consecutive failures", () => {
    const error = new AppError("WASM_EXECUTION_ERROR");

    manager.handleFailure(error);
    expect(manager.getStrategy()).toBe(PitchDetectionStrategy.WASM_ACCELERATED);

    manager.handleFailure(error);
    expect(manager.getStrategy()).toBe(PitchDetectionStrategy.WASM_ACCELERATED);

    manager.handleFailure(error);
    expect(manager.getStrategy()).toBe(PitchDetectionStrategy.JS_FALLBACK);
  });

  it("should recover to WASM_ACCELERATED after timeout and success", async () => {
    const error = new AppError("WASM_EXECUTION_ERROR");

    // Forzar 3 fallos para abrir el circuito
    manager.handleFailure(error);
    manager.handleFailure(error);
    manager.handleFailure(error);

    expect(manager.getStrategy()).toBe(PitchDetectionStrategy.JS_FALLBACK);

    // Esperar el timeout del circuit breaker (10 segundos)
    vi.advanceTimersByTime(10100);

    // After the timeout, the circuit breaker allows a probe.
    // getStrategy should still return JS_FALLBACK until a success is recorded.
    expect(manager.getStrategy()).toBe(PitchDetectionStrategy.JS_FALLBACK);

    // The next call to getStrategy will be in HALF_OPEN state, it will try WASM again
    // Let's simulate a success
    manager.handleSuccess();

    // The circuit should be closed now, but the strategy is still JS_FALLBACK
    // The system does not automatically promote the strategy. This is by design.
    // To promote, the ResilientPitchDetector would need to be re-initialized or have a promotion logic.
    // The current implementation does not promote. Let's re-read the plan.
    // "Si el CircuitBreaker permite una llamada de prueba y esta tiene éxito, el sistema puede volver a la estrategia WASM_ACCELERATED."
    // This implies the ResilientPitchDetector should handle this. Let's check the code.
    // ResilientPitchDetector.detectPitchYIN calls degradationManager.getStrategy().
    // The manager's getStrategy() will return WASM_ACCELERATED if the circuit is no longer open.
    // Let's trace it.
    // 1. Circuit is HALF_OPEN. getStrategy() is called. canExecute() is true. getStrategy() returns WASM_ACCELERATED.
    // 2. ResilientPitchDetector tries WASM. It succeeds. handleSuccess() is called. Circuit becomes CLOSED.
    // This is correct. My test is wrong. Let's fix it.

    // After timeout, the circuit is HALF_OPEN.
    // The next call to getStrategy will see canExecute() as true and return WASM_ACCELERATED
    expect(manager.getStrategy()).toBe(PitchDetectionStrategy.WASM_ACCELERATED);

    // Simulate a successful WASM call
    manager.handleSuccess();

    // Now, the strategy should remain WASM_ACCELERATED
    expect(manager.getStrategy()).toBe(PitchDetectionStrategy.WASM_ACCELERATED);
  });
});
