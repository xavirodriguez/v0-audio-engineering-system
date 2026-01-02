import { AppError, errorHandler } from "@/lib/errors/error-handler"
import type { WindowWithWebkitAudio } from "@/lib/types/common"

interface IDisposable {
  dispose(): Promise<void>
}

export enum AudioResourceState {
  UNINITIALIZED,
  INITIALIZING,
  RUNNING,
  INTERRUPTED,
  CLOSED,
}

export class AudioResourceManager implements IDisposable {
  private static instance: AudioResourceManager | null = null

  public audioContext: AudioContext | null = null
  private mediaStream: MediaStream | null = null
  private nodeRegistry: Map<string, AudioNode> = new Map()
  private state: AudioResourceState = AudioResourceState.UNINITIALIZED

  private constructor() {}

  public static getInstance(): AudioResourceManager {
    if (!AudioResourceManager.instance) {
      AudioResourceManager.instance = new AudioResourceManager()
    }
    return AudioResourceManager.instance
  }

  public async initialize(signal?: AbortSignal): Promise<AudioContext> {
    if (this.state !== AudioResourceState.UNINITIALIZED) {
      throw new AppError(
        "INVALID_STATE",
        `Cannot initialize in state: ${this.state}`,
        "high"
      )
    }

    this.state = AudioResourceState.INITIALIZING

    try {
      this.audioContext = new (window.AudioContext ||
  (window as WindowWithWebkitAudio).webkitAudioContext!)()
      this.monitorContextState()

      if (signal?.aborted) {
        throw new AppError("INIT_ABORTED", "Initialization was aborted", "low")
      }

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })

      if (signal?.aborted) {
        this.mediaStream.getTracks().forEach((track) => track.stop())
        throw new AppError("INIT_ABORTED", "Initialization was aborted", "low")
      }

      const source = this.audioContext.createMediaStreamSource(this.mediaStream)
      const analyser = this.audioContext.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0

      source.connect(analyser)

      this.nodeRegistry.set("source", source)
      this.nodeRegistry.set("analyser", analyser)

      this.state = AudioResourceState.RUNNING

      errorHandler.info("AudioResourceManager initialized", "AudioResourceManager", {
        sampleRate: this.audioContext.sampleRate,
      })

      return this.audioContext
    } catch (error) {
      this.state = AudioResourceState.UNINITIALIZED
      errorHandler.capture(error, "AudioResourceManager.initialize")
      throw error
    }
  }

  public getContext(): AudioContext | null {
    return this.audioContext
  }

  public getNode(name: string): AudioNode | undefined {
    return this.nodeRegistry.get(name)
  }

  private monitorContextState() {
    if (!this.audioContext) return

    this.audioContext.onstatechange = () => {
      errorHandler.info(
        `AudioContext state changed to: ${this.audioContext?.state}`,
        "AudioResourceManager"
      )
      switch (this.audioContext?.state) {
        case "interrupted":
          this.state = AudioResourceState.INTERRUPTED
          break
        case "running":
          if (this.state === AudioResourceState.INTERRUPTED) {
            this.state = AudioResourceState.RUNNING
          }
          break
        case "closed":
          this.state = AudioResourceState.CLOSED
          break;
      }
    }
  }

  public async dispose(): Promise<void> {
    if (this.state === AudioResourceState.UNINITIALIZED || this.state === AudioResourceState.CLOSED) {
      return
    }

    const source = this.nodeRegistry.get("source")
    const analyser = this.nodeRegistry.get("analyser")

    if (source) source.disconnect()
    if (analyser) analyser.disconnect()
    this.nodeRegistry.clear()

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop())
      this.mediaStream = null
    }

    if (this.audioContext && this.audioContext.state !== "closed") {
      await this.audioContext.close()
    }

    this.audioContext = null
    this.state = AudioResourceState.CLOSED
    AudioResourceManager.instance = null

    errorHandler.info("AudioResourceManager disposed", "AudioResourceManager")
  }
}

export const audioManager = AudioResourceManager.getInstance()
