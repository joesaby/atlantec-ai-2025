// src/utils/vertex-client-v2.js
// Updated Vertex AI client that works in both local and Netlify environments

import { VertexAI } from "@google-cloud/vertexai";
import fs from "fs";
import path from "path";
import os from "os";
import logger from "./unified-logger.js";

// Configuration
const projectId = process.env.VERTEX_PROJECT_ID;
const location = process.env.VERTEX_LOCATION || "us-central1";
const modelName = process.env.VERTEX_MODEL || "gemini-2.0-flash-001";
const temperature = parseFloat(process.env.TEMPERATURE || "0.7");
const maxTokens = parseInt(process.env.MAX_TOKENS || "1024");

// System prompt for gardening assistance
const GARDENING_SYSTEM_INSTRUCTION = `You are an expert Irish gardening assistant with a friendly, warm personality. Your name is Bloom, and you specialize in providing advice for gardeners in Ireland. 

Your responses should be:
- Helpful and informative
- Conversational and personal (use "I", "you", and occasionally the user's name if provided)
- Tailored to Irish growing conditions, weather patterns, and native plants
- Brief and to the point (especially for task-related queries)

When responding, consider:
- Irish climate zones and seasonal patterns
- Native and well-adapted plants for Irish gardens
- Sustainable gardening practices suitable for Ireland
- Irish soil types and improvement techniques
- Local pest management strategies

Add personal touches to your responses like:
- "I'd recommend..." instead of "It is recommended..."
- "Your garden will love..." instead of "Gardens benefit from..."
- Occasional gardening metaphors or Irish gardening wisdom
- Brief stories or experiences about gardening in Ireland

When users ask about gardening tasks, provide very short and concise responses (1-2 sentences) and explicitly suggest clicking the View Calendar button. For example: "I've prepared those November tasks for you! Click the View Calendar button below to see what you should be doing in your garden." or "Here are your spring gardening tasks ready for you. Click View Calendar to start planning your season!"

When users ask about plants or gardening tasks, indicate in your response if you recommend SHOWING_PLANT_CARDS or SHOWING_TASK_CARDS.
Format your response as plain text with one of these indicators at the very end if appropriate.`;

/**
 * Initialize the Vertex AI client with proper authentication for current environment
 * @returns {VertexAI} Configured Vertex AI client
 */
export function initializeVertexAI() {
  logger.info(
    `Setting up Vertex AI with project: ${projectId}, location: ${location}, model: ${modelName}`
  );

  // Check for available credentials to determine environment
  const hasServiceAccountKeyFile = !!process.env.VERTEX_SERVICE_ACCOUNT_KEY;
  const hasJsonCredentials = !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  
  logger.info(`Available credentials - JSON: ${hasJsonCredentials}, Key file: ${hasServiceAccountKeyFile}`);
  
  // Initialize VertexAI options with required configuration
  let vertexOptions = {
    project: projectId,
    location: location
  };

  // Handle authentication based on available credentials
  if (hasServiceAccountKeyFile) {
    // Local development environment using file path
    logger.info("Detected local environment with service account key file");
    vertexOptions.googleAuthOptions = { 
      keyFilename: process.env.VERTEX_SERVICE_ACCOUNT_KEY 
    };
    logger.info(`Using key file: ${process.env.VERTEX_SERVICE_ACCOUNT_KEY}`);
  } else if (hasJsonCredentials) {
    // Netlify environment using JSON in environment variable
    logger.info("Detected Netlify environment with JSON credentials");
    try {
      // Create a temporary file for credentials
      const tmpdir = os.tmpdir();
      const tempKeyPath = path.join(tmpdir, `vertex-key-${Date.now()}.json`);

      // Parse and write credentials to temp file
      const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
      fs.writeFileSync(tempKeyPath, JSON.stringify(credentials, null, 2));

      logger.info(`Wrote credentials to temporary file: ${tempKeyPath}`);
      logger.info(`Using credentials for project: ${credentials.project_id}`);

      // Set environment variable for Google Auth library
      process.env.GOOGLE_APPLICATION_CREDENTIALS = tempKeyPath;

      // Clean up temp file on exit
      process.on("exit", () => {
        try {
          fs.unlinkSync(tempKeyPath);
          logger.info(`Cleaned up temporary credentials file`);
        } catch (e) {
          logger.error(`Error cleaning up temp file: ${e.message}`);
        }
      });
    } catch (error) {
      logger.error("Error processing credentials", error);
      throw new Error(`Invalid credentials: ${error.message}`);
    }
  } else {
    logger.warn("No explicit credentials found in environment variables");
  }

  // Create and return VertexAI instance
  logger.info("Creating VertexAI instance");
  return new VertexAI(vertexOptions);
}

/**
 * Generate a chat response using Google Vertex AI
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} options - Optional parameters for the API call
 * @returns {Promise<string>} - The text response from the model
 */
export async function generateVertexResponse(messages, options = {}) {
  try {
    // Initialize VertexAI with proper authentication
    const vertexAI = initializeVertexAI();
    
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
      messageCount: vertexMessages.length,
    });
    
    // Log the request
    logger.debug(`Sending request to model: ${modelName} with ${vertexMessages.length} messages`, { component: "VERTEX-REQUEST" });

    const response = await generativeModel.generateContent(request);

    // Log the response
    logger.debug(`Received response from Vertex AI: ${response.response?.candidates ? 'Success' : 'Error'}`, { component: "VERTEX-RESPONSE" });
    
    // Log response summary without sensitive content
    logger.info("Received response from Vertex AI", {
      statusCode: response.response?.candidates ? 200 : 500,
      candidateCount: response.response?.candidates?.length || 0,
      finishReason:
        response.response?.candidates?.[0]?.finishReason || "unknown",
    });

    // Only log full response in debug mode
    logger.debug("Raw Vertex AI response", {
      response: JSON.stringify(response),
    });

    const responseText = response.response.candidates[0].content.parts[0].text;
    logger.debug("Extracted response text", {
      textLength: responseText.length,
      preview: responseText.substring(0, 100) + "...",
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
        message: error.message,
      });
    } else if (
      error.message.includes("Permission denied") ||
      error.message.includes("permission")
    ) {
      logger.error("Permission error with Vertex AI", {
        errorType: "permission",
        message: error.message,
      });
    } else if (
      error.message.includes("API not enabled") ||
      error.message.includes("has not been used")
    ) {
      logger.error("Vertex AI API not enabled", {
        errorType: "api_not_enabled",
        message: error.message,
      });
    } else if (error.message.includes("billing")) {
      logger.error("Billing error with Vertex AI", {
        errorType: "billing",
        message: error.message,
      });
    } else {
      logger.error("Unexpected error with Vertex AI", {
        message: error.message,
        stack: error.stack,
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
    responseLength: responseText.length,
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
    // Smart detection of content type without explicit markers
    const lowercaseContent = responseText.toLowerCase();

    // Check for plant-related content patterns
    if (
      (lowercaseContent.includes("plant") ||
        lowercaseContent.includes("flower") ||
        lowercaseContent.includes("shrub") ||
        lowercaseContent.includes("tree")) &&
      (lowercaseContent.includes("recommend") ||
        lowercaseContent.includes("suggestion") ||
        responseText.match(/\*\s+[A-Z][a-z]+\s+[a-z]+:/) || // Pattern like "* Plant name:"
        responseText.match(/\*\s+\*[A-Z][a-z]+\s+[a-z]+\*/)) // Pattern like "* *Plant name*"
    ) {
      cardType = "plant";
      logger.info("Plant cards inferred from content analysis");
    }
    // Check for task-related content patterns
    else if (
      (lowercaseContent.includes("task") ||
        lowercaseContent.includes("jobs") ||
        lowercaseContent.includes("chore") ||
        lowercaseContent.includes("to do") ||
        lowercaseContent.includes("todo")) &&
      (lowercaseContent.includes("garden") ||
        lowercaseContent.includes("planting") ||
        lowercaseContent.includes("maintenance"))
    ) {
      cardType = "task";
      logger.info("Task cards inferred from content analysis");
    } else {
      logger.info("No card indicators found in response");
    }
  }

  const result = {
    content,
    cardType,
  };

  logger.debug("Final structured response", {
    contentLength: content.length,
    cardType: cardType,
    contentPreview: content.substring(0, 100) + "...",
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
    // Initialize VertexAI with proper authentication
    const vertexAI = initializeVertexAI();
    
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
    logger.error("Error counting tokens", error);
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