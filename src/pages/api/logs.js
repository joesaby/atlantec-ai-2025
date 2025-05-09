// src/pages/api/logs.js
// Endpoint to fetch application logs with authentication

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * API endpoint to fetch application logs
 * Requires an API key for authentication
 */
export async function GET({ request }) {
  try {
    // Validate API key
    const url = new URL(request.url);
    const apiKey = url.searchParams.get('key');
    
    // Get the expected API key
    const expectedKey = process.env.LOGS_API_KEY;
    
    // Debug - log the issue (but not the actual keys)
    console.log(`API key provided: ${apiKey ? 'Yes' : 'No'}`);
    console.log(`Environment variable LOGS_API_KEY exists: ${expectedKey ? 'Yes' : 'No'}`);
    console.log('All environment variables available:', Object.keys(process.env).join(', '));
    
    // Temporary workaround for .env loading issues in serverless functions
    // Accept 'password' as a valid key if no env var is set (only for debugging)
    const fallbackKey = 'password';
    const usesFallbackKey = !expectedKey && apiKey === fallbackKey;
    
    // Accept any key in development to make testing easier
    const isDev = process.env.NODE_ENV === 'development';
    
    // Compare with environment variable (with fallbacks for development/debugging)
    if (!apiKey || (!isDev && apiKey !== expectedKey && !usesFallbackKey)) {
      return new Response(JSON.stringify({ 
        error: 'Unauthorized',
        key_provided: !!apiKey,
        env_key_exists: !!expectedKey,
        is_dev: isDev
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Get log file path
    const logDir = path.resolve(process.cwd(), 'logs');
    
    // Ensure the logs directory exists
    if (!fs.existsSync(logDir)) {
      try {
        fs.mkdirSync(logDir, { recursive: true });
        console.log(`Created logs directory at ${logDir}`);
      } catch (err) {
        console.error(`Failed to create logs directory: ${err.message}`);
      }
    }
    
    const logFilePath = path.join(logDir, 'app.log');
    
    // Check if log file exists - create empty one if it doesn't
    if (!fs.existsSync(logFilePath)) {
      try {
        fs.writeFileSync(logFilePath, `[${new Date().toISOString()}] [INFO] Log file initialized\n`);
        console.log(`Created new log file at ${logFilePath}`);
      } catch (err) {
        console.error(`Failed to create log file: ${err.message}`);
        
        return new Response(JSON.stringify({ 
          error: 'Log system not initialized',
          message: `Could not create log file: ${err.message}`,
          directory: logDir,
          file: 'app.log'
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
    }
    
    // Read log file (last 100KB to limit size)
    const fileSize = fs.statSync(logFilePath).size;
    const readSize = Math.min(fileSize, 100 * 1024); // Max 100KB
    const position = Math.max(0, fileSize - readSize);
    
    // Create a read stream for the log file
    const logContent = fs.readFileSync(
      logFilePath, 
      { encoding: 'utf8', start: position, end: fileSize }
    );
    
    // List all log files
    const logFiles = fs.readdirSync(logDir)
      .filter(file => file.endsWith('.log'))
      .map(file => ({
        name: file,
        path: `/logs/${file}`,
        size: fs.statSync(path.join(logDir, file)).size,
        modified: fs.statSync(path.join(logDir, file)).mtime
      }))
      .sort((a, b) => b.modified - a.modified);

    // Return response
    return new Response(JSON.stringify({ 
      content: logContent,
      files: logFiles,
      truncated: position > 0
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Error reading logs',
      message: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}