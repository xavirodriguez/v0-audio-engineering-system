"use client"

import React from 'react';
import { FeedbackNotification } from './feedback-notification';

interface FeedbackOverlayProps {
  // In the future, this will be driven by the event bus
  notifications: Array<{
    id: string;
    type: 'accuracy' | 'improvement' | 'streak';
    message: string;
  }>;
}

export function FeedbackOverlay({ notifications }: FeedbackOverlayProps) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md mx-auto">
      <div className="flex flex-col items-center gap-2">
        {notifications.map((notification) => (
          <FeedbackNotification
            key={notification.id}
            type={notification.type}
            message={notification.message}
          />
        ))}
      </div>
    </div>
  );
}
