"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import type { Recording } from "@/lib/types/recording"

export function useRecordingPlayer(recording: Recording) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handleTimeUpdate = useCallback(() => {
    setCurrentTime(audioRef.current?.currentTime || 0)
  }, [])

  const handleEnded = useCallback(() => {
    setIsPlaying(false)
    setCurrentTime(0)
  }, [])

  useEffect(() => {
    if (recording.audioUrl) {
      audioRef.current = new Audio(recording.audioUrl)
      audioRef.current.addEventListener("timeupdate", handleTimeUpdate)
      audioRef.current.addEventListener("ended", handleEnded)
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.removeEventListener("timeupdate", handleTimeUpdate)
        audioRef.current.removeEventListener("ended", handleEnded)
        audioRef.current = null
      }
    }
  }, [recording.audioUrl, handleTimeUpdate, handleEnded])

  const togglePlayback = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }

    setIsPlaying(!isPlaying)
  }

  const downloadRecording = () => {
    const a = document.createElement("a")
    a.href = recording.audioUrl
    a.download = `recording-${recording.id}.webm`
    a.click()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 85) return "text-green-600"
    if (accuracy >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  return {
    isPlaying,
    currentTime,
    togglePlayback,
    downloadRecording,
    formatTime,
    getAccuracyColor,
  }
}
