/**
 * @fileoverview A custom hook to manage the state of feedback notifications.
 * It subscribes to the global feedback event bus and provides a list of
 * active notifications to be displayed by the UI.
 */

import { useState, useEffect, useCallback } from "react";
import { feedbackBus, FeedbackEventPayload, FeedbackEventType } from "@/lib/events";
import { Notification } from "@/components/feedback/feedback-overlay";
import { v4 as uuidv4 } from "uuid";

/**
 * A hook that manages the state for feedback notifications.
 * It listens for events on the feedback bus and updates a list of notifications.
 * @returns {{ notifications: Notification[] }} The current list of notifications.
 */
export function useFeedbackNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const handleEvent = (payload: FeedbackEventPayload) => {
      // Ignore certain events that shouldn't produce notifications
      if (payload.type === FeedbackEventType.SESSION_STARTED || payload.type === FeedbackEventType.SESSION_ENDED || payload.type === FeedbackEventType.STREAK_INCREMENTED) {
        return;
      }

      const newNotification: Notification = {
        id: uuidv4(),
        type: payload.type,
        message: payload.message,
      };

      setNotifications((prevNotifications) => {
        // Limit the number of notifications on screen to 3
        const limitedNotifications = prevNotifications.slice(-2);
        return [...limitedNotifications, newNotification];
      });
    };

    // Subscribe to all relevant event types individually
    const eventTypes = Object.values(FeedbackEventType);

    const subscriptions = eventTypes.map(eventType => {
      const listener = (payload: FeedbackEventPayload<any>) => handleEvent(payload);
      return feedbackBus.subscribe(eventType, listener);
    });

    // Return a cleanup function that unsubscribes from all events
    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  }, []);

  const onExit = useCallback((id: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((n) => n.id !== id)
    );
  }, []);

  return { notifications, onExit };
}
