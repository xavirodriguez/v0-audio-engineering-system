"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Download, Trash2, TrendingUp, TrendingDown } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import type { Recording } from "@/lib/types/recording"

interface RecordingPlayerProps {
  recording: Recording
  onDelete: (id: string) => void
}

export function RecordingPlayer({ recording, onDelete }: RecordingPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (recording.audioUrl) {
      audioRef.current = new Audio(recording.audioUrl)

      audioRef.current.addEventListener("timeupdate", () => {
        setCurrentTime(audioRef.current?.currentTime || 0)
      })

      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false)
        setCurrentTime(0)
      })
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [recording.audioUrl])

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

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="font-serif">{recording.exerciseName || "Grabación de Práctica"}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(recording.timestamp).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={downloadRecording}>
              <Download className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => onDelete(recording.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controles de reproducción */}
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <Button size="lg" variant="outline" onClick={togglePlayback}>
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            <div className="flex-1">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all"
                  style={{
                    width: `${(currentTime / (recording.duration / 1000)) * 100}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(recording.duration / 1000)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas de análisis */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-3xl font-bold ${getAccuracyColor(recording.analysis.overallAccuracy)}`}>
              {Math.round(recording.analysis.overallAccuracy)}%
            </div>
            <div className="text-xs text-muted-foreground">Precisión</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">{Math.round(recording.analysis.averageDeviation)}¢</div>
            <div className="text-xs text-muted-foreground">Desviación Promedio</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">{Math.round(recording.analysis.stabilityScore)}</div>
            <div className="text-xs text-muted-foreground">Estabilidad</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">{Math.round(recording.analysis.toneQuality)}</div>
            <div className="text-xs text-muted-foreground">Calidad de Tono</div>
          </div>
        </div>

        {/* Gráfico de entonación */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Gráfico de Entonación</h4>
          <div className="h-32 bg-muted rounded-lg relative overflow-hidden flex items-center justify-center">
            {recording.analysis.intonationGraph.length > 0 ? (
              <svg width="100%" height="100%" className="absolute inset-0">
                {/* Línea central (0 cents) */}
                <line x1="0" y1="50%" x2="100%" y2="50%" stroke="currentColor" strokeWidth="1" opacity="0.3" />

                {/* Líneas de referencia */}
                <line x1="0" y1="25%" x2="100%" y2="25%" stroke="currentColor" strokeWidth="1" opacity="0.1" />
                <line x1="0" y1="75%" x2="100%" y2="75%" stroke="currentColor" strokeWidth="1" opacity="0.1" />

                {/* Datos de entonación */}
                <polyline
                  points={recording.analysis.intonationGraph
                    .map((point, index) => {
                      const x = (index / (recording.analysis.intonationGraph.length - 1)) * 100
                      const y = 50 - (point.deviation / 50) * 50 // Escalar cents a porcentaje
                      return `${x},${y}`
                    })
                    .join(" ")}
                  fill="none"
                  stroke="hsl(var(--accent))"
                  strokeWidth="2"
                />
              </svg>
            ) : (
              <p className="text-sm text-muted-foreground">No hay datos de entonación disponibles.</p>
            )}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>-50¢</span>
            <span>0¢</span>
            <span>+50¢</span>
          </div>
        </div>

        {/* Áreas problemáticas */}
        {recording.analysis.problemAreas.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Áreas a Mejorar</h4>
            <div className="space-y-2">
              {recording.analysis.problemAreas.slice(0, 3).map((problem, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <Badge
                    variant="outline"
                    className={
                      problem.severity === "high"
                        ? "bg-red-500/10 text-red-600 border-red-500/20"
                        : problem.severity === "medium"
                          ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                          : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                    }
                  >
                    {formatTime(problem.startTime)}
                  </Badge>
                  <div className="flex-1">
                    <div className="font-medium">{problem.issue}</div>
                    <div className="text-muted-foreground text-xs">{problem.suggestion}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recomendaciones */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Recomendaciones</h4>
          <ul className="space-y-1">
            {recording.analysis.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                {recording.analysis.overallAccuracy >= 85 ? (
                  <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                )}
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
