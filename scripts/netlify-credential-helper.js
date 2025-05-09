#!/usr/bin/env node
// netlify-credential-helper.js
// A utility to format Google Cloud credentials properly for Netlify environment variables

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name from the file URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI colors for terminal output
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const BLUE = "\x1b[36m";
const RESET = "\x1b[0m";

/**
 * Helper script to format a service account key JSON file for Netlify environment variables
 * This ensures proper handling of newlines and special characters
 */
async function main() {
  console.log(BLUE + "🔑 Netlify Credential Helper" + RESET);
  console.log("============================");
  console.log("This utility helps format Google Cloud service account credentials");
  console.log("for use as environment variables in Netlify deployments.");
  console.log("");

  // Get input file path
  let filepath = process.argv[2];
  if (!filepath) {
    console.log(YELLOW + "⚠️ No file specified. Please provide a path to your service account JSON file." + RESET);
    console.log("Usage: node netlify-credential-helper.js /path/to/service-account-key.json");
    process.exit(1);
  }

  try {
    // Get full path
    filepath = path.resolve(filepath);
    console.log("Reading credentials from: " + filepath);

    // Check if file exists
    if (!fs.existsSync(filepath)) {
      console.error(RED + "❌ Error: File not found" + RESET);
      process.exit(1);
    }

    // Read the file content
    const fileContent = fs.readFileSync(filepath, 'utf8');

    // Try to parse it as JSON to validate
    let credentials;
    try {
      credentials = JSON.parse(fileContent);
      console.log(GREEN + "✅ Valid JSON detected" + RESET);
    } catch (error) {
      console.error(RED + "❌ Invalid JSON format: " + error.message + RESET);
      process.exit(1);
    }

    // Basic validation of credential structure
    if (!credentials.type || credentials.type !== 'service_account') {
      console.error(RED + "❌ Not a valid service account key (missing or invalid 'type' field)" + RESET);
      process.exit(1);
    }

    if (!credentials.private_key) {
      console.error(RED + "❌ Missing private_key field in credentials" + RESET);
      process.exit(1);
    }

    console.log("Credentials info:");
    console.log("- Project ID: " + credentials.project_id);
    console.log("- Client email: " + credentials.client_email);
    console.log("- Private key ID: " + credentials.private_key_id);

    // Ensure newlines in private key are preserved
    // No need for further processing since JSON.stringify handles this correctly

    // Create the formatted string for Netlify
    const formattedJson = JSON.stringify(credentials);
    
    // Output file path for the command version
    const outputPath = path.join(path.dirname(filepath), "netlify-formatted-credentials.txt");
    fs.writeFileSync(outputPath, formattedJson);

    console.log("\n" + GREEN + "✅ Credentials formatted successfully!" + RESET);
    console.log("\nTo set this in Netlify, use one of these methods:");

    console.log("\n1. Using Netlify CLI (RECOMMENDED):");
    console.log("---------------------------------------");
    console.log("netlify env:set GOOGLE_APPLICATION_CREDENTIALS_JSON '" + formattedJson + "'");
    
    console.log("\n2. Copy the formatted credentials from this file:");
    console.log("---------------------------------------");
    console.log(outputPath);
    
    console.log("\n3. Using a command to set from the original file:");
    console.log("---------------------------------------");
    console.log("netlify env:set GOOGLE_APPLICATION_CREDENTIALS_JSON \"$(cat " + filepath + ")\"");
    
    console.log("\nIMPORTANT: When setting environment variables in the Netlify UI, make sure to");
    console.log("properly escape all special characters, especially newlines in the private key.");

  } catch (error) {
    console.error(RED + "❌ Error: " + error.message + RESET);
    process.exit(1);
  }
}

// Run the main function
main().catch(console.error);