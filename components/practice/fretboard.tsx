"use client"

import React, { memo } from "react"
import { VIOLIN_STRING_NAMES, FRET_COUNT } from "@/lib/violin-constants"
import { useViolinLogic, type ActiveNote } from "@/hooks/use-violin-logic"

/**
 * Calculates the position of a fret on the fretboard as a percentage of the scale length.
 * The formula is based on the "rule of 18," which is a logarithmic scale.
 * @param {number} fret - The fret number (0 is the nut).
 * @returns {number} - The position as a percentage.
 */
const calculateFretPosition = (fret: number): number => {
  return 100 * (1 - Math.pow(2, -fret / 12))
}

interface NoteProps {
  isActive: boolean
  position: number
  noteName: string
  feedback: FeedbackState
}

const Note = memo<NoteProps>(function Note({ isActive, position, noteName, feedback }) {
  const feedbackColor = {
    PERFECTO: "bg-green-500",
    LIGERAMENTE_AGUDO: "bg-yellow-400",
    LIGERAMENTE_GRAVE: "bg-yellow-400",
    AGUDO: "bg-red-500",
    GRAVE: "bg-red-500",
    NO_DETECTADO: "bg-transparent",
  }[feedback]

  return (
    <div
      className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-75"
      style={{ left: `${position}%` }}
    >
      <div
        className={`w-full h-full rounded-full transition-all duration-75 ${
          isActive ? `${feedbackColor} scale-110` : "bg-transparent"
        }`}
      />
      {isActive && (
        <span className="absolute text-white text-xs font-bold pointer-events-none">
          {noteName}
        </span>
      )}
    </div>
  )
})

interface StringProps {
  stringName: (typeof VIOLIN_STRING_NAMES)[number]
  activeNote: ActiveNote | null
  feedback: FeedbackState
}

const String = memo<StringProps>(function String({ stringName, activeNote, feedback }) {
  return (
    <div className="relative h-8">
      <div className="absolute top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-400" />
      {Array.from({ length: FRET_COUNT + 1 }).map((_, fret) => {
        const isActive = !!activeNote && activeNote.string === stringName && activeNote.fret === fret
        return (
          <Note
            key={fret}
            isActive={isActive}
            position={calculateFretPosition(fret)}
            noteName={isActive ? activeNote.noteName : ""}
            feedback={feedback}
          />
        )
      })}
    </div>
  )
})

import type { FeedbackState } from "@/lib/types/pitch-detection"

// ... (resto de las importaciones)

interface FretboardProps {
  currentPitch: number
  feedback: FeedbackState
}

export function Fretboard({ currentPitch, feedback }: FretboardProps) {
  const activeNote = useViolinLogic(currentPitch)

  return (
    <div className="relative bg-gray-800 p-8 rounded-lg shadow-lg overflow-hidden">
      {/* Render Fret Lines */}
      {Array.from({ length: FRET_COUNT + 1 }).map((_, fret) => {
        if (fret === 0) return null // Nut is the start, no line needed
        const position = calculateFretPosition(fret)
        return (
          <div
            key={`fret-${fret}`}
            className="absolute top-0 bottom-0 w-0.5 bg-gray-600"
            style={{ left: `${position}%` }}
          />
        )
      })}

      {/* Render Strings */}
      <div className="flex flex-col space-y-4">
        {VIOLIN_STRING_NAMES.map((stringName) => (
          <String key={stringName} stringName={stringName} activeNote={activeNote} />
        ))}
      </div>
    </div>
  )
}
