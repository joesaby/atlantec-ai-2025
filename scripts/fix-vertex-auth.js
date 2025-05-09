#!/usr/bin/env node
// fix-vertex-auth.js
// A script to fix common Vertex AI authentication issues

import { GoogleAuth } from 'google-auth-library';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { VertexAI } from '@google-cloud/vertexai';

// ANSI colors
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[36m";
const RESET = "\x1b[0m";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log(BLUE + "🔧 Vertex AI Authentication Fixer" + RESET);
  console.log("================================\n");
  
  // 1. Basic environment check
  const projectId = process.env.VERTEX_PROJECT_ID;
  const location = process.env.VERTEX_LOCATION || 'us-central1';
  const model = process.env.VERTEX_MODEL || 'gemini-2.0-flash-001';
  const credJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  const keyPath = process.env.VERTEX_SERVICE_ACCOUNT_KEY;
  
  console.log("Environment check:");
  console.log(`- VERTEX_PROJECT_ID: ${projectId ? GREEN + "✓" + RESET : RED + "✗" + RESET}`);
  console.log(`- VERTEX_LOCATION: ${location ? GREEN + "✓" + RESET : RED + "✗" + RESET}`);
  console.log(`- VERTEX_MODEL: ${model ? GREEN + "✓" + RESET : RED + "✗" + RESET}`);
  console.log(`- GOOGLE_APPLICATION_CREDENTIALS_JSON: ${credJson ? GREEN + "✓" + RESET + ` (${credJson.length} chars)` : RED + "✗" + RESET}`);
  console.log(`- VERTEX_SERVICE_ACCOUNT_KEY: ${keyPath ? GREEN + "✓" + RESET : RED + "✗" + RESET}`);
  
  if (!projectId) {
    console.log(RED + "\n❌ VERTEX_PROJECT_ID is not set. This is required." + RESET);
    process.exit(1);
  }
  
  // 2. Credentials check
  if (!credJson && !keyPath) {
    console.log(RED + "\n❌ No credentials available. Set either GOOGLE_APPLICATION_CREDENTIALS_JSON or VERTEX_SERVICE_ACCOUNT_KEY." + RESET);
    process.exit(1);
  }
  
  let credentials = null;
  let authMethod = null;
  
  // 3. Try to parse credentials from JSON
  if (credJson) {
    try {
      console.log("\nParsing credentials from GOOGLE_APPLICATION_CREDENTIALS_JSON...");
      credentials = JSON.parse(credJson);
      
      console.log(GREEN + "✅ JSON successfully parsed" + RESET);
      console.log(`- Project ID: ${credentials.project_id}`);
      console.log(`- Client email: ${credentials.client_email}`);
      
      // Verify project ID matches
      if (projectId !== credentials.project_id) {
        console.log(YELLOW + "⚠️ Warning: Project ID mismatch!" + RESET);
        console.log(`- Environment: ${projectId}`);
        console.log(`- Credentials: ${credentials.project_id}`);
      }
      
      // Check private key
      if (!credentials.private_key) {
        console.log(RED + "❌ Missing private_key in credentials" + RESET);
      } else {
        // Check if private_key has proper newlines
        if (credentials.private_key.includes('\n')) {
          console.log(GREEN + "✅ Private key has proper newlines" + RESET);
        } else if (credentials.private_key.includes('\\n')) {
          console.log(RED + "❌ Private key has escaped newlines ('\\n') but no actual newlines" + RESET);
          
          // Fix the credentials
          console.log(YELLOW + "⚠️ Attempting to fix private key..." + RESET);
          credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
          console.log(GREEN + "✅ Fixed private key by converting escaped newlines to actual newlines" + RESET);
          
          // Export fixed credentials
          const fixedPath = path.join(__dirname, 'fixed-credentials.json');
          fs.writeFileSync(fixedPath, JSON.stringify(credentials, null, 2));
          console.log(GREEN + `✅ Saved fixed credentials to: ${fixedPath}` + RESET);
          console.log(YELLOW + "Re-set the environment variable with:" + RESET);
          console.log(`netlify env:set GOOGLE_APPLICATION_CREDENTIALS_JSON "$(cat ${fixedPath})"`);
        }
      }
      
      authMethod = 'credentials_json';
    } catch (error) {
      console.log(RED + `❌ Failed to parse credentials JSON: ${error.message}` + RESET);
      // Continue to try other methods
    }
  }
  
  // 4. Try to use key file
  if (!credentials && keyPath) {
    try {
      console.log("\nUsing service account key file...");
      
      if (fs.existsSync(keyPath)) {
        console.log(GREEN + "✅ Key file exists" + RESET);
        
        // Read and parse the file
        const keyContent = fs.readFileSync(keyPath, 'utf8');
        try {
          const keyJson = JSON.parse(keyContent);
          console.log(GREEN + "✅ Key file contains valid JSON" + RESET);
          console.log(`- Project ID: ${keyJson.project_id}`);
          
          credentials = keyJson;
          authMethod = 'key_file';
        } catch (error) {
          console.log(RED + `❌ Failed to parse key file: ${error.message}` + RESET);
        }
      } else {
        console.log(RED + `❌ Key file not found at: ${keyPath}` + RESET);
      }
    } catch (error) {
      console.log(RED + `❌ Error accessing key file: ${error.message}` + RESET);
    }
  }
  
  // 5. Try direct authentication
  if (credentials) {
    try {
      console.log("\nTesting direct Google authentication...");
      const auth = new GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
      });
      
      const client = await auth.getClient();
      console.log(GREEN + "✅ Successfully got auth client" + RESET);
      
      const token = await client.getAccessToken();
      console.log(GREEN + "✅ Successfully acquired access token" + RESET);
      console.log(`- Token expires: ${new Date(token.expiry_date).toISOString()}`);
      
      // 6. Try Vertex AI
      try {
        console.log("\nTesting Vertex AI authentication...");
        
        const vertexAI = new VertexAI({
          project: projectId,
          location: location,
          credentials: credentials
        });
        
        console.log(GREEN + "✅ Successfully initialized Vertex AI client" + RESET);
        
        // Get generative model
        const generativeModel = vertexAI.getGenerativeModel({
          model: model
        });
        
        console.log(GREEN + "✅ Successfully got generative model" + RESET);
        
        // Try a simple request
        console.log("Sending a simple test request to Vertex AI...");
        const result = await generativeModel.generateContent({
          contents: [{ role: "user", parts: [{ text: "Hello, how are you?" }] }],
        });
        
        console.log(GREEN + "✅ Successfully received response from Vertex AI" + RESET);
        const response = result.response.candidates[0].content.parts[0].text;
        console.log(`- Response: "${response.substring(0, 50)}..."`);
        
        console.log(GREEN + "\n🎉 ALL TESTS PASSED! Your Vertex AI authentication is working properly" + RESET);
      } catch (vertexError) {
        console.log(RED + `❌ Vertex AI error: ${vertexError.message}` + RESET);
        
        // Check for specific error types
        if (vertexError.message.includes('permission')) {
          console.log(YELLOW + "This appears to be a permissions issue. Make sure your service account has roles/aiplatform.user role." + RESET);
        } else if (vertexError.message.includes('API not enabled')) {
          console.log(YELLOW + "The Vertex AI API is not enabled in this project." + RESET);
          console.log("Enable it with: gcloud services enable aiplatform.googleapis.com --project=" + projectId);
        } else if (vertexError.message.includes('billing')) {
          console.log(YELLOW + "This appears to be a billing issue. Make sure billing is enabled for your project." + RESET);
        }
      }
    } catch (error) {
      console.log(RED + `❌ Google Auth error: ${error.message}` + RESET);
    }
  } else {
    console.log(RED + "\n❌ No valid credentials available. Cannot proceed with authentication tests." + RESET);
  }
  
  // Final advice
  console.log("\nSuggested next steps:");
  console.log("1. Make sure the Vertex AI API is enabled in your project");
  console.log("2. Verify your service account has the required permissions");
  console.log("3. Use the netlify-credential-helper.js script to properly format your credentials");
  console.log("4. Set the environment variables in Netlify using the Netlify CLI");
}

main().catch(error => {
  console.error(RED + "Fatal error:" + RESET, error);
  process.exit(1);
});