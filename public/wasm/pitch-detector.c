#include <math.h>
#include <stdint.h>

#define SAMPLE_RATE 48000
#define BUFFER_SIZE 2048
#define MAX_LAG 2048

// Estructura para resultados de detección
typedef struct {
    float pitch_hz;
    float confidence;
    float clarity;
} PitchResult;

// Algoritmo YIN optimizado en C
PitchResult detect_pitch_yin(float* buffer, int size, float threshold) {
    PitchResult result = {0.0f, 0.0f, 0.0f};
    
    // Buffer para diferencias
    float diff[MAX_LAG];
    float cumulative[MAX_LAG];
    
    // Paso 1: Calcular función de diferencia
    diff[0] = 1.0f;
    for (int tau = 1; tau < MAX_LAG && tau < size / 2; tau++) {
        float sum = 0.0f;
        for (int i = 0; i < size / 2; i++) {
            float delta = buffer[i] - buffer[i + tau];
            sum += delta * delta;
        }
        diff[tau] = sum;
    }
    
    // Paso 2: Diferencia acumulativa normalizada
    float running_sum = 0.0f;
    cumulative[0] = 1.0f;
    
    for (int tau = 1; tau < MAX_LAG && tau < size / 2; tau++) {
        running_sum += diff[tau];
        if (running_sum > 0.0f) {
            cumulative[tau] = diff[tau] * tau / running_sum;
        } else {
            cumulative[tau] = 1.0f;
        }
    }
    
    // Paso 3: Búsqueda del mínimo absoluto
    int tau = -1;
    int min_tau = SAMPLE_RATE / 1000; // Frecuencia máxima ~1000 Hz
    
    for (int i = min_tau; i < MAX_LAG && i < size / 2; i++) {
        if (cumulative[i] < threshold) {
            while (i + 1 < size / 2 && cumulative[i + 1] < cumulative[i]) {
                i++;
            }
            tau = i;
            break;
        }
    }
    
    // Si no se encuentra, buscar mínimo global
    if (tau == -1) {
        float min_val = 1.0f;
        for (int i = min_tau; i < MAX_LAG && i < size / 2; i++) {
            if (cumulative[i] < min_val) {
                min_val = cumulative[i];
                tau = i;
            }
        }
    }
    
    if (tau <= 0 || tau >= size / 2) {
        return result;
    }
    
    // Interpolación parabólica para mayor precisión
    float better_tau = (float)tau;
    if (tau > 0 && tau < size / 2 - 1) {
        float s0 = cumulative[tau - 1];
        float s1 = cumulative[tau];
        float s2 = cumulative[tau + 1];
        float denom = 2.0f * (2.0f * s1 - s2 - s0);
        if (fabsf(denom) > 0.0001f) {
            better_tau = tau + (s2 - s0) / denom;
        }
    }
    
    result.pitch_hz = SAMPLE_RATE / better_tau;
    result.confidence = 1.0f - cumulative[tau];
    
    // Calcular claridad (zero-crossing rate)
    int crossings = 0;
    for (int i = 1; i < size; i++) {
        if ((buffer[i-1] >= 0.0f && buffer[i] < 0.0f) || 
            (buffer[i-1] < 0.0f && buffer[i] >= 0.0f)) {
            crossings++;
        }
    }
    float zcr = (float)crossings / size;
    result.clarity = fmaxf(0.0f, 1.0f - zcr * 10.0f);
    
    return result;
}

// Autocorrelación optimizada
PitchResult detect_pitch_autocorr(float* buffer, int size) {
    PitchResult result = {0.0f, 0.0f, 0.0f};
    
    int max_samples = size / 2;
    float correlations[MAX_LAG];
    
    // Calcular autocorrelación
    for (int lag = 0; lag < max_samples && lag < MAX_LAG; lag++) {
        float sum = 0.0f;
        for (int i = 0; i < max_samples; i++) {
            sum += buffer[i] * buffer[i + lag];
        }
        correlations[lag] = sum;
    }
    
    // Encontrar primer pico después del lag mínimo
    int min_lag = SAMPLE_RATE / 1000;
    int best_lag = -1;
    float best_corr = 0.0f;
    
    for (int lag = min_lag; lag < max_samples && lag < MAX_LAG; lag++) {
        if (correlations[lag] > best_corr &&
            correlations[lag] > correlations[lag - 1] &&
            lag + 1 < max_samples &&
            correlations[lag] > correlations[lag + 1]) {
            best_corr = correlations[lag];
            best_lag = lag;
        }
    }
    
    if (best_lag == -1) {
        return result;
    }
    
    result.pitch_hz = SAMPLE_RATE / (float)best_lag;
    result.confidence = fminf(best_corr / correlations[0], 1.0f);
    
    return result;
}

// Calcular RMS
float calculate_rms(float* buffer, int size) {
    float sum = 0.0f;
    for (int i = 0; i < size; i++) {
        sum += buffer[i] * buffer[i];
    }
    return sqrtf(sum / size);
}

// Funciones exportadas para JavaScript
__attribute__((used))
PitchResult* process_audio_yin(float* buffer, int size, float threshold) {
    static PitchResult result;
    result = detect_pitch_yin(buffer, size, threshold);
    return &result;
}

__attribute__((used))
PitchResult* process_audio_autocorr(float* buffer, int size) {
    static PitchResult result;
    result = detect_pitch_autocorr(buffer, size);
    return &result;
}

__attribute__((used))
float get_rms(float* buffer, int size) {
    return calculate_rms(buffer, size);
}
