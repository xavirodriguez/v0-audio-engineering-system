"use client"

import { useRef, useCallback, useEffect } from "react"
import { LatencyCalibrator } from "@/lib/audio/latency-calibration"
import { usePitchDetectionStore } from "@/lib/store/pitch-detection-store"

interface UseCalibrationConfig {
  audioContext: AudioContext | null
  mediaStream: MediaStream | null
  rmsThreshold: number
  onCalibrationComplete: (latencyMs: number) => void
}

interface UseCalibrationReturn {
  startCalibration: () => void
  processCalibrationFrame: (rms: number, timestamp: number) => void
  isCalibrating: boolean
}

export function useCalibration({
  audioContext,
  mediaStream,
  rmsThreshold,
  onCalibrationComplete,
}: UseCalibrationConfig): UseCalibrationReturn {
  const store = usePitchDetectionStore()
  const calibratorRef = useRef<LatencyCalibrator | null>(null)
  const calibrationClickTimeRef = useRef<number>(0)
  const calibrationCountRef = useRef<number>(0)
  const isCalibrating = store.status === "CALIBRATING"

  // Inicializar calibrator cuando audioContext cambia
  useEffect(() => {
    if (audioContext) {
      calibratorRef.current = new LatencyCalibrator(audioContext)
    }
  }, [audioContext])

  const startCalibration = useCallback(() => {
    if (!calibratorRef.current || !audioContext) return

    store.setState({ status: "CALIBRATING" })
    calibratorRef.current.reset()
    calibrationCountRef.current = 0

    const clickTime = calibratorRef.current.playCalibrationClick()
    calibrationClickTimeRef.current = clickTime
  }, [audioContext, store])

  const processCalibrationFrame = useCallback(
    (rms: number, timestamp: number) => {
      if (!isCalibrating || !calibratorRef.current) return

      if (rms > rmsThreshold) {
        calibratorRef.current.addMeasurement(calibrationClickTimeRef.current, timestamp)
        calibrationCountRef.current++

        if (calibrationCountRef.current >= 5) {
          const finalOffset = calibratorRef.current.calculateFinalOffset()

          store.setState({
            status: "IDLE",
            totalLatencyOffsetMs: finalOffset,
          })

          onCalibrationComplete(finalOffset)
        } else {
          const clickTime = calibratorRef.current.playCalibrationClick()
          calibrationClickTimeRef.current = clickTime
        }
      }
    },
    [isCalibrating, rmsThreshold, store, onCalibrationComplete],
  )

  return {
    startCalibration,
    processCalibrationFrame,
    isCalibrating,
  }
}
