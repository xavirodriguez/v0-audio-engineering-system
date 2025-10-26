"use client"

import { useState, useEffect } from "react"
import type { StudentProfile, PracticeSession, Exercise, AdaptiveRecommendation } from "@/lib/types/exercise-system"
import { ExerciseGenerator } from "@/lib/ai/exercise-generator"
import { PerformanceAnalyzer } from "@/lib/ai/performance-analyzer"

const STORAGE_KEY = "violin-student-profile"

export function useAdaptiveExercises() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null)
  const [recommendations, setRecommendations] = useState<AdaptiveRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const generator = new ExerciseGenerator()
  const analyzer = new PerformanceAnalyzer()

  // Cargar perfil desde localStorage
  useEffect(() => {
    const loadProfile = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const loadedProfile = JSON.parse(stored) as StudentProfile
          setProfile(loadedProfile)

          // Generar recomendaciones
          const recs = generator.generateRecommendations(loadedProfile)
          setRecommendations(recs)
        } else {
          // Crear perfil nuevo
          const newProfile: StudentProfile = {
            id: `student-${Date.now()}`,
            level: "beginner",
            strengths: [],
            weaknesses: [],
            practiceHistory: [],
            totalPracticeTime: 0,
            averageAccuracy: 0,
            improvementRate: 0,
          }
          setProfile(newProfile)
          saveProfile(newProfile)
        }
      } catch (error) {
        console.error("[v0] Error loading profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [])

  // Guardar perfil en localStorage
  const saveProfile = (updatedProfile: StudentProfile) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile))
      setProfile(updatedProfile)
    } catch (error) {
      console.error("[v0] Error saving profile:", error)
    }
  }

  // Completar sesión de práctica
  const completeSession = (session: PracticeSession) => {
    if (!profile) return

    const updatedProfile = analyzer.updateProfile(profile, session)
    saveProfile(updatedProfile)

    // Regenerar recomendaciones
    const newRecs = generator.generateRecommendations(updatedProfile)
    setRecommendations(newRecs)

    console.log("[v0] Session completed, profile updated")
  }

  // Seleccionar ejercicio
  const selectExercise = (exercise: Exercise) => {
    setCurrentExercise(exercise)
  }

  // Generar ejercicio personalizado
  const generateCustomExercise = (type: string, difficulty: string) => {
    let exercise: Exercise | null = null

    switch (type) {
      case "open-strings":
        exercise = generator.generateOpenStringsExercise(difficulty as any)
        break
      case "scales":
        exercise = generator.generateScaleExercise(difficulty as any, "major")
        break
      case "intervals":
        exercise = generator.generateIntervalsExercise(difficulty as any)
        break
      case "intonation-drill":
        exercise = generator.generateIntonationDrill(69, difficulty as any)
        break
    }

    if (exercise) {
      setCurrentExercise(exercise)
    }

    return exercise
  }

  return {
    profile,
    currentExercise,
    recommendations,
    isLoading,
    completeSession,
    selectExercise,
    generateCustomExercise,
  }
}
