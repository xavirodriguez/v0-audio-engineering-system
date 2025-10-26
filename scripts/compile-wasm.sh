#!/bin/bash

# Script para compilar el código C a WebAssembly
# Requiere Emscripten SDK instalado

echo "Compilando pitch-detector.c a WebAssembly..."

emcc public/wasm/pitch-detector.c \
  -o public/wasm/pitch-detector.wasm \
  -O3 \
  -s WASM=1 \
  -s EXPORTED_FUNCTIONS='["_process_audio_yin","_process_audio_autocorr","_get_rms"]' \
  -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]' \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s MODULARIZE=1 \
  -s EXPORT_NAME='PitchDetectorWASM' \
  --no-entry

echo "Compilación completada: public/wasm/pitch-detector.wasm"
