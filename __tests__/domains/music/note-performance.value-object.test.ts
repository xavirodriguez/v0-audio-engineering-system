import { describe, it, expect } from 'vitest';
import { NotePerformance, PerformanceQuality } from '@/lib/domains/music/note-performance.value-object';
import { MusicalNote } from '@/lib/domains';

describe('NotePerformance', () => {
  it('should be accurate when the note matches and tuning is in-tune', () => {
    const targetNote = MusicalNote.fromMidi(69); // A4
    const playedNote = MusicalNote.fromMidi(69);
    const quality = new PerformanceQuality('in-tune', 'stable', 'adequate');
    const performance = new NotePerformance(playedNote, targetNote, quality);

    expect(performance.isAccurate()).toBe(true);
  });

  it('should not be accurate when the note does not match', () => {
    const targetNote = MusicalNote.fromMidi(69); // A4
    const playedNote = MusicalNote.fromMidi(70); // A#4
    const quality = new PerformanceQuality('in-tune', 'stable', 'adequate');
    const performance = new NotePerformance(playedNote, targetNote, quality);

    expect(performance.isAccurate()).toBe(false);
  });

  it('should not be accurate when the tuning is not in-tune', () => {
    const targetNote = MusicalNote.fromMidi(69); // A4
    const playedNote = MusicalNote.fromMidi(69);
    const quality = new PerformanceQuality('sharp', 'stable', 'adequate');
    const performance = new NotePerformance(playedNote, targetNote, quality);

    expect(performance.isAccurate()).toBe(false);
  });
});
