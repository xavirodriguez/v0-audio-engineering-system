import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { RecordingPlayer } from "@/components/recording-player"
import type { Recording } from "@/lib/types/recording"

const mockRecording: Recording = {
  id: "1",
  audioUrl: "test.webm",
  timestamp: Date.now(),
  duration: 10000,
  exerciseName: "Test Exercise",
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

describe("RecordingPlayer", () => {
  it("displays a message when no intonation data is available", () => {
    render(<RecordingPlayer recording={mockRecording} onDelete={vi.fn()} />)
    expect(screen.getByText("No hay datos de entonación disponibles.")).toBeInTheDocument()
  })

  it("renders the intonation graph when data is available", () => {
    const recordingWithData = {
      ...mockRecording,
      analysis: {
        ...mockRecording.analysis,
        intonationGraph: [{ deviation: 10 }, { deviation: 20 }],
      },
    }
    render(<RecordingPlayer recording={recordingWithData} onDelete={vi.fn()} />)
    expect(screen.queryByText("No hay datos de entonación disponibles.")).not.toBeInTheDocument()
    const svgElement = document.querySelector("svg")
    expect(svgElement).toBeInTheDocument()
  })
})
