import { StudentProfile } from "../student-profile";

export interface IStudentProfileRepository {
  findById(id: string): Promise<StudentProfile | null>;
  save(profile: StudentProfile): Promise<void>;
  create(profile: StudentProfile): Promise<void>;
}
