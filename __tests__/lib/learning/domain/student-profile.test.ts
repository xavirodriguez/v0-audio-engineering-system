import { describe, it, expect } from "vitest";
import { StudentProfile } from "@/lib/learning/domain/student-profile";
import type { PracticeSession } from "@/lib/types/exercise-system";

const mockPracticeSession: PracticeSession = {
  id: "session1",
  timestamp: Date.now(),
  duration: 600, // 10 minutes
  exerciseId: "ex1",
  exerciseType: "scales",
  metrics: {
    accuracy: 95,
    stability: 80,
    responseTime: 300,
    consistency: 90,
    intonationError: 5,
    toneQuality: 85,
    spectralCentroid: 2200,
    attackTime: 40,
    timestamp: Date.now(),
  },
  notes: [],
  completed: true,
  context: "deep-study",
  goal: "Achieve 95% accuracy",
  selfRating: 5,
};

describe("StudentProfile", () => {
  it("should correctly update its metrics after a practice session", () => {
    const profile = StudentProfile.create("student1");

    expect(profile.totalPracticeTime).toBe(0);
    expect(profile.averageAccuracy).toBe(0);
    expect(profile.practiceHistory.length).toBe(0);

    profile.completeSession(mockPracticeSession);

    expect(profile.practiceHistory.length).toBe(1);
    expect(profile.totalPracticeTime).toBeCloseTo(10);
    expect(profile.averageAccuracy).toBeCloseTo(95);
    expect(profile.strengths).toContain("high-accuracy");
  });
});
