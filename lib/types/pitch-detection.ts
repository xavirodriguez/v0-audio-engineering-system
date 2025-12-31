import { MusicalObservation, PerformanceFeedback, MusicalNote } from '@/lib/domains';

export interface PitchDetectionState {
  currentObservation: MusicalObservation | null;
  feedback: PerformanceFeedback;
  targetNote: MusicalNote | null;
}

export interface PracticeNote {
  name: string;
  octave: number;
  freqHz: number;
  midi: number;
}
