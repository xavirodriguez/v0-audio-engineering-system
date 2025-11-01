import type { Exercise } from "@/lib/types/exercise-system"

class ExerciseCache {
  private cache = new Map<string, Exercise>()
  private maxSize = 50

  getCachedExercise(key: string, generator: () => Exercise): Exercise {
    if (this.cache.has(key)) {
      return this.cache.get(key)!
    }

    const exercise = generator()
    this.set(key, exercise)
    return exercise
  }

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

  get(key: string): Exercise | undefined {
    return this.cache.get(key)
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

export const exerciseCache = new ExerciseCache()
