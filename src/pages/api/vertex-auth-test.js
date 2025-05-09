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

    // Build a more helpful error message with troubleshooting info
    let troubleshooting = [];

    if (error.message.includes("Unable to infer your project") ||
        error.message.includes("project") ||
        error.message.includes("project_id")) {
      troubleshooting.push("- Set the VERTEX_PROJECT_ID environment variable with your Google Cloud project ID");
      troubleshooting.push("- Verify that your credentials file contains the correct project_id");
    } else if (error.message.includes("authentication") || error.name === "GoogleAuthError") {
      troubleshooting.push("- Check that your credentials are valid and not expired");
      troubleshooting.push("- Verify the format of your credentials JSON in GOOGLE_APPLICATION_CREDENTIALS_JSON");
      troubleshooting.push("- For local dev, make sure VERTEX_SERVICE_ACCOUNT_KEY points to a valid file");
    } else if (error.message.includes("Permission denied") || error.message.includes("permission")) {
      troubleshooting.push("- Verify your service account has roles/aiplatform.user permission");
      troubleshooting.push("- Verify your service account has roles/storage.objectViewer permission");
    } else if (error.message.includes("API not enabled") || error.message.includes("has not been used")) {
      troubleshooting.push("- Enable the Vertex AI API for your project using Google Cloud Console");
      troubleshooting.push("- Run: gcloud services enable aiplatform.googleapis.com --project=YOUR_PROJECT_ID");
    }

    // Return detailed error response with troubleshooting steps
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        errorType: error.name,
        troubleshooting: troubleshooting.length > 0 ? troubleshooting : [
          "- Check the docs/vertex-ai-auth-troubleshooting.md file for more information",
          "- Run node scripts/validate-vertex-ai.js locally to diagnose the issue"
        ],
        details: {
          message: error.message,
          name: error.name,
          stack: error.stack,
          envCheck: {
            hasProjectId: !!process.env.VERTEX_PROJECT_ID,
            hasKeyFile: !!process.env.VERTEX_SERVICE_ACCOUNT_KEY,
            hasJsonCreds: !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
            location: process.env.VERTEX_LOCATION || "Not set"
          }
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