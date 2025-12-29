"use client";

import { useFeedbackState } from "@/hooks/logic/use-feedback-state";
import React from "react";

/**
 * A UI component that displays real-time tuning feedback.
 *
 * It consumes the feedback state to show the last recorded cents deviation
 * and whether the pitch is sharp, flat, or in tune.
 * The component also includes a visual flash effect for haptic feedback fallback.
 */
export function TuningFeedbackIndicator() {
  const { state } = useFeedbackState();
  const { lastTuningUpdate } = state;

  if (!lastTuningUpdate) {
    return <div>Waiting for tuning data...</div>;
  }

  const { cents, status } = lastTuningUpdate;
  const color =
    status === "in-tune"
      ? "text-green-500"
      : status === "sharp"
      ? "text-yellow-500"
      : "text-blue-500";

  const statusText = status.charAt(0).toUpperCase() + status.slice(1);
  const centsText = `${cents > 0 ? "+" : ""}${cents.toFixed(1)}¢`;

  return (
    <div className="p-4 bg-gray-800 rounded-lg text-white text-center">
      <h3 className="text-lg font-bold">Tuning Feedback</h3>
      {/* This div is the target for the haptic fallback visual flash */}
      <div className={`tuning-indicator text-3xl font-mono transition-all duration-150 ${color}`}>
        <span>{centsText}</span>
        <span className="ml-4">{statusText}</span>
      </div>
       <style jsx>{`
        .flash-success {
          animation: flash-animation 0.2s ease-out;
        }
        @keyframes flash-animation {
          0% { background-color: rgba(74, 222, 128, 0.5); }
          100% { background-color: transparent; }
        }
      `}</style>
    </div>
  );
}
