import type {
  Exercise,
  DifficultyLevel,
  ExerciseNote,
  StudentProfile,
  AdaptiveRecommendation,
} from "@/lib/types/exercise-system"
import { midiToFrequency, midiToNoteName, generateScale, calculateJustIntonation } from "@/lib/audio/note-utils"
import { Note, Interval } from "tonal"
import { CurriculumManager } from "./curriculum-manager"
import { exerciseCache } from "@/lib/cache/exercise-cache" // Declare the exerciseCache variable

const VALID_KEYS = ["major", "minor"] as const
type ScaleKey = (typeof VALID_KEYS)[number]

const VALID_POSITIONS = [1, 2, 3] as const
type ValidPosition = (typeof VALID_POSITIONS)[number]

/**
 * Generates exercises for the student.
 */
export class ExerciseGenerator {
  private curriculumManager = new CurriculumManager()

  /**
   * Generates an open strings exercise.
   * @param {DifficultyLevel} difficulty - The difficulty of the exercise.
   * @returns {Exercise} - The generated exercise.
   */
  generateOpenStringsExercise(difficulty: DifficultyLevel): Exercise {
    const openStrings = [55, 62, 69, 76] // G3, D4, A4, E5
    const tempo = difficulty === "easy" ? 60 : difficulty === "medium" ? 80 : 100

    const noteDuration = (60000 / tempo) * 4 // Redondas

    const notes: ExerciseNote[] = openStrings.map((midi, index) => ({
      midi,
      frequency: midiToFrequency(midi),
      name: midiToNoteName(midi),
      duration: noteDuration,
      startTime: index * noteDuration,
      dynamic: "mf",
      articulation: "tenuto",
    }))

    return {
      id: `open-strings-${difficulty}-${Date.now()}`,
      type: "open-strings",
      difficulty,
      name: "Cuerdas Abiertas",
      description: "Practica la afinación de las cuatro cuerdas abiertas del violín",
      notes,
      tempo,
      timeSignature: "4/4",
      focusAreas: ["intonation", "tone"],
      estimatedDuration: notes[notes.length - 1].startTime + notes[notes.length - 1].duration,
    }
  }

  /**
   * Generates a scale exercise.
   * @param {DifficultyLevel} difficulty - The difficulty of the exercise.
   * @param {ScaleKey} key - The key of the scale.
   * @param {ValidPosition} position - The position of the scale.
   * @returns {Exercise} - The generated exercise.
   */
  generateScaleExercise(difficulty: DifficultyLevel, key: ScaleKey = "major", position: ValidPosition = 1): Exercise {
    // Validate inputs
    if (!VALID_KEYS.includes(key)) {
      throw new Error(`Invalid key: ${key}. Must be one of: ${VALID_KEYS.join(", ")}`)
    }
    if (!VALID_POSITIONS.includes(position)) {
      throw new Error(`Invalid position: ${position}. Must be one of: ${VALID_POSITIONS.join(", ")}`)
    }

    const tempo = difficulty === "easy" ? 60 : difficulty === "medium" ? 80 : difficulty === "hard" ? 100 : 120

    const scaleNotes = generateScale("A4", key)
    const scale = scaleNotes.map((note) => {
      const midiNote = Note.midi(note)
      return midiNote || 69
    })

    const fingeringPattern = [0, 1, 2, 3, 0, 1, 2, 3] // Simplified pattern

    const noteDuration = (60000 / tempo) * (difficulty === "easy" ? 2 : 1)

    const notes: ExerciseNote[] = []
    let currentTime = 0

    // Ascendente
    scale.forEach((midi, index) => {
      const noteName = midiToNoteName(midi)
      const justFrequency = calculateJustIntonation("A4", Interval.distance("A4", noteName))

      notes.push({
        midi,
        frequency: midiToFrequency(midi),
        targetFrequencyJust: justFrequency,
        name: noteName,
        duration: noteDuration,
        startTime: currentTime,
        dynamic: "mf",
        articulation: "legato",
        fingering: fingeringPattern[index] as 0 | 1 | 2 | 3 | 4,
        position,
        isShift: index > 0 && fingeringPattern[index] < fingeringPattern[index - 1],
        bowing: {
          direction: index % 2 === 0 ? "down" : "up",
          contactPoint: "ordinario",
          portion: "half",
          dynamic: "mf",
        },
      })
      currentTime += noteDuration
    })

    // Descendente
    for (let i = scale.length - 2; i >= 0; i--) {
      const midi = scale[i]
      const noteName = midiToNoteName(midi)
      const justFrequency = calculateJustIntonation("A4", Interval.distance("A4", noteName))

      notes.push({
        midi,
        frequency: midiToFrequency(midi),
        targetFrequencyJust: justFrequency,
        name: noteName,
        duration: noteDuration,
        startTime: currentTime,
        dynamic: "mf",
        articulation: "legato",
        fingering: fingeringPattern[i] as 0 | 1 | 2 | 3 | 4,
        position,
        isShift: i < scale.length - 2 && fingeringPattern[i] > fingeringPattern[i + 1],
        bowing: {
          direction: (scale.length - 1 - i) % 2 === 0 ? "down" : "up",
          contactPoint: "ordinario",
          portion: "half",
          dynamic: "mf",
        },
      })
      currentTime += noteDuration
    }

    return {
      id: `scale-${key}-pos${position}-${difficulty}-${Date.now()}`,
      type: "scales",
      difficulty,
      name: `Escala de La ${key === "major" ? "Mayor" : "Menor"} - Posición ${position}`,
      description: `Practica la escala de La ${key === "major" ? "mayor" : "menor"} en posición ${position}`,
      notes,
      tempo,
      timeSignature: "4/4",
      focusAreas: ["intonation", "finger-placement", "smooth-transitions", "position-work"],
      estimatedDuration: currentTime,
      pedagogicalSource: "Kreutzer Etude No. 1",
    }
  }

  /**
   * Generates an intervals exercise.
   * @param {DifficultyLevel} difficulty - The difficulty of the exercise.
   * @returns {Exercise} - The generated exercise.
   */
  generateIntervalsExercise(difficulty: DifficultyLevel): Exercise {
    const tempo = difficulty === "easy" ? 60 : difficulty === "medium" ? 80 : 100
    const noteDuration = (60000 / tempo) * 2

    const rootNote = "A4"
    const intervalNames = ["2M", "3M", "4P", "5P", "6M", "7M", "8P"]

    const notes: ExerciseNote[] = []
    let currentTime = 0

    intervalNames.forEach((intervalName) => {
      const note1 = rootNote
      const note2 = Note.transpose(rootNote, intervalName)

      const midi1 = Note.midi(note1) || 69
      const midi2 = Note.midi(note2) || 69

      // Primera nota
      notes.push({
        midi: midi1,
        frequency: midiToFrequency(midi1),
        targetFrequencyJust: calculateJustIntonation(rootNote, "1P"),
        name: note1,
        duration: noteDuration,
        startTime: currentTime,
        dynamic: "mf",
        articulation: "tenuto",
      })
      currentTime += noteDuration

      // Segunda nota
      notes.push({
        midi: midi2,
        frequency: midiToFrequency(midi2),
        targetFrequencyJust: calculateJustIntonation(rootNote, intervalName),
        name: note2,
        duration: noteDuration,
        startTime: currentTime,
        dynamic: "mf",
        articulation: "tenuto",
      })
      currentTime += noteDuration
    })

    return {
      id: `intervals-${difficulty}-${Date.now()}`,
      type: "intervals",
      difficulty,
      name: "Práctica de Intervalos",
      description: "Practica intervalos musicales desde la segunda hasta la octava",
      notes,
      tempo,
      timeSignature: "4/4",
      focusAreas: ["intonation", "interval-recognition", "ear-training"],
      estimatedDuration: currentTime,
    }
  }

  /**
   * Generates an intonation drill.
   * @param {number} targetNote - The target note.
   * @param {DifficultyLevel} difficulty - The difficulty of the exercise.
   * @returns {Exercise} - The generated exercise.
   */
  generateIntonationDrill(targetNote: number, difficulty: DifficultyLevel): Exercise {
    const tempo = 60
    const noteDuration = (60000 / tempo) * 4 // Redondas
    const repetitions = difficulty === "easy" ? 4 : difficulty === "medium" ? 6 : 8

    const notes: ExerciseNote[] = []
    let currentTime = 0

    for (let i = 0; i < repetitions; i++) {
      notes.push({
        midi: targetNote,
        frequency: midiToFrequency(targetNote),
        name: midiToNoteName(targetNote),
        duration: noteDuration,
        startTime: currentTime,
        dynamic: "mf",
        articulation: "tenuto",
      })
      currentTime += noteDuration
    }

    return {
      id: `intonation-drill-${targetNote}-${difficulty}-${Date.now()}`,
      type: "intonation-drill",
      difficulty,
      name: `Ejercicio de Entonación - ${midiToNoteName(targetNote)}`,
      description: `Mantén la nota ${midiToNoteName(targetNote)} con entonación perfecta`,
      notes,
      tempo,
      timeSignature: "4/4",
      focusAreas: ["intonation", "pitch-stability", "tone-quality"],
      estimatedDuration: currentTime,
    }
  }

  /**
   * Generates a bowing pattern drill.
   * @param {DifficultyLevel} difficulty - The difficulty of the exercise.
   * @returns {Exercise} - The generated exercise.
   */
  generateBowingPatternDrill(difficulty: DifficultyLevel): Exercise {
    const tempo = difficulty === "easy" ? 60 : difficulty === "medium" ? 80 : 100
    const noteDuration = (60000 / tempo) * 4 // Whole notes

    // Practice on open D string (62)
    const midi = 62
    const patterns = [
      {
        direction: "down" as const,
        contactPoint: "ordinario" as const,
        portion: "whole" as const,
        dynamic: "mf" as const,
      },
      {
        direction: "up" as const,
        contactPoint: "ordinario" as const,
        portion: "whole" as const,
        dynamic: "mf" as const,
      },
      {
        direction: "down" as const,
        contactPoint: "sul-tasto" as const,
        portion: "half" as const,
        dynamic: "p" as const,
      },
      {
        direction: "up" as const,
        contactPoint: "sul-ponticello" as const,
        portion: "half" as const,
        dynamic: "f" as const,
      },
    ]

    const notes: ExerciseNote[] = patterns.map((bowing, index) => ({
      midi,
      frequency: midiToFrequency(midi),
      name: midiToNoteName(midi),
      duration: noteDuration,
      startTime: index * noteDuration,
      dynamic: bowing.dynamic,
      articulation: "tenuto",
      bowing,
      fingering: 0, // Open string
      position: 1,
    }))

    return {
      id: `bowing-drill-${difficulty}-${Date.now()}`,
      type: "bowing-drill",
      difficulty,
      name: "Ejercicio de Técnica de Arco",
      description: "Practica diferentes técnicas de arco en cuerda abierta",
      notes,
      tempo,
      timeSignature: "4/4",
      focusAreas: ["bowing", "tone-control", "bow-distribution"],
      estimatedDuration: notes[notes.length - 1].startTime + notes[notes.length - 1].duration,
      pedagogicalSource: "Sevcik Op. 2, No. 1",
    }
  }

  /**
   * Generates a rhythmic drill.
   * @param {string[]} rhythmPattern - The rhythm pattern.
   * @param {DifficultyLevel} difficulty - The difficulty of the exercise.
   * @returns {Exercise} - The generated exercise.
   */
  generateRhythmicDrill(rhythmPattern: string[], difficulty: DifficultyLevel): Exercise {
    const tempo = difficulty === "easy" ? 60 : difficulty === "medium" ? 80 : 100
    const baseDuration = 60000 / tempo // Quarter note

    const midi = 69 // A4
    const notes: ExerciseNote[] = []
    let currentTime = 0

    rhythmPattern.forEach((pattern) => {
      let duration = baseDuration
      let rhythmName = pattern

      switch (pattern) {
        case "quarter":
          duration = baseDuration
          break
        case "half":
          duration = baseDuration * 2
          break
        case "eighth":
          duration = baseDuration / 2
          break
        case "triplet":
          duration = baseDuration / 3
          rhythmName = "triplet"
          break
        case "dotted":
          duration = baseDuration * 1.5
          rhythmName = "dotted"
          break
        case "syncopated":
          duration = baseDuration * 0.75
          rhythmName = "syncopated"
          break
      }

      notes.push({
        midi,
        frequency: midiToFrequency(midi),
        name: midiToNoteName(midi),
        duration,
        startTime: currentTime,
        dynamic: "mf",
        articulation: "staccato",
        rhythmPattern: rhythmName,
        fingering: 0,
        position: 1,
      })

      currentTime += duration
    })

    return {
      id: `rhythm-drill-${difficulty}-${Date.now()}`,
      type: "rhythm-patterns",
      difficulty,
      name: "Ejercicio de Patrones Rítmicos",
      description: "Practica patrones rítmicos complejos",
      notes,
      tempo,
      timeSignature: "4/4",
      focusAreas: ["rhythm", "timing", "precision"],
      estimatedDuration: currentTime,
      pedagogicalSource: "Schradieck School of Violin Technique",
    }
  }

  /**
   * Generates adaptive recommendations based on the student's profile.
   * @param {StudentProfile} profile - The student's profile.
   * @returns {AdaptiveRecommendation[]} - The generated recommendations.
   */
  generateRecommendations(profile: StudentProfile): AdaptiveRecommendation[] {
    const cacheKey = `recommendations-${profile.id}-${profile.level}-${profile.weaknesses.join(",")}`

    return exerciseCache.getCachedExercise(cacheKey, () => {
      const recommendations: AdaptiveRecommendation[] = []
      const currentLevel = this.curriculumManager.getCurrentLevel(profile.level)

      // Analizar debilidades y generar ejercicios específicos
      if (profile.weaknesses.includes("poor-intonation")) {
        const exercise = this.generateIntonationDrill(69, "medium")
        recommendations.push({
          exercise,
          reason: "Tu entonación necesita mejorar. Este ejercicio te ayudará a desarrollar precisión.",
          priority: 10,
          estimatedImprovement: 15,
          focusAreas: ["intonation"],
        })
      }

      if (profile.weaknesses.includes("poor-bowing") || profile.weaknesses.includes("poor-attack")) {
        const exercise = this.generateBowingPatternDrill("medium")
        recommendations.push({
          exercise,
          reason: "La técnica de arco es fundamental. Este ejercicio mejorará tu control del arco.",
          priority: 9,
          estimatedImprovement: 12,
          focusAreas: ["bowing", "tone-control"],
        })
      }

      if (profile.weaknesses.includes("weak-scales")) {
        const exercise = this.generateScaleExercise("medium", "major", 1)
        recommendations.push({
          exercise,
          reason: "Las escalas son fundamentales. Practica esta escala para mejorar tu técnica.",
          priority: 9,
          estimatedImprovement: 12,
          focusAreas: ["scales", "finger-placement"],
        })
      }

      if (profile.weaknesses.includes("weak-rhythm")) {
        const exercise = this.generateRhythmicDrill(["quarter", "quarter", "eighth", "eighth", "quarter"], "medium")
        recommendations.push({
          exercise,
          reason: "La precisión rítmica es esencial. Este ejercicio mejorará tu sentido del tiempo.",
          priority: 8,
          estimatedImprovement: 10,
          focusAreas: ["rhythm", "timing"],
        })
      }

      if (profile.weaknesses.includes("weak-intervals")) {
        const exercise = this.generateIntervalsExercise("medium")
        recommendations.push({
          exercise,
          reason: "Mejorar tu reconocimiento de intervalos te ayudará con la lectura a primera vista.",
          priority: 8,
          estimatedImprovement: 10,
          focusAreas: ["intervals", "ear-training"],
        })
      }

      // Si no hay debilidades específicas, recomendar ejercicios de nivel apropiado
      if (recommendations.length === 0) {
        const difficulty = profile.level === "beginner" ? "easy" : profile.level === "intermediate" ? "medium" : "hard"

        recommendations.push({
          exercise: this.generateScaleExercise(difficulty, "major", 1),
          reason: "Continúa desarrollando tu técnica con escalas.",
          priority: 7,
          estimatedImprovement: 8,
          focusAreas: ["technique", "intonation"],
        })

        recommendations.push({
          exercise: this.generateIntervalsExercise(difficulty),
          reason: "Fortalece tu oído musical con práctica de intervalos.",
          priority: 6,
          estimatedImprovement: 7,
          focusAreas: ["ear-training"],
        })
      }

      // Ordenar por prioridad
      return recommendations.sort((a, b) => b.priority - a.priority)
    }) as unknown as AdaptiveRecommendation[]
  }
}
