// lib/validation/schemas.ts
import { z } from 'zod';

// Schema for a single musical note
export const NoteSchema = z.object({
  name: z.string().regex(/^[A-G][#b]?[0-8]$/, "Invalid note name format"), // e.g., A4, C#5, Gb3
  midi: z.number().int().min(0).max(127),
  frequency: z.number().positive(),
  duration: z.number().positive(),
  startTime: z.number().nonnegative(),
});

// Schema for a musical exercise, which is an array of notes
export const ExerciseSchema = z.array(NoteSchema);

// Schema for validating that a note is within the playable range of a violin
export const ViolinNoteSchema = NoteSchema.refine(
  (note) => note.midi >= 55, // G3 is the lowest note on a violin
  { message: "Note is below the playable range of a violin" }
);

// Schema for validating a violin exercise
export const ViolinExerciseSchema = z.array(ViolinNoteSchema);
