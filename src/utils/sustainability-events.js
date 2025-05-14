/**
 * Utility to handle sustainability-related events
 * This allows components to subscribe to changes in sustainability data
 */

/**
 * Emit an event when a sustainable practice is added
 * @param {string} practiceId - The ID of the practice that was added
 */
export const emitPracticeAdded = (practiceId) => {
  if (typeof window !== "undefined") {
    const event = new CustomEvent("sustainability-practice-added", {
      detail: { practiceId },
    });
    window.dispatchEvent(event);
  }
};

/**
 * Emit an event when a sustainable practice is removed
 * @param {string} practiceId - The ID of the practice that was removed
 */
export const emitPracticeRemoved = (practiceId) => {
  if (typeof window !== "undefined") {
    const event = new CustomEvent("sustainability-practice-removed", {
      detail: { practiceId },
    });
    window.dispatchEvent(event);
  }
};

/**
 * Emit an event when any sustainability data changes
 * @param {string} changeType - The type of change that occurred
 * @param {Object} data - Additional data about the change
 */
export const emitDataChanged = (changeType = "general", data = {}) => {
  if (typeof window !== "undefined") {
    const event = new CustomEvent("sustainability-data-changed", {
      detail: { changeType, ...data },
    });
    window.dispatchEvent(event);
  }
};

/**
 * Register a handler for a sustainability event
 * @param {string} eventName - Name of the event to listen for
 * @param {Function} handler - Function to handle the event
 * @returns {Function} - Function to remove the event listener
 */
export const onSustainabilityEvent = (eventName, handler) => {
  if (typeof window !== "undefined") {
    window.addEventListener(eventName, handler);
    return () => window.removeEventListener(eventName, handler);
  }
  return () => {};
};
