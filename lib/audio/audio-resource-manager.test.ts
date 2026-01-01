// lib/audio/audio-resource-manager.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  AudioResourceManager,
  AudioResourceState,
} from "@/lib/audio/audio-resource-manager"
import { audioManager } from "@/lib/audio/audio-resource-manager"

// Mock the global objects before importing the module
const mockMediaStreamSource = {
  connect: vi.fn(),
  disconnect: vi.fn(),
}

const mockAnalyserNode = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  fftSize: 2048,
  smoothingTimeConstant: 0,
}

const mockAudioContext = {
  createMediaStreamSource: vi.fn(() => mockMediaStreamSource),
  createAnalyser: vi.fn(() => mockAnalyserNode),
  close: vi.fn().mockResolvedValue(undefined),
  onstatechange: vi.fn(),
  state: "running",
  sampleRate: 48000,
}

vi.stubGlobal("AudioContext", vi.fn(() => mockAudioContext))
vi.stubGlobal("webkitAudioContext", vi.fn(() => mockAudioContext))

describe("AudioResourceManager", () => {
  let audioManagerInstance: AudioResourceManager
  let mockMediaStream: { getTracks: any }

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()
    // Manually reset the singleton instance for true isolation
    ;(AudioResourceManager as any).instance = null

    mockMediaStream = {
      getTracks: vi.fn(() => [{ stop: vi.fn() }]),
    }

    vi.stubGlobal("navigator", {
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue(mockMediaStream),
      },
    })

    // Create a new instance for each test to prevent state leakage
    audioManagerInstance = new (AudioResourceManager as any)()
  })

  it("should be a singleton", () => {
    const instance1 = AudioResourceManager.getInstance()
    const instance2 = AudioResourceManager.getInstance()
    expect(instance1).toBe(instance2)
  })

  it("should initialize correctly", async () => {
    await audioManagerInstance.initialize()

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    })
    expect(audioManagerInstance.getContext()).not.toBeNull()
    expect(audioManagerInstance.getNode("analyser")).not.toBeUndefined()
  })

  it("should throw an error if initialization fails", async () => {
    const testError = new Error("getUserMedia failed")
    type MockedGetUserMedia = ReturnType<typeof vi.fn<typeof navigator.mediaDevices.getUserMedia>>

    ;(navigator.mediaDevices.getUserMedia as unknown as MockedGetUserMedia)
      .mockRejectedValueOnce(testError)

    await expect(audioManagerInstance.initialize()).rejects.toThrow(
      "getUserMedia failed"
    )
  })

  it("should dispose correctly", async () => {
    await audioManagerInstance.initialize()

    await audioManagerInstance.dispose()

    expect(mockMediaStreamSource.disconnect).toHaveBeenCalled()
    expect(mockAnalyserNode.disconnect).toHaveBeenCalled()
    expect(mockMediaStream.getTracks).toHaveBeenCalled()
    expect(mockAudioContext.close).toHaveBeenCalled()
    expect(audioManagerInstance.getContext()).toBeNull()
  })

  it("should not re-initialize if already running", async () => {
    await audioManagerInstance.initialize()

    // Attempt to initialize again and expect it to throw
    await expect(audioManagerInstance.initialize()).rejects.toThrow(
      `Cannot initialize in state: ${AudioResourceState.RUNNING}`
    )
  })
})
