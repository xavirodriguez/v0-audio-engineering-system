"use client"

import { createContext, useContext, useState, useMemo } from 'react';
import type { Exercise } from '@/lib/types/exercise';

interface ExerciseContextType {
  currentExercise: Exercise | null;
  selectExercise: (exercise: Exercise) => void;
  exerciseSettings: {
    tempo: number;
    instrument: string;
  };
  updateExerciseSettings: (settings: Partial<ExerciseContextType['exerciseSettings']>) => void;
}

const ExerciseContext = createContext<ExerciseContextType | undefined>(undefined);

export function ExerciseProvider({ children }: { children: React.ReactNode }) {
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [exerciseSettings, setExerciseSettings] = useState({
    tempo: 120,
    instrument: 'violin',
  });

  const selectExercise = (exercise: Exercise) => {
    setCurrentExercise(exercise);
  };

  const updateExerciseSettings = (settings: Partial<ExerciseContextType['exerciseSettings']>) => {
    setExerciseSettings((prev) => ({ ...prev, ...settings }));
  };

  const value = useMemo(() => ({
    currentExercise,
    selectExercise,
    exerciseSettings,
    updateExerciseSettings,
  }), [currentExercise, exerciseSettings]);

  return (
    <ExerciseContext.Provider value={value}>
      {children}
    </ExerciseContext.Provider>
  );
}

export function useExerciseContext() {
  const context = useContext(ExerciseContext);
  if (context === undefined) {
    throw new Error('useExerciseContext must be used within an ExerciseProvider');
  }
  return context;
}
