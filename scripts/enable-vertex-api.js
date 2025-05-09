#!/usr/bin/env node
// enable-vertex-api.js
// Generates commands to enable the Vertex AI API for your project

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI colors
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[36m";
const RESET = "\x1b[0m";

async function main() {
  console.log(BLUE + "🔧 Vertex AI API Enablement Helper" + RESET);
  console.log("=================================\n");
  
  // Get input file path
  let filepath = process.argv[2];
  if (!filepath) {
    console.log(YELLOW + "⚠️ No file specified. Please provide a path to your service account JSON file." + RESET);
    console.log("Usage: node enable-vertex-api.js /path/to/service-account-key.json");
    process.exit(1);
  }
  
  // Resolve full path
  filepath = path.resolve(filepath);
  
  try {
    console.log(`Reading credentials from: ${filepath}`);
    
    // Check if file exists
    if (!fs.existsSync(filepath)) {
      console.error(RED + "❌ Error: File not found" + RESET);
      process.exit(1);
    }
    
    // Read and parse the file
    const fileContent = fs.readFileSync(filepath, 'utf8');
    
    // Try to parse it as JSON
    let credentials;
    try {
      credentials = JSON.parse(fileContent);
      console.log(GREEN + "✅ Valid JSON detected" + RESET);
    } catch (error) {
      console.error(RED + `❌ Invalid JSON format: ${error.message}` + RESET);
      process.exit(1);
    }
    
    // Basic validation
    if (!credentials.type || credentials.type !== 'service_account') {
      console.error(RED + "❌ Not a valid service account key (missing or invalid 'type' field)" + RESET);
      process.exit(1);
    }
    
    if (!credentials.project_id) {
      console.error(RED + "❌ Missing project_id in credentials" + RESET);
      process.exit(1);
    }
    
    // Show project info
    console.log(`Project ID: ${credentials.project_id}`);
    console.log(`Service Account: ${credentials.client_email}`);
    
    // Generate the commands
    console.log("\n" + GREEN + "✅ Commands to enable Vertex AI API:" + RESET);
    console.log("Run these commands to enable the Vertex AI API and grant permissions:\n");
    
    console.log("# Enable the Vertex AI API");
    console.log(`gcloud services enable aiplatform.googleapis.com --project=${credentials.project_id}`);
    
    console.log("\n# Grant the necessary roles to your service account");
    console.log(`gcloud projects add-iam-policy-binding ${credentials.project_id} \\`);
    console.log(`  --member="serviceAccount:${credentials.client_email}" \\`);
    console.log(`  --role="roles/aiplatform.user"`);
    
    console.log(`\ngcloud projects add-iam-policy-binding ${credentials.project_id} \\`);
    console.log(`  --member="serviceAccount:${credentials.client_email}" \\`);
    console.log(`  --role="roles/storage.objectViewer"`);
    
    console.log("\n# Verify the Vertex AI API is enabled");
    console.log(`gcloud services list --project=${credentials.project_id} --filter="name:aiplatform.googleapis.com" --format="value(NAME)"`);
    
    console.log("\n# Verify that billing is enabled for the project");
    console.log(`gcloud billing projects describe ${credentials.project_id} --format="value(billingEnabled)"`);
    
    console.log("\n" + YELLOW + "Important Notes:" + RESET);
    console.log("1. You must have the gcloud CLI installed and be logged in");
    console.log("2. You need permissions to enable APIs and assign roles");
    console.log("3. Billing must be enabled for your project");
    console.log("4. After enabling the API, it may take a few minutes to propagate");
    
  } catch (error) {
    console.error(RED + `❌ Error: ${error.message}` + RESET);
    process.exit(1);
  }
}

// Run the main function
main().catch(console.error);