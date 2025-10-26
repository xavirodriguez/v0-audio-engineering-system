export class LatencyCalibrator {
  private audioContext: AudioContext
  private measurements: number[] = []

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext
  }

  // Calcular latencia base del sistema
  calculateBaseLatency(mediaStream: MediaStream): number {
    const FRAME_SIZE = 2048
    const SAMPLE_RATE = this.audioContext.sampleRate

    // 1. Latencia de entrada
    const audioTrack = mediaStream.getAudioTracks()[0]
    const settings = audioTrack.getSettings()
    const inputLatencyMs = ((settings as any).latency || 0) * 1000

    // 2. Latencia de procesamiento
    const processingLatencyMs = (FRAME_SIZE / SAMPLE_RATE) * 1000

    // 3. Latencia de salida
    const outputLatencyMs = (this.audioContext.outputLatency || 0) * 1000

    const baseLatencyMs = inputLatencyMs + processingLatencyMs + outputLatencyMs

    console.log("[v0] Base latency calculated:", {
      input: inputLatencyMs,
      processing: processingLatencyMs,
      output: outputLatencyMs,
      total: baseLatencyMs,
    })

    return baseLatencyMs
  }

  // Reproducir un click para calibración
  playCalibrationClick(): number {
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.frequency.value = 1000 // 1kHz
    oscillator.type = "sine"

    const clickTime = this.audioContext.currentTime + 0.1
    const duration = 0.05 // 50ms

    gainNode.gain.setValueAtTime(0, clickTime)
    gainNode.gain.linearRampToValueAtTime(0.3, clickTime + 0.01)
    gainNode.gain.linearRampToValueAtTime(0, clickTime + duration)

    oscillator.start(clickTime)
    oscillator.stop(clickTime + duration)

    return clickTime
  }

  // Agregar una medición de round-trip
  addMeasurement(clickTime: number, detectionTime: number) {
    const roundTripMs = (detectionTime - clickTime) * 1000
    this.measurements.push(roundTripMs)
    console.log("[v0] Calibration measurement:", roundTripMs, "ms")
  }

  // Calcular el offset final promediando las mediciones
  calculateFinalOffset(): number {
    if (this.measurements.length === 0) return 0

    // Descartar la primera medición (warm-up)
    const validMeasurements = this.measurements.slice(1)

    if (validMeasurements.length === 0) return this.measurements[0]

    const sum = validMeasurements.reduce((a, b) => a + b, 0)
    const avgRoundTripMs = sum / validMeasurements.length

    console.log("[v0] Final latency offset:", avgRoundTripMs, "ms")

    return avgRoundTripMs
  }

  reset() {
    this.measurements = []
  }
}
