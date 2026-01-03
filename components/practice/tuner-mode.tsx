"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MusicalNote } from "@/lib/domains"
import { motion } from "framer-motion"

interface TunerModeProps {
  onStringSelected: (note: MusicalNote) => void
  currentCents: number
  isStable: boolean
}

const VIOLIN_STRINGS = [
  { name: "G", note: "G", octave: 3, frequency: 196.0, midi: 55, color: "bg-blue-500" },
  { name: "D", note: "D", octave: 4, frequency: 293.66, midi: 62, color: "bg-green-500" },
  { name: "A", note: "A", octave: 4, frequency: 440.0, midi: 69, color: "bg-yellow-500" },
  { name: "E", note: "E", octave: 5, frequency: 659.25, midi: 76, color: "bg-red-500" },
]

export function TunerMode({ onStringSelected, currentCents, isStable }: TunerModeProps) {
  const [selectedString, setSelectedString] = useState<string>("A")

  const handleStringClick = (string: typeof VIOLIN_STRINGS[0]) => {
    setSelectedString(string.name)
    const note = MusicalNote.fromNoteName(string.note, string.octave)
    onStringSelected(note)
  }

  const getStatusColor = () => {
    if (!isStable) return "text-gray-500"
    const absCents = Math.abs(currentCents)
    if (absCents < 5) return "text-emerald-500"
    if (absCents < 15) return "text-yellow-500"
    return "text-red-500"
  }

  const getStatusText = () => {
    if (!isStable) return "Esperando señal..."
    const absCents = Math.abs(currentCents)
    if (absCents < 5) return "¡Afinado!"
    if (currentCents > 0) return "Demasiado agudo"
    return "Demasiado grave"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-serif font-bold mb-2">Afinador de Violín</h2>
        <p className="text-muted-foreground">Selecciona la cuerda que deseas afinar</p>
      </div>

      {/* String Selector */}
      <div className="grid grid-cols-4 gap-4">
        {VIOLIN_STRINGS.map((string) => (
          <Button
            key={string.name}
            onClick={() => handleStringClick(string)}
            variant={selectedString === string.name ? "default" : "outline"}
            className={`h-24 text-2xl font-bold transition-all ${
              selectedString === string.name
                ? `${string.color} text-white hover:opacity-90`
                : ""
            }`}
          >
            <div className="flex flex-col items-center">
              <span>{string.name}</span>
              <span className="text-xs font-normal opacity-70">
                {string.frequency.toFixed(0)} Hz
              </span>
            </div>
          </Button>
        ))}
      </div>

      {/* Status Display */}
      <Card className="p-6 bg-card/50">
        <div className="text-center space-y-4">
          <div className={`text-6xl font-bold tabular-nums ${getStatusColor()}`}>
            {currentCents > 0 ? "+" : ""}
            {currentCents.toFixed(1)}¢
          </div>
          <div className="text-xl font-medium">{getStatusText()}</div>

          {/* Visual Indicator */}
          <div className="relative h-4 bg-muted rounded-full overflow-hidden">
            <div className="absolute inset-y-0 left-1/2 w-1 bg-foreground/20 -translate-x-1/2 z-10" />
            <motion.div
              className={`absolute inset-y-0 w-2 rounded-full ${
                Math.abs(currentCents) < 5 ? "bg-emerald-500" : "bg-yellow-500"
              }`}
              animate={{
                left: `calc(50% + ${Math.max(-50, Math.min(50, currentCents))}%)`,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ transform: "translateX(-50%)" }}
            />
          </div>

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Grave (-50¢)</span>
            <span>Agudo (+50¢)</span>
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <Card className="p-4 bg-muted/30">
        <h3 className="font-semibold mb-2">Instrucciones:</h3>
        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Selecciona la cuerda que quieres afinar</li>
          <li>Toca la cuerda en tu violín</li>
          <li>Ajusta las clavijas hasta que el indicador muestre 0¢</li>
          <li>Cuando veas "¡Afinado!" en verde, la cuerda está lista</li>
        </ol>
      </Card>
    </div>
  )
}
