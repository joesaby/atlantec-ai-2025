// Test script to verify Vertex AI setup
// Run with: node --experimental-json-modules scripts/test-vertex-ai.js

import { VertexAI } from "@google-cloud/vertexai";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import fs from "fs";

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolve the path to the .env file in the project root
const envPath = resolve(__dirname, "..", ".env");

// Check if .env file exists
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log("Environment variables loaded from .env file");
} else {
  console.warn(
    "\x1b[33m%s\x1b[0m",
    "Warning: No .env file found. Make sure environment variables are set."
  );
}

// Check required environment variables
const requiredEnvVars = [
  "GOOGLE_CLOUD_PROJECT",
  "GOOGLE_APPLICATION_CREDENTIALS",
];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(
    "\x1b[31m%s\x1b[0m",
    `Error: Missing required environment variables: ${missingVars.join(", ")}`
  );
  console.log(
    "Please run the setup script first: ./scripts/setup-vertex-ai.sh"
  );
  process.exit(1);
}

// Check if credentials file exists
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!fs.existsSync(credentialsPath)) {
  console.error(
    "\x1b[31m%s\x1b[0m",
    `Error: Credentials file not found at ${credentialsPath}`
  );
  console.log(
    "Please run the setup script first: ./scripts/setup-vertex-ai.sh"
  );
  process.exit(1);
}

async function testVertexAI() {
  console.log("\x1b[36m%s\x1b[0m", "🌱 Garden Assistant AI - Vertex AI Test");
  console.log("Testing connection to Google Cloud Vertex AI...");

  try {
    // Initialize Vertex AI
    const projectId = process.env.GOOGLE_CLOUD_PROJECT;
    const location = "europe-west4"; // Use a region close to Ireland
    console.log(`Project ID: ${projectId}`);
    console.log(`Location: ${location}`);

    const vertexAI = new VertexAI({ project: projectId, location });

    // Get the generative model (Gemini)
    const modelName = process.env.GOOGLE_AI_MODEL || "gemini-1.0-pro";
    console.log(`Model: ${modelName}`);

    const generativeModel = vertexAI.preview.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: parseFloat(process.env.TEMPERATURE || "0.7"),
        maxOutputTokens: parseInt(process.env.MAX_TOKENS || "1024"),
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
