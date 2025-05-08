#!/usr/bin/env node
// validate-vertex-ai.js
// A comprehensive script to test Vertex AI connectivity and debug authentication issues
// Run with: node scripts/validate-vertex-ai.js

import { VertexAI } from "@google-cloud/vertexai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

// Configuration
const projectId = process.env.VERTEX_PROJECT_ID;
const location = process.env.VERTEX_LOCATION || "us-central1";
const modelName = process.env.VERTEX_MODEL || "gemini-2.0-flash-001";
const credentialsPath = process.env.VERTEX_SERVICE_ACCOUNT_KEY;
const temperature = parseFloat(process.env.TEMPERATURE || "0.7");
const maxTokens = parseInt(process.env.MAX_TOKENS || "1024");

// Console formatting
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

// Helper functions for pretty console output
const success = (text) => console.log(`${GREEN}${BOLD}✓${RESET} ${text}`);
const warn = (text) => console.log(`${YELLOW}${BOLD}!${RESET} ${text}`);
const error = (text) => console.log(`${RED}${BOLD}✗${RESET} ${text}`);
const header = (text) =>
  console.log(`\n${BOLD}${text}${RESET}\n${"=".repeat(60)}`);
const subheader = (text) =>
  console.log(`\n${BOLD}${text}${RESET}\n${"-".repeat(40)}`);

// Function to validate environment
function validateEnvironment() {
  header("Environment Validation");

  let isValid = true;
  let credentials = null;

  // Check project ID
  if (!projectId) {
    error(
      "VERTEX_PROJECT_ID environment variable is not set"
    );
    isValid = false;
  } else {
    success(`Project ID: ${projectId}`);
  }

  // Check for JSON credential content in environment
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    try {
      credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
      success("Using service account credentials from GOOGLE_APPLICATION_CREDENTIALS_JSON");
      
      if (credentials.type !== "service_account") {
        error("Invalid credentials: Not a service account key");
        isValid = false;
      } else {
        success("Credentials are a valid service account key");
        console.log(`  - Project ID in credentials: ${credentials.project_id}`);
        console.log(`  - Client email: ${credentials.client_email}`);

        // Check if project IDs match
        if (
          projectId &&
          credentials.project_id &&
          projectId !== credentials.project_id
        ) {
          warn(
            `Project ID mismatch: Environment (${projectId}) vs Credentials (${credentials.project_id})`
          );
        }
      }
    } catch (e) {
      error(`Failed to parse credentials from environment variable: ${e.message}`);
      isValid = false;
    }
  }
  // Check credentials path if JSON credentials not found in environment
  else if (!credentialsPath) {
    error("Neither GOOGLE_APPLICATION_CREDENTIALS_JSON nor VERTEX_SERVICE_ACCOUNT_KEY is set");
    warn("Set one of these variables for authentication");
    isValid = false;
  } else {
    success(`Credentials path: ${credentialsPath}`);

    // Check if the file exists
    if (!fs.existsSync(credentialsPath)) {
      error(`Credentials file not found at: ${credentialsPath}`);
      isValid = false;
    } else {
      success("Credentials file found");

      // Verify the file is valid JSON
      try {
        const credentialsContent = fs.readFileSync(credentialsPath, "utf8");
        credentials = JSON.parse(credentialsContent);

        if (credentials.type !== "service_account") {
          error("Invalid credentials file: Not a service account key");
          isValid = false;
        } else {
          success("Credentials file is a valid service account key");
          console.log(
            `  - Project ID in credentials: ${credentials.project_id}`
          );
          console.log(`  - Client email: ${credentials.client_email}`);

          // Check if project IDs match
          if (
            projectId &&
            credentials.project_id &&
            projectId !== credentials.project_id
          ) {
            warn(
              `Project ID mismatch: Environment (${projectId}) vs Credentials (${credentials.project_id})`
            );
          }
        }
      } catch (e) {
        error(`Failed to parse credentials file: ${e.message}`);
        isValid = false;
      }
    }
  }

  // Other config items
  console.log("\nConfiguration:");
  console.log(`  - Location: ${location}`);
  console.log(`  - Model: ${modelName}`);
  console.log(`  - Temperature: ${temperature}`);
  console.log(`  - Max tokens: ${maxTokens}`);

  return isValid;
}

// Function to test connectivity to Vertex AI
async function testVertexAI() {
  header("Vertex AI Connectivity Test");

  try {
    console.log("Initializing Vertex AI client...");

    // Initialize Vertex AI with appropriate credentials
    const vertexOptions = {
      project: projectId,
      location: location,
    };

    // Use JSON credentials from environment variable if available
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      try {
        const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
        vertexOptions.credentials = credentials;
        console.log("Using service account credentials from environment variable");
      } catch (error) {
        console.error("Error parsing credentials from environment variable:", error);
        throw error; // Re-throw to fail the test
      }
    } 
    // Otherwise use credentials file path
    else if (credentialsPath) {
      vertexOptions.googleAuthOptions = { keyFilename: credentialsPath };
      console.log("Using service account credentials from file:", credentialsPath);
    }

    const vertexAI = new VertexAI(vertexOptions);
    success("Vertex AI client initialized");

    console.log("\nGetting generative model...");
    const generativeModel = vertexAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: maxTokens,
      },
    });
    success("Generative model retrieved");

    console.log("\nSending test query to Vertex AI...");
    // Generate content with a simple gardening question
    const result = await generativeModel.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "What are three plants that grow well in Irish gardens? Keep it brief.",
            },
          ],
        },
      ],
    });

    // Extract and show response
    const response = result.response.candidates[0].content.parts[0].text;

    header("Test Results: SUCCESS");
    success("Connection to Vertex AI successful!");
    console.log("\nVertex AI response:");
    console.log(`\n${response}\n`);

    return true;
  } catch (e) {
    header("Test Results: FAILED");
    error(`Error connecting to Vertex AI: ${e.name}`);
    console.log(`\n${e.message}\n`);

    // Specific error handling based on error type
    if (e.message.includes("authentication") || e.name === "GoogleAuthError") {
      subheader("Authentication Problem Detected");
      console.log("The error is related to authentication. Try these steps:\n");
      console.log(
        "1. Verify your service account key is correct and not expired"
      );
      console.log(
        "2. Ensure your service account has the required permissions:"
      );
      console.log("   - roles/aiplatform.user");
      console.log("   - roles/storage.objectViewer");
      console.log("3. Check that the Vertex AI API is enabled in your project");
      console.log("4. Ensure billing is enabled for the Google Cloud project");
      console.log("\nTo authenticate manually, try one of these methods:");
      console.log("- Run: gcloud auth application-default login");
      console.log("- Set the VERTEX_SERVICE_ACCOUNT_KEY environment variable:");
      console.log(
        `  export VERTEX_SERVICE_ACCOUNT_KEY="${path.resolve(
          process.cwd(),
          "service-account-key.json"
        )}"`
      );
    } else if (
      e.message.includes("Permission denied") ||
      e.message.includes("permission")
    ) {
      subheader("Permission Problem Detected");
      console.log(
        "Your service account lacks the necessary permissions. Make sure it has:"
      );
      console.log("- roles/aiplatform.user");
      console.log("- roles/storage.objectViewer");
      console.log("\nTo grant these permissions, run:");
      console.log(`gcloud projects add-iam-policy-binding ${projectId} \\`);
      console.log(
        `  --member="serviceAccount:<YOUR_SERVICE_ACCOUNT_EMAIL>" \\`
      );
      console.log(`  --role="roles/aiplatform.user"`);
    } else if (
      e.message.includes("API not enabled") ||
      e.message.includes("has not been used")
    ) {
      subheader("API Not Enabled Problem Detected");
      console.log("The Vertex AI API may not be enabled. To enable it, run:");
      console.log(
        `gcloud services enable aiplatform.googleapis.com --project=${projectId}`
      );
    } else if (e.message.includes("billing")) {
      subheader("Billing Problem Detected");
      console.log(
        "This error may be related to billing. Make sure billing is enabled for your project."
      );
    }

    subheader("Recommended Actions");
    console.log(
      "1. Run the check-vertex-ai-setup.sh script to validate your setup"
    );
    console.log("   bash scripts/check-vertex-ai-setup.sh");
    console.log("2. Review VERTEX_AI_SETUP.md for detailed setup instructions");
    console.log("3. Check Google Cloud Console for any project issues");

    return false;
  }
}

// Main function
async function main() {
  console.log("\n🌱 Garden Assistant - Vertex AI Validation Tool\n");

  const envValid = validateEnvironment();
  if (!envValid) {
    console.log(
      "\nEnvironment validation failed. Fix the issues above before proceeding."
    );
    process.exit(1);
  }

  const testSuccess = await testVertexAI();
  if (!testSuccess) {
    process.exit(1);
  }

  console.log("\n🎉 Your Vertex AI setup is working correctly!");
}

// Execute the main function
main().catch((e) => {
  console.error("Unexpected error:", e);
  process.exit(1);
});
