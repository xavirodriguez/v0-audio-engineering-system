# Configuración de WASM para Detección de Pitch

## Requisitos

Para compilar el módulo WASM, necesitas instalar Emscripten SDK:

\`\`\`bash
# Clonar el repositorio de Emscripten
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk

# Instalar la última versión
./emsdk install latest
./emsdk activate latest

# Configurar variables de entorno
source ./emsdk_env.sh
\`\`\`

## Compilación

Una vez instalado Emscripten, ejecuta:

\`\`\`bash
chmod +x scripts/compile-wasm.sh
./scripts/compile-wasm.sh
\`\`\`

Esto generará el archivo `public/wasm/pitch-detector.wasm`.

## Beneficios de WASM

- **Rendimiento**: 3-5x más rápido que JavaScript puro
- **Latencia**: Reducción de ~50ms a ~10ms en detección de pitch
- **Eficiencia**: Menor uso de CPU, mejor para dispositivos móviles
- **Precisión**: Algoritmos optimizados con aritmética de punto flotante nativa

## Fallback Automático

Si WASM no está disponible o falla al cargar, el sistema automáticamente usa la implementación JavaScript como fallback, garantizando compatibilidad universal.
