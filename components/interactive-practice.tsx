"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { audioManager } from "@/lib/audio/audio-resource-manager"
import { usePitchDetection } from "@/hooks/use-pitch-detection"
import { useRecording } from "@/hooks/use-recording"
import { useAdaptiveExercises } from "@/hooks/use-adaptive-exercises"
import { usePracticeState } from "@/hooks/use-practice-state"
import { useRecordingSync } from "@/hooks/use-recording-sync"
import { DebugPanel } from "@/components/debug-panel"
import { PracticeHeader } from "@/components/practice/practice-header"
import { SettingsPanel } from "@/components/practice/settings-panel"
import { PracticeControls } from "@/components/practice/practice-controls"
import { PracticeModalManager } from "@/components/practice/practice-modal-manager"
import { TunerDisplay } from "@/components/practice/tuner-display"
import { MusicalStaff } from "@/components/practice/musical-staff"

/**
 * A component that provides an interactive practice session for the user.
 * This component has been refactored to act as a container, orchestrating
 * the interactions between smaller, more focused child components.
 */
export function InteractivePractice() {
  const { state, initialize, startCalibration, startDetection, stopDetection, mediaStream } = usePitchDetection()
  const { isRecording, stopRecording, startRecording, addPitchPoint } = useRecording()
  const { currentExercise } = useAdaptiveExercises()
  const practiceState = usePracticeState()

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

  const handleStart = async () => {
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
  }

  const handleCalibrate = async () => {
    if (!isInitialized) {
      await initialize()
      setIsInitialized(true)
    }
    startCalibration()
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
          <MusicalStaff />
          <TunerDisplay />
        </Card>
      </main>

      <PracticeControls
        isPlaying={isPlaying}
        isInitialized={isInitialized}
        latency={state.totalLatencyOffsetMs}
        hasRecording={!!useRecording().currentRecording}
        onStartStop={handleStart}
        onViewRecording={() => practiceState.setShowRecording(true)}
      />

      <DebugPanel state={state} />

      <PracticeModalManager />
    </div>
  )
}
