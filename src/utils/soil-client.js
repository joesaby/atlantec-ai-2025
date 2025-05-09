// src/utils/soil-client.js
// Soil data client for Irish counties

import logger from "./unified-logger.js";
import {
  IRISH_SOIL_TYPES,
  SOIL_RECOMMENDATIONS,
  TEAGASC_SOIL_ASSOCIATIONS,
  TEAGASC_SOIL_SERIES,
  TEAGASC_DETAILED_ASSOCIATIONS,
  LOCATION_TO_TEAGASC_MAPPING,
} from "../data/irish-soil-data.js";

// Cache for soil data
const soilCache = new Map();

// Location-specific soil type mapping based on geological and soil science knowledge
// This provides more accurate soil type assignment than just name-based detection
const locationSpecificSoils = {
  // Counties
  dublin: "grey-brown-podzolic",
  cork: "brown-earth",
  galway: "peat",
  kerry: "brown-podzolic",
  mayo: "gley",
  donegal: "podzol",
  wexford: "brown-earth",
  kildare: "grey-brown-podzolic",
  wicklow: "acid-brown-earth",
  limerick: "grey-brown-podzolic",
  waterford: "brown-earth",
  tipperary: "grey-brown-podzolic",
  clare: "rendzina", 
  kilkenny: "grey-brown-podzolic",
  offaly: "gley",
  laois: "grey-brown-podzolic",
  louth: "grey-brown-podzolic",
  meath: "grey-brown-podzolic",
  westmeath: "grey-brown-podzolic",
  carlow: "brown-earth",
  cavan: "gley",
  monaghan: "gley",
  sligo: "peat",
  leitrim: "gley",
  roscommon: "rendzina",
  longford: "gley",
  
  // Cities and large towns (with more localized soil types)
  "limerick-city": "alluvial", // River Shannon floodplain
  "galway-city": "gley", // Wet coastal conditions
  "waterford-city": "alluvial", // River Suir influence
  "drogheda": "grey-brown-podzolic", // Similar to Louth
  "dundalk": "gley", // Low-lying areas near bay 
  "swords": "grey-brown-podzolic", // North Dublin characteristics
  "bray": "acid-brown-earth", // Influenced by Wicklow mountains
  "navan": "grey-brown-podzolic", // Rich Meath soil
  "killarney": "peat", // Kerry lowlands with bogland influence
  "tralee": "gley", // Kerry coastal plain
  "ennis": "rendzina", // Limestone influence from Clare
  "mullingar": "gley", // Westmeath lowlands
  "wexford-town": "brown-earth", // Similar to county
  "letterkenny": "podzol", // Upland Donegal characteristics
  "kilkenny-city": "grey-brown-podzolic", // Same as county
  "athlone": "gley", // Shannon basin influence
  "tullamore": "gley", // Bog-influenced lowlands
  "clonmel": "brown-earth" // River valley soil
};

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
  const countyMapping =
    LOCATION_TO_TEAGASC_MAPPING[normalizedCounty] ||
    LOCATION_TO_TEAGASC_MAPPING.default;

  // Get the base soil type information
  const soilType = countyMapping.soilType;
  const soilInfo = IRISH_SOIL_TYPES[soilType];

  // Find detailed association information
  const associationId = countyMapping.primaryAssociation;
  const association =
    TEAGASC_SOIL_ASSOCIATIONS.find(
      (assoc) => assoc.Association_Unit === associationId
    ) || TEAGASC_SOIL_ASSOCIATIONS[0];

  // Find detailed series information if available
  const seriesId = countyMapping.primarySeries;
  const series = TEAGASC_SOIL_SERIES.find(
    (s) => s.National_Series_Id === seriesId
  );

  // Find detailed information if available
  const detailedAssociation = TEAGASC_DETAILED_ASSOCIATIONS.find(
    (assoc) => assoc.Association_Unit === associationId
  );

  // Try to find the texture from detailed data or use the basic soil info
  const texture =
    detailedAssociation?.Texture_Substrate_Type || soilInfo.texture;

  // Build the response with enhanced data if available
  return {
    county: county,
    soilType: soilType,
    soilName:
      series?.National_Series || association?.Association_Name || soilInfo.name,
    description: soilInfo.description,
    properties: {
      ph: soilInfo.ph,
      texture: texture,
      nutrients: soilInfo.nutrients,
      drainage: soilInfo.drainage,
    },
    recommendations: getSoilRecommendations(soilType),
    source: "Irish Soil Database (Teagasc)",
    // Additional Teagasc data
    teagasc: {
      associationId: association?.Association_Unit,
      associationName: association?.Association_Name,
      seriesId: series?.National_Series_Id,
      seriesName: series?.National_Series,
      textureSubstrateType: detailedAssociation?.Texture_Substrate_Type,
      color: association
        ? {
            r: parseInt(association.Red_Value, 10),
            g: parseInt(association.Green_Value, 10),
            b: parseInt(association.Blue_Value, 10),
          }
        : undefined,
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
function getSoilRecommendations(soilType) {
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
