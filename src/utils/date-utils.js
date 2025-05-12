/**
 * Utility functions for working with dates, months, and seasons
 */

/**
 * Get the name of a month based on its number
 * @param {number} monthNum - Month number (1-12)
 * @returns {string} The month name
 */
export function getMonthName(monthNum) {
  const date = new Date(2025, monthNum - 1, 1);
  return date.toLocaleString("default", { month: "long" });
}

/**
 * Determine the current season based on the month
 * @param {number} [month] - Month number (1-12), defaults to the current month
 * @returns {string} The season name: "spring", "summer", "autumn", or "winter"
 */
export function getCurrentSeason(month = null) {
  const currentMonth = month || new Date().getMonth() + 1; // 1-indexed (1 = January, 12 = December)

  if (currentMonth >= 3 && currentMonth <= 5) return "spring";
  if (currentMonth >= 6 && currentMonth <= 8) return "summer";
  if (currentMonth >= 9 && currentMonth <= 11) return "autumn";
  return "winter";
}

/**
 * Format a date into a time string (hours:minutes)
 * @param {Date} date - The date to format
 * @returns {string} Formatted time string (HH:MM)
 */
export function formatTimeString(date) {
  const d = new Date(date);
  // Use UTC methods to ensure consistent time formatting between server and client
  const hours = d.getUTCHours().toString().padStart(2, "0");
  const minutes = d.getUTCMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Extract month and season information from a user query
 * @param {string} query - The user query to analyze
 * @returns {Object} Month info with season, month number, etc.
 */
export function extractMonthInfoFromQuery(query) {
  const monthInfo = {};
  const lowercaseQuery = query.toLowerCase();

  // Check for seasons mentioned
  if (lowercaseQuery.includes("spring")) {
    monthInfo.season = "spring";
  } else if (lowercaseQuery.includes("summer")) {
    monthInfo.season = "summer";
  } else if (
    lowercaseQuery.includes("autumn") ||
    lowercaseQuery.includes("fall")
  ) {
    monthInfo.season = "autumn";
  } else if (lowercaseQuery.includes("winter")) {
    monthInfo.season = "winter";
  }

  // Check for specific months mentioned
  const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];

  // Find any month mentioned in the query
  const mentionedMonth = months.find((month) => lowercaseQuery.includes(month));
  if (mentionedMonth) {
    // Convert month name to number (1-12)
    monthInfo.month = months.indexOf(mentionedMonth) + 1;

    // If a specific month is mentioned (without season), we only want to show that month
    if (!monthInfo.season) {
      monthInfo.isSingleMonth = true;
      monthInfo.months = 1;
    }
  }

  // Check for number of months specification
  const monthsMatch = lowercaseQuery.match(/next\s+(\d+)\s+months/);
  if (monthsMatch && monthsMatch[1]) {
    monthInfo.months = parseInt(monthsMatch[1], 10);
  }

  return monthInfo;
}

/**
 * Get the current month (1-12)
 * @returns {number} Current month number (1-12)
 */
export function getCurrentMonth() {
  return new Date().getMonth() + 1; // Convert from 0-indexed to 1-indexed
}

/**
 * Get months in a season
 * @param {string} season - The season name ("spring", "summer", "autumn", "winter")
 * @returns {number[]} Array of month numbers in the season
 */
export function getMonthsInSeason(season) {
  switch (season.toLowerCase()) {
    case "spring":
      return [3, 4, 5];
    case "summer":
      return [6, 7, 8];
    case "autumn":
    case "fall":
      return [9, 10, 11];
    case "winter":
      return [12, 1, 2];
    default:
      return [];
  }
}
