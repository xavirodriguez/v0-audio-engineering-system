"use client"

import { useEffect, useRef, useCallback } from "react"
import { usePitchDetectionStore } from "@/lib/store/pitch-detection-store"
import type { PitchEvent } from "@/lib/types/pitch-detection"
import { PitchDetector } from "@/lib/audio/pitch-detector"
import { LatencyCalibrator } from "@/lib/audio/latency-calibration"
import { frequencyToCents } from "@/lib/audio/note-utils"
import { PitchStateMachine } from "@/lib/audio/pitch-state-machine"
import { createAudioContext } from "@/lib/audio/audio-context-types"
import { errorHandler, AppError } from "@/lib/errors/error-handler"

// Constants for improved state machine synchronization
const NOTE_TRANSITION_BUFFER_MS = 300
const PITCH_CONFIDENCE_MIN = 0.6

export function usePitchDetection() {
  const store = usePitchDetectionStore()

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const pitchDetectorRef = useRef<PitchDetector | null>(null)
  const calibratorRef = useRef<LatencyCalibrator | null>(null)
  const calibrationClickTimeRef = useRef<number>(0)
  const calibrationCountRef = useRef<number>(0)

  const stateMachineRef = useRef<PitchStateMachine | null>(null)

  const calibrateRMS = useCallback(() => {
    if (!analyserRef.current || !pitchDetectorRef.current) return

    const buffer = new Float32Array(analyserRef.current.fftSize)
    analyserRef.current.getFloatTimeDomainData(buffer)
    const noise = pitchDetectorRef.current.calculateRMS(buffer)

    store.setState({ rmsThreshold: noise * 2.5 })
    errorHandler.info("RMS calibrated", "usePitchDetection", { threshold: noise * 2.5 })
  }, [store])

  const initialize = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const audioContext = createAudioContext()
        audioContextRef.current = audioContext

        if (signal?.aborted) {
          throw new AppError("INIT_ABORTED", "Initialization was aborted", "low")
        }

        const actualSampleRate = audioContext.sampleRate
        if (actualSampleRate !== 48000 && actualSampleRate !== 44100) {
          errorHandler.warn(`Non-standard sample rate: ${actualSampleRate}Hz`, "usePitchDetection")
        }

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

        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 2048
        analyser.smoothingTimeConstant = 0
        analyserRef.current = analyser

        const source = audioContext.createMediaStreamSource(stream)
        source.connect(analyser)

        pitchDetectorRef.current = new PitchDetector(actualSampleRate)
        calibratorRef.current = new LatencyCalibrator(audioContext)

        stateMachineRef.current = new PitchStateMachine(store.minHoldMs, store.toleranceCents, store.rmsThreshold)

        const baseLatency = calibratorRef.current.calculateBaseLatency(stream)

        store.setState({
          status: "IDLE",
          isWorkletSupported: false,
          totalLatencyOffsetMs: baseLatency,
        })

        setTimeout(() => calibrateRMS(), 500)
        errorHandler.info("Audio system initialized", "usePitchDetection")
      } catch (error) {
        if (error instanceof AppError && error.code === "INIT_ABORTED") {
          // Silently handle abort
          return
        }
        errorHandler.capture(error, "usePitchDetection.initialize")
        store.setState({ status: "ERROR" })
      }
    },
    [store, calibrateRMS],
  )

  const startCalibration = useCallback(() => {
    if (!calibratorRef.current || !audioContextRef.current) return

    store.setState({ status: "CALIBRATING" })
    calibratorRef.current.reset()
    calibrationCountRef.current = 0

    const clickTime = calibratorRef.current.playCalibrationClick()
    calibrationClickTimeRef.current = clickTime
    console.log("[v0] Calibration started")
  }, [store])

  const startDetection = useCallback(() => {
    if (!analyserRef.current || !pitchDetectorRef.current || !audioContextRef.current) return

    store.setState({
      status: "PITCH_DETECTING",
      currentNoteIndex: 0,
      accompanimentStartTime: audioContextRef.current.currentTime,
      consecutiveStableFrames: 0,
      accuracy: 0,
    })

    const analyser = analyserRef.current
    const detector = pitchDetectorRef.current
    const buffer = new Float32Array(analyser.fftSize)

    const detect = () => {
      if (!audioContextRef.current) return

      analyser.getFloatTimeDomainData(buffer)

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
  }, [store])

  const stopDetection = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    store.setState({ status: "IDLE" })
    console.log("[v0] Pitch detection stopped")
  }, [store])

  const handlePitchEvent = useCallback(
    (event: PitchEvent) => {
      const state = store
      const { pitchHz, confidence, rms, timestamp } = event

      const adjustedTimestamp = timestamp - state.totalLatencyOffsetMs / 1000
      const currentNote = state.notes[state.currentNoteIndex]
      const cents = frequencyToCents(pitchHz, currentNote.frequency)

      store.updatePitchEvent({ ...event, timestamp: adjustedTimestamp })

      if (state.status === "CALIBRATING") {
        if (rms > state.rmsThreshold && calibratorRef.current) {
          calibratorRef.current.addMeasurement(calibrationClickTimeRef.current, timestamp)
          calibrationCountRef.current++

          if (calibrationCountRef.current >= 5) {
            const finalOffset = calibratorRef.current.calculateFinalOffset()
            console.log("[v0] Calibration complete:", finalOffset, "ms")
            store.setState({
              status: "IDLE",
              totalLatencyOffsetMs: finalOffset,
            })
          } else {
            const clickTime = calibratorRef.current.playCalibrationClick()
            calibrationClickTimeRef.current = clickTime
          }
        }
        return
      }

      if (state.status === "PITCH_DETECTING" || state.status === "PITCH_STABLE") {
        if (rms < state.rmsThreshold) {
          store.setState({
            currentPitch: pitchHz,
            currentCents: cents,
            currentConfidence: confidence,
            currentRms: rms,
            consecutiveStableFrames: 0,
            status: "PITCH_DETECTING",
          })
          return
        }

        const isInTune = Math.abs(cents) < state.toleranceCents && confidence > PITCH_CONFIDENCE_MIN

        if (isInTune) {
          const newConsecutiveFrames = state.consecutiveStableFrames + 1
          const newHoldStart = state.holdStart || adjustedTimestamp
          const holdDuration = (adjustedTimestamp - newHoldStart) * 1000

          if (holdDuration >= state.minHoldMs + NOTE_TRANSITION_BUFFER_MS) {
            store.advanceToNextNote()
            return
          }

          store.setState({
            status: "PITCH_STABLE",
            currentPitch: pitchHz,
            currentCents: cents,
            currentConfidence: confidence,
            currentRms: rms,
            consecutiveStableFrames: newConsecutiveFrames,
            holdStart: newHoldStart,
          })
        } else {
          store.setState({
            status: "PITCH_DETECTING",
            currentPitch: pitchHz,
            currentCents: cents,
            currentConfidence: confidence,
            currentRms: rms,
            consecutiveStableFrames: 0,
            holdStart: 0,
          })
        }
      }
    },
    [store],
  )

  useEffect(() => {
    const controller = new AbortController()

    initialize(controller.signal).catch((err) => {
      if (err.name !== "AbortError") {
        errorHandler.capture(err, "usePitchDetection.useEffect")
      }
    })

    return () => {
      controller.abort()

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      if (pitchDetectorRef.current) {
        pitchDetectorRef.current.destroy()
      }
    }
  }, [initialize])

  return {
    state: store,
    initialize: (signal?: AbortSignal) => initialize(signal),
    startCalibration,
    startDetection,
    stopDetection,
    calibrateRMS,
  }
}
