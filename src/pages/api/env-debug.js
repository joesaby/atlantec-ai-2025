// src/pages/api/env-debug.js
// Debugging endpoint to safely check environment variables in Netlify

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * API endpoint that lists available environment variables (names only, not values)
 * and checks if specific variables exist
 */
export async function GET() {
  try {
    // IMPORTANT: We only return variable names, never their values
    // for security reasons
    const envVars = Object.keys(process.env).sort();
    
    // Check for specific environment variables (just checking existence)
    const checks = {
      LOGS_API_KEY: !!process.env.LOGS_API_KEY,
      VERTEX_PROJECT_ID: !!process.env.VERTEX_PROJECT_ID,
      VERTEX_SERVICE_ACCOUNT_KEY: !!process.env.VERTEX_SERVICE_ACCOUNT_KEY,
      GOOGLE_APPLICATION_CREDENTIALS_JSON: !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
      NODE_ENV: process.env.NODE_ENV || 'not set'
    };
    
    // Filter out any variables that might contain sensitive data
    const safeVars = envVars.filter(varName => {
      const lowercaseName = varName.toLowerCase();
      return !lowercaseName.includes('key') && 
             !lowercaseName.includes('secret') && 
             !lowercaseName.includes('token') &&
             !lowercaseName.includes('password') &&
             !lowercaseName.includes('credential');
    });
    
    return new Response(JSON.stringify({
      environment: process.env.NODE_ENV || 'not set',
      runtime: process.env.RUNTIME || 'unknown',
      platformName: process.env.PLATFORM_NAME || 'unknown',
      specificChecks: checks,
      availableVars: safeVars,
      totalVarsCount: envVars.length,
      sensitiveVarsCount: envVars.length - safeVars.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Error checking environment',
      message: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}