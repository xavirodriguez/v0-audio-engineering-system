import { describe, test, expect } from 'vitest';
import { decidePracticeAction, calculateNextPracticeState, type PracticeContext, type PracticeState } from '../practice-rules';

describe('decidePracticeAction', () => {
  const baseContext: PracticeContext = {
    status: 'PITCH_DETECTING',
    currentNote: { frequency: 440, midi: 69, name: 'A4' },
    observation: { frequency: 440, confidence: 0.95, rms: 0.05, cents: 0 },
    thresholds: { rmsThreshold: 0.03, toleranceCents: 50, minConfidence: 0.6 },
    timing: { consecutiveStableFrames: 0, holdDurationMs: 0, minHoldMs: 1000 },
  };

  test('ignores when status is IDLE', () => {
    const context = { ...baseContext, status: 'IDLE' as const };
    expect(decidePracticeAction(context)).toEqual({ type: 'IGNORE' });
  });

  test('ignores when status is CALIBRATING', () => {
    const context = { ...baseContext, status: 'CALIBRATING' as const };
    expect(decidePracticeAction(context)).toEqual({ type: 'IGNORE' });
  });

  test('rejects when RMS below threshold', () => {
    const context = {
      ...baseContext,
      observation: { ...baseContext.observation, rms: 0.01 },
    };
    expect(decidePracticeAction(context)).toEqual({
      type: 'REJECT',
      reason: 'VOLUME_TOO_LOW',
    });
  });

  test('rejects when confidence below threshold', () => {
    const context = {
      ...baseContext,
      observation: { ...baseContext.observation, confidence: 0.5 },
    };
    expect(decidePracticeAction(context)).toEqual({
      type: 'REJECT',
      reason: 'CONFIDENCE_TOO_LOW',
    });
  });

  test('rejects when cents deviation exceeds tolerance', () => {
    const context = {
      ...baseContext,
      observation: { ...baseContext.observation, cents: 60 },
    };
    expect(decidePracticeAction(context)).toEqual({
      type: 'REJECT',
      reason: 'OUT_OF_TUNE',
    });
  });

  test('advances note when hold duration exceeds minimum + buffer', () => {
    const context = {
      ...baseContext,
      timing: { ...baseContext.timing, holdDurationMs: 1350 },
    };
    expect(decidePracticeAction(context)).toEqual({ type: 'ADVANCE_NOTE' });
  });

  test('accepts when all conditions met but hold not long enough', () => {
    const context = {
      ...baseContext,
      timing: { ...baseContext.timing, holdDurationMs: 800 },
    };
    const result = decidePracticeAction(context);
    expect(result.type).toBe('ACCEPT');
    if (result.type === 'ACCEPT') {
      expect(result.feedback.quality).toBe('good');
    }
  });
});

describe('calculateNextPracticeState', () => {
  const baseState: PracticeState = {
    currentNoteIndex: 0,
    notes: [
      { name: 'A4', midi: 69, frequency: 440 },
      { name: 'B4', midi: 71, frequency: 493.88 },
      { name: 'C5', midi: 72, frequency: 523.25 },
    ],
  };

  test('advances to the next note correctly', () => {
    const result = calculateNextPracticeState(baseState);
    expect(result.status).toBe('CONTINUE');
    expect(result.newState.currentNoteIndex).toBe(1);
    expect(result.newState.targetNoteMidi).toBe(71);
    expect(result.newState.targetFreqHz).toBe(493.88);
    expect(result.newState.consecutiveStableFrames).toBe(0);
    expect(result.newState.holdStart).toBe(0);
    expect(result.newState.accuracy).toBe(Math.round((1 / 3) * 100));
  });

  test('completes the practice when on the last note', () => {
    const state = { ...baseState, currentNoteIndex: 2 };
    const result = calculateNextPracticeState(state);
    expect(result.status).toBe('COMPLETED');
    expect(result.newState.status).toBe('IDLE');
    expect(result.newState.accuracy).toBe(100);
  });
});
