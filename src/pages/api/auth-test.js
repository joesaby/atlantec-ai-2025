// src/pages/api/auth-test.js
// Test endpoint for Vertex AI authentication

import dotenv from 'dotenv';
import { VertexAI } from "@google-cloud/vertexai";
import fs from 'fs';

// Load environment variables
dotenv.config();

/**
 * API endpoint that tests Vertex AI authentication without any abstraction
 * This is a stripped-down test to isolate authentication issues
 */
export async function GET() {
  try {
    // Get configuration from environment
    const projectId = process.env.VERTEX_PROJECT_ID;
    const location = process.env.VERTEX_LOCATION || "europe-west1";
    const modelName = process.env.VERTEX_MODEL || "gemini-2.0-flash-001";
    
    // Attempt to parse credentials from environment variable
    let authSuccess = false;
    let authMethod = 'none';
    let credentials = null;
    let vertexOptions = {
      project: projectId,
      location: location
    };
    
    // Check for running environment
    const isNetlify = !!process.env.NETLIFY;
    const environment = isNetlify ? 'netlify' : 'development';
    
    // Collect diagnostic info
    const diagnosticInfo = {
      environment,
      projectId,
      location,
      modelName,
      hasEnvCredentialsJson: !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
      envCredentialsJsonLength: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON?.length || 0,
      hasKeyFilePath: !!process.env.VERTEX_SERVICE_ACCOUNT_KEY,
      keyFilePath: process.env.VERTEX_SERVICE_ACCOUNT_KEY || 'not set',
      credentialValidation: {
        jsonValid: false,
        hasRequiredFields: false,
        projectIdMatch: false,
        issues: []
      }
    };
    
    // Log environment variables for debugging
    console.log(`[AUTH-TEST] Configuration:
  - Environment: ${environment} 
  - Project ID: ${projectId}
  - Location: ${location}
  - Model: ${modelName}
  - Has GOOGLE_APPLICATION_CREDENTIALS_JSON: ${!!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON}
  - GOOGLE_APPLICATION_CREDENTIALS_JSON length: ${process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON?.length || 0}
  - Has VERTEX_SERVICE_ACCOUNT_KEY: ${!!process.env.VERTEX_SERVICE_ACCOUNT_KEY}
`);
    
    // Try to use JSON credentials from environment
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      try {
        console.log("[AUTH-TEST] Using JSON credentials from environment variable");
        credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
        diagnosticInfo.credentialValidation.jsonValid = true;
        
        // Validate credential object structure
        const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
        const missingFields = requiredFields.filter(field => !credentials[field]);
        
        if (missingFields.length > 0) {
          diagnosticInfo.credentialValidation.issues.push(
            `Missing required fields in credentials: ${missingFields.join(', ')}`
          );
        } else {
          diagnosticInfo.credentialValidation.hasRequiredFields = true;
        }
        
        // Check if project IDs match
        if (projectId && credentials.project_id && projectId !== credentials.project_id) {
          diagnosticInfo.credentialValidation.issues.push(
            `Project ID mismatch: Environment (${projectId}) vs Credentials (${credentials.project_id})`
          );
        } else if (credentials.project_id) {
          diagnosticInfo.credentialValidation.projectIdMatch = true;
        }
        
        // Check if private key looks valid
        if (credentials.private_key) {
          if (!credentials.private_key.includes('-----BEGIN PRIVATE KEY-----') || 
              !credentials.private_key.includes('-----END PRIVATE KEY-----')) {
            diagnosticInfo.credentialValidation.issues.push(
              'Private key appears malformed (missing BEGIN/END markers)'
            );
          }
          
          // Check for typical JSON string escape issues
          if (credentials.private_key.includes('\\n') && !credentials.private_key.includes('\n')) {
            diagnosticInfo.credentialValidation.issues.push(
              'Private key contains escaped newlines (\\n) but no actual newlines. This may cause authentication issues.'
            );
          }
        }
        
        // Add credential metadata to diagnostics
        diagnosticInfo.credentialInfo = {
          type: credentials.type,
          project_id: credentials.project_id,
          client_email: credentials.client_email,
          private_key_id: credentials.private_key_id,
          // Don't include the actual private key in the diagnostics
          private_key_preview: credentials.private_key ? 'Present (first 10 chars): ' + 
            credentials.private_key.substring(0, 10) + '...' : 'Missing',
          token_uri: credentials.token_uri,
          universe_domain: credentials.universe_domain
        };
        
        // IMPORTANT: For Netlify, do NOT set process.env.GOOGLE_APPLICATION_CREDENTIALS
        // Instead, use the credentials object directly with the VertexAI constructor
        
        // IMPORTANT: Use the complete credentials object with all fields
        // Don't create a subset - use the exact object from the JSON
        vertexOptions.credentials = credentials;
        
        authMethod = 'json_env_direct';
        console.log(`[AUTH-TEST] Parsed credentials for project: ${credentials.project_id}`);
      } catch (error) {
        console.error("[AUTH-TEST] Failed to parse credentials:", error.message);
        diagnosticInfo.credentialValidation.issues.push(
          `Failed to parse JSON: ${error.message}`
        );
        
        // If it's a JSON parse error, try to show some of the string to debug
        if (error instanceof SyntaxError) {
          const credJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
          if (credJson) {
            const start = credJson.substring(0, 40);
            const end = credJson.substring(credJson.length - 40);
            diagnosticInfo.credentialPreview = {
              start: start + '...',
              end: '...' + end,
              possibleIssues: [
                'JSON may have unescaped quotes or newlines',
                'JSON may have been double-escaped during environment variable setting',
                'JSON may be improperly formatted'
              ]
            };
            
            // Try to fix common JSON issues
            try {
              let fixedJson = credJson;
              // Fix for double-escaped quotes
              if (credJson.includes('\\"')) {
                fixedJson = credJson.replace(/\\"/g, '"');
                diagnosticInfo.fixAttempt = "Removed double-escaped quotes";
              }
              // Fix for double-escaped newlines
              if (credJson.includes('\\\\n')) {
                fixedJson = fixedJson.replace(/\\\\n/g, '\\n');
                diagnosticInfo.fixAttempt = (diagnosticInfo.fixAttempt || "") + ", Fixed double-escaped newlines";
              }
              
              // Try parsing the fixed JSON
              const fixedCredentials = JSON.parse(fixedJson);
              diagnosticInfo.fixSuccess = true;
              // Don't use the fixed credentials in this test, but notify the user
              diagnosticInfo.fixMessage = "A fixed version of the JSON was successfully parsed. " +
                "Consider updating your environment variable with properly escaped JSON.";
            } catch (fixError) {
              diagnosticInfo.fixSuccess = false;
              diagnosticInfo.fixError = fixError.message;
            }
          }
        }
        // We'll continue and try other auth methods
      }
    } else {
      diagnosticInfo.credentialValidation.issues.push(
        'GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable not set'
      );
    }
    
    // If we still don't have credentials, try file path
    const credentialsPath = process.env.VERTEX_SERVICE_ACCOUNT_KEY;
    if (!credentials && credentialsPath) {
      try {
        console.log(`[AUTH-TEST] Using key file path: ${credentialsPath}`);
        
        // Check if file exists
        if (fs.existsSync(credentialsPath)) {
          diagnosticInfo.keyFileExists = true;
          
          // Try to read file content to validate JSON
          try {
            const fileContent = fs.readFileSync(credentialsPath, 'utf8');
            const fileCredentials = JSON.parse(fileContent);
            diagnosticInfo.keyFileValid = true;
            diagnosticInfo.keyFileProjectId = fileCredentials.project_id;
          } catch (fileError) {
            diagnosticInfo.keyFileValid = false;
            diagnosticInfo.keyFileError = fileError.message;
          }
        } else {
          diagnosticInfo.keyFileExists = false;
          diagnosticInfo.credentialValidation.issues.push(
            `Service account key file not found at: ${credentialsPath}`
          );
        }
        
        vertexOptions.googleAuthOptions = { keyFilename: credentialsPath };
        authMethod = 'key_file';
      } catch (error) {
        console.error("[AUTH-TEST] Failed to use key file:", error.message);
        diagnosticInfo.credentialValidation.issues.push(
          `Error with key file: ${error.message}`
        );
      }
    } else if (!credentials) {
      diagnosticInfo.credentialValidation.issues.push(
        'No authentication methods available. Set either GOOGLE_APPLICATION_CREDENTIALS_JSON or VERTEX_SERVICE_ACCOUNT_KEY.'
      );
    }
    
    // Initialize Vertex AI client
    console.log("[AUTH-TEST] Initializing Vertex AI client");
    const vertexAI = new VertexAI(vertexOptions);
    
    // Test getting the model
    console.log("[AUTH-TEST] Getting generative model");
    const generativeModel = vertexAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });
    
    // Test with a simple prompt
    console.log("[AUTH-TEST] Testing model with simple prompt");
    const response = await generativeModel.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: "Hello, what's your name?" }],
        },
      ],
    });
    
    // If we get here, authentication was successful
    authSuccess = true;
    const modelResponse = response.response.candidates[0].content.parts[0].text;
    
    return new Response(JSON.stringify({
      success: true,
      authMethod,
      modelResponse: modelResponse.substring(0, 100) + (modelResponse.length > 100 ? '...' : ''),
      projectId, 
      location,
      modelName,
      diagnosticInfo
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    // Analyze the error to provide more helpful information
    let errorAnalysis = {
      type: 'unknown',
      possibleCauses: [],
      suggestedFixes: []
    };
    
    // Check for common error patterns
    if (error.name === 'GoogleAuthError' || error.message.includes('authentication') || error.message.includes('authenticate')) {
      errorAnalysis.type = 'authentication';
      errorAnalysis.possibleCauses = [
        'Invalid service account credentials',
        'Malformed JSON in the credentials',
        'Missing required fields in credentials',
        'Private key issues (newlines, escaping)',
        'Service account does not have required permissions'
      ];
      errorAnalysis.suggestedFixes = [
        'Verify the credential JSON format is correct',
        'Ensure all required fields are present in the credentials JSON',
        'Check that the private key has proper newline characters',
        'Verify service account has roles/aiplatform.user role',
        'Try recreating the service account key'
      ];
    } else if (error.message.includes('permission') || error.message.includes('Permission denied')) {
      errorAnalysis.type = 'permission';
      errorAnalysis.possibleCauses = [
        'Service account lacks necessary permissions',
        'API not enabled in the project'
      ];
      errorAnalysis.suggestedFixes = [
        'Grant roles/aiplatform.user to your service account',
        'Enable the Vertex AI API in Google Cloud Console'
      ];
    } else if (error.message.includes('API not enabled') || error.message.includes('has not been used')) {
      errorAnalysis.type = 'api_not_enabled';
      errorAnalysis.possibleCauses = [
        'Vertex AI API not enabled in the project',
        'First-time use requires enabling the API'
      ];
      errorAnalysis.suggestedFixes = [
        'Enable the Vertex AI API in Google Cloud Console',
        'Run: gcloud services enable aiplatform.googleapis.com --project=YOUR_PROJECT_ID'
      ];
    } else if (error.message.includes('billing')) {
      errorAnalysis.type = 'billing';
      errorAnalysis.possibleCauses = [
        'Billing not enabled for the project',
        'Billing account may have issues'
      ];
      errorAnalysis.suggestedFixes = [
        'Enable billing for the project in Google Cloud Console',
        'Verify billing account status'
      ];
    } else if (error.message.includes('private_key')) {
      errorAnalysis.type = 'private_key';
      errorAnalysis.possibleCauses = [
        'Private key is malformed',
        'Newlines in the private key are not properly handled',
        'Private key may be corrupted'
      ];
      errorAnalysis.suggestedFixes = [
        'Ensure private key has proper newlines (\\n converted to actual newlines)',
        'Regenerate service account key and try again',
        'For Netlify, make sure the JSON is properly escaped when setting environment variables'
      ];
    }
    
    // Special handling for JSON parsing errors
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      errorAnalysis.type = 'json_parse';
      errorAnalysis.possibleCauses = [
        'Malformed JSON in credentials',
        'Environment variable has incorrect format',
        'JSON string may be truncated'
      ];
      errorAnalysis.suggestedFixes = [
        'Verify JSON is properly formatted',
        'Check for proper escaping of special characters',
        'Re-create the service account key and try again'
      ];
    }
    
    // For Netlify-specific issues
    const isNetlify = !!process.env.NETLIFY;
    if (isNetlify) {
      errorAnalysis.netlifySpecific = {
        notes: [
          'Netlify requires environment variables to be properly escaped',
          'Private keys should maintain newlines (\\n should become actual newlines)',
          'Netlify has a size limit for environment variables (~32KB)'
        ],
        suggestedFixes: [
          'Use Netlify CLI to set environment variables to preserve formatting',
          'Try using netlify env:set GOOGLE_APPLICATION_CREDENTIALS_JSON "$(cat service-account-key.json)"',
          'Verify the variable is properly set in Netlify Dashboard'
        ]
      };
    }
    
    // Return detailed error information
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      errorName: error.name,
      stack: error.stack,
      cause: error.cause?.message,
      errorAnalysis
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}