"use client"

import { useCallback } from "react"
import { usePitchDetectionStore } from "@/lib/store/pitch-detection-store"
import { useAudioContext } from "./use-audio-context"
import { usePitchProcessor } from "./use-pitch-processor"
import { useCalibration } from "./use-calibration"
import { usePitchStateMachine } from "./use-pitch-state-machine"
import type { PitchEvent } from "@/lib/types/pitch-detection"
import { PitchDetector } from "@/lib/audio/pitch-detector"

export function usePitchDetection() {
  const store = usePitchDetectionStore()

  const { audioContext, analyser, mediaStream, initialize: initAudio, isReady } = useAudioContext()

  const { handlePitchEvent } = usePitchStateMachine()

  const { startCalibration, processCalibrationFrame, isCalibrating } = useCalibration({
    audioContext,
    mediaStream,
    rmsThreshold: store.rmsThreshold,
    onCalibrationComplete: (latencyMs) => {
      console.log("[v0] Calibration complete:", latencyMs)
    },
  })

  const onPitchDetected = useCallback(
    (event: PitchEvent) => {
      // Si estamos calibrando, procesar calibración
      if (isCalibrating) {
        processCalibrationFrame(event.rms, event.timestamp)
        return
      }

      // Sino, procesar pitch normal
      handlePitchEvent(event)
    },
    [isCalibrating, processCalibrationFrame, handlePitchEvent],
  )

  const { startProcessing, stopProcessing } = usePitchProcessor({
    analyser,
    sampleRate: audioContext?.sampleRate || 48000,
    onPitchDetected,
    isActive: store.status === "PITCH_DETECTING" || store.status === "PITCH_STABLE" || isCalibrating,
  })

  // Calibración RMS
  const calibrateRMS = useCallback(() => {
    if (!analyser) return

    const buffer = new Float32Array(analyser.fftSize)
    analyser.getFloatTimeDomainData(buffer)

    const detector = new PitchDetector(audioContext?.sampleRate || 48000)
    const rms = detector.calculateRMS(buffer)
    detector.destroy()

    store.setState({ rmsThreshold: rms * 2.5 })
  }, [analyser, audioContext, store])

  // API Pública
  const initialize = useCallback(
    async (signal?: AbortSignal) => {
      await initAudio(signal)

      // Calibrar RMS después de 500ms
      setTimeout(() => {
        if (isReady) calibrateRMS()
      }, 500)

      store.setState({ status: "IDLE" })
    },
    [initAudio, calibrateRMS, store, isReady],
  )

  const startDetection = useCallback(() => {
    store.setState({
      status: "PITCH_DETECTING",
      currentNoteIndex: 0,
      accompanimentStartTime: audioContext?.currentTime || 0,
      consecutiveStableFrames: 0,
      holdStart: 0,
      accuracy: 0,
    })
  }, [store, audioContext])

  const stopDetection = useCallback(() => {
    stopProcessing()
    store.setState({ status: "IDLE" })
  }, [stopProcessing, store])

  return {
    state: store,
    initialize,
    startCalibration,
    startDetection,
    stopDetection,
    calibrateRMS,
  }
}
