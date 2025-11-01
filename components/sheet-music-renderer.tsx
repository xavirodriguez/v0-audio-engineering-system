"use client"

import { useEffect, useRef } from "react"
import { Renderer, Stave, StaveNote, Voice, Formatter, Articulation, Annotation } from "vexflow"
import type { Exercise } from "@/lib/types/exercise-system"

interface SheetMusicRendererProps {
  exercise: Exercise
  currentNoteIndex: number
  className?: string
}

export function SheetMusicRenderer({ exercise, currentNoteIndex, className = "" }: SheetMusicRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Clear previous content
    containerRef.current.innerHTML = ""

    try {
      // Create VexFlow renderer
      const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG)
      renderer.resize(800, 200)
      const context = renderer.getContext()

      // Create a stave
      const stave = new Stave(10, 40, 780)
      stave.addClef("treble").addTimeSignature(exercise.timeSignature || "4/4")
      stave.setContext(context).draw()

      // Convert exercise notes to VexFlow notes
      const vexNotes: StaveNote[] = []

      exercise.notes.forEach((note, index) => {
        // Determine note duration for VexFlow
        let duration = "q" // quarter note by default
        const noteDurationMs = note.duration
        const beatDuration = 60000 / exercise.tempo

        if (noteDurationMs >= beatDuration * 4)
          duration = "w" // whole
        else if (noteDurationMs >= beatDuration * 2)
          duration = "h" // half
        else if (noteDurationMs >= beatDuration)
          duration = "q" // quarter
        else if (noteDurationMs >= beatDuration / 2)
          duration = "8" // eighth
        else duration = "16" // sixteenth

        // Parse note name (e.g., "A4" -> ["A", "4"])
        const noteName = note.name.replace(/[#b]/, "")
        const octave = noteName.slice(-1)
        const pitch = noteName.slice(0, -1).toLowerCase()

        // Create VexFlow note
        const vexNote = new StaveNote({
          keys: [`${pitch}/${octave}`],
          duration: duration,
        })

        // Add accidentals if needed
        if (note.name.includes("#")) {
          vexNote.addModifier(0, new Articulation("a#").setPosition(3))
        } else if (note.name.includes("b")) {
          vexNote.addModifier(0, new Articulation("ab").setPosition(3))
        }

        // Add fingering annotation
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

        vexNotes.push(vexNote)
      })

      // Create a voice and add notes
      const voice = new Voice({ num_beats: 4, beat_value: 4 })
      voice.addTickables(vexNotes)

      // Format and draw
      new Formatter().joinVoices([voice]).format([voice], 750)
      voice.draw(context, stave)
    } catch (error) {
      console.error("[v0] Error rendering sheet music:", error)
    }
  }, [exercise, currentNoteIndex])

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
