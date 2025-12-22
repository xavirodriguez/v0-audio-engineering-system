"use client"

import { useState, useEffect } from "react"
import { usePitchDetectionStore } from "@/lib/store/pitch-detection-store"

/**
 * A hook to determine if the Zustand store has been rehydrated from localStorage.
 * This is crucial for Next.js to prevent hydration mismatch errors.
 * On the server and during the first client render, it returns false.
 * After the client has mounted and the store is rehydrated, it returns true.
 * @returns {boolean} - True if the store is rehydrated, false otherwise.
 */
export function useAudioHydration(): boolean {
  // Default to false on the server and initial client render
  const [isHydrated, setIsHydrated] = useState(
    () => usePitchDetectionStore.persist.hasHydrated()
  );

  // useEffect only runs on the client, after the component has mounted
  useEffect(() => {
    const unsub = usePitchDetectionStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    // In case hydration finished between the initial state check and the subscription,
    // we set the state directly.
    setIsHydrated(usePitchDetectionStore.persist.hasHydrated());

    return () => {
      unsub();
    };
  }, []);

  return isHydrated;
}
