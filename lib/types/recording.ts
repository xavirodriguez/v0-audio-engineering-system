/**
 * A recording.
 */
export interface Recording {
  id: string
  timestamp: number
  duration: number
  exerciseId?: string
  exerciseName?: string
  audioBlob: Blob
  audioUrl: string
  pitchData: PitchDataPoint[]
  waveformData: Float32Array
  spectrogramData: SpectrogramData
  analysis: RecordingAnalysis
}

/**
 * A pitch data point.
 */
export interface PitchDataPoint {
  timestamp: number // ms desde el inicio
  frequency: number // Hz
  cents: number // desviación en cents
  confidence: number
  rms: number
  targetFrequency?: number
  targetNote?: string
}

/**
 * The data for a spectrogram.
 */
export interface SpectrogramData {
  frequencies: number[] // Array de frecuencias (Hz)
  times: number[] // Array de tiempos (segundos)
  magnitudes: number[][] // Matriz [time][frequency] de magnitudes
  fftSize: number
  sampleRate: number
}

/**
 * The analysis of a recording.
 */
export interface RecordingAnalysis {
  overallAccuracy: number // 0-100
  averageDeviation: number // cents
  maxDeviation: number // cents
  stabilityScore: number // 0-100
  toneQuality: number // 0-100
  intonationGraph: IntonationPoint[]
  problemAreas: ProblemArea[]
  recommendations: string[]
}

/**
 * A point in an intonation graph.
 */
export interface IntonationPoint {
  time: number // segundos
  deviation: number // cents
  note?: string
}

/**
 * A problem area in a recording.
 */
export interface ProblemArea {
  startTime: number
  endTime: number
  issue: string
  severity: "low" | "medium" | "high"
  suggestion: string
}
