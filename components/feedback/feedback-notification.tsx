"use client"

import React from 'react';
import { Check, Sparkles, Flame } from 'lucide-react';

interface FeedbackNotificationProps {
  type: 'accuracy' | 'improvement' | 'streak';
  message: string;
}

const notificationConfig = {
  accuracy: {
    icon: <Check className="w-5 h-5" />,
    style: 'bg-green-500/10 text-green-600 border-green-500/20',
  },
  improvement: {
    icon: <Sparkles className="w-5 h-5" />,
    style: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  },
  streak: {
    icon: <Flame className="w-5 h-5" />,
    style: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  },
};

export function FeedbackNotification({ type, message }: FeedbackNotificationProps) {
  const { icon, style } = notificationConfig[type];

  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-full border shadow-lg backdrop-blur-sm ${style}`}>
      {icon}
      <span className="font-medium text-sm">{message}</span>
    </div>
  );
}
