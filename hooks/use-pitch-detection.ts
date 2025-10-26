"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { GlobalTunerState, PitchEvent } from "@/lib/types/pitch-detection"
import { PitchDetector } from "@/lib/audio/pitch-detector"
import { LatencyCalibrator } from "@/lib/audio/latency-calibration"
import { frequencyToCents, generatePracticeSequence } from "@/lib/audio/note-utils"

// Constants for improved state machine synchronization
const NOTE_TRANSITION_BUFFER_MS = 300 // Minimum time between notes
const PITCH_CONFIDENCE_MIN = 0.6 // Increased from 0.5

export function usePitchDetection() {
  const [state, setState] = useState<GlobalTunerState>({
    status: "IDLE",
    currentNoteIndex: 0,
    targetNoteMidi: 69,
    targetFreqHz: 440,
    accompanimentStartTime: 0,
    toleranceCents: 50,
    minHoldMs: 1000,
    rmsThreshold: 0.03, // Increased from 0.01 to 0.03 (3x)
    pitchHistory: [],
    consecutiveStableFrames: 0,
    holdStart: 0,
    totalLatencyOffsetMs: 0,
    isWorkletSupported: false,
    currentPitch: 0,
    currentCents: 0,
    currentConfidence: 0,
    currentRms: 0,
    accuracy: 0,
    notes: generatePracticeSequence(),
  })

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const pitchDetectorRef = useRef<PitchDetector | null>(null)
  const calibratorRef = useRef<LatencyCalibrator | null>(null)
  const calibrationClickTimeRef = useRef<number>(0)
  const calibrationCountRef = useRef<number>(0)

  const calibrateRMS = useCallback(() => {
    if (!analyserRef.current || !pitchDetectorRef.current) return

    const buffer = new Float32Array(analyserRef.current.fftSize)
    analyserRef.current.getFloatTimeDomainData(buffer)
    const noise = pitchDetectorRef.current.calculateRMS(buffer)

    setState((prev) => ({
      ...prev,
      rmsThreshold: noise * 2.5, // 2.5x ambient noise
    }))

    console.log("[v0] RMS calibrated to:", noise * 2.5)
  }, [])

  // Inicializar audio context y detector
  const initialize = useCallback(async () => {
    try {
      // Crear AudioContext
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      const audioContext = new AudioContextClass()
      audioContextRef.current = audioContext

      const actualSampleRate = audioContext.sampleRate
      if (actualSampleRate !== 48000 && actualSampleRate !== 44100) {
        console.warn(`[v0] Non-standard sample rate: ${actualSampleRate}Hz`)
      } else {
        console.log(`[v0] Sample rate: ${actualSampleRate}Hz`)
      }

      // Solicitar acceso al micrófono
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })
      mediaStreamRef.current = stream

      // Crear AnalyserNode para fallback
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0
      analyserRef.current = analyser

      // Conectar micrófono al analyser
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      pitchDetectorRef.current = new PitchDetector(actualSampleRate)

      // Crear calibrador
      calibratorRef.current = new LatencyCalibrator(audioContext)

      // Calcular latencia base
      const baseLatency = calibratorRef.current.calculateBaseLatency(stream)

      setState((prev) => ({
        ...prev,
        status: "IDLE",
        isWorkletSupported: false,
        totalLatencyOffsetMs: baseLatency,
      }))

      setTimeout(() => calibrateRMS(), 500)

      console.log("[v0] Audio system initialized")
    } catch (error) {
      console.error("[v0] Error initializing audio:", error)
      setState((prev) => ({ ...prev, status: "ERROR" }))
    }
  }, [calibrateRMS])

  // Iniciar calibración
  const startCalibration = useCallback(() => {
    if (!calibratorRef.current || !audioContextRef.current) return

    setState((prev) => ({ ...prev, status: "CALIBRATING" }))
    calibratorRef.current.reset()
    calibrationCountRef.current = 0

    // Reproducir el primer click
    const clickTime = calibratorRef.current.playCalibrationClick()
    calibrationClickTimeRef.current = clickTime

    console.log("[v0] Calibration started")
  }, [])

  // Iniciar detección de pitch
  const startDetection = useCallback(() => {
    if (!analyserRef.current || !pitchDetectorRef.current || !audioContextRef.current) return

    setState((prev) => ({
      ...prev,
      status: "PITCH_DETECTING",
      currentNoteIndex: 0,
      accompanimentStartTime: audioContextRef.current!.currentTime,
      consecutiveStableFrames: 0,
      accuracy: 0,
    }))

    const analyser = analyserRef.current
    const detector = pitchDetectorRef.current
    const buffer = new Float32Array(analyser.fftSize)

    const detect = () => {
      if (!audioContextRef.current) return

      analyser.getFloatTimeDomainData(buffer)

      // Detectar pitch usando YIN
      const { pitchHz, confidence } = detector.detectPitchYIN(buffer)
      const rms = detector.calculateRMS(buffer)
      const clarity = detector.calculateClarity(buffer)

      const pitchEvent: PitchEvent = {
        pitchHz,
        confidence,
        rms,
        clarity,
        timestamp: audioContextRef.current.currentTime,
        frameIndex: 0,
      }

      handlePitchEvent(pitchEvent)

      animationFrameRef.current = requestAnimationFrame(detect)
    }

    detect()
    console.log("[v0] Pitch detection started")
  }, [])

  // Detener detección
  const stopDetection = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    setState((prev) => ({ ...prev, status: "IDLE" }))
    console.log("[v0] Pitch detection stopped")
  }, [])

  // Manejar eventos de pitch (máquina de estados)
  const handlePitchEvent = useCallback((event: PitchEvent) => {
    setState((prev) => {
      const { pitchHz, confidence, rms, timestamp } = event

      const adjustedTimestamp = timestamp - prev.totalLatencyOffsetMs / 1000

      // Actualizar métricas actuales
      const currentNote = prev.notes[prev.currentNoteIndex]
      const cents = frequencyToCents(pitchHz, currentNote.frequency)

      // Estado CALIBRATING: detectar onset para calibración
      if (prev.status === "CALIBRATING") {
        if (rms > prev.rmsThreshold && calibratorRef.current) {
          calibratorRef.current.addMeasurement(calibrationClickTimeRef.current, timestamp)
          calibrationCountRef.current++

          if (calibrationCountRef.current >= 5) {
            // Calibración completa
            const finalOffset = calibratorRef.current.calculateFinalOffset()
            console.log("[v0] Calibration complete:", finalOffset, "ms")
            return {
              ...prev,
              status: "IDLE",
              totalLatencyOffsetMs: finalOffset,
            }
          } else {
            // Reproducir siguiente click
            const clickTime = calibratorRef.current.playCalibrationClick()
            calibrationClickTimeRef.current = clickTime
          }
        }
        return prev
      }

      // Estado PITCH_DETECTING: validar si el pitch está dentro de tolerancia
      if (prev.status === "PITCH_DETECTING" || prev.status === "PITCH_STABLE") {
        // Verificar si hay suficiente volumen
        if (rms < prev.rmsThreshold) {
          return {
            ...prev,
            currentPitch: pitchHz,
            currentCents: cents,
            currentConfidence: confidence,
            currentRms: rms,
            consecutiveStableFrames: 0,
            status: "PITCH_DETECTING",
          }
        }

        const isInTune = Math.abs(cents) < prev.toleranceCents && confidence > PITCH_CONFIDENCE_MIN

        if (isInTune) {
          const newConsecutiveFrames = prev.consecutiveStableFrames + 1
          const newHoldStart = prev.holdStart || adjustedTimestamp

          const holdDuration = (adjustedTimestamp - newHoldStart) * 1000
          const requiredHoldTime = prev.minHoldMs

          if (holdDuration >= requiredHoldTime + NOTE_TRANSITION_BUFFER_MS) {
            // Nota completada, avanzar a la siguiente
            const nextIndex = prev.currentNoteIndex + 1

            if (nextIndex >= prev.notes.length) {
              // Secuencia completada
              console.log("[v0] Practice sequence completed!")
              return {
                ...prev,
                status: "IDLE",
                currentPitch: pitchHz,
                currentCents: cents,
                currentConfidence: confidence,
                currentRms: rms,
                accuracy: 100,
              }
            }

            // Avanzar a la siguiente nota
            const nextNote = prev.notes[nextIndex]
            console.log("[v0] Note advanced to:", nextNote.name)

            return {
              ...prev,
              status: "PITCH_DETECTING",
              currentNoteIndex: nextIndex,
              targetNoteMidi: nextNote.midi,
              targetFreqHz: nextNote.frequency,
              currentPitch: pitchHz,
              currentCents: cents,
              currentConfidence: confidence,
              currentRms: rms,
              consecutiveStableFrames: 0,
              holdStart: 0,
              accuracy: Math.round((nextIndex / prev.notes.length) * 100),
            }
          }

          return {
            ...prev,
            status: "PITCH_STABLE",
            currentPitch: pitchHz,
            currentCents: cents,
            currentConfidence: confidence,
            currentRms: rms,
            consecutiveStableFrames: newConsecutiveFrames,
            holdStart: newHoldStart,
          }
        } else {
          // Fuera de tono
          return {
            ...prev,
            status: "PITCH_DETECTING",
            currentPitch: pitchHz,
            currentCents: cents,
            currentConfidence: confidence,
            currentRms: rms,
            consecutiveStableFrames: 0,
            holdStart: 0,
          }
        }
      }

      return {
        ...prev,
        currentPitch: pitchHz,
        currentCents: cents,
        currentConfidence: confidence,
        currentRms: rms,
      }
    })
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  return {
    state,
    initialize,
    startCalibration,
    startDetection,
    stopDetection,
    calibrateRMS, // Export calibrateRMS function
  }
}
