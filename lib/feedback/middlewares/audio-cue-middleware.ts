import type { MiddlewareConfig } from "../middleware-config";
import type { FeedbackMiddleware } from "../types";

let audioContext: AudioContext | null = null;

/**
 * Gets a singleton instance of the AudioContext.
 * It's created on-demand to ensure it's initialized after user interaction.
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    } catch (e) {
      console.error("Web Audio API is not supported in this browser.", e);
      return null;
    }
  }
  return audioContext;
}


/**
 * Plays a synthetic sound using the Web Audio API.
 * This avoids needing actual audio files for placeholders.
 * @param type The type of sound to play ('success' or 'error').
 * @param volume The volume to play the sound at (0 to 1).
 */
function playSyntheticSound(
  type: "success" | "error",
  volume: number
) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  gainNode.gain.setValueAtTime(volume * 0.5, ctx.currentTime);

  if (type === "success") {
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  } else {
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(110, ctx.currentTime); // A2
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  }

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.3);
}


/**
 * Creates a middleware that plays audio cues for specific events.
 * Uses synthetic sounds generated with the Web Audio API as placeholders.
 *
 * @param config The configuration for the audio cue middleware.
 * @returns A feedback middleware function.
 */
export const createAudioCueMiddleware =
  (
    config: MiddlewareConfig["audioCue"]
  ): FeedbackMiddleware =>
  (state, action) => {
    if (!config.enabled) return;

    let soundType: "success" | "error" | null = null;

    if (
      action.type === "NOTE_COMPLETED" &&
      action.accuracy >= 90 // Assuming a threshold for success
    ) {
      soundType = "success";
    } else if (action.type === "ERROR" && action.severity !== 'info') {
      soundType = "error";
    }

    if (soundType) {
        try {
            playSyntheticSound(soundType, config.volume);
        } catch(e) {
            console.error("Failed to play audio cue:", e);
        }
    }
  };
