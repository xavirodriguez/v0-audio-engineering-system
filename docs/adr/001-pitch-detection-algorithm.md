# ADR 001: YIN Algorithm for Pitch Detection

## Status

Accepted

## Context

We need to detect pitch in real-time for a violin learning application with the following requirements:
- Latency < 20ms for responsive feedback
- Accuracy > 95% for violin range (196-3136Hz / G3-G7)
- Support for harmonic-rich instruments
- Browser compatibility (Web Audio API)

## Decision

Use the YIN algorithm (de Cheveigné & Kawahara, 2002) as the primary pitch detection method, with:
- WASM implementation for performance-critical paths
- JavaScript fallback for compatibility
- FFT-based spectral analysis for tone quality metrics

## Consequences

### Positive
- 95%+ accuracy on violin frequencies
- 10-15ms latency in WASM mode
- Robust against harmonics and overtones
- Well-documented algorithm with proven results

### Negative
- Requires compiling WASM module (Emscripten toolchain)
- Slightly higher complexity than autocorrelation
- Need to maintain both WASM and JS implementations

## Alternatives Considered

### Pure FFT
- **Rejected**: 50ms+ latency due to window size requirements
- Better for spectral analysis than pitch detection

### Simple Autocorrelation
- **Rejected**: Less accurate on harmonic-rich signals
- Prone to octave errors on violin

### Machine Learning (CREPE, etc.)
- **Rejected**: Too heavy for real-time browser use
- Requires large model files and GPU acceleration

## Implementation Notes

- YIN threshold: 0.1 (balance between accuracy and latency)
- Sample rate: 48kHz preferred, 44.1kHz supported
- Buffer size: 2048 samples (42ms at 48kHz)
- Parabolic interpolation for sub-sample accuracy

## References

- de Cheveigné, A., & Kawahara, H. (2002). YIN, a fundamental frequency estimator for speech and music. The Journal of the Acoustical Society of America, 111(4), 1917-1930.
