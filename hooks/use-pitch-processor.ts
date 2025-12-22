
import { useRef, useCallback, useEffect } from "react"
import { PitchDetector } from "@/lib/audio/pitch-detector"
import { PitchDetectionEvent } from "@/lib/state-machines/pitch-detection.machine"
import type { PitchEvent } from "@/lib/types/pitch-detection"

interface UsePitchProcessorConfig {
  analyser: AnalyserNode | null
  sampleRate: number
  isActive: boolean
  onPitchDetected: (event: PitchEvent) => void
  onError: (error: Error) => void
}

export function usePitchProcessor(config: UsePitchProcessorConfig) {
  const { analyser, sampleRate, isActive, onPitchDetected, onError } = config

  // ✅ Solo un flag local para control de animationFrame
  const rafIdRef = useRef<number | null>(null)
  const detectorRef = useRef<PitchDetector | null>(null)

  // ✅ Función pura de procesamiento
  const processFrame = useCallback(
    (timestamp: number) => {
      // Guard: Verificar que todo esté disponible
      if (!analyser || !detectorRef.current) {
        return
      }

      try {
        const buffer = new Float32Array(analyser.fftSize)
        analyser.getFloatTimeDomainData(buffer)

        const { pitchHz, confidence } = detectorRef.current.detectPitchYIN(buffer)
        const rms = detectorRef.current.calculateRMS(buffer)
        const clarity = detectorRef.current.calculateClarity(buffer)

        const event: PitchEvent = {
          pitchHz,
          confidence,
          rms,
          clarity,
          timestamp: timestamp / 1000,
          frameIndex: 0,
        }

        // ✅ Callback inmutable - no modifica estado directamente
        onPitchDetected(event)

        // ✅ Continuar solo si aún estamos activos
        if (rafIdRef.current !== null) {
          rafIdRef.current = requestAnimationFrame(processFrame)
        }
      } catch (error) {
        onError(error instanceof Error ? error : new Error(String(error)))
      }
    },
    [analyser, onPitchDetected, onError]
  )

  // ✅ Control explícito de inicio/parada
  useEffect(() => {
    // Inicializar detector
    detectorRef.current = new PitchDetector(sampleRate)

    // Auto-start si está activo
    if (isActive && analyser) {
      rafIdRef.current = requestAnimationFrame(processFrame)
    }

    // Cleanup
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
      detectorRef.current?.destroy()
      detectorRef.current = null
    }
  }, [isActive, analyser, sampleRate, processFrame])

  return {
    // Exponer solo estado de lectura
    isProcessing: rafIdRef.current !== null,
  }
}
