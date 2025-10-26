"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Settings, Volume2, SkipBack, SkipForward, Circle, RotateCcw, Download } from "lucide-react"
import { usePitchDetection } from "@/hooks/use-pitch-detection"
import { useRecording } from "@/hooks/use-recording"
import { useAdaptiveExercises } from "@/hooks/use-adaptive-exercises"
import { midiToNoteName } from "@/lib/audio/note-utils"
import { motion, AnimatePresence } from "framer-motion"
import { RecordingPlayer } from "./recording-player"
import { ExerciseSelector } from "./exercise-selector"

export function InteractivePractice() {
  const { state, initialize, startCalibration, startDetection, stopDetection } = usePitchDetection()
  const { isRecording, currentRecording, startRecording, stopRecording, addPitchPoint, deleteRecording } =
    useRecording()
  const { currentExercise, selectExercise } = useAdaptiveExercises()

  const [isInitialized, setIsInitialized] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showRecording, setShowRecording] = useState(false)
  const [showExercises, setShowExercises] = useState(false)
  const [volume, setVolume] = useState([80])
  const [tempo, setTempo] = useState([100])
  const [sensitivity, setSensitivity] = useState([5])
  const [practiceMode, setPracticeMode] = useState<"step-by-step" | "continuous">("step-by-step")

  const isPlaying = state.status === "PITCH_DETECTING" || state.status === "PITCH_STABLE"
  const currentNote = state.notes[state.currentNoteIndex]

  // Sincronizar pitch data con grabación
  useEffect(() => {
    if (isRecording && state.currentPitch > 0) {
      addPitchPoint(state.currentPitch, state.currentCents, state.currentConfidence, state.currentRms)
    }
  }, [state.currentPitch, state.currentCents, state.currentConfidence, state.currentRms, isRecording, addPitchPoint])

  const handleStart = async () => {
    if (!isInitialized) {
      await initialize()
      setIsInitialized(true)
      return
    }

    if (isPlaying) {
      stopDetection()
      if (isRecording) {
        const recording = await stopRecording(currentExercise?.id, currentExercise?.name || "Sesión de Práctica")
        if (recording) {
          setShowRecording(true)
        }
      }
    } else {
      startDetection()
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      startRecording(stream, currentExercise?.id, currentExercise?.name)
    }
  }

  const handleCalibrate = async () => {
    if (!isInitialized) {
      await initialize()
      setIsInitialized(true)
    }
    startCalibration()
  }

  const getPitchIndicatorColor = () => {
    if (state.currentRms < state.rmsThreshold) return "bg-muted"

    const absCents = Math.abs(state.currentCents)
    if (absCents < 10) return "bg-emerald-500"
    if (absCents < 25) return "bg-yellow-500"
    if (absCents < 50) return "bg-orange-500"
    return "bg-red-500"
  }

  const getPitchIndicatorPosition = () => {
    const clampedCents = Math.max(-50, Math.min(50, state.currentCents))
    return (clampedCents / 50) * 50
  }

  const getStatusText = () => {
    switch (state.status) {
      case "IDLE":
        return "Listo para comenzar"
      case "CALIBRATING":
        return "Calibrando sistema..."
      case "PITCH_DETECTING":
        return "Escuchando tu interpretación"
      case "PITCH_STABLE":
        return "¡Perfecto! Mantén la nota"
      case "ERROR":
        return "Error en el sistema"
      default:
        return ""
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex flex-col">
      {/* HEADER */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="font-serif text-2xl font-bold text-foreground">
                {currentExercise?.name || "Práctica Libre"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">{getStatusText()}</p>
            </div>

            <div className="flex items-center gap-2">
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 text-red-600 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-950/30"
                >
                  <Circle className="w-3 h-3 fill-current animate-pulse" />
                  <span className="text-sm font-medium">Grabando</span>
                </motion.div>
              )}

              <Button variant="outline" size="sm" onClick={() => setShowExercises(true)}>
                Ejercicios
              </Button>

              <Button variant="outline" size="icon" onClick={handleCalibrate} disabled={state.status === "CALIBRATING"}>
                <RotateCcw className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
                className={showSettings ? "bg-accent" : ""}
              >
                <Settings className="w-4 h-4" />
              </Button>

              <Button variant="outline" size="icon">
                <Volume2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* SETTINGS PANEL */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-border bg-card/50 backdrop-blur-sm overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Sensibilidad de Pitch</label>
                  <Slider
                    value={sensitivity}
                    onValueChange={setSensitivity}
                    min={1}
                    max={10}
                    step={1}
                    className="mb-2"
                  />
                  <p className="text-xs text-muted-foreground">Nivel: {sensitivity[0]}/10</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Tempo</label>
                  <Slider value={tempo} onValueChange={setTempo} min={60} max={180} step={5} className="mb-2" />
                  <p className="text-xs text-muted-foreground">{tempo[0]} BPM</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Volumen</label>
                  <Slider value={volume} onValueChange={setVolume} min={0} max={100} step={1} className="mb-2" />
                  <p className="text-xs text-muted-foreground">{volume[0]}%</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <label className="text-sm font-medium text-foreground">Modo de Práctica:</label>
                <div className="flex gap-2">
                  <Button
                    variant={practiceMode === "step-by-step" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPracticeMode("step-by-step")}
                  >
                    Paso a Paso
                  </Button>
                  <Button
                    variant={practiceMode === "continuous" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPracticeMode("continuous")}
                  >
                    Continuo
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN PRACTICE AREA */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="border-border bg-card/80 backdrop-blur-sm shadow-2xl overflow-hidden">
          {/* SCORE VIEW - Interactive Timeline */}
          <div className="relative h-[400px] bg-gradient-to-b from-muted/30 to-muted/10 overflow-hidden">
            {/* Center detection line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-accent shadow-lg shadow-accent/50 z-20 -translate-x-1/2" />

            {/* Horizontal reference line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border/30 -translate-y-1/2" />

            {/* Animated notes timeline */}
            <div className="absolute inset-0 flex items-center">
              <motion.div
                className="flex items-center gap-16 px-8"
                animate={{
                  x: isPlaying && practiceMode === "continuous" ? [0, -800] : 0,
                }}
                transition={{
                  duration: 8,
                  repeat: isPlaying && practiceMode === "continuous" ? Number.POSITIVE_INFINITY : 0,
                  ease: "linear",
                }}
              >
                {state.notes.map((note, index) => {
                  const isCurrent = index === state.currentNoteIndex
                  const isPast = index < state.currentNoteIndex
                  const isFuture = index > state.currentNoteIndex

                  return (
                    <motion.div
                      key={index}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{
                        scale: isCurrent ? 1.3 : 1,
                        opacity: isPast ? 0.3 : 1,
                        y: isCurrent ? -10 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center gap-3 relative"
                    >
                      {/* Note circle */}
                      <div
                        className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-xl shadow-lg transition-all duration-300 ${
                          isPast
                            ? "bg-emerald-500/20 text-emerald-600 border-2 border-emerald-500/50"
                            : isCurrent
                              ? "bg-accent text-accent-foreground border-4 border-accent shadow-accent/50"
                              : "bg-muted text-muted-foreground border-2 border-border"
                        }`}
                      >
                        {note.name}
                      </div>

                      {/* Frequency label */}
                      <div className="text-xs text-muted-foreground font-mono">{Math.round(note.frequency)} Hz</div>

                      {/* Current note indicator */}
                      {isCurrent && state.status === "PITCH_STABLE" && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -bottom-8 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full"
                        >
                          ¡Mantén!
                        </motion.div>
                      )}

                      {/* Connection line to next note */}
                      {index < state.notes.length - 1 && (
                        <div className="absolute left-full top-1/2 w-16 h-0.5 bg-border/50 -translate-y-1/2" />
                      )}
                    </motion.div>
                  )
                })}
              </motion.div>
            </div>

            {/* Progress indicator */}
            <div className="absolute top-4 left-4 right-4 z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Progreso</span>
                <span className="text-sm font-bold text-accent">{state.accuracy}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-accent to-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${state.accuracy}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>

          {/* PITCH INDICATOR */}
          <div className="p-6 border-t border-border bg-card/50">
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-sm font-medium text-muted-foreground mb-2">Indicador de Afinación</div>
                <div className="relative h-16 bg-muted rounded-xl overflow-hidden shadow-inner">
                  {/* Green zone (perfect pitch) */}
                  <div className="absolute inset-y-0 left-1/2 w-1/4 -translate-x-1/2 bg-emerald-500/10" />

                  {/* Center line */}
                  <div className="absolute inset-y-0 left-1/2 w-1 bg-foreground/20 -translate-x-1/2" />

                  {/* Pitch needle */}
                  <motion.div
                    className={`absolute inset-y-0 w-3 rounded-full transition-colors duration-100 ${getPitchIndicatorColor()}`}
                    animate={{
                      left: `calc(50% + ${getPitchIndicatorPosition()}%)`,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    style={{
                      transform: "translateX(-50%)",
                      boxShadow: "0 0 20px currentColor",
                    }}
                  />

                  {/* Scale markers */}
                  <div className="absolute inset-0 flex items-center justify-between px-4 text-xs text-muted-foreground font-mono">
                    <span>-50¢</span>
                    <span>-25¢</span>
                    <span className="font-bold">0¢</span>
                    <span>+25¢</span>
                    <span>+50¢</span>
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-border bg-background/50 p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground mb-1">{currentNote?.name || "--"}</div>
                    <div className="text-xs text-muted-foreground">Nota Objetivo</div>
                  </div>
                </Card>

                <Card className="border-border bg-background/50 p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground mb-1">
                      {state.currentPitch > 0
                        ? midiToNoteName(Math.round(69 + 12 * Math.log2(state.currentPitch / 440)))
                        : "--"}
                    </div>
                    <div className="text-xs text-muted-foreground">Detectado</div>
                  </div>
                </Card>

                <Card className="border-border bg-background/50 p-4">
                  <div className="text-center">
                    <div
                      className={`text-3xl font-bold mb-1 ${
                        Math.abs(state.currentCents) < 10
                          ? "text-emerald-600"
                          : Math.abs(state.currentCents) < 25
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {state.currentCents > 0 ? "+" : ""}
                      {Math.round(state.currentCents)}¢
                    </div>
                    <div className="text-xs text-muted-foreground">Desviación</div>
                  </div>
                </Card>

                <Card className="border-border bg-background/50 p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground mb-1">
                      {Math.round(state.currentConfidence * 100)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Confianza</div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </Card>
      </main>

      {/* FOOTER CONTROLS */}
      <footer className="border-t border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" disabled>
                <SkipBack className="w-4 h-4" />
              </Button>

              <Button size="lg" className="w-32 h-12 text-lg font-semibold" onClick={handleStart}>
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    {isInitialized ? "Comenzar" : "Iniciar"}
                  </>
                )}
              </Button>

              <Button variant="outline" size="icon" disabled>
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-4">
              {state.totalLatencyOffsetMs > 0 && (
                <div className="text-xs text-muted-foreground font-mono">
                  Latencia: {Math.round(state.totalLatencyOffsetMs)}ms
                </div>
              )}

              {currentRecording && (
                <Button variant="outline" size="sm" onClick={() => setShowRecording(true)}>
                  <Download className="w-4 h-4 mr-2" />
                  Ver Grabación
                </Button>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <AnimatePresence>
        {showRecording && currentRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRecording(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl"
            >
              <RecordingPlayer
                recording={currentRecording}
                onDelete={(id) => {
                  deleteRecording(id)
                  setShowRecording(false)
                }}
              />
            </motion.div>
          </motion.div>
        )}

        {showExercises && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowExercises(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl"
            >
              <ExerciseSelector
                onSelect={(exercise) => {
                  selectExercise(exercise)
                  setShowExercises(false)
                }}
                onClose={() => setShowExercises(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
