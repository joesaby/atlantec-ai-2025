// src/pages/api/unified-logs.js
// Consolidated logging API endpoint that works in both development and Netlify environments

import dotenv from 'dotenv';
import logger from '../../utils/unified-logger.js';

// Load environment variables
dotenv.config();

/**
 * API endpoint to retrieve logs with authentication
 * - In development mode: Returns file-based logs
 * - In Netlify mode: Returns simulated logs from environment variables
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
    
    // Debug - log authentication attempt
    logger.debug(`Logs API request received`, { 
      key_provided: !!apiKey,
      isNetlify: !!process.env.NETLIFY
    });
    
    // Simple authentication for both environments
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

    // Determine if running in Netlify environment
    const isNetlify = !!process.env.NETLIFY || process.env.NODE_ENV === 'production';
    
    let content;
    let files;
    
    if (isNetlify) {
      // In Netlify: Create simulated logs from environment info
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
      
      content = simulatedLogs.join('\n');
      files = [{
        name: 'netlify-memory-logs.log',
        path: '/memory-logs',
        size: content.length,
        modified: new Date()
      }];
    } else {
      // In development: Get actual log files
      content = logger.getLogContent();
      files = logger.getLogFiles();
    }
    
    // Return logs with appropriate response format
    return new Response(JSON.stringify({ 
      content,
      files,
      environment: isNetlify ? 'netlify' : 'development',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    // Log the error
    logger.error('Error in logs API endpoint', error);
    
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