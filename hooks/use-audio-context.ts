"use client"

import { useRef, useCallback, useEffect } from "react"
import { createAudioContext } from "@/lib/audio/audio-context-types"
import { errorHandler, AppError } from "@/lib/errors/error-handler"

interface UseAudioContextReturn {
  audioContext: AudioContext | null
  analyser: AnalyserNode | null
  mediaStream: MediaStream | null
  initialize: (signal?: AbortSignal) => Promise<void>
  cleanup: () => void
  isReady: boolean
}

export function useAudioContext(): UseAudioContextReturn {
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  const initialize = useCallback(async (signal?: AbortSignal) => {
    try {
      // 1. Crear AudioContext
      const audioContext = createAudioContext()
      audioContextRef.current = audioContext

      if (signal?.aborted) {
        throw new AppError("INIT_ABORTED", "Initialization was aborted", "low")
      }

      // 2. Solicitar micrófono
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })

      if (signal?.aborted) {
        stream.getTracks().forEach((track) => track.stop())
        throw new AppError("INIT_ABORTED", "Initialization was aborted", "low")
      }

      mediaStreamRef.current = stream

      // 3. Crear y configurar analyser
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0
      analyserRef.current = analyser

      // 4. Conectar pipeline
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      errorHandler.info("AudioContext initialized", "useAudioContext", {
        sampleRate: audioContext.sampleRate,
        fftSize: analyser.fftSize,
      })
    } catch (error) {
      if (error instanceof AppError && error.code === "INIT_ABORTED") {
        return
      }
      errorHandler.capture(error, "useAudioContext.initialize")
      throw error
    }
  }, [])

  const cleanup = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    analyserRef.current = null
  }, [])

  useEffect(() => {
    return () => cleanup()
  }, [cleanup])

  return {
    audioContext: audioContextRef.current,
    analyser: analyserRef.current,
    mediaStream: mediaStreamRef.current,
    initialize,
    cleanup,
    isReady: !!(audioContextRef.current && analyserRef.current && mediaStreamRef.current),
  }
}
