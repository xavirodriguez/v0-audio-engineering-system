/**
 * Records audio.
 */
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private stream: MediaStream | null = null
  private isRecording = false
  private startTime = 0
  private pitchData: Array<{
    timestamp: number
    frequency: number
    cents: number
    confidence: number
    rms: number
  }> = []

  /**
   * Initializes the audio recorder.
   * @param {MediaStream} stream - The media stream to record.
   * @returns {Promise<boolean>} - Whether the recorder was initialized successfully.
   */
  async initialize(stream: MediaStream): Promise<boolean> {
    try {
      this.stream = stream

      // Configurar MediaRecorder
      const options = { mimeType: "audio/webm;codecs=opus" }
      this.mediaRecorder = new MediaRecorder(stream, options)

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      console.log("[v0] Audio recorder initialized")
      return true
    } catch (error) {
      console.error("[v0] Failed to initialize recorder:", error)
      return false
    }
  }

  /**
   * Starts recording.
   */
  startRecording() {
    if (!this.mediaRecorder || this.isRecording) return

    this.audioChunks = []
    this.pitchData = []
    this.startTime = Date.now()

    this.mediaRecorder.start(100) // Capturar cada 100ms
    this.isRecording = true

    console.log("[v0] Recording started")
  }

  /**
   * Stops recording.
   * @returns {Promise<Blob>} - The recorded audio blob.
   */
  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error("Not recording"))
        return
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" })
        this.isRecording = false
        console.log("[v0] Recording stopped")
        resolve(audioBlob)
      }

      this.mediaRecorder.stop()
    })
  }

  /**
   * Adds a pitch data point to the recording.
   * @param {number} frequency - The frequency of the pitch.
   * @param {number} cents - The cents of the pitch.
   * @param {number} confidence - The confidence of the pitch.
   * @param {number} rms - The RMS of the pitch.
   */
  addPitchDataPoint(frequency: number, cents: number, confidence: number, rms: number) {
    if (!this.isRecording) return

    const timestamp = Date.now() - this.startTime

    this.pitchData.push({
      timestamp,
      frequency,
      cents,
      confidence,
      rms,
    })
  }

  /**
   * Gets the pitch data.
   * @returns {Array<{timestamp: number, frequency: number, cents: number, confidence: number, rms: number}>} - The pitch data.
   */
  getPitchData() {
    return this.pitchData
  }

  /**
   * Whether the recorder is currently recording.
   * @returns {boolean} - Whether the recorder is currently recording.
   */
  isCurrentlyRecording(): boolean {
    return this.isRecording
  }

  /**
   * Destroys the recorder.
   */
  destroy() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop()
    }
    this.mediaRecorder = null
    this.stream = null
  }
}
