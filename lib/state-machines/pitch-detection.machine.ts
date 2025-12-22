/**
 * Estados posibles del sistema de detección de pitch.
 */
export enum PitchDetectionState {
  UNINITIALIZED = "UNINITIALIZED",
  INITIALIZING = "INITIALIZING",
  IDLE = "IDLE",
  CALIBRATING = "CALIBRATING",
  PITCH_DETECTING = "PITCH_DETECTING",
  PITCH_STABLE = "PITCH_STABLE",
  ERROR = "ERROR",
}

/**
 * Eventos que pueden ocurrir.
 */
export enum PitchDetectionEvent {
  INITIALIZE = "INITIALIZE",
  INITIALIZATION_SUCCESS = "INITIALIZATION_SUCCESS",
  INITIALIZATION_FAILED = "INITIALIZATION_FAILED",
  START_CALIBRATION = "START_CALIBRATION",
  CALIBRATION_COMPLETE = "CALIBRATION_COMPLETE",
  CALIBRATION_FAILED = "CALIBRATION_FAILED",
  START_DETECTION = "START_DETECTION",
  PITCH_DETECTED = "PITCH_DETECTED",
  PITCH_LOST = "PITCH_LOST",
  PITCH_STABLE = "PITCH_STABLE",
  STOP_DETECTION = "STOP_DETECTION",
  ERROR = "ERROR",
  RESET = "RESET",
}

/**
 * Transiciones permitidas.
 * La clave es el estado actual, el valor es un mapa de eventos -> nuevo estado.
 */
const STATE_TRANSITIONS: Record<
  PitchDetectionState,
  Partial<Record<PitchDetectionEvent, PitchDetectionState>>
> = {
  [PitchDetectionState.UNINITIALIZED]: {
    [PitchDetectionEvent.INITIALIZE]: PitchDetectionState.INITIALIZING,
  },
  [PitchDetectionState.INITIALIZING]: {
    [PitchDetectionEvent.INITIALIZATION_SUCCESS]: PitchDetectionState.IDLE,
    [PitchDetectionEvent.INITIALIZATION_FAILED]: PitchDetectionState.ERROR,
  },
  [PitchDetectionState.IDLE]: {
    [PitchDetectionEvent.START_CALIBRATION]: PitchDetectionState.CALIBRATING,
    [PitchDetectionEvent.START_DETECTION]: PitchDetectionState.PITCH_DETECTING,
  },
  [PitchDetectionState.CALIBRATING]: {
    [PitchDetectionEvent.CALIBRATION_COMPLETE]: PitchDetectionState.IDLE,
    [PitchDetectionEvent.CALIBRATION_FAILED]: PitchDetectionState.ERROR,
    [PitchDetectionEvent.ERROR]: PitchDetectionState.ERROR,
  },
  [PitchDetectionState.PITCH_DETECTING]: {
    [PitchDetectionEvent.PITCH_STABLE]: PitchDetectionState.PITCH_STABLE,
    [PitchDetectionEvent.STOP_DETECTION]: PitchDetectionState.IDLE,
    [PitchDetectionEvent.ERROR]: PitchDetectionState.ERROR,
  },
  [PitchDetectionState.PITCH_STABLE]: {
    [PitchDetectionEvent.PITCH_LOST]: PitchDetectionState.PITCH_DETECTING,
    [PitchDetectionEvent.STOP_DETECTION]: PitchDetectionState.IDLE,
    [PitchDetectionEvent.ERROR]: PitchDetectionState.ERROR,
  },
  [PitchDetectionState.ERROR]: {
    [PitchDetectionEvent.RESET]: PitchDetectionState.UNINITIALIZED,
  },
}

/**
 * Máquina de estados para detección de pitch.
 * Garantiza que las transiciones sean válidas y predecibles.
 */
export class PitchDetectionStateMachine {
  private currentState: PitchDetectionState
  private readonly transitions = STATE_TRANSITIONS

  constructor(initialState = PitchDetectionState.UNINITIALIZED) {
    this.currentState = initialState
  }

  /**
   * Obtiene el estado actual.
   */
  getState(): PitchDetectionState {
    return this.currentState
  }

  /**
   * Intenta realizar una transición.
   *
   * @param event - El evento que dispara la transición
   * @returns true si la transición fue exitosa, false si no está permitida
   * @throws {InvalidStateTransitionError} Si la transición no está permitida y throwOnInvalid es true
   */
  transition(event: PitchDetectionEvent, throwOnInvalid = false): boolean {
    const allowedTransitions = this.transitions[this.currentState]
    const nextState = allowedTransitions?.[event]

    if (!nextState) {
      if (throwOnInvalid) {
        throw new InvalidStateTransitionError(
          this.currentState,
          event,
          this.getAllowedEvents()
        )
      }
      return false
    }

    this.currentState = nextState
    return true
  }

  /**
   * Verifica si un evento es válido en el estado actual.
   */
  canTransition(event: PitchDetectionEvent): boolean {
    const allowedTransitions = this.transitions[this.currentState]
    return !!allowedTransitions?.[event]
  }

  /**
   * Obtiene todos los eventos permitidos en el estado actual.
   */
  getAllowedEvents(): PitchDetectionEvent[] {
    const allowedTransitions = this.transitions[this.currentState]
    return allowedTransitions ? Object.keys(allowedTransitions) as PitchDetectionEvent[] : []
  }

  /**
   * Resetea la máquina al estado inicial.
   */
  reset(): void {
    this.currentState = PitchDetectionState.UNINITIALIZED
  }
}

/**
 * Error cuando se intenta una transición inválida.
 */
class InvalidStateTransitionError extends Error {
  constructor(
    currentState: PitchDetectionState,
    event: PitchDetectionEvent,
    allowedEvents: PitchDetectionEvent[]
  ) {
    super(
      `Invalid transition: Cannot handle event "${event}" in state "${currentState}". ` +
      `Allowed events: [${allowedEvents.join(", ")}]`
    )
    this.name = "InvalidStateTransitionError"
  }
}
