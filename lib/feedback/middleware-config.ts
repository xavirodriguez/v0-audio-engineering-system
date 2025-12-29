/**
 * Defines the shape of the configuration for all feedback middlewares.
 */
export interface MiddlewareConfig {
  toast: {
    enabled: boolean;
    minAccuracyForSuccess: number;
    duration: number;
  };
  analytics: {
    enabled: boolean;
    sampleRate: number; // 0.0 to 1.0
  };
  haptic: {
    enabled: boolean;
    intensity: "light" | "medium" | "heavy";
    tuningThreshold: number; // in cents
  };
  audioCue: {
    enabled: boolean;
    successSound: string;
    errorSound: string;
    volume: number; // 0.0 to 1.0
  };
}

/**
 * The default configuration for the feedback system's middlewares.
 * This provides a static, developer-defined starting point.
 * In the future, this could be overridden by user preferences.
 */
export const DEFAULT_MIDDLEWARE_CONFIG: MiddlewareConfig = {
  toast: {
    enabled: true,
    minAccuracyForSuccess: 90,
    duration: 3000,
  },
  analytics: {
    enabled: true,
    sampleRate: 1.0, // Track every event
  },
  haptic: {
    enabled: true,
    intensity: "light",
    tuningThreshold: 2, // Vibrate when within ±2 cents
  },
  audioCue: {
    enabled: false, // Disabled by default as it can be intrusive
    successSound: "/sounds/success.mp3", // Placeholder path
    errorSound: "/sounds/error.mp3",     // Placeholder path
    volume: 0.5,
  },
};
