import * as Tone from 'tone';

// URLs for the violin samples hosted on jsDelivr
const violinSamples = {
  'A3': 'https://cdn.jsdelivr.net/npm/tonejs-instrument-violin-mp3@1.1.1/dist/A3.mp3',
  'A4': 'https://cdn.jsdelivr.net/npm/tonejs-instrument-violin-mp3@1.1.1/dist/A4.mp3',
  'A5': 'https://cdn.jsdelivr.net/npm/tonejs-instrument-violin-mp3@1.1.1/dist/A5.mp3',
  'C4': 'https://cdn.jsdelivr.net/npm/tonejs-instrument-violin-mp3@1.1.1/dist/C4.mp3',
  'C5': 'https://cdn.jsdelivr.net/npm/tonejs-instrument-violin-mp3@1.1.1/dist/C5.mp3',
  'C6': 'https://cdn.jsdelivr.net/npm/tonejs-instrument-violin-mp3@1.1.1/dist/C6.mp3',
  'E4': 'https://cdn.jsdelivr.net/npm/tonejs-instrument-violin-mp3@1.1.1/dist/E4.mp3',
  'E5': 'https://cdn.jsdelivr.net/npm/tonejs-instrument-violin-mp3@1.1.1/dist/E5.mp3',
  'G3': 'https://cdn.jsdelivr.net/npm/tonejs-instrument-violin-mp3@1.1.1/dist/G3.mp3',
  'G4': 'https://cdn.jsdelivr.net/npm/tonejs-instrument-violin-mp3@1.1.1/dist/G4.mp3',
  'G5': 'https://cdn.jsdelivr.net/npm/tonejs-instrument-violin-mp3@1.1.1/dist/G5.mp3',
};

export class ViolinSampler {
  private sampler: Tone.Sampler | null = null;
  private isLoaded = false;

  async initialize() {
    return new Promise<void>((resolve, reject) => {
      this.sampler = new Tone.Sampler({
        urls: violinSamples,
        onload: () => {
          this.isLoaded = true;
          this.sampler?.toDestination();
          resolve();
        },
        onerror: (error) => {
          console.error("Error loading violin samples:", error);
          reject(error);
        }
      });
    });
  }

  // Reproduce una nota individual
  playNote(note: string, duration = '4n') {
    if (!this.isLoaded || !this.sampler) return;

    this.sampler.triggerAttackRelease(note, duration);
  }

  // Reproduce una escala completa
  playScale(notes: string[], tempo = 120) {
    if (!this.isLoaded || !this.sampler) return;

    // Configura el tempo
    Tone.Transport.bpm.value = tempo;

    // Programa la secuencia de notas
    const sequence = new Tone.Sequence(
      (time, note) => {
        this.sampler!.triggerAttackRelease(note, '4n', time);
      },
      notes,
      '4n' // Cada nota dura una negra
    );

    sequence.start(0);
    Tone.Transport.start();

    // Detiene después de tocar todas las notas
    const duration = (notes.length * (60 / tempo)) + 0.5;
    setTimeout(() => {
      Tone.Transport.stop();
      sequence.dispose();
    }, duration * 1000);
  }

  // Reproduce la escala con loop para práctica
  startPracticeLoop(notes: string[], tempo = 60) {
    if (!this.isLoaded || !this.sampler) return;

    Tone.Transport.bpm.value = tempo;

    const sequence = new Tone.Sequence(
      (time, note) => {
        this.sampler!.triggerAttackRelease(note, '4n', time);
      },
      notes,
      '4n'
    );

    sequence.loop = true;
    sequence.start(0);
    Tone.Transport.start();

    return () => {
      Tone.Transport.stop();
      sequence.dispose();
    };
  }

  dispose() {
    this.sampler?.dispose();
    Tone.Transport.stop();
  }
}
