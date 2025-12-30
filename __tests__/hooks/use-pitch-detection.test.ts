import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"

const { create } = await vi.hoisted(async () => {
  const { create } = await vi.importActual("zustand")
  return { create: vi.fn(create) }
})

vi.mock("zustand", () => ({
  __esModule: true,
  default: create,
  create,
}))

import { usePitchDetection } from "@/hooks/use-pitch-detection"
import { usePitchProcessor } from "@/hooks/use-pitch-processor"

vi.mock("@/hooks/use-pitch-processor")

describe("usePitchDetection", () => {
  it("should call addPitchPoint when recording", () => {
    const addPitchPoint = vi.fn()

    let onPitchDetectedCallback: (event: { pitchHz: number; confidence: number; rms: number }) => void;
    (usePitchProcessor as vi.Mock).mockImplementation(({ onPitchDetected }) => {
      onPitchDetectedCallback = onPitchDetected;
    });

    create.mockReturnValue(vi.fn(() => ({ status: "LISTENING" })))

    renderHook(() => usePitchDetection({ addPitchPoint }))

    act(() => {
      onPitchDetectedCallback({ pitchHz: 440, confidence: 0.9, rms: 0.1 });
    });

    expect(addPitchPoint).toHaveBeenCalledWith({ frequency: 440, confidence: 0.9, rms: 0.1 });
  })
})
