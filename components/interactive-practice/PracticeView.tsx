"use client"

import { Card } from "@/components/ui/card"
import { DebugPanel } from "../debug-panel"
import { ScoreView } from "../score-view"
import { PitchIndicator } from "../pitch-indicator"
import { SheetMusicRenderer } from "../sheet-music-renderer"
import { PracticeHeader } from "../practice/practice-header"
import { SettingsPanel } from "../practice/settings-panel"
import { PracticeControls } from "../practice/practice-controls"
import { ModalManager } from "../practice/modal-manager"
import { Fretboard } from "../practice/fretboard"

export function PracticeView({
  notes,
  currentNoteIndex,
  accuracy,
  totalLatencyOffsetMs,
  currentPitch,
  currentCents,
  currentConfidence,
  currentRms,
  status,
  currentNote,
  isRecording,
  currentRecording,
  recommendations,
  isInitialized,
  isPlaying,
  practiceState,
  onPracticeStateChange,
  handleStart,
  handleCalibrate,
  handleSelectExercise,
  deleteRecording,
  rmsThreshold,
  activeModal,
  openModal,
  closeModal,
  isSettingsPanelVisible,
  toggleSettingsPanel,
}) {
  const { viewMode, practiceMode, sensitivity, tempo, volume } = practiceState

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex flex-col">
      <PracticeHeader
        exerciseName={currentNote?.name}
        status={status}
        isRecording={isRecording}
        viewMode={viewMode}
        showSettings={isSettingsPanelVisible}
        onViewModeToggle={() => onPracticeStateChange({ viewMode: viewMode === "animated" ? "sheet" : "animated" })}
        onExercisesClick={() => openModal("exercises")}
        onCalibrateClick={handleCalibrate}
        onSettingsToggle={toggleSettingsPanel}
      />

      <SettingsPanel
        visible={isSettingsPanelVisible}
        sensitivity={sensitivity}
        tempo={tempo}
        volume={volume}
        practiceMode={practiceMode}
        onSensitivityChange={(value) => onPracticeStateChange({ sensitivity: value })}
        onTempoChange={(value) => onPracticeStateChange({ tempo: value })}
        onVolumeChange={(value) => onPracticeStateChange({ volume: value })}
        onPracticeModeChange={(value) => onPracticeStateChange({ practiceMode: value })}
      />

      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="border-border bg-card/80 backdrop-blur-sm shadow-2xl overflow-hidden">
          {viewMode === "animated" ? (
            <ScoreView
              notes={notes}
              currentNoteIndex={currentNoteIndex}
              isPlaying={isPlaying}
              practiceMode={practiceMode}
              status={status}
              accuracy={accuracy}
            />
          ) : currentNote ? (
            <div className="p-6">
              <SheetMusicRenderer exercise={currentNote} currentNoteIndex={currentNoteIndex} />
            </div>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              <p>Select an exercise to see the sheet music</p>
            </div>
          )}

          <PitchIndicator
            currentNote={currentNote}
            currentPitch={currentPitch}
            currentCents={currentCents}
            currentConfidence={currentConfidence}
            currentRms={currentRms}
            rmsThreshold={rmsThreshold}
          />
          <div className="p-4 sm:p-6">
            <Fretboard currentPitch={currentPitch} />
          </div>
        </Card>
      </main>

      <PracticeControls
        isPlaying={isPlaying}
        isInitialized={isInitialized}
        latency={totalLatencyOffsetMs}
        hasRecording={!!currentRecording}
        onStartStop={handleStart}
        onViewRecording={() => openModal("recording")}
      />

      <DebugPanel state={{
        notes,
        currentNoteIndex,
        accuracy,
        totalLatencyOffsetMs,
        status,
        currentPitch,
        currentCents,
        currentConfidence,
        currentRms,
      }} />

      <ModalManager
        showRecording={activeModal === "recording"}
        showExercises={activeModal === "exercises"}
        currentRecording={currentRecording}
        recommendations={recommendations}
        onCloseRecording={closeModal}
        onCloseExercises={closeModal}
        onDeleteRecording={(id) => {
          deleteRecording(id)
          closeModal()
        }}
        onSelectExercise={handleSelectExercise}
      />
    </div>
  )
}
