/**
 * @fileoverview Implements a singleton event bus for handling real-time gamification feedback.
 * This decoupled system allows different parts of the application to communicate without
 * direct dependencies, making the architecture cleaner and more scalable.
 */

import {
  FeedbackEventType,
  FeedbackEventListener,
  FeedbackEventPayload,
  FeedbackEventPayloadMap,
} from "./types";

/**
 * A type-safe singleton event bus for handling feedback events.
 */
class FeedbackEventBus {
  private static instance: FeedbackEventBus;
  private listeners: {
    [E in FeedbackEventType]?: FeedbackEventListener<E>[];
  } = {};
  private eventHistory: FeedbackEventPayload[] = [];
  private readonly MAX_HISTORY_LENGTH = 100;

  /**
   * Private constructor to enforce the singleton pattern.
   */
  private constructor() {}

  /**
   * Gets the singleton instance of the FeedbackEventBus.
   * @returns {FeedbackEventBus} The singleton instance.
   */
  public static getInstance(): FeedbackEventBus {
    if (!FeedbackEventBus.instance) {
      FeedbackEventBus.instance = new FeedbackEventBus();
    }
    return FeedbackEventBus.instance;
  }

  /**
   * Subscribes a listener to a specific event type.
   * @template E - The type of the event to subscribe to.
   * @param {E} eventType - The event type.
   * @param {FeedbackEventListener<E>} listener - The function to call when the event is emitted.
   * @returns {{ unsubscribe: () => void }} An object with an unsubscribe method.
   */
  public subscribe<E extends FeedbackEventType>(
    eventType: E,
    listener: FeedbackEventListener<E>
  ): { unsubscribe: () => void } {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType]?.push(listener as any);

    return {
      unsubscribe: () => this.unsubscribe(eventType, listener),
    };
  }

  /**
   * Unsubscribes a listener from a specific event type.
   * @template E - The type of the event to unsubscribe from.
   * @param {E} eventType - The event type.
   * @param {FeedbackEventListener<E>} listener - The listener function to remove.
   */
  public unsubscribe<E extends FeedbackEventType>(
    eventType: E,
    listener: FeedbackEventListener<E>
  ): void {
    const eventListeners = this.listeners[eventType];
    if (eventListeners) {
      this.listeners[eventType] = eventListeners.filter(
        (l) => l !== listener
      ) as any;
    }
  }

  /**
   * Emits an event to all subscribed listeners.
   * @template E - The type of the event to emit.
   * @param {E} eventType - The event type.
   * @param {FeedbackEventPayloadMap[E]} value - The payload value for the event.
   * @param {string} message - A descriptive message for the event.
   */
  public emit<E extends FeedbackEventType>(
    eventType: E,
    value: FeedbackEventPayloadMap[E],
    message: string
  ): void {
    const payload: FeedbackEventPayload<FeedbackEventPayloadMap[E]> = {
      type: eventType,
      value,
      timestamp: Date.now(),
      message,
    };

    this.addToHistory(payload);

    const eventListeners = this.listeners[eventType];
    if (eventListeners) {
      eventListeners.forEach((listener: FeedbackEventListener<E>) => {
        try {
          listener(payload)
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error)
        }
      })
    }
  }

  /**
   * Adds an event to the history, trimming the history if it exceeds the max length.
   * @param {FeedbackEventPayload} payload - The event payload to add.
   */
  private addToHistory(payload: FeedbackEventPayload): void {
    this.eventHistory.push(payload);
    if (this.eventHistory.length > this.MAX_HISTORY_LENGTH) {
      this.eventHistory.shift(); // Remove the oldest event
    }
  }

  /**
   * Retrieves the recent history of emitted events.
   * @returns {FeedbackEventPayload<unknown>[]} An array of the most recent event payloads.
   */
  public getHistory(): FeedbackEventPayload<unknown>[] {
    return [...this.eventHistory]
  }

  /**
   * Clears the event history.
   */
  public clearHistory(): void {
    this.eventHistory = [];
  }
}

/**
 * The singleton instance of the FeedbackEventBus.
 * Use this instance throughout the application to ensure a single event channel.
 */
export const feedbackBus = FeedbackEventBus.getInstance();
