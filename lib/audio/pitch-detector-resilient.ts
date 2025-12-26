import { WASMPitchDetector } from "./wasm-loader";
import { DegradationManager } from "./degradation-manager";
import { PitchDetectionStrategy } from "./degradation-strategy";
import { AppError } from "../errors/app-errors";
import { errorHandler } from "../errors/error-handler";
import FFT from "fft-js";

/**
 * PitchDetector con gestión de degradación y fallbacks jerárquicos.
 */
export class ResilientPitchDetector {
  private sampleRate: number;
  private wasmDetector: WASMPitchDetector | null = null;
  private degradationManager: DegradationManager;

  constructor(sampleRate: number) {
    this.sampleRate = sampleRate;
    this.degradationManager = new DegradationManager();
    this.initializeWASM();
  }

  private async initializeWASM() {
    try {
      this.wasmDetector = new WASMPitchDetector();
      const success = await this.wasmDetector.initialize();
      if (success) {
        console.log("[ResilientPitchDetector] WASM module loaded successfully.");
        this.degradationManager.handleSuccess();
      } else {
        throw new AppError("WASM_INIT_ERROR", "WASM initialization returned false", "high");
      }
    } catch (error) {
      const appError = error instanceof AppError ? error : new AppError("WASM_UNKNOWN_ERROR", "An unknown error occurred during WASM initialization", "high", error);
      errorHandler.capture(appError, "ResilientPitchDetector.initializeWASM");
      this.degradationManager.handleFailure(appError);
      console.warn("[ResilientPitchDetector] Falling back to JS-only detection.");
    }
  }

  /**
   * Detecta el tono usando la estrategia apropiada según el estado de degradación.
   */
  detectPitchYIN(buffer: Float32Array): { pitchHz: number; confidence: number } {
    const strategy = this.degradationManager.getStrategy();

    try {
      switch (strategy) {
        case PitchDetectionStrategy.WASM_ACCELERATED:
          return this.detectPitchYINWASM(buffer);
        case PitchDetectionStrategy.JS_FALLBACK:
          return this.detectPitchYINJS(buffer);
        case PitchDetectionStrategy.DEGRADED_LIGHTWEIGHT:
          return this.detectPitchLightweight(buffer);
        case PitchDetectionStrategy.MUTED:
          return { pitchHz: 0, confidence: 0 };
      }
    } catch (error) {
        const appError = error instanceof AppError ? error : new AppError("PITCH_DETECTION_ERROR", "An unknown error occurred during pitch detection", "medium", error);
        errorHandler.capture(appError, "ResilientPitchDetector.detectPitchYIN", { strategy });
        this.degradationManager.handleFailure(appError);
      // Reintenta con la estrategia degradada.
      return this.detectPitchYIN(buffer);
    }
  }

  /**
   * Detección de tono usando WASM.
   */
  private detectPitchYINWASM(buffer: Float32Array): { pitchHz: number; confidence: number } {
    if (!this.wasmDetector?.isReady()) {
      throw new AppError("WASM_NOT_READY", "WASM detector is not ready", "medium");
    }

    const result = this.wasmDetector.detectPitchYIN(buffer, 0.1);
    if (!result) {
      throw new AppError("WASM_EXECUTION_ERROR", "WASM returned null result", "medium");
    }

    this.degradationManager.handleSuccess();
    return {
      pitchHz: result.pitch_hz,
      confidence: result.confidence,
    };
  }

  /**
   * Detección de tono usando YIN en JavaScript (implementación completa).
   */
  private detectPitchYINJS(buffer: Float32Array): { pitchHz: number; confidence: number } {
    const SIZE = buffer.length;
    const threshold = 0.1;
    const yinBuffer = new Float32Array(SIZE / 2);

    yinBuffer[0] = 1;
    for (let tau = 1; tau < yinBuffer.length; tau++) {
      let sum = 0;
      for (let i = 0; i < yinBuffer.length; i++) {
        const delta = buffer[i] - buffer[i + tau];
        sum += delta * delta;
      }
      yinBuffer[tau] = sum;
    }

    let runningSum = 0;
    for (let tau = 1; tau < yinBuffer.length; tau++) {
      runningSum += yinBuffer[tau];
      yinBuffer[tau] = yinBuffer[tau] === 0 ? 1 : (yinBuffer[tau] * tau) / runningSum;
    }

    let tau = -1;
    for (let i = 2; i < yinBuffer.length; i++) {
      if (yinBuffer[i] < threshold) {
        while (i + 1 < yinBuffer.length && yinBuffer[i + 1] < yinBuffer[i]) {
          i++;
        }
        tau = i;
        break;
      }
    }

    if (tau === -1) {
      let minValue = 1;
      for (let i = 2; i < yinBuffer.length; i++) {
        if (yinBuffer[i] < minValue) {
          minValue = yinBuffer[i];
          tau = i;
        }
      }
    }

    if (tau === -1 || tau === 0) {
      return { pitchHz: 0, confidence: 0 };
    }

    let betterTau = tau;
    if (tau > 0 && tau < yinBuffer.length - 1) {
      const s0 = yinBuffer[tau - 1];
      const s1 = yinBuffer[tau];
      const s2 = yinBuffer[tau + 1];
      betterTau = tau + (s2 - s0) / (2 * (2 * s1 - s2 - s0));
    }

    const pitchHz = this.sampleRate / betterTau;
    const confidence = 1 - yinBuffer[tau];

    return { pitchHz, confidence };
  }

  /**
   * Detección de tono ligera usando autocorrelación simplificada.
   * Reduce la precisión pero consume menos CPU.
   */
  private detectPitchLightweight(buffer: Float32Array): { pitchHz: number; confidence: number } {
    // Simplificación: solo calcula autocorrelación cada N muestras.
    const STEP = 4; // Reduce la resolución en un factor de 4.
    const SIZE = Math.floor(buffer.length / STEP);
    const correlations = new Float32Array(SIZE);

    for (let lag = 0; lag < SIZE; lag++) {
      let sum = 0;
      for (let i = 0; i < SIZE; i++) {
        const idx1 = i * STEP;
        const idx2 = (i + lag) * STEP;
        if (idx2 < buffer.length) {
          sum += buffer[idx1] * buffer[idx2];
        }
      }
      correlations[lag] = sum;
    }

    let bestLag = -1;
    let bestCorrelation = 0;
    const minLag = Math.floor(this.sampleRate / (1000 * STEP));

    for (let lag = minLag; lag < SIZE - 1; lag++) {
      if (
        correlations[lag] > bestCorrelation &&
        correlations[lag] > correlations[lag - 1] &&
        correlations[lag] > correlations[lag + 1]
      ) {
        bestCorrelation = correlations[lag];
        bestLag = lag;
      }
    }

    if (bestLag === -1) {
      return { pitchHz: 0, confidence: 0 };
    }

    const pitchHz = this.sampleRate / (bestLag * STEP);
    const confidence = Math.min(bestCorrelation / correlations[0], 1.0);

    return { pitchHz, confidence };
  }

  /**
   * Calcula el RMS con degradación.
   */
  calculateRMS(buffer: Float32Array): number {
    const strategy = this.degradationManager.getStrategy();

    try {
      if (strategy === PitchDetectionStrategy.WASM_ACCELERATED && this.wasmDetector?.isReady()) {
        const rms = this.wasmDetector.getRMS(buffer);
        this.degradationManager.handleSuccess();
        return rms;
      }
    } catch (error) {
        const appError = error instanceof AppError ? error : new AppError("RMS_CALCULATION_ERROR", "An unknown error occurred during RMS calculation", "low", error);
        errorHandler.capture(appError, "ResilientPitchDetector.calculateRMS");
        this.degradationManager.handleFailure(appError);
    }

    // Fallback JS
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    return Math.sqrt(sum / buffer.length);
  }

  /**
   * Devuelve la estrategia actual de detección.
   */
  getCurrentStrategy(): PitchDetectionStrategy {
    return this.degradationManager.getStrategy();
  }

  /**
   * Destruye el detector.
   */
  destroy() {
    if (this.wasmDetector) {
      this.wasmDetector.destroy();
    }
  }
}
