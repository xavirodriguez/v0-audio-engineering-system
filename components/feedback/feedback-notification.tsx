/**
 * @fileoverview A single, animated feedback notification component.
 * It uses Framer Motion for enter/exit animations and automatically
 * calls an exit callback after a set duration.
 */

import { motion } from "framer-motion";
import { CheckCircle, Flame, ArrowUp, Zap, XCircle, ChevronUp, ChevronDown } from "lucide-react";
import { FeedbackEventType } from "@/lib/events";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface FeedbackNotificationProps {
  id: string;
  type: FeedbackEventType;
  message: string;
  onExit: (id: string) => void;
}

const NOTIFICATION_DURATION_MS = 3000;

// Configuration for styling and icons based on event type
const eventConfig = {
  [FeedbackEventType.PITCH_ACCURATE]: {
    icon: <CheckCircle className="h-6 w-6 text-green-500" />,
    style: "bg-green-500/10 border-green-500/20 text-green-200",
  },
  [FeedbackEventType.PITCH_SHARP]: {
    icon: <ChevronUp className="h-6 w-6 text-yellow-500" />,
    style: "bg-yellow-500/10 border-yellow-500/20 text-yellow-200",
  },
  [FeedbackEventType.PITCH_FLAT]: {
    icon: <ChevronDown className="h-6 w-6 text-yellow-500" />,
    style: "bg-yellow-500/10 border-yellow-500/20 text-yellow-200",
  },
  [FeedbackEventType.STREAK_MILESTONE]: {
    icon: <Flame className="h-6 w-6 text-orange-500" />,
    style: "bg-orange-500/10 border-orange-500/20 text-orange-200 font-bold",
  },
  [FeedbackEventType.STREAK_BROKEN]: {
    icon: <XCircle className="h-6 w-6 text-red-500" />,
    style: "bg-red-500/10 border-red-500/20 text-red-200",
  },
  [FeedbackEventType.IMPROVEMENT_DETECTED]: {
    icon: <ArrowUp className="h-6 w-6 text-blue-500" />,
    style: "bg-blue-500/10 border-blue-500/20 text-blue-200",
  },
  // AÑADIR NUEVO: Nota completada correctamente
  [FeedbackEventType.NOTE_COMPLETED]: {
    icon: <CheckCircle className="h-8 w-8 text-emerald-500" />,
    style: "bg-emerald-500/20 border-emerald-500/30 text-emerald-100 font-bold text-xl shadow-2xl",
  },
};

const defaultConfig = {
    icon: <Zap className="h-6 w-6 text-gray-500" />,
    style: "bg-gray-500/10 border-gray-500/20 text-gray-200",
};

export function FeedbackNotification({ id, type, message, onExit }: FeedbackNotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onExit(id);
    }, NOTIFICATION_DURATION_MS);

    return () => clearTimeout(timer);
  }, [id, onExit]);

  const config = eventConfig[type] || defaultConfig;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.5 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.8, transition: { duration: 0.2 } }}
      className={cn(
        "flex items-center gap-4 p-3 rounded-lg border shadow-lg backdrop-blur-sm",
        config.style
      )}
    >
      {config.icon}
      <p className="text-lg">{message}</p>
    </motion.div>
  );
}
