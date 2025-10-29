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
  const [practiceContext, setPracticeContext] = useState<"warm-up" | "deep-study" | "review">("deep-study")
  const [practiceGoal, setPracticeGoal] = useState<string>("")

  const generator = new ExerciseGenerator()
  const analyzer = new PerformanceAnalyzer()

  useEffect(() => {
    const loadProfile = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        const loadedProfile: StudentProfile = stored
          ? JSON.parse(stored)
          : {
              id: "default-user",
              name: "Estudiante",
              level: "beginner",
              strengths: [],
              weaknesses: [],
              practiceHistory: [],
              preferences: {
                focusAreas: [],
                sessionDuration: 30,
              },
            }

        setProfile(loadedProfile)

        const recs = generator.generateRecommendations(loadedProfile)
        setRecommendations(recs)
      } catch (error) {
        console.error("Error loading profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [])

  const saveProfile = (updatedProfile: StudentProfile) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile))
      setProfile(updatedProfile)
    } catch (error) {
      console.error("Error saving profile:", error)
    }
  }

  const completeSession = (session: PracticeSession) => {
    if (!profile) return

    const enhancedSession: PracticeSession = {
      ...session,
      context: practiceContext,
      goal: practiceGoal || "Práctica general",
      selfRating: 3, // Default, should be set by user
    }

    const updatedProfile = analyzer.updateProfile(profile, enhancedSession)
    saveProfile(updatedProfile)

    const newRecs = generator.generateRecommendations(updatedProfile)
    setRecommendations(newRecs)
  }

  const selectExercise = (exercise: Exercise) => {
    setCurrentExercise(exercise)
  }

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
    practiceContext,
    practiceGoal,
    setPracticeContext,
    setPracticeGoal,
    completeSession,
    selectExercise,
    generateCustomExercise,
  }
}
