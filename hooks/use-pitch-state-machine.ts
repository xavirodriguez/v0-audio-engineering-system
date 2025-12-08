"use client"

import { useCallback } from "react"
import { usePitchDetectionStore } from "@/lib/store/pitch-detection-store"
import { frequencyToCents } from "@/lib/audio/note-utils"
import type { PitchEvent } from "@/lib/types/pitch-detection"

const NOTE_TRANSITION_BUFFER_MS = 300
const PITCH_CONFIDENCE_MIN = 0.6

/**
 * A hook that provides a state machine for pitch detection.
 * @returns {{handlePitchEvent: (event: PitchEvent) => void}} - The pitch state machine.
 */
export function usePitchStateMachine() {
  const store = usePitchDetectionStore()

  const handlePitchEvent = useCallback(
    (event: PitchEvent) => {
      const state = store
      const { pitchHz, confidence, rms, timestamp } = event

      const adjustedTimestamp = timestamp - state.totalLatencyOffsetMs / 1000
      const currentNote = state.notes[state.currentNoteIndex]
      const cents = frequencyToCents(pitchHz, currentNote.frequency)

      // Actualizar métricas actuales
      store.setState({
        currentPitch: pitchHz,
        currentCents: cents,
        currentConfidence: confidence,
        currentRms: rms,
      })

      // Estado: IDLE - no hacer nada
      if (state.status === "IDLE") return

      // Estado: CALIBRATING - delegar a useCalibration
      if (state.status === "CALIBRATING") return

      // Estado: PITCH_DETECTING o PITCH_STABLE
      if (state.status === "PITCH_DETECTING" || state.status === "PITCH_STABLE") {
        // Sin señal
        if (rms < state.rmsThreshold) {
          store.setState({
            consecutiveStableFrames: 0,
            holdStart: 0,
            status: "PITCH_DETECTING",
          })
          return
        }

        // Verificar si está afinado
        const isInTune = Math.abs(cents) < state.toleranceCents && confidence > PITCH_CONFIDENCE_MIN

        if (isInTune) {
          const newConsecutiveFrames = state.consecutiveStableFrames + 1
          const newHoldStart = state.holdStart || adjustedTimestamp
          const holdDuration = (adjustedTimestamp - newHoldStart) * 1000

          // Tiempo suficiente mantenido -> avanzar nota
          if (holdDuration >= state.minHoldMs + NOTE_TRANSITION_BUFFER_MS) {
            store.advanceToNextNote()
            return
          }

          // Actualizar estado estable
          store.setState({
            status: "PITCH_STABLE",
            consecutiveStableFrames: newConsecutiveFrames,
            holdStart: newHoldStart,
          })
        } else {
          // Perdió la afinación
          store.setState({
            status: "PITCH_DETECTING",
            consecutiveStableFrames: 0,
            holdStart: 0,
          })
        }
      }
    },
    [store],
  )

  return {
    handlePitchEvent,
  }
}
