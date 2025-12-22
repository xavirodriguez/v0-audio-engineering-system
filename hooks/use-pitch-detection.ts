"use client"

import { useCallback, useRef, useState } from "react"
import { usePitchDetectionStore } from "@/lib/store/pitch-detection-store"
import { useAudioContext } from "./use-audio-context"
import { usePitchProcessor } from "./use-pitch-processor"
import { useCalibration } from "./use-calibration"
import { usePitchStateMachine } from "./use-pitch-state-machine"
import type { PitchEvent } from "@/lib/types/pitch-detection"
import { PitchDetector } from "@/lib/audio/pitch-detector"

/**
 * A hook that provides pitch detection functionality.
 * @returns {object} - The pitch detection functions and state.
 */
export function usePitchDetection() {
  const store = usePitchDetectionStore()

  // --- State and Refs for Pitch Smoothing ---
  const pitchHistoryRef = useRef<number[]>([])
  const [smoothedPitch, setSmoothedPitch] = useState(0)
  const PITCH_SMOOTHING_WINDOW = 5 // Number of frames to average over
  const CONFIDENCE_THRESHOLD = 0.8 // Minimum confidence to consider a pitch

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
      if (isCalibrating) {
        processCalibrationFrame(event.rms, event.timestamp)
        return
      }

      // 1. Filtrar por confianza
      if (event.confidence < CONFIDENCE_THRESHOLD) {
        // Si la confianza es baja, reseteamos el historial y no procesamos.
        pitchHistoryRef.current = []
        setSmoothedPitch(0)
        // Opcional: podrías enviar un evento "no detectado" a la FSM aquí.
        // handlePitchEvent({ ...event, pitchHz: 0 });
        return
      }

      // 2. Añadir pitch al historial
      pitchHistoryRef.current.push(event.pitchHz)
      if (pitchHistoryRef.current.length > PITCH_SMOOTHING_WINDOW) {
        pitchHistoryRef.current.shift() // Mantener el tamaño de la ventana
      }

      // 3. Calcular media móvil si el historial está lleno
      if (pitchHistoryRef.current.length === PITCH_SMOOTHING_WINDOW) {
        const averagePitch = pitchHistoryRef.current.reduce((a, b) => a + b, 0) / PITCH_SMOOTHING_WINDOW
        setSmoothedPitch(averagePitch)

        // 4. Crear un nuevo evento con el pitch suavizado
        const smoothedEvent: PitchEvent = { ...event, pitchHz: averagePitch }

        // 5. Procesar el evento suavizado
        handlePitchEvent(smoothedEvent)
      }
    },
    [isCalibrating, processCalibrationFrame, handlePitchEvent, CONFIDENCE_THRESHOLD, PITCH_SMOOTHING_WINDOW],
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
    mediaStream,
  }
}
