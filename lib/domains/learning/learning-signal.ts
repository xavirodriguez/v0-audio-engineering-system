/**
 * @fileoverview Value Object representing a learning/pedagogical signal.
 * Part of the Learning domain - focused on student progress and feedback.
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Types of learning signals that can be generated.
 */
export enum SignalType {
  PITCH_ACCURATE = 'PITCH_ACCURATE',
  PITCH_SHARP = 'PITCH_SHARP',
  PITCH_FLAT = 'PITCH_FLAT',
  STREAK_MILESTONE = 'STREAK_MILESTONE',
  STREAK_BROKEN = 'STREAK_BROKEN',
  IMPROVEMENT_DETECTED = 'IMPROVEMENT_DETECTED',
  NOTE_COMPLETED = 'NOTE_COMPLETED',
  EXERCISE_COMPLETED = 'EXERCISE_COMPLETED'
}

/**
 * Severity levels for learning signals.
 */
export enum SignalSeverity {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR'
}

/**
 * Immutable Value Object representing a learning signal/feedback event.
 */
export class LearningSignal {
  public readonly id: string;

  private constructor(
    public readonly type: SignalType,
    public readonly severity: SignalSeverity,
    public readonly message: string,
    public readonly data: Record<string, unknown>,
    public readonly timestamp: number,
    public readonly shouldNotify: boolean
  ) {
    this.id = uuidv4();
    this.validate();
  }

  /**
   * Factory method to create a LearningSignal.
   */
  static create(
    type: SignalType,
    severity: SignalSeverity,
    message: string,
    data: Record<string, unknown> = {},
    shouldNotify: boolean = true
  ): LearningSignal {
    return new LearningSignal(
      type,
      severity,
      message,
      data,
      Date.now(),
      shouldNotify
    );
  }

  /**
   * Creates a pitch accurate signal.
   */
  static pitchAccurate(centsDeviation: number, noteName: string): LearningSignal {
    return LearningSignal.create(
      SignalType.PITCH_ACCURATE,
      SignalSeverity.SUCCESS,
      `Perfect pitch on ${noteName}!`,
      { centsDeviation, noteName }
    );
  }

  /**
   * Creates a pitch sharp signal.
   */
  static pitchSharp(centsDeviation: number, noteName: string): LearningSignal {
    return LearningSignal.create(
      SignalType.PITCH_SHARP,
      SignalSeverity.WARNING,
      `${noteName} is ${Math.abs(centsDeviation).toFixed(0)}¢ sharp`,
      { centsDeviation, noteName },
      Math.abs(centsDeviation) > 25 // Only notify if significantly sharp
    );
  }

  /**
   * Creates a pitch flat signal.
   */
  static pitchFlat(centsDeviation: number, noteName: string): LearningSignal {
    return LearningSignal.create(
      SignalType.PITCH_FLAT,
      SignalSeverity.WARNING,
      `${noteName} is ${Math.abs(centsDeviation).toFixed(0)}¢ flat`,
      { centsDeviation, noteName },
      Math.abs(centsDeviation) > 25 // Only notify if significantly flat
    );
  }

  /**
   * Creates a streak milestone signal.
   */
  static streakMilestone(streakCount: number): LearningSignal {
    return LearningSignal.create(
      SignalType.STREAK_MILESTONE,
      SignalSeverity.SUCCESS,
      `${streakCount} notes in a row! 🔥`,
      { streakCount }
    );
  }

  /**
   * Creates a streak broken signal.
   */
  static streakBroken(previousStreak: number): LearningSignal {
    return LearningSignal.create(
      SignalType.STREAK_BROKEN,
      SignalSeverity.INFO,
      `Streak ended at ${previousStreak}`,
      { previousStreak },
      previousStreak >= 5 // Only notify if streak was significant
    );
  }

  /**
   * Creates an improvement detected signal.
   */
  static improvementDetected(metric: string, improvement: number): LearningSignal {
    return LearningSignal.create(
      SignalType.IMPROVEMENT_DETECTED,
      SignalSeverity.SUCCESS,
      `${metric} improved by ${improvement.toFixed(1)}%!`,
      { metric, improvement }
    );
  }

  /**
   * Creates a note completed signal.
   */
  static noteCompleted(noteName: string, accuracy: number): LearningSignal {
    return LearningSignal.create(
      SignalType.NOTE_COMPLETED,
      SignalSeverity.SUCCESS,
      `${noteName} completed with ${accuracy.toFixed(0)}% accuracy`,
      { noteName, accuracy },
      false // Don't notify for every note
    );
  }

  /**
   * Creates an exercise completed signal.
   */
  static exerciseCompleted(exerciseName: string, overallAccuracy: number): LearningSignal {
    return LearningSignal.create(
      SignalType.EXERCISE_COMPLETED,
      SignalSeverity.SUCCESS,
      `Exercise "${exerciseName}" completed! ${overallAccuracy.toFixed(0)}% accuracy`,
      { exerciseName, overallAccuracy }
    );
  }

  private validate(): void {
    if (!this.message || this.message.trim().length === 0) {
      throw new Error('Learning signal message cannot be empty');
    }

    if (this.timestamp < 0) {
      throw new Error(`Invalid timestamp: ${this.timestamp}`);
    }
  }

  /**
   * Checks if this is a success signal.
   */
  isSuccess(): boolean {
    return this.severity === SignalSeverity.SUCCESS;
  }

  /**
   * Checks if this is a warning signal.
   */
  isWarning(): boolean {
    return this.severity === SignalSeverity.WARNING;
  }

  /**
   * Checks if this signal requires user notification.
   */
  requiresNotification(): boolean {
    return this.shouldNotify;
  }

  /**
   * Creates a new signal with modified notification flag.
   */
  withNotification(shouldNotify: boolean): LearningSignal {
    return new LearningSignal(
      this.type,
      this.severity,
      this.message,
      this.data,
      this.timestamp,
      shouldNotify
    );
  }

  /**
   * Compares two signals for equality.
   */
  equals(other: LearningSignal): boolean {
    return (
      this.type === other.type &&
      this.severity === other.severity &&
      this.message === other.message &&
      JSON.stringify(this.data) === JSON.stringify(this.data)
    );
  }

  /**
   * String representation for debugging.
   */
  toString(): string {
    return `LearningSignal[${this.type}, ${this.severity}]: ${this.message}`;
  }
}
