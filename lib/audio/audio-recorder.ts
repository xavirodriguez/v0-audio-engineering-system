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
   * @returns {Promise<boolean>} - Whether the recorder was initialized successfully.
   */
  async initialize(): Promise<boolean> {
    try {
      // 👇 OBTENER EL STREAM AQUÍ
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu navegador no soporta acceso al micrófono')
      }

      // Solicitar acceso al micrófono
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        }
      })

      // 👇 VALIDAR QUE EL STREAM SEA VÁLIDO
      if (!stream || stream.getTracks().length === 0) {
        throw new Error('No se pudo obtener el stream de audio')
      }

      this.stream = stream

      // Verificar que el mimeType sea soportado
      const mimeType = "audio/webm;codecs=opus"
      const options = MediaRecorder.isTypeSupported(mimeType)
        ? { mimeType }
        : {} // Fallback a mimeType por defecto del navegador

      // 👇 VALIDAR QUE EL STREAM ESTÉ ACTIVO ANTES DE CREAR EL MEDIARECORDER
      if (!this.stream || !this.stream.active) {
        throw new Error('El stream de audio no está activo')
      }

      this.mediaRecorder = new MediaRecorder(this.stream, options)

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event)
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
        const audioBlob = new Blob(this.audioChunks, { type: this.mediaRecorder?.mimeType || 'audio/webm' })
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
    
    // 👇 CERRAR LOS TRACKS DEL STREAM
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
    }
    
    this.mediaRecorder = null
    this.stream = null
  }
}