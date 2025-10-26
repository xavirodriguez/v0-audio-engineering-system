"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Settings, Volume2, SkipBack, SkipForward, Circle, RotateCcw, Download } from "lucide-react"
import { usePitchDetection } from "@/hooks/use-pitch-detection"
import { useRecording } from "@/hooks/use-recording"
import { useAdaptiveExercises } from "@/hooks/use-adaptive-exercises"
import { motion, AnimatePresence } from "framer-motion"
import { RecordingPlayer } from "./recording-player"
import { ExerciseSelector } from "./exercise-selector"
import { DebugPanel } from "./debug-panel"
import { ScoreView } from "./score-view"
import { PitchIndicator } from "./pitch-indicator"

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
          <ScoreView
            notes={state.notes}
            currentNoteIndex={state.currentNoteIndex}
            isPlaying={isPlaying}
            practiceMode={practiceMode}
            status={state.status}
            accuracy={state.accuracy}
          />

          <PitchIndicator
            currentNote={currentNote}
            currentPitch={state.currentPitch}
            currentCents={state.currentCents}
            currentConfidence={state.currentConfidence}
            currentRms={state.currentRms}
            rmsThreshold={state.rmsThreshold}
          />
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

      {/* DEBUG PANEL */}
      <DebugPanel state={state} />

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
