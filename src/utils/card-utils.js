// src/utils/card-utils.js
// Utilities for card detection and processing

import logger from "./unified-logger.js";

/**
 * Parse the response to extract any card indicators
 * @param {string} responseText - The raw response text from AI
 * @param {string} query - The original user query
 * @returns {Object} - Object with clean content and detected card type
 */
export function detectCardType(responseText, query = "") {
  // Parse the response to extract any card indicators
  let content = responseText;
  let cardType = null;

  logger.debug("Checking response for card indicators", {
    hasPlantCards: responseText.includes("SHOWING_PLANT_CARDS"),
    hasTaskCards: responseText.includes("SHOWING_TASK_CARDS"),
    hasSustainabilityCards: responseText.includes(
      "SHOWING_SUSTAINABILITY_CARDS"
    ),
    responseLength: responseText.length,
  });

  if (responseText.includes("SHOWING_PLANT_CARDS")) {
    content = responseText.replace("SHOWING_PLANT_CARDS", "").trim();
    cardType = "plant";
    logger.info("Plant cards detected in response");
    console.log("Set cardType to 'plant' from explicit marker");
  } else if (responseText.includes("SHOWING_TASK_CARDS")) {
    content = responseText.replace("SHOWING_TASK_CARDS", "").trim();
    cardType = "task";
    logger.info("Task cards detected in response");
    console.log("Set cardType to 'task' from explicit marker");
  } else if (responseText.includes("SHOWING_SUSTAINABILITY_CARDS")) {
    content = responseText.replace("SHOWING_SUSTAINABILITY_CARDS", "").trim();
    cardType = "sustainability";
    logger.info("Sustainability cards detected in response");
    console.log("Set cardType to 'sustainability' from explicit marker");
  } else {
    // Smart detection of content type without explicit markers
    const lowercaseContent = responseText.toLowerCase();
    const lowercaseQuery = query.toLowerCase();

    // Check for sustainability-related content patterns
    if (
      (lowercaseQuery.includes("carbon") ||
        lowercaseQuery.includes("footprint") ||
        lowercaseQuery.includes("sustainability") ||
        lowercaseQuery.includes("sustainable") ||
        lowercaseQuery.includes("eco-friendly") ||
        lowercaseQuery.includes("environment") ||
        lowercaseQuery.includes("sdg")) &&
      (lowercaseContent.includes("carbon") ||
        lowercaseContent.includes("footprint") ||
        lowercaseContent.includes("emissions") ||
        lowercaseContent.includes("sustainable") ||
        lowercaseContent.includes("environmental impact"))
    ) {
      cardType = "sustainability";
      logger.info("Sustainability cards inferred from content analysis");
      console.log("Set cardType to 'sustainability' based on content analysis");
    }
    // Check for plant-related content patterns
    else if (
      (lowercaseContent.includes("plant") ||
        lowercaseContent.includes("flower") ||
        lowercaseContent.includes("shrub") ||
        lowercaseContent.includes("tree")) &&
      (lowercaseContent.includes("recommend") ||
        lowercaseContent.includes("suggestion") ||
        responseText.match(/\*\s+[A-Z][a-z]+\s+[a-z]+:/) || // Pattern like "* Plant name:"
        responseText.match(/\*\s+\*[A-Z][a-z]+\s+[a-z]+\*/)) // Pattern like "* *Plant name*"
    ) {
      cardType = "plant";
      logger.info("Plant cards inferred from content analysis");
      console.log("Set cardType to 'plant' based on content analysis");
    }
    // Check for task-related content patterns
    else if (
      (lowercaseContent.includes("task") ||
        lowercaseContent.includes("jobs") ||
        lowercaseContent.includes("chore") ||
        lowercaseContent.includes("to do") ||
        lowercaseContent.includes("todo")) &&
      (lowercaseContent.includes("garden") ||
        lowercaseContent.includes("planting") ||
        lowercaseContent.includes("maintenance"))
    ) {
      cardType = "task";
      logger.info("Task cards inferred from content analysis");
      console.log("Set cardType to 'task' based on content analysis");
    } else {
      logger.info("No card indicators found in response");
      console.log("No card indicators found in response");
    }
  }

  return {
    content,
    cardType,
  };
}

export default {
  detectCardType,
};