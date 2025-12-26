import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { RecordingPlayer } from "@/components/recording-player"
import type { Recording } from "@/lib/types/recording"

const mockRecording: Recording = {
  id: "1",
  audioUrl: "test.webm",
  timestamp: Date.now(),
  duration: 10000,
  exerciseName: "Grabación de Práctica",
  analysis: {
    overallAccuracy: 90,
    averageDeviation: 10,
    stabilityScore: 80,
    toneQuality: 70,
    intonationGraph: [],
    problemAreas: [],
    recommendations: [],
  },
}

// Mock the Audio object
vi.spyOn(window, 'Audio').mockImplementation(() => ({
  play: vi.fn(),
  pause: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}));

describe("RecordingPlayer", () => {
  it("renders the recording title", () => {
    render(<RecordingPlayer recording={mockRecording} onDelete={vi.fn()} />)
    expect(screen.getByText("Grabación de Práctica")).toBeInTheDocument()
  })

  it("displays a message when no intonation data is available", () => {
    render(<RecordingPlayer recording={mockRecording} onDelete={vi.fn()} />)
    expect(screen.getByText("No intonation data available.")).toBeInTheDocument()
  })

  it("renders the intonation graph when data is available", () => {
    const recordingWithData = {
      ...mockRecording,
      analysis: {
        ...mockRecording.analysis,
        intonationGraph: [{ deviation: 10, time: 0 }, { deviation: 20, time: 1 }],
      },
    }
    render(<RecordingPlayer recording={recordingWithData} onDelete={vi.fn()} />)
    expect(screen.queryByText("No intonation data available.")).not.toBeInTheDocument()
    const svgElement = document.querySelector("svg")
    expect(svgElement).toBeInTheDocument()
  })
})
