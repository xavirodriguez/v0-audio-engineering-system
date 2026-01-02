/**
 * @fileoverview Adapter that translates Music domain concepts to Learning domain concepts.
 * Implements pedagogical logic and feedback generation rules.
 */

import { MusicalObservation } from '../music/musical-observation';
import { MusicalNote } from '../music/musical-note';
import { LearningSignal } from '../learning/learning-signal';
import { PerformanceFeedback, PerformanceMetrics } from '../learning/performance-feedback';

/**
 * Configuration for feedback generation rules.
 */
export interface MusicToLearningAdapterConfig {
  inTuneTolerance: number;
  streakMilestones: number[];
  minAccuracyForSuccess: number;
  improvementThreshold: number;
}

/**
 * Default configuration values.
 */
const DEFAULT_CONFIG: MusicToLearningAdapterConfig = {
  inTuneTolerance: 10, // cents
  streakMilestones: [3, 5, 10, 20, 50],
  minAccuracyForSuccess: 80, // percentage
  improvementThreshold: 5, // percentage
};

/**
 * State tracked by the adapter for feedback generation.
 */
interface AdapterState {
  currentStreak: number;
  maxStreak: number;
  notesCompleted: number;
  totalAccuracy: number;
  previousAccuracy: number;
  deviations: number[];
}

/**
 * Adapter that translates musical observations into learning feedback.
 * Maintains state for streak tracking and performance analysis.
 */
export class MusicToLearningAdapter {
  private state: AdapterState;
  private readonly config: MusicToLearningAdapterConfig;

  constructor(config: Partial<MusicToLearningAdapterConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = this.createInitialState();
  }

  /**
   * Translates a musical observation into learning feedback.
   */
  translate(
    observation: MusicalObservation,
    targetNote: MusicalNote,
    totalNotes: number
  ): PerformanceFeedback {
    const signals: LearningSignal[] = [];

    // Only generate feedback for reliable observations
    if (!observation.isReliable()) {
      return this.createFeedback(signals, targetNote, observation.note, totalNotes);
    }

    // Check if note matches target
    const matchesTarget = observation.note.matchesTarget(targetNote);
    const accuracy = observation.accuracyRelativeTo(targetNote);

    if (matchesTarget) {
      // Generate tuning feedback
      const tuningSignals = this.generateTuningFeedback(observation, targetNote);
      signals.push(...tuningSignals);

      // Update streak
      if (accuracy >= this.config.minAccuracyForSuccess) {
        const streakSignals = this.updateStreak(true, observation.note.getFullName(), accuracy);
        signals.push(...streakSignals);

        // Track accuracy for improvement detection
        this.state.totalAccuracy += accuracy;
        this.state.notesCompleted++;
        this.state.deviations.push(Math.abs(observation.note.centsDeviation));
      } else {
        const streakSignals = this.updateStreak(false, observation.note.getFullName(), accuracy);
        signals.push(...streakSignals);
      }
    } else {
      // Wrong note - break streak
      const streakSignals = this.updateStreak(false, observation.note.getFullName(), 0);
      signals.push(...streakSignals);
    }

    // Check for improvement
    const improvementSignal = this.checkForImprovement();
    if (improvementSignal) {
      signals.push(improvementSignal);
    }

    return this.createFeedback(signals, targetNote, observation.note, totalNotes);
  }

  /**
   * Generates tuning feedback signals based on cents deviation.
   */
  private generateTuningFeedback(
    observation: MusicalObservation,
    targetNote: MusicalNote
  ): LearningSignal[] {
    const signals: LearningSignal[] = [];
    const { note } = observation;
    const deviation = note.centsDeviation;
    const noteName = note.getFullName();

    if (note.isInTune(this.config.inTuneTolerance)) {
      signals.push(LearningSignal.pitchAccurate(deviation, noteName));
    } else if (note.isSharp()) {
      signals.push(LearningSignal.pitchSharp(deviation, noteName));
    } else if (note.isFlat()) {
      signals.push(LearningSignal.pitchFlat(deviation, noteName));
    }

    return signals;
  }

  /**
   * Updates streak and generates relevant signals.
   */
  private updateStreak(
    success: boolean,
    noteName: string,
    accuracy: number
  ): LearningSignal[] {
    const signals: LearningSignal[] = [];

    if (success) {
      this.state.currentStreak++;

      // Update max streak
      if (this.state.currentStreak > this.state.maxStreak) {
        this.state.maxStreak = this.state.currentStreak;
      }

      // Check for milestone
      if (this.config.streakMilestones.includes(this.state.currentStreak)) {
        signals.push(LearningSignal.streakMilestone(this.state.currentStreak));
      }

      // Generate note completed signal
      signals.push(LearningSignal.noteCompleted(noteName, accuracy));
    } else {
      // Break streak
      if (this.state.currentStreak >= 5) {
        signals.push(LearningSignal.streakBroken(this.state.currentStreak));
      }
      this.state.currentStreak = 0;
    }

    return signals;
  }

  /**
   * Checks for improvement in recent performance.
   */
  private checkForImprovement(): LearningSignal | null {
    // Need at least 10 notes to detect improvement
    if (this.state.notesCompleted < 10) {
      return null;
    }

    // Calculate current average accuracy
    const currentAccuracy = this.state.totalAccuracy / this.state.notesCompleted;

    // Check if we have previous data to compare
    if (this.state.previousAccuracy > 0) {
      const improvement = currentAccuracy - this.state.previousAccuracy;

      if (improvement >= this.config.improvementThreshold) {
        this.state.previousAccuracy = currentAccuracy;
        return LearningSignal.improvementDetected('accuracy', improvement);
      }
    } else {
      // First time - just save for next comparison
      this.state.previousAccuracy = currentAccuracy;
    }

    return null;
  }

  /**
   * Creates a PerformanceFeedback instance from current state.
   */
  private createFeedback(
    signals: LearningSignal[],
    targetNote: MusicalNote | null,
    currentNote: MusicalNote | null,
    totalNotes: number
  ): PerformanceFeedback {
    const metrics: PerformanceMetrics = {
      accuracy: this.calculateAccuracy(),
      averageDeviation: this.calculateAverageDeviation(),
      currentStreak: this.state.currentStreak,
      maxStreak: this.state.maxStreak,
      notesCompleted: this.state.notesCompleted,
      notesTotal: totalNotes,
    };

    return PerformanceFeedback.create(signals, metrics, currentNote, targetNote);
  }

  /**
   * Calculates overall accuracy percentage.
   */
  private calculateAccuracy(): number {
    if (this.state.notesCompleted === 0) return 0;
    return this.state.totalAccuracy / this.state.notesCompleted;
  }

  /**
   * Calculates average cents deviation.
   */
  private calculateAverageDeviation(): number {
    if (this.state.deviations.length === 0) return 0;
    const sum = this.state.deviations.reduce((a, b) => a + b, 0);
    return sum / this.state.deviations.length;
  }

  /**
   * Resets the adapter to initial state.
   */
  reset(): void {
    this.state = this.createInitialState();
  }

  /**
   * Creates initial state.
   */
  private createInitialState(): AdapterState {
    return {
      currentStreak: 0,
      maxStreak: 0,
      notesCompleted: 0,
      totalAccuracy: 0,
      previousAccuracy: 0,
      deviations: [],
    };
  }

  /**
   * Returns the current state (for debugging/testing).
   */
  getState(): Readonly<AdapterState> {
    return { ...this.state };
  }

  /**
   * Updates the adapter configuration.
   */
  updateConfig(config: Partial<MusicToLearningAdapterConfig>): void {
    Object.assign(this.config, config);
  }
}
