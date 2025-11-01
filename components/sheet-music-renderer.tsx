"use client"

import { useEffect, useRef, useMemo } from "react"
import { Renderer, Stave, StaveNote, Voice, Formatter, Articulation, Annotation } from "vexflow"
import type { Exercise } from "@/lib/types/exercise-system"

interface SheetMusicRendererProps {
  exercise: Exercise
  currentNoteIndex: number
  className?: string
}

export function SheetMusicRenderer({ exercise, currentNoteIndex, className = "" }: SheetMusicRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const vexNotes = useMemo(() => {
    return exercise.notes.map((note, index) => {
      // Determine note duration for VexFlow
      let duration = "q" // quarter note by default
      const noteDurationMs = note.duration
      const beatDuration = 60000 / exercise.tempo

      if (noteDurationMs >= beatDuration * 4) duration = "w"
      else if (noteDurationMs >= beatDuration * 2) duration = "h"
      else if (noteDurationMs >= beatDuration) duration = "q"
      else if (noteDurationMs >= beatDuration / 2) duration = "8"
      else duration = "16"

      // Parse note name
      const noteName = note.name.replace(/[#b]/, "")
      const octave = noteName.slice(-1)
      const pitch = noteName.slice(0, -1).toLowerCase()

      // Create VexFlow note
      const vexNote = new StaveNote({
        keys: [`${pitch}/${octave}`],
        duration: duration,
      })

      // Add accidentals
      if (note.name.includes("#")) {
        vexNote.addModifier(0, new Articulation("a#").setPosition(3))
      } else if (note.name.includes("b")) {
        vexNote.addModifier(0, new Articulation("ab").setPosition(3))
      }

      // Add fingering
      if (note.fingering !== undefined) {
        vexNote.addModifier(0, new Annotation(String(note.fingering)).setVerticalJustification(1))
      }

      // Add bowing symbols
      if (note.bowing) {
        const bowingSymbol = note.bowing.direction === "down" ? "a>" : "a^"
        vexNote.addModifier(0, new Articulation(bowingSymbol).setPosition(3))
      }

      // Highlight current note
      if (index === currentNoteIndex) {
        vexNote.setStyle({ fillStyle: "rgb(16, 185, 129)", strokeStyle: "rgb(16, 185, 129)" })
      }

      return vexNote
    })
  }, [exercise.notes, exercise.tempo, currentNoteIndex])

  useEffect(() => {
    if (!containerRef.current) return

    containerRef.current.innerHTML = ""

    try {
      const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG)
      renderer.resize(800, 200)
      const context = renderer.getContext()

      const stave = new Stave(10, 40, 780)
      stave.addClef("treble").addTimeSignature(exercise.timeSignature || "4/4")
      stave.setContext(context).draw()

      const voice = new Voice({ num_beats: 4, beat_value: 4 })
      voice.addTickables(vexNotes)

      new Formatter().joinVoices([voice]).format([voice], 750)
      voice.draw(context, stave)
    } catch (error) {
      console.error("[v0] Error rendering sheet music:", error)
    }
  }, [exercise, vexNotes])

  return (
    <div className={`bg-background border rounded-lg p-4 ${className}`}>
      <div ref={containerRef} className="w-full overflow-x-auto" />
      <div className="mt-4 text-sm text-muted-foreground">
        <p className="font-semibold">{exercise.name}</p>
        <p>{exercise.description}</p>
        <p className="mt-2">
          Tempo: {exercise.tempo} BPM | Compás: {exercise.timeSignature}
        </p>
      </div>
    </div>
  )
}
