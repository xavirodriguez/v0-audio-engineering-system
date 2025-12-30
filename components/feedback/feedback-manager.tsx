"use client"

import { useEffect, useState } from "react"
import { PerformanceFeedback, LearningSignal } from "@/lib/domains"
import { useToast } from "@/components/ui/use-toast"
import { FeedbackOverlay } from "./feedback-overlay"

interface FeedbackManagerProps {
  feedback: PerformanceFeedback;
}

export function FeedbackManager({ feedback }: FeedbackManagerProps) {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<LearningSignal[]>([]);

  useEffect(() => {
    const newSignals = feedback.getNotificationSignals();

    newSignals.forEach(signal => {
      setNotifications(prev => [...prev, signal]);

      if (signal.severity === 'SUCCESS') {
        toast({
          title: "Success",
          description: signal.message,
        });
      } else if (signal.severity === 'WARNING') {
        toast({
          title: "Warning",
          description: signal.message,
          variant: "destructive",
        });
      }

      if (signal.type === 'PITCH_ACCURATE') {
        navigator.vibrate?.(100);
      }
    });
  }, [feedback, toast]);

  return (
    <FeedbackOverlay
      notifications={notifications}
      onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
    />
  );
}
