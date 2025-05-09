// src/pages/api/garden-fix.js
// A fixed version of the garden API that works in both local and Netlify environments

import { VertexAI } from "@google-cloud/vertexai";
import fs from "fs";
import path from "path";
import os from "os";
import logger from "../../utils/unified-logger.js";

// Ensure this endpoint is always server-rendered
export const prerender = false;

export async function POST({ request }) {
  try {
    // Debug request
    const text = await request.text();
    logger.info(`Received garden query: ${text.substring(0, 100)}...`);

    // Parse JSON manually for better error handling
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      logger.error("JSON parsing error", parseError);
      return new Response(
        JSON.stringify({
          error: "Invalid JSON in request",
          content:
            "There was a problem with the request format. Please try again.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { query, conversationHistory } = data;

    if (!query) {
      return new Response(
        JSON.stringify({
          error: "Missing query parameter",
          content: "Please provide a query in your request.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Use default empty array if conversationHistory is not provided
    const history = conversationHistory || [];

    logger.info(`Processing query: "${query}"`);
    logger.info(`History length: ${history.length}`);

    // Set up VertexAI with explicit logging
    const projectId = process.env.VERTEX_PROJECT_ID;
    const location = process.env.VERTEX_LOCATION || "us-central1";
    const modelName = process.env.VERTEX_MODEL || "gemini-2.0-flash-001";

    logger.info(
      `Setting up Vertex AI with project: ${projectId}, location: ${location}, model: ${modelName}`
    );

    // Check for credentials and determine environment
    const hasServiceAccountKeyFile = !!process.env.VERTEX_SERVICE_ACCOUNT_KEY;
    const hasJsonCredentials = !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    
    logger.info(`Available credentials - JSON: ${hasJsonCredentials}, Key file: ${hasServiceAccountKeyFile}`);
    
    // Initialize VertexAI options with required configuration
    let vertexOptions = {
      project: projectId,
      location: location
    };

    // Simple environment check based on available credentials
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
        return new Response(
          JSON.stringify({
            error: "Invalid credentials",
            content: "There was a problem with the authentication. Please check your configuration.",
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    } else {
      logger.warn("No credentials found in environment variables");
    }

    // Create VertexAI instance
    logger.info("Creating VertexAI instance");
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

    // Generate content
    logger.info("Initializing generative model");
    const generativeModel = vertexAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
      systemInstruction: {
        role: "system",
        parts: [{ text: GARDENING_SYSTEM_INSTRUCTION }],
      },
    });

    // Convert messages for Vertex AI format
    const vertexMessages = [...history, { role: "user", content: query }].map(
      (msg) => ({
        role: msg.role === "assistant" ? "model" : msg.role,
        parts: [{ text: msg.content }],
      })
    );

    logger.info("Sending request to Vertex AI");
    const response = await generativeModel.generateContent({
      contents: vertexMessages,
    });

    // Extract and return the response
    const responseText = response.response.candidates[0].content.parts[0].text;
    logger.info("Successfully received response from Vertex AI");

    // Check for plant or task cards
    let content = responseText;
    let cardType = null;

    if (responseText.includes("SHOWING_PLANT_CARDS")) {
      content = responseText.replace("SHOWING_PLANT_CARDS", "").trim();
      cardType = "plant";
    } else if (responseText.includes("SHOWING_TASK_CARDS")) {
      content = responseText.replace("SHOWING_TASK_CARDS", "").trim();
      cardType = "task";
    }

    const result = {
      content,
      cardType,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    logger.error("Error processing garden query", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process query",
        content:
          "I'm having trouble connecting to my gardening knowledge base at the moment. Please try again shortly.",
        errorDetails: {
          message: error.message,
          name: error.name,
          stack: error.stack,
        },
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}