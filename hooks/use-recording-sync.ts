"use client"

import { useEffect } from "react"

export interface UseRecordingSyncParams {
  isRecording: boolean
  currentPitch: number
  currentCents: number
  currentConfidence: number
  currentRms: number
  addPitchPoint: (pitch: number, cents: number, conf: number, rms: number) => void
}

export function useRecordingSync(params: UseRecordingSyncParams): void {
  const { isRecording, currentPitch, currentCents, currentConfidence, currentRms, addPitchPoint } = params

  useEffect(() => {
    if (isRecording && currentPitch > 0) {
      addPitchPoint(currentPitch, currentCents, currentConfidence, currentRms)
    }
  }, [currentPitch, currentCents, currentConfidence, currentRms, isRecording, addPitchPoint])
}
