"use client";

import { useFeedbackState } from "@/hooks/logic/use-feedback-state";
import React from "react";

/**
 * A UI component that displays the user's progress through a practice session.
 *
 * It shows a progress bar and a textual representation of completed notes
 * versus the total number of notes in the session (e.g., "5 / 10").
 */
export function ProgressFeedback() {
  const { state } = useFeedbackState();
  const { completed, total } = state.progress;

  if (total === 0) {
    return <div>No progress data available.</div>;
  }

  const progressPercentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="p-4 bg-gray-800 rounded-lg text-white">
      <h3 className="text-lg font-bold mb-2">Session Progress</h3>
      <div className="flex items-center">
        <div className="w-full bg-gray-700 rounded-full h-4 mr-4">
          <div
            className="bg-green-500 h-4 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="text-xl font-mono">
          <span>{completed}</span>
          <span className="mx-1">/</span>
          <span>{total}</span>
        </div>
      </div>
    </div>
  );
}
