"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MusicalNote } from "@/lib/domains"
import { NotePerformance } from "@/lib/domains/music/note-performance.value-object"

interface PitchIndicatorProps {
  performance: NotePerformance | null;
  targetNote: MusicalNote | null;
  mode: 'tuner' | 'practice';
  onTargetNoteChange: (note: MusicalNote) => void;
}

/**
 * A component that displays a pitch indicator.
 * @param {PitchIndicatorProps} props - The props for the component.
 * @returns {JSX.Element} - The rendered pitch indicator component.
 */
export function PitchIndicator({ performance, targetNote, mode, onTargetNoteChange }: PitchIndicatorProps) {
  const handleNoteSelect = (noteName: string, octave: number) => {
    onTargetNoteChange(MusicalNote.fromNoteName(noteName, octave));
  };

  const TunerButtons = () => (
    <div className="flex justify-center gap-2 mb-4">
      {['G3', 'D4', 'A4', 'E5'].map(string => (
        <Button
          key={string}
          onClick={() => handleNoteSelect(string[0], parseInt(string[1]))}
          variant={targetNote?.getFullName() === string ? 'default' : 'outline'}
        >
          {string[0]}
        </Button>
      ))}
    </div>
  );

  if (!performance || !targetNote) {
    return (
      <div className="p-6 border-t border-border bg-card/50">
        {mode === 'tuner' && <TunerButtons />}
        <div className="text-center text-muted-foreground">Waiting for input...</div>
      </div>
    );
  }

  const notePerformance = performance;

  const colorMap = {
    'in-tune': 'bg-emerald-500',
    'sharp': 'bg-yellow-500',
    'flat': 'bg-blue-500'
  };

  const getPitchIndicatorPosition = () => {
    const clampedCents = Math.max(-50, Math.min(50, notePerformance.playedNote.centsDeviation));
    return (clampedCents / 50) * 50;
  };

  return (
    <div className="p-6 border-t border-border bg-card/50">
      {mode === 'tuner' && <TunerButtons />}
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-sm font-medium text-muted-foreground mb-2">Indicador de Afinación</div>
          <div className="relative h-16 bg-muted rounded-xl overflow-hidden shadow-inner">
            <div className="absolute inset-y-0 left-1/2 w-1/4 -translate-x-1/2 bg-emerald-500/10" />
            <div className="absolute inset-y-0 left-1/2 w-1 bg-foreground/20 -translate-x-1/2" />
            <motion.div
              className={`absolute inset-y-0 w-3 rounded-full transition-colors duration-100 ${colorMap[notePerformance.quality.tuning]}`}
              animate={{
                left: `calc(50% + ${getPitchIndicatorPosition()}%)`,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{
                transform: "translateX(-50%)",
                boxShadow: "0 0 20px currentColor",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-between px-4 text-xs text-muted-foreground font-mono">
              <span>-50¢</span>
              <span>-25¢</span>
              <span className="font-bold">0¢</span>
              <span>+25¢</span>
              <span>+50¢</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border bg-background/50 p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-1">{targetNote?.getFullName() || "--"}</div>
              <div className="text-xs text-muted-foreground">Nota Objetivo</div>
            </div>
          </Card>
          <Card className="border-border bg-background/50 p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-1">
                {notePerformance.playedNote.getFullName()}
              </div>
              <div className="text-xs text-muted-foreground">Playing</div>
            </div>
          </Card>
          <Card className="border-border bg-background/50 p-4">
            <div className="text-center">
              <div
                className={`text-3xl font-bold mb-1 ${
                  notePerformance.quality.tuning === 'in-tune'
                    ? "text-emerald-600"
                    : "text-yellow-600"
                }`}
              >
                {notePerformance.playedNote.centsDeviation > 0 ? "+" : ""}
                {notePerformance.playedNote.centsDeviation.toFixed(1)}¢
              </div>
              <div className="text-xs text-muted-foreground">Tuning</div>
            </div>
          </Card>
          <Card className="border-border bg-background/50 p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-1">{notePerformance.quality.steadiness === 'stable' ? 'Stable' : 'Detecting...'}</div>
              <div className="text-xs text-muted-foreground">Steadiness</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
