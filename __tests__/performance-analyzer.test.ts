import { describe, it, expect } from "vitest"
import { PerformanceAnalyzer } from "@/lib/ai/performance-analyzer"
import type { StudentProfile, PracticeSession } from "@/lib/types/exercise-system"

const mockStudentProfile: StudentProfile = {
  studentId: "1",
  practiceHistory: [],
  strengths: [],
  weaknesses: [],
  totalPracticeTime: 0,
  averageAccuracy: 0,
  toneQualityScore: 0,
  improvementRate: 0,
}

const mockPracticeSession: PracticeSession = {
  sessionId: "1",
  exerciseId: "1",
  exerciseType: "scales",
  notes: [
    {
      targetNote: "A4",
      playedNote: "A4",
      successRate: 90,
      holdStability: 85,
      averageResponseTime: 400,
      averageDeviation: 10,
    },
  ],
  metrics: {
    accuracy: 90,
    stability: 85,
    responseTime: 400,
    consistency: 80,
    intonationError: 10,
    toneQuality: 70,
    spectralCentroid: 2000,
    attackTime: 50,
    timestamp: Date.now(),
  },
  duration: 10000,
}

describe("PerformanceAnalyzer", () => {
  it("should correctly identify strengths from practice sessions", () => {
    const analyzer = new PerformanceAnalyzer()
    const profile: StudentProfile = {
      ...mockStudentProfile,
      practiceHistory: [
        {
          ...mockPracticeSession,
          exerciseType: "scales",
          metrics: { ...mockPracticeSession.metrics, accuracy: 90 },
        },
        {
          ...mockPracticeSession,
          exerciseType: "arpeggios",
          metrics: { ...mockPracticeSession.metrics, accuracy: 75 },
        },
        {
          ...mockPracticeSession,
          exerciseType: "scales",
          metrics: { ...mockPracticeSession.metrics, accuracy: 88 },
        },
      ],
    }

    const strengths = analyzer.identifyStrengths(profile)
    expect(strengths).toContain("strong-scales")
    expect(strengths).not.toContain("strong-arpeggios")
  })
})
