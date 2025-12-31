import { MusicalNote } from "@/lib/domains";

// lib/domains/music/note-performance.value-object.ts
export class NotePerformance {
  constructor(
    public readonly playedNote: MusicalNote,
    public readonly targetNote: MusicalNote,
    public readonly quality: PerformanceQuality
  ) {}

  isAccurate(): boolean {
    return this.playedNote.matchesTarget(this.targetNote) &&
           this.quality.tuning === 'in-tune';
  }

  needsCorrection(): boolean {
    return this.quality.tuning !== 'in-tune';
  }
}

export class PerformanceQuality {
  constructor(
    public readonly tuning: 'sharp' | 'in-tune' | 'flat',
    public readonly steadiness: 'stable' | 'wavering',
    public readonly volume: 'soft' | 'adequate' | 'loud'
  ) {}

  isGood(): boolean {
    return this.tuning === 'in-tune' &&
           this.steadiness === 'stable';
  }
}
