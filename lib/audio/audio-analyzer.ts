import type { Recording, RecordingAnalysis, IntonationPoint, ProblemArea, SpectrogramData, PitchDataPoint } from "@/lib/types/recording"

/**
 * Analyzes audio recordings.
 */
export class AudioAnalyzer {
  /**
   * Analyzes a recording.
   * @param {Recording} recording - The recording to analyze.
   * @returns {Promise<RecordingAnalysis>} - The analysis of the recording.
   */
  async analyzeRecording(recording: Recording): Promise<RecordingAnalysis> {
    const pitchData = recording.pitchData

    // Calcular precisión general
    const validPoints = pitchData.filter((p) => p.confidence > 0.5 && p.targetFrequency)
    const deviations = validPoints.map((p) => Math.abs(p.cents))
    const overallAccuracy = this.calculateAccuracy(deviations)

    // Calcular desviación promedio y máxima
    const averageDeviation = deviations.length > 0 ? deviations.reduce((a, b) => a + b, 0) / deviations.length : 0

    const maxDeviation = deviations.length > 0 ? Math.max(...deviations) : 0

    // Calcular estabilidad
    const stabilityScore = this.calculateStability(pitchData)

    // Calcular calidad de tono
    const toneQuality = this.calculateToneQuality(pitchData)

    // Generar gráfico de entonación
    const intonationGraph = this.generateIntonationGraph(pitchData)

    // Identificar áreas problemáticas
    const problemAreas = this.identifyProblemAreas(pitchData)

    // Generar recomendaciones
    const recommendations = this.generateRecommendations(overallAccuracy, stabilityScore, problemAreas)

    return {
      overallAccuracy,
      averageDeviation,
      maxDeviation,
      stabilityScore,
      toneQuality,
      intonationGraph,
      problemAreas,
      recommendations,
    }
  }

  private calculateAccuracy(deviations: number[]): number {
    if (deviations.length === 0) return 0

    // Accuracy basada en cuántos puntos están dentro de tolerancia
    const withinTolerance = deviations.filter((d) => d < 25).length
    return (withinTolerance / deviations.length) * 100
  }

  private calculateStability(pitchData: PitchDataPoint[]): number {
    if (pitchData.length < 2) return 0

    // Calcular varianza de la desviación
    const deviations = pitchData.map((p) => p.cents)
    const mean = deviations.reduce((a, b) => a + b, 0) / deviations.length
    const variance = deviations.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / deviations.length

    // Convertir varianza a score (menor varianza = mayor estabilidad)
    const stabilityScore = Math.max(0, 100 - variance)
    return Math.min(100, stabilityScore)
  }

  private calculateToneQuality(pitchData: PitchDataPoint[]): number {
    if (pitchData.length === 0) return 0

    // Basado en RMS y confianza promedio
    const avgRms = pitchData.reduce((sum, p) => sum + p.rms, 0) / pitchData.length
    const avgConfidence = pitchData.reduce((sum, p) => sum + p.confidence, 0) / pitchData.length

    // Normalizar (RMS óptimo entre 0.1 y 0.5)
    const rmsScore = avgRms > 0.1 && avgRms < 0.5 ? 100 : Math.max(0, 100 - Math.abs(0.3 - avgRms) * 200)
    const confidenceScore = avgConfidence * 100

    return (rmsScore + confidenceScore) / 2
  }

  private generateIntonationGraph(pitchData: PitchDataPoint[]): IntonationPoint[] {
    return pitchData.map((p) => ({
      time: p.timestamp / 1000, // convertir a segundos
      deviation: p.cents,
      note: p.targetNote,
    }))
  }

  private identifyProblemAreas(pitchData: PitchDataPoint[]): ProblemArea[] {
    const problems: ProblemArea[] = []
    let currentProblem: { start: number; deviations: number[] } | null = null

    pitchData.forEach((point, _index) => {
      const isOutOfTune = Math.abs(point.cents) > 30
      const isUnstable = point.confidence < 0.5

      if (isOutOfTune || isUnstable) {
        if (!currentProblem) {
          currentProblem = {
            start: point.timestamp,
            deviations: [point.cents],
          }
        } else {
          currentProblem.deviations.push(point.cents)
        }
      } else if (currentProblem) {
        // Finalizar problema actual
        const avgDeviation = Math.abs(
          currentProblem.deviations.reduce((a, b) => a + b, 0) / currentProblem.deviations.length,
        )

        const severity: "low" | "medium" | "high" = avgDeviation > 50 ? "high" : avgDeviation > 30 ? "medium" : "low"

        problems.push({
          startTime: currentProblem.start / 1000,
          endTime: point.timestamp / 1000,
          issue: isOutOfTune ? "Entonación imprecisa" : "Tono inestable",
          severity,
          suggestion:
            severity === "high" ? "Practica esta sección lentamente con metrónomo" : "Revisa la posición de los dedos",
        })

        currentProblem = null
      }
    })

    return problems
  }

  private generateRecommendations(accuracy: number, stability: number, problems: ProblemArea[]): string[] {
    const recommendations: string[] = []

    if (accuracy < 70) {
      recommendations.push("Tu precisión general necesita mejorar. Practica con ejercicios de entonación lentos.")
    }

    if (stability < 60) {
      recommendations.push("Trabaja en mantener un tono estable. Usa notas largas para desarrollar control.")
    }

    if (problems.filter((p) => p.severity === "high").length > 0) {
      recommendations.push("Identifica las secciones problemáticas y practícalas por separado.")
    }

    if (accuracy >= 85 && stability >= 80) {
      recommendations.push("¡Excelente trabajo! Considera aumentar la dificultad de tus ejercicios.")
    }

    if (recommendations.length === 0) {
      recommendations.push("Continúa practicando regularmente para mantener tu progreso.")
    }

    return recommendations
  }

  /**
   * Generates a spectrogram from an audio buffer.
   * @param {AudioBuffer} audioBuffer - The audio buffer.
   * @returns {Promise<SpectrogramData>} - The spectrogram data.
   */
  async generateSpectrogram(audioBuffer: AudioBuffer): Promise<SpectrogramData> {
    const sampleRate = audioBuffer.sampleRate
    const channelData = audioBuffer.getChannelData(0)
    const fftSize = 2048
    const hopSize = fftSize / 4

    const times: number[] = []
    const frequencies: number[] = []
    const magnitudes: number[][] = []

    // Generar frecuencias
    for (let i = 0; i < fftSize / 2; i++) {
      frequencies.push((i * sampleRate) / fftSize)
    }

    // Procesar ventanas
    for (let offset = 0; offset < channelData.length - fftSize; offset += hopSize) {
      const window = channelData.slice(offset, offset + fftSize)
      const spectrum = this.computeFFT(window)

      times.push(offset / sampleRate)
      magnitudes.push(spectrum)
    }

    return {
      frequencies,
      times,
      magnitudes,
      fftSize,
      sampleRate,
    }
  }

  private computeFFT(signal: Float32Array): number[] {
    // Implementación simplificada de FFT
    // En producción, usar una librería como fft.js
    const N = signal.length
    const magnitudes: number[] = []

    for (let k = 0; k < N / 2; k++) {
      let real = 0
      let imag = 0

      for (let n = 0; n < N; n++) {
        const angle = (2 * Math.PI * k * n) / N
        real += signal[n] * Math.cos(angle)
        imag -= signal[n] * Math.sin(angle)
      }

      magnitudes.push(Math.sqrt(real * real + imag * imag))
    }

    return magnitudes
  }
}
