"use client"

import { useState, useEffect } from "react"
import { audioManager } from "@/lib/audio/audio-resource-manager"
import { usePitchDetectionStore, useCurrentPitch, useCurrentCents, useCurrentConfidence, useCurrentRms, useTunerStatus, useTargetNote } from "@/lib/store/pitch-detection-store"
import { useRecording } from "@/hooks/use-recording"
import { useRecordingSync } from "@/hooks/use-recording-sync"
import { useExerciseContext } from "@/contexts/ExerciseContext"
import { useUIStateContext } from "@/contexts/UIStateContext"
import { PracticeView } from "./PracticeView"

export function PracticeContainer() {
  // Direct state access from Zustand
  const { notes, currentNoteIndex, accuracy, totalLatencyOffsetMs, initialize, startCalibration, startDetection, stopDetection, mediaStream, rmsThreshold } = usePitchDetectionStore(
    (state) => ({
      notes: state.notes,
      currentNoteIndex: state.currentNoteIndex,
      accuracy: state.accuracy,
      totalLatencyOffsetMs: state.totalLatencyOffsetMs,
      initialize: state.initialize,
      startCalibration: state.startCalibration,
      startDetection: state.startDetection,
      stopDetection: state.stopDetection,
      mediaStream: state.mediaStream,
      rmsThreshold: state.rmsThreshold,
    })
  );

  // Granular selectors for high-frequency updates
  const currentPitch = useCurrentPitch();
  const currentCents = useCurrentCents();
  const currentConfidence = useCurrentConfidence();
  const currentRms = useCurrentRms();
  const status = useTunerStatus();
  const currentNote = useTargetNote();

  const { isRecording, currentRecording, startRecording, stopRecording, addPitchPoint, deleteRecording } =
    useRecording()

  const { currentExercise, selectExercise, recommendations } = useExerciseContext();
  const { openModal, closeModal, activeModal, isSettingsPanelVisible, toggleSettingsPanel } = useUIStateContext();

  const [isInitialized, setIsInitialized] = useState(false)
  const [practiceState, setPracticeState] = useState({
    viewMode: "animated",
    practiceMode: "untimed",
    sensitivity: 0.5,
    tempo: 120,
    volume: 0.5,
  })

  useEffect(() => {
    return () => {
      audioManager.dispose()
    }
  }, [])

  useRecordingSync({
    isRecording,
    currentPitch,
    currentCents,
    currentConfidence,
    currentRms,
    addPitchPoint,
  })

  const isPlaying = status === "PITCH_DETECTING" || status === "PITCH_STABLE"

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
          openModal("recording")
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

  const handleSelectExercise = (exerciseId: string) => {
    const exercise = recommendations.find((r) => r.exercise.id === exerciseId)?.exercise
    if (exercise) {
      selectExercise(exercise)
    }
    closeModal()
  }

  const handlePracticeStateChange = (newState) => {
    setPracticeState(prevState => ({ ...prevState, ...newState }))
  }

  return (
    <PracticeView
      notes={notes}
      currentNoteIndex={currentNoteIndex}
      accuracy={accuracy}
      totalLatencyOffsetMs={totalLatencyOffsetMs}
      currentPitch={currentPitch}
      currentCents={currentCents}
      currentConfidence={currentConfidence}
      currentRms={currentRms}
      status={status}
      currentNote={currentNote}
      isRecording={isRecording}
      currentRecording={currentRecording}
      recommendations={recommendations}
      isInitialized={isInitialized}
      isPlaying={isPlaying}
      practiceState={practiceState}
      onPracticeStateChange={handlePracticeStateChange}
      handleStart={handleStart}
      handleCalibrate={handleCalibrate}
      handleSelectExercise={handleSelectExercise}
      deleteRecording={deleteRecording}
      rmsThreshold={rmsThreshold}
      activeModal={activeModal}
      openModal={openModal}
      closeModal={closeModal}
      isSettingsPanelVisible={isSettingsPanelVisible}
      toggleSettingsPanel={toggleSettingsPanel}
    />
  )
}
