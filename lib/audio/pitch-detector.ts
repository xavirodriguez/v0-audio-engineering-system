import { WASMPitchDetector } from "./wasm-loader"

export class PitchDetector {
  private sampleRate: number
  private wasmDetector: WASMPitchDetector | null = null
  private useWASM = false

  constructor(sampleRate: number) {
    this.sampleRate = sampleRate
    this.initializeWASM()
  }

  private async initializeWASM() {
    try {
      this.wasmDetector = new WASMPitchDetector()
      this.useWASM = await this.wasmDetector.initialize()
      if (this.useWASM) {
        console.log("[v0] Using WASM-accelerated pitch detection")
      } else {
        console.log("[v0] Falling back to JavaScript pitch detection")
      }
    } catch (error) {
      console.log("[v0] WASM not available, using JavaScript fallback")
      this.useWASM = false
    }
  }

  detectPitchYIN(buffer: Float32Array): { pitchHz: number; confidence: number } {
    if (this.useWASM && this.wasmDetector?.isReady()) {
      const result = this.wasmDetector.detectPitchYIN(buffer, 0.1)
      if (result) {
        return {
          pitchHz: result.pitch_hz,
          confidence: result.confidence,
        }
      }
    }

    // Fallback a implementación JavaScript
    return this.detectPitchYINJS(buffer)
  }

  private detectPitchYINJS(buffer: Float32Array): { pitchHz: number; confidence: number } {
    const SIZE = buffer.length
    const threshold = 0.1
    const yinBuffer = new Float32Array(SIZE / 2)

    yinBuffer[0] = 1
    for (let tau = 1; tau < yinBuffer.length; tau++) {
      let sum = 0
      for (let i = 0; i < yinBuffer.length; i++) {
        const delta = buffer[i] - buffer[i + tau]
        sum += delta * delta
      }
      yinBuffer[tau] = sum
    }

    let runningSum = 0
    for (let tau = 1; tau < yinBuffer.length; tau++) {
      runningSum += yinBuffer[tau]
      yinBuffer[tau] *= tau / runningSum
    }

    let tau = -1
    for (let i = 2; i < yinBuffer.length; i++) {
      if (yinBuffer[i] < threshold) {
        while (i + 1 < yinBuffer.length && yinBuffer[i + 1] < yinBuffer[i]) {
          i++
        }
        tau = i
        break
      }
    }

    if (tau === -1) {
      let minValue = 1
      for (let i = 2; i < yinBuffer.length; i++) {
        if (yinBuffer[i] < minValue) {
          minValue = yinBuffer[i]
          tau = i
        }
      }
    }

    if (tau === -1 || tau === 0) {
      return { pitchHz: 0, confidence: 0 }
    }

    let betterTau = tau
    if (tau > 0 && tau < yinBuffer.length - 1) {
      const s0 = yinBuffer[tau - 1]
      const s1 = yinBuffer[tau]
      const s2 = yinBuffer[tau + 1]
      betterTau = tau + (s2 - s0) / (2 * (2 * s1 - s2 - s0))
    }

    const pitchHz = this.sampleRate / betterTau
    const confidence = 1 - yinBuffer[tau]

    return { pitchHz, confidence }
  }

  // Autocorrelación simple
  detectPitchAutocorrelation(buffer: Float32Array): { pitchHz: number; confidence: number } {
    if (this.useWASM && this.wasmDetector?.isReady()) {
      const result = this.wasmDetector.detectPitchAutocorr(buffer)
      if (result) {
        return {
          pitchHz: result.pitch_hz,
          confidence: result.confidence,
        }
      }
    }

    // Fallback a JavaScript
    const SIZE = buffer.length
    const MAX_SAMPLES = Math.floor(SIZE / 2)
    const correlations = new Float32Array(MAX_SAMPLES)

    for (let lag = 0; lag < MAX_SAMPLES; lag++) {
      let sum = 0
      for (let i = 0; i < MAX_SAMPLES; i++) {
        sum += buffer[i] * buffer[i + lag]
      }
      correlations[lag] = sum
    }

    let bestLag = -1
    let bestCorrelation = 0

    const minLag = Math.floor(this.sampleRate / 1000)

    for (let lag = minLag; lag < MAX_SAMPLES; lag++) {
      if (
        correlations[lag] > bestCorrelation &&
        correlations[lag] > correlations[lag - 1] &&
        correlations[lag] > correlations[lag + 1]
      ) {
        bestCorrelation = correlations[lag]
        bestLag = lag
      }
    }

    if (bestLag === -1) {
      return { pitchHz: 0, confidence: 0 }
    }

    const pitchHz = this.sampleRate / bestLag
    const confidence = Math.min(bestCorrelation / correlations[0], 1.0)

    return { pitchHz, confidence }
  }

  calculateRMS(buffer: Float32Array): number {
    if (this.useWASM && this.wasmDetector?.isReady()) {
      return this.wasmDetector.getRMS(buffer)
    }

    let sum = 0
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i]
    }
    return Math.sqrt(sum / buffer.length)
  }

  calculateClarity(buffer: Float32Array): number {
    const rms = this.calculateRMS(buffer)
    if (rms < 0.001) return 0

    let crossings = 0
    for (let i = 1; i < buffer.length; i++) {
      if ((buffer[i - 1] >= 0 && buffer[i] < 0) || (buffer[i - 1] < 0 && buffer[i] >= 0)) {
        crossings++
      }
    }

    const zcr = crossings / buffer.length
    return Math.max(0, 1 - zcr * 10)
  }

  destroy() {
    if (this.wasmDetector) {
      this.wasmDetector.destroy()
    }
  }
}
