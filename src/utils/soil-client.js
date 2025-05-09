// src/utils/soil-client.js
// Soil data client for Irish counties

import logger from "./unified-logger.js";
import {
  IRISH_SOIL_TYPES,
  SOIL_RECOMMENDATIONS,
  TEAGASC_SOIL_ASSOCIATIONS,
  TEAGASC_SOIL_SERIES,
  LOCATION_TO_TEAGASC_MAPPING,
  COUNTY_SOIL_MAPPING,
  DRAINAGE_CLASSIFICATIONS,
} from "../data/irish-soil-data.js";

// Cache for soil data
const soilCache = new Map();

/**
 * Get soil data by Irish location
 * @param {string} county - County name
 * @returns {Promise<Object>} Soil data
 */
export async function getSoilDataByLocation(county) {
  try {
    // Default to Dublin if no county provided
    if (!county || typeof county !== "string") {
      logger.warn("No valid county provided, defaulting to Dublin");
      county = "Dublin";
    }

    // Lowercase and remove spaces for consistent keys
    const normalizedCounty = county.toLowerCase().replace(/\s+/g, "");

    // Check cache first
    const cacheKey = `soil_${normalizedCounty}`;
    if (soilCache.has(cacheKey)) {
      return soilCache.get(cacheKey);
    }

    // Get Teagasc soil data for the county
    const soilData = getTeagascSoilData(county, normalizedCounty);

    // Cache the result
    soilCache.set(cacheKey, soilData);
    return soilData;
  } catch (error) {
    logger.error("Soil data error", {
      component: "SoilClient",
      county: county,
      error: error.message,
    });

    // Return a default soil type
    return {
      county: county || "Unknown",
      soilType: "unknown",
      soilName: "Unknown Soil Type",
      description: "Soil data could not be determined",
      properties: {
        ph: { min: 5.0, max: 7.0 },
        texture: "Variable",
        nutrients: "Unknown",
        drainage: "Unknown",
      },
      recommendations: [],
      source: "Default Data (Error Recovery)",
    };
  }
}

/**
 * Get Teagasc soil data based on county
 * @param {string} county - Original county name
 * @param {string} normalizedCounty - Normalized county name for lookup
 * @returns {Object} Enhanced soil data with Teagasc information
 */
function getTeagascSoilData(county, normalizedCounty) {
  // Get the county mapping information
  const countyDetails =
    LOCATION_TO_TEAGASC_MAPPING[normalizedCounty] ||
    LOCATION_TO_TEAGASC_MAPPING.default;

  // Get the base soil type information
  const soilType =
    COUNTY_SOIL_MAPPING[normalizedCounty] || COUNTY_SOIL_MAPPING.default;
  const soilInfo = IRISH_SOIL_TYPES[soilType];

  // Find detailed association information
  const associationUnit = countyDetails.associationUnit;
  const associationName = countyDetails.associationName;
  const mainSeriesId = countyDetails.mainSeriesId;
  const mainSeriesName = countyDetails.mainSeriesName;

  // Build the response with enhanced data
  return {
    county: countyDetails.displayName || county,
    soilType: soilType,
    soilName: soilInfo.name,
    description: soilInfo.description,
    properties: {
      ph: soilInfo.ph,
      texture: countyDetails.textureType || soilInfo.texture,
      nutrients: soilInfo.nutrients,
      drainage: countyDetails.drainageClass || soilInfo.drainage,
    },
    recommendations:
      SOIL_RECOMMENDATIONS[soilType] || SOIL_RECOMMENDATIONS.default,
    gardeningNotes: soilInfo.gardeningNotes,
    suitablePlants: soilInfo.suitablePlants,
    challenges: soilInfo.challenges,
    bestPractices: soilInfo.bestPractices,
    source: "Irish Soil Information System (Teagasc)",
    // Additional Teagasc data
    teagasc: {
      associationUnit: associationUnit,
      associationName: associationName,
      seriesId: mainSeriesId,
      seriesName: mainSeriesName,
      textureSubstrateType: countyDetails.textureType,
      drainageClass: countyDetails.drainageClass,
    },
  };
}

/**
 * Get soil data for a specific Irish county (synchronous version)
 * @param {string} county - County name (case insensitive)
 * @returns {Object} Detailed soil information
 */
export function getSoilDataForCounty(county) {
  try {
    // Normalize county name for lookup
    const normalizedCounty = county.toLowerCase().trim().replace(/\s+/g, "");

    // Check cache first
    const cacheKey = `county_${normalizedCounty}`;
    if (soilCache.has(cacheKey)) {
      return soilCache.get(cacheKey);
    }

    const soilData = getTeagascSoilData(county, normalizedCounty);

    // Cache the result
    soilCache.set(cacheKey, soilData);
    return soilData;
  } catch (error) {
    logger.error("Error retrieving soil data:", {
      county: county,
      error: error.message,
      component: "SoilClient",
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
 * Get detailed information for a specific soil type
 * @param {string} soilType - Soil type code
 * @returns {Object} Detailed soil information
 */
export function getSoilTypeInformation(soilType) {
  return IRISH_SOIL_TYPES[soilType] || null;
}

/**
 * Get soil amendment recommendations based on soil type
 * @param {string} soilType - Soil type code
 * @returns {Array} List of recommendations
 */
export function getSoilRecommendations(soilType) {
  return SOIL_RECOMMENDATIONS[soilType] || SOIL_RECOMMENDATIONS.default;
}

/**
 * Get all available soil types
 * @returns {Object} Map of all soil types
 */
export function getAllSoilTypes() {
  return IRISH_SOIL_TYPES;
}

/**
 * Get suitable plants for a specific soil type
 * @param {string} soilType - Soil type code
 * @returns {Array} List of suitable plants
 */
export function getSuitablePlants(soilType) {
  const soilInfo = IRISH_SOIL_TYPES[soilType];
  return soilInfo?.suitablePlants || [];
}

/**
 * Get gardening challenges for a specific soil type
 * @param {string} soilType - Soil type code
 * @returns {Array} List of challenges
 */
export function getSoilChallenges(soilType) {
  const soilInfo = IRISH_SOIL_TYPES[soilType];
  return soilInfo?.challenges || [];
}

/**
 * Get best gardening practices for a specific soil type
 * @param {string} soilType - Soil type code
 * @returns {Array} List of best practices
 */
export function getBestPractices(soilType) {
  const soilInfo = IRISH_SOIL_TYPES[soilType];
  return soilInfo?.bestPractices || [];
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

  return countyData.drainageInfo || DRAINAGE_CLASSIFICATIONS["Moderate"];
}

/**
 * Get drainage management recommendations based on drainage class
 * @param {string} drainageClass - Drainage class name (e.g. "Poor", "Well")
 * @returns {Array} Array of drainage management recommendations
 */
export function getDrainageManagementTips(drainageClass) {
  const drainageInfo =
    DRAINAGE_CLASSIFICATIONS[drainageClass] ||
    DRAINAGE_CLASSIFICATIONS["Moderate"];

  return drainageInfo.management || [];
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
 * Clear the soil data cache (useful for testing)
 */
export function clearSoilCache() {
  soilCache.clear();
}

export default {
  getSoilDataByLocation,
  getSoilDataForCounty,
  getSoilTypeInformation,
  getSoilRecommendations,
  getAllSoilTypes,
  getSuitablePlants,
  getSoilChallenges,
  getBestPractices,
  getAllIrishCounties,
  getDrainageInfoForCounty,
  getDrainageManagementTips,
  getCountiesWithSoilType,
  clearSoilCache,
};
