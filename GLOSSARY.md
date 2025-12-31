# Domain Glossary

This document defines the ubiquitous language used throughout the project's domain.

## Value Objects

### `NotePerformance`

Represents the quality of a student's attempt to play a single musical note compared to a target note. It encapsulates the played note, the target note, and the overall quality of the performance.

- **playedNote**: The `MusicalNote` the student played.
- **targetNote**: The `MusicalNote` the student was supposed to play.
- **quality**: A `PerformanceQuality` object describing how well the note was played.

### `PerformanceQuality`

Describes the specific characteristics of a `NotePerformance`.

- **tuning**: How accurate the pitch was ('sharp', 'in-tune', 'flat').
- **steadiness**: How stable the pitch was ('stable', 'wavering').
- **volume**: How loud the note was ('soft', 'adequate', 'loud').

### `ExerciseProgress`

Represents the student's progress through a musical exercise. (Currently a placeholder, to be expanded later).
