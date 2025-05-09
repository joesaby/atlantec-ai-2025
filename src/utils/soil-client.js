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
    console.log("getSoilDataByLocation called for county:", county);

    // Default to Dublin if no county provided
    if (!county || typeof county !== "string") {
      console.warn("No valid county provided, defaulting to Dublin");
      county = "Dublin";
    }

    // Lowercase and remove spaces for consistent keys
    const normalizedCounty = county.toLowerCase().replace(/\s+/g, "");

    // Check cache first
    const cacheKey = `soil_${normalizedCounty}`;
    if (soilCache.has(cacheKey)) {
      console.log("Returning cached soil data for:", county);
      return soilCache.get(cacheKey);
    }

    // Get Teagasc soil data for the county
    const soilData = getTeagascSoilData(county, normalizedCounty);
    console.log("Generated soil data for:", county, soilData);

    // Cache the result
    soilCache.set(cacheKey, soilData);
    return soilData;
  } catch (error) {
    console.error("Soil data error:", error);
    if (typeof logger !== "undefined") {
      logger.error("Soil data error", {
        component: "SoilClient",
        county: county,
        error: error.message,
      });
    }

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

  // Find association in the imported data
  const association =
    TEAGASC_SOIL_ASSOCIATIONS.find(
      (assoc) => assoc.Association_Unit === associationUnit
    ) || TEAGASC_SOIL_ASSOCIATIONS[0];

  // Find series in the imported data
  const series =
    TEAGASC_SOIL_SERIES.find((s) => s.National_Series_Id === mainSeriesId) ||
    null;

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
 * Get all available Teagasc soil associations
 * @returns {Array} All soil associations
 */
export function getTeagascSoilAssociations() {
  return TEAGASC_SOIL_ASSOCIATIONS;
}

/**
 * Get all available Teagasc soil series
 * @returns {Array} All soil series
 */
export function getTeagascSoilSeries() {
  return TEAGASC_SOIL_SERIES;
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
 * Clear the soil data cache (useful for testing)
 */
export function clearSoilCache() {
  soilCache.clear();
}
