"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { usePitchDetection } from "@/hooks/use-pitch-detection";
import { useRecording } from "@/hooks/use-recording";
import { useAdaptiveExercises } from "@/hooks/use-adaptive-exercises";
import { usePracticeState } from "@/hooks/use-practice-state";
import { PitchIndicator } from "./pitch-indicator";
import { SheetMusicRenderer } from "./sheet-music-renderer";
import { PracticeHeader } from "./practice/practice-header";
import { SettingsPanel } from "./practice/settings-panel";
import { PracticeControls } from "./practice/practice-controls";
import { ModalManager } from "./practice/modal-manager";
import { Fretboard } from "./practice/fretboard";
import { FeedbackManager } from "./feedback/feedback-manager";
import { MusicalNote } from "@/lib/domains";
import { DebugPanel } from "./debug-panel";
import { useExerciseStore } from "@/lib/store/exercise-store"; // o donde esté tu store

/**
 * A component that provides an interactive practice session for the user.
 * @returns {JSX.Element} - The rendered interactive practice component.
 */
export function InteractivePractice({ locale: _locale }: { locale: string }) {
  const {
    isRecording,
    currentRecording,
    startRecording,
    stopRecording,
    addPitchPoint,
    deleteRecording,
  } = useRecording();
  const {
    currentExercise,
    recommendations,
    selectExercise,
    currentNoteIndex,
    advanceToNextNote,
    startExercise,
  } = useExerciseStore()

  const [targetNote, setTargetNote] = useState(
    MusicalNote.fromNoteName("A", 4),
  )

  const handleNoteCompleted = useCallback(() => {
    advanceToNextNote()
  }, [advanceToNextNote])

  const {
    currentState,
    currentPerformance,
    feedback,
    initialize,
    startDetection,
    stopDetection,
  } = usePitchDetection({
    addPitchPoint: isRecording ? addPitchPoint : undefined,
    targetNote,
    onNoteCompleted: handleNoteCompleted,
  })

  useAdaptiveExercises({
    store: useExerciseStore(),
    autoInitialize: true, // Inicializa automáticamente
    onInitError: (error) =>
      console.error("Error inicializando ejercicios:", error),
  })

  const practiceState = usePracticeState()

  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (currentExercise) {
      const note = currentExercise.notes[currentNoteIndex]
      if (note) {
        setTargetNote(MusicalNote.fromNoteName(note.noteName, note.octave))
      }
    }
  }, [currentExercise, currentNoteIndex])

  const isPlaying = currentState === "LISTENING";

  const handleInitialize = useCallback(async () => {
    if (!isInitialized) {
      await initialize();
      setIsInitialized(true);
    }
  }, [isInitialized, initialize]);

  const handleStart = useCallback(async () => {
    await handleInitialize();

    if (isPlaying) {
      stopDetection();
      if (isRecording) {
        stopRecording(
          currentExercise?.id,
          currentExercise?.name || "Sesión de Práctica",
        )
      }
    } else {
      startDetection()
      if (currentExercise) {
        startExercise()
      }
      startRecording(undefined, currentExercise?.id, currentExercise?.name)
    }
  }, [
    handleInitialize,
    isPlaying,
    stopDetection,
    isRecording,
    stopRecording,
    currentExercise,
    startDetection,
    startRecording,
  ]);

  const handleCalibrate = useCallback(async () => {
    await handleInitialize();
  }, [handleInitialize]);

  const handleSelectExercise = useCallback(
    (exerciseId: string) => {
      const exercise = recommendations.find(
        (r) => r.exercise.id === exerciseId
      )?.exercise;
      if (exercise) {
        selectExercise(exercise);
      }
      practiceState.setShowExercises(false);
    },
    [recommendations, selectExercise, practiceState]
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-muted/20 to-background flex flex-col">
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
          {currentExercise ? (
            <div className="p-6">
              <SheetMusicRenderer
                exercise={currentExercise}
                currentNoteIndex={currentNoteIndex}
              />
            </div>
          ) : (
            <div className="h-100 flex items-center justify-center text-muted-foreground">
              <p>Selecciona un ejercicio para ver la partitura</p>
            </div>
          )}

          <PitchIndicator
            performance={currentPerformance}
            targetNote={targetNote}
          />
          <div className="p-4 sm:p-6">
            <Fretboard
              currentPitch={currentPerformance?.playedNote.frequency || 0}
            />
          </div>
        </Card>

        <FeedbackManager feedback={feedback} />
      </main>

      <PracticeControls
        isPlaying={isPlaying}
        isInitialized={isInitialized}
        latency={0}
        hasRecording={!!currentRecording}
        onStartStop={handleStart}
        onViewRecording={() => practiceState.setShowRecording(true)}
      />

      <ModalManager
        showRecording={practiceState.showRecording}
        showExercises={practiceState.showExercises}
        currentRecording={currentRecording}
        recommendations={recommendations}
        onCloseRecording={() => practiceState.setShowRecording(false)}
        onCloseExercises={() => practiceState.setShowExercises(false)}
        onDeleteRecording={(id) => {
          deleteRecording(id);
          practiceState.setShowRecording(false);
        }}
        onSelectExercise={handleSelectExercise}
      />

      <DebugPanel
        state={{
          currentState,
          currentPerformance,
          feedback,
        }}
      />
    </div>
  );
}
