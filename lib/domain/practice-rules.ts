// Tipos de entrada
export type PracticeContext = {
  readonly status: 'IDLE' | 'CALIBRATING' | 'PITCH_DETECTING' | 'PITCH_STABLE';
  readonly currentNote: {
    readonly frequency: number;
    readonly midi: number;
    readonly name: string;
  };
  readonly observation: {
    readonly frequency: number;
    readonly confidence: number;
    readonly rms: number;
    readonly cents: number; // Debe calcularse ANTES de pasar el contexto
  };
  readonly thresholds: {
    readonly rmsThreshold: number;
    readonly toleranceCents: number;
    readonly minConfidence: number;
  };
  readonly timing: {
    readonly consecutiveStableFrames: number;
    readonly holdDurationMs: number;
    readonly minHoldMs: number;
  };
};

// Tipos de salida
export type PracticeDecision =
  | { readonly type: 'IGNORE' }
  | {
      readonly type: 'ACCEPT';
      readonly feedback: {
        readonly message: string;
        readonly quality: 'excellent' | 'good' | 'needs-improvement';
      };
    }
  | { readonly type: 'REJECT'; readonly reason: RejectReason }
  | { readonly type: 'ADVANCE_NOTE' };

export type RejectReason =
  | 'VOLUME_TOO_LOW'
  | 'WRONG_NOTE'
  | 'CONFIDENCE_TOO_LOW'
  | 'OUT_OF_TUNE';

export function decidePracticeAction(
  context: PracticeContext
): PracticeDecision {
  // Guard: estados que ignoran input
  if (context.status === 'IDLE' || context.status === 'CALIBRATING') {
    return { type: 'IGNORE' };
  }

  // Guard: volumen insuficiente
  if (context.observation.rms < context.thresholds.rmsThreshold) {
    return { type: 'REJECT', reason: 'VOLUME_TOO_LOW' };
  }

  // Guard: confianza insuficiente
  if (context.observation.confidence < context.thresholds.minConfidence) {
    return { type: 'REJECT', reason: 'CONFIDENCE_TOO_LOW' };
  }

  // Evaluar entonación
  const isInTune = Math.abs(context.observation.cents) < context.thresholds.toleranceCents;

  if (!isInTune) {
    return { type: 'REJECT', reason: 'OUT_OF_TUNE' };
  }

  // Evaluar si debe avanzar
  const NOTE_TRANSITION_BUFFER_MS = 300;
  if (context.timing.holdDurationMs >= context.timing.minHoldMs + NOTE_TRANSITION_BUFFER_MS) {
    return { type: 'ADVANCE_NOTE' };
  }

  // Aceptar con feedback
  return {
    type: 'ACCEPT',
    feedback: {
      message: `Good! ${context.currentNote.name} held steadily`,
      quality: 'good',
    },
  };
}

// Types for note advancement
export type PracticeState = {
  readonly currentNoteIndex: number;
  readonly notes: ReadonlyArray<{
    readonly name: string;
    readonly midi: number;
    readonly frequency: number;
  }>;
};

export type NextStateResult = {
  readonly status: "CONTINUE" | "COMPLETED";
  readonly newState: Partial<PracticeState> & {
    readonly status?: "IDLE";
    readonly targetNoteMidi: number;
    readonly targetFreqHz: number;
    readonly consecutiveStableFrames: 0;
    readonly holdStart: 0;
    readonly accuracy?: number;
    readonly currentNoteIndex?: number;
  };
};


export function calculateNextPracticeState(
  currentState: PracticeState
): NextStateResult {
  const nextIndex = currentState.currentNoteIndex + 1;

  if (nextIndex >= currentState.notes.length) {
    return {
      status: "COMPLETED",
      newState: {
        status: "IDLE",
        accuracy: 100,
        targetNoteMidi: -1, // Or some other sentinel value
        targetFreqHz: -1,
        consecutiveStableFrames: 0,
        holdStart: 0,
      },
    };
  }

  const nextNote = currentState.notes[nextIndex];
  return {
    status: "CONTINUE",
    newState: {
      currentNoteIndex: nextIndex,
      targetNoteMidi: nextNote.midi,
      targetFreqHz: nextNote.frequency,
      consecutiveStableFrames: 0,
      holdStart: 0,
      accuracy: Math.round((nextIndex / currentState.notes.length) * 100),
    },
  };
}
