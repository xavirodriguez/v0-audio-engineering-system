# Integración de Tonal.js y VexFlow

Este documento explica cómo se han integrado las librerías **Tonal.js** y **VexFlow** en la aplicación de aprendizaje de violín, siguiendo la arquitectura recomendada donde Tonal actúa como el "cerebro" (lógica musical) y VexFlow como los "ojos" (visualización).

## Arquitectura General

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                      │
│                      (Client-Side)                           │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         VexFlow - Motor de Renderizado             │    │
│  │  • Renderiza partituras con notación estándar      │    │
│  │  • Muestra digitación, arcos, posiciones           │    │
│  │  • Visualiza patrones rítmicos complejos           │    │
│  │  • Resalta la nota actual durante la práctica      │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↑                                   │
│                          │ Exercise Data                     │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────────┐
│                    CAPA DE LÓGICA                            │
│                   (Business Logic)                           │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Tonal.js - Motor de Datos                  │    │
│  │  • Calcula entonación justa (Just Intonation)      │    │
│  │  • Genera escalas en cualquier tonalidad           │    │
│  │  • Analiza intervalos y acordes                    │    │
│  │  • Transpone notas y calcula frecuencias           │    │
│  │  • Proporciona teoría musical ortodoxa             │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
\`\`\`

## 1. Tonal.js - El Cerebro Musical

### Ubicación en el Código

Tonal.js se utiliza principalmente en:
- `lib/audio/note-utils.ts` - Funciones de utilidad musical
- `lib/ai/exercise-generator.ts` - Generación de ejercicios

### Funcionalidades Implementadas

#### 1.1 Conversión de Notas y Frecuencias

\`\`\`typescript
import { Note } from "tonal"

// Convertir MIDI a frecuencia usando Tonal
export function midiToFrequency(midi: number): number {
  const freq = Note.freq(Note.fromMidi(midi))
  return freq || 440
}

// Convertir MIDI a nombre de nota
export function midiToNoteName(midi: number): string {
  return Note.fromMidi(midi) || "A4"
}
\`\`\`

**Ventaja sobre implementación manual:** Tonal maneja automáticamente casos edge, enarmónicos y proporciona nombres de notas consistentes.

#### 1.2 Entonación Justa (Just Intonation)

\`\`\`typescript
import { Note, Interval } from "tonal"

export function calculateJustIntonation(rootNote: string, intervalName: string): number {
  try {
    const targetNote = Note.transpose(rootNote, intervalName)
    const freq = Note.freq(targetNote)
    return freq || 440
  } catch {
    return 440
  }
}
\`\`\`

**Uso en ejercicios:**
\`\`\`typescript
const justFrequency = calculateJustIntonation("A4", "5P") // Quinta justa desde A4
\`\`\`

Esto es crucial para violinistas, ya que la entonación justa suena más "pura" que el temperamento igual.

#### 1.3 Generación de Escalas

\`\`\`typescript
import { Scale } from "tonal"

export function generateScale(tonic: string, scaleType: string = "major"): string[] {
  const scale = Scale.get(`${tonic} ${scaleType}`)
  return scale.notes
}
\`\`\`

**Ejemplo de uso:**
\`\`\`typescript
const scaleNotes = generateScale("A4", "major")
// Resultado: ["A4", "B4", "C#5", "D5", "E5", "F#5", "G#5"]
\`\`\`

**Ventaja:** Soporta cualquier tonalidad y tipo de escala (mayor, menor, modos, etc.) sin codificación manual.

#### 1.4 Análisis de Intervalos

\`\`\`typescript
import { Interval } from "tonal"

export function analyzeInterval(note1: string, note2: string): string {
  return Interval.distance(note1, note2)
}
\`\`\`

**Uso en el analizador de rendimiento:** Permite evaluar si el estudiante está tocando los intervalos correctos.

#### 1.5 Análisis de Acordes

\`\`\`typescript
import { Chord } from "tonal"

export function analyzeChord(notes: string[]): string {
  const chord = Chord.detect(notes)
  return chord[0] || "Unknown"
}
\`\`\`

**Uso futuro:** Para ejercicios de dobles cuerdas y acordes.

### Integración en ExerciseGenerator

El `ExerciseGenerator` usa Tonal para crear ejercicios musicalmente correctos:

\`\`\`typescript
generateScaleExercise(difficulty: DifficultyLevel, key: "major" | "minor", position: 1 | 2 | 3): Exercise {
  // Generar escala usando Tonal
  const scaleNotes = generateScale("A4", key)
  
  // Convertir a MIDI
  const scale = scaleNotes.map((note) => Note.midi(note) || 69)
  
  // Para cada nota, calcular frecuencia de entonación justa
  scale.forEach((midi, index) => {
    const noteName = midiToNoteName(midi)
    const justFrequency = calculateJustIntonation("A4", Interval.distance("A4", noteName))
    
    notes.push({
      midi,
      frequency: midiToFrequency(midi),
      targetFrequencyJust: justFrequency, // ¡Entonación justa!
      name: noteName,
      // ... más propiedades
    })
  })
}
\`\`\`

## 2. VexFlow - Los Ojos Musicales

### Ubicación en el Código

VexFlow se utiliza en:
- `components/sheet-music-renderer.tsx` - Componente de renderizado de partituras

### Funcionalidades Implementadas

#### 2.1 Renderizado de Partituras

\`\`\`typescript
import { Renderer, Stave, StaveNote, Voice, Formatter } from "vexflow"

export function SheetMusicRenderer({ exercise, currentNoteIndex }: Props) {
  // Crear renderer SVG
  const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG)
  renderer.resize(800, 200)
  
  // Crear pentagrama
  const stave = new Stave(10, 40, 780)
  stave.addClef("treble").addTimeSignature(exercise.timeSignature)
  
  // Convertir notas del ejercicio a formato VexFlow
  const vexNotes = exercise.notes.map((note, index) => {
    const vexNote = new StaveNote({
      keys: [`${pitch}/${octave}`],
      duration: duration,
    })
    
    // Resaltar nota actual
    if (index === currentNoteIndex) {
      vexNote.setStyle({ 
        fillStyle: "rgb(16, 185, 129)", 
        strokeStyle: "rgb(16, 185, 129)" 
      })
    }
    
    return vexNote
  })
}
\`\`\`

#### 2.2 Anotaciones Pedagógicas

VexFlow permite agregar instrucciones visuales:

**Digitación:**
\`\`\`typescript
if (note.fingering !== undefined) {
  vexNote.addModifier(0, new Annotation(String(note.fingering)))
}
\`\`\`

**Símbolos de Arco:**
\`\`\`typescript
if (note.bowing) {
  const bowingSymbol = note.bowing.direction === "down" ? "a>" : "a^"
  vexNote.addModifier(0, new Articulation(bowingSymbol))
}
\`\`\`

**Alteraciones:**
\`\`\`typescript
if (note.name.includes("#")) {
  vexNote.addModifier(0, new Articulation("a#"))
}
\`\`\`

#### 2.3 Integración con el Sistema de Práctica

El componente `InteractivePractice` permite alternar entre dos vistas:

1. **Vista Animada** (ScoreView) - Estilo "Guitar Hero" para práctica dinámica
2. **Vista de Partitura** (SheetMusicRenderer) - Notación tradicional con VexFlow

\`\`\`typescript
const [viewMode, setViewMode] = useState<"animated" | "sheet-music">("animated")

// Toggle button
<Button onClick={() => setViewMode(viewMode === "animated" ? "sheet-music" : "animated")}>
  {viewMode === "animated" ? "Partitura" : "Animado"}
</Button>

// Renderizado condicional
{viewMode === "animated" ? (
  <ScoreView notes={state.notes} currentNoteIndex={state.currentNoteIndex} />
) : (
  <SheetMusicRenderer exercise={currentExercise} currentNoteIndex={state.currentNoteIndex} />
)}
\`\`\`

## 3. Flujo de Datos Completo

\`\`\`
1. Usuario selecciona ejercicio
         ↓
2. ExerciseGenerator usa Tonal.js para generar datos
   • Calcula notas de la escala
   • Determina frecuencias de entonación justa
   • Asigna digitación y arcos
         ↓
3. Estructura Exercise se crea con:
   • notes: ExerciseNote[] (con toda la información)
   • tempo, timeSignature, focusAreas, etc.
         ↓
4. InteractivePractice recibe el Exercise
         ↓
5. Usuario elige vista:
   
   OPCIÓN A: Vista Animada          OPCIÓN B: Vista Partitura
   • ScoreView renderiza            • SheetMusicRenderer usa VexFlow
   • Notas como círculos            • Partitura tradicional
   • Animación horizontal           • Digitación y arcos visibles
         ↓                                  ↓
6. Sistema de detección de pitch compara:
   • Frecuencia detectada vs targetFrequency (temperamento igual)
   • Frecuencia detectada vs targetFrequencyJust (entonación justa)
         ↓
7. Feedback visual en tiempo real
   • Nota actual resaltada (verde en ambas vistas)
   • Indicador de afinación (aguja)
   • Métricas de precisión
\`\`\`

## 4. Ventajas de esta Arquitectura

### 4.1 Separación de Responsabilidades

- **Tonal.js** maneja toda la lógica musical compleja
- **VexFlow** se enfoca solo en la visualización
- Fácil de mantener y extender

### 4.2 Precisión Musical

- Entonación justa calculada correctamente
- Escalas generadas para cualquier tonalidad
- Intervalos analizados con precisión

### 4.3 Claridad Pedagógica

- Notación estándar reconocible
- Instrucciones visuales claras (digitación, arcos)
- Dos modos de visualización para diferentes estilos de aprendizaje

### 4.4 Extensibilidad

Fácil agregar nuevas características:
- Más tipos de escalas (modos, pentatónicas, etc.)
- Acordes y dobles cuerdas
- Análisis armónico avanzado
- Transposición automática

## 5. Ejemplos de Uso

### Crear un ejercicio de escala con entonación justa

\`\`\`typescript
const generator = new ExerciseGenerator()
const exercise = generator.generateScaleExercise("medium", "major", 1)

// El ejercicio incluye:
// - notes con targetFrequencyJust para cada nota
// - fingering y bowing para cada nota
// - tempo y timeSignature
\`\`\`

### Renderizar la partitura

\`\`\`typescript
<SheetMusicRenderer 
  exercise={exercise} 
  currentNoteIndex={currentNoteIndex} 
/>
\`\`\`

### Analizar el rendimiento

\`\`\`typescript
const analyzer = new PerformanceAnalyzer()
const metrics = analyzer.analyzeSession(session, audioData)

// Métricas incluyen:
// - accuracy, stability, responseTime
// - toneQuality, spectralCentroid, attackTime
\`\`\`

## 6. Próximos Pasos

### Mejoras Futuras

1. **Más tipos de ejercicios usando Tonal:**
   - Arpegios
   - Modos griegos
   - Escalas cromáticas
   - Ejercicios de modulación

2. **Visualizaciones avanzadas con VexFlow:**
   - Múltiples pentagramas
   - Dinámicas y expresiones
   - Ligaduras y fraseo
   - Ornamentación

3. **Análisis armónico:**
   - Detección de progresiones de acordes
   - Análisis de contexto tonal
   - Sugerencias de acompañamiento

## Conclusión

La integración de Tonal.js y VexFlow proporciona una base sólida y ortodoxa para la aplicación de aprendizaje de violín. Tonal garantiza la precisión teórica y VexFlow asegura la claridad visual, creando una experiencia de aprendizaje profesional y efectiva.
