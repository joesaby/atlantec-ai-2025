/**
 * LLM client for Vertex AI integration
 * This module provides functions to interact with Google Cloud's Vertex AI Gemini
 */

import { GoogleAuth } from "google-auth-library";
import "dotenv/config";
import fetch from "node-fetch";

// Configuration from environment variables
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;
const MODEL_ID = process.env.GOOGLE_AI_MODEL || "gemini-2.0-flash-001";
const REGION = "us-central1"; // Default region for Vertex AI

// Endpoint for Vertex AI Gemini API
const API_ENDPOINT = `https://${REGION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${REGION}/publishers/google/models/${MODEL_ID}:generateContent`;

// Create auth client using Google Auth Library
const auth = new GoogleAuth({
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});

/**
 * Checks if the Vertex AI connection is healthy
 * @returns {Promise<Object>} Health status object
 */
export async function checkLLMHealth() {
  try {
    const client = await auth.getClient();
    const token = await client.getAccessToken();

    // Simple health check - just making sure we can get a valid token
    if (token && token.token) {
      return {
        healthy: true,
        message: "Successfully connected to Vertex AI",
        model: MODEL_ID,
        project: PROJECT_ID,
      };
    } else {
      return {
        healthy: false,
        message: "Failed to get a valid authentication token",
        error: "Authentication error",
      };
    }
  } catch (error) {
    return {
      healthy: false,
      message: "Failed to connect to Vertex AI",
      error: error.message,
    };
  }
}

/**
 * Generates text using Vertex AI Gemini
 * @param {string} prompt - The prompt for text generation
 * @param {Object} options - Generation options
 * @returns {Promise<string>} Generated text
 */
export async function generateText(prompt, options = {}) {
  try {
    const client = await auth.getClient();
    const token = await client.getAccessToken();

    const maxTokens = options.maxTokens || 1024;
    const temperature = options.temperature || 0.7;

    // Prepare request for Gemini API (using the generateContent endpoint)
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: maxTokens,
        topK: 40,
        topP: 0.95,
      },
    };

    // Make the API request
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // Parse the response
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `Vertex AI API error: ${data.error?.message || JSON.stringify(data)}`
      );
    }

    // Extract and return the generated text from Gemini response format
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error) {
    console.error("Error generating text:", error);
    throw error;
  }
}

/**
 * Generates a gardening answer using Vertex AI
 * @param {string} question - The gardening question
 * @param {Object} gardenContext - Additional context about the garden
 * @returns {Promise<string>} The gardening advice
 */
export async function generateGardeningAnswer(question, gardenContext = {}) {
  const { county, soilType, sunExposure } = gardenContext;

  let contextPrompt =
    "As an Irish gardening assistant, please provide helpful advice for the following question:\n\n";

  if (county) {
    contextPrompt += `Location: County ${county}, Ireland\n`;
  }

  if (soilType) {
    contextPrompt += `Soil type: ${soilType}\n`;
  }

  if (sunExposure) {
    contextPrompt += `Sun exposure: ${sunExposure}\n`;
  }

  contextPrompt += `\nQuestion: ${question}\n\nPlease provide practical, specific advice tailored to Irish gardening conditions.`;

  return generateText(contextPrompt, {
    maxTokens: 800,
    temperature: 0.5,
  });
}
