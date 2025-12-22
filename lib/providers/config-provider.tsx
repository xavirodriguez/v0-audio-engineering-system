import { createContext, useContext, ReactNode } from "react"
import type { PitchDetectionConfig } from "@/lib/config/pitch-detection.config"
import { DEFAULT_PITCH_DETECTION_CONFIG } from "@/lib/config/pitch-detection.config"

interface AppConfig {
  pitchDetection: PitchDetectionConfig
}

const ConfigContext = createContext<AppConfig>({
  pitchDetection: DEFAULT_PITCH_DETECTION_CONFIG,
})

export function ConfigProvider({
  children,
  config,
}: {
  children: ReactNode
  config?: Partial<AppConfig>
}) {
  const mergedConfig: AppConfig = {
    pitchDetection: {
      ...DEFAULT_PITCH_DETECTION_CONFIG,
      ...config?.pitchDetection,
    },
  }

  return (
    <ConfigContext.Provider value={mergedConfig}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig() {
  return useContext(ConfigContext)
}

export function usePitchDetectionConfig() {
  const config = useConfig()
  return config.pitchDetection
}
