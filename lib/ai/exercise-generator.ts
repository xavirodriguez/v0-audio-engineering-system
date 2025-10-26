import type {
  Exercise,
  DifficultyLevel,
  ExerciseNote,
  StudentProfile,
  AdaptiveRecommendation,
} from "@/lib/types/exercise-system"
import { midiToFrequency, midiToNoteName } from "@/lib/audio/note-utils"

export class ExerciseGenerator {
  // Generar ejercicio de cuerdas abiertas
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

  // Generar escala
  generateScaleExercise(difficulty: DifficultyLevel, key: "major" | "minor" = "major"): Exercise {
    const tempo = difficulty === "easy" ? 60 : difficulty === "medium" ? 80 : difficulty === "hard" ? 100 : 120

    // Escala de La mayor (A major) - una octava
    const majorScale = [69, 71, 73, 74, 76, 78, 80, 81] // A4 a A5
    const minorScale = [69, 71, 72, 74, 76, 77, 79, 81] // A minor natural

    const scale = key === "major" ? majorScale : minorScale
    const noteDuration = (60000 / tempo) * (difficulty === "easy" ? 2 : 1) // Blancas o negras

    const notes: ExerciseNote[] = []
    let currentTime = 0

    // Ascendente
    scale.forEach((midi) => {
      notes.push({
        midi,
        frequency: midiToFrequency(midi),
        name: midiToNoteName(midi),
        duration: noteDuration,
        startTime: currentTime,
        dynamic: "mf",
        articulation: "legato",
      })
      currentTime += noteDuration
    })

    // Descendente
    for (let i = scale.length - 2; i >= 0; i--) {
      const midi = scale[i]
      notes.push({
        midi,
        frequency: midiToFrequency(midi),
        name: midiToNoteName(midi),
        duration: noteDuration,
        startTime: currentTime,
        dynamic: "mf",
        articulation: "legato",
      })
      currentTime += noteDuration
    }

    return {
      id: `scale-${key}-${difficulty}-${Date.now()}`,
      type: "scales",
      difficulty,
      name: `Escala de La ${key === "major" ? "Mayor" : "Menor"}`,
      description: `Practica la escala de La ${key === "major" ? "mayor" : "menor"} en una octava`,
      notes,
      tempo,
      timeSignature: "4/4",
      focusAreas: ["intonation", "finger-placement", "smooth-transitions"],
      estimatedDuration: currentTime,
    }
  }

  // Generar ejercicio de intervalos
  generateIntervalsExercise(difficulty: DifficultyLevel): Exercise {
    const tempo = difficulty === "easy" ? 60 : difficulty === "medium" ? 80 : 100
    const noteDuration = (60000 / tempo) * 2

    // Intervalos desde A4
    const intervals = [
      [69, 71], // Segunda mayor
      [69, 73], // Tercera mayor
      [69, 74], // Cuarta justa
      [69, 76], // Quinta justa
      [69, 78], // Sexta mayor
      [69, 80], // Séptima mayor
      [69, 81], // Octava
    ]

    const notes: ExerciseNote[] = []
    let currentTime = 0

    intervals.forEach(([note1, note2]) => {
      // Primera nota
      notes.push({
        midi: note1,
        frequency: midiToFrequency(note1),
        name: midiToNoteName(note1),
        duration: noteDuration,
        startTime: currentTime,
        dynamic: "mf",
        articulation: "tenuto",
      })
      currentTime += noteDuration

      // Segunda nota
      notes.push({
        midi: note2,
        frequency: midiToFrequency(note2),
        name: midiToNoteName(note2),
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

  // Generar ejercicio de entonación (drill)
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

  // Generar recomendaciones adaptativas basadas en el perfil del estudiante
  generateRecommendations(profile: StudentProfile): AdaptiveRecommendation[] {
    const recommendations: AdaptiveRecommendation[] = []

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

    if (profile.weaknesses.includes("weak-scales")) {
      const exercise = this.generateScaleExercise("medium", "major")
      recommendations.push({
        exercise,
        reason: "Las escalas son fundamentales. Practica esta escala para mejorar tu técnica.",
        priority: 9,
        estimatedImprovement: 12,
        focusAreas: ["scales", "finger-placement"],
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
        exercise: this.generateScaleExercise(difficulty, "major"),
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
  }
}
