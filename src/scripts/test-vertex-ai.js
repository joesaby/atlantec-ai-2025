// Test script to verify Vertex AI setup
// Run with: node --experimental-json-modules scripts/test-vertex-ai.js

import { VertexAI } from "@google-cloud/vertexai";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default configuration
const config = {
  projectId: process.env.VERTEX_CLOUD_PROJECT || "your-project-id",
  location: process.env.VERTEX_LOCATION || "europe-west4",
  modelName: process.env.VERTEX_MODEL || "gemini-1.0-pro",
  temperature: parseFloat(process.env.TEMPERATURE || "0.7"),
  maxOutputTokens: parseInt(process.env.MAX_TOKENS || "1024"),
  credentials: {
    type: "service_account",
    project_id: process.env.VERTEX_CLOUD_PROJECT,
    private_key_id: process.env.VERTEX_PRIVATE_KEY_ID,
    private_key: process.env.VERTEX_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    client_email: process.env.VERTEX_CLIENT_EMAIL,
    client_id: process.env.VERTEX_CLIENT_ID,
    auth_uri:
      process.env.VERTEX_OAUTH_URI ||
      "https://accounts.google.com/o/oauth2/auth",
    token_uri:
      process.env.VERTEX_TOKEN_URI || "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url:
      process.env.VERTEX_OAUTH_URI_PROVIDER_X509_CERT_URL ||
      "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.VERTEX_CLIENT_X509_CERT_URL,
  },
};

// Check if required credentials are present
const requiredEnvVars = [
  "VERTEX_CLOUD_PROJECT",
  "VERTEX_PRIVATE_KEY_ID",
  "VERTEX_PRIVATE_KEY",
  "VERTEX_CLIENT_EMAIL",
  "VERTEX_CLIENT_ID",
  "VERTEX_CLIENT_CERT_URL",
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(
    "\x1b[31m%s\x1b[0m",
    "Error: Missing required environment variables:"
  );
  missingVars.forEach((varName) => console.error(`- ${varName}`));
  console.log("\nPlease ensure all required environment variables are set.");
  process.exit(1);
}

async function testVertexAI() {
  console.log("\x1b[36m%s\x1b[0m", "🌱 Garden Assistant AI - Vertex AI Test");
  console.log("Testing connection to Google Cloud Vertex AI...");

  try {
    // Initialize Vertex AI
    console.log(`Project ID: ${config.projectId}`);
    console.log(`Location: ${config.location}`);
    console.log(`Model: ${config.modelName}`);

    const vertexAI = new VertexAI({
      project: config.projectId,
      location: config.location,
      credentials: config.credentials,
    });

    const generativeModel = vertexAI.preview.getGenerativeModel({
      model: config.modelName,
      generationConfig: {
        temperature: config.temperature,
        maxOutputTokens: config.maxOutputTokens,
      },
    });

    console.log("Sending test query to Vertex AI...");
    // Generate content
    const result = await generativeModel.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "What are three plants that grow well in Irish gardens? Keep it very brief.",
            },
          ],
        },
      ],
    });

    // Process response
    const responseText = result.response.candidates[0].content.parts[0].text;

    console.log("\x1b[32m%s\x1b[0m", "✅ Connection successful!");
    console.log("\nResponse from Vertex AI:");
    console.log("\x1b[33m%s\x1b[0m", responseText);

    console.log(
      "\n\x1b[32m%s\x1b[0m",
      "🎉 Your Vertex AI setup is working correctly!"
    );
    console.log(
      "You can now integrate it into your Garden Assistant application."
    );
  } catch (error) {
    console.error("\x1b[31m%s\x1b[0m", "❌ Error connecting to Vertex AI:");
    console.error(error);
    console.log("\nPossible issues:");
    console.log("1. Billing not enabled on your Google Cloud project");
    console.log("2. Vertex AI API not enabled");
    console.log("3. Invalid service account credentials");
    console.log("4. Insufficient permissions for the service account");
    console.log(
      "\nPlease check the VERTEX_AI_SETUP.md file for troubleshooting steps."
    );
  }
}

testVertexAI();
