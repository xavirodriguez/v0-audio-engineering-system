export interface WindowWithWebkitAudio extends Window {
  webkitAudioContext?: typeof AudioContext;
}

export interface MediaTrackSettings {
  latency?: number;
  [key: string]: any;
}

export interface WASMModuleExports extends WebAssembly.Exports {
  __heap_base?: WebAssembly.Global;
  process_audio_yin?: (bufferPtr: number, length: number, threshold: number) => number;
  process_audio_autocorr?: (bufferPtr: number, length: number) => number;
  get_rms?: (bufferPtr: number, length: number) => number;
}

export interface ExerciseRecord {
  id: string;
  type: string;
  difficulty: string;
  [key: string]: any;
}

export interface UserProfileRecord {
  id: string;
  name: string;
  [key: string]: any;
}

export interface SessionDataRecord {
  id: string;
  timestamp: number;
  [key: string]: any;
}

export interface CustomExerciseParams {
  type: string;
  difficulty: string;
  [key:string]: any;
}

export type AnalyticsEventProperties = Record<string, unknown>;

export type EmptyObject = Record<string, unknown>;
