import { render, fireEvent, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextIntlClientProvider } from "next-intl"
import messages from "../messages/es.json"
import { InteractivePractice } from "@/components/interactive-practice"
import { usePitchDetection } from "@/hooks/use-pitch-detection"
import { useRecording } from "@/hooks/use-recording"
import { useAdaptiveExercises } from "@/hooks/use-adaptive-exercises"
import { usePracticeState } from "@/hooks/use-practice-state"

vi.mock("@/hooks/use-pitch-detection")
vi.mock("@/hooks/use-recording")
vi.mock("@/hooks/use-adaptive-exercises")
vi.mock("@/hooks/use-practice-state")

const mockInitialize = vi.fn()
const mockStartCalibration = vi.fn()
const mockStartDetection = vi.fn()
const mockStopDetection = vi.fn()
const mockStartRecording = vi.fn()

const mockMediaStream = { id: "mock-stream" }

beforeEach(() => {
  vi.clearAllMocks()

  ;(usePitchDetection as vi.Mock).mockReturnValue({
    state: {
      status: "IDLE",
      notes: [],
      currentNoteIndex: 0,
      totalLatencyOffsetMs: 0,
    },
    initialize: mockInitialize,
    startCalibration: mockStartCalibration,
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
      expect(mockStartRecording).toHaveBeenCalledWith(mockMediaStream, undefined, undefined)
    })
  })

  it("initializes on first calibrate click", async () => {
    renderComponent()

    const calibrateButton = screen.getByRole("button", { name: "Calibrar" })
    fireEvent.click(calibrateButton)

    await vi.waitFor(() => {
      expect(mockInitialize).toHaveBeenCalledOnce()
    })

    expect(mockStartCalibration).toHaveBeenCalledOnce()
  })
})
