// src/utils/cards.js
import { samplePlants } from '../data/plants';
import { sampleTasks } from '../data/gardening-tasks';

/**
 * Card types supported by the system
 */
export const CARD_TYPES = {
  PLANT: 'plant',
  TASK: 'task',
  SOIL: 'soil',
  SUSTAINABILITY: 'sustainability'
};

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
  // For now, return all sample plants
  // In a more advanced implementation, this would filter plants based on the query
  return samplePlants.map(plant => ({ 
    type: CARD_TYPES.PLANT, 
    data: plant 
  }));
}

/**
 * Returns task cards based on the query and LLM response
 * @param {string} query - The user's original query
 * @param {string} content - The text content of the LLM response
 * @returns {Array} - Array of task card objects
 */
function getTaskCards(query, content) {
  // For now, return all sample tasks
  // In a more advanced implementation, this would filter tasks based on the query
  return sampleTasks.map(task => ({ 
    type: CARD_TYPES.TASK, 
    data: task 
  }));
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
        .map(plant => ({ type: CARD_TYPES.PLANT, data: plant }));
    
    case CARD_TYPES.TASK:
      return sampleTasks
        .slice(0, limit)
        .map(task => ({ type: CARD_TYPES.TASK, data: task }));
    
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
  if (intentData.intent === 'seasonal_planting') {
    const season = intentData.season || 'spring';
    // Filter plants by season
    return samplePlants
      .filter(plant => plant.floweringSeason?.toLowerCase().includes(season))
      .map(plant => ({ type: CARD_TYPES.PLANT, data: plant }));
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
          commonName: data.name || 'Custom Plant',
          latinName: data.latinName || '',
          description: data.description || '',
          waterNeeds: data.waterNeeds || 'Medium',
          sunNeeds: data.sunNeeds || 'Partial Sun',
          soilPreference: data.soilPreference || 'Well-draining',
          nativeToIreland: data.nativeToIreland || false,
          isPerennial: data.isPerennial || false,
          imageUrl: data.imageUrl || '/images/plants/wildflowers.jpg', // Default image
          sustainabilityRating: data.sustainabilityRating || 3,
          biodiversityValue: data.biodiversityValue || 3
        }
      };
      
    case CARD_TYPES.TASK:
      return {
        type,
        data: {
          id,
          title: data.title || 'Custom Task',
          description: data.description || '',
          category: data.category || 'Maintenance',
          priority: data.priority || 'Medium'
        }
      };
      
    default:
      return { type, data: { id, ...data } };
  }
}