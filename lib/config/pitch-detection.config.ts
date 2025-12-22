/**
 * Configuración para la detección de pitch.
 * Todos los valores están documentados y tienen valores por defecto razonables.
 */
export interface PitchDetectionConfig {
  /**
   * Buffer de tiempo adicional antes de transición de nota.
   * Previene transiciones prematuras cuando el usuario está cambiando de nota.
   *
   * @default 300ms
   * @rationale Basado en estudios de latencia de respuesta humana
   */
  noteTransitionBufferMs: number

  /**
   * Confianza mínima requerida para considerar un pitch válido.
   * Rango: 0.0 (sin confianza) a 1.0 (máxima confianza)
   *
   * @default 0.6
   * @rationale Balance entre sensibilidad y falsos positivos
   */
  pitchConfidenceMin: number

  /**
   * Tiempo mínimo que una nota debe mantenerse estable.
   * Ayuda a filtrar glissandos y vibratos rápidos.
   *
   * @default 150ms
   */
  minHoldMs: number

  /**
   * Tolerancia en cents para considerar una nota "afinada".
   * 100 cents = 1 semitono
   *
   * @default 25 cents (cuarto de tono)
   */
  toleranceCents: number

  /**
   * Umbral RMS para detección de señal.
   * Se ajusta automáticamente durante calibración.
   *
   * @default 0.01
   */
  rmsThresholdDefault: number

  /**
   * Multiplicador para calibración automática de RMS.
   * El umbral se establece como: RMS_ambiente * multiplicador
   *
   * @default 2.5
   */
  rmsCalibrationMultiplier: number
}

/**
 * Configuración por defecto para detección de pitch.
 */
export const DEFAULT_PITCH_DETECTION_CONFIG: PitchDetectionConfig = {
  noteTransitionBufferMs: 300,
  pitchConfidenceMin: 0.6,
  minHoldMs: 150,
  toleranceCents: 25,
  rmsThresholdDefault: 0.01,
  rmsCalibrationMultiplier: 2.5,
}

/**
 * Configuración para principiantes (más tolerante).
 */
export const BEGINNER_PITCH_DETECTION_CONFIG: PitchDetectionConfig = {
  ...DEFAULT_PITCH_DETECTION_CONFIG,
  toleranceCents: 35, // Más tolerancia
  pitchConfidenceMin: 0.5, // Menos estricto
  minHoldMs: 200, // Más tiempo para estabilizar
}

/**
 * Configuración para expertos (más estricta).
 */
export const EXPERT_PITCH_DETECTION_CONFIG: PitchDetectionConfig = {
  ...DEFAULT_PITCH_DETECTION_CONFIG,
  toleranceCents: 15, // Muy preciso
  pitchConfidenceMin: 0.75, // Alta confianza requerida
  minHoldMs: 100, // Respuesta más rápida
}
