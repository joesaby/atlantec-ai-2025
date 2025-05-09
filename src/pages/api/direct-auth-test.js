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
    // Check for running environment
    const isNetlify = !!process.env.NETLIFY;
    const environment = isNetlify ? 'netlify' : 'development';
    
    // Collect diagnostic info
    const diagnosticInfo = {
      environment,
      hasEnvCredentialsJson: !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
      envCredentialsJsonLength: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON?.length || 0,
      hasKeyFilePath: !!process.env.VERTEX_SERVICE_ACCOUNT_KEY || !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
      keyFilePath: process.env.VERTEX_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS || 'not set',
      credentialValidation: {
        jsonValid: false,
        hasRequiredFields: false,
        issues: []
      }
    };
    
    // Log environment variables for debugging
    console.log(`[DIRECT-AUTH-TEST] Testing direct Google authentication
  - Environment: ${environment}
  - Has GOOGLE_APPLICATION_CREDENTIALS_JSON: ${!!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON}
  - JSON length: ${process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON?.length || 0}
  - Has VERTEX_SERVICE_ACCOUNT_KEY: ${!!process.env.VERTEX_SERVICE_ACCOUNT_KEY}
  - Has GOOGLE_APPLICATION_CREDENTIALS: ${!!process.env.GOOGLE_APPLICATION_CREDENTIALS}
`);
    
    let credentials;
    let authClient;
    let tokenInfo;
    let authMethod = 'none';
    
    // First try credentials from environment variable
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      try {
        // Parse credentials from environment variable
        credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
        console.log(`[DIRECT-AUTH-TEST] Parsed credentials for project: ${credentials.project_id}`);
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
          private_key_preview: credentials.private_key ? `Present (starts with: ${credentials.private_key.substring(0, 20)}...)` : 'Missing',
          token_uri: credentials.token_uri,
          universe_domain: credentials.universe_domain
        };
        
        // Create auth client directly with the credentials object
        authClient = new GoogleAuth({
          credentials,
          scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });
        
        authMethod = 'json_env_direct';
        
        // Get access token
        console.log(`[DIRECT-AUTH-TEST] Getting access token...`);
        const client = await authClient.getClient();
        const token = await client.getAccessToken();
        
        tokenInfo = {
          token_type: token.token_type,
          expiry_date: token.expiry_date,
          token_preview: token.token ? `${token.token.substring(0, 10)}...` : 'No token',
          expires_in_seconds: token.expiry_date ? Math.floor((token.expiry_date - Date.now()) / 1000) : 'unknown'
        };
        
        console.log(`[DIRECT-AUTH-TEST] Successfully authenticated!`);
      } catch (error) {
        console.error(`[DIRECT-AUTH-TEST] Authentication error using JSON: ${error.message}`);
        diagnosticInfo.jsonAuthError = error.message;
        diagnosticInfo.jsonAuthErrorStack = error.stack;
        
        // Try to show JSON preview if it's a parsing error
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
      }
    }
    
    // Try file authentication if JSON auth failed or wasn't available
    if (!tokenInfo && (process.env.VERTEX_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
      try {
        const keyPath = process.env.VERTEX_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS;
        console.log(`[DIRECT-AUTH-TEST] Trying authentication with key file: ${keyPath}`);
        
        // Create auth client using file path
        authClient = new GoogleAuth({
          keyFile: keyPath,
          scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });
        
        authMethod = 'key_file';
        
        // Get access token
        console.log(`[DIRECT-AUTH-TEST] Getting access token with key file...`);
        const client = await authClient.getClient();
        const token = await client.getAccessToken();
        
        tokenInfo = {
          token_type: token.token_type,
          expiry_date: token.expiry_date,
          token_preview: token.token ? `${token.token.substring(0, 10)}...` : 'No token',
          expires_in_seconds: token.expiry_date ? Math.floor((token.expiry_date - Date.now()) / 1000) : 'unknown'
        };
        
        console.log(`[DIRECT-AUTH-TEST] Successfully authenticated with key file!`);
        diagnosticInfo.fileAuthSuccess = true;
      } catch (error) {
        console.error(`[DIRECT-AUTH-TEST] Authentication error using file: ${error.message}`);
        diagnosticInfo.fileAuthError = error.message;
        diagnosticInfo.fileAuthErrorStack = error.stack;
      }
    }
    
    // If we still don't have a token, try application default credentials as a last resort
    if (!tokenInfo) {
      try {
        console.log(`[DIRECT-AUTH-TEST] Trying with application default credentials...`);
        
        // Create auth client using application default credentials
        authClient = new GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });
        
        authMethod = 'application_default';
        
        // Get access token
        console.log(`[DIRECT-AUTH-TEST] Getting access token with application default...`);
        const client = await authClient.getClient();
        const token = await client.getAccessToken();
        
        tokenInfo = {
          token_type: token.token_type,
          expiry_date: token.expiry_date,
          token_preview: token.token ? `${token.token.substring(0, 10)}...` : 'No token',
          expires_in_seconds: token.expiry_date ? Math.floor((token.expiry_date - Date.now()) / 1000) : 'unknown'
        };
        
        console.log(`[DIRECT-AUTH-TEST] Successfully authenticated with application default!`);
        diagnosticInfo.defaultAuthSuccess = true;
      } catch (error) {
        console.error(`[DIRECT-AUTH-TEST] Authentication error using application default: ${error.message}`);
        diagnosticInfo.defaultAuthError = error.message;
      }
    }
    
    // If tokenInfo exists, we successfully authenticated with one method
    if (tokenInfo) {
      return new Response(JSON.stringify({
        success: true,
        method: authMethod,
        project_id: credentials?.project_id,
        client_email: credentials?.client_email,
        token_info: tokenInfo,
        diagnosticInfo
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else {
      // All authentication methods failed
      throw new Error("All authentication methods failed");
    }
  } catch (error) {
    // Analyze the error to provide more helpful information
    let errorAnalysis = {
      type: 'unknown',
      possibleCauses: [],
      suggestedFixes: []
    };
    
    // Check for common error patterns
    if (error.message.includes('invalid_grant') || error.message.includes('invalid grant')) {
      errorAnalysis.type = 'invalid_grant';
      errorAnalysis.possibleCauses = [
        'Service account may be deleted or disabled',
        'Credentials have expired',
        'Project may be disabled'
      ];
      errorAnalysis.suggestedFixes = [
        'Check service account status in Google Cloud Console',
        'Recreate the service account and download new key',
        'Verify project is active'
      ];
    } else if (error.message.includes('No such file')) {
      errorAnalysis.type = 'file_not_found';
      errorAnalysis.possibleCauses = [
        'The key file path is incorrect',
        'The file has been deleted or moved',
        'File permissions issue'
      ];
      errorAnalysis.suggestedFixes = [
        'Verify file path is correct',
        'Regenerate service account key if needed',
        'Check file permissions'
      ];
    } else if (error.message.includes('parse') || error.message.includes('SyntaxError')) {
      errorAnalysis.type = 'json_parse';
      errorAnalysis.possibleCauses = [
        'JSON credential string is malformed',
        'Special characters not properly escaped',
        'Environment variable corruption'
      ];
      errorAnalysis.suggestedFixes = [
        'Verify JSON format is correct',
        'Re-download service account key and try again',
        'Use a JSON validator to check format'
      ];
    } else if (error.message.includes('private_key')) {
      errorAnalysis.type = 'private_key_issue';
      errorAnalysis.possibleCauses = [
        'Private key format is incorrect',
        'Newlines not properly preserved',
        'Private key may be corrupted'
      ];
      errorAnalysis.suggestedFixes = [
        'Ensure newlines are preserved in private key',
        'Regenerate service account key',
        'For Netlify, ensure proper escaping in environment variables'
      ];
    }
    
    // For Netlify-specific issues
    const isNetlify = !!process.env.NETLIFY;
    if (isNetlify) {
      errorAnalysis.netlifyNotes = [
        'Environment variables in Netlify must be properly formatted',
        'For JSON credentials, all special characters must be correctly escaped',
        'For private keys, newlines (\\n) must be preserved',
        'Netlify has a ~32KB size limit for environment variables',
        'Consider using Netlify CLI to set environment variables to preserve formatting'
      ];
    }
    
    // Return detailed error information
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      errorName: error.name,
      stack: error.stack,
      errorAnalysis,
      allDiagnostics: {
        environment: isNetlify ? 'netlify' : 'development',
        hasEnvCredentialsJson: !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
        envCredentialsJsonLength: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON?.length || 0,
        hasKeyFilePath: !!process.env.VERTEX_SERVICE_ACCOUNT_KEY || !!process.env.GOOGLE_APPLICATION_CREDENTIALS
      }
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}