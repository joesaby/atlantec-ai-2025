// src/utils/soil-client.js
// Soil data client for Irish counties

import logger from './unified-logger.js';

// Cache for soil data
const soilCache = new Map();

// Mock Irish soil types for development
const IRISH_SOIL_TYPES = {
  "brown-earth": {
    name: "Brown Earth",
    description: "Fertile soils common in the Midlands region",
    ph: { min: 5.5, max: 7.0 },
    texture: "Loamy",
    nutrients: "High",
    drainage: "Good",
  },
  "grey-brown-podzolic": {
    name: "Grey-Brown Podzolic",
    description: "Good agricultural soils in east and south",
    ph: { min: 5.0, max: 6.5 },
    texture: "Clay Loam",
    nutrients: "Medium",
    drainage: "Moderate",
  },
  gley: {
    name: "Gley",
    description: "Poorly drained soils found in low-lying areas",
    ph: { min: 4.5, max: 6.0 },
    texture: "Clay",
    nutrients: "Variable",
    drainage: "Poor",
  },
  peat: {
    name: "Peat",
    description: "Acidic, organic-rich soils common in boglands",
    ph: { min: 3.5, max: 5.5 },
    texture: "Organic",
    nutrients: "Low",
    drainage: "Poor to Very Poor",
  },
  "acid-brown-earth": {
    name: "Acid Brown Earth",
    description: "Forestry and some agricultural soils",
    ph: { min: 4.5, max: 5.5 },
    texture: "Sandy Loam",
    nutrients: "Low",
    drainage: "Good",
  },
};

// County to dominant soil type mapping (simplified)
const COUNTY_SOIL_MAPPING = {
  dublin: "grey-brown-podzolic",
  kildare: "grey-brown-podzolic",
  wicklow: "acid-brown-earth",
  wexford: "brown-earth",
  cork: "brown-earth",
  galway: "peat",
  mayo: "gley",
  donegal: "peat",
  // Add more counties as needed
  default: "brown-earth",
};

/**
 * Get soil data by Irish location
 * @param {string} county - County name
 * @returns {Promise<Object>} Soil data
 */
export async function getSoilDataByLocation(county) {
  // Lowercase and remove spaces for consistent keys
  const normalizedCounty = county.toLowerCase().replace(/\s+/g, "");

  // Check cache first
  const cacheKey = `soil_${normalizedCounty}`;
  if (soilCache.has(cacheKey)) {
    return soilCache.get(cacheKey);
  }

  try {
    // In a real implementation, this would call Teagasc API
    // For MVP, we'll use our mock data

    // Get the dominant soil type for this county
    const soilType =
      COUNTY_SOIL_MAPPING[normalizedCounty] || COUNTY_SOIL_MAPPING.default;

    // Get detailed soil information
    const soilInfo = IRISH_SOIL_TYPES[soilType];

    const soilData = {
      county: county,
      soilType: soilType,
      soilName: soilInfo.name,
      description: soilInfo.description,
      properties: {
        ph: soilInfo.ph,
        texture: soilInfo.texture,
        nutrients: soilInfo.nutrients,
        drainage: soilInfo.drainage,
      },
      recommendations: getSoilRecommendations(soilType),
      source: "Irish Soil Database (Mock for MVP)",
    };

    // Cache the result (permanent for MVP since this is mock data)
    soilCache.set(cacheKey, soilData);

    return soilData;
  } catch (error) {
    logger.error("Soil data error", {
      component: "SoilClient",
      county: county,
      error: error.message
    });
    // Return a default soil type
    return {
      county: county,
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
function getSoilRecommendations(soilType) {
  const recommendations = {
    "brown-earth": [
      "Generally good for most crops",
      "Add organic matter annually to maintain fertility",
      "Monitor pH and maintain between 6.0-7.0 for most crops",
    ],
    "grey-brown-podzolic": [
      "Good for most vegetables and fruits",
      "May need lime to raise pH for certain crops",
      "Add organic matter to improve structure",
    ],
    gley: [
      "Improve drainage with raised beds",
      "Add organic matter to improve structure",
      "Select moisture-tolerant crops",
      "Consider adding lime if pH is below 5.5",
    ],
    peat: [
      "Excellent for acid-loving plants like blueberries",
      "May need lime for most vegetables",
      "Add rock dust or seaweed to provide minerals",
      "No need to add additional organic matter",
    ],
    "acid-brown-earth": [
      "Add lime for most vegetables",
      "Good for acid-loving plants if left untreated",
      "Add organic matter to improve nutrient content",
      "Consider adding composted manure for fertility",
    ],
    default: [
      "Add organic matter annually",
      "Test soil pH and amend accordingly",
      "Consider raised beds if drainage is poor",
    ],
  };

  return recommendations[soilType] || recommendations.default;
}
