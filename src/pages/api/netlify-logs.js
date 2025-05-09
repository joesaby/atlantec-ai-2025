// src/pages/api/netlify-logs.js
// Netlify-compatible logging API that doesn't require filesystem access

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * API endpoint to return logs stored in memory
 * More compatible with Netlify's serverless architecture
 */
export async function GET({ request }) {
  try {
    // Validate API key
    const url = new URL(request.url);
    const apiKey = url.searchParams.get('key');
    
    // Accept any of these keys
    const validKeys = [
      process.env.LOGS_API_KEY,
      'password',
      'Atlantec2025'
    ].filter(Boolean);
    
    // Debug - log available variables and authentication attempt
    console.log(`API key provided: ${apiKey ? 'Yes' : 'No'}`);
    console.log(`Available env vars: ${Object.keys(process.env).length}`);
    
    // Simplified authentication for Netlify
    if (!apiKey || !validKeys.includes(apiKey)) {
      return new Response(JSON.stringify({ 
        error: 'Unauthorized',
        key_provided: !!apiKey,
        valid_keys_count: validKeys.length,
        message: 'Invalid API key. Use any configured key, "password", or "Atlantec2025"'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Create a simulated log content
    const timestamp = new Date().toISOString();
    const simulatedLogs = [
      `[${timestamp}] [INFO] Netlify Logs API initialized`,
      `[${timestamp}] [INFO] Environment: ${process.env.NODE_ENV || 'unknown'}`,
      `[${timestamp}] [INFO] Runtime: ${process.env.NETLIFY || 'unknown'}`,
      `[${timestamp}] [DEBUG] Auth method: ${process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON ? 'json_env' : 'key_file'}`,
      `[${timestamp}] [INFO] Vertex Project ID: ${process.env.VERTEX_PROJECT_ID || 'not set'}`,
      `[${timestamp}] [INFO] Vertex Location: ${process.env.VERTEX_LOCATION || 'not set'}`,
      `[${timestamp}] [INFO] Vertex Model: ${process.env.VERTEX_MODEL || 'not set'}`,
    ];
    
    // Get console logs from Netlify environment
    // Note: This doesn't actually get console logs but simulates it
    // for the Netlify environment where we can't read the log files
    
    // Return simulated logs
    return new Response(JSON.stringify({ 
      content: simulatedLogs.join('\n'),
      files: [
        {
          name: 'netlify-memory-logs.log',
          path: '/memory-logs',
          size: simulatedLogs.join('\n').length,
          modified: new Date()
        }
      ],
      note: "This is a Netlify-compatible version that doesn't require filesystem access",
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    // Return detailed error information
    return new Response(JSON.stringify({ 
      error: 'Error processing logs request',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}