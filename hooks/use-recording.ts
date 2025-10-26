"use client"

import { useState, useRef, useCallback } from "react"
import type { Recording, PitchDataPoint } from "@/lib/types/recording"
import { AudioRecorder } from "@/lib/audio/audio-recorder"
import { AudioAnalyzer } from "@/lib/audio/audio-analyzer"

const STORAGE_KEY = "violin-recordings"

export function useRecording() {
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [currentRecording, setCurrentRecording] = useState<Recording | null>(null)

  const recorderRef = useRef<AudioRecorder | null>(null)
  const analyzerRef = useRef<AudioAnalyzer>(new AudioAnalyzer())
  const audioContextRef = useRef<AudioContext | null>(null)

  // Cargar grabaciones desde localStorage
  const loadRecordings = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setRecordings(parsed)
      }
    } catch (error) {
      console.error("[v0] Error loading recordings:", error)
    }
  }, [])

  // Guardar grabaciones en localStorage
  const saveRecordings = useCallback((recs: Recording[]) => {
    try {
      // No guardar audioBlob en localStorage (demasiado grande)
      const toSave = recs.map((r) => ({
        ...r,
        audioBlob: undefined,
        audioUrl: undefined,
      }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    } catch (error) {
      console.error("[v0] Error saving recordings:", error)
    }
  }, [])

  // Iniciar grabación
  const startRecording = useCallback(async (stream: MediaStream, exerciseId?: string, exerciseName?: string) => {
    try {
      const recorder = new AudioRecorder()
      const initialized = await recorder.initialize(stream)

      if (!initialized) {
        throw new Error("Failed to initialize recorder")
      }

      recorderRef.current = recorder
      recorder.startRecording()
      setIsRecording(true)

      console.log("[v0] Recording started")
    } catch (error) {
      console.error("[v0] Error starting recording:", error)
    }
  }, [])

  // Detener grabación
  const stopRecording = useCallback(
    async (exerciseId?: string, exerciseName?: string): Promise<Recording | null> => {
      if (!recorderRef.current) return null

      try {
        const audioBlob = await recorderRef.current.stopRecording()
        const pitchData = recorderRef.current.getPitchData()
        const audioUrl = URL.createObjectURL(audioBlob)

        setIsRecording(false)

        // Crear objeto de grabación
        const recording: Recording = {
          id: `recording-${Date.now()}`,
          timestamp: Date.now(),
          duration: pitchData.length > 0 ? pitchData[pitchData.length - 1].timestamp : 0,
          exerciseId,
          exerciseName,
          audioBlob,
          audioUrl,
          pitchData: pitchData as PitchDataPoint[],
          waveformData: new Float32Array(0), // Se generará después
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

        // Analizar grabación
        const analysis = await analyzerRef.current.analyzeRecording(recording)
        recording.analysis = analysis

        // Agregar a la lista
        const updatedRecordings = [recording, ...recordings]
        setRecordings(updatedRecordings)
        setCurrentRecording(recording)
        saveRecordings(updatedRecordings)

        console.log("[v0] Recording saved and analyzed")
        return recording
      } catch (error) {
        console.error("[v0] Error stopping recording:", error)
        return null
      }
    },
    [recordings, saveRecordings],
  )

  // Agregar punto de pitch durante grabación
  const addPitchPoint = useCallback((frequency: number, cents: number, confidence: number, rms: number) => {
    if (recorderRef.current) {
      recorderRef.current.addPitchDataPoint(frequency, cents, confidence, rms)
    }
  }, [])

  // Eliminar grabación
  const deleteRecording = useCallback(
    (id: string) => {
      const updated = recordings.filter((r) => r.id !== id)
      setRecordings(updated)
      saveRecordings(updated)

      if (currentRecording?.id === id) {
        setCurrentRecording(null)
      }
    },
    [recordings, currentRecording, saveRecordings],
  )

  return {
    recordings,
    isRecording,
    currentRecording,
    startRecording,
    stopRecording,
    addPitchPoint,
    deleteRecording,
    loadRecordings,
    setCurrentRecording,
  }
}
