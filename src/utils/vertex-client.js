// src/utils/vertex-client.js
// Client for Google Cloud Vertex AI Generative Models

import { VertexAI } from "@google-cloud/vertexai";
import dotenv from "dotenv";
import fs from "fs";
import os from "os";
import path from "path";

// Use the unified logger which works in both dev and Netlify environments
import logger from "./unified-logger.js";
import { detectCardType } from "./card-utils.js";

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
let vertexOptions = {
  project: projectId,
  location: location,
};

// Temporary file for credentials in Netlify environment
let tempCredentialsFile = null;

// Handle credentials based on environment
logger.info("Initializing Vertex AI with authentication options");

if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  try {
    // Log authentication attempt
    logger.info(
      "Using credentials from GOOGLE_APPLICATION_CREDENTIALS_JSON env var",
      { component: "VERTEX-AUTH" }
    );

    // In Netlify, use their specific /tmp directory which is writable
    // This is different from os.tmpdir() as it's guaranteed to be writable in serverless functions
    const netlifyTmpDir = "/tmp";
    tempCredentialsFile = path.join(
      netlifyTmpDir,
      `google-credentials-${Date.now()}.json`
    );

    // Write the credentials JSON to the temporary file
    fs.writeFileSync(
      tempCredentialsFile,
      process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
    );

    // Set the GOOGLE_APPLICATION_CREDENTIALS environment variable
    process.env.GOOGLE_APPLICATION_CREDENTIALS = tempCredentialsFile;

    logger.info(
      `Created temporary credentials file at ${tempCredentialsFile}`,
      { component: "VERTEX-AUTH" }
    );

    // Add logic to clean up the temp file when the process exits
    process.on("exit", () => {
      try {
        if (fs.existsSync(tempCredentialsFile)) {
          fs.unlinkSync(tempCredentialsFile);
          logger.info(
            `Cleaned up temporary credentials file: ${tempCredentialsFile}`,
            { component: "VERTEX-AUTH" }
          );
        }
      } catch (error) {
        logger.error(`Failed to clean up temp file: ${error.message}`, {
          component: "VERTEX-AUTH",
        });
      }
    });
  } catch (error) {
    logger.error("Error creating temporary credentials file", {
      component: "VERTEX-AUTH",
      message: error.message,
    });
    logger.error("Error creating temporary credentials file", error);
  }
} else if (credentialsPath) {
  // Running locally - use the file path
  logger.info(`Using service account key file: ${credentialsPath}`, {
    component: "VERTEX-AUTH",
  });
  process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
} else {
  logger.warn(
    "No explicit credentials provided, falling back to application default credentials",
    { component: "VERTEX-AUTH" }
  );
  logger.warn(
    "No explicit credentials provided, falling back to application default credentials",
    { component: "VERTEX-AUTH" }
  );
}

// Initialize the Vertex client
const vertexAI = new VertexAI(vertexOptions);

// System prompt for gardening assistance
const GARDENING_SYSTEM_INSTRUCTION = `You are an expert Irish gardening assistant with a friendly, warm personality. Your name is Bloom, and you specialize in providing advice for gardeners in Ireland.

Your responses MUST be:
- Brief and to the point (especially for task-related queries)
- Helpful and informative
- Conversational but without unnecessary words
- Tailored to Irish growing conditions, weather patterns, and native plants

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

Focus on delivering practical advice without lengthy explanations:
- Use bullet points for lists instead of paragraphs
- Provide specific actions rather than general information
- Skip introductory phrases like "As an Irish gardening assistant..."
- Avoid repetition of the user's question

SUSTAINABILITY GUIDANCE:
When users ask about sustainability, carbon footprint, or eco-friendly gardening:
- Provide specific information on carbon footprint savings from growing plants vs. buying them
- Mention water conservation benefits, especially relevant during Irish dry periods
- Highlight biodiversity benefits of certain plant types
- Explain the UN Sustainable Development Goals (SDGs) that relate to gardening practices
- Offer practical sustainable gardening tips specific to Irish conditions
- Be encouraging and positive about the environmental benefits of home gardening
- Indicate SHOWING_SUSTAINABILITY_CARDS in your response for sustainability queries

For plant recommendations:
- Provide a very brief introduction (1 sentence)
- Mention that you're showing plant cards
- Indicate SHOWING_PLANT_CARDS in your response

For gardening tasks:
- Keep responses to 1-2 short sentences
- Direct users to the calendar view: "Check the calendar view to see your monthly tasks."
- Indicate SHOWING_TASK_CARDS in your response

For soil information:
- Provide 1-2 sentences about the soil type
- Direct users to view detailed information: "View soil details for more information."

Format your response as plain text with one of these indicators at the very end if appropriate: SHOWING_PLANT_CARDS, SHOWING_TASK_CARDS, or SHOWING_SUSTAINABILITY_CARDS.`;

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
      messageCount: vertexMessages.length,
    });

    // Log the request
    logger.debug(
      `Sending request to model: ${modelName} with ${vertexMessages.length} messages`,
      { component: "VERTEX-REQUEST" }
    );
    logger.debug(
      `Sending request to model: ${modelName} with ${vertexMessages.length} messages`,
      { component: "VERTEX-REQUEST" }
    );

    const response = await generativeModel.generateContent(request);

    // Log the response
    logger.debug(
      `Received response from Vertex AI: ${
        response.response?.candidates ? "Success" : "Error"
      }`,
      { component: "VERTEX-RESPONSE" }
    );

    logger.debug(
      `Received response from Vertex AI: ${
        response.response?.candidates ? "Success" : "Error"
      }`,
      { component: "VERTEX-RESPONSE" }
    );

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

  // Use the card detection utility to extract card indicators
  const result = detectCardType(responseText, query);

  logger.debug("Final structured response", {
    contentLength: result.content.length,
    cardType: result.cardType,
    contentPreview: result.content.substring(0, 100) + "...",
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
