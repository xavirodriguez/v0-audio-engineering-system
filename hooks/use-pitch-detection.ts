import { useCallback } from "react"
import { usePitchDetectionState } from "./use-pitch-detection-state"
import { useAudioContext } from "./use-audio-context"
import { usePitchProcessor } from "./use-pitch-processor"
import { PitchDetectionEvent, PitchDetectionState } from "@/lib/state-machines/pitch-detection.machine"

export function usePitchDetection() {
  // ✅ Estado centralizado con máquina de estados
  const state = usePitchDetectionState()

  // ✅ Audio context
  const { audioContext, analyser, initialize: initAudio, cleanup } = useAudioContext()

  // ✅ Procesador
  usePitchProcessor({
    analyser,
    sampleRate: audioContext?.sampleRate || 48000,
    isActive: state.isDetecting,
    onPitchDetected: (event) => {
      // ✅ Actualizar métricas de forma inmutable
      state.updateMetrics(event.pitchHz, event.confidence)

      // Lógica de transiciones basada en el evento
      if (event.confidence > 0.6) {
        if (state.currentState === PitchDetectionState.PITCH_DETECTING) {
          state.transition(PitchDetectionEvent.PITCH_STABLE)
        }
      } else {
        if (state.currentState === PitchDetectionState.PITCH_STABLE) {
          state.transition(PitchDetectionEvent.PITCH_LOST)
        }
      }
    },
    onError: (error) => {
      state.setError(error)
    },
  })

  // ✅ API pública con validación de estados
  const initialize = useCallback(async () => {
    if (state.currentState !== PitchDetectionState.UNINITIALIZED) {
      console.warn("Already initialized")
      return
    }

    state.transition(PitchDetectionEvent.INITIALIZE)

    try {
      await initAudio()
      state.transition(PitchDetectionEvent.INITIALIZATION_SUCCESS)
    } catch (error) {
      state.setError(error instanceof Error ? error : new Error(String(error)))
      state.transition(PitchDetectionEvent.INITIALIZATION_FAILED)
    }
  }, [state, initAudio])

  const startDetection = useCallback(() => {
    if (!state.canStartDetection) {
      console.warn(`Cannot start detection in state ${state.currentState}`)
      return
    }

    state.transition(PitchDetectionEvent.START_DETECTION)
  }, [state])

  const stopDetection = useCallback(() => {
    if (!state.isDetecting) {
      return
    }

    state.transition(PitchDetectionEvent.STOP_DETECTION)
  }, [state])

  return {
    // Estado
    currentState: state.currentState,
    currentPitch: state.currentPitch,
    currentCents: state.currentCents,
    error: state.error,

    // Capacidades
    canStartCalibration: state.canStartCalibration,
    canStartDetection: state.canStartDetection,
    isDetecting: state.isDetecting,

    // Acciones
    initialize,
    startDetection,
    stopDetection,
  }
}
