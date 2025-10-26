"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, Settings, Circle } from "lucide-react"
import { usePitchDetection } from "@/hooks/use-pitch-detection"
import { useRecording } from "@/hooks/use-recording"
import { useState, useEffect } from "react"
import { midiToNoteName } from "@/lib/audio/note-utils"
import { RecordingPlayer } from "./recording-player"

export function Practice() {
  const { state, initialize, startCalibration, startDetection, stopDetection } = usePitchDetection()
  const { isRecording, currentRecording, startRecording, stopRecording, addPitchPoint, deleteRecording } =
    useRecording()
  const [isInitialized, setIsInitialized] = useState(false)
  const [showRecording, setShowRecording] = useState(false)

  const currentNote = state.notes[state.currentNoteIndex]
  const isPlaying = state.status === "PITCH_DETECTING" || state.status === "PITCH_STABLE"

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
        const recording = await stopRecording(undefined, "Sesión de Práctica")
        if (recording) {
          setShowRecording(true)
        }
      }
    } else {
      startDetection()
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      startRecording(stream)
    }
  }

  const getPitchIndicatorColor = () => {
    if (state.currentRms < state.rmsThreshold) return "bg-muted"

    const absCents = Math.abs(state.currentCents)
    if (absCents < 10) return "bg-green-500"
    if (absCents < 25) return "bg-yellow-500"
    if (absCents < 50) return "bg-orange-500"
    return "bg-red-500"
  }

  const getPitchIndicatorPosition = () => {
    const clampedCents = Math.max(-50, Math.min(50, state.currentCents))
    return (clampedCents / 50) * 50
  }

  return (
    <section id="practica" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Práctica interactiva en tiempo real
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Nuestra tecnología de detección de pitch analiza tu interpretación y te proporciona retroalimentación
            instantánea.
          </p>
        </div>

        <div className="max-w-5xl mx-auto space-y-6">
          <Card className="border-border bg-card shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-serif text-2xl">Sesión de Práctica</CardTitle>
                <div className="flex items-center gap-2">
                  {isRecording && (
                    <div className="flex items-center gap-2 text-red-600 animate-pulse">
                      <Circle className="w-3 h-3 fill-current" />
                      <span className="text-sm font-medium">Grabando</span>
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    {state.status === "IDLE" && "Listo para comenzar"}
                    {state.status === "CALIBRATING" && "Calibrando..."}
                    {state.status === "PITCH_DETECTING" && "Escuchando..."}
                    {state.status === "PITCH_STABLE" && "¡Afinado!"}
                    {state.status === "ERROR" && "Error"}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      if (!isInitialized) {
                        await initialize()
                        setIsInitialized(true)
                      }
                      startCalibration()
                    }}
                    disabled={state.status === "CALIBRATING"}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Calibrar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border border-border relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-accent/50 -translate-x-1/2" />

                  <div className="flex items-center gap-8">
                    {state.notes.map((note, index) => {
                      const isCurrent = index === state.currentNoteIndex
                      const isPast = index < state.currentNoteIndex

                      return (
                        <div
                          key={index}
                          className={`flex flex-col items-center gap-2 transition-all duration-300 ${
                            isCurrent ? "scale-125" : "scale-100"
                          } ${isPast ? "opacity-30" : "opacity-100"}`}
                        >
                          <div
                            className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg transition-colors ${
                              isPast
                                ? "bg-green-500/20 text-green-600"
                                : isCurrent
                                  ? "bg-accent text-accent-foreground"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {note.name}
                          </div>
                          {isCurrent && state.status === "PITCH_STABLE" && (
                            <div className="text-xs text-green-600 font-semibold animate-pulse">¡Mantén!</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-center text-sm text-muted-foreground">Indicador de Afinación</div>
                <div className="relative h-12 bg-muted rounded-lg overflow-hidden">
                  <div className="absolute inset-y-0 left-1/2 w-1/4 -translate-x-1/2 bg-green-500/10" />
                  <div className="absolute inset-y-0 left-1/2 w-0.5 bg-foreground/20 -translate-x-1/2" />
                  <div
                    className={`absolute inset-y-0 w-2 transition-all duration-100 ${getPitchIndicatorColor()}`}
                    style={{
                      left: `calc(50% + ${getPitchIndicatorPosition()}%)`,
                      transform: "translateX(-50%)",
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-between px-4 text-xs text-muted-foreground">
                    <span>-50¢</span>
                    <span>0¢</span>
                    <span>+50¢</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-border bg-background">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-foreground mb-1">{state.accuracy}%</div>
                      <div className="text-sm text-muted-foreground">Progreso</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border bg-background">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-foreground mb-1">{currentNote?.name || "--"}</div>
                      <div className="text-sm text-muted-foreground">Nota Objetivo</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border bg-background">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-foreground mb-1">
                        {state.currentPitch > 0
                          ? midiToNoteName(Math.round(69 + 12 * Math.log2(state.currentPitch / 440)))
                          : "--"}
                      </div>
                      <div className="text-sm text-muted-foreground">Detectado</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border bg-background">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div
                        className={`text-3xl font-bold mb-1 ${
                          Math.abs(state.currentCents) < 10
                            ? "text-green-600"
                            : Math.abs(state.currentCents) < 25
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {state.currentCents > 0 ? "+" : ""}
                        {Math.round(state.currentCents)}
                      </div>
                      <div className="text-sm text-muted-foreground">Cents</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex items-center justify-center gap-4">
                <Button size="lg" className="w-32 h-16 text-lg" onClick={handleStart}>
                  {isPlaying ? (
                    <>
                      <Pause className="w-6 h-6 mr-2" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className="w-6 h-6 mr-2" />
                      {isInitialized ? "Comenzar" : "Iniciar"}
                    </>
                  )}
                </Button>
              </div>

              {state.totalLatencyOffsetMs > 0 && (
                <div className="text-center text-xs text-muted-foreground">
                  Latencia del sistema: {Math.round(state.totalLatencyOffsetMs)}ms
                </div>
              )}
            </CardContent>
          </Card>

          {showRecording && currentRecording && (
            <RecordingPlayer
              recording={currentRecording}
              onDelete={(id) => {
                deleteRecording(id)
                setShowRecording(false)
              }}
            />
          )}
        </div>
      </div>
    </section>
  )
}
