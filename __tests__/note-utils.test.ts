import { describe, it, expect } from "vitest"
import { generatePracticeSequence } from "@/lib/audio/note-utils"

describe("generatePracticeSequence", () => {
  it("should return a sequence with the correct MIDI value for G4", () => {
    const sequence = generatePracticeSequence()
    expect(sequence[0].midi).toBe(67)
  })
})
