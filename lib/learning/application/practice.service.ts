import { IStudentProfileRepository } from "../domain/repositories/i-student-profile.repository";
import { PracticeSession } from "@/lib/types/exercise-system";

export class PracticeService {
  constructor(private readonly studentProfileRepository: IStudentProfileRepository) {}

  public async completePracticeSession(
    studentId: string,
    session: PracticeSession
  ): Promise<void> {
    const studentProfile = await this.studentProfileRepository.findById(studentId);
    if (!studentProfile) {
      throw new Error("Student profile not found");
    }

    studentProfile.completeSession(session);

    await this.studentProfileRepository.save(studentProfile);
  }
}
