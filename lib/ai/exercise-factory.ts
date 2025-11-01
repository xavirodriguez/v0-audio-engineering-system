import { ExerciseGenerator } from "./exercise-generator"
import { PerformanceAnalyzer } from "./performance-analyzer"

let generatorInstance: ExerciseGenerator | null = null
let analyzerInstance: PerformanceAnalyzer | null = null

export function getExerciseGenerator(): ExerciseGenerator {
  if (!generatorInstance) {
    generatorInstance = new ExerciseGenerator()
  }
  return generatorInstance
}

export function getPerformanceAnalyzer(): PerformanceAnalyzer {
  if (!analyzerInstance) {
    analyzerInstance = new PerformanceAnalyzer()
  }
  return analyzerInstance
}

// Para testing: permitir reset
export function resetFactories() {
  generatorInstance = null
  analyzerInstance = null
}
