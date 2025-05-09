#!/usr/bin/env node
// verify-credentials.js
// A simple script to directly verify credentials

import { GoogleAuth } from 'google-auth-library';

// Simple direct test
async function main() {
  console.log("Verifying credentials directly with Google Auth...");
  
  try {
    // Get the value from the environment variable
    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    
    if (!credentialsJson) {
      console.error("❌ GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is not set");
      process.exit(1);
    }
    
    console.log(`Credential JSON length: ${credentialsJson.length} characters`);
    
    // Parse credentials
    console.log("Parsing credentials from environment variable...");
    const credentials = JSON.parse(credentialsJson);
    
    console.log("✅ Successfully parsed JSON");
    console.log(`Project ID: ${credentials.project_id}`);
    console.log(`Client email: ${credentials.client_email}`);
    
    // Check private key
    if (credentials.private_key) {
      console.log("Private key exists");
      
      // Check for proper newline formatting
      if (credentials.private_key.includes('\n')) {
        console.log("✅ Private key contains actual newlines (good)");
      } else if (credentials.private_key.includes('\\n')) {
        console.log("❌ Private key contains escaped newlines '\\n' but no actual newlines (problematic)");
      } else {
        console.log("❌ Private key doesn't contain any newlines (problematic)");
      }
      
      // Log the first few characters
      console.log(`Private key begins with: ${credentials.private_key.substring(0, 30)}...`);
    } else {
      console.error("❌ Missing private_key in credentials");
    }
    
    // Try direct authentication
    console.log("\nTesting authentication directly with Google Auth...");
    const auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    
    console.log("Getting client...");
    const client = await auth.getClient();
    
    console.log("Getting access token...");
    const token = await client.getAccessToken();
    
    console.log("✅ Successfully authenticated!");
    console.log(`Token type: ${token.token_type}`);
    console.log(`Expires: ${new Date(token.expiry_date).toISOString()}`);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    
    if (error instanceof SyntaxError) {
      console.error("This is a JSON parsing error. Your credentials JSON is not properly formatted.");
    }
    
    console.error("\nFull error:", error);
  }
}

// Run the script
main().catch(console.error);