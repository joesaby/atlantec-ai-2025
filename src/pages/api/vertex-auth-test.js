// src/pages/api/vertex-auth-test.js
// Simple test endpoint to verify Vertex AI authentication works

import { initializeVertexAI } from "../../utils/vertex-client-v2.js";
import logger from "../../utils/unified-logger.js";

// Ensure this endpoint is always server-rendered
export const prerender = false;

export async function GET() {
  try {
    logger.info("Testing Vertex AI authentication with vertex-client-v2");
    
    // Log environment variables (with secrets redacted)
    logger.info("Environment configuration:", {
      projectId: process.env.VERTEX_PROJECT_ID || "Not set",
      location: process.env.VERTEX_LOCATION || "Not set",
      modelName: process.env.VERTEX_MODEL || "Not set",
      hasKeyFile: !!process.env.VERTEX_SERVICE_ACCOUNT_KEY,
      hasJsonCreds: !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
      nodeEnv: process.env.NODE_ENV,
    });

    // Initialize VertexAI using our new client
    const vertexAI = initializeVertexAI();
    
    // If initialization completes without error, authentication is working
    logger.info("Successfully initialized Vertex AI client");

    // Get model to verify further API access
    const modelName = process.env.VERTEX_MODEL || "gemini-2.0-flash-001";
    const generativeModel = vertexAI.getGenerativeModel({
      model: modelName,
    });
    
    logger.info(`Successfully created generative model for ${modelName}`);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Vertex AI authentication successful",
        details: {
          projectId: process.env.VERTEX_PROJECT_ID,
          location: process.env.VERTEX_LOCATION || "us-central1",
          model: modelName,
          environment: process.env.NODE_ENV || "development"
        }
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    // Log the error
    logger.error("Vertex AI authentication test failed", error);
    
    // Return detailed error response
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        errorType: error.name,
        details: {
          message: error.message,
          name: error.name,
          stack: error.stack
        }
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
}