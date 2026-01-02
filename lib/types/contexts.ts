import { AppError } from "@/lib/errors/app-errors";
import { Recording } from "./recording";
import { PitchDetectionStatus } from "./pitch-detection";
import type { EmptyObject } from "./common"

// Define placeholder types for states that are not yet defined
// This allows us to define the context values without having the full state implementation yet.
type PitchDetectionState = {
  status: PitchDetectionStatus;
  currentPitch: number;
  currentCents: number;
  currentConfidence: number;
  targetFreqHz: number;
  error: AppError | null;
};

type RecordingState = {
  recordings: Recording[];
  isRecording: boolean;
  currentRecording: Recording | null;
};

type ExerciseState = Record<string, unknown>;

type UIState = Record<string, unknown>;

export type AudioContextValue = {
  audioContext: AudioContext | null;
  analyser: AnalyserNode | null;
  mediaStream: MediaStream | null;
  isReady: boolean;
  error: AppError | null;
  initialize: (signal?: AbortSignal) => Promise<void>;
  cleanup: () => void;
};

export type PracticeSessionContextValue = {
  // Unified state
  audio: AudioContextValue;
  pitch: PitchDetectionState;
  recording: RecordingState;
  exercises: ExerciseState;
  ui: UIState;

  // Actions
  actions: {
    startSession: () => void;
    stopSession: () => void;
    startRecording: () => void;
    stopRecording: () => void;
  };
};

export type RecordingContextValue = {
  recordings: Recording[];
  isRecording: boolean;
  currentRecording: Recording | null;
  startRecording: (stream: MediaStream) => Promise<void>;
  stopRecording: () => Promise<Recording | null>;
  deleteRecording: (id: string) => void;
};
