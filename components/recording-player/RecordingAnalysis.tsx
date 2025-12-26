"use client"

import React, { createContext, useContext } from 'react';
import type { Recording } from '@/lib/types/recording';
import { useTranslations } from 'next-intl';

// 1. Create a context to hold the analysis data
const RecordingAnalysisContext = createContext<Recording['analysis'] | null>(null);

// 2. Create the main parent component
export function RecordingAnalysis({ analysis, children }: { analysis: Recording['analysis']; children: React.ReactNode }) {
  return (
    <RecordingAnalysisContext.Provider value={analysis}>
      <div className="space-y-6">{children}</div>
    </RecordingAnalysisContext.Provider>
  );
}

// 3. Create sub-components for each part of the analysis

function Waveform() {
  const analysis = useContext(RecordingAnalysisContext);
  const t = useTranslations('RecordingAnalysis');
  if (!analysis) return null;

  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-sm">{t('waveformTitle')}</h4>
      <div className="h-32 bg-muted rounded-lg relative overflow-hidden flex items-center justify-center">
        {analysis.intonationGraph.length > 0 ? (
          <svg width="100%" height="100%" className="absolute inset-0">
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="currentColor" strokeWidth="1" opacity="0.3" />
            <line x1="0" y1="25%" x2="100%" y2="25%" stroke="currentColor" strokeWidth="1" opacity="0.1" />
            <line x1="0" y1="75%" x2="100%" y2="75%" stroke="currentColor" strokeWidth="1" opacity="0.1" />
            <polyline
              points={analysis.intonationGraph
                .map((point, index) => {
                  const x = (index / (analysis.intonationGraph.length - 1)) * 100;
                  const y = 50 - (point.deviation / 50) * 50;
                  return `${x},${y}`;
                })
                .join(" ")}
              fill="none"
              stroke="hsl(var(--accent))"
              strokeWidth="2"
            />
          </svg>
        ) : (
          <p className="text-sm text-muted-foreground">{t('noIntonationData')}</p>
        )}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
            <span>-50¢</span>
            <span>0¢</span>
            <span>+50¢</span>
      </div>
    </div>
  );
}

function Stats() {
  const analysis = useContext(RecordingAnalysisContext);
  const t = useTranslations('RecordingAnalysis');
  if (!analysis) return null;

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 85) return "text-green-600";
    if (accuracy >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center">
        <div className={`text-3xl font-bold ${getAccuracyColor(analysis.overallAccuracy)}`}>
          {Math.round(analysis.overallAccuracy)}%
        </div>
        <div className="text-xs text-muted-foreground">{t('overallAccuracy')}</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold">{Math.round(analysis.averageDeviation)}¢</div>
        <div className="text-xs text-muted-foreground">{t('averageDeviation')}</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold">{Math.round(analysis.stabilityScore)}</div>
        <div className="text-xs text-muted-foreground">{t('pitchStability')}</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold">{Math.round(analysis.toneQuality)}</div>
        <div className="text-xs text-muted-foreground">{t('toneQuality')}</div>
      </div>
    </div>
  );
}

// 4. Attach the sub-components to the parent
RecordingAnalysis.Waveform = Waveform;
RecordingAnalysis.Stats = Stats;
