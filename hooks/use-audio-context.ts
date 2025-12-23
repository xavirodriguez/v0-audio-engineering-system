"use client"

import { useState, useCallback, useEffect } from "react"
import { audioManager } from "@/lib/audio/audio-resource-manager"
import { useAudioHydration } from "./use-audio-hydration"
import { AppError, errorHandler } from "@/lib/errors/error-handler"

interface UseAudioContextReturn {
  audioContext: AudioContext | null
  analyser: AnalyserNode | null
  initialize: (signal?: AbortSignal) => Promise<void>
  isReady: boolean
  error: AppError | null
}

export function useAudioContext(): UseAudioContextReturn {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<AppError | null>(null)
  const isHydrated = useAudioHydration()

  const initialize = useCallback(
    async (signal?: AbortSignal) => {
      if (!isHydrated || isReady) {
        return
      }

      try {
        const context = await audioManager.initialize(signal)
        const analyserNode = audioManager.getNode("analyser") as AnalyserNode

        setAudioContext(context)
        setAnalyser(analyserNode)
        setIsReady(true)
      } catch (err) {
        if (err instanceof AppError && err.code === "INIT_ABORTED") {
          errorHandler.info("Audio initialization aborted", "useAudioContext")
          return
        }
        const newError = new AppError(
          "AUDIO_INIT_FAILED",
          "Failed to initialize audio context.",
          "high",
          err
        )
        setError(newError)
        errorHandler.capture(newError, "useAudioContext.initialize")
      }
    },
    [isHydrated, isReady]
  )

  useEffect(() => {
    return () => {
      // The dispose is now called from the main practice component
    }
  }, [])

  return {
    audioContext,
    analyser,
    initialize,
    isReady,
    error,
  }
}
