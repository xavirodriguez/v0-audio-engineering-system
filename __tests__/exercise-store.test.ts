import { describe, it, expect, beforeEach } from "vitest";
import { useExerciseStore } from "@/lib/store/exercise-store";
import { resetFactories } from "@/lib/ai/exercise-factory";
import { PracticeService } from "@/lib/learning/application/practice.service";
import { StudentProfileRepository } from "@/lib/learning/infrastructure/student-profile.repository";
import type { PracticeSession } from "@/lib/types/exercise-system";
import { StudentProfile } from "@/lib/learning/domain/student-profile";

describe("ExerciseStore and Learning Context Integration", () => {
  beforeEach(() => {
    // Reset store state before each test
    useExerciseStore.setState({
      profile: null,
      currentExercise: null,
      recommendations: [],
      isLoading: true,
      practiceContext: "deep-study",
      practiceGoal: "",
    });
    resetFactories();
  });

  it("should initialize profile with recommendations", () => {
    const { initializeProfile } = useExerciseStore.getState();
    initializeProfile();
    const { profile, recommendations, isLoading } = useExerciseStore.getState();
    expect(profile).not.toBeNull();
    expect(recommendations.length).toBeGreaterThan(0);
    expect(isLoading).toBe(false);
  });

  it("should generate custom exercise", () => {
    const { generateCustomExercise } = useExerciseStore.getState();
    const exercise = generateCustomExercise("scales", "medium");
    const { currentExercise } = useExerciseStore.getState();
    expect(exercise).not.toBeNull();
    expect(exercise?.type).toBe("scales");
    expect(currentExercise).toEqual(exercise);
  });

  it("PracticeService should complete a session and update the profile in the store", async () => {
    // 1. Setup: Initialize a profile in the store
    const { initializeProfile } = useExerciseStore.getState();
    initializeProfile();
    const initialProfileData = useExerciseStore.getState().profile;
    expect(initialProfileData).not.toBeNull();

    // 2. Arrange: Create the service and repository
    const repository = new StudentProfileRepository();
    const service = new PracticeService(repository);

    const mockSession: PracticeSession = {
        id: "session1",
        timestamp: Date.now(),
        duration: 600,
        exerciseId: "ex1",
        exerciseType: "scales",
        metrics: { accuracy: 85, stability: 80, responseTime: 300, consistency: 90, intonationError: 15, toneQuality: 80, spectralCentroid: 2000, attackTime: 50, timestamp: Date.now() },
        notes: [],
        completed: true,
        context: "deep-study",
        goal: "Test",
        selfRating: 4,
    };

    // 3. Act: Call the service to complete the session
    await service.completePracticeSession(initialProfileData!.id, mockSession);

    // 4. Assert: Check that the profile in the store has been updated
    const updatedProfileData = useExerciseStore.getState().profile;
    expect(updatedProfileData).not.toBeNull();
    expect(updatedProfileData?.practiceHistory.length).toBe(
      (initialProfileData?.practiceHistory.length || 0) + 1
    );
    // The new domain model calculates average accuracy differently, let's check it's updated.
    expect(updatedProfileData?.averageAccuracy).not.toBe(initialProfileData?.averageAccuracy);
    expect(updatedProfileData?.totalPracticeTime).toBeGreaterThan(0);
  });
});
