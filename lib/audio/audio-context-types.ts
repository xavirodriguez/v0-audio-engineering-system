export type AudioContextConstructor = {
  new (options?: AudioContextOptions): AudioContext
}

export const getAudioContextClass = (): AudioContextConstructor => {
  if (typeof window === "undefined") {
    throw new Error("AudioContext is only available in browser environment")
  }

  const AudioContextClass =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext

  if (!AudioContextClass) {
    throw new Error("AudioContext is not supported in this browser")
  }

  return AudioContextClass
}

export const createAudioContext = (options?: AudioContextOptions): AudioContext => {
  const AudioContextClass = getAudioContextClass()
  return new AudioContextClass(options)
}
