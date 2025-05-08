// src/utils/vertex-client.js
// Client for Google Cloud Vertex AI Generative Models

/**
 * This module provides a client for interacting with Google Cloud Vertex AI
 * generative models. It can be used as an alternative to the OpenAI client
 * for garden assistant queries.
 * 
 * Prerequisites:
 * - Google Cloud project with Vertex AI API enabled
 * - Service account with appropriate permissions
 * - Google Cloud credentials configured properly
 * 
 * Install dependencies:
 * npm install @google-cloud/vertexai
 */

import { VertexAI } from '@google-cloud/vertexai';

// Initialize Vertex with project and location from environment variables
const vertexAI = new VertexAI({
  project: import.meta.env.VERTEX_PROJECT_ID,
  location: import.meta.env.VERTEX_LOCATION || 'us-central1',
});

// System prompt for gardening assistance
const GARDENING_SYSTEM_INSTRUCTION = `You are an expert Irish gardening assistant that specializes in providing advice for gardeners in Ireland.
Your responses should be helpful, informative, and tailored to Irish growing conditions, weather patterns, and native plants.

When responding, consider:
- Irish climate zones and seasonal patterns
- Native and well-adapted plants for Irish gardens
- Sustainable gardening practices suitable for Ireland
- Irish soil types and improvement techniques
- Local pest management strategies

When users ask about plants or gardening tasks, indicate in your response if you recommend SHOWING_PLANT_CARDS or SHOWING_TASK_CARDS.
Format your response as plain text with one of these indicators at the very end if appropriate.`;

/**
 * Generate a chat response using Google Vertex AI
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} options - Optional parameters for the API call
 * @returns {Promise<string>} - The text response from the model
 */
export async function generateVertexResponse(messages, options = {}) {
  try {
    // Convert messages format from OpenAI style to Vertex AI style
    const vertexMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }]
    }));

    // Initialize the model
    const modelName = import.meta.env.VERTEX_MODEL || 'gemini-1.0-pro';
    const generativeModel = vertexAI.getGenerativeModel({
      model: modelName,
      systemInstruction: {
        role: 'system',
        parts: [{ text: GARDENING_SYSTEM_INSTRUCTION }]
      },
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.max_tokens || 1024,
        topP: options.top_p || 1,
      }
    });

    // Create the request
    const request = {
      contents: vertexMessages,
    };

    // Generate content
    const response = await generativeModel.generateContent(request);
    const responseText = response.response.candidates[0].content.parts[0].text;

    return responseText;
  } catch (error) {
    console.error("Error calling Vertex AI API:", error);
    
    // Return a graceful fallback message
    return "I'm having trouble connecting to my gardening knowledge base at the moment. Please try again shortly or ask another gardening question.";
  }
}

/**
 * Process a gardening query and return a structured response using Vertex AI
 * @param {string} query - The user's gardening question
 * @param {Array} conversationHistory - Previous messages for context
 * @returns {Promise<Object>} - Structured response with content and optional cards
 */
export async function processGardeningQueryWithVertex(query, conversationHistory = []) {
  // Prepare the conversation history
  const vertexConversation = conversationHistory.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : msg.role,
    content: msg.content
  }));
  
  // Add the current query
  vertexConversation.push({ role: 'user', content: query });
  
  // Generate the response
  const responseText = await generateVertexResponse(vertexConversation);
  
  // Parse the response to extract any card indicators
  let content = responseText;
  let cardType = null;
  
  if (responseText.includes("SHOWING_PLANT_CARDS")) {
    content = responseText.replace("SHOWING_PLANT_CARDS", "").trim();
    cardType = "plant";
  } else if (responseText.includes("SHOWING_TASK_CARDS")) {
    content = responseText.replace("SHOWING_TASK_CARDS", "").trim();
    cardType = "task";
  }
  
  return {
    content,
    cardType
  };
}

/**
 * Count tokens in a message for cost estimation
 * @param {Array} messages - Messages to count tokens for
 * @returns {Promise<number>} - Estimated token count
 */
export async function countTokens(messages) {
  try {
    // Convert messages format from OpenAI style to Vertex AI style
    const vertexMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }]
    }));

    // Initialize the model
    const modelName = import.meta.env.VERTEX_MODEL || 'gemini-1.0-pro';
    const generativeModel = vertexAI.getGenerativeModel({
      model: modelName,
    });

    // Create the request
    const request = {
      contents: vertexMessages,
    };

    // Count tokens
    const response = await generativeModel.countTokens(request);
    return response.totalTokens;
  } catch (error) {
    console.error("Error counting tokens:", error);
    return 0;
  }
}

/**
 * Creates a unified client that can switch between OpenAI and Vertex AI
 * based on environment configuration
 * @returns {Object} - A unified client with the same interface for both APIs
 */
export function createUnifiedClient() {
  // Check if we should use Vertex AI or OpenAI
  const useVertex = import.meta.env.USE_VERTEX_AI === 'true';
  
  if (useVertex) {
    return {
      generateChatResponse: generateVertexResponse,
      processGardeningQuery: processGardeningQueryWithVertex,
      countTokens,
      provider: 'vertex'
    };
  } else {
    // Import the OpenAI client dynamically
    const { generateChatResponse, processGardeningQuery } = await import('./openai-client.js');
    
    return {
      generateChatResponse,
      processGardeningQuery,
      countTokens: async () => 0, // OpenAI client doesn't have this method
      provider: 'openai'
    };
  }
}

export default {
  generateVertexResponse,
  processGardeningQueryWithVertex,
  countTokens,
  createUnifiedClient
};