/**
 * @fileoverview Value Object representing a raw pitch detection sample from DSP analysis.
 * Part of the DSP (Digital Signal Processing) domain.
 */

/**
 * Immutable Value Object representing a single pitch detection sample.
 * Encapsulates DSP-level data without any musical interpretation.
 */
export class PitchSample {
  private constructor(
    public readonly frequency: number,
    public readonly confidence: number,
    public readonly rms: number,
    public readonly timestamp: number
  ) {
    this.validate();
  }

  /**
   * Factory method to create a PitchSample with validation.
   */
  static create(
    frequency: number,
    confidence: number,
    rms: number,
    timestamp: number = Date.now()
  ): PitchSample {
    return new PitchSample(frequency, confidence, rms, timestamp);
  }

  /**
   * Validates the sample data.
   * @throws {Error} if validation fails
   */
  private validate(): void {
    if (this.frequency < 0) {
      throw new Error(`Invalid frequency: ${this.frequency}. Must be >= 0`);
    }

    if (this.confidence < 0 || this.confidence > 1) {
      throw new Error(`Invalid confidence: ${this.confidence}. Must be between 0 and 1`);
    }

    if (this.rms < 0) {
      throw new Error(`Invalid RMS: ${this.rms}. Must be >= 0`);
    }

    if (this.timestamp < 0) {
      throw new Error(`Invalid timestamp: ${this.timestamp}. Must be >= 0`);
    }
  }

  /**
   * Checks if the sample meets minimum quality thresholds.
   */
  isValid(minConfidence: number = 0.9, minRms: number = 0.01): boolean {
    return (
      this.frequency > 0 &&
      this.confidence >= minConfidence &&
      this.rms >= minRms
    );
  }

  /**
   * Returns true if this sample has no detectable pitch.
   */
  isSilence(rmsThreshold: number = 0.01): boolean {
    return this.rms < rmsThreshold;
  }

  /**
   * Compares two samples for equality (useful for testing).
   */
  equals(other: PitchSample): boolean {
    return (
      this.frequency === other.frequency &&
      this.confidence === other.confidence &&
      this.rms === other.rms &&
      this.timestamp === other.timestamp
    );
  }

  /**
   * Creates a new sample with modified values (immutable update).
   */
  withFrequency(frequency: number): PitchSample {
    return PitchSample.create(frequency, this.confidence, this.rms, this.timestamp);
  }

  withConfidence(confidence: number): PitchSample {
    return PitchSample.create(this.frequency, confidence, this.rms, this.timestamp);
  }

  withRms(rms: number): PitchSample {
    return PitchSample.create(this.frequency, this.confidence, rms, this.timestamp);
  }

  /**
   * String representation for debugging.
   */
  toString(): string {
    return `PitchSample(freq=${this.frequency.toFixed(2)}Hz, conf=${(this.confidence * 100).toFixed(1)}%, rms=${this.rms.toFixed(4)})`;
  }
}
