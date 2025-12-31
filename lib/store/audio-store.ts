import { create } from 'zustand';
import { ViolinSampler } from '@/lib/audio/violin-sampler';

interface AudioState {
  sampler: ViolinSampler | null;
  isLoaded: boolean;
  isLoading: boolean;
  isPlaying: boolean;
  currentScale: string[];
  tempo: number;
  stopLoop: (() => void) | null;

  initialize: () => Promise<void>;
  playNote: (note: string) => void;
  playScale: () => void;
  startLoop: () => void;
  stop: () => void;
  setCurrentScale: (notes: string[]) => void;
  setTempo: (tempo: number) => void;
  dispose: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  sampler: null,
  isLoaded: false,
  isLoading: false,
  isPlaying: false,
  currentScale: [],
  tempo: 60,
  stopLoop: null,

  initialize: async () => {
    if (get().sampler || get().isLoading) return;

    set({ isLoading: true });
    try {
      const sampler = new ViolinSampler();
      await sampler.initialize();
      set({ sampler, isLoaded: true, isLoading: false });

      // Set a default scale on load
      const { Scale } = await import('@tonaljs/scale');
      get().setCurrentScale(Scale.get('C major').notes);
    } catch (error) {
      console.error('Failed to initialize violin sampler', error);
      set({ isLoading: false });
    }
  },

  playNote: (note: string) => {
    const { sampler } = get();
    sampler?.playNote(note);
  },

  playScale: () => {
    const { sampler, currentScale, tempo } = get();
    sampler?.playScale(currentScale, tempo);
  },

  startLoop: () => {
    const { sampler, currentScale, tempo, isPlaying } = get();
    if (isPlaying || !sampler) return;

    const stop = sampler.startPracticeLoop(currentScale, tempo);
    set({ isPlaying: true, stopLoop: () => stop });
  },

  stop: () => {
    const { stopLoop } = get();
    if (stopLoop) {
      stopLoop();
      set({ isPlaying: false, stopLoop: null });
    }
  },

  setCurrentScale: (notes) => {
    set({ currentScale: notes });
  },

  setTempo: (tempo) => {
    set({ tempo });
  },

  dispose: () => {
    get().sampler?.dispose();
    set({ sampler: null, isLoaded: false });
  },
}));
