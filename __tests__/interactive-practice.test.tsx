import { render, fireEvent, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { PracticeContainer } from "@/components/interactive-practice/PracticeContainer"
import { usePitchDetectionStore } from "@/lib/store/pitch-detection-store"
import { useRecording } from "@/hooks/use-recording"
import { useExerciseContext } from "@/contexts/ExerciseContext"
import { useUIStateContext } from "@/contexts/UIStateContext"

vi.mock("@/lib/store/pitch-detection-store")
vi.mock("@/hooks/use-recording")
vi.mock("@/contexts/ExerciseContext")
vi.mock("@/contexts/UIStateContext")

const mockInitialize = vi.fn()
const mockStartCalibration = vi.fn()
const mockStartDetection = vi.fn()
const mockStopDetection = vi.fn()
const mockStartRecording = vi.fn()

const mockMediaStream = { id: "mock-stream" }

beforeEach(() => {
  vi.clearAllMocks()

  ;(usePitchDetectionStore as vi.Mock).mockReturnValue({
    notes: [],
    currentNoteIndex: 0,
    totalLatencyOffsetMs: 0,
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

  ;(useExerciseContext as vi.Mock).mockReturnValue({
    currentExercise: null,
    recommendations: [],
    selectExercise: vi.fn(),
  })

  ;(useUIStateContext as vi.Mock).mockReturnValue({
    openModal: vi.fn(),
    closeModal: vi.fn(),
    activeModal: null,
    isSettingsPanelVisible: false,
    toggleSettingsPanel: vi.fn(),
  })
})

describe("PracticeContainer", () => {
  it("initializes and starts recording on first start click", async () => {
    render(<PracticeContainer />)

    const startButton = screen.getByText("Empezar")
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
    render(<PracticeContainer />)

    const calibrateButton = screen.getByText("Calibrar")
    fireEvent.click(calibrateButton)

    await vi.waitFor(() => {
      expect(mockInitialize).toHaveBeenCalledOnce()
    })

    expect(mockStartCalibration).toHaveBeenCalledOnce()
  })
})
