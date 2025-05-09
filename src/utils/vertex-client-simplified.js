// src/utils/vertex-client-simplified.js
// Simplified Vertex AI client implementation

import { VertexAI } from "@google-cloud/vertexai";
import dotenv from "dotenv";
import logger from "./unified-logger.js";

// Load environment variables
dotenv.config();

// Configuration
const projectId = process.env.VERTEX_PROJECT_ID;
const location = process.env.VERTEX_LOCATION || "us-central1";
const modelName = process.env.VERTEX_MODEL || "gemini-2.0-flash-001";
const temperature = parseFloat(process.env.TEMPERATURE || "0.7");
const maxTokens = parseInt(process.env.MAX_TOKENS || "1024");

// Simple helper to create a Vertex AI client
export async function createVertexClient() {
  try {
    logger.info("Creating simplified Vertex AI client");
    
    // Basic config
    const options = {
      project: projectId,
      location: location,
    };
    
    // IMPORTANT: Only attempt to use credentials if available
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      try {
        const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
        logger.info(`Using credentials from environment variable for project: ${credentials.project_id}`);
        
        // IMPORTANT: Pass only the credentials object
        options.credentials = credentials;
      } catch (error) {
        logger.error("Failed to parse credentials from environment variable", {
          error: error.message,
          credentialLength: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON?.length || 0
        });
      }
    } else {
      logger.warn("No explicit credentials in JSON format, will attempt to use application defaults");
    }
    
    // Create the VertexAI instance
    const vertexAI = new VertexAI(options);
    logger.info("Successfully created Vertex AI client");
    
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
    
    // Create a method to generate responses
    const generateResponse = async (query, conversationHistory = []) => {
      try {
        // Convert messages for Vertex AI format
        const vertexMessages = [...conversationHistory, { role: "user", content: query }].map(msg => ({
          role: msg.role === "assistant" ? "model" : msg.role,
          parts: [{ text: msg.content }]
        }));
        
        // Initialize the model
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
        
        logger.info("Sending request to Vertex AI", {
          model: modelName,
          messageCount: vertexMessages.length
        });
        
        // Generate content
        const response = await generativeModel.generateContent({
          contents: vertexMessages,
        });
        
        // Extract the response text
        const responseText = response.response.candidates[0].content.parts[0].text;
        
        // Parse for cards
        let content = responseText;
        let cardType = null;
        
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
        
        return {
          content,
          cardType
        };
      } catch (error) {
        logger.error("Error generating Vertex AI response", error);
        return {
          content: "I'm having trouble connecting to my gardening knowledge base at the moment. Please try again shortly or ask another gardening question.",
          cardType: null
        };
      }
    };
    
    // Return the client interface
    return {
      generateResponse,
      provider: "vertex",
      model: modelName
    };
  } catch (error) {
    logger.error("Error creating Vertex AI client", error);
    throw error;
  }
}

// Export the client creation function
export default { createVertexClient };