/**
 * @fileoverview Unit tests for PitchToMusicAdapter and MusicToLearningAdapter.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PitchSample } from '../../lib/domains/dsp/pitch-sample';
import { MusicalNote } from '../../lib/domains/music/musical-note';
import { MusicalObservation } from '../../lib/domains/music/musical-observation';
import { PitchToMusicAdapter } from '../../lib/domains/adapters/pitch-to-music-adapter';
import { MusicToLearningAdapter } from '../../lib/domains/adapters/music-to-learning-adapter';
import { SignalType } from '../../lib/domains/learning/learning-signal';

describe('PitchToMusicAdapter', () => {
  let adapter: PitchToMusicAdapter;

  beforeEach(() => {
    adapter = new PitchToMusicAdapter();
  });

  describe('translate', () => {
    it('should translate valid sample to observation', () => {
      const sample = PitchSample.create(440, 0.95, 0.05);
      const observation = adapter.translate(sample);

      expect(observation).not.toBeNull();
      expect(observation!.note.noteName).toBe('A');
      expect(observation!.note.octave).toBe(4);
      expect(observation!.confidence).toBe(0.95);
    });

    it('should return null for silent sample', () => {
      const sample = PitchSample.create(440, 0.95, 0.005);
      const observation = adapter.translate(sample);

      expect(observation).toBeNull();
    });

    it('should return null for low confidence sample', () => {
      const sample = PitchSample.create(440, 0.5, 0.05);
      const observation = adapter.translate(sample);

      expect(observation).toBeNull();
    });

    it('should track stability across samples', () => {
      const sample1 = PitchSample.create(440, 0.95, 0.05);
      const sample2 = PitchSample.create(441, 0.95, 0.05);
      const sample3 = PitchSample.create(440, 0.95, 0.05);

      const obs1 = adapter.translate(sample1);
      const obs2 = adapter.translate(sample2);
      const obs3 = adapter.translate(sample3);

      expect(obs1!.stableFrames).toBe(1);
      expect(obs2!.stableFrames).toBe(2); // Same MIDI number
      expect(obs3!.stableFrames).toBe(3);
    });

    it('should reset stability when note changes significantly', () => {
      const sampleA4 = PitchSample.create(440, 0.95, 0.05);
      const sampleB4 = PitchSample.create(494, 0.95, 0.05); // B4

      const obs1 = adapter.translate(sampleA4);
      const obs2 = adapter.translate(sampleA4);
      const obs3 = adapter.translate(sampleB4);

      expect(obs1!.stableFrames).toBe(1);
      expect(obs2!.stableFrames).toBe(2);
      expect(obs3!.stableFrames).toBe(1); // Reset
    });
  });

  describe('translateBatch', () => {
    it('should translate multiple samples efficiently', () => {
      const samples = [
        PitchSample.create(440, 0.95, 0.05),
        PitchSample.create(441, 0.95, 0.05),
        PitchSample.create(440, 0.95, 0.05),
      ];

      const observations = adapter.translateBatch(samples);

      expect(observations.length).toBe(3);
      expect(observations[2].stableFrames).toBe(3);
    });

    it('should skip invalid samples in batch', () => {
      const samples = [
        PitchSample.create(440, 0.95, 0.05),
        PitchSample.create(440, 0.5, 0.05), // Low confidence
        PitchSample.create(440, 0.95, 0.05),
      ];

      const observations = adapter.translateBatch(samples);

      expect(observations.length).toBe(2);
    });
  });

  describe('reset', () => {
    it('should reset internal state', () => {
      const sample = PitchSample.create(440, 0.95, 0.05);

      adapter.translate(sample);
      adapter.translate(sample);
      expect(adapter.getStableFrameCount()).toBe(2);

      adapter.reset();
      expect(adapter.getStableFrameCount()).toBe(0);
      expect(adapter.getPreviousNote()).toBeNull();
    });
  });
});

describe('MusicToLearningAdapter', () => {
  let adapter: MusicToLearningAdapter;
  let targetNote: MusicalNote;

  beforeEach(() => {
    adapter = new MusicToLearningAdapter();
    targetNote = MusicalNote.fromNoteName('A', 4);
  });

  describe('translate', () => {
    it('should generate accurate pitch feedback', () => {
      const note = MusicalNote.fromFrequency(440);
      const observation = MusicalObservation.create(note, 0.95, Date.now(), 5);

      const feedback = adapter.translate(observation, targetNote, 10);

      expect(feedback.signals.length).toBeGreaterThan(0);
      const pitchSignal = feedback.signals.find(s => s.type === SignalType.PITCH_ACCURATE);
      expect(pitchSignal).toBeDefined();
    });

    it('should generate sharp pitch feedback', () => {
      const note = MusicalNote.fromFrequency(445); // Sharp A4
      const observation = MusicalObservation.create(note, 0.95, Date.now(), 5);

      const feedback = adapter.translate(observation, targetNote, 10);

      const sharpSignal = feedback.signals.find(s => s.type === SignalType.PITCH_SHARP);
      expect(sharpSignal).toBeDefined();
    });

    it('should generate flat pitch feedback', () => {
      const note = MusicalNote.fromFrequency(435); // Flat A4
      const observation = MusicalObservation.create(note, 0.95, Date.now(), 5);

      const feedback = adapter.translate(observation, targetNote, 10);

      const flatSignal = feedback.signals.find(s => s.type === SignalType.PITCH_FLAT);
      expect(flatSignal).toBeDefined();
    });

    it('should track streak correctly', () => {
      const note = MusicalNote.fromFrequency(440);
      const observation = MusicalObservation.create(note, 0.95, Date.now(), 5);

      // Successful notes
      adapter.translate(observation, targetNote, 10);
      adapter.translate(observation, targetNote, 10);
      const feedback = adapter.translate(observation, targetNote, 10);

      expect(feedback.metrics.currentStreak).toBe(3);
    });

    it('should break streak on wrong note', () => {
      const correctNote = MusicalNote.fromFrequency(440);
      const wrongNote = MusicalNote.fromFrequency(494); // B4
      const correctObs = MusicalObservation.create(correctNote, 0.95, Date.now(), 5);
      const wrongObs = MusicalObservation.create(wrongNote, 0.95, Date.now(), 5);

      adapter.translate(correctObs, targetNote, 10);
      adapter.translate(correctObs, targetNote, 10);
      const feedback = adapter.translate(wrongObs, targetNote, 10);

      expect(feedback.metrics.currentStreak).toBe(0);
    });

    it('should generate streak milestone signal', () => {
      const note = MusicalNote.fromFrequency(440);
      const observation = MusicalObservation.create(note, 0.95, Date.now(), 5);

      // Generate 5 successful notes for milestone
      let feedback;
      for (let i = 0; i < 5; i++) {
        feedback = adapter.translate(observation, targetNote, 10);
      }

      const milestoneSignal = feedback!.signals.find(s => s.type === SignalType.STREAK_MILESTONE);
      expect(milestoneSignal).toBeDefined();
    });

    it('should not generate feedback for unreliable observations', () => {
      const note = MusicalNote.fromFrequency(440);
      const unreliableObs = MusicalObservation.create(note, 0.5, Date.now(), 1);

      const feedback = adapter.translate(unreliableObs, targetNote, 10);

      // Should not generate pitch feedback
      const pitchSignals = feedback.signals.filter(s =>
        s.type === SignalType.PITCH_ACCURATE ||
        s.type === SignalType.PITCH_SHARP ||
        s.type === SignalType.PITCH_FLAT
      );
      expect(pitchSignals.length).toBe(0);
    });

    it('should calculate accuracy correctly', () => {
      const note = MusicalNote.fromFrequency(440);
      const observation = MusicalObservation.create(note, 0.95, Date.now(), 5);

      const feedback1 = adapter.translate(observation, targetNote, 10);
      const feedback2 = adapter.translate(observation, targetNote, 10);

      expect(feedback2.metrics.accuracy).toBeGreaterThan(0);
      expect(feedback2.metrics.accuracy).toBeLessThanOrEqual(100);
    });

    it('should track progress correctly', () => {
      const note = MusicalNote.fromFrequency(440);
      const observation = MusicalObservation.create(note, 0.95, Date.now(), 5);

      const feedback1 = adapter.translate(observation, targetNote, 10);
      const feedback2 = adapter.translate(observation, targetNote, 10);

      expect(feedback1.metrics.notesCompleted).toBe(1);
      expect(feedback2.metrics.notesCompleted).toBe(2);
      expect(feedback2.metrics.notesTotal).toBe(10);
    });
  });

  describe('reset', () => {
    it('should reset internal state', () => {
      const note = MusicalNote.fromFrequency(440);
      const observation = MusicalObservation.create(note, 0.95, Date.now(), 5);

      adapter.translate(observation, targetNote, 10);
      adapter.translate(observation, targetNote, 10);

      const stateBefore = adapter.getState();
      expect(stateBefore.currentStreak).toBe(2);

      adapter.reset();

      const stateAfter = adapter.getState();
      expect(stateAfter.currentStreak).toBe(0);
      expect(stateAfter.notesCompleted).toBe(0);
    });
  });
});
