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
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  // Running on Netlify - use the environment variable with JSON content
  try {
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    vertexOptions.credentials = credentials;
    console.log("Using service account credentials from environment variable");
  } catch (error) {
    console.error("Error parsing credentials from environment variable:", error);
  }
} else if (credentialsPath) {
  // Running locally - use the file path
  vertexOptions.googleAuthOptions = { keyFilename: credentialsPath };
  console.log("Using service account credentials from file:", credentialsPath);
}

const vertexAI = new VertexAI(vertexOptions);

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
    const response = await generativeModel.generateContent(request);
    console.log("Raw Vertex AI response:", JSON.stringify(response, null, 2));
    
    const responseText = response.response.candidates[0].content.parts[0].text;
    console.log("Extracted response text:", responseText);

    return responseText;
  } catch (error) {
    console.error("Error calling Vertex AI API:", error);

    // Enhanced error handling
    if (
      error.message.includes("authentication") ||
      error.name === "GoogleAuthError"
    ) {
      console.error(
        "Authentication error. Please check your service account credentials."
      );
    } else if (
      error.message.includes("Permission denied") ||
      error.message.includes("permission")
    ) {
      console.error(
        "Permission error. Please check your service account permissions."
      );
    } else if (
      error.message.includes("API not enabled") ||
      error.message.includes("has not been used")
    ) {
      console.error(
        "Vertex AI API not enabled. Please enable it in your Google Cloud project."
      );
    } else if (error.message.includes("billing")) {
      console.error(
        "Billing error. Please ensure billing is enabled for your project."
      );
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

  console.log("Checking response for card indicators...");
  console.log("Contains SHOWING_PLANT_CARDS:", responseText.includes("SHOWING_PLANT_CARDS"));
  console.log("Contains SHOWING_TASK_CARDS:", responseText.includes("SHOWING_TASK_CARDS"));

  if (responseText.includes("SHOWING_PLANT_CARDS")) {
    content = responseText.replace("SHOWING_PLANT_CARDS", "").trim();
    cardType = "plant";
    console.log("Set cardType to 'plant' from explicit marker");
  } else if (responseText.includes("SHOWING_TASK_CARDS")) {
    content = responseText.replace("SHOWING_TASK_CARDS", "").trim();
    cardType = "task";
    console.log("Set cardType to 'task' from explicit marker");
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
      console.log("Set cardType to 'plant' based on content analysis");
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
      console.log("Set cardType to 'task' based on content analysis");
    } else {
      console.log("No card indicators found in response");
    }
  }

  const result = {
    content,
    cardType,
  };
  
  console.log("Final structured response:", result);
  
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
