import { ExerciseGenerator } from "./exercise-generator"
import { PerformanceAnalyzer } from "./performance-analyzer"

let generatorInstance: ExerciseGenerator | null = null
let analyzerInstance: PerformanceAnalyzer | null = null

/**
 * Gets the exercise generator instance.
 * @returns {ExerciseGenerator} - The exercise generator instance.
 */
export function getExerciseGenerator(): ExerciseGenerator {
  if (!generatorInstance) {
    generatorInstance = new ExerciseGenerator()
  }
  return generatorInstance
}

/**
 * Gets the performance analyzer instance.
 * @returns {PerformanceAnalyzer} - The performance analyzer instance.
 */
export function getPerformanceAnalyzer(): PerformanceAnalyzer {
  if (!analyzerInstance) {
    analyzerInstance = new PerformanceAnalyzer()
  }
  return analyzerInstance
}

/**
 * Resets the factories for testing.
 */
export function resetFactories() {
  generatorInstance = null
  analyzerInstance = null
}
