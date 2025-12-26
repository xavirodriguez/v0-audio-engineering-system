// components/degradation-indicator.tsx
"use client";

import { usePitchDetectionStore } from "@/lib/store/pitch-detection-store";
import { PitchDetectionStrategy } from "@/lib/audio/degradation-strategy";
import { Wifi, WifiOff, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const strategyConfig = {
  [PitchDetectionStrategy.WASM_ACCELERATED]: {
    label: "WASM",
    Icon: Wifi,
    color: "text-green-500",
    bgColor: "bg-green-100",
  },
  [PitchDetectionStrategy.JS_FALLBACK]: {
    label: "JS",
    Icon: Wifi,
    color: "text-yellow-500",
    bgColor: "bg-yellow-100",
  },
  [PitchDetectionStrategy.DEGRADED_LIGHTWEIGHT]: {
    label: "DEGRADED",
    Icon: AlertTriangle,
    color: "text-orange-500",
    bgColor: "bg-orange-100",
  },
  [PitchDetectionStrategy.MUTED]: {
    label: "MUTED",
    Icon: WifiOff,
    color: "text-red-500",
    bgColor: "bg-red-100",
  },
};

export function DegradationIndicator() {
  const strategy = usePitchDetectionStore((s) => s.strategy);
  const config = strategyConfig[strategy];

  if (!config) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 flex items-center space-x-2 rounded-full px-3 py-1.5 text-xs font-semibold shadow-lg transition-all duration-300 ease-in-out",
        config.bgColor,
        config.color
      )}
    >
      <config.Icon className="h-4 w-4" />
      <span>{config.label}</span>
    </div>
  );
}
