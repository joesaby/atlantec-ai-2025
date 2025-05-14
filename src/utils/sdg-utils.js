/**
 * Utility functions for SDG impact analysis and visualization
 */
import { sdgGoals } from "../data/sustainability-metrics";

/**
 * Get the top SDGs by impact score
 * @param {Object} sdgScores - Object with SDG scores
 * @param {number} limit - Maximum number of SDGs to return
 * @returns {Array} Array of SDG keys sorted by score
 */
export const getTopSDGs = (sdgScores, limit = 5) => {
  return Object.entries(sdgScores || {})
    .filter(([_, score]) => score > 0)
    .sort(([_, scoreA], [__, scoreB]) => scoreB - scoreA)
    .slice(0, limit)
    .map(([key]) => key);
};

/**
 * Calculate overall SDG impact percentage from scores
 * @param {Object} sdgScores - Object with SDG scores
 * @returns {number} Overall impact percentage (0-100)
 */
export const calculateOverallSDGImpact = (sdgScores) => {
  // Maximum possible score per SDG based on our implementation
  const maxPerSDG = 100;
  const totalSDGs = Object.keys(sdgScores || {}).length;

  if (!totalSDGs) return 0;

  const totalScore = Object.values(sdgScores || {}).reduce(
    (sum, score) => sum + score,
    0
  );
  const maxScore = maxPerSDG * totalSDGs;

  const impact = Math.min(100, Math.round((totalScore / maxScore) * 100));
  return impact;
};

/**
 * Get relevant SDG categories for filtering and organization
 * @returns {Object} Categorized SDGs
 */
export const getSDGCategories = () => {
  return {
    environment: ["sdg6", "sdg13", "sdg14", "sdg15"],
    wellbeing: ["sdg2", "sdg3", "sdg4", "sdg11"],
    economy: ["sdg7", "sdg8", "sdg9", "sdg12"],
  };
};

/**
 * Groups SDGs into categories with their scores
 * @param {Object} sdgScores - SDG scores object
 * @returns {Object} Categorized SDG scores
 */
export const categorizeSDGScores = (sdgScores) => {
  const categories = getSDGCategories();
  const result = {};

  Object.entries(categories).forEach(([category, sdgKeys]) => {
    result[category] = sdgKeys
      .filter((sdgKey) => (sdgScores?.[sdgKey] || 0) > 0)
      .map((sdgKey) => ({
        key: sdgKey,
        score: sdgScores?.[sdgKey] || 0,
        ...sdgGoals[sdgKey],
      }))
      .sort((a, b) => b.score - a.score);
  });

  return result;
};

/**
 * Get relevant practices for a specific SDG
 * @param {string} sdgKey - The SDG key (e.g., "sdg12")
 * @param {Object} allPractices - All sustainable practices
 * @returns {Array} Practices related to the SDG
 */
export const getPracticesForSDG = (sdgKey, allPractices) => {
  return allPractices.filter(
    (practice) => practice.sdgs && practice.sdgs.includes(sdgKey)
  );
};

/**
 * Format SDG data for radar chart
 * @param {Object} sdgScores - SDG scores object
 * @returns {Object} Formatted data for radar chart
 */
export const formatSDGRadarData = (sdgScores) => {
  // Get active SDGs (with scores > 0)
  const activeSDGs = Object.entries(sdgScores || {})
    .filter(([_, score]) => score > 0)
    .map(([key]) => key);

  // Fall back to default set if no active SDGs
  const sdgsToUse =
    activeSDGs.length > 0
      ? activeSDGs
      : ["sdg2", "sdg3", "sdg6", "sdg12", "sdg13", "sdg15"];

  // Get labels and normalize data (0-5 scale for radar chart)
  const labels = sdgsToUse.map((sdgKey) => {
    const sdg = sdgGoals[sdgKey];
    return sdg ? sdg.name : sdgKey;
  });

  const data = sdgsToUse.map((sdgKey) => {
    const value = sdgScores?.[sdgKey] || 0;
    return (Math.min(100, value) / 100) * 5; // Scale to 0-5 for radar
  });

  return {
    labels,
    sdgKeys: sdgsToUse,
    data,
  };
};

/**
 * Get SDG impact level description based on score
 * @param {number} score - SDG impact score
 * @returns {Object} Impact level info
 */
export const getSDGImpactLevel = (score) => {
  if (score >= 75) return { level: "Transformative", class: "text-success" };
  if (score >= 50) return { level: "Significant", class: "text-info" };
  if (score >= 25) return { level: "Moderate", class: "text-warning" };
  if (score > 0) return { level: "Initial", class: "text-warning" };
  return { level: "Not Started", class: "text-base-content opacity-50" };
};
