export interface CurriculumLevel {
  level: number
  name: string
  description: string
  prerequisites: string[]
  exercises: string[] // Exercise IDs from pedagogical sources
}

export class CurriculumManager {
  private curriculum: CurriculumLevel[] = [
    {
      level: 1,
      name: "Fundamentos",
      description: "Postura, arco, cuerdas abiertas",
      prerequisites: [],
      exercises: ["open-strings-basic", "bowing-straight"],
    },
    {
      level: 2,
      name: "Primera Posición",
      description: "Digitación básica en primera posición",
      prerequisites: ["Fundamentos"],
      exercises: ["scales-first-position", "simple-melodies"],
    },
    {
      level: 3,
      name: "Cambios de Posición",
      description: "Introducción a segunda y tercera posición",
      prerequisites: ["Primera Posición"],
      exercises: ["position-shifts", "scales-multiple-positions"],
    },
    {
      level: 4,
      name: "Técnica Avanzada",
      description: "Vibrato, dobles cuerdas, posiciones altas",
      prerequisites: ["Cambios de Posición"],
      exercises: ["vibrato-exercises", "double-stops", "high-positions"],
    },
  ]

  getCurrentLevel(studentLevel: string): CurriculumLevel {
    const levelMap = {
      beginner: 1,
      intermediate: 2,
      advanced: 4,
    }
    const level = levelMap[studentLevel as keyof typeof levelMap] || 1
    return this.curriculum[level - 1]
  }

  getNextExercises(currentLevel: number): string[] {
    const level = this.curriculum[currentLevel - 1]
    return level ? level.exercises : []
  }

  validateProgression(studentLevel: string, exerciseSource: string): boolean {
    // Validate that the exercise is appropriate for the student's level
    const level = this.getCurrentLevel(studentLevel)
    return level.exercises.some((ex) => exerciseSource.includes(ex))
  }
}
