import type { TunerStatus } from "@/lib/types/pitch-detection"

export interface PitchTransitionEvent {
  type: "PITCH_DETECTED" | "PITCH_STABLE" | "PITCH_LOST" | "NOTE_COMPLETE" | "CALIBRATION_CLICK"
  pitchHz: number
  confidence: number
  rms: number
  cents: number
  holdDuration: number
}

export class PitchStateMachine {
  private currentStatus: TunerStatus = "IDLE"
  private consecutiveStableFrames = 0
  private holdStart = 0

  constructor(
    private minHoldMs: number,
    private toleranceCents: number,
    private rmsThreshold: number,
  ) {}

  transition(event: PitchTransitionEvent): TunerStatus {
    switch (event.type) {
      case "PITCH_LOST":
        this.consecutiveStableFrames = 0
        this.holdStart = 0
        return "PITCH_DETECTING"

      case "PITCH_DETECTED":
        if (event.rms < this.rmsThreshold) {
          this.consecutiveStableFrames = 0
          this.holdStart = 0
          return "PITCH_DETECTING"
        }

        const isInTune = Math.abs(event.cents) < this.toleranceCents && event.confidence > 0.6

        if (isInTune) {
          this.consecutiveStableFrames++
          if (this.holdStart === 0) {
            this.holdStart = Date.now()
          }

          if (event.holdDuration >= this.minHoldMs + 300) {
            // NOTE_TRANSITION_BUFFER_MS
            return "NOTE_COMPLETE"
          }

          return "PITCH_STABLE"
        } else {
          this.consecutiveStableFrames = 0
          this.holdStart = 0
          return "PITCH_DETECTING"
        }

      case "NOTE_COMPLETE":
        this.consecutiveStableFrames = 0
        this.holdStart = 0
        return "IDLE"

      case "CALIBRATION_CLICK":
        return "CALIBRATING"

      default:
        return this.currentStatus
    }
  }

  reset() {
    this.currentStatus = "IDLE"
    this.consecutiveStableFrames = 0
    this.holdStart = 0
  }

  getConsecutiveStableFrames(): number {
    return this.consecutiveStableFrames
  }

  getHoldStart(): number {
    return this.holdStart
  }
}
