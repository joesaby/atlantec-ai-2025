// src/utils/openai-client.js
// OpenAI client implementation for the gardening assistant

import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY,
});

/**
 * Generate a chat response using OpenAI's API
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} options - Optional parameters for the API call
 * @returns {Promise<string>} The text response from the model
 */
export async function generateChatResponse(messages, options = {}) {
  try {
    const response = await openai.chat.completions.create({
      model: import.meta.env.OPENAI_MODEL || "gpt-4-turbo",
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1000,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error generating OpenAI response:", error);
    throw new Error("Failed to generate response from OpenAI");
  }
}

/**
 * Process a gardening query using OpenAI
 * @param {string} query - The user's gardening question
 * @param {Array} conversationHistory - Previous messages for context
 * @returns {Promise<Object>} Structured response with content and optional cards
 */
export async function processGardeningQuery(query, conversationHistory = []) {
  try {
    const messages = [
      {
        role: "system",
        content:
          "You are a helpful gardening assistant. Provide clear, practical advice about plants, gardening techniques, and sustainable practices.",
      },
      ...conversationHistory,
      {
        role: "user",
        content: query,
      },
    ];

    const response = await generateChatResponse(messages);

    return {
      content: response,
      cards: [], // OpenAI implementation doesn't support cards yet
    };
  } catch (error) {
    console.error("Error processing gardening query:", error);
    throw new Error("Failed to process gardening query");
  }
}
