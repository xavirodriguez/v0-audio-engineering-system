// This is a placeholder component.
// In the future, this will be replaced with a VexFlow implementation.
export function ScaleNotation({ notes }: { notes: string[] }) {
  return (
    <div className="p-4 my-4 border-2 border-dashed rounded-md bg-gray-50 dark:bg-gray-900">
      <p className="text-center text-gray-500 dark:text-gray-400">
        Musical notation for the scale will be displayed here.
      </p>
      {/* A simple text representation of the notes for now */}
      <div className="flex justify-center mt-2 space-x-2 text-lg font-semibold">
        {notes.map((note) => (
          <span key={note}>{note}</span>
        ))}
      </div>
    </div>
  );
}
