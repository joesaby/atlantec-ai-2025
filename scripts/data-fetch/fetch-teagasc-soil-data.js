// scripts/data-fetch/fetch-teagasc-soil-data.js
// One-time script to fetch Irish soil data from Teagasc API

import axios from "axios";
import fs from "fs/promises";
import path from "path";

const TEAGASC_API_ENDPOINTS = {
  allAssociations:
    "http://gis.teagasc.ie/soils/services/get_all_associations.php",
  allSeries: "http://gis.teagasc.ie/soils/services/get_all_series.php",
  associationDetails:
    "http://gis.teagasc.ie/soils/get_associations.php?assoc_id=",
  seriesDetails: "http://gis.teagasc.ie/soils/get_series_full.php?series_code=",
};

// Folder to save temporary JSON files
const TEMP_JSON_FOLDER = path.join(process.cwd(), "scripts/data-fetch/temp");

// List of Irish counties with soil data
const IRISH_COUNTIES = [
  { name: "dublin", associationId: "0700a", seriesId: "0700EL" },
  { name: "cork", associationId: "0600a", seriesId: "0600HT" },
  { name: "galway", associationId: "0360a", seriesId: "0360BN" },
  { name: "kerry", associationId: "0760c", seriesId: "0760HW" },
  { name: "mayo", associationId: "0660a", seriesId: "0660BK" },
  { name: "donegal", associationId: "1300a", seriesId: "1300CA" },
  { name: "wexford", associationId: "0400a", seriesId: "0400KV" },
  { name: "kildare", associationId: "1000a", seriesId: "1000EL" },
  { name: "wicklow", associationId: "0110a", seriesId: "0110AE" },
  { name: "limerick", associationId: "0320a", seriesId: "0320LP" },
  { name: "waterford", associationId: "0200a", seriesId: "0200WF" },
  { name: "tipperary", associationId: "0840b", seriesId: "0840TY" },
  { name: "clare", associationId: "0420a", seriesId: "0420CE" },
  { name: "kilkenny", associationId: "0510a", seriesId: "0510KK" },
  { name: "offaly", associationId: "0900a", seriesId: "0900OY" },
  { name: "laois", associationId: "1100a", seriesId: "1100LS" },
  { name: "louth", associationId: "0810a", seriesId: "0810LH" },
  { name: "meath", associationId: "1130b", seriesId: "1130MH" },
  { name: "westmeath", associationId: "0940a", seriesId: "0940WH" },
  { name: "carlow", associationId: "0950a", seriesId: "0950CW" },
  { name: "cavan", associationId: "1280a", seriesId: "1280CN" },
  { name: "monaghan", associationId: "1350a", seriesId: "1350MN" },
  { name: "sligo", associationId: "0890a", seriesId: "0890SO" },
  { name: "leitrim", associationId: "1240a", seriesId: "1240LM" },
  { name: "roscommon", associationId: "0780a", seriesId: "0780RN" },
  { name: "longford", associationId: "1210a", seriesId: "1210LD" },
];

// Cities and large towns with soil data
const IRISH_CITIES_TOWNS = [
  { name: "limerick-city", associationId: "0320a", seriesId: "0320LP" },
  { name: "galway-city", associationId: "0360a", seriesId: "0360BN" },
  { name: "waterford-city", associationId: "0200a", seriesId: "0200WF" },
  { name: "drogheda", associationId: "0810a", seriesId: "0810LH" },
  { name: "dundalk", associationId: "0810b", seriesId: "0810DN" },
  { name: "swords", associationId: "0700a", seriesId: "0700SW" },
  { name: "bray", associationId: "0110a", seriesId: "0110BY" },
  { name: "navan", associationId: "1130b", seriesId: "1130MH" },
  { name: "killarney", associationId: "0760c", seriesId: "0760KY" },
  { name: "tralee", associationId: "0760a", seriesId: "0760TE" },
  { name: "ennis", associationId: "0420a", seriesId: "0420ES" },
  { name: "mullingar", associationId: "0940a", seriesId: "0940MR" },
  { name: "wexford-town", associationId: "0400a", seriesId: "0400WT" },
  { name: "letterkenny", associationId: "1300a", seriesId: "1300LK" },
  { name: "kilkenny-city", associationId: "0510a", seriesId: "0510KC" },
  { name: "athlone", associationId: "0940b", seriesId: "0940AN" },
  { name: "tullamore", associationId: "0900a", seriesId: "0900TM" },
  { name: "clonmel", associationId: "0840b", seriesId: "0840CL" },
];

// Combined list of all locations for soil data fetching
const ALL_SOIL_LOCATIONS = [...IRISH_COUNTIES, ...IRISH_CITIES_TOWNS];

async function fetchTeagascData() {
  console.log("Starting to fetch Teagasc soil data...");

  try {
    // Create temp folder if it doesn't exist
    await fs.mkdir(TEMP_JSON_FOLDER, { recursive: true });

    // Fetch all soil associations
    console.log("Fetching all soil associations...");
    const associationsResponse = await axios.get(
      TEAGASC_API_ENDPOINTS.allAssociations
    );
    const allAssociations = associationsResponse.data;
    console.log(`Retrieved ${allAssociations.length} soil associations`);

    // Save all associations to temp file
    await fs.writeFile(
      path.join(TEMP_JSON_FOLDER, "all-associations.json"),
      JSON.stringify(allAssociations, null, 2)
    );

    // Fetch all soil series
    console.log("Fetching all soil series...");
    const seriesResponse = await axios.get(TEAGASC_API_ENDPOINTS.allSeries);
    const allSeries = seriesResponse.data;
    console.log(`Retrieved ${allSeries.length} soil series`);

    // Save all series to temp file
    await fs.writeFile(
      path.join(TEMP_JSON_FOLDER, "all-series.json"),
      JSON.stringify(allSeries, null, 2)
    );

    // Fetch detailed information for major associations
    console.log("Fetching detailed information for major associations...");
    const detailedAssociations = [];
    const detailedSeries = [];

    // Process associations for major counties
    for (const location of ALL_SOIL_LOCATIONS) {
      console.log(
        `Fetching details for association ${location.associationId} for ${location.name}...`
      );
      try {
        const detailResponse = await axios.get(
          `${TEAGASC_API_ENDPOINTS.associationDetails}${location.associationId}`
        );
        detailedAssociations.push(detailResponse.data);
      } catch (error) {
        console.error(
          `Error fetching association ${location.associationId} for ${location.name}: ${error.message}`
        );
      }

      console.log(
        `Fetching details for series ${location.seriesId} for ${location.name}...`
      );
      try {
        const seriesDetailResponse = await axios.get(
          `${TEAGASC_API_ENDPOINTS.seriesDetails}${location.seriesId}`
        );
        detailedSeries.push(seriesDetailResponse.data);
      } catch (error) {
        console.error(
          `Error fetching series ${location.seriesId} for ${location.name}: ${error.message}`
        );
      }

      // Add small delay to avoid overwhelming the API
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Save detailed associations to temp file
    await fs.writeFile(
      path.join(TEMP_JSON_FOLDER, "detailed-associations.json"),
      JSON.stringify(detailedAssociations, null, 2)
    );

    // Save detailed series to temp file
    await fs.writeFile(
      path.join(TEMP_JSON_FOLDER, "detailed-series.json"),
      JSON.stringify(detailedSeries, null, 2)
    );

    // Prepare data structure for irish-soil-data.js
    const teagascSoilData = {
      associations: allAssociations,
      series: allSeries,
      detailedAssociations: detailedAssociations,
      detailedSeries: detailedSeries,
      countyMapping: generateCountyMapping(
        ALL_SOIL_LOCATIONS,
        allAssociations,
        allSeries
      ),
    };

    // Generate the JavaScript module content
    const jsContent = generateJavaScriptModule(teagascSoilData);

    // Write the updated irish-soil-data.js file
    const dataFilePath = path.join(
      process.cwd(),
      "src/data/irish-soil-data.js"
    );
    await fs.writeFile(dataFilePath, jsContent);

    console.log(`Successfully updated ${dataFilePath} with Teagasc soil data!`);
  } catch (error) {
    console.error("Error fetching soil data:", error.message);
    if (error.response) {
      console.error("API response:", error.response.data);
    }
  }
}

function generateCountyMapping(locations, associations, series) {
  const mapping = {};

  locations.forEach((location) => {
    const association = associations.find(
      (a) => a.Association_Unit === location.associationId
    );
    const seriesItem = series.find(
      (s) => s.National_Series_Id === location.seriesId
    );

    // Determine soil type based on series name, association name, and location-specific knowledge
    let soilType = "brown-earth"; // Default as fallback

    const seriesName = (seriesItem?.National_Series || "").toLowerCase();
    const assocName = (association?.Association_Name || "").toLowerCase();

    // Location-specific soil type mapping based on geological and soil science knowledge
    // This provides more accurate soil type assignment than just name-based detection
    const locationSpecificSoils = {
      dublin: "grey-brown-podzolic",
      cork: "brown-earth",
      galway: "peat",
      kerry: "brown-podzolic",
      mayo: "gley",
      donegal: "podzol",
      wexford: "brown-earth",
      kildare: "grey-brown-podzolic",
      wicklow: "acid-brown-earth",
      // Add more specific soil types for new locations
      limerick: "gley",
      waterford: "brown-earth",
      clare: "brown-earth",
      "galway-city": "gley",
      "limerick-city": "alluvial",
    };

    if (locationSpecificSoils[location.name]) {
      soilType = locationSpecificSoils[location.name];
    } else {
      // If no location-specific mapping, determine by textual analysis
      if (
        seriesName.includes("peat") ||
        assocName.includes("peat") ||
        seriesName.includes("cutover") ||
        assocName.includes("cutover") ||
        seriesName.includes("bog") ||
        assocName.includes("bog")
      ) {
        soilType = "peat";
      } else if (
        seriesName.includes("gley") ||
        assocName.includes("gley") ||
        (seriesName.includes("drain") && seriesName.includes("poor")) ||
        (assocName.includes("drain") && assocName.includes("poor"))
      ) {
        soilType = "gley";
      } else if (
        seriesName.includes("podzolic") ||
        assocName.includes("podzolic") ||
        seriesName.includes("podzol") ||
        assocName.includes("podzol")
      ) {
        soilType = "grey-brown-podzolic";
      } else if (
        seriesName.includes("acid") ||
        assocName.includes("acid") ||
        seriesName.includes("granite") ||
        assocName.includes("granite")
      ) {
        soilType = "acid-brown-earth";
      } else if (
        seriesName.includes("litho") ||
        assocName.includes("litho") ||
        (seriesName.includes("shallow") && seriesName.includes("rock")) ||
        (assocName.includes("shallow") && assocName.includes("rock"))
      ) {
        soilType = "lithosol";
      } else if (
        seriesName.includes("alluvial") ||
        assocName.includes("alluvial") ||
        seriesName.includes("river") ||
        assocName.includes("river") ||
        seriesName.includes("flood") ||
        assocName.includes("flood")
      ) {
        soilType = "alluvial";
      } else if (
        seriesName.includes("rendzina") ||
        assocName.includes("rendzina") ||
        seriesName.includes("limestone") ||
        assocName.includes("limestone") ||
        seriesName.includes("chalk") ||
        assocName.includes("chalk")
      ) {
        soilType = "rendzina";
      }
    }

    mapping[location.name] = {
      primaryAssociation: location.associationId,
      primarySeries: location.seriesId,
      soilType: soilType,
      associationName: association?.Association_Name || "",
      seriesName: seriesItem?.National_Series || "",
    };
  });

  // Add default
  mapping.default = {
    primaryAssociation: "1000a", // Elton association
    primarySeries: "1000ET", // Elton series
    soilType: "grey-brown-podzolic", // More accurate for Elton series
    associationName: "Elton",
    seriesName: "Elton",
  };

  return mapping;
}

function generateJavaScriptModule(teagascData) {
  // Keep the existing mock data structure for backward compatibility
  return `// src/data/irish-soil-data.js
// Irish soil types and county mappings
// Data fetched from http://gis.teagasc.ie/soils/ on ${
    new Date().toISOString().split("T")[0]
  }

// Mock Irish soil types for development (keeping for backwards compatibility)
export const IRISH_SOIL_TYPES = {
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
export const COUNTY_SOIL_MAPPING = {
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

// Soil recommendations by soil type
export const SOIL_RECOMMENDATIONS = {
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

// Teagasc API endpoints (preserved for reference)
export const TEAGASC_API_ENDPOINTS = {
  allAssociations: "http://gis.teagasc.ie/soils/services/get_all_associations.php",
  allSeries: "http://gis.teagasc.ie/soils/services/get_all_series.php",
  associationDetails: "http://gis.teagasc.ie/soils/get_associations.php?assoc_id=",
  seriesDetails: "http://gis.teagasc.ie/soils/get_series_full.php?series_code="
};

// Complete Teagasc soil associations data
export const TEAGASC_SOIL_ASSOCIATIONS = ${JSON.stringify(
    teagascData.associations,
    null,
    2
  )};

// Complete Teagasc soil series data
export const TEAGASC_SOIL_SERIES = ${JSON.stringify(
    teagascData.series,
    null,
    2
  )};

// Detailed data for selected soil associations
export const TEAGASC_DETAILED_ASSOCIATIONS = ${JSON.stringify(
    teagascData.detailedAssociations,
    null,
    2
  )};

// Detailed data for selected soil series
export const TEAGASC_DETAILED_SERIES = ${JSON.stringify(
    teagascData.detailedSeries,
    null,
    2
  )};

// Mapping Irish locations to Teagasc soil associations
export const LOCATION_TO_TEAGASC_MAPPING = ${JSON.stringify(
    teagascData.countyMapping,
    null,
    2
  )};
`;
}

// Run the fetch function
fetchTeagascData();
