import type { PerformanceMetrics, StudentProfile, PracticeSession } from "@/lib/types/exercise-system"

/**
 * Analyzes the performance of a student.
 */
export class PerformanceAnalyzer {
  /**
   * Analyzes a practice session.
   * @param {PracticeSession} session - The practice session to analyze.
   * @param {Float32Array} [audioData] - The audio data of the session.
   * @returns {PerformanceMetrics} - The performance metrics.
   */
  analyzeSession(session: PracticeSession, audioData?: Float32Array): PerformanceMetrics {
    const notes = session.notes

    // Calcular accuracy promedio
    const accuracy = notes.reduce((sum, note) => sum + note.successRate, 0) / notes.length

    // Calcular estabilidad (basado en desviación estándar de holdStability)
    const avgStability = notes.reduce((sum, note) => sum + note.holdStability, 0) / notes.length

    // Calcular tiempo de respuesta promedio
    const avgResponseTime = notes.reduce((sum, note) => sum + note.averageResponseTime, 0) / notes.length

    // Calcular consistencia (inverso de la varianza de successRate)
    const successRates = notes.map((n) => n.successRate)
    const avgSuccess = successRates.reduce((a, b) => a + b, 0) / successRates.length
    const variance = successRates.reduce((sum, rate) => sum + Math.pow(rate - avgSuccess, 2), 0) / successRates.length
    const consistency = Math.max(0, 100 - variance)

    // Calcular error de entonación promedio
    const avgIntonationError = notes.reduce((sum, note) => sum + Math.abs(note.averageDeviation), 0) / notes.length

    let toneQuality = 75 // Default value
    let spectralCentroid = 2000 // Default Hz
    let attackTime = 50 // Default ms

    if (audioData && audioData.length > 0) {
      // Simplified spectral analysis (in production, use proper FFT)
      const rms = Math.sqrt(audioData.reduce((sum, val) => sum + val * val, 0) / audioData.length)
      toneQuality = Math.min(100, rms * 1000) // Simplified calculation

      // Estimate spectral centroid (brightness)
      spectralCentroid = 1000 + rms * 3000

      // Estimate attack time (cleanliness of note start)
      let attackSamples = 0
      const threshold = rms * 0.5
      for (let i = 0; i < Math.min(audioData.length, 1000); i++) {
        if (Math.abs(audioData[i]) > threshold) {
          attackSamples = i
          break
        }
      }
      attackTime = (attackSamples / 44100) * 1000 // Convert to ms
    }

    return {
      accuracy: Math.round(accuracy * 100) / 100,
      stability: Math.round(avgStability * 100) / 100,
      responseTime: Math.round(avgResponseTime),
      consistency: Math.round(consistency * 100) / 100,
      intonationError: Math.round(avgIntonationError * 100) / 100,
      toneQuality: Math.round(toneQuality * 100) / 100,
      spectralCentroid: Math.round(spectralCentroid),
      attackTime: Math.round(attackTime * 100) / 100,
      timestamp: Date.now(),
    }
  }

  /**
   * Identifies the strengths of a student.
   * @param {StudentProfile} profile - The student's profile.
   * @returns {string[]} - The student's strengths.
   */
  identifyStrengths(profile: StudentProfile): string[] {
    const strengths: string[] = []
    const recentSessions = profile.practiceHistory.slice(-10)

    if (recentSessions.length === 0) return strengths

    // Analizar métricas promedio
    const avgAccuracy = recentSessions.reduce((sum, s) => sum + s.metrics.accuracy, 0) / recentSessions.length

    const avgStability = recentSessions.reduce((sum, s) => sum + s.metrics.stability, 0) / recentSessions.length

    const avgResponseTime = recentSessions.reduce((sum, s) => sum + s.metrics.responseTime, 0) / recentSessions.length

    const avgIntonation = recentSessions.reduce((sum, s) => sum + s.metrics.intonationError, 0) / recentSessions.length

    // Identificar fortalezas basadas en umbrales
    if (avgAccuracy > 85) strengths.push("high-accuracy")
    if (avgStability > 80) strengths.push("stable-pitch")
    if (avgResponseTime < 500) strengths.push("quick-response")
    if (avgIntonation < 15) strengths.push("excellent-intonation")

    // Analizar tipos de ejercicios donde destaca
    const exercisePerformance = new Map<string, number>()
    recentSessions.forEach((session) => {
      const type = session.exerciseType
      const current = exercisePerformance.get(type) || []
      exercisePerformance.set(type, [...current, session.metrics.accuracy])
    })

    exercisePerformance.forEach((accuracies, type) => {
      const avg = accuracies.reduce((a, b) => a + b, 0) / accuracies.length
      if (avg > 85) {
        strengths.push(`strong-${type}`)
      }
    })

    return strengths
  }

  /**
   * Identifies the weaknesses of a student.
   * @param {StudentProfile} profile - The student's profile.
   * @returns {string[]} - The student's weaknesses.
   */
  identifyWeaknesses(profile: StudentProfile): string[] {
    const weaknesses: string[] = []
    const recentSessions = profile.practiceHistory.slice(-10)

    if (recentSessions.length === 0) return weaknesses

    const avgAccuracy = recentSessions.reduce((sum, s) => sum + s.metrics.accuracy, 0) / recentSessions.length
    const avgStability = recentSessions.reduce((sum, s) => sum + s.metrics.stability, 0) / recentSessions.length
    const avgResponseTime = recentSessions.reduce((sum, s) => sum + s.metrics.responseTime, 0) / recentSessions.length
    const avgIntonation = recentSessions.reduce((sum, s) => sum + s.metrics.intonationError, 0) / recentSessions.length
    const avgConsistency = recentSessions.reduce((sum, s) => sum + s.metrics.consistency, 0) / recentSessions.length

    const avgToneQuality =
      recentSessions.reduce((sum, s) => sum + (s.metrics.toneQuality || 75), 0) / recentSessions.length
    const avgAttackTime =
      recentSessions.reduce((sum, s) => sum + (s.metrics.attackTime || 50), 0) / recentSessions.length

    // Identificar debilidades
    if (avgAccuracy < 70) weaknesses.push("low-accuracy")
    if (avgStability < 60) weaknesses.push("unstable-pitch")
    if (avgResponseTime > 1000) weaknesses.push("slow-response")
    if (avgIntonation > 30) weaknesses.push("poor-intonation")
    if (avgConsistency < 60) weaknesses.push("inconsistent-performance")

    if (avgToneQuality < 60) weaknesses.push("poor-tone-quality")
    if (avgAttackTime > 100) weaknesses.push("poor-attack")
    if (avgToneQuality < 50) weaknesses.push("scratchy-tone")

    // Analizar tipos de ejercicios problemáticos
    const exercisePerformance = new Map<string, number[]>()
    recentSessions.forEach((session) => {
      const type = session.exerciseType
      const current = exercisePerformance.get(type) || []
      exercisePerformance.set(type, [...current, session.metrics.accuracy])
    })

    exercisePerformance.forEach((accuracies, type) => {
      const avg = accuracies.reduce((a, b) => a + b, 0) / accuracies.length
      if (avg < 70) {
        weaknesses.push(`weak-${type}`)
      }
    })

    return weaknesses
  }

  /**
   * Calculates the improvement rate of a student.
   * @param {StudentProfile} profile - The student's profile.
   * @returns {number} - The improvement rate.
   */
  calculateImprovementRate(profile: StudentProfile): number {
    const sessions = profile.practiceHistory
    if (sessions.length < 5) return 0

    // Comparar últimas 5 sesiones con las 5 anteriores
    const recent = sessions.slice(-5)
    const previous = sessions.slice(-10, -5)

    if (previous.length === 0) return 0

    const recentAvg = recent.reduce((sum, s) => sum + s.metrics.accuracy, 0) / recent.length
    const previousAvg = previous.reduce((sum, s) => sum + s.metrics.accuracy, 0) / previous.length

    if (previousAvg === 0) return 0

    return ((recentAvg - previousAvg) / previousAvg) * 100
  }

  /**
   * Updates the profile of a student.
   * @param {StudentProfile} profile - The student's profile.
   * @param {PracticeSession} newSession - The new practice session.
   * @returns {StudentProfile} - The updated profile.
   */
  updateProfile(profile: StudentProfile, newSession: PracticeSession): StudentProfile {
    const updatedHistory = [...profile.practiceHistory, newSession]

    // Calcular nuevas métricas
    const totalTime = profile.totalPracticeTime + newSession.duration / 60
    const allAccuracies = updatedHistory.map((s) => s.metrics.accuracy)
    const avgAccuracy = allAccuracies.reduce((a, b) => a + b, 0) / allAccuracies.length

    const allToneQualities = updatedHistory.map((s) => s.metrics.toneQuality || 75)
    const avgToneQuality = allToneQualities.reduce((a, b) => a + b, 0) / allToneQualities.length

    const updatedProfile: StudentProfile = {
      ...profile,
      practiceHistory: updatedHistory,
      totalPracticeTime: totalTime,
      averageAccuracy: avgAccuracy,
      toneQualityScore: avgToneQuality,
      improvementRate: 0, // Se calculará después
    }

    // Actualizar fortalezas y debilidades
    updatedProfile.strengths = this.identifyStrengths(updatedProfile)
    updatedProfile.weaknesses = this.identifyWeaknesses(updatedProfile)
    updatedProfile.improvementRate = this.calculateImprovementRate(updatedProfile)

    return updatedProfile
  }
}
