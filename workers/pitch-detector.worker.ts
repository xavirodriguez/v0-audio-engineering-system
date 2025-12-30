// workers/pitch-detector.worker.ts
import { PitchSample } from '@/lib/domains';

// A simple PitchDetector class that will be instantiated in the worker
class PitchDetector {
    private sampleRate: number;

    constructor(sampleRate: number) {
        this.sampleRate = sampleRate;
    }

    calculateRMS(buffer: Float32Array): number {
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
            sum += buffer[i] * buffer[i];
        }
        return Math.sqrt(sum / buffer.length);
    }

    // The YIN algorithm, directly moved from the original PitchDetector class
    detectPitchYINJS(buffer: Float32Array): { pitchHz: number; confidence: number } {
        const SIZE = buffer.length;
        const threshold = 0.1;
        const yinBuffer = new Float32Array(SIZE / 2);

        yinBuffer[0] = 1;
        for (let tau = 1; tau < yinBuffer.length; tau++) {
            let sum = 0;
            for (let i = 0; i < yinBuffer.length; i++) {
                const delta = buffer[i] - buffer[i + tau];
                sum += delta * delta;
            }
            yinBuffer[tau] = sum;
        }

        let runningSum = 0;
        for (let tau = 1; tau < yinBuffer.length; tau++) {
            runningSum += yinBuffer[tau];
            yinBuffer[tau] = yinBuffer[tau] === 0 ? 1 : (yinBuffer[tau] * tau) / runningSum;
        }

        let tau = -1;
        for (let i = 2; i < yinBuffer.length; i++) {
            if (yinBuffer[i] < threshold) {
                while (i + 1 < yinBuffer.length && yinBuffer[i + 1] < yinBuffer[i]) {
                    i++;
                }
                tau = i;
                break;
            }
        }

        if (tau === -1) {
            let minValue = 1;
            for (let i = 2; i < yinBuffer.length; i++) {
                if (yinBuffer[i] < minValue) {
                    minValue = yinBuffer[i];
                    tau = i;
                }
            }
        }

        if (tau === -1 || tau === 0) {
            return { pitchHz: 0, confidence: 0 };
        }

        let betterTau = tau;
        if (tau > 0 && tau < yinBuffer.length - 1) {
            const s0 = yinBuffer[tau - 1];
            const s1 = yinBuffer[tau];
            const s2 = yinBuffer[tau + 1];
            betterTau = tau + (s2 - s0) / (2 * (2 * s1 - s2 - s0));
        }

        const pitchHz = this.sampleRate / betterTau;
        const confidence = 1 - yinBuffer[tau];

        return { pitchHz, confidence };
    }
}

let detector: PitchDetector | null = null;

// Listen for messages from the main thread
self.onmessage = (event) => {
    const { type, payload } = event.data;

    if (type === 'init') {
        detector = new PitchDetector(payload.sampleRate);
    } else if (type === 'process') {
        if (detector) {
            const { pitchHz, confidence } = detector.detectPitchYINJS(payload.buffer);
            const rms = detector.calculateRMS(payload.buffer);

            const sample = PitchSample.create(pitchHz, confidence, rms);

            self.postMessage({
                type: 'PITCH_SAMPLE',
                sample: {
                  frequency: sample.frequency,
                  confidence: sample.confidence,
                  rms: sample.rms,
                  timestamp: sample.timestamp
                }
              });
        }
    }
};

export default {};
