import { frequencyToCents } from "./note-utils";

/**
 * Represents a single data point of a detected pitch.
 */
export interface PitchDataPoint {
  frequency: number;
  confidence: number;
  timestamp: number;
}

/**
 * Calculates the accuracy of a played note based on a history of pitch data points.
 *
 * This function uses a weighted formula to provide a holistic score:
 * - 40% based on the average pitch deviation (cents).
 * - 30% based on the average confidence of the pitch detection algorithm.
 * - 20% based on the stability of the pitch (low variance).
 * - 10% based on the hold duration.
 *
 * @param pitchHistory An array of pitch data points recorded while the note was held.
 * @param targetFrequency The target frequency of the note in Hz.
 * @param holdDuration The total duration the note was held in milliseconds.
 * @returns An accuracy score from 0 to 100.
 */
export function calculateNoteAccuracy(
  pitchHistory: PitchDataPoint[],
  targetFrequency: number,
  holdDuration: number
): number {
  if (pitchHistory.length === 0) return 0;

  // 1. Calculate average cents deviation and confidence
  let totalCentsDeviation = 0;
  let totalConfidence = 0;
  for (const p of pitchHistory) {
    totalCentsDeviation += Math.abs(frequencyToCents(p.frequency, targetFrequency));
    totalConfidence += p.confidence;
  }
  const avgCents = totalCentsDeviation / pitchHistory.length;
  const avgConfidence = totalConfidence / pitchHistory.length;

  // 2. Calculate stability (inverse of variance)
  let variance = 0;
  for (const p of pitchHistory) {
    const cents = frequencyToCents(p.frequency, targetFrequency);
    variance += Math.pow(cents - avgCents, 2);
  }
  variance /= pitchHistory.length;
  const stability = Math.max(0, 100 - Math.sqrt(variance) * 10); // Scale variance to a 0-100 score

  // 3. Score the duration
  const durationScore = Math.min(100, (holdDuration / 1500) * 100); // 1.5s = 100% score

  // 4. Calculate weighted scores
  const centsScore = Math.max(0, 100 - avgCents * 4); // Each cent of error reduces score by 4
  const confidenceScore = avgConfidence * 100;

  const finalAccuracy =
    centsScore * 0.4 +         // 40% weight: Pitch precision
    confidenceScore * 0.3 +     // 30% weight: Detector confidence
    stability * 0.2 +           // 20% weight: Pitch stability
    durationScore * 0.1;        // 10% weight: Hold duration

  return Math.round(Math.max(0, Math.min(100, finalAccuracy)));
}
