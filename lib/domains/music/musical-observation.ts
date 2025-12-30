/**
 * @fileoverview Value Object representing an observed musical performance event.
 * Part of the Music domain - represents what was actually played/detected.
 */

import { MusicalNote } from './musical-note';

/**
 * Immutable Value Object representing a musical observation over time.
 * Combines note information with stability and quality metrics.
 */
export class MusicalObservation {
  private constructor(
    public readonly note: MusicalNote,
    public readonly confidence: number,
    public readonly timestamp: number,
    public readonly stableFrames: number,
    public readonly isStable: boolean
  ) {
    this.validate();
  }

  /**
   * Factory method to create a MusicalObservation.
   */
  static create(
    note: MusicalNote,
    confidence: number,
    timestamp: number = Date.now(),
    stableFrames: number = 0
  ): MusicalObservation {
    const isStable = stableFrames >= MusicalObservation.STABILITY_THRESHOLD;
    return new MusicalObservation(note, confidence, timestamp, stableFrames, isStable);
  }

  /**
   * Minimum frames required to consider a note stable.
   */
  static readonly STABILITY_THRESHOLD = 5;

  /**
   * Minimum confidence to consider observation reliable.
   */
  static readonly MIN_CONFIDENCE = 0.9;

  private validate(): void {
    if (this.confidence < 0 || this.confidence > 1) {
      throw new Error(`Invalid confidence: ${this.confidence}. Must be 0-1`);
    }

    if (this.stableFrames < 0) {
      throw new Error(`Invalid stable frames: ${this.stableFrames}. Must be >= 0`);
    }

    if (this.timestamp < 0) {
      throw new Error(`Invalid timestamp: ${this.timestamp}. Must be >= 0`);
    }
  }

  /**
   * Checks if this observation is reliable enough for feedback.
   */
  isReliable(): boolean {
    return this.confidence >= MusicalObservation.MIN_CONFIDENCE && this.isStable;
  }

  /**
   * Creates a new observation with incremented stable frames.
   */
  incrementStability(): MusicalObservation {
    return MusicalObservation.create(
      this.note,
      this.confidence,
      this.timestamp,
      this.stableFrames + 1
    );
  }

  /**
   * Creates a new observation with reset stability (note changed).
   */
  resetStability(): MusicalObservation {
    return MusicalObservation.create(
      this.note,
      this.confidence,
      Date.now(),
      0
    );
  }

  /**
   * Checks if this observation matches a target note within tolerance.
   */
  matchesTarget(target: MusicalNote, toleranceCents: number = 10): boolean {
    return (
      this.note.matchesTarget(target) &&
      Math.abs(this.note.centsDeviation - target.centsDeviation) <= toleranceCents
    );
  }

  /**
   * Calculates accuracy percentage relative to a target note.
   * Returns 100% if perfectly in tune, decreasing with deviation.
   */
  accuracyRelativeTo(target: MusicalNote): number {
    if (!this.note.matchesTarget(target)) {
      return 0; // Wrong note entirely
    }

    // Calculate accuracy based on cents deviation
    // Perfect = 100%, 50 cents off = 0%
    const maxDeviation = 50;
    const actualDeviation = Math.abs(this.note.centsDeviation);
    const accuracy = Math.max(0, 100 * (1 - actualDeviation / maxDeviation));

    return accuracy;
  }

  /**
   * Compares two observations for equality.
   */
  equals(other: MusicalObservation): boolean {
    return (
      this.note.equals(other.note) &&
      Math.abs(this.confidence - other.confidence) < 0.01 &&
      this.stableFrames === other.stableFrames
    );
  }

  /**
   * String representation for debugging.
   */
  toString(): string {
    const status = this.isStable ? 'STABLE' : 'UNSTABLE';
    return `Observation[${this.note.toString()}, ${status}, frames=${this.stableFrames}, conf=${(this.confidence * 100).toFixed(1)}%]`;
  }
}
