/**
 * @fileoverview Value Object representing comprehensive performance feedback.
 * Part of the Learning domain - aggregates multiple signals into cohesive feedback.
 */

import { LearningSignal } from './learning-signal';
import { MusicalNote } from '../music/musical-note';

/**
 * Performance metrics for a practice session.
 */
export interface PerformanceMetrics {
  readonly accuracy: number;
  readonly averageDeviation: number;
  readonly currentStreak: number;
  readonly maxStreak: number;
  readonly notesCompleted: number;
  readonly notesTotal: number;
}

/**
 * Immutable Value Object representing comprehensive performance feedback.
 */
export class PerformanceFeedback {
  private constructor(
    public readonly signals: ReadonlyArray<LearningSignal>,
    public readonly metrics: PerformanceMetrics,
    public readonly currentNote: MusicalNote | null,
    public readonly targetNote: MusicalNote | null,
    public readonly timestamp: number
  ) {
    this.validate();
  }

  /**
   * Factory method to create PerformanceFeedback.
   */
  static create(
    signals: LearningSignal[],
    metrics: PerformanceMetrics,
    currentNote: MusicalNote | null = null,
    targetNote: MusicalNote | null = null
  ): PerformanceFeedback {
    return new PerformanceFeedback(
      Object.freeze([...signals]),
      metrics,
      currentNote,
      targetNote,
      Date.now()
    );
  }

  /**
   * Creates an empty feedback instance.
   */
  static empty(): PerformanceFeedback {
    return PerformanceFeedback.create(
      [],
      {
        accuracy: 0,
        averageDeviation: 0,
        currentStreak: 0,
        maxStreak: 0,
        notesCompleted: 0,
        notesTotal: 0,
      }
    );
  }

  private validate(): void {
    const { accuracy, averageDeviation, currentStreak, maxStreak, notesCompleted, notesTotal } = this.metrics;

    if (accuracy < 0 || accuracy > 100) {
      throw new Error(`Invalid accuracy: ${accuracy}. Must be 0-100`);
    }

    if (averageDeviation < 0) {
      throw new Error(`Invalid average deviation: ${averageDeviation}. Must be >= 0`);
    }

    if (currentStreak < 0) {
      throw new Error(`Invalid current streak: ${currentStreak}. Must be >= 0`);
    }

    if (maxStreak < 0) {
      throw new Error(`Invalid max streak: ${maxStreak}. Must be >= 0`);
    }

    if (notesCompleted < 0 || notesTotal < 0) {
      throw new Error('Notes completed/total must be >= 0');
    }

    if (notesCompleted > notesTotal) {
      throw new Error('Notes completed cannot exceed notes total');
    }
  }

  /**
   * Returns only signals that should trigger notifications.
   */
  getNotificationSignals(): LearningSignal[] {
    return this.signals.filter(signal => signal.requiresNotification());
  }

  /**
   * Returns signals of a specific type.
   */
  getSignalsByType(type: LearningSignal['type']): LearningSignal[] {
    return this.signals.filter(signal => signal.type === type);
  }

  /**
   * Checks if there are any success signals.
   */
  hasSuccessSignals(): boolean {
    return this.signals.some(signal => signal.isSuccess());
  }

  /**
   * Checks if there are any warning signals.
   */
  hasWarningSignals(): boolean {
    return this.signals.some(signal => signal.isWarning());
  }

  /**
   * Returns progress as a percentage (0-100).
   */
  getProgressPercentage(): number {
    if (this.metrics.notesTotal === 0) return 0;
    return (this.metrics.notesCompleted / this.metrics.notesTotal) * 100;
  }

  /**
   * Checks if the current note matches the target.
   */
  isOnTarget(): boolean {
    if (!this.currentNote || !this.targetNote) return false;
    return this.currentNote.matchesTarget(this.targetNote);
  }

  /**
   * Checks if the current note is in tune with the target.
   */
  isInTune(toleranceCents: number = 10): boolean {
    if (!this.currentNote || !this.targetNote) return false;
    return (
      this.currentNote.matchesTarget(this.targetNote) &&
      this.currentNote.isInTune(toleranceCents)
    );
  }

  /**
   * Creates new feedback with additional signal.
   */
  withSignal(signal: LearningSignal): PerformanceFeedback {
    return PerformanceFeedback.create(
      [...this.signals, signal],
      this.metrics,
      this.currentNote,
      this.targetNote
    );
  }

  /**
   * Creates new feedback with updated metrics.
   */
  withMetrics(metrics: Partial<PerformanceMetrics>): PerformanceFeedback {
    return PerformanceFeedback.create(
      [...this.signals],
      { ...this.metrics, ...metrics },
      this.currentNote,
      this.targetNote
    );
  }

  /**
   * Creates new feedback with updated notes.
   */
  withNotes(currentNote: MusicalNote | null, targetNote: MusicalNote | null): PerformanceFeedback {
    return PerformanceFeedback.create(
      [...this.signals],
      this.metrics,
      currentNote,
      targetNote
    );
  }

  /**
   * Compares two feedback instances for equality.
   */
  equals(other: PerformanceFeedback): boolean {
    return (
      JSON.stringify(this.metrics) === JSON.stringify(other.metrics) &&
      this.signals.length === other.signals.length &&
      this.signals.every((signal, i) => signal.equals(other.signals[i]))
    );
  }

  /**
   * String representation for debugging.
   */
  toString(): string {
    const progress = `${this.metrics.notesCompleted}/${this.metrics.notesTotal}`;
    const accuracy = `${this.metrics.accuracy.toFixed(1)}%`;
    const streak = `streak: ${this.metrics.currentStreak}`;
    return `PerformanceFeedback[${progress}, ${accuracy}, ${streak}, ${this.signals.length} signals]`;
  }
}
