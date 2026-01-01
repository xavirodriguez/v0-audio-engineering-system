export interface WASMPitchResult {
  pitch_hz: number
  confidence: number
  clarity: number
}

interface WASMExports extends WebAssembly.Exports {
  __heap_base?: WebAssembly.Global
  process_audio_yin?: (bufferPtr: number, length: number, threshold: number) => number
  process_audio_autocorr?: (bufferPtr: number, length: number) => number
  get_rms?: (bufferPtr: number, length: number) => number
}

/**
 * A pitch detector that uses WebAssembly.
 */
export class WASMPitchDetector {
  private module: WebAssembly.Instance | null = null
  private memory: WebAssembly.Memory | null = null
  private bufferPtr = 0
  private resultPtr = 0
  private isLoaded = false

  /**
   * Initializes the WASM module.
   * @returns {Promise<boolean>} - Whether the module was initialized successfully.
   */
  async initialize(): Promise<boolean> {
    try {
      // Cargar el módulo WASM
      const response = await fetch("/wasm/pitch-detector.wasm")
      const wasmBuffer = await response.arrayBuffer()

      // Crear memoria compartida
      this.memory = new WebAssembly.Memory({
        initial: 256,
        maximum: 512,
      })

      // Compilar e instanciar
      const wasmModule = await WebAssembly.instantiate(wasmBuffer, {
        env: {
          memory: this.memory,
          // Funciones matemáticas que WASM podría necesitar
          sinf: Math.sin,
          cosf: Math.cos,
          sqrtf: Math.sqrt,
          fabsf: Math.abs,
          fminf: Math.min,
          fmaxf: Math.max,
        },
      })

      this.module = wasmModule.instance

      // Alocar memoria para buffer de entrada (2048 floats = 8192 bytes)
      this.bufferPtr = this.allocate(2048 * 4)

      // Alocar memoria para resultado (3 floats = 12 bytes)
      this.resultPtr = this.allocate(12)

      this.isLoaded = true
      console.log("[v0] WASM module loaded successfully")
      return true
    } catch (error) {
      console.error("[v0] Failed to load WASM module:", error)
      this.isLoaded = false
      return false
    }
  }

  private allocate(size: number): number {
    if (!this.module || !this.memory) return 0

    // Simplificación: usar offset fijo en memoria
    // En producción, implementar un allocator apropiado
    const exports = this.module.exports as WASMExports
    if (exports.__heap_base) {
      return exports.__heap_base.value
    }
    return 1024 // Offset por defecto
  }

  /**
   * Detects the pitch of an audio buffer using YIN.
   * @param {Float32Array} buffer - The audio buffer.
   * @param {number} [threshold=0.1] - The threshold for the YIN algorithm.
   * @returns {WASMPitchResult | null} - The detected pitch and confidence.
   */
  detectPitchYIN(buffer: Float32Array, threshold = 0.1): WASMPitchResult | null {
    if (!this.isLoaded || !this.module || !this.memory) {
      return null
    }

    try {
      // Copiar buffer de entrada a memoria WASM
      const memoryBuffer = new Float32Array(this.memory.buffer, this.bufferPtr, buffer.length)
      memoryBuffer.set(buffer)

      // Llamar a la función WASM
      const exports = this.module.exports as WASMExports
      const resultPtr = exports.process_audio_yin!(this.bufferPtr, buffer.length, threshold)

      // Leer resultado desde memoria WASM
      const resultView = new Float32Array(this.memory.buffer, resultPtr, 3)

      return {
        pitch_hz: resultView[0],
        confidence: resultView[1],
        clarity: resultView[2],
      }
    } catch (error) {
      console.error("[v0] WASM pitch detection error:", error)
      return null
    }
  }

  /**
   * Detects the pitch of an audio buffer using autocorrelation.
   * @param {Float32Array} buffer - The audio buffer.
   * @returns {WASMPitchResult | null} - The detected pitch and confidence.
   */
  detectPitchAutocorr(buffer: Float32Array): WASMPitchResult | null {
    if (!this.isLoaded || !this.module || !this.memory) {
      return null
    }

    try {
      const memoryBuffer = new Float32Array(this.memory.buffer, this.bufferPtr, buffer.length)
      memoryBuffer.set(buffer)

      const exports = this.module.exports as WASMExports
      const resultPtr = exports.process_audio_autocorr!(this.bufferPtr, buffer.length)

      const resultView = new Float32Array(this.memory.buffer, resultPtr, 3)

      return {
        pitch_hz: resultView[0],
        confidence: resultView[1],
        clarity: resultView[2],
      }
    } catch (error) {
      console.error("[v0] WASM autocorr detection error:", error)
      return null
    }
  }

  /**
   * Gets the RMS of an audio buffer.
   * @param {Float32Array} buffer - The audio buffer.
   * @returns {number} - The RMS.
   */
  getRMS(buffer: Float32Array): number {
    if (!this.isLoaded || !this.module || !this.memory) {
      return 0
    }

    try {
      const memoryBuffer = new Float32Array(this.memory.buffer, this.bufferPtr, buffer.length)
      memoryBuffer.set(buffer)

      const exports = this.module.exports as WASMExports
      return exports.get_rms!(this.bufferPtr, buffer.length)
    } catch (error) {
      console.error("[v0] WASM RMS calculation error:", error)
      return 0
    }
  }

  /**
   * Whether the WASM module is ready.
   * @returns {boolean} - Whether the WASM module is ready.
   */
  isReady(): boolean {
    return this.isLoaded
  }

  /**
   * Destroys the WASM module.
   */
  destroy() {
    this.module = null
    this.memory = null
    this.isLoaded = false
  }
}
