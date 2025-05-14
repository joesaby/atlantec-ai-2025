/**
 * API endpoint to verify Vertex AI auth functionality
 * This combines the vertex-auth-test and vertex-ai-connection functionality
 */

import { checkLLMHealth, generateText } from "../../../utils/vertex-client.js";

export async function GET(request) {
  try {
    // Get URL parameters
    const url = new URL(request.url);
    const advanced = url.searchParams.get('advanced') === 'true';
    
    // Test health check
    const healthStatus = await checkLLMHealth();
    
    let result = { 
      status: healthStatus
    };
    
    if (healthStatus.healthy) {
      // Try a simple generation if healthy
      if (advanced) {
        result.details = {
          projectId: process.env.VERTEX_PROJECT_ID || 'Not set',
          location: process.env.VERTEX_LOCATION || 'Not set',
          model: process.env.VERTEX_MODEL || 'Not set',
          environment: process.env.NODE_ENV || 'development',
          advanced: true,
          success: true
        };
      } else {
        // Generate sample text
        const sampleText = await generateText(
          "What are three vegetables that grow well in Ireland?",
          {
            maxTokens: 200,
            temperature: 0.5,
          }
        );
        
        result.generationTest = {
          success: !!sampleText,
          result: sampleText ? sampleText.substring(0, 300) + (sampleText.length > 300 ? "..." : "") : null
        };
      }
    }
    
    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message, 
      stack: error.stack,
      success: false
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
}