"use client"

import { useRef, useCallback } from "react"
import { useRecordingStore } from "@/lib/store/recording-store"
import type { Recording, PitchDataPoint } from "@/lib/types/recording"
import { AudioRecorder } from "@/lib/audio/audio-recorder"
import { AudioAnalyzer } from "@/lib/audio/audio-analyzer"

/**
 * A hook that provides recording functionality.
 * @returns {object} - The recording functions and state.
 */
export function useRecording() {
  const store = useRecordingStore()

  const recorderRef = useRef<AudioRecorder | null>(null)
  const analyzerRef = useRef<AudioAnalyzer>(new AudioAnalyzer())

  const startRecording = useCallback(
    async (stream: MediaStream, exerciseId?: string, exerciseName?: string) => {
      try {
        const recorder = new AudioRecorder()
        const initialized = await recorder.initialize(stream)

        if (!initialized) {
          throw new Error("Failed to initialize recorder")
        }

        recorderRef.current = recorder
        recorder.startRecording()
        store.setIsRecording(true)

        console.log("[v0] Recording started")
      } catch (error) {
        console.error("[v0] Error starting recording:", error)
      }
    },
    [store],
  )

  const stopRecording = useCallback(
    async (exerciseId?: string, exerciseName?: string): Promise<Recording | null> => {
      if (!recorderRef.current) return null

      try {
        const audioBlob = await recorderRef.current.stopRecording()
        const pitchData = recorderRef.current.getPitchData()
        const audioUrl = URL.createObjectURL(audioBlob)

        store.setIsRecording(false)

        const recording: Recording = {
          id: `recording-${Date.now()}`,
          timestamp: Date.now(),
          duration: pitchData.length > 0 ? pitchData[pitchData.length - 1].timestamp : 0,
          exerciseId,
          exerciseName,
          audioBlob,
          audioUrl,
          pitchData: pitchData as PitchDataPoint[],
          waveformData: new Float32Array(0),
          spectrogramData: {
            frequencies: [],
            times: [],
            magnitudes: [],
            fftSize: 2048,
            sampleRate: 48000,
          },
          analysis: {
            overallAccuracy: 0,
            averageDeviation: 0,
            maxDeviation: 0,
            stabilityScore: 0,
            toneQuality: 0,
            intonationGraph: [],
            problemAreas: [],
            recommendations: [],
          },
        }

        const analysis = await analyzerRef.current.analyzeRecording(recording)
        recording.analysis = analysis

        store.addRecording(recording)

        console.log("[v0] Recording saved and analyzed")
        return recording
      } catch (error) {
        console.error("[v0] Error stopping recording:", error)
        return null
      }
    },
    [store],
  )

  const addPitchPoint = useCallback((frequency: number, cents: number, confidence: number, rms: number) => {
    if (recorderRef.current) {
      recorderRef.current.addPitchDataPoint(frequency, cents, confidence, rms)
    }
  }, [])

  return {
    recordings: store.recordings,
    isRecording: store.isRecording,
    currentRecording: store.currentRecording,
    startRecording,
    stopRecording,
    addPitchPoint,
    deleteRecording: store.deleteRecording,
    setCurrentRecording: store.setCurrentRecording,
  }
}
