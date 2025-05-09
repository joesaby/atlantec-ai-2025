// src/pages/api/garden-fix.js
// A fixed version of the garden API that focuses on credential handling

import { VertexAI } from "@google-cloud/vertexai";
import fs from 'fs';
import path from 'path';
import os from 'os';
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
          content: "There was a problem with the request format. Please try again.",
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
    const location = process.env.VERTEX_LOCATION || "us-central1"; // Try US region
    const modelName = process.env.VERTEX_MODEL || "gemini-2.0-flash-001";
    
    logger.info(`Setting up Vertex AI with project: ${projectId}, location: ${location}, model: ${modelName}`);
    
    // Check for credentials JSON
    let credentials = null;
    let vertexOptions = {
      project: projectId,
      location: location
    };
    
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      try {
        // Special handling for Netlify - write credentials to a temp file
        logger.info("Creating temporary file for credentials");
        const tmpdir = os.tmpdir();
        const tempKeyPath = path.join(tmpdir, `vertex-key-${Date.now()}.json`);
        
        // Parse and validate credentials
        credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
        fs.writeFileSync(tempKeyPath, JSON.stringify(credentials, null, 2));
        
        logger.info(`Wrote credentials to temporary file: ${tempKeyPath}`);
        
        // Set environment variable for Google Auth library
        process.env.GOOGLE_APPLICATION_CREDENTIALS = tempKeyPath;
        
        // Log key info
        logger.info(`Using credentials for project: ${credentials.project_id}`);
        
        // Critical: Don't set the credentials object directly
        // Let the Google Auth library find it through the environment variable
        // vertexOptions.credentials = credentials;
        
        // Clean up the temp file when done
        process.on('exit', () => {
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
      logger.warn("No JSON credentials found in environment");
    }
    
    // Create VertexAI instance
    logger.info("Creating VertexAI instance");
    const vertexAI = new VertexAI(vertexOptions);
    
    // System prompt for gardening assistance
    const GARDENING_SYSTEM_INSTRUCTION = `You are an expert Irish gardening assistant with a friendly, warm personality. Your name is Bloom, and you specialize in providing advice for gardeners in Ireland.`;
    
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
    const vertexMessages = [...history, { role: "user", content: query }].map(msg => ({
      role: msg.role === "assistant" ? "model" : msg.role,
      parts: [{ text: msg.content }]
    }));
    
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
      cardType
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
          stack: error.stack
        }
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