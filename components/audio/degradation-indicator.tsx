"use client";

import { PitchDetectionStrategy } from "@/lib/audio/degradation-strategy";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { usePitchDetectionStore } from "@/lib/store/pitch-detection-store";

/**
 * Componente que visualiza el estado de degradación del sistema de audio.
 */
export function DegradationIndicator() {
  const strategy = usePitchDetectionStore((s) => s.strategy);

  const getStrategyInfo = () => {
    switch (strategy) {
      case PitchDetectionStrategy.WASM_ACCELERATED:
        return {
          label: "Óptimo",
          color: "bg-green-500",
          icon: CheckCircle,
          description: "Detección acelerada por WASM",
        };
      case PitchDetectionStrategy.JS_FALLBACK:
        return {
          label: "Fallback JS",
          color: "bg-yellow-500",
          icon: AlertTriangle,
          description: "Usando implementación JavaScript",
        };
      case PitchDetectionStrategy.DEGRADED_LIGHTWEIGHT:
        return {
          label: "Modo Ligero",
          color: "bg-orange-500",
          icon: AlertCircle,
          description: "Precisión reducida para estabilidad",
        };
      case PitchDetectionStrategy.MUTED:
        return {
          label: "Desactivado",
          color: "bg-red-500",
          icon: XCircle,
          description: "Detección de tono desactivada",
        };
    }
  };

  const info = getStrategyInfo();
  const Icon = info.icon;

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
      <div className={`p-1 rounded-full ${info.color}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex flex-col">
        <Badge variant="outline" className="w-fit text-xs">
          {info.label}
        </Badge>
        <span className="text-xs text-muted-foreground">{info.description}</span>
      </div>
    </div>
  );
}
