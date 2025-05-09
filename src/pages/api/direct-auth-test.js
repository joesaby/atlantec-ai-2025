// src/pages/api/direct-auth-test.js
// Test endpoint for direct Google Cloud authentication

import { GoogleAuth } from 'google-auth-library';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * API endpoint that tests Google Cloud authentication directly
 * Using the base-level Google Auth library to eliminate other factors
 */
export async function GET() {
  try {
    // Log environment variables for debugging
    console.log(`[DIRECT-AUTH-TEST] Testing direct Google authentication
  - Has GOOGLE_APPLICATION_CREDENTIALS_JSON: ${!!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON}
  - JSON length: ${process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON?.length || 0}
`);
    
    let credentials;
    let authClient;
    let tokenInfo;
    
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      try {
        // Parse credentials from environment variable
        credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
        console.log(`[DIRECT-AUTH-TEST] Parsed credentials for project: ${credentials.project_id}`);
        
        // Create auth client directly with the credentials object
        authClient = new GoogleAuth({
          credentials,
          scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });
        
        // Get access token
        console.log(`[DIRECT-AUTH-TEST] Getting access token...`);
        const client = await authClient.getClient();
        const token = await client.getAccessToken();
        
        tokenInfo = {
          token_type: token.token_type,
          expiry_date: token.expiry_date,
          token_preview: token.token ? `${token.token.substring(0, 10)}...` : 'No token'
        };
        
        console.log(`[DIRECT-AUTH-TEST] Successfully authenticated!`);
      } catch (error) {
        console.error(`[DIRECT-AUTH-TEST] Authentication error: ${error.message}`);
        throw error;
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      method: 'direct_google_auth',
      project_id: credentials?.project_id,
      client_email: credentials?.client_email,
      token_info: tokenInfo
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
      stack: error.stack
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}