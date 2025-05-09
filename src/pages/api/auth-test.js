// src/pages/api/auth-test.js
// Test endpoint for Vertex AI authentication

import dotenv from 'dotenv';
import { VertexAI } from "@google-cloud/vertexai";

// Load environment variables
dotenv.config();

/**
 * API endpoint that tests Vertex AI authentication without any abstraction
 * This is a stripped-down test to isolate authentication issues
 */
export async function GET() {
  try {
    // Get configuration from environment
    const projectId = process.env.VERTEX_PROJECT_ID;
    const location = process.env.VERTEX_LOCATION || "europe-west1";
    const modelName = process.env.VERTEX_MODEL || "gemini-2.0-flash-001";
    
    // Attempt to parse credentials from environment variable
    let authSuccess = false;
    let authMethod = 'none';
    let credentials = null;
    let vertexOptions = {
      project: projectId,
      location: location
    };
    
    // Log environment variables for debugging
    console.log(`[AUTH-TEST] Configuration:
  - Project ID: ${projectId}
  - Location: ${location}
  - Model: ${modelName}
  - Has GOOGLE_APPLICATION_CREDENTIALS_JSON: ${!!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON}
  - GOOGLE_APPLICATION_CREDENTIALS_JSON length: ${process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON?.length || 0}
  - Has VERTEX_SERVICE_ACCOUNT_KEY: ${!!process.env.VERTEX_SERVICE_ACCOUNT_KEY}
`);
    
    // Try to use JSON credentials from environment
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      try {
        console.log("[AUTH-TEST] Using JSON credentials from environment variable");
        credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
        
        // IMPORTANT: For Netlify, do NOT set process.env.GOOGLE_APPLICATION_CREDENTIALS
        // Instead, use the credentials object directly with the VertexAI constructor
        
        // IMPORTANT: Use the complete credentials object with all fields
        // Don't create a subset - use the exact object from the JSON
        vertexOptions.credentials = credentials;
        
        authMethod = 'json_env_direct';
        console.log(`[AUTH-TEST] Parsed credentials for project: ${credentials.project_id}`);
      } catch (error) {
        console.error("[AUTH-TEST] Failed to parse credentials:", error.message);
        // We'll continue and try other auth methods
      }
    }
    
    // If we still don't have credentials, try file path
    const credentialsPath = process.env.VERTEX_SERVICE_ACCOUNT_KEY;
    if (!credentials && credentialsPath) {
      try {
        console.log(`[AUTH-TEST] Using key file path: ${credentialsPath}`);
        vertexOptions.googleAuthOptions = { keyFilename: credentialsPath };
        authMethod = 'key_file';
      } catch (error) {
        console.error("[AUTH-TEST] Failed to use key file:", error.message);
      }
    }
    
    // Initialize Vertex AI client
    console.log("[AUTH-TEST] Initializing Vertex AI client");
    const vertexAI = new VertexAI(vertexOptions);
    
    // Test getting the model
    console.log("[AUTH-TEST] Getting generative model");
    const generativeModel = vertexAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });
    
    // Test with a simple prompt
    console.log("[AUTH-TEST] Testing model with simple prompt");
    const response = await generativeModel.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: "Hello, what's your name?" }],
        },
      ],
    });
    
    // If we get here, authentication was successful
    authSuccess = true;
    const modelResponse = response.response.candidates[0].content.parts[0].text;
    
    return new Response(JSON.stringify({
      success: true,
      authMethod,
      modelResponse: modelResponse.substring(0, 100) + (modelResponse.length > 100 ? '...' : ''),
      projectId, 
      location,
      modelName
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    // Return detailed error information
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      errorName: error.name,
      stack: error.stack,
      cause: error.cause?.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}