#!/usr/bin/env node
// generate-netlify-commands.js
// Generates commands for setting Netlify environment variables correctly

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
  console.log(BLUE + "📝 Netlify Environment Variable Setup Generator" + RESET);
  console.log("===============================================\n");
  
  // Get input file path
  let filepath = process.argv[2];
  if (!filepath) {
    console.log(YELLOW + "⚠️ No file specified. Please provide a path to your service account JSON file." + RESET);
    console.log("Usage: node generate-netlify-commands.js /path/to/service-account-key.json");
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
    
    // Fix private key if needed
    let modified = false;
    if (credentials.private_key && credentials.private_key.includes('\\n') && !credentials.private_key.includes('\n')) {
      console.log(YELLOW + "⚠️ Fixing private key newlines..." + RESET);
      credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
      modified = true;
    }
    
    // Create a temporary file with the fixed credentials if needed
    const outputPath = modified 
      ? path.join(path.dirname(filepath), "fixed-credentials.json")
      : filepath;
    
    if (modified) {
      fs.writeFileSync(outputPath, JSON.stringify(credentials, null, 2));
      console.log(GREEN + `✅ Saved fixed credentials to: ${outputPath}` + RESET);
    }
    
    // Generate the commands
    console.log("\n" + GREEN + "✅ Generated Netlify CLI commands:" + RESET);
    console.log("Copy and paste these commands to set up your Netlify environment variables correctly:\n");
    
    console.log("# Set the project ID");
    console.log(`netlify env:set VERTEX_PROJECT_ID "${credentials.project_id}"`);
    
    console.log("\n# Set the location (using recommended default)");
    console.log(`netlify env:set VERTEX_LOCATION "us-central1"`);
    
    console.log("\n# Set the model (using recommended default)");
    console.log(`netlify env:set VERTEX_MODEL "gemini-2.0-flash-001"`);
    
    console.log("\n# Set the temperature (using recommended default)");
    console.log(`netlify env:set TEMPERATURE "0.7"`);
    
    console.log("\n# Set the max tokens (using recommended default)");
    console.log(`netlify env:set MAX_TOKENS "1024"`);
    
    console.log("\n# Set the credentials JSON");
    console.log(`netlify env:set GOOGLE_APPLICATION_CREDENTIALS_JSON "$(cat ${outputPath})"`);
    
    console.log("\n# Enable Vertex AI");
    console.log(`netlify env:set USE_VERTEX_AI "true"`);
    
    console.log("\n# IMPORTANT: Do not run these commands with your original service account key JSON");
    console.log("# Always use the fixed version produced by this script");
    
  } catch (error) {
    console.error(RED + `❌ Error: ${error.message}` + RESET);
    process.exit(1);
  }
}

// Run the main function
main().catch(console.error);