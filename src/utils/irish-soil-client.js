// irish-soil-client.js
// A client utility for accessing and working with Irish soil data
// for gardening recommendations.

import {
  IRISH_SOIL_TYPES,
  COUNTY_SOIL_MAPPING,
  SOIL_RECOMMENDATIONS,
  DRAINAGE_CLASSIFICATIONS,
  LOCATION_TO_TEAGASC_MAPPING,
} from "../data/irish-soil-data.js";
import logger from "./unified-logger.js";

// Cache soil data to improve performance
const soilDataCache = new Map();

/**
 * Get soil information for a specific Irish county
 * @param {string} county - County name (case insensitive)
 * @returns {Object} Detailed soil information
 */
export function getSoilDataForCounty(county) {
  try {
    // Normalize county name for lookup
    const normalizedCounty = county.toLowerCase().trim().replace(/\s+/g, "");

    // Check cache first
    const cacheKey = `county_${normalizedCounty}`;
    if (soilDataCache.has(cacheKey)) {
      return soilDataCache.get(cacheKey);
    }

    // Get soil type for this county
    const soilType =
      COUNTY_SOIL_MAPPING[normalizedCounty] || COUNTY_SOIL_MAPPING.default;

    // Get detailed info for this soil type
    const soilTypeInfo =
      IRISH_SOIL_TYPES[soilType] || IRISH_SOIL_TYPES["brown-earth"];

    // Get county-specific details from the mapping
    const countyDetails =
      LOCATION_TO_TEAGASC_MAPPING[normalizedCounty] ||
      LOCATION_TO_TEAGASC_MAPPING.default;

    // Get recommendations for this soil type
    const recommendations =
      SOIL_RECOMMENDATIONS[soilType] || SOIL_RECOMMENDATIONS.default;

    // Compile the soil data
    const soilData = {
      county: countyDetails.displayName,
      soilType: soilType,
      soilName: soilTypeInfo.name,
      description: soilTypeInfo.description,
      properties: {
        ph: soilTypeInfo.ph,
        texture: soilTypeInfo.texture,
        nutrients: soilTypeInfo.nutrients,
        drainage: soilTypeInfo.drainage,
      },
      associationUnit: countyDetails.associationUnit,
      associationName: countyDetails.associationName,
      recommendations: recommendations,
      gardeningNotes: soilTypeInfo.gardeningNotes,
      suitablePlants: soilTypeInfo.suitablePlants,
      challenges: soilTypeInfo.challenges,
      bestPractices: soilTypeInfo.bestPractices,
    };

    // Cache the result
    soilDataCache.set(cacheKey, soilData);
    return soilData;
  } catch (error) {
    logger.error("Error retrieving soil data:", {
      county: county,
      error: error.message,
      component: "IrishSoilClient",
    });

    // Return a default value on error
    return {
      county: county || "Unknown",
      soilType: "unknown",
      soilName: "Unknown Soil Type",
      description: "Soil information could not be determined",
      properties: {
        ph: { min: 5.0, max: 7.0 },
        texture: "Variable",
        nutrients: "Unknown",
        drainage: "Unknown",
      },
      recommendations: SOIL_RECOMMENDATIONS.default,
    };
  }
}

/**
 * Get soil type information for a specified Irish county
 * @param {string} county - County name (lowercase)
 * @returns {Object} Soil type information for the county
 */
export function getSoilTypeForCounty(county) {
  // Normalize county name to lowercase and remove spaces
  const normalizedCounty = county
    ? county.toLowerCase().replace(/\s+/g, "")
    : "";

  // Get the soil type for this county
  const soilType =
    COUNTY_SOIL_MAPPING[normalizedCounty] || COUNTY_SOIL_MAPPING.default;

  // Return the detailed soil type information
  return {
    ...IRISH_SOIL_TYPES[soilType],
    soilTypeKey: soilType,
    county: normalizedCounty,
    countyDisplayName:
      LOCATION_TO_TEAGASC_MAPPING[normalizedCounty]?.displayName || "Unknown",
  };
}

/**
 * Get recommendations for gardening based on soil type
 * @param {string} soilType - Type of soil (key from IRISH_SOIL_TYPES)
 * @returns {Array} Array of recommendations for this soil type
 */
export function getSoilRecommendations(soilType) {
  return SOIL_RECOMMENDATIONS[soilType] || SOIL_RECOMMENDATIONS.default;
}

/**
 * Get detailed drainage information for a county
 * @param {string} county - County name (lowercase)
 * @returns {Object} Detailed drainage information
 */
export function getDrainageInfoForCounty(county) {
  // Normalize county name
  const normalizedCounty = county
    ? county.toLowerCase().replace(/\s+/g, "")
    : "";

  // Get the detailed county mapping which includes drainage information
  const countyData =
    LOCATION_TO_TEAGASC_MAPPING[normalizedCounty] ||
    LOCATION_TO_TEAGASC_MAPPING.default;

  // Return the enhanced drainage information
  return countyData.drainageInfo || DRAINAGE_CLASSIFICATIONS["Moderate"];
}

/**
 * Get all Irish soil drainage classifications
 * @returns {Object} All drainage classifications with details
 */
export function getAllDrainageClassifications() {
  return DRAINAGE_CLASSIFICATIONS;
}

/**
 * Get soil management recommendations based on drainage class
 * @param {string} drainageClass - Drainage class name (e.g. "Poor", "Well")
 * @returns {Array} Array of drainage management recommendations
 */
export function getDrainageManagementTips(drainageClass) {
  // Find the drainage classification or default to Moderate
  const drainageInfo =
    DRAINAGE_CLASSIFICATIONS[drainageClass] ||
    DRAINAGE_CLASSIFICATIONS["Moderate"];

  // Return management recommendations
  return drainageInfo.management || [];
}

/**
 * Get all Irish counties with soil information
 * @returns {Array} Array of county names with display names
 */
export function getAllIrishCounties() {
  return Object.entries(LOCATION_TO_TEAGASC_MAPPING)
    .filter(([key]) => key !== "default")
    .map(([key, data]) => ({
      id: key,
      name: data.displayName || key,
      soilType: COUNTY_SOIL_MAPPING[key] || "unknown",
      drainageClass: data.drainageClass || "Moderate",
    }));
}

/**
 * Get detailed Teagasc soil mapping data for a county
 * @param {string} county - County name (lowercase)
 * @returns {Object} Teagasc soil mapping data for the county
 */
export function getTeagascMappingForCounty(county) {
  // Normalize county name
  const normalizedCounty = county
    ? county.toLowerCase().replace(/\s+/g, "")
    : "";

  // Return the detailed Teagasc mapping data for this county
  return (
    LOCATION_TO_TEAGASC_MAPPING[normalizedCounty] ||
    LOCATION_TO_TEAGASC_MAPPING.default
  );
}

/**
 * Get information for a specific soil type
 * @param {string} soilType - Soil type code
 * @returns {Object|null} Soil type information or null if not found
 */
export function getSoilTypeInfo(soilType) {
  return IRISH_SOIL_TYPES[soilType] || null;
}

/**
 * Get all available soil types
 * @returns {Object} Map of all soil types
 */
export function getAllSoilTypes() {
  return IRISH_SOIL_TYPES;
}

/**
 * Get soil recommendations for a particular soil type
 * @param {string} soilType - Soil type code
 * @returns {Array} List of recommendations
 */
export function getRecommendationsForSoilType(soilType) {
  return SOIL_RECOMMENDATIONS[soilType] || SOIL_RECOMMENDATIONS.default;
}

/**
 * Get plants that are suitable for a particular soil type
 * @param {string} soilType - Soil type code
 * @returns {Array} List of suitable plants
 */
export function getSuitablePlantsForSoilType(soilType) {
  const soilTypeInfo = IRISH_SOIL_TYPES[soilType];
  return soilTypeInfo?.suitablePlants || [];
}

/**
 * Get best practices for gardening in a particular soil type
 * @param {string} soilType - Soil type code
 * @returns {Array} List of best practices
 */
export function getBestPracticesForSoilType(soilType) {
  const soilTypeInfo = IRISH_SOIL_TYPES[soilType];
  return soilTypeInfo?.bestPractices || [];
}

/**
 * Get challenges associated with a particular soil type
 * @param {string} soilType - Soil type code
 * @returns {Array} List of challenges
 */
export function getChallengesForSoilType(soilType) {
  const soilTypeInfo = IRISH_SOIL_TYPES[soilType];
  return soilTypeInfo?.challenges || [];
}

/**
 * Find counties that have a specific soil type
 * @param {string} soilType - Soil type code
 * @returns {Array} List of county names with this soil type
 */
export function getCountiesWithSoilType(soilType) {
  return Object.entries(COUNTY_SOIL_MAPPING)
    .filter(([county, type]) => type === soilType && county !== "default")
    .map(([county]) => {
      const details = LOCATION_TO_TEAGASC_MAPPING[county];
      return details ? details.displayName : county;
    });
}

/**
 * Get a summary of soil characteristics for a county
 * @param {string} county - County name
 * @returns {Object} Summarized soil information
 */
export function getSoilSummary(county) {
  const fullData = getSoilDataForCounty(county);

  // Return a simplified summary
  return {
    county: fullData.county,
    soilType: fullData.soilType,
    soilName: fullData.soilName,
    phRange: `${fullData.properties.ph.min} - ${fullData.properties.ph.max}`,
    texture: fullData.properties.texture,
    drainage: fullData.properties.drainage,
    keyRecommendation: fullData.recommendations[0],
    suitablePlants: fullData.suitablePlants
      ? fullData.suitablePlants.slice(0, 3)
      : [],
  };
}

// Clear the soil data cache (useful for testing)
export function clearCache() {
  soilDataCache.clear();
}

export default {
  getSoilDataForCounty,
  getSoilTypeForCounty,
  getSoilRecommendations,
  getDrainageInfoForCounty,
  getAllDrainageClassifications,
  getDrainageManagementTips,
  getAllIrishCounties,
  getTeagascMappingForCounty,
  getSoilTypeInfo,
  getAllSoilTypes,
  getRecommendationsForSoilType,
  getSuitablePlantsForSoilType,
  getBestPracticesForSoilType,
  getChallengesForSoilType,
  getCountiesWithSoilType,
  getSoilSummary,
  clearCache,
};
