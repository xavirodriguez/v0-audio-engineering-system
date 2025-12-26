/**
 * @fileoverview Analyzes real-time performance data to provide gamification feedback.
 * This class processes a stream of pitch data, tracks metrics like accuracy and streaks,
 * and emits events through the FeedbackEventBus to trigger UI notifications.
 */

import { feedbackBus, FeedbackEventType } from "@/lib/events";
import type { PitchEvent } from "@/lib/types/pitch-detection";

const ACCURACY_THRESHOLD = 0.85; // 85% accuracy required for a note to be "accurate"
const STREAK_MILESTONES = [5, 10, 20, 50, 100]; // Milestones for streak notifications

/**
 * Configuration options for the PerformanceAnalyzer.
 */
interface PerformanceAnalyzerConfig {
  targetNote: string;
  targetFreqHz: number;
}

/**
 * Analyzes performance data and emits feedback events.
 */
export class PerformanceAnalyzer {
  private streakCount = 0;
  private config: PerformanceAnalyzerConfig;

  constructor(config: PerformanceAnalyzerConfig) {
    this.config = config;
    feedbackBus.emit(FeedbackEventType.SESSION_STARTED, undefined, "Practice session started.");
  }

  /**
   * Processes a single pitch event from the audio pipeline.
   * @param {PitchEvent} pitchEvent - The pitch data to analyze.
   */
  public processPitch(pitchEvent: PitchEvent): void {
    if (!pitchEvent.clarity || pitchEvent.clarity < ACCURACY_THRESHOLD) {
      this.handleInaccuratePitch();
      return;
    }

    const centsOff = Math.abs(pitchEvent.cents || 0);

    if (centsOff <= 15) {
      this.handleAccuratePitch();
    } else if (pitchEvent.cents > 15) {
      this.handleInaccuratePitch(pitchEvent.cents);
    } else {
      this.handleInaccuratePitch(pitchEvent.cents);
    }
  }

  /**
   * Handles a successful, accurate pitch.
   */
  private handleAccuratePitch(): void {
    this.streakCount++;
    feedbackBus.emit(
      FeedbackEventType.PITCH_ACCURATE,
      { note: this.config.targetNote },
      `Accurate pitch for ${this.config.targetNote}`
    );
    feedbackBus.emit(
      FeedbackEventType.STREAK_INCREMENTED,
      { count: this.streakCount },
      `Streak is now ${this.streakCount}`
    );

    if (STREAK_MILESTONES.includes(this.streakCount)) {
      feedbackBus.emit(
        FeedbackEventType.STREAK_MILESTONE,
        { count: this.streakCount },
        `Streak milestone reached: ${this.streakCount}!`
      );
    }
  }

  /**
   * Handles an inaccurate pitch, breaking any ongoing streak.
   * @param {number} [deviation] - The deviation in cents from the target.
   */
  private handleInaccuratePitch(deviation?: number): void {
    if (this.streakCount > 0) {
      feedbackBus.emit(
        FeedbackEventType.STREAK_BROKEN,
        { lastCount: this.streakCount },
        `Streak of ${this.streakCount} broken.`
      );
      this.streakCount = 0;
    }

    if (deviation) {
      const eventType = deviation > 0 ? FeedbackEventType.PITCH_SHARP : FeedbackEventType.PITCH_FLAT;
      const message = `Pitch is ${deviation > 0 ? 'sharp' : 'flat'} by ${Math.round(deviation)} cents.`
      feedbackBus.emit(eventType, { deviation }, message);
    }
  }

  /**
   * Cleans up when the practice session ends.
   */
  public cleanup(): void {
    feedbackBus.emit(
      FeedbackEventType.SESSION_ENDED,
      { duration: 0 }, // Duration can be calculated and passed in if needed
      "Practice session ended."
    );
  }
}
