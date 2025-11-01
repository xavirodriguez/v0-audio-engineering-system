"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { usePitchDetection } from "@/hooks/use-pitch-detection"
import { useRecording } from "@/hooks/use-recording"
import { useAdaptiveExercises } from "@/hooks/use-adaptive-exercises"
import { usePracticeState } from "@/hooks/use-practice-state"
import { useRecordingSync } from "@/hooks/use-recording-sync"
import { DebugPanel } from "./debug-panel"
import { ScoreView } from "./score-view"
import { PitchIndicator } from "./pitch-indicator"
import { SheetMusicRenderer } from "./sheet-music-renderer"
import { PracticeHeader } from "./practice/practice-header"
import { SettingsPanel } from "./practice/settings-panel"
import { PracticeControls } from "./practice/practice-controls"
import { ModalManager } from "./practice/modal-manager"

export function InteractivePractice() {
  const { state, initialize, startCalibration, startDetection, stopDetection } = usePitchDetection()
  const { isRecording, currentRecording, startRecording, stopRecording, addPitchPoint, deleteRecording } =
    useRecording()
  const { currentExercise, recommendations, selectExercise } = useAdaptiveExercises()
  const practiceState = usePracticeState()

  const [isInitialized, setIsInitialized] = useState(false)

  useRecordingSync({
    isRecording,
    currentPitch: state.currentPitch,
    currentCents: state.currentCents,
    currentConfidence: state.currentConfidence,
    currentRms: state.currentRms,
    addPitchPoint,
  })

  const isPlaying = state.status === "PITCH_DETECTING" || state.status === "PITCH_STABLE"

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
          practiceState.setShowRecording(true)
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

  const handleSelectExercise = (exerciseId: string) => {
    const exercise = recommendations.find((r) => r.exercise.id === exerciseId)?.exercise
    if (exercise) {
      selectExercise(exercise)
    }
    practiceState.setShowExercises(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex flex-col">
      <PracticeHeader
        exerciseName={currentExercise?.name}
        status={state.status}
        isRecording={isRecording}
        viewMode={practiceState.viewMode}
        showSettings={practiceState.showSettings}
        onViewModeToggle={practiceState.toggleViewMode}
        onExercisesClick={() => practiceState.setShowExercises(true)}
        onCalibrateClick={handleCalibrate}
        onSettingsToggle={practiceState.toggleSettings}
      />

      <SettingsPanel
        visible={practiceState.showSettings}
        sensitivity={practiceState.sensitivity}
        tempo={practiceState.tempo}
        volume={practiceState.volume}
        practiceMode={practiceState.practiceMode}
        onSensitivityChange={practiceState.setSensitivity}
        onTempoChange={practiceState.setTempo}
        onVolumeChange={practiceState.setVolume}
        onPracticeModeChange={practiceState.setPracticeMode}
      />

      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="border-border bg-card/80 backdrop-blur-sm shadow-2xl overflow-hidden">
          {practiceState.viewMode === "animated" ? (
            <ScoreView
              notes={state.notes}
              currentNoteIndex={state.currentNoteIndex}
              isPlaying={isPlaying}
              practiceMode={practiceState.practiceMode}
              status={state.status}
              accuracy={state.accuracy}
            />
          ) : currentExercise ? (
            <div className="p-6">
              <SheetMusicRenderer exercise={currentExercise} currentNoteIndex={state.currentNoteIndex} />
            </div>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              <p>Selecciona un ejercicio para ver la partitura</p>
            </div>
          )}

          <PitchIndicator
            currentNote={state.notes[state.currentNoteIndex]}
            currentPitch={state.currentPitch}
            currentCents={state.currentCents}
            currentConfidence={state.currentConfidence}
            currentRms={state.currentRms}
            rmsThreshold={state.rmsThreshold}
          />
        </Card>
      </main>

      <PracticeControls
        isPlaying={isPlaying}
        isInitialized={isInitialized}
        latency={state.totalLatencyOffsetMs}
        hasRecording={!!currentRecording}
        onStartStop={handleStart}
        onViewRecording={() => practiceState.setShowRecording(true)}
      />

      <DebugPanel state={state} />

      <ModalManager
        showRecording={practiceState.showRecording}
        showExercises={practiceState.showExercises}
        currentRecording={currentRecording}
        recommendations={recommendations}
        onCloseRecording={() => practiceState.setShowRecording(false)}
        onCloseExercises={() => practiceState.setShowExercises(false)}
        onDeleteRecording={(id) => {
          deleteRecording(id)
          practiceState.setShowRecording(false)
        }}
        onSelectExercise={handleSelectExercise}
      />
    </div>
  )
}
