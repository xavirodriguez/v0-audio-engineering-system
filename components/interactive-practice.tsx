"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { audioManager } from "@/lib/audio/audio-resource-manager"
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
import { Fretboard } from "./practice/fretboard";
import { FeedbackOverlay } from "./feedback/feedback-overlay";
import { useFeedbackNotifications } from "@/hooks/ui/use-feedback-notifications";
import { TuningFeedbackIndicator } from "./feedback/TuningFeedbackIndicator";
import { ProgressFeedback } from "./feedback/ProgressFeedback";
import { ScalePractice } from "./practice/scale-practice";

/**
 * A component that provides an interactive practice session for the user.
 * @returns {JSX.Element} - The rendered interactive practice component.
 */
export function InteractivePractice() {
  const { state, initialize, startCalibration, startDetection, stopDetection, mediaStream } = usePitchDetection()
  const { isRecording, currentRecording, startRecording, stopRecording, addPitchPoint, deleteRecording } =
    useRecording()
  const { currentExercise, recommendations, selectExercise } = useAdaptiveExercises()
  const practiceState = usePracticeState()
  const { notifications, onExit } = useFeedbackNotifications()

  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    return () => {
      audioManager.dispose()
    }
  }, [])

  useRecordingSync({
    isRecording,
    currentPitch: state.currentPitch,
    currentCents: state.currentCents,
    currentConfidence: state.currentConfidence,
    currentRms: state.currentRms,
    addPitchPoint,
  })

  const isPlaying = state.status === "PITCH_DETECTING" || state.status === "PITCH_STABLE"

  const handleStart = useCallback(async () => {
    if (!isInitialized) {
      await initialize()
      setIsInitialized(true)
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
      if (mediaStream) {
        startDetection()
        startRecording(mediaStream, currentExercise?.id, currentExercise?.name)
      }
    }
  }, [isInitialized, initialize, isPlaying, stopDetection, isRecording, stopRecording, currentExercise, practiceState, mediaStream, startDetection, startRecording])

  const handleCalibrate = useCallback(async () => {
    if (!isInitialized) {
      await initialize()
      setIsInitialized(true)
    }
    startCalibration()
  }, [isInitialized, initialize, startCalibration])

  const handleSelectExercise = useCallback((exerciseId: string) => {
    const exercise = recommendations.find((r) => r.exercise.id === exerciseId)?.exercise
    if (exercise) {
      selectExercise(exercise)
    }
    practiceState.setShowExercises(false)
  }, [recommendations, selectExercise, practiceState])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex flex-col">
      <PracticeHeader
        exerciseName={currentExercise?.name}
        viewMode={practiceState.viewMode}
        showSettings={practiceState.showSettings}
        onViewModeToggle={practiceState.toggleViewMode}
        onExercisesClick={() => practiceState.setShowExercises(true)}
        onCalibrateClick={handleCalibrate}
        onSettingsToggle={practiceState.toggleSettings}
      />

      <SettingsPanel />

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
          <div className="p-4 sm:p-6">
            <Fretboard currentPitch={state.currentPitch} />
          </div>
        </Card>

        {/* Container for the new feedback components */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <TuningFeedbackIndicator />
            <ProgressFeedback />
        </div>

        <div className="mt-8">
          <ScalePractice />
        </div>
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

      <FeedbackOverlay notifications={notifications} onExit={onExit} />
    </div>
  )
}
