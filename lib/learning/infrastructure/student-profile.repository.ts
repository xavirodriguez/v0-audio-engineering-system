import { IStudentProfileRepository } from "../domain/repositories/i-student-profile.repository";
import { StudentProfile } from "../domain/student-profile";
import { useExerciseStore } from "@/lib/store/exercise-store";

export class StudentProfileRepository implements IStudentProfileRepository {
  public async findById(id: string): Promise<StudentProfile | null> {
    const { profile } = useExerciseStore.getState();
    if (profile && profile.id === id) {
      // The store returns a plain object, so we need to re-hydrate our domain model
      const rehydratedProfile = StudentProfile.create(
        profile.id,
        profile.level,
        profile.practiceHistory
      );
      return rehydratedProfile;
    }
    return null;
  }

  public async save(profile: StudentProfile): Promise<void> {
    // The store expects a plain object, not a class instance.
    const plainProfile = {
      id: profile.id,
      level: profile.level,
      strengths: profile.strengths,
      weaknesses: profile.weaknesses,
      practiceHistory: profile.practiceHistory,
      totalPracticeTime: profile.totalPracticeTime,
      averageAccuracy: profile.averageAccuracy,
      improvementRate: profile.improvementRate,
      toneQualityScore: profile.toneQualityScore,
      // The store also has name and preferences, which our domain model doesn't.
      // We need to get the existing profile to preserve these.
      name: useExerciseStore.getState().profile?.name || "Estudiante",
      preferences: useExerciseStore.getState().profile?.preferences || {
        focusAreas: [],
        sessionDuration: 30,
      }
    };
    useExerciseStore.getState().setProfile(plainProfile);
  }

  public async create(profile: StudentProfile): Promise<void> {
    // Same logic as save for now.
    await this.save(profile);
  }
}
