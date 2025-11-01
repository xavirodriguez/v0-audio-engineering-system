"use client"

import { useState } from "react"

export interface UsePracticeStateReturn {
  viewMode: "animated" | "sheet-music"
  showSettings: boolean
  showRecording: boolean
  showExercises: boolean
  volume: number[]
  tempo: number[]
  sensitivity: number[]
  practiceMode: "step-by-step" | "continuous"
  toggleViewMode: () => void
  toggleSettings: () => void
  setShowRecording: (show: boolean) => void
  setShowExercises: (show: boolean) => void
  setVolume: (v: number[]) => void
  setTempo: (t: number[]) => void
  setSensitivity: (s: number[]) => void
  setPracticeMode: (m: "step-by-step" | "continuous") => void
}

export function usePracticeState(): UsePracticeStateReturn {
  const [viewMode, setViewMode] = useState<"animated" | "sheet-music">("animated")
  const [showSettings, setShowSettings] = useState(false)
  const [showRecording, setShowRecording] = useState(false)
  const [showExercises, setShowExercises] = useState(false)
  const [volume, setVolume] = useState([80])
  const [tempo, setTempo] = useState([100])
  const [sensitivity, setSensitivity] = useState([5])
  const [practiceMode, setPracticeMode] = useState<"step-by-step" | "continuous">("step-by-step")

  const toggleViewMode = () => setViewMode((prev) => (prev === "animated" ? "sheet-music" : "animated"))
  const toggleSettings = () => setShowSettings((prev) => !prev)

  return {
    viewMode,
    showSettings,
    showRecording,
    showExercises,
    volume,
    tempo,
    sensitivity,
    practiceMode,
    toggleViewMode,
    toggleSettings,
    setShowRecording,
    setShowExercises,
    setVolume,
    setTempo,
    setSensitivity,
    setPracticeMode,
  }
}
