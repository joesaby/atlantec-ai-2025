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
 * npm install @google-cloud/vertexai dotenv
 */

import { VertexAI } from "@google-cloud/vertexai";
import dotenv from "dotenv";
import logger from "./logger";

// Load environment variables
dotenv.config();

// Configuration
const projectId = process.env.VERTEX_PROJECT_ID;
const location = process.env.VERTEX_LOCATION || "europe-west1";
const modelName = process.env.VERTEX_MODEL || "gemini-2.0-flash-001";
const credentialsPath = process.env.VERTEX_SERVICE_ACCOUNT_KEY;
const temperature = parseFloat(process.env.TEMPERATURE || "0.7");
const maxTokens = parseInt(process.env.MAX_TOKENS || "1024");

// Initialize Vertex with configuration
const vertexOptions = {
  project: projectId,
  location: location,
};

// Handle credentials based on environment
logger.info("Initializing Vertex AI with authentication options");

if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  // Running on Netlify - use the environment variable with JSON content
  try {
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    vertexOptions.credentials = credentials;
    logger.info("Using service account credentials from environment variable (JSON)");
    
    // Log partial info about the credentials to help with debugging
    if (credentials.project_id && credentials.client_email) {
      logger.info("Service account details", {
        project_id: credentials.project_id,
        client_email: credentials.client_email,
        auth_method: "json_credentials"
      });
    }
  } catch (error) {
    logger.error("Error parsing credentials from environment variable", error);
  }
} else if (credentialsPath) {
  // Running locally - use the file path
  vertexOptions.googleAuthOptions = { keyFilename: credentialsPath };
  logger.info("Using service account credentials from file", { path: credentialsPath, auth_method: "key_file" });
} else {
  logger.warn("No explicit credentials provided, falling back to application default credentials");
}

const vertexAI = new VertexAI(vertexOptions);

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
    const vertexMessages = messages.map((msg) => ({
      role: msg.role === "assistant" ? "model" : msg.role,
      parts: [{ text: msg.content }],
    }));

    // Initialize the model with configuration
    const generativeModel = vertexAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: maxTokens,
      },
      systemInstruction: {
        role: "system",
        parts: [{ text: GARDENING_SYSTEM_INSTRUCTION }],
      },
    });

    // Create the request
    const request = {
      contents: vertexMessages,
    };

    // Generate content
    logger.info("Sending request to Vertex AI", { 
      model: modelName, 
      messageCount: vertexMessages.length 
    });
    
    const response = await generativeModel.generateContent(request);
    
    // Log response summary without sensitive content
    logger.info("Received response from Vertex AI", { 
      statusCode: response.response?.candidates ? 200 : 500,
      candidateCount: response.response?.candidates?.length || 0,
      finishReason: response.response?.candidates?.[0]?.finishReason || 'unknown'
    });
    
    // Only log full response in debug mode
    logger.debug("Raw Vertex AI response", { 
      response: JSON.stringify(response) 
    });
    
    const responseText = response.response.candidates[0].content.parts[0].text;
    logger.debug("Extracted response text", { 
      textLength: responseText.length,
      preview: responseText.substring(0, 100) + '...'
    });

    return responseText;
  } catch (error) {
    logger.error("Error calling Vertex AI API", error);

    // Enhanced error handling with logging
    if (
      error.message.includes("authentication") ||
      error.name === "GoogleAuthError"
    ) {
      logger.error("Authentication error with Vertex AI", { 
        errorType: "authentication",
        message: error.message
      });
    } else if (
      error.message.includes("Permission denied") ||
      error.message.includes("permission")
    ) {
      logger.error("Permission error with Vertex AI", { 
        errorType: "permission",
        message: error.message
      });
    } else if (
      error.message.includes("API not enabled") ||
      error.message.includes("has not been used")
    ) {
      logger.error("Vertex AI API not enabled", { 
        errorType: "api_not_enabled",
        message: error.message
      });
    } else if (error.message.includes("billing")) {
      logger.error("Billing error with Vertex AI", { 
        errorType: "billing",
        message: error.message
      });
    } else {
      logger.error("Unexpected error with Vertex AI", {
        message: error.message,
        stack: error.stack
      });
    }

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
export async function processGardeningQueryWithVertex(
  query,
  conversationHistory = []
) {
  // Prepare the conversation history
  const vertexConversation = conversationHistory.map((msg) => ({
    role: msg.role === "assistant" ? "model" : msg.role,
    content: msg.content,
  }));

  // Add the current query
  vertexConversation.push({ role: "user", content: query });

  // Generate the response
  const responseText = await generateVertexResponse(vertexConversation);

  // Parse the response to extract any card indicators
  let content = responseText;
  let cardType = null;

  logger.debug("Checking response for card indicators", {
    hasPlantCards: responseText.includes("SHOWING_PLANT_CARDS"),
    hasTaskCards: responseText.includes("SHOWING_TASK_CARDS"),
    responseLength: responseText.length
  });

  if (responseText.includes("SHOWING_PLANT_CARDS")) {
    content = responseText.replace("SHOWING_PLANT_CARDS", "").trim();
    cardType = "plant";
    logger.info("Plant cards detected in response");
  } else if (responseText.includes("SHOWING_TASK_CARDS")) {
    content = responseText.replace("SHOWING_TASK_CARDS", "").trim();
    cardType = "task";
    logger.info("Task cards detected in response");
  } else {
    logger.info("No card indicators found in response");
  }

  const result = {
    content,
    cardType,
  };
  
  logger.debug("Final structured response", {
    contentLength: content.length,
    cardType: cardType,
    contentPreview: content.substring(0, 100) + '...'
  });
  
  return result;
}

/**
 * Count tokens in a message for cost estimation
 * @param {Array} messages - Messages to count tokens for
 * @returns {Promise<number>} - Estimated token count
 */
export async function countTokens(messages) {
  try {
    // Convert messages format from OpenAI style to Vertex AI style
    const vertexMessages = messages.map((msg) => ({
      role: msg.role === "assistant" ? "model" : msg.role,
      parts: [{ text: msg.content }],
    }));

    // Initialize the model
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
 * Creates a unified client that uses Vertex AI
 * @returns {Object} - A client with the Vertex AI interface
 */
export async function createUnifiedClient() {
  return {
    generateChatResponse: generateVertexResponse,
    processGardeningQuery: processGardeningQueryWithVertex,
    countTokens,
    provider: "vertex",
  };
}

export default {
  generateVertexResponse,
  processGardeningQueryWithVertex,
  countTokens,
  createUnifiedClient,
};
