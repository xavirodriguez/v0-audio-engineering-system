/**
 * @fileoverview Adapter that translates DSP domain concepts to Music domain concepts.
 * Implements the Anti-Corruption Layer pattern from DDD.
 */

import { PitchSample } from '../dsp/pitch-sample';
import { MusicalNote } from '../music/musical-note';
import { MusicalObservation } from '../music/musical-observation';

/**
 * Configuration for the adapter's translation logic.
 */
export interface PitchToMusicAdapterConfig {
  minConfidence: number;
  minRms: number;
  stabilityThreshold: number;
}

/**
 * Default configuration values.
 */
const DEFAULT_CONFIG: PitchToMusicAdapterConfig = {
  minConfidence: 0.9,
  minRms: 0.01,
  stabilityThreshold: 5,
};

/**
 * Adapter that translates DSP pitch samples into musical observations.
 * Maintains state for stability tracking across samples.
 */
export class PitchToMusicAdapter {
  private previousNote: MusicalNote | null = null;
  private stableFrameCount: number = 0;
  private readonly config: PitchToMusicAdapterConfig;

  constructor(config: Partial<PitchToMusicAdapterConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Translates a PitchSample to a MusicalObservation.
   * Maintains stability state across calls.
   */
  translate(sample: PitchSample): MusicalObservation | null {
    // Check if sample is silence
    if (sample.isSilence(this.config.minRms)) {
      this.reset();
      return null;
    }

    // Check if sample meets quality thresholds
    if (!sample.isValid(this.config.minConfidence, this.config.minRms)) {
      this.reset();
      return null;
    }

    // Convert frequency to musical note
    const note = MusicalNote.fromFrequency(sample.frequency);

    // Update stability tracking
    if (this.previousNote && this.isSameNote(note, this.previousNote)) {
      this.stableFrameCount++;
    } else {
      this.stableFrameCount = 1;
      this.previousNote = note;
    }

    // Create observation
    return MusicalObservation.create(
      note,
      sample.confidence,
      sample.timestamp,
      this.stableFrameCount
    );
  }

  /**
   * Translates a batch of samples efficiently.
   */
  translateBatch(samples: PitchSample[]): MusicalObservation[] {
    const observations: MusicalObservation[] = [];

    for (const sample of samples) {
      const observation = this.translate(sample);
      if (observation) {
        observations.push(observation);
      }
    }

    return observations;
  }

  /**
   * Resets the adapter's internal state.
   */
  reset(): void {
    this.previousNote = null;
    this.stableFrameCount = 0;
  }

  /**
   * Checks if two notes are considered "the same" for stability purposes.
   * Notes are the same if they have the same MIDI number.
   */
  private isSameNote(note1: MusicalNote, note2: MusicalNote): boolean {
    return note1.midiNumber === note2.midiNumber;
  }

  /**
   * Returns the current stability frame count.
   */
  getStableFrameCount(): number {
    return this.stableFrameCount;
  }

  /**
   * Returns the previous note (if any).
   */
  getPreviousNote(): MusicalNote | null {
    return this.previousNote;
  }

  /**
   * Updates the adapter configuration.
   */
  updateConfig(config: Partial<PitchToMusicAdapterConfig>): void {
    Object.assign(this.config, config);
  }
}
