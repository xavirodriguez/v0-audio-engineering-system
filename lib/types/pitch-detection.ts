// Mensajes de Control: Main Thread -> Worklet
export interface WorkletCommand {
  cmd: "config" | "start" | "stop" | "calibrate" | "setTolerance" | "setTargetFreq"
  protocolVersion: "1.0.0"
  payload?: {
    detectorName?: "autocorrelation" | "yin_js_fallback"
    sampleRate?: number
    frameSize?: number
    hopSize?: number
    toleranceCents?: number
    targetFreqHz?: number
  }
}

// Mensajes de Estado: Worklet -> Main Thread
export interface PitchEvent {
  pitchHz: number
  confidence: number
  rms: number
  clarity: number
  timestamp: number
  frameIndex: number
}

// Mensajes de Error: Worklet -> Main Thread
export interface WorkletError {
  errorCode: "ERR_WASM_LOAD" | "ERR_WASM_PROCESS" | "ERR_NO_MIC" | "ERR_PERMISSION_DENIED"
  message: string
  timestamp: number
}

// Estado de la Máquina de Estados
export type TunerStatus =
  | "IDLE"
  | "CALIBRATING"
  | "WAITING_FOR_ONSET"
  | "PITCH_DETECTING"
  | "PITCH_STABLE"
  | "NOTE_ADVANCED"
  | "ERROR"
  | "FALLBACK_MODE"

// Nota musical en la partitura
export interface MusicalNote {
  midi: number
  frequency: number
  name: string
  duration: number // en ms
  startTime: number // tiempo acumulado desde el inicio
}

// Estado Global de la Aplicación
export interface GlobalTunerState {
  status: TunerStatus
  currentNoteIndex: number
  targetNoteMidi: number
  targetFreqHz: number
  accompanimentStartTime: number
  toleranceCents: number
  minHoldMs: number
  rmsThreshold: number
  pitchHistory: number[]
  consecutiveStableFrames: number
  holdStart: number
  totalLatencyOffsetMs: number
  isWorkletSupported: boolean
  currentPitch: number
  currentCents: number
  currentConfidence: number
  currentRms: number
  accuracy: number
  notes: MusicalNote[]
}
