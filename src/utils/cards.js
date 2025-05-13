// src/utils/cards.js
import { plants } from "../data/plants";
import { gardeningTasks } from "../data/gardening-tasks";
import { calculateCarbonSavings } from "../utils/carbon-footprint";
import { foodCarbonFootprint } from "../data/sustainability-metrics";

/**
 * Card types supported by the system
 */
export const CARD_TYPES = {
  PLANT: "plant",
  TASK: "task",
  SOIL: "soil",
  SUSTAINABILITY: "sustainability",
};

// Sample data for card selection
// In a production environment, these would be fetched from a database
export const samplePlants = plants;
export const sampleTasks = gardeningTasks
  .flatMap((month) => month.tasks)
  .slice(0, 5);

// Sample soil types for soil cards
export const sampleSoilTypes = [
  "brown-earth",
  "grey-brown-podzolic",
  "gley",
  "peat",
  "acid-brown-earth",
];

/**
 * Selects appropriate cards to display based on the query and LLM response
 * @param {string} query - The user's original query
 * @param {object} llmResponse - The structured response from the LLM
 * @param {string} llmResponse.content - The text content of the response
 * @param {string} llmResponse.cardType - The type of card to show (if any)
 * @returns {Array} - Array of card objects to display
 */
export function selectCardsForResponse(query, llmResponse) {
  const { content, cardType } = llmResponse;
  let cards = [];

  // If not sustainability or no sustainability cards created, proceed with normal card selection
  switch (cardType) {
    case CARD_TYPES.PLANT:
      cards = getPlantCards(query, content);
      break;
    case CARD_TYPES.TASK:
      cards = getTaskCards(query, content);
      break;
    case CARD_TYPES.SOIL:
      cards = getSoilCards(query, content);
      break;
    case CARD_TYPES.SUSTAINABILITY:
      cards = getSustainabilityCards(query, content);
      break;
    default:
      // No cards to display
      break;
  }

  return cards;
}

/**
 * Returns plant cards based on the query and LLM response
 * @param {string} query - The user's original query
 * @param {string} content - The text content of the LLM response
 * @returns {Array} - Array of plant card objects
 */
function getPlantCards(query, content) {
  const combinedText = (query + " " + content).toLowerCase();

  // Check for specific plant type requests
  const isFlowerRequest = hasFlowerKeywords(combinedText);
  const isVegetableRequest = hasVegetableKeywords(combinedText);
  const isFruitRequest = hasFruitKeywords(combinedText);

  // Filter plants based on request type
  let filteredPlants = samplePlants;

  if (isFlowerRequest && !isVegetableRequest && !isFruitRequest) {
    // Show only flowering plants
    filteredPlants = samplePlants.filter((plant) => isFloweringPlant(plant));
    console.log(
      `Filtering for flowers only: Found ${filteredPlants.length} flowering plants`
    );
  } else if (isVegetableRequest && !isFlowerRequest && !isFruitRequest) {
    // Show only vegetable plants
    filteredPlants = samplePlants.filter((plant) => isVegetablePlant(plant));
    console.log(
      `Filtering for vegetables only: Found ${filteredPlants.length} vegetable plants`
    );
  } else if (isFruitRequest && !isFlowerRequest && !isVegetableRequest) {
    // Show only fruit plants
    filteredPlants = samplePlants.filter((plant) => isFruitPlant(plant));
    console.log(
      `Filtering for fruits only: Found ${filteredPlants.length} fruit plants`
    );
  } else if (isVegetableRequest && isFruitRequest && !isFlowerRequest) {
    // Show edible plants (both fruits and vegetables)
    filteredPlants = samplePlants.filter(
      (plant) => isVegetablePlant(plant) || isFruitPlant(plant)
    );
    console.log(
      `Filtering for edible plants: Found ${filteredPlants.length} edible plants`
    );
  }

  // Limit to 6 plants to avoid overwhelming the UI
  const limitedPlants = filteredPlants.slice(0, 6);

  // Return plants as cards
  return limitedPlants.map((plant) => ({
    type: CARD_TYPES.PLANT,
    data: plant,
  }));
}

/**
 * Checks if text contains flower-related keywords
 * @param {string} text - Text to analyze
 * @returns {boolean} - Whether the text is flower-related
 */
function hasFlowerKeywords(text) {
  const flowerKeywords = [
    "flower",
    "flowers",
    "flowering",
    "bloom",
    "blooms",
    "blooming",
    "wildflower",
    "ornamental",
    "decorative plant",
    "garden flower",
    "floral",
    "bouquet",
    "pollinator",
    "hydrangea",
    "fuchsia",
    "foxglove",
    "primrose",
    "heather",
  ];

  return flowerKeywords.some((keyword) => text.includes(keyword));
}

/**
 * Checks if text contains vegetable-related keywords
 * @param {string} text - Text to analyze
 * @returns {boolean} - Whether the text is vegetable-related
 */
function hasVegetableKeywords(text) {
  const vegetableKeywords = [
    "vegetable",
    "vegetables",
    "veg",
    "veggies",
    "edible",
    "crop",
    "crops",
    "veggie",
    "veg patch",
    "potato",
    "cabbage",
    "carrot",
    "onion",
    "leek",
    "kale",
  ];

  return vegetableKeywords.some((keyword) => text.includes(keyword));
}

/**
 * Checks if text contains fruit-related keywords
 * @param {string} text - Text to analyze
 * @returns {boolean} - Whether the text is fruit-related
 */
function hasFruitKeywords(text) {
  const fruitKeywords = [
    "fruit",
    "fruits",
    "berry",
    "berries",
    "orchard",
    "apple",
    "strawberry",
    "blackberry",
    "rhubarb",
    "raspberry",
    "gooseberry",
    "soft fruit",
  ];

  return fruitKeywords.some((keyword) => text.includes(keyword));
}

/**
 * Determines if a plant is a flowering/ornamental plant
 * @param {Object} plant - Plant object
 * @returns {boolean} - Whether the plant is a flowering plant
 */
function isFloweringPlant(plant) {
  // Check for flowering indicators
  if (plant.floweringSeason && !plant.harvestSeason) return true;

  // Check for wildflowers, native plants with biodiversity value
  if (
    plant.nativeToIreland &&
    plant.biodiversityValue >= 4 &&
    !plant.harvestSeason
  )
    return true;

  // Check name for flower indicators
  const flowerIndicators = [
    "flower",
    "wildflower",
    "primrose",
    "foxglove",
    "fuchsia",
    "hydrangea",
    "heather",
  ];
  if (
    flowerIndicators.some((indicator) =>
      plant.commonName.toLowerCase().includes(indicator)
    )
  )
    return true;

  return false;
}

/**
 * Determines if a plant is a vegetable/edible plant
 * @param {Object} plant - Plant object
 * @returns {boolean} - Whether the plant is a vegetable plant
 */
function isVegetablePlant(plant) {
  // First check if this is a fruit - if so, it's not a vegetable
  if (isFruitPlant(plant)) return false;

  // Check for harvest indicators (vegetables have harvest seasons)
  if (plant.harvestSeason && !plant.floweringSeason) {
    // Explicitly check for vegetable indicators
    const vegetableIndicators = [
      "potato",
      "cabbage",
      "carrot",
      "onion",
      "leek",
      "kale",
    ];
    if (
      vegetableIndicators.some((indicator) =>
        plant.commonName.toLowerCase().includes(indicator)
      )
    )
      return true;
  }

  return false;
}

/**
 * Determines if a plant is a fruit plant
 * @param {Object} plant - Plant object
 * @returns {boolean} - Whether the plant is a fruit plant
 */
function isFruitPlant(plant) {
  if (plant.harvestSeason) {
    // Check for specific fruit indicators
    const fruitIndicators = [
      "apple",
      "berry",
      "fruit",
      "strawberry",
      "blackberry",
      "rhubarb",
      "raspberry",
      "gooseberry",
    ];

    if (
      fruitIndicators.some((indicator) =>
        plant.commonName.toLowerCase().includes(indicator)
      )
    )
      return true;

    // Check for tree fruits
    if (
      plant.commonName.toLowerCase().includes("tree") &&
      !plant.commonName.toLowerCase().includes("oak") &&
      !plant.commonName.toLowerCase().includes("pine")
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Check if the sustainability query is specifically about food growing
 * @param {string} query - The user's query
 * @param {string} content - The LLM response content
 * @returns {boolean} - Whether the query is about food growing sustainability
 */
function isFoodGrowingSustainabilityQuery(query, content) {
  const combinedText = (query + " " + content).toLowerCase();

  // Check for food growing specific terms
  const foodGrowingTerms = [
    "grow your own",
    "growing your own",
    "home grown",
    "homegrown",
    "food miles",
    "growing food",
    "grow vegetables",
    "growing vegetables",
    "vegetable garden",
    "food growing",
    "own crops",
    "garden crops",
  ];

  // Check if any food growing terms are present
  return foodGrowingTerms.some((term) => combinedText.includes(term));
}

/**
 * Returns sustainability cards based on the query and LLM response
 * @param {string} query - The user's original query
 * @param {string} content - The text content of the LLM response
 * @returns {Array} - Array of sustainability card objects
 */
function getSustainabilityCards(query, content) {
  // Check if this is specifically about food growing sustainability
  if (isFoodGrowingSustainabilityQuery(query, content)) {
    return getFoodSustainabilityCards(query, content);
  }

  // Extract plant names and quantities from the query and content
  const extractedPlants = extractPlantsFromContent(query + " " + content);

  if (extractedPlants.length === 0) {
    // If no specific plants were mentioned, use some common Irish garden plants
    const commonPlants = [
      { name: "potato", quantity: 5, isOrganic: true },
      { name: "apple", quantity: 1, isOrganic: true },
      { name: "kale", quantity: 3, isOrganic: true },
    ];

    return commonPlants.map((plant, index) => ({
      type: CARD_TYPES.SUSTAINABILITY,
      data: {
        id: `sustainability_${plant.name}_${index}`,
        plantName: plant.name,
        quantity: plant.quantity,
        isOrganic: plant.isOrganic,
        showDetailedBreakdown: index === 0, // Show detailed breakdown just for the first plant
      },
    }));
  }

  // Create sustainability cards for each extracted plant
  return extractedPlants.map((plant, index) => ({
    type: CARD_TYPES.SUSTAINABILITY,
    data: {
      id: `sustainability_${plant.name}_${index}`,
      plantName: plant.name,
      quantity: plant.quantity || 1,
      isOrganic: plant.isOrganic !== false,
      showDetailedBreakdown: index === 0, // Show detailed breakdown just for the first plant
    },
  }));
}

/**
 * Returns food growing sustainability cards with enhanced metrics
 * @param {string} query - The user's original query
 * @param {string} content - The text content of the LLM response
 * @returns {Array} - Array of food sustainability card objects
 */
function getFoodSustainabilityCards(query, content) {
  const combinedText = (query + " " + content).toLowerCase();
  const cards = [];

  // Extract garden area if mentioned (in square meters)
  let gardenArea = null;
  const areaMatches = combinedText.match(
    /(\d+)\s*(?:square\s*meters?|sq\.?\s*m\.?|m2|m²)/i
  );
  if (areaMatches && areaMatches[1]) {
    gardenArea = parseInt(areaMatches[1], 10);
  }

  // Extract specific crops if mentioned
  const specificCrops = [];

  Object.keys(foodCarbonFootprint.storeBought).forEach((crop) => {
    if (combinedText.includes(crop)) {
      // Try to extract quantity
      let quantity = 1;
      const qtyMatches = combinedText.match(
        new RegExp(`(\\d+)\\s+(?:kg of |kilos? of |pounds? of )?${crop}s?`, "i")
      );

      if (qtyMatches && qtyMatches[1]) {
        quantity = parseInt(qtyMatches[1], 10);
      }

      specificCrops.push({
        crop,
        quantity,
      });
    }
  });

  // Create cards based on the extracted information
  if (specificCrops.length > 0) {
    // Create a card for each specific crop mentioned
    specificCrops.forEach((cropInfo, index) => {
      cards.push({
        type: CARD_TYPES.SUSTAINABILITY,
        data: {
          id: `food_sustainability_${cropInfo.crop}_${index}`,
          isFoodSustainability: true,
          crop: cropInfo.crop,
          quantity: cropInfo.quantity,
        },
      });
    });
  } else {
    // If no specific crops were mentioned, create a general food growing sustainability card
    cards.push({
      type: CARD_TYPES.SUSTAINABILITY,
      data: {
        id: `food_sustainability_general_${Date.now()}`,
        isFoodSustainability: true,
        gardenArea: gardenArea || 10, // Default to 10m² if not specified
      },
    });
  }

  return cards;
}

/**
 * Extract plant names and quantities from content
 * @param {string} content - The content to analyze
 * @returns {Array} - Array of plant objects with name and quantity
 */
function extractPlantsFromContent(content) {
  const plants = [];
  const lowerContent = content.toLowerCase();

  // Common garden plants to look for in Irish gardens
  const commonPlants = [
    "potato",
    "carrot",
    "onion",
    "leek",
    "garlic",
    "cabbage",
    "lettuce",
    "spinach",
    "kale",
    "tomato",
    "pepper",
    "courgette",
    "cucumber",
    "pea",
    "bean",
    "strawberry",
    "raspberry",
    "blackberry",
    "apple",
    "pear",
    "rhubarb",
    "broccoli",
    "cauliflower",
    "parsnip",
  ];

  // Check for presence of each plant
  for (const plant of commonPlants) {
    if (lowerContent.includes(plant)) {
      // Try to find quantity
      let quantity = 1;

      // Look for patterns like "5 potatoes" or "ten apple trees"
      const numberWords = {
        one: 1,
        two: 2,
        three: 3,
        four: 4,
        five: 5,
        six: 6,
        seven: 7,
        eight: 8,
        nine: 9,
        ten: 10,
      };

      // Check for numeric quantities
      const regexDigit = new RegExp(`(\\d+)\\s+${plant}s?`, "i");
      const digitMatch = lowerContent.match(regexDigit);

      if (digitMatch && digitMatch[1]) {
        quantity = parseInt(digitMatch[1], 10);
      } else {
        // Check for word quantities
        for (const [word, value] of Object.entries(numberWords)) {
          const regexWord = new RegExp(`${word}\\s+${plant}s?`, "i");
          if (lowerContent.match(regexWord)) {
            quantity = value;
            break;
          }
        }
      }

      // Check if organic is mentioned
      const isOrganic =
        !lowerContent.includes(`non-organic ${plant}`) &&
        !lowerContent.includes(`conventional ${plant}`);

      plants.push({ name: plant, quantity, isOrganic });
    }
  }

  return plants;
}

/**
 * Returns task cards based on the query and LLM response
 * @param {string} query - The user's original query
 * @param {string} content - The text content of the LLM response
 * @returns {Array} - Array of task card objects
 */
function getTaskCards(query, content) {
  // Get the current month
  const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-indexed

  // Extract relevant task information from the content
  const taskCategories = extractTasksFromContent(content);

  // If we were able to extract tasks from the content, create cards for them
  if (taskCategories.length > 0) {
    return taskCategories.map((category, index) => ({
      type: CARD_TYPES.TASK,
      data: {
        id: `extracted_task_${index}`,
        title: category.title,
        description: category.description,
        category: determineTaskCategory(category.title),
        priority: "Medium", // Default priority
      },
    }));
  }

  // If we couldn't extract tasks, use the gardeningTasks data
  // Find tasks for the current month from the original data structure
  const monthData = gardeningTasks.find(
    (month) => month.month === currentMonth
  );

  if (monthData && monthData.tasks && monthData.tasks.length > 0) {
    return monthData.tasks.slice(0, 5).map((task) => ({
      type: CARD_TYPES.TASK,
      data: task,
    }));
  }

  // Fallback to spring tasks if no current month tasks
  const springMonth = 3; // March
  const springData = gardeningTasks.find(
    (month) => month.month === springMonth
  );

  if (springData && springData.tasks) {
    // Select max 5 tasks to avoid overwhelming the UI
    return springData.tasks.slice(0, 5).map((task) => ({
      type: CARD_TYPES.TASK,
      data: task,
    }));
  }

  // If all else fails, return default tasks
  return [
    {
      type: CARD_TYPES.TASK,
      data: {
        id: "default_task_1",
        title: "Weeding",
        description: "Remove weeds regularly before they set seed.",
        category: "Maintenance",
        priority: "High",
      },
    },
    {
      type: CARD_TYPES.TASK,
      data: {
        id: "default_task_2",
        title: "Deadheading",
        description: "Remove faded or dead flowers to encourage more blooms.",
        category: "Maintenance",
        priority: "Medium",
      },
    },
    {
      type: CARD_TYPES.TASK,
      data: {
        id: "default_task_3",
        title: "Watering",
        description:
          "Water deeply and less frequently, rather than shallowly and often.",
        category: "Watering",
        priority: "High",
      },
    },
  ];
}

/**
 * Extract task categories and descriptions from content
 * @param {string} content - The text content to analyze
 * @returns {Array} - Array of task objects with title and description
 */
function extractTasksFromContent(content) {
  const tasks = [];

  // Look for headers (usually in bold with ** markdown)
  const headerMatches = content.match(/\*\*(.*?):\*\*/g);

  if (headerMatches) {
    headerMatches.forEach((match) => {
      const title = match.replace(/\*\*/g, "").replace(":", "");

      // Find text after this header until the next header or double newline
      const pattern = new RegExp(
        `\\*\\*${title}:\\*\\*([\\s\\S]*?)(?=\\*\\*|\\n\\n|$)`,
        "i"
      );
      const descMatch = content.match(pattern);

      if (descMatch && descMatch[1]) {
        const description = descMatch[1].trim();
        tasks.push({ title, description });
      }
    });
  }

  // If no headers with ** were found, look for headers in lists
  if (tasks.length === 0) {
    const listMatches = content.match(/\*\s+(.*?):/g);

    if (listMatches) {
      listMatches.forEach((match) => {
        const title = match.replace(/\*\s+/, "").replace(":", "");

        // Find text after this header until the next list item
        const pattern = new RegExp(
          `\\*\\s+${title}:([\\s\\S]*?)(?=\\*\\s+|\\n\\n|$)`,
          "i"
        );
        const descMatch = content.match(pattern);

        if (descMatch && descMatch[1]) {
          const description = descMatch[1].trim();
          tasks.push({ title, description });
        }
      });
    }
  }

  return tasks;
}

/**
 * Determine the category of a task based on its title
 * @param {string} title - The task title
 * @returns {string} - The category
 */
function determineTaskCategory(title) {
  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes("weed") || lowerTitle.includes("clean")) {
    return "Maintenance";
  }
  if (lowerTitle.includes("water")) {
    return "Watering";
  }
  if (lowerTitle.includes("plant") || lowerTitle.includes("sow")) {
    return "Planting";
  }
  if (lowerTitle.includes("harvest")) {
    return "Harvesting";
  }
  if (lowerTitle.includes("prune") || lowerTitle.includes("deadhead")) {
    return "Pruning";
  }
  if (lowerTitle.includes("pest") || lowerTitle.includes("disease")) {
    return "Pest Control";
  }

  return "Maintenance";
}

/**
 * Returns soil information cards based on the query and LLM response
 * @param {string} query - The user's original query
 * @param {string} content - The text content of the LLM response
 * @returns {Array} - Array of soil card objects
 */
function getSoilCards(query, content) {
  // Extract county or soil type from query or content
  const { county, soilType } = extractSoilInfo(query, content);
  let cards = [];

  // If we have a county, create a card for that county's soil
  if (county) {
    // Get soil data for the county (async, but we'll handle it differently in production)
    // For now, we'll create a card with the structure and rely on the component to fetch data
    cards.push({
      type: CARD_TYPES.SOIL,
      data: {
        id: `soil_county_${county.toLowerCase().replace(/\s+/g, "")}`,
        county: county,
        cardType: "county",
      },
    });
  }

  // If we have specific soil types mentioned, create cards for those
  if (soilType) {
    cards.push({
      type: CARD_TYPES.SOIL,
      data: {
        id: `soil_type_${soilType}`,
        soilType: soilType,
        cardType: "type",
      },
    });
  }

  // If we couldn't extract specific information, provide general soil type cards
  if (cards.length === 0) {
    // Show cards for the most common Irish soil types
    return sampleSoilTypes.slice(0, 3).map((soilType) => ({
      type: CARD_TYPES.SOIL,
      data: {
        id: `soil_type_${soilType}`,
        soilType: soilType,
        cardType: "type",
      },
    }));
  }

  return cards;
}

/**
 * Extract soil information from query and content
 * @param {string} query - The user's query
 * @param {string} content - The LLM response content
 * @returns {Object} - Extracted county and/or soil type
 */
function extractSoilInfo(query, content) {
  const combinedText = `${query} ${content}`.toLowerCase();
  const result = { county: null, soilType: null };

  // County detection - list of Irish counties
  const counties = [
    "antrim",
    "armagh",
    "carlow",
    "cavan",
    "clare",
    "cork",
    "derry",
    "donegal",
    "down",
    "dublin",
    "fermanagh",
    "galway",
    "kerry",
    "kildare",
    "kilkenny",
    "laois",
    "leitrim",
    "limerick",
    "longford",
    "louth",
    "mayo",
    "meath",
    "monaghan",
    "offaly",
    "roscommon",
    "sligo",
    "tipperary",
    "tyrone",
    "waterford",
    "westmeath",
    "wexford",
    "wicklow",
  ];

  // Check for county mentions
  for (const county of counties) {
    if (combinedText.includes(county)) {
      result.county = county.charAt(0).toUpperCase() + county.slice(1);
      break;
    }
  }

  // Check for soil type mentions
  const soilTypes = {
    "brown earth": "brown-earth",
    "brown-earth": "brown-earth",
    "grey brown podzolic": "grey-brown-podzolic",
    "grey-brown podzolic": "grey-brown-podzolic",
    "grey-brown-podzolic": "grey-brown-podzolic",
    gley: "gley",
    peat: "peat",
    bogland: "peat",
    "bog soil": "peat",
    "acid brown earth": "acid-brown-earth",
    "acid-brown earth": "acid-brown-earth",
    "acid-brown-earth": "acid-brown-earth",
  };

  for (const [term, soilTypeCode] of Object.entries(soilTypes)) {
    if (combinedText.includes(term)) {
      result.soilType = soilTypeCode;
      break;
    }
  }

  return result;
}

/**
 * Advanced card selection that uses LLM embedding or keyword extraction
 * to find the most relevant cards for a given query
 * @param {string} query - The user's gardening question
 * @param {string} cardType - The type of card to retrieve
 * @param {number} limit - Maximum number of cards to return
 * @returns {Promise<Array>} - Promise resolving to an array of card objects
 */
export async function getRelevantCards(query, cardType, limit = 3) {
  // This is a placeholder for more advanced card selection logic
  // In a full implementation, this would:
  // 1. Extract keywords from the query
  // 2. Use embeddings to find semantic matches
  // 3. Apply filters for properties mentioned in the query

  switch (cardType) {
    case CARD_TYPES.PLANT: {
      // Apply the same filtering logic as in getPlantCards
      let filteredPlants = samplePlants;
      const isFlowerRequest = hasFlowerKeywords(query);
      const isVegetableRequest = hasVegetableKeywords(query);

      if (isFlowerRequest && !isVegetableRequest) {
        filteredPlants = samplePlants.filter((plant) =>
          isFloweringPlant(plant)
        );
        console.log(
          `Relevant cards: Filtering for flowers only: Found ${filteredPlants.length} flowering plants`
        );
      } else if (isVegetableRequest && !isFlowerRequest) {
        filteredPlants = samplePlants.filter((plant) =>
          isVegetablePlant(plant)
        );
        console.log(
          `Relevant cards: Filtering for vegetables only: Found ${filteredPlants.length} vegetable plants`
        );
      }

      return filteredPlants
        .slice(0, limit)
        .map((plant) => ({ type: CARD_TYPES.PLANT, data: plant }));
    }

    case CARD_TYPES.TASK:
      return sampleTasks
        .slice(0, limit)
        .map((task) => ({ type: CARD_TYPES.TASK, data: task }));

    case CARD_TYPES.SOIL:
      // Extract soil info from query
      const { county, soilType } = extractSoilInfo(query, "");

      if (county) {
        return [
          {
            type: CARD_TYPES.SOIL,
            data: {
              id: `soil_county_${county.toLowerCase().replace(/\s+/g, "")}`,
              county: county,
              cardType: "county",
            },
          },
        ];
      } else if (soilType) {
        return [
          {
            type: CARD_TYPES.SOIL,
            data: {
              id: `soil_type_${soilType}`,
              soilType: soilType,
              cardType: "type",
            },
          },
        ];
      } else {
        // Return a sample of soil types
        return sampleSoilTypes.slice(0, limit).map((soilType) => ({
          type: CARD_TYPES.SOIL,
          data: {
            id: `soil_type_${soilType}`,
            soilType: soilType,
            cardType: "type",
          },
        }));
      }

    default:
      return [];
  }
}

/**
 * Extension point for adding custom card processing logic
 * based on specific user intent detected in queries
 * @param {string} query - The user's query
 * @param {object} intentData - Intent data extracted from the query
 * @returns {Array} - Array of card objects
 */
export function processCardsByIntent(query, intentData) {
  // This could handle specific intents like:
  // - Seasonal planting recommendations
  // - Soil type specific plants
  // - Plants by color or feature
  // - Tasks filtered by difficulty or season

  // Mock implementation for now
  if (intentData.intent === "seasonal_planting") {
    const season = intentData.season || "spring";
    // Filter plants by season
    return samplePlants
      .filter((plant) => plant.floweringSeason?.toLowerCase().includes(season))
      .map((plant) => ({ type: CARD_TYPES.PLANT, data: plant }));
  }

  // Default to empty array if no matching intent
  return [];
}

/**
 * Creates a new custom card from LLM-generated content
 * @param {string} type - The type of card to create
 * @param {object} data - The data for the card
 * @returns {object} - A new card object
 */
export function createCustomCard(type, data) {
  // Generate a unique ID for the card
  const id = `${type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  switch (type) {
    case CARD_TYPES.PLANT:
      return {
        type,
        data: {
          id,
          commonName: data.name || "Custom Plant",
          latinName: data.latinName || "",
          description: data.description || "",
          waterNeeds: data.waterNeeds || "Medium",
          sunNeeds: data.sunNeeds || "Partial Sun",
          soilPreference: data.soilPreference || "Well-draining",
          nativeToIreland: data.nativeToIreland || false,
          isPerennial: data.isPerennial || false,
          imageUrl: data.imageUrl || "/images/plants/wildflowers.jpg", // Default image
          sustainabilityRating: data.sustainabilityRating || 3,
          biodiversityValue: data.biodiversityValue || 3,
        },
      };

    case CARD_TYPES.TASK:
      return {
        type,
        data: {
          id,
          title: data.title || "Custom Task",
          description: data.description || "",
          category: data.category || "Maintenance",
          priority: data.priority || "Medium",
        },
      };

    case CARD_TYPES.SOIL:
      return {
        type,
        data: {
          id,
          soilName: data.soilName || "Unknown Soil Type",
          soilType: data.soilType || "brown-earth",
          description: data.description || "No description available",
          properties: {
            ph: data.ph || { min: 5.0, max: 7.0 },
            texture: data.texture || "Variable",
            nutrients: data.nutrients || "Medium",
            drainage: data.drainage || "Moderate",
          },
          recommendations: data.recommendations || [
            "Test soil pH before planting",
            "Add organic matter to improve soil structure",
            "Consider the drainage requirements of your chosen plants",
          ],
          cardType: data.cardType || "type",
        },
      };

    default:
      return { type, data: { id, ...data } };
  }
}
