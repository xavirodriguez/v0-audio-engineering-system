// workers/pitch-detector-resilient.worker.ts

import { DegradationManager } from '../lib/audio/degradation-manager';
import { PitchDetectionStrategy } from '../lib/audio/degradation-strategy';
import { WASMPitchDetector } from '../lib/audio/wasm-loader';

// --- Resilient Pitch Detector for the Worker ---

class ResilientPitchDetector {
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
        this.degradationManager.handleSuccess();
      } else {
        throw new Error("WASM initialization returned false");
      }
    } catch (error) {
      console.warn("WASM Init failed in worker:", error);
      this.degradationManager.handleFailure(error as Error);
    }
  }

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
      console.error("Pitch detection failed with strategy:", strategy, error);
      this.degradationManager.handleFailure(error as Error);
      return this.detectPitchYIN(buffer);
    }
  }

  private detectPitchYINWASM(buffer: Float32Array): { pitchHz: number; confidence: number } {
    if (!this.wasmDetector?.isReady()) {
      throw new Error("WASM detector is not ready");
    }
    const result = this.wasmDetector.detectPitchYIN(buffer, 0.1);
    if (!result) {
      throw new Error("WASM returned null result");
    }
    this.degradationManager.handleSuccess();
    return {
      pitchHz: result.pitch_hz,
      confidence: result.confidence,
    };
  }

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

  private detectPitchLightweight(buffer: Float32Array): { pitchHz: number; confidence: number } {
    const STEP = 4;
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

  calculateRMS(buffer: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    return Math.sqrt(sum / buffer.length);
  }

  calculateClarity(buffer: Float32Array): number {
    const rms = this.calculateRMS(buffer);
    if (rms < 0.001) return 0;

    let crossings = 0;
    for (let i = 1; i < buffer.length; i++) {
        if ((buffer[i - 1] >= 0 && buffer[i] < 0) || (buffer[i - 1] < 0 && buffer[i] >= 0)) {
            crossings++;
        }
    }

    const zcr = crossings / buffer.length;
    return Math.max(0, 1 - zcr * 10);
  }

  getCurrentStrategy(): PitchDetectionStrategy {
    return this.degradationManager.getStrategy();
  }
}

let detector: ResilientPitchDetector | null = null;

self.onmessage = (event) => {
    const { type, payload } = event.data;

    if (type === 'init') {
        detector = new ResilientPitchDetector(payload.sampleRate);
    } else if (type === 'process') {
        if (detector) {
            const pitchResult = detector.detectPitchYIN(payload.buffer);
            const rms = detector.calculateRMS(payload.buffer);
            const clarity = detector.calculateClarity(payload.buffer);
            const strategy = detector.getCurrentStrategy();
            self.postMessage({ type: 'result', payload: { ...pitchResult, rms, clarity, strategy } });
        }
    }
};

export default {};
