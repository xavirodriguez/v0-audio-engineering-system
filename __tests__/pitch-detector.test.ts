import { describe, it, expect, beforeEach } from "vitest"
import { PitchDetector } from "@/lib/audio/pitch-detector"

describe("PitchDetector", () => {
  let detector: PitchDetector

  beforeEach(() => {
    detector = new PitchDetector(48000)
  })

  it("should detect A4 (440Hz) correctly", () => {
    const signal = generateSineWave(440, 48000, 2048)
    const { pitchHz, confidence } = detector.detectPitchYIN(signal)

    expect(pitchHz).toBeCloseTo(440, 1)
    expect(confidence).toBeGreaterThan(0.8)
  })

  it("should detect E5 (659.25Hz) correctly", () => {
    const signal = generateSineWave(659.25, 48000, 2048)
    const { pitchHz, confidence } = detector.detectPitchYIN(signal)

    expect(pitchHz).toBeCloseTo(659.25, 1)
    expect(confidence).toBeGreaterThan(0.7)
  })

  it("should return low confidence for noise", () => {
    const signal = generateNoise(2048)
    const { confidence } = detector.detectPitchYIN(signal)

    expect(confidence).toBeLessThan(0.3)
  })

  it("should calculate RMS correctly", () => {
    const signal = new Float32Array(1024).fill(0.5)
    const rms = detector.calculateRMS(signal)

    expect(rms).toBeCloseTo(0.5, 2)
  })

  it("should calculate spectral centroid", () => {
    const signal = generateSineWave(440, 48000, 2048)
    const centroid = detector.calculateSpectralCentroid(signal)

    expect(centroid).toBeGreaterThan(0)
    expect(centroid).toBeLessThan(24000)
  })
})

// Helper functions
function generateSineWave(frequency: number, sampleRate: number, length: number): Float32Array {
  const signal = new Float32Array(length)
  for (let i = 0; i < length; i++) {
    signal[i] = Math.sin((2 * Math.PI * frequency * i) / sampleRate)
  }
  return signal
}

function generateNoise(length: number): Float32Array {
  const signal = new Float32Array(length)
  for (let i = 0; i < length; i++) {
    signal[i] = Math.random() * 2 - 1
  }
  return signal
}
