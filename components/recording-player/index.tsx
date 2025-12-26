"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, Download, Trash2 } from "lucide-react"
import type { Recording } from "@/lib/types/recording"
import { useRecordingPlayer } from "@/hooks/useRecordingPlayer"
import { RecordingAnalysis } from "./RecordingAnalysis"

interface RecordingPlayerProps {
  recording: Recording
  onDelete: (id: string) => void
}

/**
 * A component that displays a recording player.
 * @param {RecordingPlayerProps} props - The props for the component.
 * @returns {JSX.Element} - The rendered recording player component.
 */
export function RecordingPlayer({ recording, onDelete }: RecordingPlayerProps) {
  const {
    isPlaying,
    currentTime,
    togglePlayback,
    downloadRecording,
    formatTime,
  } = useRecordingPlayer(recording)

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
        {/* Playback Controls */}
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

        {/* Recording Analysis */}
        <RecordingAnalysis analysis={recording.analysis}>
          <RecordingAnalysis.Stats />
          <RecordingAnalysis.Waveform />
        </RecordingAnalysis>
      </CardContent>
    </Card>
  )
}
