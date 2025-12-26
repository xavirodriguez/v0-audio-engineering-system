/**
 * @fileoverview A container for displaying and managing feedback notifications.
 * It uses AnimatePresence from Framer Motion to handle the lifecycle of
 * notifications, ensuring they animate in and out smoothly.
 */

import { AnimatePresence } from "framer-motion";
import { FeedbackNotification } from "./feedback-notification";
import { FeedbackEventType } from "@/lib/events";

/**
 * Represents the structure of a notification to be displayed.
 */
export interface Notification {
  id: string;
  type: FeedbackEventType;
  message: string;
}

interface FeedbackOverlayProps {
  notifications: Notification[];
  onExit: (id: string) => void;
}

export function FeedbackOverlay({ notifications, onExit }: FeedbackOverlayProps) {
  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <FeedbackNotification
            key={notification.id}
            id={notification.id}
            type={notification.type}
            message={notification.message}
            onExit={onExit}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
