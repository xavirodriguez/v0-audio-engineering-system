import type { Exercise } from "@/lib/types/exercise-system"

/**
 * A cache for exercises.
 */
class ExerciseCache {
  private cache = new Map<string, Exercise>()
  private maxSize = 50

  /**
   * Gets a cached exercise.
   * @param {string} key - The key of the exercise.
   * @param {() => Exercise} generator - The function to generate the exercise if it's not in the cache.
   * @returns {Exercise} - The cached exercise.
   */
  getCachedExercise(key: string, generator: () => Exercise): Exercise {
    if (this.cache.has(key)) {
      return this.cache.get(key)!
    }

    const exercise = generator()
    this.set(key, exercise)
    return exercise
  }

  /**
   * Sets an exercise in the cache.
   * @param {string} key - The key of the exercise.
   * @param {Exercise} exercise - The exercise to set.
   */
  set(key: string, exercise: Exercise): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, exercise)
  }

  /**
   * Gets an exercise from the cache.
   * @param {string} key - The key of the exercise.
   * @returns {Exercise | undefined} - The cached exercise.
   */
  get(key: string): Exercise | undefined {
    return this.cache.get(key)
  }

  /**
   * Whether the cache has an exercise.
   * @param {string} key - The key of the exercise.
   * @returns {boolean} - Whether the cache has the exercise.
   */
  has(key: string): boolean {
    return this.cache.has(key)
  }

  /**
   * Clears the cache.
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * The size of the cache.
   * @returns {number} - The size of the cache.
   */
  size(): number {
    return this.cache.size
  }
}

export const exerciseCache = new ExerciseCache()
