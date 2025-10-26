import type { PerformanceMetrics, StudentProfile, PracticeSession } from "@/lib/types/exercise-system"

export class PerformanceAnalyzer {
  // Analizar una sesión de práctica y extraer métricas
  analyzeSession(session: PracticeSession): PerformanceMetrics {
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

    return {
      accuracy: Math.round(accuracy * 100) / 100,
      stability: Math.round(avgStability * 100) / 100,
      responseTime: Math.round(avgResponseTime),
      consistency: Math.round(consistency * 100) / 100,
      intonationError: Math.round(avgIntonationError * 100) / 100,
      timestamp: Date.now(),
    }
  }

  // Identificar fortalezas del estudiante
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

  // Identificar debilidades del estudiante
  identifyWeaknesses(profile: StudentProfile): string[] {
    const weaknesses: string[] = []
    const recentSessions = profile.practiceHistory.slice(-10)

    if (recentSessions.length === 0) return weaknesses

    const avgAccuracy = recentSessions.reduce((sum, s) => sum + s.metrics.accuracy, 0) / recentSessions.length

    const avgStability = recentSessions.reduce((sum, s) => sum + s.metrics.stability, 0) / recentSessions.length

    const avgResponseTime = recentSessions.reduce((sum, s) => sum + s.metrics.responseTime, 0) / recentSessions.length

    const avgIntonation = recentSessions.reduce((sum, s) => sum + s.metrics.intonationError, 0) / recentSessions.length

    const avgConsistency = recentSessions.reduce((sum, s) => sum + s.metrics.consistency, 0) / recentSessions.length

    // Identificar debilidades
    if (avgAccuracy < 70) weaknesses.push("low-accuracy")
    if (avgStability < 60) weaknesses.push("unstable-pitch")
    if (avgResponseTime > 1000) weaknesses.push("slow-response")
    if (avgIntonation > 30) weaknesses.push("poor-intonation")
    if (avgConsistency < 60) weaknesses.push("inconsistent-performance")

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

  // Calcular tasa de mejora
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

  // Actualizar perfil del estudiante
  updateProfile(profile: StudentProfile, newSession: PracticeSession): StudentProfile {
    const updatedHistory = [...profile.practiceHistory, newSession]

    // Calcular nuevas métricas
    const totalTime = profile.totalPracticeTime + newSession.duration / 60
    const allAccuracies = updatedHistory.map((s) => s.metrics.accuracy)
    const avgAccuracy = allAccuracies.reduce((a, b) => a + b, 0) / allAccuracies.length

    const updatedProfile: StudentProfile = {
      ...profile,
      practiceHistory: updatedHistory,
      totalPracticeTime: totalTime,
      averageAccuracy: avgAccuracy,
      improvementRate: 0, // Se calculará después
    }

    // Actualizar fortalezas y debilidades
    updatedProfile.strengths = this.identifyStrengths(updatedProfile)
    updatedProfile.weaknesses = this.identifyWeaknesses(updatedProfile)
    updatedProfile.improvementRate = this.calculateImprovementRate(updatedProfile)

    return updatedProfile
  }
}
