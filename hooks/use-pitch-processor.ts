
import { useRef, useCallback, useEffect } from "react";
import type { PitchEvent } from "@/lib/types/pitch-detection";
import { useFeedbackState } from "./logic/use-feedback-state";
import { usePitchDetectionStore } from "@/lib/store/pitch-detection-store";


// A type for the buffered metrics
type BufferedMetric = {
  pitchHz: number;
  confidence: number;
  rms: number;
  clarity: number;
};

interface UsePitchProcessorConfig {
  analyser: AnalyserNode | null;
  sampleRate: number;
  isActive: boolean;
  onPitchDetected: (event: PitchEvent) => void;
  onError: (error: Error) => void;
}

export function usePitchProcessor(config: UsePitchProcessorConfig) {
  const { analyser, sampleRate, isActive, onPitchDetected, onError } = config;
  const { dispatch: dispatchFeedback } = useFeedbackState();
  const targetNote = usePitchDetectionStore(state => state.notes[state.currentNoteIndex]);
  const lastCentsZoneRef = useRef<number>(0);

  const workerRef = useRef<Worker | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // Refs for throttling
  const metricsBufferRef = useRef<BufferedMetric[]>([]);
  const lastFlushRef = useRef<number>(0);

  // Refs for session health monitoring
  const sessionMetricsRef = useRef({
    startTime: Date.now(),
    frameCount: 0,
    droppedFrames: 0,
    memoryUsageAtStart: performance.memory?.usedJSHeapSize,
  });

  useEffect(() => {
    const worker = new Worker(new URL('../workers/pitch-detector.worker.ts', import.meta.url));
    workerRef.current = worker;

    worker.postMessage({ type: 'init', payload: { sampleRate } });

    worker.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'result' && payload.pitchHz > 0) {
        metricsBufferRef.current.push({
          pitchHz: payload.pitchHz,
          confidence: payload.confidence,
          rms: payload.rms,
          clarity: payload.clarity,
        });
      }
    };

    worker.onerror = (error) => {
      onError(error);
    };

    lastFlushRef.current = performance.now();

    return () => {
      worker.terminate();
    };
  }, [sampleRate, onError]);

  const processFrame = useCallback(() => {
    const startFrameTime = performance.now();
    if (!analyser || !workerRef.current) {
      return;
    }

    if (!sampleRate || sampleRate <= 0) {
      onError(new Error('[PitchProcessor] No valid sampleRate, cannot process'));
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      return;
    }

    const sessionMetrics = sessionMetricsRef.current;
    sessionMetrics.frameCount++;

    const now = performance.now();
    if (now - lastFlushRef.current > 100) {
      const buffer = metricsBufferRef.current;
      if (buffer.length > 0) {
        const avg = {
          pitchHz: buffer.reduce((sum, m) => sum + m.pitchHz, 0) / buffer.length,
          confidence: buffer.reduce((sum, m) => sum + m.confidence, 0) / buffer.length,
          rms: buffer.reduce((sum, m) => sum + m.rms, 0) / buffer.length,
          clarity: buffer.reduce((sum, m) => sum + m.clarity, 0) / buffer.length,
        };

        const pitchEvent: PitchEvent = {
          ...avg,
          timestamp: now / 1000,
          frameIndex: 0,
        };
        onPitchDetected(pitchEvent);

        // Dispatch discrete feedback event if conditions are met
        if (targetNote && avg.confidence > 0.9) {
          const cents = frequencyToCents(avg.pitchHz, targetNote.frequency);

          const zones = [-50, -20, -5, 5, 20, 50];
          const currentZone = zones.find(z => cents < z) ?? 50;

          if (currentZone !== lastCentsZoneRef.current) {
            lastCentsZoneRef.current = currentZone;
            dispatchFeedback({
              type: 'TUNING_UPDATE',
              cents: cents,
              timestamp: pitchEvent.timestamp,
            });
          }
        }
      }

      metricsBufferRef.current = [];
      lastFlushRef.current = now;
    }

    const dataArray = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(dataArray);
    workerRef.current.postMessage({ type: 'process', payload: { buffer: dataArray } }, [dataArray.buffer]);

    if (rafIdRef.current !== null) {
      rafIdRef.current = requestAnimationFrame(processFrame);
    }

    const frameTime = performance.now() - startFrameTime;
    if (frameTime > 16.67) {
      sessionMetrics.droppedFrames++;
    }

    if (sessionMetrics.frameCount % 600 === 0) {
      const elapsed = Date.now() - sessionMetrics.startTime;
      const dropRate = sessionMetrics.droppedFrames / sessionMetrics.frameCount;
      const memoryNow = performance.memory?.usedJSHeapSize || 0;
      const memoryDelta = memoryNow - (sessionMetrics.memoryUsageAtStart || 0);

      console.log(`[SessionHealth] ${Math.round(elapsed / 1000)}s | ` +
                  `drops: ${(dropRate * 100).toFixed(1)}% | ` +
                  `memory: +${Math.round(memoryDelta / 1024 / 1024)}MB`);

      if (dropRate > 0.1) {
        console.warn(`[Degradation Alert] Frame drop rate > 10%`);
      }
      if (memoryDelta > 50 * 1024 * 1024) {
        console.warn(`[Degradation Alert] Memory growth > 50MB`);
      }
    }
  }, [analyser, onPitchDetected, onError, sampleRate]);

  useEffect(() => {
    if (isActive && analyser) {
      rafIdRef.current = requestAnimationFrame(processFrame);
    }

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      metricsBufferRef.current = [];
    };
  }, [isActive, analyser, processFrame]);

  return {
    isProcessing: rafIdRef.current !== null,
  };
}
