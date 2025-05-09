// scripts/data-fetch/fetch-irish-soil-data.js
// Script to fetch relevant Irish soil data for gardening applications
// Based on the Irish Soil Information System data from Teagasc
// API documentation: http://gis.teagasc.ie/soils/Downloads/IrishSoilInformationSystem_API_Help.pdf

import axios from "axios";
import fs from "fs/promises";
import path from "path";

// API endpoints for soil data (focusing on Teagasc endpoints that are working)
const API_ENDPOINTS = {
  // Teagasc API endpoints
  allAssociations:
    "http://gis.teagasc.ie/soils/services/get_all_associations.php",
  allSeries: "http://gis.teagasc.ie/soils/services/get_all_series.php",
  associationDetails:
    "http://gis.teagasc.ie/soils/get_associations.php?assoc_id=",
  seriesDetails: "http://gis.teagasc.ie/soils/get_series_full.php?series_code=",
};

// Folder to save temporary JSON files
const TEMP_JSON_FOLDER = path.join(process.cwd(), "scripts/data-fetch/temp");

// Enhanced drainage information based on Irish soil classification and local conditions
const ENHANCED_DRAINAGE_INFO = {
  // Drainage classes with detailed information
  Excessive: {
    description: "Water passes through the soil very rapidly",
    level: 5,
    characteristics: [
      "Very quick to drain after rainfall",
      "Prone to drought in summer",
      "Usually sandy or gravelly texture",
      "Very little surface runoff",
    ],
    management: [
      "Add organic matter to improve water retention",
      "Mulch heavily to conserve moisture",
      "Water more frequently during dry periods",
      "Consider drought-tolerant plants",
    ],
  },
  Well: {
    description: "Water removal from the soil is good but not excessive",
    level: 4,
    characteristics: [
      "Drains readily after rainfall",
      "Good balance of air and water for root growth",
      "Often loamy texture",
      "Little surface ponding",
    ],
    management: [
      "Minimal drainage improvements needed",
      "Standard watering practices",
      "Annual addition of organic matter to maintain structure",
      "Suitable for most garden plants",
    ],
  },
  Moderate: {
    description:
      "Water is removed somewhat slowly, soil may remain wet for short periods",
    level: 3,
    characteristics: [
      "Can remain wet for a day or two after heavy rain",
      "Moderate porosity and permeability",
      "Often clay loam texture",
      "Some surface runoff during heavy rain",
    ],
    management: [
      "Light soil amendments to improve structure",
      "Consider raised beds for plants that need good drainage",
      "Avoid working soil when wet",
      "Choose plants with moderate moisture tolerance",
    ],
  },
  Imperfect: {
    description:
      "Water is removed slowly, soil remains wet for significant periods",
    level: 2,
    characteristics: [
      "Waterlogged after moderate rainfall",
      "High water table part of the year",
      "Often heavy clay or silty texture",
      "Significant surface runoff",
    ],
    management: [
      "Install drainage channels or French drains",
      "Use raised beds for vegetables",
      "Add grit and organic matter to improve structure",
      "Choose moisture-tolerant plants or late season crops",
    ],
  },
  Poor: {
    description:
      "Water is removed very slowly, soil remains wet for extended periods",
    level: 1,
    characteristics: [
      "Frequently waterlogged",
      "High water table most of the year",
      "Heavy clay or organic soil",
      "Standing water common after rainfall",
    ],
    management: [
      "Install comprehensive drainage system",
      "Use significantly raised beds",
      "Add abundant drainage material when planting",
      "Choose bog or water-loving plants",
    ],
  },
  "Very Poor": {
    description:
      "Water is removed so slowly that the water table remains at or near the surface most of the year",
    level: 0,
    characteristics: [
      "Permanently or near-permanently waterlogged",
      "Water table at or near surface year-round",
      "Often peaty or heavy gley soils",
      "Standing water most of the year",
    ],
    management: [
      "Consider wetland or bog garden instead of drainage",
      "If drainage needed, professional system required",
      "Choose wetland or bog plants",
      "Raised beds with significant height for conventional gardening",
    ],
  },
};

// Map Teagasc drainage classes to our enhanced drainage info
function getDrainageInfo(drainageClass) {
  // Extract the main drainage class from Teagasc data
  let mainClass = "Moderate"; // Default

  if (!drainageClass) return ENHANCED_DRAINAGE_INFO["Moderate"];

  const normalizedDrainage = drainageClass.toLowerCase();

  if (
    normalizedDrainage.includes("excessively") ||
    normalizedDrainage.includes("excessive")
  ) {
    mainClass = "Excessive";
  } else if (
    normalizedDrainage.includes("well") &&
    !normalizedDrainage.includes("imperfect")
  ) {
    mainClass = "Well";
  } else if (normalizedDrainage.includes("moderate")) {
    mainClass = "Moderate";
  } else if (normalizedDrainage.includes("imperfect")) {
    mainClass = "Imperfect";
  } else if (
    normalizedDrainage.includes("poor") &&
    !normalizedDrainage.includes("very")
  ) {
    mainClass = "Poor";
  } else if (normalizedDrainage.includes("very poor")) {
    mainClass = "Very Poor";
  }

  return {
    ...ENHANCED_DRAINAGE_INFO[mainClass],
    originalClass: drainageClass, // Keep the original class name
  };
}

// List of Irish counties with their main soil associations for gardening
const IRISH_COUNTIES_SOIL_INFO = [
  {
    name: "carlow",
    displayName: "Carlow",
    mainAssociations: ["0900a", "1100h"],
    mainSeries: ["0900CG"],
  },
  {
    name: "cavan",
    displayName: "Cavan",
    mainAssociations: ["0700c"],
    mainSeries: ["0700DK"],
  },
  {
    name: "clare",
    displayName: "Clare",
    mainAssociations: ["0360a"],
    mainSeries: ["0360BR"],
  },
  {
    name: "cork",
    displayName: "Cork",
    mainAssociations: ["0900e", "1100c"],
    mainSeries: ["0900RB", "1100CS"],
  },
  {
    name: "donegal",
    displayName: "Donegal",
    mainAssociations: ["0800a"],
    mainSeries: ["0800BK"],
  },
  {
    name: "dublin",
    displayName: "Dublin",
    mainAssociations: ["1000a"],
    mainSeries: ["1000ET"],
  },
  {
    name: "galway",
    displayName: "Galway",
    mainAssociations: ["0760a", "1xx"],
    mainSeries: ["0760GC"],
  },
  {
    name: "kerry",
    displayName: "Kerry",
    mainAssociations: ["0960e", "1xx"],
    mainSeries: ["0960KY"],
  },
  {
    name: "kildare",
    displayName: "Kildare",
    mainAssociations: ["1000a", "1100l"],
    mainSeries: ["1000ET", "1100KY"],
  },
  {
    name: "kilkenny",
    displayName: "Kilkenny",
    mainAssociations: ["1000a"],
    mainSeries: ["1000ET"],
  },
  {
    name: "laois",
    displayName: "Laois",
    mainAssociations: ["1000a"],
    mainSeries: ["1000ET"],
  },
  {
    name: "leitrim",
    displayName: "Leitrim",
    mainAssociations: ["0700c", "0760e"],
    mainSeries: ["0760BF"],
  },
  {
    name: "limerick",
    displayName: "Limerick",
    mainAssociations: ["1000a", "1100d"],
    mainSeries: ["1100BY"],
  },
  {
    name: "longford",
    displayName: "Longford",
    mainAssociations: ["1000a"],
    mainSeries: ["1000ET"],
  },
  {
    name: "louth",
    displayName: "Louth",
    mainAssociations: ["1000a"],
    mainSeries: ["1000ET"],
  },
  {
    name: "mayo",
    displayName: "Mayo",
    mainAssociations: ["0700f", "1xx"],
    mainSeries: ["0700NP"],
  },
  {
    name: "meath",
    displayName: "Meath",
    mainAssociations: ["1000a"],
    mainSeries: ["1000ET"],
  },
  {
    name: "monaghan",
    displayName: "Monaghan",
    mainAssociations: ["0700c"],
    mainSeries: ["0700DK"],
  },
  {
    name: "offaly",
    displayName: "Offaly",
    mainAssociations: ["1000a", "1xx"],
    mainSeries: ["1000ET"],
  },
  {
    name: "roscommon",
    displayName: "Roscommon",
    mainAssociations: ["0700c", "0760a"],
    mainSeries: ["0760GC"],
  },
  {
    name: "sligo",
    displayName: "Sligo",
    mainAssociations: ["0760e"],
    mainSeries: ["0760BF"],
  },
  {
    name: "tipperary",
    displayName: "Tipperary",
    mainAssociations: ["1000a", "1150a"],
    mainSeries: ["1000ET", "1150BT"],
  },
  {
    name: "waterford",
    displayName: "Waterford",
    mainAssociations: ["1100c", "1100e"],
    mainSeries: ["1100CS", "1100BL"],
  },
  {
    name: "westmeath",
    displayName: "Westmeath",
    mainAssociations: ["1000a"],
    mainSeries: ["1000ET"],
  },
  {
    name: "wexford",
    displayName: "Wexford",
    mainAssociations: ["1100a"],
    mainSeries: ["1100CR"],
  },
  {
    name: "wicklow",
    displayName: "Wicklow",
    mainAssociations: ["0800c", "0900b"],
    mainSeries: ["0900KY"],
  },
];

// Main function to fetch and process soil data
async function fetchIrishSoilData() {
  console.log(
    "Starting to fetch Irish soil data for gardening applications..."
  );

  try {
    // Create temp folder if it doesn't exist
    await fs.mkdir(TEMP_JSON_FOLDER, { recursive: true });

    // Step 1: Fetch basic soil classification data from Teagasc
    console.log("Step 1: Fetching basic soil classification data...");
    const soilClassificationData = await fetchSoilClassificationData();

    // Step 2: Get soil association details for counties
    console.log("Step 2: Fetching soil association details for counties...");
    const countyAssociationDetails = await fetchCountyAssociationDetails(
      soilClassificationData
    );

    // Step 3: Compile gardening-relevant soil characteristics
    console.log("Step 3: Compiling gardening-relevant soil characteristics...");
    const gardeningRelevantData = await compileGardeningRelevantData(
      soilClassificationData,
      countyAssociationDetails
    );

    // Step 4: Generate soil recommendations for gardening
    console.log(
      "Step 4: Generating gardening recommendations based on soil types..."
    );
    const soilRecommendations = generateSoilRecommendations();

    // Step 5: Save output to file
    const outputData = {
      soilTypes: gardeningRelevantData.soilTypes,
      countyMapping: gardeningRelevantData.countyMapping,
      soilRecommendations: soilRecommendations,
      soilAssociations: soilClassificationData.filteredAssociations,
      soilSeries: soilClassificationData.filteredSeries,
      drainageClasses: gardeningRelevantData.drainageClasses,
    };

    // Generate the JavaScript module content
    const jsContent = generateJavaScriptModule(outputData);

    // Write to irish-soil-data.js
    const dataFilePath = path.join(
      process.cwd(),
      "src/data/irish-soil-data.js"
    );
    await fs.writeFile(dataFilePath, jsContent);

    console.log(
      `Successfully updated ${dataFilePath} with Irish soil data for gardening!`
    );
    console.log("Data has been processed and saved successfully!");
  } catch (error) {
    console.error("Error fetching soil data:", error.message);
    if (error.response) {
      console.error("API response:", error.response.data);
    }
  }
}

// Step 1: Fetch soil classification data from Teagasc
async function fetchSoilClassificationData() {
  // Fetch all soil associations
  console.log("Fetching soil associations...");
  const associationsResponse = await axios.get(API_ENDPOINTS.allAssociations);
  const allAssociations = associationsResponse.data;
  console.log(`Retrieved ${allAssociations.length} soil associations`);

  // Save raw associations to temp file
  await fs.writeFile(
    path.join(TEMP_JSON_FOLDER, "all-associations.json"),
    JSON.stringify(allAssociations, null, 2)
  );

  // Fetch all soil series
  console.log("Fetching soil series...");
  const seriesResponse = await axios.get(API_ENDPOINTS.allSeries);
  const allSeries = seriesResponse.data;
  console.log(`Retrieved ${allSeries.length} soil series`);

  // Save raw series to temp file
  await fs.writeFile(
    path.join(TEMP_JSON_FOLDER, "all-series.json"),
    JSON.stringify(allSeries, null, 2)
  );

  // Filter for most relevant associations and series for gardening
  const filteredAssociations = allAssociations.filter(
    (assoc) =>
      // Filter logic for gardening-relevant soil associations
      !["Rock", "Urban", "Water body", "Salt marsh", "Tidal marsh"].includes(
        assoc.Association_Name
      )
  );

  // Important soil series for common agricultural/garden soils
  const keySeriesIds = [
    "1000ET", // Elton Series - Grey Brown Podzolic
    "0900CG", // Cooga Series - Brown Earth
    "0700MC", // Macamore Series - Grey Brown Podzolic
    "1100CR", // Clonroche Series - Brown Earth
    "0900RB", // Ross Carbery series - Brown Earth
    "0650MT", // Mylerstown Series - Grey Brown Podzolic
    "0700SF", // Straffan Series - Gley
    "1130MR", // Moord Series - Brown Earth
    "0760DY", // Driminidy Series - Gley
    "0700NP", // Newport Series - Acid Brown Earth
    "0760BF", // Ballinamore Series - Gley
    "0360BR", // Burren Series - Rendzina
    "0800BK", // Black Rock Mountain Series - Peaty Podzol
    "1xx", // Peat
  ];

  // Extract key series
  const filteredSeries = allSeries.filter((series) =>
    keySeriesIds.includes(series.National_Series_Id)
  );

  // Fetch details for selected series
  const seriesDetails = [];
  for (const seriesId of keySeriesIds) {
    try {
      if (seriesId === "1xx") continue; // Skip peat as it doesn't have a specific series ID

      console.log(`Fetching details for soil series ${seriesId}...`);
      const detailResponse = await axios.get(
        `${API_ENDPOINTS.seriesDetails}${seriesId}`
      );
      seriesDetails.push(detailResponse.data);

      // Add small delay to avoid overwhelming the API
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error fetching series ${seriesId}: ${error.message}`);
    }
  }

  // Save detailed series to temp file
  await fs.writeFile(
    path.join(TEMP_JSON_FOLDER, "key-series-details.json"),
    JSON.stringify(seriesDetails, null, 2)
  );

  return {
    allAssociations,
    filteredAssociations,
    allSeries,
    filteredSeries,
    seriesDetails,
  };
}

// Step 2: Fetch association details for counties
async function fetchCountyAssociationDetails(soilClassificationData) {
  const countyData = {};

  // Get unique association IDs from county data
  const uniqueAssociationIds = [
    ...new Set(
      IRISH_COUNTIES_SOIL_INFO.flatMap((county) => county.mainAssociations)
    ),
  ];

  // Fetch details for each association
  const associationDetails = [];
  for (const associationId of uniqueAssociationIds) {
    try {
      console.log(`Fetching details for soil association ${associationId}...`);

      // Skip peat (1xx) as it's a special case and doesn't have a standard association ID
      if (associationId === "1xx") {
        associationDetails.push({
          Association_Unit: "1xx",
          Association_Name: "Peat",
          Association_Symbol: "1xx",
          Drainage_Class: "Poor to Very Poor",
          Texture_Substrate_Type: "Organic",
        });
        continue;
      }

      const detailResponse = await axios.get(
        `${API_ENDPOINTS.associationDetails}${associationId}`
      );
      associationDetails.push(detailResponse.data);

      // Add small delay to avoid overwhelming the API
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(
        `Error fetching association ${associationId}: ${error.message}`
      );
    }
  }

  // Save association details to temp file
  await fs.writeFile(
    path.join(TEMP_JSON_FOLDER, "association-details.json"),
    JSON.stringify(associationDetails, null, 2)
  );

  // Map the county data
  for (const county of IRISH_COUNTIES_SOIL_INFO) {
    // Get the main association for this county
    const mainAssoc = county.mainAssociations[0]; // Use the first association as primary

    // Find the association details
    let assocDetails = associationDetails.find(
      (a) => a.Association_Unit === mainAssoc
    );

    if (!assocDetails && mainAssoc === "1xx") {
      // Special case for peat
      assocDetails = {
        Association_Unit: "1xx",
        Association_Name: "Peat",
        Association_Symbol: "1xx",
        Drainage_Class: "Poor to Very Poor",
        Texture_Substrate_Type: "Organic",
      };
    }

    // Find the main series from all series
    const mainSeries = soilClassificationData.allSeries.find((s) =>
      county.mainSeries.includes(s.National_Series_Id)
    );

    // Get enhanced drainage information
    const drainageClass = assocDetails?.Drainage_Class || "Moderate";
    const drainageInfo = getDrainageInfo(drainageClass);

    countyData[county.name] = {
      displayName: county.displayName,
      associationUnit: mainAssoc,
      associationName: assocDetails?.Association_Name || "Unknown",
      textureType: assocDetails?.Texture_Substrate_Type || "Unknown",
      drainageClass: drainageClass,
      drainageInfo: drainageInfo,
      mainSeriesId: mainSeries?.National_Series_Id || null,
      mainSeriesName: mainSeries?.National_Series || null,
    };
  }

  // Save county data to temp file
  await fs.writeFile(
    path.join(TEMP_JSON_FOLDER, "county-soil-data.json"),
    JSON.stringify(countyData, null, 2)
  );

  return {
    countyData,
    associationDetails,
  };
}

// Step 3: Compile gardening-relevant soil characteristics
async function compileGardeningRelevantData(
  soilClassificationData,
  countyAssociationDetails
) {
  // Define soil types of interest for gardening with expanded data and practical gardening information
  const gardeningRelevantSoilTypes = {
    "brown-earth": {
      name: "Brown Earth",
      description:
        "Fertile, well-drained soils with good agricultural potential, common in the midlands and east",
      ph: { min: 5.5, max: 7.0 },
      texture: "Loamy",
      nutrients: "High",
      drainage: "Good",
      drainageDetails: {
        level: ENHANCED_DRAINAGE_INFO["Well"].level,
        description: ENHANCED_DRAINAGE_INFO["Well"].description,
        characteristics: ENHANCED_DRAINAGE_INFO["Well"].characteristics,
        management: ENHANCED_DRAINAGE_INFO["Well"].management,
      },
      gardeningNotes:
        "Excellent for most garden plants and vegetables. Generally needs minimal amendment.",
      suitablePlants: [
        "Most vegetables",
        "Roses",
        "Fruit trees",
        "Herbaceous perennials",
      ],
      challenges: [
        "Can dry out in summer if sandy",
        "May need organic matter to maintain fertility",
      ],
      bestPractices: [
        "Annual addition of compost to maintain fertility",
        "Mulch to retain moisture in summer",
        "Standard crop rotation practices work well",
      ],
    },
    "grey-brown-podzolic": {
      name: "Grey-Brown Podzolic",
      description:
        "Good quality agricultural soils found in eastern and southern parts of Ireland",
      ph: { min: 5.0, max: 6.5 },
      texture: "Clay Loam",
      nutrients: "Medium",
      drainage: "Moderate",
      drainageDetails: {
        level: ENHANCED_DRAINAGE_INFO["Moderate"].level,
        description: ENHANCED_DRAINAGE_INFO["Moderate"].description,
        characteristics: ENHANCED_DRAINAGE_INFO["Moderate"].characteristics,
        management: ENHANCED_DRAINAGE_INFO["Moderate"].management,
      },
      gardeningNotes:
        "Good all-purpose garden soil. May benefit from organic matter addition to improve structure.",
      suitablePlants: [
        "Most vegetables",
        "Brassicas",
        "Beans",
        "Ornamental shrubs",
      ],
      challenges: [
        "Can be somewhat heavy when wet",
        "May compact if worked when too wet",
      ],
      bestPractices: [
        "Add organic matter to improve structure",
        "Light liming every few years may be beneficial",
        "Avoid digging when soil is wet",
      ],
    },
    gley: {
      name: "Gley",
      description:
        "Poorly drained soils found in low-lying areas with high water tables",
      ph: { min: 4.5, max: 6.0 },
      texture: "Clay",
      nutrients: "Variable",
      drainage: "Poor",
      drainageDetails: {
        level: ENHANCED_DRAINAGE_INFO["Poor"].level,
        description: ENHANCED_DRAINAGE_INFO["Poor"].description,
        characteristics: ENHANCED_DRAINAGE_INFO["Poor"].characteristics,
        management: ENHANCED_DRAINAGE_INFO["Poor"].management,
      },
      gardeningNotes:
        "Challenging for gardening. Raised beds and drainage improvements strongly recommended.",
      suitablePlants: [
        "Moisture-loving plants",
        "Some brassicas",
        "Willow",
        "Dogwood",
      ],
      challenges: [
        "Poor drainage",
        "Late to warm in spring",
        "Limited workability",
        "Prone to compaction",
      ],
      bestPractices: [
        "Use raised beds",
        "Add plenty of organic matter to improve structure",
        "Plant late spring crops rather than early ones",
        "Add grit or sand to improve drainage",
      ],
    },
    peat: {
      name: "Peat",
      description:
        "Organic soils formed in wetland conditions, typically acidic and low in nutrients",
      ph: { min: 3.5, max: 5.5 },
      texture: "Organic",
      nutrients: "Low",
      drainage: "Poor to Very Poor",
      drainageDetails: {
        level: ENHANCED_DRAINAGE_INFO["Very Poor"].level,
        description: ENHANCED_DRAINAGE_INFO["Very Poor"].description,
        characteristics: ENHANCED_DRAINAGE_INFO["Very Poor"].characteristics,
        management: ENHANCED_DRAINAGE_INFO["Very Poor"].management,
      },
      gardeningNotes:
        "Good for acid-loving plants. Usually needs lime and mineral supplements for vegetables.",
      suitablePlants: ["Rhododendrons", "Azaleas", "Blueberries", "Heathers"],
      challenges: [
        "Very acidic",
        "Low in minerals",
        "Can become hydrophobic when dry",
        "Poor drainage",
      ],
      bestPractices: [
        "Add lime for most vegetables",
        "Apply mineral fertilizers or rock dust",
        "Improve drainage with raised beds for most plants",
        "No additional organic matter needed",
      ],
    },
    "acid-brown-earth": {
      name: "Acid Brown Earth",
      description:
        "Acidic soils often found in areas with granitic or sandstone parent material",
      ph: { min: 4.5, max: 5.5 },
      texture: "Sandy Loam",
      nutrients: "Low",
      drainage: "Good",
      drainageDetails: {
        level: ENHANCED_DRAINAGE_INFO["Well"].level,
        description: ENHANCED_DRAINAGE_INFO["Well"].description,
        characteristics: ENHANCED_DRAINAGE_INFO["Well"].characteristics,
        management: ENHANCED_DRAINAGE_INFO["Well"].management,
      },
      gardeningNotes:
        "Good for ericaceous plants like rhododendrons. Needs lime for most vegetables.",
      suitablePlants: ["Rhododendrons", "Camellias", "Potatoes", "Blueberries"],
      challenges: [
        "Acidity limits plant choices",
        "Often low in nutrients",
        "May drain too freely in some areas",
      ],
      bestPractices: [
        "Add lime for most vegetables and flowering plants",
        "Apply organic matter to improve nutrient content",
        "Use acid fertilizers for acid-loving plants",
        "Mulch to retain moisture",
      ],
    },
    "brown-podzolic": {
      name: "Brown Podzolic",
      description:
        "Moderately leached acidic soils common in higher rainfall areas",
      ph: { min: 4.8, max: 5.8 },
      texture: "Sandy Loam to Loam",
      nutrients: "Low to Medium",
      drainage: "Good",
      drainageDetails: {
        level: ENHANCED_DRAINAGE_INFO["Well"].level,
        description: ENHANCED_DRAINAGE_INFO["Well"].description,
        characteristics: ENHANCED_DRAINAGE_INFO["Well"].characteristics,
        management: ENHANCED_DRAINAGE_INFO["Well"].management,
      },
      gardeningNotes:
        "Good structure but may need lime and fertilizers for many garden plants.",
      suitablePlants: ["Potatoes", "Strawberries", "Heathers", "Conifers"],
      challenges: [
        "Acidity",
        "Can be low in nutrients",
        "May leach nutrients in high rainfall",
      ],
      bestPractices: [
        "Regular liming for many garden plants",
        "Apply organic matter to improve nutrient retention",
        "Use organic or slow-release fertilizers",
        "Mulch to prevent nutrient leaching",
      ],
    },
    alluvial: {
      name: "Alluvial",
      description:
        "Young soils formed from river deposits, usually fertile but can vary greatly",
      ph: { min: 5.0, max: 7.5 },
      texture: "Variable (often silty)",
      nutrients: "High",
      drainage: "Variable",
      drainageDetails: {
        level: ENHANCED_DRAINAGE_INFO["Imperfect"].level,
        description:
          "Varies widely depending on location and floodplain position",
        characteristics: [
          "Drainage varies based on position in floodplain",
          "Often silty with layered structure",
          "May have high water table in winter",
          "Subject to periodic flooding in some areas",
        ],
        management: [
          "Assess local drainage conditions carefully",
          "Consider raised beds in lower areas",
          "Take advantage of natural fertility",
          "Choose plants based on specific site conditions",
        ],
      },
      gardeningNotes:
        "Often excellent for gardening but may need drainage improvements in some areas.",
      suitablePlants: [
        "Most vegetables",
        "Soft fruits",
        "Moisture-loving plants",
      ],
      challenges: [
        "Can be prone to waterlogging",
        "Texture can vary widely",
        "May flood in some areas",
      ],
      bestPractices: [
        "Check drainage and improve if needed",
        "Raised beds in areas prone to flooding",
        "Take advantage of natural fertility",
      ],
    },
    rendzina: {
      name: "Rendzina",
      description: "Shallow, calcareous soils formed over limestone",
      ph: { min: 6.5, max: 8.0 },
      texture: "Loamy",
      nutrients: "Medium to High",
      drainage: "Good but shallow",
      drainageDetails: {
        level: ENHANCED_DRAINAGE_INFO["Well"].level,
        description:
          "Good internal drainage but limited by shallow depth to bedrock",
        characteristics: [
          "Water drains easily through the profile",
          "Limited water storage due to shallow depth",
          "Limestone bedrock may have fissures affecting drainage",
          "Prone to drought in summer",
        ],
        management: [
          "Add organic matter to increase water retention",
          "Use mulch extensively to conserve moisture",
          "Choose shallow-rooted or drought-tolerant plants",
          "Consider irrigation during dry periods",
        ],
      },
      gardeningNotes:
        "May be shallow with limestone bedrock. Good for lime-loving plants.",
      suitablePlants: [
        "Brassicas",
        "Mediterranean herbs",
        "Lavender",
        "Clematis",
      ],
      challenges: [
        "Shallow depth",
        "Can dry out quickly",
        "May be too alkaline for some plants",
      ],
      bestPractices: [
        "Build up soil depth with organic matter",
        "Use raised beds for deep-rooted plants",
        "Choose shallow-rooted plants",
        "Mulch to retain moisture",
      ],
    },
    podzol: {
      name: "Podzol",
      description: "Highly leached acidic soils with distinct layering",
      ph: { min: 3.5, max: 5.0 },
      texture: "Sandy",
      nutrients: "Very Low",
      drainage: "Good to Excessive",
      drainageDetails: {
        level: ENHANCED_DRAINAGE_INFO["Excessive"].level,
        description: ENHANCED_DRAINAGE_INFO["Excessive"].description,
        characteristics: [
          "Very rapid drainage in upper horizons",
          "May have iron pan that impedes drainage at depth",
          "Prone to extreme dryness in summer",
          "Very limited water retention",
        ],
        management: [
          "Add substantial organic matter to improve water retention",
          "Heavy mulching recommended",
          "Break up iron pan if present to improve deep drainage",
          "Select drought-tolerant plants or provide irrigation",
        ],
      },
      gardeningNotes:
        "Very acidic and low in nutrients. Requires significant amendment for most garden plants.",
      suitablePlants: ["Heathers", "Rhododendrons", "Conifers", "Bilberries"],
      challenges: [
        "Very acidic",
        "Very low fertility",
        "Excessive drainage",
        "Iron pan may impede roots",
      ],
      bestPractices: [
        "Add lime for most garden plants",
        "Incorporate large amounts of organic matter",
        "Regular fertilization needed",
        "Break up iron pan if present",
      ],
    },
  };

  // Map counties to appropriate soil types based on association characteristics
  const countyMapping = {};

  for (const [countyName, data] of Object.entries(
    countyAssociationDetails.countyData
  )) {
    let soilType = "unknown";
    const associationName = (data.associationName || "").toLowerCase();
    const drainageClass = (data.drainageClass || "").toLowerCase();
    const textureType = (data.textureType || "").toLowerCase();
    const associationUnit = data.associationUnit;

    // Determine soil type based on association characteristics
    if (
      associationUnit === "1xx" ||
      associationName.includes("peat") ||
      associationName.includes("bog")
    ) {
      soilType = "peat";
    } else if (
      drainageClass.includes("poor") ||
      associationName.includes("gley")
    ) {
      soilType = "gley";
    } else if (
      associationName.includes("podzol") &&
      !associationName.includes("grey") &&
      !associationName.includes("brown")
    ) {
      soilType = "podzol";
    } else if (
      (associationName.includes("brown") &&
        associationName.includes("podzol")) ||
      (associationUnit && associationUnit.startsWith("09"))
    ) {
      soilType = "brown-podzolic";
    } else if (
      associationName.includes("grey") &&
      associationName.includes("podzol")
    ) {
      soilType = "grey-brown-podzolic";
    } else if (
      associationName.includes("brown earth") ||
      (associationUnit &&
        (associationUnit.startsWith("11") || associationUnit.startsWith("09")))
    ) {
      soilType = "brown-earth";
    } else if (
      associationName.includes("acid") &&
      associationName.includes("brown")
    ) {
      soilType = "acid-brown-earth";
    } else if (
      associationName.includes("alluvial") ||
      associationUnit.startsWith("05")
    ) {
      soilType = "alluvial";
    } else if (
      associationName.includes("rendzina") ||
      associationUnit.startsWith("03")
    ) {
      soilType = "rendzina";
    } else {
      // Default mappings based on county knowledge when specific data is unclear
      const defaultSoilTypes = {
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
      };

      soilType = defaultSoilTypes[countyName] || "brown-earth";
    }

    // Store the mapping with detailed info
    countyMapping[countyName] = {
      soilType,
      displayName: data.displayName,
      associationName: data.associationName,
      associationUnit: data.associationUnit,
      drainageClass: data.drainageClass,
      drainageInfo: data.drainageInfo,
      textureType: data.textureType,
      mainSeriesId: data.mainSeriesId,
      mainSeriesName: data.mainSeriesName,
    };
  }

  // Add default for fallback
  countyMapping.default = {
    soilType: "brown-earth",
    displayName: "Default",
    associationName: "Generic Irish Soil",
    associationUnit: "1000a",
    drainageClass: "Moderate",
    drainageInfo: ENHANCED_DRAINAGE_INFO["Moderate"],
    textureType: "Loam",
    mainSeriesId: "1000ET",
    mainSeriesName: "Elton",
  };

  // Save compiled data to temp file
  await fs.writeFile(
    path.join(TEMP_JSON_FOLDER, "compiled-gardening-soil-data.json"),
    JSON.stringify(
      {
        soilTypes: gardeningRelevantSoilTypes,
        countyMapping,
        drainageClasses: ENHANCED_DRAINAGE_INFO,
      },
      null,
      2
    )
  );

  return {
    soilTypes: gardeningRelevantSoilTypes,
    countyMapping,
    drainageClasses: ENHANCED_DRAINAGE_INFO,
  };
}

// Step 4: Generate soil recommendations for gardening
function generateSoilRecommendations() {
  // Generate gardening-specific recommendations for each soil type
  return {
    "brown-earth": [
      "Excellent soil for most vegetables and flowers",
      "Apply compost annually to maintain organic matter content",
      "Minimal lime needed unless growing acid-loving plants",
      "Good for root vegetables like carrots and potatoes",
      "Minimal soil preparation needed beyond regular cultivation",
    ],
    "grey-brown-podzolic": [
      "Good all-purpose garden soil for most vegetables and herbs",
      "Add organic matter annually to improve structure",
      "Light liming may be needed every few years",
      "Good for brassicas, beans, and most garden plants",
      "Mulch to conserve moisture in summer",
    ],
    gley: [
      "Install drainage channels or pipes before planting",
      "Use raised beds with at least 30cm height for vegetables",
      "Add plenty of grit and organic matter to improve structure",
      "Avoid digging or cultivating when soil is wet",
      "Consider planting trees on mounds to prevent root rot",
      "Choose moisture-tolerant plants or focus on late summer crops",
    ],
    peat: [
      "Excellent for acid-loving plants like blueberries and rhododendrons",
      "Add lime for most vegetable crops to raise pH",
      "Add rock dust, seaweed, or mineral fertilizers to provide trace elements",
      "No need for additional organic matter",
      "Be careful with watering as it can dry out in summer despite appearance",
    ],
    "acid-brown-earth": [
      "Add lime for most vegetable crops",
      "Perfect for acid-loving plants if left untreated",
      "Add organic matter to improve nutrient content",
      "Consider using raised beds for vegetables",
      "Good for potatoes which prefer slightly acidic conditions",
    ],
    "brown-podzolic": [
      "Add organic matter to improve water and nutrient retention",
      "Light liming is beneficial for most vegetables",
      "Good for acid-loving plants like rhododendrons if unlimed",
      "Mulch heavily to maintain moisture levels",
      "Add balanced fertilizers as nutrient levels are often moderate",
    ],
    alluvial: [
      "Often naturally fertile, requiring less fertilizer",
      "Check drainage - some alluvial soils can be prone to waterlogging",
      "Good for most vegetables and garden plants",
      "May contain valuable minerals from river deposits",
      "Monitor moisture levels as texture can vary considerably",
    ],
    rendzina: [
      "Good for plants that prefer alkaline conditions like brassicas",
      "Add organic matter to improve depth and water retention",
      "Choose shallow-rooted plants if soil is very thin",
      "No lime needed - already calcium-rich",
      "Consider raised beds to increase soil depth",
    ],
    podzol: [
      "Requires significant improvement for most gardening",
      "Add lime to raise pH for most vegetables",
      "Incorporate large amounts of organic matter",
      "Good for acid-loving plants if left untreated",
      "Regular applications of balanced fertilizers needed",
    ],
    default: [
      "Test your soil pH and amend accordingly",
      "Add organic matter annually to improve soil structure",
      "Consider raised beds if drainage is poor",
      "Use mulch to conserve moisture and suppress weeds",
      "Choose plants suited to your local conditions",
    ],
  };
}

// Generate JavaScript module for the soil data
function generateJavaScriptModule(soilData) {
  return `// src/data/irish-soil-data.js
// Irish soil types and county mappings for gardening applications
// Data sourced from Irish Soil Information System (Teagasc)
// Generated on ${new Date().toISOString().split("T")[0]}

// Irish soil types relevant for gardening with detailed characteristics
export const IRISH_SOIL_TYPES = ${JSON.stringify(soilData.soilTypes, null, 2)};

// County to dominant soil type mapping
export const COUNTY_SOIL_MAPPING = ${JSON.stringify(
    Object.entries(soilData.countyMapping).reduce((acc, [county, data]) => {
      acc[county] = data.soilType;
      return acc;
    }, {}),
    null,
    2
  )};

// Gardening recommendations by soil type
export const SOIL_RECOMMENDATIONS = ${JSON.stringify(
    soilData.soilRecommendations,
    null,
    2
  )};

// Detailed drainage classifications for Irish soils
export const DRAINAGE_CLASSIFICATIONS = ${JSON.stringify(
    soilData.drainageClasses,
    null,
    2
  )};

// Teagasc API endpoints (for reference)
export const TEAGASC_API_ENDPOINTS = {
  allAssociations: "http://gis.teagasc.ie/soils/services/get_all_associations.php",
  allSeries: "http://gis.teagasc.ie/soils/services/get_all_series.php",
  associationDetails: "http://gis.teagasc.ie/soils/get_associations.php?assoc_id=",
  seriesDetails: "http://gis.teagasc.ie/soils/get_series_full.php?series_code=",
};

// Selected soil associations data from Teagasc
export const TEAGASC_SOIL_ASSOCIATIONS = ${JSON.stringify(
    soilData.soilAssociations,
    null,
    2
  )};

// Selected soil series data from Teagasc
export const TEAGASC_SOIL_SERIES = ${JSON.stringify(
    soilData.soilSeries,
    null,
    2
  )};

// Detailed mapping of Irish counties to soil characteristics
export const LOCATION_TO_TEAGASC_MAPPING = ${JSON.stringify(
    soilData.countyMapping,
    null,
    2
  )};
`;
}

// Run the fetch function
fetchIrishSoilData().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
