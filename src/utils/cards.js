// src/utils/cards.js
import { plants } from "../data/plants";
import { gardeningTasks } from "../data/gardening-tasks";
import {
  getSoilDataByLocation,
  getSoilTypeInformation,
} from "../utils/soil-client";

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
export const samplePlants = plants.slice(0, 5);
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
  // Limit to 6 plants to avoid overwhelming the UI
  const limitedPlants = samplePlants.slice(0, 6);

  // Return plants as cards
  return limitedPlants.map((plant) => ({
    type: CARD_TYPES.PLANT,
    data: plant,
  }));
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

  // For now, return a subset of our sample data
  switch (cardType) {
    case CARD_TYPES.PLANT:
      return samplePlants
        .slice(0, limit)
        .map((plant) => ({ type: CARD_TYPES.PLANT, data: plant }));

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
