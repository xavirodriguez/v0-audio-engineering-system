"use client"

import { useRef, useCallback, useEffect } from "react"
import { PitchDetector } from "@/lib/audio/pitch-detector"
import type { PitchEvent } from "@/lib/types/pitch-detection"

interface UsePitchProcessorConfig {
  analyser: AnalyserNode | null
  sampleRate: number
  onPitchDetected: (event: PitchEvent) => void
  isActive: boolean
}

interface UsePitchProcessorReturn {
  startProcessing: () => void
  stopProcessing: () => void
  isProcessing: boolean
}

/**
 * A hook that provides pitch processing functionality.
 * @param {UsePitchProcessorConfig} config - The configuration for the hook.
 * @returns {UsePitchProcessorReturn} - The pitch processing functions and state.
 */
export function usePitchProcessor({
  analyser,
  sampleRate,
  onPitchDetected,
  isActive,
}: UsePitchProcessorConfig): UsePitchProcessorReturn {
  const detectorRef = useRef<PitchDetector | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const isProcessingRef = useRef(false)

  // Inicializar detector cuando cambia sampleRate
  useEffect(() => {
    detectorRef.current = new PitchDetector(sampleRate)
    return () => {
      detectorRef.current?.destroy()
    }
  }, [sampleRate])

  const processFrame = useCallback(
    (timestamp: number) => {
      if (!analyser || !detectorRef.current || !isProcessingRef.current) return

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
        timestamp: timestamp / 1000, // convertir a segundos
        frameIndex: 0,
      }

      onPitchDetected(event)

      if (isProcessingRef.current) {
        animationFrameRef.current = requestAnimationFrame(processFrame)
      }
    },
    [analyser, onPitchDetected],
  )

  const startProcessing = useCallback(() => {
    if (isProcessingRef.current || !analyser) return

    isProcessingRef.current = true
    animationFrameRef.current = requestAnimationFrame(processFrame)
  }, [analyser, processFrame])

  const stopProcessing = useCallback(() => {
    isProcessingRef.current = false
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }, [])

  // Auto-start/stop basado en isActive
  useEffect(() => {
    if (isActive && analyser) {
      startProcessing()
    } else {
      stopProcessing()
    }
  }, [isActive, analyser, startProcessing, stopProcessing])

  useEffect(() => {
    return () => stopProcessing()
  }, [stopProcessing])

  return {
    startProcessing,
    stopProcessing,
    isProcessing: isProcessingRef.current,
  }
}
