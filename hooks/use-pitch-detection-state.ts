import { useReducer, useCallback } from "react"
import {
  PitchDetectionState,
  PitchDetectionEvent,
  PitchDetectionStateMachine,
} from "@/lib/state-machines/pitch-detection.machine"

interface State {
  machine: PitchDetectionStateMachine
  currentPitch: number
  currentCents: number
  error: Error | null
}

type Action =
  | { type: "TRANSITION"; event: PitchDetectionEvent }
  | { type: "UPDATE_METRICS"; pitch: number; cents: number }
  | { type: "SET_ERROR"; error: Error }
  | { type: "CLEAR_ERROR" }

/**
 * Reducer inmutable que maneja el estado.
 */
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "TRANSITION": {
      // ✅ INMUTABLE: Crear nueva instancia de la máquina
      const newMachine = new PitchDetectionStateMachine(state.machine.getState())
      const success = newMachine.transition(action.event)

      if (!success) {
        console.warn(
          `Transition ${action.event} ignored in state ${state.machine.getState()}`
        )
        return state // No hay cambio
      }

      return {
        ...state,
        machine: newMachine,
        error: newMachine.getState() === PitchDetectionState.ERROR ? state.error : null,
      }
    }

    case "UPDATE_METRICS":
      // ✅ INMUTABLE: Nuevo objeto
      return {
        ...state,
        currentPitch: action.pitch,
        currentCents: action.cents,
      }

    case "SET_ERROR":
      // ✅ INMUTABLE
      return {
        ...state,
        error: action.error,
      }

    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      }

    default:
      return state
  }
}

/**
 * Hook que usa la máquina de estados de forma segura.
 */
export function usePitchDetectionState() {
  const [state, dispatch] = useReducer(reducer, {
    machine: new PitchDetectionStateMachine(),
    currentPitch: 0,
    currentCents: 0,
    error: null,
  })

  // ✅ API segura para transiciones
  const transition = useCallback((event: PitchDetectionEvent) => {
    dispatch({ type: "TRANSITION", event })
  }, [])

  const updateMetrics = useCallback((pitch: number, cents: number) => {
    dispatch({ type: "UPDATE_METRICS", pitch, cents })
  }, [])

  const setError = useCallback((error: Error) => {
    dispatch({ type: "SET_ERROR", error })
    dispatch({ type: "TRANSITION", event: PitchDetectionEvent.ERROR })
  }, [])

  // ✅ Helpers que verifican estado antes de transiciones
  const canStartCalibration = state.machine.getState() === PitchDetectionState.IDLE
  const canStartDetection = state.machine.getState() === PitchDetectionState.IDLE
  const isDetecting = [
    PitchDetectionState.PITCH_DETECTING,
    PitchDetectionState.PITCH_STABLE,
  ].includes(state.machine.getState())

  return {
    // Estado
    currentState: state.machine.getState(),
    currentPitch: state.currentPitch,
    currentCents: state.currentCents,
    error: state.error,

    // Capacidades
    canStartCalibration,
    canStartDetection,
    isDetecting,

    // Acciones
    transition,
    updateMetrics,
    setError,
  }
}
