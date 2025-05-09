// src/pages/api/log-test.js
// Test endpoint to generate log entries

import dotenv from 'dotenv';
import logger from '../../utils/logger';

// Load environment variables
dotenv.config();

/**
 * API endpoint to generate test log entries
 */
export async function GET() {
  try {
    // Generate some test log entries
    logger.debug('This is a debug message', { source: 'log-test-endpoint', timestamp: Date.now() });
    logger.info('Testing the logging system', { source: 'log-test-endpoint', user: 'admin' });
    logger.warn('This is a warning message', { source: 'log-test-endpoint', status: 'warning' });
    
    try {
      // Generate an error for testing
      throw new Error('Test error for logging system');
    } catch (error) {
      logger.error('Error occurred during test', error);
    }
    
    // Log information about Vertex AI configuration
    logger.info('Vertex AI configuration', {
      projectId: process.env.VERTEX_PROJECT_ID || 'not-set',
      location: process.env.VERTEX_LOCATION || 'not-set',
      model: process.env.VERTEX_MODEL || 'not-set',
      hasCredentialsJson: !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
      hasServiceAccountKey: !!process.env.VERTEX_SERVICE_ACCOUNT_KEY
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Test log entries generated successfully!',
      timestamp: new Date().toISOString(),
      logCount: 5
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Error generating test logs',
      message: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}