# Dependency Map

This document outlines the dependencies, responsibilities, and side effects of the core hooks in the application.

---

### `hooks/use-pitch-detection.ts`

-   **Stores Consumed:**
    -   `usePitchDetectionStore`: Consumes `status`, `currentPitch`, `currentCents`, `targetFreqHz`, `error`.
    -   Actions Used: `startDetection`, `stopDetection`, `updatePitchEvent`, `resetState`.
-   **Other Hooks Used:**
    -   `useAudioContext`: Manages the `AudioContext` and `AnalyserNode`.
    -   `usePitchProcessor`: Handles the real-time pitch processing in a web worker.
-   **Side Effects:**
    -   Initializes the audio context via `useAudioContext`.
    -   Reports errors to a global `errorManager`.
    -   Dispatches pitch events to the `usePitchDetectionStore`.
-   **Props Received:**
    -   None.

---

### `hooks/use-audio-context.ts`

-   **Stores Consumed:**
    -   None directly, but it's a core dependency for other hooks that use stores.
-   **Other Hooks Used:**
    -   `useAudioHydration`: Ensures that the hook only runs on the client-side.
-   **Side Effects:**
    -   Initializes the `AudioContext` and `AnalyserNode` using a global `audioManager`.
    -   Requests microphone permissions from the user.
    -   Captures and handles audio initialization errors.
-   **Props Received:**
    -   None.

---

### `hooks/use-pitch-processor.ts`

-   **Stores Consumed:**
    -   None.
-   **Other Hooks Used:**
    -   None.
-   **Side Effects:**
    -   Spawns a new Web Worker (`pitch-detector.worker.ts`) to perform pitch detection off the main thread.
    -   Uses `requestAnimationFrame` for a continuous processing loop.
    -   Throttles pitch updates to the parent hook.
    -   Monitors for performance degradation (frame drops, memory leaks).
-   **Props Received:**
    -   `analyser`: `AnalyserNode` for audio data.
    -   `sampleRate`: The sample rate of the audio context.
    -   `isActive`: A boolean to control the processing loop.
    -   `onPitchDetected`: Callback function to send pitch events.
    -   `onError`: Callback function for errors.

---

### `hooks/use-recording.ts`

-   **Stores Consumed:**
    -   `useRecordingStore`: Consumes `recordings`, `isRecording`, `currentRecording`.
    -   Actions Used: `setIsRecording`, `addRecording`, `deleteRecording`, `setCurrentRecording`.
-   **Other Hooks Used:**
    -   None directly, but it's designed to be used alongside `use-audio-context`.
-   **Side Effects:**
    -   Creates and manages an `AudioRecorder` instance.
    -   Creates an `AudioAnalyzer` for processing recordings.
    -   Creates object URLs for recorded audio blobs.
    -   Logs errors to the console.
-   **Props Received:**
    -   None.
