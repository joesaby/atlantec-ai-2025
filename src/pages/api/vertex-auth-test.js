// src/pages/api/vertex-auth-test.js
// Test endpoint for Vertex AI authentication using vertex-client.js

import dotenv from 'dotenv';
import vertexClient from '../../utils/vertex-client.js';
import logger from '../../utils/unified-logger.js';

// Load environment variables
dotenv.config();

/**
 * API endpoint that tests Vertex AI authentication using the unified vertex-client
 */
export async function GET(context) {
  try {
    // Get configuration from environment
    const projectId = process.env.VERTEX_PROJECT_ID;
    const location = process.env.VERTEX_LOCATION || "europe-west1";
    const modelName = process.env.VERTEX_MODEL || "gemini-2.0-flash-001";
    
    // Check for running environment
    const isNetlify = !!process.env.NETLIFY;
    const environment = isNetlify ? 'netlify' : 'development';
    
    // Check if this is an advanced test
    const url = new URL(context.request.url);
    const isAdvancedTest = url.searchParams.get('advanced') === 'true';
    
    // Log test request
    logger.info(`Running ${isAdvancedTest ? 'advanced' : 'standard'} Vertex AI auth test`, {
      component: "VERTEX-AUTH-TEST",
      environment,
      projectId,
      location,
      endpoint: isAdvancedTest ? 'advanced' : 'standard'
    });
    
    // For advanced test, we'll use a more comprehensive test
    if (isAdvancedTest) {
      // Create a unified client and attempt a token count operation
      const client = await vertexClient.createUnifiedClient();
      
      // Test with a simple message
      const tokenCount = await client.countTokens([
        { role: "user", content: "Hello, what's your name?" }
      ]);
      
      logger.info("Advanced auth test successful", {
        component: "VERTEX-AUTH-TEST",
        provider: client.provider,
        tokenCount
      });
      
      // Return success response with details
      return new Response(JSON.stringify({
        success: true,
        details: {
          provider: client.provider,
          tokenCount,
          projectId,
          environment,
          timestamp: new Date().toISOString()
        }
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else {
      // Use the generateVertexResponse function for a standard test
      const response = await vertexClient.generateVertexResponse([
        { role: "user", content: "Hello, what's your name?" }
      ]);
      
      logger.info("Standard auth test successful", {
        component: "VERTEX-AUTH-TEST",
        responseLength: response.length
      });
      
      // Return success response with details
      return new Response(JSON.stringify({
        success: true,
        details: {
          projectId,
          location,
          model: modelName,
          responsePreview: response.substring(0, 100) + (response.length > 100 ? '...' : ''),
          environment,
          timestamp: new Date().toISOString()
        }
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    // Log the error
    logger.error("Vertex AI authentication test failed", {
      component: "VERTEX-AUTH-TEST",
      error: error.message,
      stack: error.stack
    });
    
    // Analyze the error to provide more helpful information
    let errorType = 'unknown';
    
    // Check for common error patterns
    if (error.name === 'GoogleAuthError' || error.message.includes('authentication') || error.message.includes('authenticate')) {
      errorType = 'authentication';
    } else if (error.message.includes('permission') || error.message.includes('Permission denied')) {
      errorType = 'permission';
    } else if (error.message.includes('API not enabled') || error.message.includes('has not been used')) {
      errorType = 'api_not_enabled';
    } else if (error.message.includes('billing')) {
      errorType = 'billing';
    } else if (error.message.includes('private_key')) {
      errorType = 'private_key';
    } else if (error instanceof SyntaxError && error.message.includes('JSON')) {
      errorType = 'json_parse';
    }
    
    // Return error response
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      errorType,
      details: {
        name: error.name,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}