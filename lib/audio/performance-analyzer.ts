/**
 * @fileoverview Analyzes recordings of practice sessions to provide detailed feedback.
 */

import {
  PitchSample,
  MusicalNote,
  PitchToMusicAdapter,
  MusicToLearningAdapter,
  PerformanceFeedback,
} from '@/lib/domains';

// Assuming a 'Recording' type that has pitch points
interface Recording {
  pitchPoints: {
    frequency: number;
    confidence: number;
    rms: number;
  }[];
}

/**
 * Analyzes a recorded performance to generate feedback and recommendations.
 */
export class PerformanceAnalyzer {
  private musicAdapter = new PitchToMusicAdapter();
  private learningAdapter = new MusicToLearningAdapter();

  /**
   * Analyzes a complete recording against a set of target notes.
   * @param {Recording} recording - The recorded performance data.
   * @param {MusicalNote[]} targetNotes - The sequence of notes for the exercise.
   * @returns {PerformanceFeedback} - The final, aggregated feedback for the session.
   */
  analyzeRecording(
    recording: Recording,
    targetNotes: MusicalNote[]
  ): PerformanceFeedback {
    // Reset adapters for a fresh analysis of the recording
    this.musicAdapter.reset();
    this.learningAdapter.reset();

    let finalFeedback = PerformanceFeedback.empty();

    // Process each recorded pitch point through the domain pipeline
    for (let i = 0; i < recording.pitchPoints.length; i++) {
      const point = recording.pitchPoints[i];

      const sample = PitchSample.create(
        point.frequency,
        point.confidence,
        point.rms
      );

      const observation = this.musicAdapter.translate(sample);

      if (observation && observation.isReliable()) {
        // Determine the target note for this point in the recording
        const targetNote = targetNotes[i % targetNotes.length]; // Simple loop for now

        // Translate the observation into learning feedback
        finalFeedback = this.learningAdapter.translate(
          observation,
          targetNote,
          targetNotes.length
        );
      }
    }

    return finalFeedback;
  }

  /**
   * Generates pedagogical recommendations based on the performance feedback.
   * @param {PerformanceFeedback} feedback - The feedback generated from the analysis.
   * @returns {string[]} - A list of actionable recommendations for the user.
   */
  generateRecommendations(feedback: PerformanceFeedback): string[] {
    const recommendations: string[] = [];

    if (feedback.metrics.accuracy < 70) {
      recommendations.push('Focus on pitch accuracy. Try practicing with a tuner.');
    }

    if (feedback.metrics.averageDeviation > 20) {
      recommendations.push('Work on reducing pitch deviation. Practice long tones.');
    }

    if (feedback.metrics.maxStreak < 5 && feedback.metrics.notesTotal > 10) {
      recommendations.push('Build consistency. Focus on maintaining steady pitch from one note to the next.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Great job! Your performance was solid.');
    }

    return recommendations;
  }
}
