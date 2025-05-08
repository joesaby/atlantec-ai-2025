// src/utils/ai-client.js
// Unified client for AI services (OpenAI and Vertex AI)

/**
 * This module provides a unified interface for AI services,
 * allowing the application to switch between OpenAI and Vertex AI
 * based on configuration.
 */

// Dynamic imports based on environment configuration
let client = null;

/**
 * Initialize the AI client based on environment configuration
 * @returns {Promise<Object>} The initialized AI client
 */
export async function initializeAIClient() {
  // Determine which client to use based on environment variable
  const useVertexAI = import.meta.env.USE_VERTEX_AI === 'true';
  
  if (useVertexAI) {
    // Use Vertex AI
    const { 
      generateVertexResponse, 
      processGardeningQueryWithVertex,
      countTokens 
    } = await import('./vertex-client.js');
    
    client = {
      generateChatResponse: generateVertexResponse,
      processGardeningQuery: processGardeningQueryWithVertex,
      countTokens,
      provider: 'vertex'
    };
  } else {
    // Use OpenAI (default)
    const { 
      generateChatResponse, 
      processGardeningQuery 
    } = await import('./openai-client.js');
    
    client = {
      generateChatResponse,
      processGardeningQuery,
      countTokens: async () => 0, // OpenAI client doesn't have this yet
      provider: 'openai'
    };
  }
  
  return client;
}

/**
 * Get the current AI client (initializes if needed)
 * @returns {Promise<Object>} The AI client
 */
export async function getAIClient() {
  if (!client) {
    client = await initializeAIClient();
  }
  return client;
}

/**
 * Process a gardening query using the configured AI provider
 * @param {string} query - The user's gardening question
 * @param {Array} conversationHistory - Previous messages for context
 * @returns {Promise<Object>} - Structured response with content and optional cards
 */
export async function processQuery(query, conversationHistory = []) {
  const aiClient = await getAIClient();
  return aiClient.processGardeningQuery(query, conversationHistory);
}

/**
 * Generate a chat response using the configured AI provider
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} options - Optional parameters for the API call
 * @returns {Promise<string>} - The text response from the model
 */
export async function generateResponse(messages, options = {}) {
  const aiClient = await getAIClient();
  return aiClient.generateChatResponse(messages, options);
}

/**
 * Get information about the current AI provider
 * @returns {Promise<Object>} Information about the current provider
 */
export async function getProviderInfo() {
  const aiClient = await getAIClient();
  return {
    provider: aiClient.provider,
    model: aiClient.provider === 'vertex' 
      ? (import.meta.env.VERTEX_MODEL || 'gemini-1.0-pro')
      : (import.meta.env.OPENAI_MODEL || 'gpt-4-turbo')
  };
}

export default {
  initializeAIClient,
  getAIClient,
  processQuery,
  generateResponse,
  getProviderInfo
};