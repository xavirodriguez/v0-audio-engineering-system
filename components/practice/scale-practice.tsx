'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAudioStore } from '@/lib/store/audio-store';
import { ScaleNotation } from './scale-notation';

// Define a list of common scales for the dropdown
const COMMON_SCALES = [
  'C Major',
  'G Major',
  'D Major',
  'A Major',
  'E Major',
  'F Major',
  'Bb Major',
  'A Minor',
  'E Minor',
  'B Minor',
];

export function ScalePractice() {
  const {
    initialize,
    isLoaded,
    isLoading,
    isPlaying,
    currentScale,
    tempo,
    playNote,
    playScale,
    startLoop,
    stop,
    setCurrentScale,
    setTempo,
    dispose,
  } = useAudioStore();

  const [selectedScale, setSelectedScale] = useState(COMMON_SCALES[0]);
  const [scaleLib, setScaleLib] = useState<{
    get: (name: string) => { notes: string[] }
  } | null>(null)

  // Dynamically load the @tonaljs/scale library on the client side
  useEffect(() => {
    import('@tonaljs/scale')
      .then((module) => {
        setScaleLib(module)
      })
      .catch((error) => {
        console.error("Failed to load @tonaljs/scale", error)
      })
  }, [])

  // Memoize the scale notes, recalculating only when the library or selection changes
  const scaleNotes = useMemo(() => {
    if (!scaleLib) {
      // Return a default or empty array while the library is loading
      return ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"]
    }
    try {
      const scaleName = selectedScale.toLowerCase()
      // Ensure notes are in a playable octave for the violin samples
      return scaleLib.get(`${scaleName}`).notes.map((note: string) => `${note}4`)
    } catch (error) {
      console.error("Error getting scale notes:", error)
      return ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"]
    }
  }, [selectedScale, scaleLib])

  // Initialize the sampler when the component mounts
  useEffect(() => {
    initialize();

    // Clean up the sampler when the component unmounts
    return () => {
      dispose();
    };
  }, [initialize, dispose]);

  // Update the Zustand store when the selected scale changes
  useEffect(() => {
    setCurrentScale(scaleNotes);
  }, [scaleNotes, setCurrentScale]);

  const handleScaleChange = (value: string) => {
    setSelectedScale(value);
  };

  const handleTempoChange = (value: number[]) => {
    setTempo(value[0]);
  };

  return (
    <div className="w-full max-w-2xl p-4 mx-auto space-y-6 border rounded-lg shadow-md md:p-6">
      <h2 className="text-2xl font-bold text-center">Scale Practice</h2>

      {/* Scale Selector */}
      <div className="space-y-2">
        <label htmlFor="scale-select" className="text-sm font-medium">
          Select a Scale
        </label>
        <Select
          value={selectedScale}
          onValueChange={handleScaleChange}
          disabled={isPlaying}
        >
          <SelectTrigger id="scale-select">
            <SelectValue placeholder="Select a scale" />
          </SelectTrigger>
          <SelectContent>
            {COMMON_SCALES.map((scale) => (
              <SelectItem key={scale} value={scale}>
                {scale}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tempo Control */}
      <div className="space-y-2">
        <label htmlFor="tempo-slider" className="text-sm font-medium">
          Tempo: {tempo} BPM
        </label>
        <Slider
          id="tempo-slider"
          value={[tempo]}
          onValueChange={handleTempoChange}
          min={40}
          max={180}
          step={5}
          disabled={isPlaying}
        />
      </div>

      {/* Note Visualization */}
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {currentScale.map((note) => (
          <Button
            key={note}
            variant="outline"
            onClick={() => playNote(note)}
            disabled={!isLoaded || isPlaying}
            className="h-16 text-lg"
          >
            {note.slice(0, -1)} {/* Remove octave number for display */}
          </Button>
        ))}
      </div>

      {/* Placeholder for VexFlow Notation */}
      <ScaleNotation notes={currentScale} />

      {/* Playback Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button
          onClick={playScale}
          disabled={!isLoaded || isLoading || isPlaying}
          className="w-full sm:w-auto"
        >
          {isLoading ? 'Loading Samples...' : 'Play Once'}
        </Button>

        {!isPlaying ? (
          <Button
            onClick={startLoop}
            disabled={!isLoaded || isLoading}
            variant="secondary"
            className="w-full sm:w-auto"
          >
            Start Practice Loop
          </Button>
        ) : (
          <Button onClick={stop} variant="destructive" className="w-full sm:w-auto">
            Stop Loop
          </Button>
        )}
      </div>
    </div>
  );
}
