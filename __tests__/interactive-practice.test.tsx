import { render, fireEvent, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextIntlClientProvider } from "next-intl"
import messages from "../messages/es.json"
import { InteractivePractice } from "@/components/interactive-practice"
import { usePitchDetection } from "@/hooks/use-pitch-detection"
import { useRecording } from "@/hooks/use-recording"
import { useAdaptiveExercises } from "@/hooks/use-adaptive-exercises"
import { usePracticeState } from "@/hooks/use-practice-state"
import { PerformanceFeedback, MusicalNote, LearningSignal, SignalType, SignalSeverity } from "@/lib/domains"

import React from "react";
vi.mock("@/hooks/use-pitch-detection")
vi.mock("@/hooks/use-recording")
vi.mock("@/hooks/use-adaptive-exercises")
vi.mock("@/hooks/use-practice-state")
vi.mock("@/components/feedback/feedback-overlay", () => ({
  FeedbackOverlay: ({ notifications, onDismiss }: { notifications: LearningSignal[], onDismiss: (id: string) => void }) => (
    <div>
      {notifications.map(n => (
        <button key={n.id} onClick={() => onDismiss(n.id)}>
          {n.message}
        </button>
      ))}
    </div>
  ),
}))

const mockInitialize = vi.fn()
const mockStartDetection = vi.fn()
const mockStopDetection = vi.fn()
const mockStartRecording = vi.fn()
const mockMediaStream = { id: "mock-stream" }
const mockTargetNote = MusicalNote.fromNoteName("A", 4);

beforeEach(() => {
  vi.clearAllMocks()

  ;(usePitchDetection as vi.Mock).mockReturnValue({
    currentState: "IDLE",
    observation: null,
    feedback: PerformanceFeedback.empty(),
    initialize: mockInitialize,
    startDetection: mockStartDetection,
    stopDetection: mockStopDetection,
    mediaStream: mockMediaStream,
  })

  ;(useRecording as vi.Mock).mockReturnValue({
    isRecording: false,
    currentRecording: null,
    startRecording: mockStartRecording,
    stopRecording: vi.fn(),
    addPitchPoint: vi.fn(),
    deleteRecording: vi.fn(),
  })

  ;(useAdaptiveExercises as vi.Mock).mockReturnValue({
    currentExercise: null,
    recommendations: [],
    selectExercise: vi.fn(),
  })

  ;(usePracticeState as vi.Mock).mockReturnValue({
    viewMode: "animated",
    practiceMode: "untimed",
    showExercises: false,
    showRecording: false,
    showSettings: false,
    sensitivity: 0.5,
    tempo: 120,
    volume: 0.5,
    toggleViewMode: vi.fn(),
    setPracticeMode: vi.fn(),
    setShowExercises: vi.fn(),
    setShowRecording: vi.fn(),
    toggleSettings: vi.fn(),
    setSensitivity: vi.fn(),
    setTempo: vi.fn(),
    setVolume: vi.fn(),
  })
})

describe("InteractivePractice", () => {
  const renderComponent = () => {
    return render(
      <NextIntlClientProvider locale="es" messages={messages}>
        <InteractivePractice />
      </NextIntlClientProvider>
    )
  }

  it("initializes and starts recording on first start click", async () => {
    renderComponent()

    const startButton = screen.getByRole("button", { name: /iniciar/i })
    fireEvent.click(startButton)

    await vi.waitFor(() => {
      expect(mockInitialize).toHaveBeenCalledOnce()
    })

    await vi.waitFor(() => {
      expect(mockStartDetection).toHaveBeenCalledOnce()
    })

    await vi.waitFor(() => {
      expect(mockStartRecording).toHaveBeenCalled()
    })
  })

  it("initializes on first calibrate click", async () => {
    renderComponent()

    const calibrateButton = screen.getByRole("button", { name: "Calibrar" })
    fireEvent.click(calibrateButton)

    await vi.waitFor(() => {
      expect(mockInitialize).toHaveBeenCalledOnce()
    })
  })

  it("should display notifications and dismiss them", () => {
    const signal = LearningSignal.create(
      SignalType.PITCH_ACCURATE,
      SignalSeverity.SUCCESS,
      "Test message",
    )
    const feedback = PerformanceFeedback.create([signal], {
      accuracy: 100,
      averageDeviation: 0,
      currentStreak: 1,
      maxStreak: 1,
      notesCompleted: 1,
      notesTotal: 1,
    })

    ;(usePitchDetection as vi.Mock).mockReturnValue({
      currentState: "IDLE",
      observation: null,
      feedback: feedback,
      initialize: mockInitialize,
      startDetection: mockStartDetection,
      stopDetection: mockStopDetection,
      mediaStream: mockMediaStream,
    })

    const { getByText, queryByText } = renderComponent()

    const notification = getByText("Test message")
    expect(notification).toBeInTheDocument()

    fireEvent.click(notification)

    expect(queryByText("Test message")).not.toBeInTheDocument()
  })
})
